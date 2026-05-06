-- Migration 004: Sistema de Inadimplência e Cobrança Automatizada
-- Data: 10/04/2026
-- Descrição: Implementa política "Firme mas Justa" para cobrança de igrejas inadimplentes
-- Política:
--   Dia 0  → Email de vencimento
--   Dia 3  → WhatsApp amigável
--   Dia 7  → Ligação humana
--   Dia 14 → Email "Atenção" + notificação dashboard
--   Dia 21 → Suspensão PARCIAL (funcionalidades)
--   Dia 30 → Ligação formal + email
--   Dia 31 → Suspensão TOTAL (acesso bloqueado)
--   Dia 45 → Email "Última chance"
--   Dia 60 → Notificação cancelamento (30 dias)
--   Dia 90 → Cancelamento + backup

-- ============================================
-- 1. Tabela de Histórico de Cobranças
-- ============================================
CREATE TABLE IF NOT EXISTS `church_billing_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `church_id` int NOT NULL,
  `subscription_id` int,
  `action_type` enum('email_sent','whatsapp_sent','call_made','partial_suspension','total_suspension','cancellation_notice','cancelled','reactivated','payment_received') NOT NULL,
  `status` enum('pending','completed','failed') DEFAULT 'pending',
  `due_date` date,
  `paid_date` date,
  `amount_due` decimal(10,2) DEFAULT 0.00,
  `days_overdue` int DEFAULT 0,
  `notes` text,
  `notification_sent` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int,
  PRIMARY KEY (`id`),
  KEY `idx_billing_church` (`church_id`),
  KEY `idx_billing_status` (`status`),
  KEY `idx_billing_due_date` (`due_date`),
  KEY `idx_billing_days_overdue` (`days_overdue`),
  CONSTRAINT `fk_billing_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_billing_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. Tabela de Logs de Comunicação
-- ============================================
CREATE TABLE IF NOT EXISTS `church_communication_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `church_id` int NOT NULL,
  `communication_type` enum('email','whatsapp','phone_call','dashboard_notification','letter') NOT NULL,
  `subject` varchar(255),
  `message` text,
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `received_at` timestamp NULL,
  `opened_at` timestamp NULL,
  `status` enum('sent','delivered','opened','clicked','replied','failed') DEFAULT 'sent',
  `error_message` text,
  `metadata` json,
  PRIMARY KEY (`id`),
  KEY `idx_comm_church` (`church_id`),
  KEY `idx_comm_type` (`communication_type`),
  KEY `idx_comm_status` (`status`),
  CONSTRAINT `fk_comm_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. Tabela de Configurações de Cobrança
-- ============================================
CREATE TABLE IF NOT EXISTS `billing_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL UNIQUE,
  `setting_value` text,
  `description` varchar(255),
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir configurações padrão
INSERT INTO `billing_settings` (`setting_key`, `setting_value`, `description`) VALUES
('partial_suspension_days', '21', 'Dias de atraso para suspensão parcial'),
('total_suspension_days', '31', 'Dias de atraso para suspensão total'),
('cancellation_notice_days', '60', 'Dias de atraso para notificação de cancelamento'),
('cancellation_days', '90', 'Dias de atraso para cancelamento'),
('email_reminder_days', '[0,3,7,14,21,30,45,60]', 'Dias para envio de email automático'),
('whatsapp_reminder_days', '[3,21,45]', 'Dias para envio de WhatsApp automático'),
('call_reminder_days', '[7,30]', 'Dias para ligação manual (lembrete no dashboard)'),
('enable_auto_suspension', 'true', 'Habilitar suspensão automática'),
('enable_auto_cancellation', 'true', 'Habilitar cancelamento automático'),
('grace_period_days', '0', 'Dias de carência após vencimento');

-- ============================================
-- 4. Adicionar colunas na tabela churches
-- ============================================
-- Status de inadimplência
ALTER TABLE `churches` 
ADD COLUMN `billing_status` enum('current','warning','partial_suspended','total_suspended','cancellation_pending','cancelled') DEFAULT 'current' AFTER `is_active`;

-- Data da última cobrança
ALTER TABLE `churches`
ADD COLUMN `last_billing_date` date AFTER `billing_status`;

-- Data da próxima cobrança
ALTER TABLE `churches`
ADD COLUMN `next_billing_date` date AFTER `last_billing_date`;

-- Dias de atraso (calculado)
ALTER TABLE `churches`
ADD COLUMN `days_overdue` int DEFAULT 0 AFTER `next_billing_date`;

-- Data da suspensão parcial
ALTER TABLE `churches`
ADD COLUMN `partial_suspension_date` timestamp NULL AFTER `days_overdue`;

-- Data da suspensão total
ALTER TABLE `churches`
ADD COLUMN `total_suspension_date` timestamp NULL AFTER `partial_suspension_date`;

-- Data de notificação de cancelamento
ALTER TABLE `churches`
ADD COLUMN `cancellation_notice_date` timestamp NULL AFTER `total_suspension_date`;

-- Índice para consultas de inadimplência
CREATE INDEX `idx_churches_billing_status` ON `churches` (`billing_status`);
CREATE INDEX `idx_churches_days_overdue` ON `churches` (`days_overdue`);

-- ============================================
-- 5. Adicionar colunas na tabela subscriptions
-- ============================================
-- Valor da mensalidade
ALTER TABLE `subscriptions`
ADD COLUMN `monthly_amount` decimal(10,2) DEFAULT 0.00 AFTER `amount_cents`;

-- Dia de vencimento (dia do mês)
ALTER TABLE `subscriptions`
ADD COLUMN `billing_day` int DEFAULT 1 AFTER `monthly_amount`;

-- Última tentativa de cobrança
ALTER TABLE `subscriptions`
ADD COLUMN `last_charge_attempt` timestamp NULL AFTER `payment_status`;

-- Motivo da falha de cobrança
ALTER TABLE `subscriptions`
ADD COLUMN `charge_failure_reason` text AFTER `last_charge_attempt`;

-- ============================================
-- 6. View para Dashboard de Inadimplência
-- ============================================
CREATE OR REPLACE VIEW `v_churches_delinquent` AS
SELECT 
  c.id,
  c.name,
  c.email,
  c.phone,
  c.slug,
  c.billing_status,
  c.days_overdue,
  c.partial_suspension_date,
  c.total_suspension_date,
  c.cancellation_notice_date,
  s.plan_type,
  s.monthly_amount,
  s.billing_day,
  s.status as subscription_status,
  s.payment_status,
  DATEDIFF(NOW(), s.current_period_end) as days_since_period_end,
  CASE 
    WHEN c.days_overdue >= 90 THEN 'CANCELAR'
    WHEN c.days_overdue >= 60 THEN 'CANCELAMENTO_PENDING'
    WHEN c.days_overdue >= 31 THEN 'SUSPENSAO_TOTAL'
    WHEN c.days_overdue >= 21 THEN 'SUSPENSAO_PARCIAL'
    WHEN c.days_overdue >= 14 THEN 'ATENCAO'
    WHEN c.days_overdue >= 7 THEN 'COBRAR'
    WHEN c.days_overdue >= 1 THEN 'LEMBRAR'
    ELSE 'EM_DIA'
  END as action_required,
  CASE 
    WHEN c.days_overdue >= 90 THEN '🔴'
    WHEN c.days_overdue >= 60 THEN '🟠'
    WHEN c.days_overdue >= 31 THEN '🔴'
    WHEN c.days_overdue >= 21 THEN '🟡'
    WHEN c.days_overdue >= 14 THEN '🟠'
    WHEN c.days_overdue >= 7 THEN '🟡'
    ELSE '🟢'
  END as risk_level
FROM churches c
LEFT JOIN subscriptions s ON c.id = s.church_id
WHERE c.is_active = 1 
  AND (s.payment_status != 'paid' OR s.payment_status IS NULL)
ORDER BY c.days_overdue DESC;

-- ============================================
-- 7. Dados Iniciais de Exemplo
-- ============================================
-- Atualizar igrejas com billing_status baseado no status atual
-- Nota: Usando id IN (subquery) para evitar safe update mode
UPDATE churches c
JOIN subscriptions s ON c.id = s.church_id
SET 
  c.billing_status = CASE
    WHEN s.payment_status = 'paid' THEN 'current'
    WHEN DATEDIFF(NOW(), s.current_period_end) >= 31 THEN 'total_suspended'
    WHEN DATEDIFF(NOW(), s.current_period_end) >= 21 THEN 'partial_suspended'
    WHEN DATEDIFF(NOW(), s.current_period_end) >= 7 THEN 'warning'
    ELSE 'current'
  END,
  c.days_overdue = GREATEST(0, DATEDIFF(NOW(), s.current_period_end))
WHERE c.id IN (SELECT id FROM churches WHERE billing_status = 'current' OR billing_status IS NULL);

-- ============================================
-- Mensagem Final
-- ============================================
SELECT '✅ Migration 004 - Sistema de Inadimplência aplicado com sucesso!' AS Status;
SELECT '📊 Tabelas criadas: church_billing_history, church_communication_log, billing_settings' AS Info;
SELECT '📊 Colunas adicionadas: churches.billing_status, churches.days_overdue, etc.' AS Info;
SELECT '📊 View criada: v_churches_delinquent' AS Info;
SELECT COUNT(*) as 'Total de configurações' FROM billing_settings;
