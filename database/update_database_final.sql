-- ================================================================
-- ATUALIZAÇÃO DO BANCO EXISTENTE - Igreja Connect Multi-Tenant
-- ================================================================
-- Banco: walla573_ccjv_sistema
-- Script com verificações de existência
-- ================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ================================================================
-- 0. PADRONIZAR COLLATIONS
-- ================================================================

ALTER TABLE `pedidos` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `usuarios_admin` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `audit_logs` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `admin_tokens` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- pedidos_oracao (apenas se existir)
-- SET @table_exists = 0;
-- SELECT COUNT(*) INTO @table_exists FROM information_schema.tables 
-- WHERE table_schema = DATABASE() AND table_name = 'pedidos_oracao';
-- SET @sql = IF(@table_exists = 1, 
--   'ALTER TABLE `pedidos_oracao` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci', 
--   'SELECT "Tabela pedidos_oracao não existe"');
-- PREPARE stmt FROM @sql;
-- EXECUTE stmt;
-- DEALLOCATE PREPARE stmt;

-- ================================================================
-- 1. CRIAR TABELAS NOVAS (Multi-Tenant)
-- ================================================================

CREATE TABLE IF NOT EXISTS `churches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text,
  `logo_url` varchar(500),
  `favicon_url` varchar(500),
  `hero_image_url` varchar(500),
  `address_street` varchar(255),
  `address_number` varchar(20),
  `address_complement` varchar(50),
  `address_neighborhood` varchar(100),
  `address_city` varchar(100),
  `address_state` char(2),
  `address_zip` varchar(9),
  `phone` varchar(20),
  `whatsapp` varchar(20),
  `email` varchar(100),
  `facebook_url` varchar(500),
  `instagram_url` varchar(500),
  `youtube_url` varchar(500),
  `youtube_channel_id` varchar(100),
  `theme_primary_color` char(7) DEFAULT '#1e40af',
  `theme_secondary_color` char(7) DEFAULT '#f59e0b',
  `custom_domain` varchar(255),
  `custom_domain_verified` tinyint(1) DEFAULT '0',
  `plan_type` enum('free','essential','premium','enterprise') DEFAULT 'free',
  `is_active` tinyint(1) DEFAULT '1',
  `is_verified` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `custom_domain` (`custom_domain`),
  KEY `idx_churches_active` (`is_active`),
  KEY `idx_churches_plan_type` (`plan_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `church_id` int NOT NULL,
  `plan_type` enum('free','essential','premium','enterprise') NOT NULL,
  `status` enum('active','inactive','cancelled','past_due','trial') DEFAULT 'trial',
  `stripe_customer_id` varchar(100),
  `stripe_subscription_id` varchar(100),
  `mercado_pago_customer_id` varchar(100),
  `mercado_pago_subscription_id` varchar(100),
  `current_period_start` date,
  `current_period_end` date,
  `trial_end_date` date,
  `amount_cents` int DEFAULT '0',
  `currency` char(3) DEFAULT 'BRL',
  `payment_method` varchar(50),
  `last_payment_date` date,
  `next_billing_date` date,
  `payment_status` enum('paid','pending','failed','refunded') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `cancelled_at` timestamp NULL,
  `cancel_reason` text,
  PRIMARY KEY (`id`),
  KEY `idx_subscriptions_church` (`church_id`),
  KEY `idx_subscriptions_status` (`status`),
  KEY `idx_subscriptions_plan` (`plan_type`),
  CONSTRAINT `fk_subscriptions_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `church_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `church_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(100),
  `phone` varchar(20),
  `whatsapp` varchar(20),
  `birth_date` date,
  `gender` enum('male','female','other'),
  `cpf` varchar(14),
  `address_street` varchar(255),
  `address_number` varchar(20),
  `address_complement` varchar(50),
  `address_neighborhood` varchar(100),
  `address_city` varchar(100),
  `address_state` char(2),
  `address_zip` varchar(9),
  `member_status` enum('member','visitor','candidate','inactive') DEFAULT 'visitor',
  `membership_date` date,
  `baptism_date` date,
  `ministry` varchar(100),
  `is_leader` tinyint(1) DEFAULT '0',
  `photo_url` varchar(500),
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL,
  PRIMARY KEY (`id`),
  KEY `idx_members_church` (`church_id`),
  KEY `idx_members_status` (`member_status`),
  KEY `idx_members_email` (`email`),
  CONSTRAINT `fk_members_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `church_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `church_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `event_type` enum('culto','evento','reuniao','retiro','congresso','outro') DEFAULT 'evento',
  `start_datetime` datetime NOT NULL,
  `end_datetime` datetime,
  `is_recurring` tinyint(1) DEFAULT '0',
  `recurrence_pattern` enum('daily','weekly','monthly','yearly'),
  `location` varchar(255),
  `address` varchar(500),
  `is_online` tinyint(1) DEFAULT '0',
  `online_link` varchar(500),
  `image_url` varchar(500),
  `status` enum('scheduled','active','completed','cancelled') DEFAULT 'scheduled',
  `responsible_id` int,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_events_church` (`church_id`),
  KEY `idx_events_start` (`start_datetime`),
  KEY `idx_events_status` (`status`),
  CONSTRAINT `fk_events_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20),
  `church` varchar(255),
  `church_size` varchar(50),
  `subject` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_messages_created` (`created_at`),
  KEY `idx_messages_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- 2. ATUALIZAR TABELAS EXISTENTES (COM VERIFICAÇÕES)
-- ================================================================

-- Procedure para adicionar coluna se não existir
DROP PROCEDURE IF EXISTS add_column_if_not_exists;
DELIMITER $$
CREATE PROCEDURE add_column_if_not_exists(
    IN table_name VARCHAR(64),
    IN column_name VARCHAR(64),
    IN column_def VARCHAR(255),
    IN after_column VARCHAR(64)
)
BEGIN
    DECLARE col_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO col_exists
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = table_name
      AND column_name = column_name;
    
    IF col_exists = 0 THEN
        SET @sql = CONCAT('ALTER TABLE `', table_name, '` ADD COLUMN `', column_name, '` ', column_def, ' AFTER `', after_column, '`');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$
DELIMITER ;

-- Procedure para adicionar índice se não existir
DROP PROCEDURE IF EXISTS add_index_if_not_exists;
DELIMITER $$
CREATE PROCEDURE add_index_if_not_exists(
    IN table_name VARCHAR(64),
    IN index_name VARCHAR(64),
    IN index_columns VARCHAR(255)
)
BEGIN
    DECLARE idx_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO idx_exists
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = table_name
      AND INDEX_NAME = index_name;
    
    IF idx_exists = 0 THEN
        SET @sql = CONCAT('ALTER TABLE `', table_name, '` ADD KEY `', index_name, '` (', index_columns, ')');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$
DELIMITER ;

-- Procedure para adicionar foreign key se não existir
DROP PROCEDURE IF EXISTS add_foreign_key_if_not_exists;
DELIMITER $$
CREATE PROCEDURE add_foreign_key_if_not_exists(
    IN table_name VARCHAR(64),
    IN constraint_name VARCHAR(64),
    IN column_name VARCHAR(64),
    IN ref_table VARCHAR(64),
    IN ref_column VARCHAR(64)
)
BEGIN
    DECLARE fk_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO fk_exists
    FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = table_name
      AND constraint_name = constraint_name;
    
    IF fk_exists = 0 THEN
        SET @sql = CONCAT('ALTER TABLE `', table_name, '` ADD CONSTRAINT `', constraint_name, '` FOREIGN KEY (`', column_name, '`) REFERENCES `', ref_table, '` (`', ref_column, '`) ON DELETE CASCADE');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$
DELIMITER ;

-- Executar procedures para usuarios_admin
CALL add_column_if_not_exists('usuarios_admin', 'church_id', 'int DEFAULT NULL', 'id');
CALL add_column_if_not_exists('usuarios_admin', 'role', 'enum(\'super_admin\',\'admin\',\'pastor\',\'secretary\',\'leader\') DEFAULT \'admin\'', 'church_id');
CALL add_column_if_not_exists('usuarios_admin', 'is_active', 'tinyint(1) DEFAULT \'1\'', 'role');
CALL add_column_if_not_exists('usuarios_admin', 'last_login_at', 'timestamp NULL', 'is_active');
CALL add_column_if_not_exists('usuarios_admin', 'last_login_ip', 'varchar(45)', 'last_login_at');
CALL add_column_if_not_exists('usuarios_admin', 'created_at', 'timestamp NULL DEFAULT CURRENT_TIMESTAMP', 'last_login_ip');
CALL add_index_if_not_exists('usuarios_admin', 'idx_users_church', 'church_id');
CALL add_foreign_key_if_not_exists('usuarios_admin', 'fk_users_church', 'church_id', 'churches', 'id');

-- Executar procedures para pedidos
CALL add_column_if_not_exists('pedidos', 'church_id', 'int DEFAULT NULL', 'id');
CALL add_column_if_not_exists('pedidos', 'status', 'enum(\'pending\',\'answered\',\'archived\') DEFAULT \'pending\'', 'oracao');
CALL add_column_if_not_exists('pedidos', 'created_by', 'int', 'status');
CALL add_column_if_not_exists('pedidos', 'updated_at', 'timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'created_by');
CALL add_index_if_not_exists('pedidos', 'idx_pedidos_church', 'church_id');
CALL add_foreign_key_if_not_exists('pedidos', 'fk_pedidos_church', 'church_id', 'churches', 'id');

-- Executar procedures para audit_logs
CALL add_column_if_not_exists('audit_logs', 'church_id', 'int DEFAULT NULL', 'id');
CALL add_index_if_not_exists('audit_logs', 'idx_audit_church', 'church_id');
CALL add_foreign_key_if_not_exists('audit_logs', 'fk_audit_church', 'church_id', 'churches', 'id');

-- Executar procedures para admin_tokens
CALL add_column_if_not_exists('admin_tokens', 'church_id', 'int DEFAULT NULL', 'user_id');
CALL add_index_if_not_exists('admin_tokens', 'idx_church', 'church_id');
CALL add_foreign_key_if_not_exists('admin_tokens', 'fk_tokens_church', 'church_id', 'churches', 'id');

-- Limpar procedures
DROP PROCEDURE IF EXISTS add_column_if_not_exists;
DROP PROCEDURE IF EXISTS add_index_if_not_exists;
DROP PROCEDURE IF EXISTS add_foreign_key_if_not_exists;

-- ================================================================
-- 3. MIGRAR DADOS (apenas se pedidos_oracao existir)
-- ================================================================

-- Migrar dados de pedidos_oracao para pedidos (se existir)
-- Verificar se tabela pedidos_oracao existe
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists 
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
  AND table_name = 'pedidos_oracao';

-- Se existir, migra dados e elimina tabela
SET @sql = IF(@table_exists = 1,
  'INSERT IGNORE INTO `pedidos` (`nome`, `email`, `telefone`, `categoria`, `tema`, `oracao`, `data`) SELECT `nome`, `email`, `telefone`, `categoria`, `tema`, `oracao`, `data_criacao` FROM `pedidos_oracao`',
  'SELECT "Tabela pedidos_oracao não existe, pulando migração"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Eliminar tabela redundante (se existir)
SET @sql = IF(@table_exists = 1,
  'DROP TABLE IF EXISTS `pedidos_oracao`',
  'SELECT "Tabela pedidos_oracao não existe, nada para eliminar"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ================================================================
-- 4. DADOS INICIAIS
-- ================================================================

-- Inserir igreja matriz
INSERT IGNORE INTO `churches` (
    `name`, `slug`, `description`,
    `address_city`, `address_state`,
    `email`, `phone`,
    `plan_type`, `is_active`, `is_verified`, `created_at`
) VALUES (
    'Igreja Matriz',
    'igreja-matriz',
    'Igreja principal do sistema',
    'São Paulo',
    'SP',
    'contato@igreja.com.br',
    '(11) 99999-9999',
    'premium',
    1,
    1,
    NOW()
);

-- Atualizar admin existente para SUPER ADMIN
UPDATE `usuarios_admin` 
SET `church_id` = (SELECT `id` FROM `churches` WHERE `slug` = 'igreja-matriz' LIMIT 1),
    `role` = 'super_admin',
    `is_active` = 1
WHERE `id` = 1;

-- ================================================================
-- 5. VIEW DASHBOARD
-- ================================================================

CREATE OR REPLACE VIEW `vw_church_dashboard` AS
SELECT 
    c.id,
    c.name,
    c.slug,
    c.plan_type,
    c.is_active,
    c.created_at,
    COUNT(DISTINCT p.id) as total_pedidos,
    COUNT(DISTINCT m.id) as total_membros,
    COUNT(DISTINCT e.id) as total_eventos,
    s.status as subscription_status,
    s.current_period_end
FROM churches c
LEFT JOIN pedidos p ON c.id = p.church_id
LEFT JOIN church_members m ON c.id = m.church_id
LEFT JOIN church_events e ON c.id = e.church_id
LEFT JOIN subscriptions s ON c.id = s.church_id
WHERE c.is_active = 1
GROUP BY c.id, c.name, c.slug, c.plan_type, c.is_active, c.created_at, s.status, s.current_period_end;

SET FOREIGN_KEY_CHECKS = 1;

-- ================================================================
-- FIM DO SCRIPT
-- ================================================================
