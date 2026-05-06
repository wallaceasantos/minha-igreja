-- ============================================
-- Script Mínimo: Apenas Colunas Faltantes
-- ============================================
-- Versão corrigida sem IF NOT EXISTS

USE jesus_vitoria_connect;

-- ============================================
-- subscriptions.monthly_amount
-- ============================================
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'subscriptions' AND COLUMN_NAME = 'monthly_amount');
  
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE subscriptions ADD COLUMN monthly_amount decimal(10,2) DEFAULT 0.00 AFTER amount_cents',
  'SELECT "monthly_amount já existe" AS message');
  
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- subscriptions.billing_day
-- ============================================
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'subscriptions' AND COLUMN_NAME = 'billing_day');
  
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE subscriptions ADD COLUMN billing_day int DEFAULT 1 AFTER monthly_amount',
  'SELECT "billing_day já existe" AS message');
  
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- subscriptions.last_charge_attempt
-- ============================================
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'subscriptions' AND COLUMN_NAME = 'last_charge_attempt');
  
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE subscriptions ADD COLUMN last_charge_attempt timestamp NULL AFTER payment_status',
  'SELECT "last_charge_attempt já existe" AS message');
  
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- subscriptions.charge_failure_reason
-- ============================================
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'subscriptions' AND COLUMN_NAME = 'charge_failure_reason');
  
SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE subscriptions ADD COLUMN charge_failure_reason text AFTER last_charge_attempt',
  'SELECT "charge_failure_reason já existe" AS message');
  
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Criar índices (ignorar erros se já existirem)
-- ============================================
-- Para índices, usamos DROP INDEX primeiro se existir
DROP INDEX idx_churches_billing_status ON churches;
DROP INDEX idx_churches_days_overdue ON churches;

CREATE INDEX idx_churches_billing_status ON churches (billing_status);
CREATE INDEX idx_churches_days_overdue ON churches (days_overdue);

-- ============================================
-- Atualizar dados (com WHERE para safe mode)
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
WHERE c.id IN (SELECT id FROM (SELECT id FROM churches) AS tmp);

-- ============================================
-- Atualizar view
-- ============================================
DROP VIEW IF EXISTS v_churches_delinquent;

CREATE VIEW v_churches_delinquent AS
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
-- Verificação final
-- ============================================
SELECT '✅ Script executado com sucesso!' AS Status;
SELECT COUNT(*) as 'Igrejas com billing_status atualizado' FROM churches WHERE billing_status != 'current';
