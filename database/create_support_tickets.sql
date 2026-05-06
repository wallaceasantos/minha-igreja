-- ================================================================
-- Igreja Connect - Sistema de Suporte/Tickets
-- ================================================================
-- Tabela para gerenciamento de tickets de suporte
-- ================================================================

-- Drop tables if exist (para recriar do zero)
-- DROP TABLE IF EXISTS `support_ticket_attachments`;
-- DROP TABLE IF EXISTS `support_ticket_messages`;
-- DROP TABLE IF EXISTS `support_tickets`;

-- Criar tabela de tickets (apenas se não existir)
CREATE TABLE IF NOT EXISTS `support_tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_number` varchar(20) NOT NULL,
  `church_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` enum('open','in_progress','waiting_customer','resolved','closed') DEFAULT 'open',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `category` enum('technical','billing','feature','other') DEFAULT 'other',
  `assigned_to` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `closed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ticket_number` (`ticket_number`),
  KEY `idx_church` (`church_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_assigned` (`assigned_to`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `fk_tickets_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tickets_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios_admin` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tickets_assigned` FOREIGN KEY (`assigned_to`) REFERENCES `usuarios_admin` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Criar tabela de mensagens dos tickets (apenas se não existir)
CREATE TABLE IF NOT EXISTS `support_ticket_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `user_id` int NOT NULL,
  `message` text NOT NULL,
  `is_internal` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ticket` (`ticket_id`),
  KEY `idx_user` (`user_id`),
  CONSTRAINT `fk_messages_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios_admin` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Criar tabela de anexos dos tickets (apenas se não existir)
CREATE TABLE IF NOT EXISTS `support_ticket_attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `message_id` int DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int DEFAULT 0,
  `file_type` varchar(100) DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ticket` (`ticket_id`),
  KEY `idx_message` (`message_id`),
  CONSTRAINT `fk_attachments_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_attachments_message` FOREIGN KEY (`message_id`) REFERENCES `support_ticket_messages` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir dados de exemplo (apenas se a tabela estiver vazia)
INSERT IGNORE INTO `support_tickets` (`ticket_number`, `church_id`, `user_id`, `subject`, `description`, `status`, `priority`, `category`, `assigned_to`) VALUES
('TKT-001', 1, 2, 'Erro ao exportar relatórios', 'Estou tentando exportar o relatório de membros mas está dando erro 500', 'open', 'medium', 'technical', 1),
('TKT-002', 2, 3, 'Dúvida sobre faturamento', 'Gostaria de saber quando será a próxima cobrança do plano', 'in_progress', 'low', 'billing', 1),
('TKT-003', 3, 4, 'Sugestão de melhoria', 'Seria interessante ter um calendário de eventos', 'waiting_customer', 'low', 'feature', 1);

-- Verificar estrutura
SELECT '✅ Tabelas de suporte criadas/atualizadas com sucesso!' AS Status;
SELECT COUNT(*) as total_tickets FROM support_tickets;
SELECT status, COUNT(*) as quantidade FROM support_tickets GROUP BY status;
