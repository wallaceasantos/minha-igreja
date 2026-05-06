-- ============================================
-- Migration 010: Avaliações de Clientes
-- ============================================
-- Data: 19/04/2026
-- Descrição: Tabela para armazenar avaliações da plataforma pelos pastores

USE jesus_vitoria_connect;

-- ============================================
-- 1. Criar tabela church_reviews
-- ============================================

CREATE TABLE IF NOT EXISTS `church_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `church_id` int NOT NULL,
  `pastor_name` varchar(255) NOT NULL,
  `church_name` varchar(255) NOT NULL,
  `rating` int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  `comment` text NOT NULL,
  `is_published` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_church` (`church_id`),
  KEY `idx_published` (`is_published`),
  CONSTRAINT `fk_review_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. Inserir depoimentos de exemplo (se a tabela estiver vazia)
-- ============================================

INSERT INTO `church_reviews` (`church_id`, `pastor_name`, `church_name`, `rating`, `comment`, `is_published`)
SELECT 16, 'Pr. João Silva', 'Primeira Igreja Batista', 5, 'O MinhaIgreja transformou nossa comunicação. Os membros estão mais engajados e os pedidos de oração chegam até nós de forma organizada.', 1
WHERE NOT EXISTS (SELECT 1 FROM church_reviews LIMIT 1);

INSERT INTO `church_reviews` (`church_id`, `pastor_name`, `church_name`, `rating`, `comment`, `is_published`)
SELECT 16, 'Pr. Maria Santos', 'Igreja Assembleia de Deus', 5, 'Fácil de usar e completo. Em menos de 1 hora tínhamos nosso site no ar. O suporte é excelente!', 1
WHERE NOT EXISTS (SELECT 1 FROM church_reviews WHERE pastor_name = 'Pr. Maria Santos' LIMIT 1);

INSERT INTO `church_reviews` (`church_id`, `pastor_name`, `church_name`, `rating`, `comment`, `is_published`)
SELECT 16, 'Pr. José Oliveira', 'Igreja do Nazareno', 5, 'O módulo de dízimos e ofertas foi um divisor de águas. A transparência aumentou e os membros se sentem mais seguros.', 1
WHERE NOT EXISTS (SELECT 1 FROM church_reviews WHERE pastor_name = 'Pr. José Oliveira' LIMIT 1);

-- ============================================
-- Mensagem Final
-- ============================================

SELECT '✅ Migration 010 - Avaliações de Clientes criada com sucesso!' AS Status;
SELECT '📊 Tabela criada: church_reviews' AS Info;
SELECT '📝 3 depoimentos de exemplo inseridos' AS Info;

-- Verificar estrutura
DESCRIBE church_reviews;
