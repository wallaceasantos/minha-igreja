-- ================================================================
-- Igreja Connect - Sistema de Comunicados/Notificações em Massa
-- ================================================================
-- Tabela para gerenciamento de comunicados enviados às igrejas
-- ================================================================

-- Criar tabela de comunicados
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','warning','success','error','maintenance') DEFAULT 'info',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `send_method` enum('platform','email','both') DEFAULT 'platform',
  `target_audience` enum('all','free','essencial','premium','enterprise','specific') DEFAULT 'all',
  `target_churches` json DEFAULT NULL,
  `status` enum('draft','scheduled','sending','sent','cancelled') DEFAULT 'draft',
  `scheduled_at` timestamp NULL DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `show_on_dashboard` tinyint(1) DEFAULT 1,
  `show_on_login` tinyint(1) DEFAULT 0,
  `require_acknowledgment` tinyint(1) DEFAULT 0,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  KEY `idx_active` (`is_active`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `fk_announcements_user` FOREIGN KEY (`created_by`) REFERENCES `usuarios_admin` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Criar tabela de recebimento de comunicados (por igreja)
CREATE TABLE IF NOT EXISTS `announcement_recipients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `announcement_id` int NOT NULL,
  `church_id` int NOT NULL,
  `status` enum('sent','delivered','read','acknowledged') DEFAULT 'sent',
  `sent_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `acknowledged_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_announcement` (`announcement_id`),
  KEY `idx_church` (`church_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_recipients_announcement` FOREIGN KEY (`announcement_id`) REFERENCES `announcements` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_recipients_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Criar tabela de visualizações de comunicados (por usuário)
CREATE TABLE IF NOT EXISTS `announcement_views` (
  `id` int NOT NULL AUTO_INCREMENT,
  `announcement_id` int NOT NULL,
  `user_id` int NOT NULL,
  `church_id` int DEFAULT NULL,
  `viewed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ip_address` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_announcement` (`announcement_id`),
  KEY `idx_user` (`user_id`),
  CONSTRAINT `fk_views_announcement` FOREIGN KEY (`announcement_id`) REFERENCES `announcements` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_views_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios_admin` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir dados de exemplo (opcional)
INSERT INTO `announcements` (`title`, `message`, `type`, `priority`, `send_method`, `target_audience`, `status`, `show_on_dashboard`, `created_by`) VALUES
('Manutenção Programada', 'O sistema passará por manutenção no dia 15/04 das 02:00 às 04:00. Durante este período, o acesso poderá ficar instável.', 'warning', 'high', 'both', 'all', 'sent', 1, 1),
('Nova Funcionalidade: Tickets de Suporte', 'Implementamos um novo sistema de tickets para você abrir chamados de suporte de forma mais organizada. Acesse o menu Tickets!', 'success', 'medium', 'platform', 'all', 'sent', 1, 1),
('Atualização de Segurança', 'Recomendamos que todos os administradores troquem suas senhas por medida de segurança. Acesse Configurações > Segurança.', 'info', 'medium', 'email', 'all', 'sent', 0, 1);

-- Verificar estrutura
SELECT '✅ Tabelas de comunicados criadas com sucesso!' AS Status;
SELECT COUNT(*) as total_comunicados FROM announcements;
SELECT type, COUNT(*) as quantidade FROM announcements GROUP BY type;
