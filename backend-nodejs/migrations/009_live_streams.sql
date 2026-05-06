-- ============================================
-- Migration 009: Transmissões Ao Vivo
-- ============================================
-- Data: 19/04/2026
-- Descrição: Adiciona suporte a transmissões ao vivo (YouTube Live)

USE jesus_vitoria_connect;

-- ============================================
-- 1. Criar tabela church_live_streams
-- ============================================

CREATE TABLE IF NOT EXISTS `church_live_streams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `church_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  
  -- URLs das plataformas
  `youtube_video_id` varchar(50) DEFAULT NULL,
  `youtube_url` varchar(500) DEFAULT NULL,
  `facebook_url` varchar(500) DEFAULT NULL,
  `instagram_url` varchar(500) DEFAULT NULL,
  `twitch_url` varchar(500) DEFAULT NULL,
  
  -- Plataforma principal (usada no player)
  `primary_platform` enum('youtube', 'facebook', 'instagram', 'twitch') DEFAULT 'youtube',
  
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `scheduled_start` datetime DEFAULT NULL,
  `actual_start` datetime DEFAULT NULL,
  `actual_end` datetime DEFAULT NULL,
  `status` enum('scheduled', 'live', 'ended', 'cancelled') DEFAULT 'scheduled',
  `is_active` tinyint(1) DEFAULT 1,
  `view_count` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_live_church` (`church_id`),
  KEY `idx_live_status` (`status`),
  KEY `idx_live_scheduled` (`scheduled_start`),
  CONSTRAINT `fk_live_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Mensagem Final
-- ============================================

SELECT '✅ Migration 009 - Transmissões Ao Vivo criada com sucesso!' AS Status;
SELECT '📊 Tabela criada: church_live_streams' AS Info;

-- Verificar estrutura
DESCRIBE church_live_streams;
