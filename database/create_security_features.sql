-- ================================================================
-- Igreja Connect - Sistema de Segurança (Opção 2)
-- ================================================================
-- Implementa: IPs bloqueados, Sessões ativas, Tentativas de login
-- ================================================================

-- 1. Adicionar campos de segurança em usuarios_admin
ALTER TABLE `usuarios_admin` 
ADD COLUMN `failed_login_attempts` int DEFAULT 0 AFTER last_login_ip,
ADD COLUMN `locked_until` timestamp NULL AFTER failed_login_attempts,
ADD COLUMN `last_failed_login` timestamp NULL AFTER locked_until;

-- Índice para performance
CREATE INDEX `idx_locked_until` ON `usuarios_admin` (`locked_until`);

-- 2. Criar tabela de IPs bloqueados
CREATE TABLE IF NOT EXISTS `blocked_ips` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(45) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `blocked_until` timestamp NULL DEFAULT NULL,
  `is_permanent` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ip_address` (`ip_address`),
  KEY `idx_blocked_until` (`blocked_until`),
  KEY `idx_permanent` (`is_permanent`),
  CONSTRAINT `fk_blocked_user` FOREIGN KEY (`created_by`) REFERENCES `usuarios_admin` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Criar tabela de sessões ativas
CREATE TABLE IF NOT EXISTS `user_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `session_token` varchar(255) NOT NULL UNIQUE,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `device_info` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_activity` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_token` (`session_token`),
  KEY `idx_expires` (`expires_at`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `fk_session_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios_admin` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Criar tabela de log de tentativas de login (para auditoria detalhada)
CREATE TABLE IF NOT EXISTS `login_attempts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `success` tinyint(1) DEFAULT 0,
  `user_id` int DEFAULT NULL,
  `failure_reason` enum('invalid_email','invalid_password','account_locked','too_many_attempts') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_ip` (`ip_address`),
  KEY `idx_created` (`created_at`),
  KEY `idx_success` (`success`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Inserir dados de exemplo para IPs bloqueados (opcional)
INSERT INTO `blocked_ips` (`ip_address`, `reason`, `blocked_until`, `is_permanent`) VALUES
('192.168.100.1', 'Múltiplas tentativas de login falhas', DATE_ADD(NOW(), INTERVAL 24 HOUR), 0),
('10.0.0.99', 'Comportamento suspeito', NULL, 1);

-- Verificar estrutura
SELECT '✅ Tabelas de segurança criadas com sucesso!' AS Status;
SELECT 'usuarios_admin' as tabela, COUNT(*) as campos FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios_admin' AND COLUMN_NAME IN ('failed_login_attempts', 'locked_until', 'last_failed_login')
UNION ALL
SELECT 'blocked_ips', COUNT(*) FROM blocked_ips
UNION ALL
SELECT 'user_sessions', COUNT(*) FROM user_sessions
UNION ALL
SELECT 'login_attempts', COUNT(*) FROM login_attempts;
