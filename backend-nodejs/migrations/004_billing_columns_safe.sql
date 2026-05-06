-- ============================================
-- Script Seguro: Colunas de Billing
-- ============================================
-- Adiciona colunas apenas se não existirem

USE jesus_vitoria_connect;

-- ============================================
-- Procedure para adicionar coluna se não existir
-- ============================================
DROP PROCEDURE IF EXISTS add_column_if_not_exists;

DELIMITER $$

CREATE PROCEDURE add_column_if_not_exists(
    IN table_name VARCHAR(64),
    IN column_name VARCHAR(64),
    IN column_definition TEXT
)
BEGIN
    DECLARE column_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = table_name
      AND COLUMN_NAME = column_name;
    
    IF column_exists = 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', table_name, ' ADD COLUMN ', column_definition);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('✅ Coluna adicionada: ', table_name, '.', column_name) AS result;
    ELSE
        SELECT CONCAT('⚠️ Coluna já existe: ', table_name, '.', column_name) AS result;
    END IF;
END$$

DELIMITER ;

-- ============================================
-- Adicionar colunas em churches
-- ============================================
CALL add_column_if_not_exists('churches', 'billing_status', 
    "`billing_status` enum('current','warning','partial_suspended','total_suspended','cancellation_pending','cancelled') DEFAULT 'current' AFTER `is_active`");

CALL add_column_if_not_exists('churches', 'last_billing_date', 
    "`last_billing_date` date AFTER `billing_status`");

CALL add_column_if_not_exists('churches', 'next_billing_date', 
    "`next_billing_date` date AFTER `last_billing_date`");

CALL add_column_if_not_exists('churches', 'days_overdue', 
    "`days_overdue` int DEFAULT 0 AFTER `next_billing_date`");

CALL add_column_if_not_exists('churches', 'partial_suspension_date', 
    "`partial_suspension_date` timestamp NULL AFTER `days_overdue`");

CALL add_column_if_not_exists('churches', 'total_suspension_date', 
    "`total_suspension_date` timestamp NULL AFTER `partial_suspension_date`");

CALL add_column_if_not_exists('churches', 'cancellation_notice_date', 
    "`cancellation_notice_date` timestamp NULL AFTER `total_suspension_date`");

-- ============================================
-- Adicionar colunas em subscriptions
-- ============================================
CALL add_column_if_not_exists('subscriptions', 'monthly_amount', 
    "`monthly_amount` decimal(10,2) DEFAULT 0.00 AFTER `amount_cents`");

CALL add_column_if_not_exists('subscriptions', 'billing_day', 
    "`billing_day` int DEFAULT 1 AFTER `monthly_amount`");

CALL add_column_if_not_exists('subscriptions', 'last_charge_attempt', 
    "`last_charge_attempt` timestamp NULL AFTER `payment_status`");

CALL add_column_if_not_exists('subscriptions', 'charge_failure_reason', 
    "`charge_failure_reason` text AFTER `last_charge_attempt`");

-- ============================================
-- Criar índices (ignora se já existem)
-- ============================================
CREATE INDEX IF NOT EXISTS `idx_churches_billing_status` ON `churches` (`billing_status`);
CREATE INDEX IF NOT EXISTS `idx_churches_days_overdue` ON `churches` (`days_overdue`);

-- ============================================
-- Atualizar dados
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
-- Criar/Atualizar view
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
-- Limpar procedure
-- ============================================
DROP PROCEDURE IF EXISTS add_column_if_not_exists;

-- ============================================
-- Mensagem final
-- ============================================
SELECT '✅ Script de billing executado com sucesso!' AS Status;
SELECT '📊 Verifique: SELECT id, name, billing_status, days_overdue FROM churches LIMIT 10;' AS Info;
