-- ================================================================
-- Atualização: Sistema de Inadimplência
-- ================================================================
-- Atualiza tabelas existentes para controle de pagamentos
-- ================================================================

USE igreja_connect;

-- 1. Criar tabela de pagamentos (se não existir)
CREATE TABLE IF NOT EXISTS `subscriptions_payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subscription_id` int NOT NULL,
  `church_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','paid','overdue','cancelled','refunded') DEFAULT 'pending',
  `due_date` date NOT NULL,
  `paid_date` date DEFAULT NULL,
  `payment_method` enum('credit_card','pix','boleto','bank_transfer') DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payment_subscription` (`subscription_id`),
  KEY `idx_payment_church` (`church_id`),
  KEY `idx_payment_status` (`status`),
  KEY `idx_payment_due_date` (`due_date`),
  CONSTRAINT `fk_payment_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payment_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Adicionar campos que não existem na tabela subscriptions
-- Nota: MySQL não suporta ADD COLUMN IF NOT EXISTS, então usamos procedure

DROP PROCEDURE IF EXISTS add_column_if_not_exists_subs;
DELIMITER $$
CREATE PROCEDURE add_column_if_not_exists_subs(
    IN column_name VARCHAR(64),
    IN column_def VARCHAR(500)
)
BEGIN
    DECLARE column_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'subscriptions'
      AND COLUMN_NAME = column_name;
    
    IF column_exists = 0 THEN
        SET @sql = CONCAT('ALTER TABLE `subscriptions` ADD COLUMN `', column_name, '` ', column_def);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$
DELIMITER ;

-- Adicionar campos que faltam
CALL add_column_if_not_exists_subs('payment_method', 'varchar(50) DEFAULT NULL AFTER canceled_at');
CALL add_column_if_not_exists_subs('last_payment_date', 'datetime DEFAULT NULL AFTER payment_method');
CALL add_column_if_not_exists_subs('next_billing_date', 'date DEFAULT NULL AFTER last_payment_date');
CALL add_column_if_not_exists_subs('cancel_reason', 'enum(\'price\',\'not_using\',\'closed\',\'competitor\',\'technical\',\'other\',\'non_payment\') DEFAULT NULL AFTER canceled_at');

-- 3. Criar tabela de notas de cobrança (se não existir)
CREATE TABLE IF NOT EXISTS `collection_notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `church_id` int NOT NULL,
  `subscription_id` int NOT NULL,
  `user_id` int NOT NULL,
  `note_type` enum('email','call','message','suspension_warning','cancellation_warning') NOT NULL,
  `note` text NOT NULL,
  `follow_up_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_collection_church` (`church_id`),
  KEY `idx_collection_subscription` (`subscription_id`),
  CONSTRAINT `fk_collection_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_collection_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Limpar procedure
DROP PROCEDURE IF EXISTS add_column_if_not_exists_subs;

-- 5. Mensagem de confirmação
SELECT '✅ Sistema de inadimplência atualizado com sucesso!' AS Status;
SELECT 'Verificando estrutura...' AS Informacao;

-- Mostrar estrutura da tabela subscriptions
DESCRIBE subscriptions;

-- Mostrar tabelas criadas
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name IN ('subscriptions', 'subscriptions_payments', 'collection_notes');
