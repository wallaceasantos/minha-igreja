-- ============================================
-- Migration 005: Sistema de Trial de 30 Dias
-- ============================================
-- Data: 18/04/2026
-- Descrição: Implementa sistema de migração Free → Essencial com 30 dias grátis
-- Nota: Adaptado para estrutura existente da tabela subscriptions

USE jesus_vitoria_connect;

-- ============================================
-- 1. Adicionar colunas faltantes na tabela subscriptions
-- ============================================

-- trial_start_date
ALTER TABLE `subscriptions` 
ADD COLUMN `trial_start_date` DATE NULL AFTER `trial_end_date`;

-- is_trial
ALTER TABLE `subscriptions` 
ADD COLUMN `is_trial` TINYINT(1) DEFAULT 0 AFTER `trial_start_date`;

-- upgrade_requested_at
ALTER TABLE `subscriptions` 
ADD COLUMN `upgrade_requested_at` TIMESTAMP NULL AFTER `is_trial`;

-- ============================================
-- 2. Criar tabela subscription_trials
-- ============================================

CREATE TABLE IF NOT EXISTS `subscription_trials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subscription_id` int NOT NULL,
  `church_id` int NOT NULL,
  `trial_start_date` date NOT NULL,
  `trial_end_date` date NOT NULL,
  `status` enum('active','completed','converted','expired') DEFAULT 'active',
  `converted_to_paid` tinyint(1) DEFAULT 0,
  `payment_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_trial_subscription` (`subscription_id`),
  KEY `idx_trial_church` (`church_id`),
  KEY `idx_trial_end_date` (`trial_end_date`),
  CONSTRAINT `fk_trial_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_trial_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. Criar tabela subscription_notifications
-- ============================================

CREATE TABLE IF NOT EXISTS `subscription_notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subscription_id` int NOT NULL,
  `church_id` int NOT NULL,
  `notification_type` enum('trial_started','trial_5_days','trial_2_days','trial_1_day','trial_ended') NOT NULL,
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `opened_at` timestamp NULL DEFAULT NULL,
  `status` enum('sent','opened','failed') DEFAULT 'sent',
  PRIMARY KEY (`id`),
  KEY `idx_notification_subscription` (`subscription_id`),
  CONSTRAINT `fk_notification_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. Atualizar subscriptions existentes (se necessário)
-- ============================================

-- Marcar subscriptions com status 'trial' como trial ativo
UPDATE subscriptions 
SET is_trial = 1,
    trial_start_date = created_at
WHERE status = 'trial' 
  AND trial_start_date IS NULL;

-- ============================================
-- 5. Criar view para trials ativos
-- ============================================

DROP VIEW IF EXISTS `v_active_trials`;

CREATE VIEW `v_active_trials` AS
SELECT 
  s.id as subscription_id,
  c.id as church_id,
  c.name as church_name,
  c.email as church_email,
  s.plan_type,
  s.status,
  s.trial_start_date,
  s.trial_end_date,
  DATEDIFF(s.trial_end_date, CURDATE()) as days_remaining,
  CASE 
    WHEN DATEDIFF(s.trial_end_date, CURDATE()) > 5 THEN 'ok'
    WHEN DATEDIFF(s.trial_end_date, CURDATE()) > 2 THEN 'warning'
    WHEN DATEDIFF(s.trial_end_date, CURDATE()) > 0 THEN 'urgent'
    ELSE 'expired'
  END as urgency_level
FROM subscriptions s
JOIN churches c ON s.church_id = c.id
WHERE s.is_trial = 1 
  AND s.status = 'trial';

-- ============================================
-- Mensagem Final
-- ============================================

SELECT '✅ Migration 005 - Sistema de Trial aplicada com sucesso!' AS Status;
SELECT '📊 Tabelas criadas: subscription_trials, subscription_notifications' AS Info;
SELECT '📊 View criada: v_active_trials' AS Info;
SELECT '📊 Colunas adicionadas: subscriptions.trial_start_date, subscriptions.is_trial, subscriptions.upgrade_requested_at' AS Info;

-- Verificar trials ativos
SELECT COUNT(*) as 'Triais Ativos' FROM subscriptions WHERE is_trial = 1 AND status = 'trial';

-- Verificar estrutura final
DESCRIBE subscriptions;
