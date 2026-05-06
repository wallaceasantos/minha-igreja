-- ================================================================
-- Igreja Connect - Tabela de Planos (Subscription Plans)
-- ================================================================
-- Cria tabela para gerenciamento de planos da plataforma
-- Apenas 2 planos: Free e Essencial
-- ================================================================

-- Criar tabela de planos
CREATE TABLE IF NOT EXISTS `subscription_plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `description` text,
  `price_monthly` decimal(10,2) DEFAULT 0.00,
  `price_yearly` decimal(10,2) DEFAULT 0.00,
  `max_members` int DEFAULT 0,
  `max_admins` int DEFAULT 1,
  `max_events` int DEFAULT 0,
  `max_prayers` int DEFAULT 0,
  `has_email_support` tinyint(1) DEFAULT 0,
  `has_priority_support` tinyint(1) DEFAULT 0,
  `has_custom_domain` tinyint(1) DEFAULT 0,
  `has_analytics` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_plans_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir plano FREE
INSERT INTO `subscription_plans` (`name`, `slug`, `description`, `price_monthly`, `price_yearly`, `max_members`, `max_admins`, `max_events`, `max_prayers`, `has_email_support`, `has_priority_support`, `has_custom_domain`, `has_analytics`, `is_active`, `sort_order`) VALUES
('Free', 'free', 'Plano gratuito para igrejas pequenas', 0.00, 0.00, 50, 1, 5, 10, 0, 0, 0, 0, 1, 1);

-- Inserir plano ESSENCIAL
INSERT INTO `subscription_plans` (`name`, `slug`, `description`, `price_monthly`, `price_yearly`, `max_members`, `max_admins`, `max_events`, `max_prayers`, `has_email_support`, `has_priority_support`, `has_custom_domain`, `has_analytics`, `is_active`, `sort_order`) VALUES
('Essencial', 'essencial', 'Plano essencial para igrejas em crescimento', 49.90, 499.00, 200, 3, 20, 100, 1, 0, 0, 1, 1, 2);

-- Verificar planos inseridos
SELECT '✅ Planos criados com sucesso!' AS Status;
SELECT * FROM subscription_plans ORDER BY sort_order;
