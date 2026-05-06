-- ============================================
-- Migration 006: Domínio Próprio (MVP)
-- ============================================
-- Data: 18/04/2026
-- Descrição: Sistema de solicitação de domínio próprio para plano Essencial

USE jesus_vitoria_connect;

-- ============================================
-- 1. Criar tabela church_domain_requests
-- ============================================

CREATE TABLE IF NOT EXISTS `church_domain_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `church_id` int NOT NULL,
  `requested_domain` varchar(255) NOT NULL,
  `status` enum('pending','verified','configured','active','rejected') DEFAULT 'pending',
  `dns_verified` tinyint(1) DEFAULT 0,
  `dns_check_result` text,
  `configured_at` timestamp NULL,
  `activated_at` timestamp NULL,
  `notes` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_domain` (`requested_domain`),
  KEY `idx_church_domain` (`church_id`),
  CONSTRAINT `fk_domain_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Mensagem Final
-- ============================================

SELECT '✅ Migration 006 - Domínio Próprio (MVP) criada com sucesso!' AS Status;
SELECT '📊 Tabela criada: church_domain_requests' AS Info;

-- Verificar estrutura
DESCRIBE church_domain_requests;
