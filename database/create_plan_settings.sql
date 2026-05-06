-- ================================================================
-- Igreja Connect - Tabela de Configuração de Planos
-- ================================================================
-- Permite que o Super Admin gerencie planos dinamicamente
-- Sem necessidade de modificar código
-- ================================================================

-- Criar tabela de configuração de planos
CREATE TABLE IF NOT EXISTS `plan_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plan_slug` varchar(50) NOT NULL,
  `plan_name` varchar(100) NOT NULL,
  `price_monthly` decimal(10,2) DEFAULT 0.00,
  `price_yearly` decimal(10,2) DEFAULT 0.00,
  `discount_percentage` decimal(5,2) DEFAULT 0.00,
  `max_members` int DEFAULT 0,
  `max_admins` int DEFAULT 1,
  `max_events` int DEFAULT 0,
  `max_prayers` int DEFAULT 0,
  `has_email_support` tinyint(1) DEFAULT 0,
  `has_priority_support` tinyint(1) DEFAULT 0,
  `has_custom_domain` tinyint(1) DEFAULT 0,
  `has_analytics` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `is_featured` tinyint(1) DEFAULT 0,
  `display_order` int DEFAULT 0,
  `updated_by` int DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `plan_slug` (`plan_slug`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir configuração do plano FREE
INSERT INTO `plan_settings` (`plan_slug`, `plan_name`, `price_monthly`, `price_yearly`, `discount_percentage`, `max_members`, `max_admins`, `max_events`, `max_prayers`, `has_email_support`, `has_priority_support`, `has_custom_domain`, `has_analytics`, `is_active`, `is_featured`, `display_order`) VALUES
('free', 'Free', 0.00, 0.00, 0.00, 50, 1, 5, 10, 0, 0, 0, 0, 1, 0, 1)
ON DUPLICATE KEY UPDATE plan_name = VALUES(plan_name);

-- Inserir configuração do plano ESSENCIAL
INSERT INTO `plan_settings` (`plan_slug`, `plan_name`, `price_monthly`, `price_yearly`, `discount_percentage`, `max_members`, `max_admins`, `max_events`, `max_prayers`, `has_email_support`, `has_priority_support`, `has_custom_domain`, `has_analytics`, `is_active`, `is_featured`, `display_order`) VALUES
('essencial', 'Essencial', 49.90, 499.00, 0.00, 200, 3, 20, 100, 1, 0, 0, 1, 1, 1, 2)
ON DUPLICATE KEY UPDATE plan_name = VALUES(plan_name);

-- Verificar configurações
SELECT '✅ Configurações de planos criadas com sucesso!' AS Status;
SELECT * FROM plan_settings ORDER BY display_order;
