-- Tabela para configuracoes de YouTube por igreja
-- Permite que cada pastor use sua propria API Key do YouTube
-- Assim, cada igreja tem sua propria cota de uso e nao depende do desenvolvedor
-- Campos OAuth opcionais para funcionalidades futuras (upload, criacao de lives)

CREATE TABLE IF NOT EXISTS church_youtube_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  church_id INT NOT NULL,
  youtube_api_key VARCHAR(255) DEFAULT NULL COMMENT 'API Key do YouTube Data API v3 do pastor',
  youtube_channel_id VARCHAR(100) DEFAULT NULL COMMENT 'ID do canal do YouTube',
  is_connected BOOLEAN DEFAULT FALSE COMMENT 'Se a API key foi testada e validada',
  connected_at DATETIME DEFAULT NULL,
  last_validated_at DATETIME DEFAULT NULL,
  -- Campos OAuth opcionais (para funcionalidades futuras)
  youtube_client_id VARCHAR(255) DEFAULT NULL COMMENT 'OAuth Client ID para acesso ao canal',
  youtube_client_secret VARCHAR(255) DEFAULT NULL COMMENT 'OAuth Client Secret para acesso ao canal',
  youtube_access_token TEXT DEFAULT NULL COMMENT 'OAuth Access Token (renovado automaticamente)',
  youtube_refresh_token TEXT DEFAULT NULL COMMENT 'OAuth Refresh Token',
  youtube_token_expires_at DATETIME DEFAULT NULL COMMENT 'Quando o access token expira',
  oauth_connected BOOLEAN DEFAULT FALSE COMMENT 'Se OAuth foi configurado com sucesso',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY idx_church (church_id),
  FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Configuracoes de YouTube por igreja (API Key propria + OAuth opcional)';
