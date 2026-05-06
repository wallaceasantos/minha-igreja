-- ================================================================
-- Atualização: Sistema de Planos e Configurações
-- ================================================================
-- Script compatível com MySQL 5.7+
-- ================================================================

USE igreja_connect;

-- 1. Adicionar campos na tabela churches (usando procedimento armazenado)
DROP PROCEDURE IF EXISTS add_column_if_not_exists;
DELIMITER $$
CREATE PROCEDURE add_column_if_not_exists(
    IN table_name VARCHAR(64),
    IN column_name VARCHAR(64),
    IN column_def VARCHAR(500)
)
BEGIN
    DECLARE column_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = table_name
      AND COLUMN_NAME = column_name;
    
    IF column_exists = 0 THEN
        SET @sql = CONCAT('ALTER TABLE `', table_name, '` ADD COLUMN `', column_name, '` ', column_def);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$
DELIMITER ;

-- Adicionar campos na tabela churches
CALL add_column_if_not_exists('churches', 'logo_url', 'varchar(500) DEFAULT NULL AFTER `description`');
CALL add_column_if_not_exists('churches', 'favicon_url', 'varchar(500) DEFAULT NULL AFTER `logo_url`');
CALL add_column_if_not_exists('churches', 'hero_image_url', 'varchar(500) DEFAULT NULL AFTER `favicon_url`');
CALL add_column_if_not_exists('churches', 'updated_at', 'timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`');

-- 2. Criar tabela church_service_times (horários de culto)
CREATE TABLE IF NOT EXISTS `church_service_times` (
  `id` int NOT NULL AUTO_INCREMENT,
  `church_id` int NOT NULL,
  `day_of_week` enum('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  `service_name` varchar(255) NOT NULL,
  `service_time` time NOT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_service_church` (`church_id`),
  CONSTRAINT `fk_service_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Criar tabela usage_counters (contadores de uso por plano)
CREATE TABLE IF NOT EXISTS `usage_counters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `church_id` int NOT NULL,
  `counter_type` enum('members','prayers','admins','events') NOT NULL,
  `counter_value` int DEFAULT '0',
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_church_counter_period` (`church_id`, `counter_type`, `period_start`),
  KEY `idx_counter_church` (`church_id`),
  CONSTRAINT `fk_counter_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Adicionar campos na tabela subscriptions (usando procedimento)
CALL add_column_if_not_exists('subscriptions', 'seats_used', 'int DEFAULT 0 AFTER `status`');
CALL add_column_if_not_exists('subscriptions', 'features_used', 'json DEFAULT NULL AFTER `seats_used`');

-- 5. Inserir dados de exemplo para horários de culto (apenas se a tabela estiver vazia)
INSERT INTO `church_service_times` (`church_id`, `day_of_week`, `service_name`, `service_time`, `description`)
SELECT 
  1,
  'Sunday',
  'Culto de Celebração',
  '19:00:00',
  'Celebração da Palavra e Ceia do Senhor'
WHERE NOT EXISTS (SELECT 1 FROM `church_service_times` WHERE `church_id` = 1);

-- 6. Limpar procedimento
DROP PROCEDURE IF EXISTS add_column_if_not_exists;

-- 7. Mensagem de confirmação
SELECT '✅ Atualização do sistema de planos concluída!' AS Status;
SELECT 'Tabelas criadas/atualizadas:' AS Informacao;
SHOW TABLES;
