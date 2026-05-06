-- ================================================================
-- Igreja Connect - Script Completo do Banco de Dados
-- ================================================================
-- Todas as tabelas necessárias para o sistema
-- ================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ================================================================
-- 1. TABELA: churches (Igrejas)
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
  `email` varchar(255),
  `facebook_url` varchar(500),
  `instagram_url` varchar(500),
  `youtube_url` varchar(500),
  `youtube_channel_id` varchar(100),
  `theme_primary_color` varchar(7) DEFAULT '#1e40af',
  `theme_secondary_color` varchar(7) DEFAULT '#f59e0b',
  `plan_type` enum('free','essencial','premium','enterprise') DEFAULT 'free',
  `is_active` tinyint(1) DEFAULT '1',
  `is_verified` tinyint(1) DEFAULT '0',
  `trial_end_date` datetime,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_churches_active` (`is_active`),
  KEY `idx_churches_plan` (`plan_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- 2. TABELA: subscriptions (Assinaturas)
-- ================================================================
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `church_id` int NOT NULL,
  `plan_type` enum('free','essencial','premium','enterprise') DEFAULT 'free',
  `status` enum('active','inactive','trial','cancelled','expired') DEFAULT 'trial',
  `current_period_start` date,
  `current_period_end` date,
  `trial_end_date` datetime,
  `cancel_at_period_end` tinyint(1) DEFAULT '0',
  `canceled_at` datetime,
  `cancel_reason` enum('price','not_using','closed','competitor','technical','other','non_payment') DEFAULT NULL,
  `seats_used` int DEFAULT 0,
  `features_used` json DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `last_payment_date` datetime DEFAULT NULL,
  `next_billing_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_subscriptions_church` (`church_id`),
  KEY `idx_subscriptions_status` (`status`),
  KEY `idx_subscriptions_plan` (`plan_type`),
  CONSTRAINT `fk_subscriptions_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- 3. TABELA: subscriptions_payments (Pagamentos de Assinaturas)
-- ================================================================
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

-- ================================================================
-- 4. TABELA: usuarios_admin (Administradores)
-- ================================================================
CREATE TABLE IF NOT EXISTS `usuarios_admin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `church_id` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('super_admin','admin','pastor','secretary','leader') DEFAULT 'admin',
  `is_active` tinyint(1) DEFAULT '1',
  `last_login_at` timestamp NULL,
  `last_login_ip` varchar(45),
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_church` (`church_id`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_active` (`is_active`),
  CONSTRAINT `fk_users_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- 5. TABELA: admin_tokens (Tokens de Admin)
-- ================================================================
CREATE TABLE IF NOT EXISTS `admin_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `church_id` int DEFAULT NULL,
  `token` varchar(500) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tokens_user` (`user_id`),
  KEY `idx_church` (`church_id`),
  CONSTRAINT `fk_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios_admin` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tokens_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- 6. TABELA: church_members (Membros das Igrejas)
-- ================================================================
CREATE TABLE IF NOT EXISTS `church_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `church_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255),
  `phone` varchar(20),
  `address` text,
  `birth_date` date,
  `baptism_date` date,
  `is_active` tinyint(1) DEFAULT '1',
  `member_since` date,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_members_church` (`church_id`),
  KEY `idx_members_active` (`is_active`),
  CONSTRAINT `fk_members_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- 7. TABELA: church_events (Eventos das Igrejas)
-- ================================================================
CREATE TABLE IF NOT EXISTS `church_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `church_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `event_date` datetime NOT NULL,
  `end_date` datetime,
  `location` varchar(255),
  `address` text,
  `is_recurring` tinyint(1) DEFAULT '0',
  `recurrence_pattern` enum('daily','weekly','monthly','yearly') DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_events_church` (`church_id`),
  KEY `idx_events_date` (`event_date`),
  KEY `idx_events_active` (`is_active`),
  CONSTRAINT `fk_events_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- 8. TABELA: church_service_times (Horários de Culto)
-- ================================================================
CREATE TABLE IF NOT EXISTS `church_service_times` (
  `id` int NOT NULL AUTO_INCREMENT,
  `church_id` int NOT NULL,
  `day_of_week` enum('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  `service_name` varchar(255) NOT NULL,
  `service_time` time NOT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_service_church` (`church_id`),
  CONSTRAINT `fk_service_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- 9. TABELA: contact_messages (Mensagens de Contato)
-- ================================================================
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `church_id` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20),
  `message` text NOT NULL,
  `status` enum('new','read','replied','archived') DEFAULT 'new',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_contact_church` (`church_id`),
  KEY `idx_contact_status` (`status`),
  CONSTRAINT `fk_contact_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- 10. TABELA: pedidos (Pedidos de Oração)
-- ================================================================
CREATE TABLE IF NOT EXISTS `pedidos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `church_id` int DEFAULT NULL,
  `titulo` varchar(255) DEFAULT NULL,
  `oracao` text NOT NULL,
  `pedido_atendido` tinyint(1) DEFAULT '0',
  `status` enum('pending','answered','archived') DEFAULT 'pending',
  `created_by` int DEFAULT NULL,
  `answered_by` int DEFAULT NULL,
  `answered_at` timestamp NULL,
  `answer` text,
  `is_public` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pedidos_church` (`church_id`),
  KEY `idx_pedidos_status` (`status`),
  CONSTRAINT `fk_pedidos_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- 11. TABELA: audit_logs (Logs de Auditoria)
-- ================================================================
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `church_id` int DEFAULT NULL,
  `user_id` int,
  `action` varchar(100) NOT NULL,
  `details` text,
  `ip_address` varchar(45),
  `user_agent` varchar(255),
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_church` (`church_id`),
  KEY `idx_audit_user` (`user_id`),
  KEY `idx_audit_action` (`action`),
  KEY `idx_audit_created` (`created_at`),
  CONSTRAINT `fk_audit_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- 12. TABELA: collection_notes (Notas de Cobrança)
-- ================================================================
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

-- ================================================================
-- 13. TABELA: event_attendees (Participantes de Eventos)
-- ================================================================
CREATE TABLE IF NOT EXISTS `event_attendees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `member_id` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255),
  `phone` varchar(20),
  `status` enum('registered','confirmed','present','absent') DEFAULT 'registered',
  `registered_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `confirmed_at` timestamp NULL,
  PRIMARY KEY (`id`),
  KEY `idx_attendees_event` (`event_id`),
  KEY `idx_attendees_member` (`member_id`),
  CONSTRAINT `fk_attendees_event` FOREIGN KEY (`event_id`) REFERENCES `church_events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_attendees_member` FOREIGN KEY (`member_id`) REFERENCES `church_members` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- 14. TABELA: member_ministries (Ministérios de Membros)
-- ================================================================
CREATE TABLE IF NOT EXISTS `member_ministries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `member_id` int NOT NULL,
  `ministry_name` varchar(255) NOT NULL,
  `role` varchar(255),
  `started_at` date,
  `is_active` tinyint(1) DEFAULT '1',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ministry_member` (`member_id`),
  CONSTRAINT `fk_ministry_member` FOREIGN KEY (`member_id`) REFERENCES `church_members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- 15. TABELA: notifications (Notificações)
-- ================================================================
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `church_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','warning','error','success') DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT '0',
  `read_at` timestamp NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_church` (`church_id`),
  KEY `idx_notifications_user` (`user_id`),
  KEY `idx_notifications_read` (`is_read`),
  CONSTRAINT `fk_notifications_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- DADOS INICIAIS (Seed Data)
-- ================================================================

-- Super Admin
INSERT INTO `usuarios_admin` (`id`, `church_id`, `name`, `email`, `password`, `role`, `is_active`) VALUES
(1, NULL, 'Super Admin', 'admin@igreja-connect.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin', 1);

-- Igrejas de Exemplo
INSERT INTO `churches` (`id`, `name`, `slug`, `description`, `email`, `phone`, `plan_type`, `is_active`, `is_verified`, `trial_end_date`, `created_at`) VALUES
(1, 'Ministério Nova Vida', 'ministerio-nova-vida', 'Um ministério comprometido com o evangelho', 'contato@novavida.com.br', '(11) 99999-9999', 'free', 1, 0, DATE_ADD(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 'Igreja Batista da Graça', 'batista-graca', 'Pela graça sois salvos', 'contato@batistagraca.com.br', '(11) 99999-9998', 'free', 1, 0, DATE_ADD(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),
(3, 'Igreja Metodista de Manaus', 'metodista-manaus', 'Uma igreja histórica', 'contato@metodistamanaus.com.br', '(92) 3234-3333', 'free', 1, 0, DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY));

-- Assinaturas de Exemplo
INSERT INTO `subscriptions` (`church_id`, `plan_type`, `status`, `current_period_start`, `current_period_end`, `trial_end_date`, `created_at`) VALUES
(1, 'free', 'trial', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 'free', 'trial', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),
(3, 'free', 'trial', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY));

-- ================================================================
-- RESTAURAR FOREIGN KEY CHECKS
-- ================================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ================================================================
-- MENSAGEM DE SUCESSO
-- ================================================================
SELECT '✅ Banco de dados criado com sucesso!' AS Status;
SELECT 'Tabelas criadas:' AS Informacao;
SHOW TABLES;
