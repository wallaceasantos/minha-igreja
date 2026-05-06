-- ============================================
-- Script Rápido: Colunas de Billing
-- ============================================
-- Executar este script para adicionar as colunas necessárias
-- para o sistema de inadimplência

USE jesus_vitoria_connect;

-- ============================================
-- 1. Adicionar colunas na tabela churches
-- ============================================

-- billing_status
ALTER TABLE `churches` 
ADD COLUMN `billing_status` enum('current','warning','partial_suspended','total_suspended','cancellation_pending','cancelled') DEFAULT 'current' AFTER `is_active`;

-- last_billing_date
ALTER TABLE `churches`
ADD COLUMN `last_billing_date` date AFTER `billing_status`;

-- next_billing_date
ALTER TABLE `churches`
ADD COLUMN `next_billing_date` date AFTER `last_billing_date`;

-- days_overdue
ALTER TABLE `churches`
ADD COLUMN `days_overdue` int DEFAULT 0 AFTER `next_billing_date`;

-- partial_suspension_date
ALTER TABLE `churches`
ADD COLUMN `partial_suspension_date` timestamp NULL AFTER `days_overdue`;

-- total_suspension_date
ALTER TABLE `churches`
ADD COLUMN `total_suspension_date` timestamp NULL AFTER `partial_suspension_date`;

-- cancellation_notice_date
ALTER TABLE `churches`
ADD COLUMN `cancellation_notice_date` timestamp NULL AFTER `total_suspension_date`;

-- ============================================
-- 2. Adicionar colunas na tabela subscriptions
-- ============================================

-- monthly_amount
ALTER TABLE `subscriptions`
ADD COLUMN `monthly_amount` decimal(10,2) DEFAULT 0.00 AFTER `amount_cents`;

-- billing_day
ALTER TABLE `subscriptions`
ADD COLUMN `billing_day` int DEFAULT 1 AFTER `monthly_amount`;

-- last_charge_attempt
ALTER TABLE `subscriptions`
ADD COLUMN `last_charge_attempt` timestamp NULL AFTER `payment_status`;

-- charge_failure_reason
ALTER TABLE `subscriptions`
ADD COLUMN `charge_failure_reason` text AFTER `last_charge_attempt`;

-- ============================================
-- 3. Criar índices
-- ============================================
CREATE INDEX `idx_churches_billing_status` ON `churches` (`billing_status`);
CREATE INDEX `idx_churches_days_overdue` ON `churches` (`days_overdue`);

-- ============================================
-- 4. Atualizar days_overdue baseado nas subscriptions
-- ============================================
UPDATE churches c
JOIN subscriptions s ON c.id = s.church_id
SET 
  c.days_overdue = GREATEST(0, DATEDIFF(NOW(), s.current_period_end)),
  c.billing_status = CASE
    WHEN s.payment_status = 'paid' THEN 'current'
    WHEN DATEDIFF(NOW(), s.current_period_end) >= 90 THEN 'cancelled'
    WHEN DATEDIFF(NOW(), s.current_period_end) >= 60 THEN 'cancellation_pending'
    WHEN DATEDIFF(NOW(), s.current_period_end) >= 31 THEN 'total_suspended'
    WHEN DATEDIFF(NOW(), s.current_period_end) >= 21 THEN 'partial_suspended'
    WHEN DATEDIFF(NOW(), s.current_period_end) >= 7 THEN 'warning'
    ELSE 'current'
  END
WHERE c.id IN (SELECT id FROM churches);

-- ============================================
-- 5. Criar/Atualizar view
-- ============================================
DROP VIEW IF EXISTS `v_churches_delinquent`;

CREATE VIEW `v_churches_delinquent` AS
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
  s.amount_cents / 100 as monthly_amount,
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
-- Mensagem final
-- ============================================
SELECT '✅ Colunas de billing adicionadas com sucesso!' AS Status;
SELECT '📊 Execute: SELECT id, name, billing_status, days_overdue FROM churches;' AS Info;
