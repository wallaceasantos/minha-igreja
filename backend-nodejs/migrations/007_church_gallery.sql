-- ============================================
-- Migration 007: Galeria de Imagens da Igreja
-- ============================================
-- Data: 19/04/2026
-- Descrição: Adiciona suporte a galeria de imagens para o site público

USE jesus_vitoria_connect;

-- ============================================
-- 1. Criar tabela church_gallery
-- ============================================

CREATE TABLE IF NOT EXISTS `church_gallery` (
  `id` int NOT NULL AUTO_INCREMENT,
  `church_id` int NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `description` text,
  `display_order` int DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `uploaded_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_gallery_church` (`church_id`),
  KEY `idx_gallery_order` (`display_order`),
  KEY `idx_gallery_active` (`is_active`),
  CONSTRAINT `fk_gallery_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. Adicionar coluna no churches para foto de capa
-- ============================================

-- Verificar se a coluna já existe antes de adicionar
SET @column_exists = (
  SELECT COUNT(*) 
  FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = 'jesus_vitoria_connect' 
    AND TABLE_NAME = 'churches' 
    AND COLUMN_NAME = 'cover_image_url'
);

SET @sql = IF(@column_exists = 0,
  'ALTER TABLE `churches` ADD COLUMN `cover_image_url` varchar(500) DEFAULT NULL AFTER `hero_image_url`',
  'SELECT "Coluna cover_image_url já existe" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Mensagem Final
-- ============================================

SELECT '✅ Migration 007 - Galeria de Imagens criada com sucesso!' AS Status;
SELECT '📊 Tabela criada: church_gallery' AS Info;
SELECT '📊 Coluna adicionada: churches.cover_image_url' AS Info;

-- Verificar estrutura
DESCRIBE church_gallery;
