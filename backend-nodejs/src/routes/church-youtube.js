/**
 * Church YouTube Settings Routes
 * ================================
 * Permite que cada igreja configure sua propria API Key do YouTube
 * Assim, cada igreja tem sua propria cota de uso (10.000 unidades/dia)
 */

import express from 'express';
import { getPool } from '../config/database.js';

const router = express.Router();

// Middleware simples para pegar churchId do header x-church-id
const authChurch = (req, res, next) => {
  const churchId = parseInt(req.headers['x-church-id']);
  if (!churchId) {
    return res.status(401).json({ success: false, error: 'Church ID required (header x-church-id)' });
  }
  req.churchId = churchId;
  next();
};

// GET /api/church/youtube-settings - Obter configuracoes de YouTube da igreja
router.get('/youtube-settings', authChurch, async (req, res) => {
  try {
    const pool = getPool();
    const [settings] = await pool.query(
      'SELECT * FROM church_youtube_settings WHERE church_id = ? LIMIT 1',
      [req.churchId]
    );

    // Se nao existe configuracao, retorna vazio
    if (!settings.length) {
      return res.json({
        success: true,
        data: {
          youtube_api_key: null,
          youtube_channel_id: null,
          is_connected: false,
          connected_at: null,
        }
      });
    }

    // Mascarar chaves sensiveis para seguranca
    const s = settings[0];
    const maskedKey = s.youtube_api_key
      ? s.youtube_api_key.substring(0, 6) + '...' + s.youtube_api_key.substring(s.youtube_api_key.length - 4)
      : null;
    const maskedSecret = s.youtube_client_secret
      ? s.youtube_client_secret.substring(0, 4) + '...' + s.youtube_client_secret.substring(s.youtube_client_secret.length - 4)
      : null;

    res.json({
      success: true,
      data: {
        youtube_api_key: maskedKey,
        youtube_api_key_full: s.youtube_api_key,
        youtube_channel_id: s.youtube_channel_id,
        is_connected: s.is_connected,
        connected_at: s.connected_at,
        last_validated_at: s.last_validated_at,
        // OAuth fields (opcional)
        youtube_client_id: s.youtube_client_id || null,
        youtube_client_secret: maskedSecret,
        youtube_client_secret_full: s.youtube_client_secret || null,
        oauth_connected: s.oauth_connected,
      }
    });
  } catch (error) {
    console.error('Error fetching YouTube settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/church/youtube-settings - Salvar configuracoes de YouTube
router.put('/youtube-settings', authChurch, async (req, res) => {
  try {
    const { youtube_api_key, youtube_channel_id, youtube_client_id, youtube_client_secret } = req.body;

    if (!youtube_api_key) {
      return res.status(400).json({ success: false, error: 'API Key e obrigatoria' });
    }

    if (!youtube_api_key.startsWith('AIza')) {
      return res.status(400).json({ success: false, error: 'Formato de API Key invalido. Deve comecar com AIza' });
    }

    // Testar a API Key com uma chamada real ao YouTube
    let isValid = false;
    let channelId = youtube_channel_id;

    try {
      const testUrl = `https://www.googleapis.com/youtube/v3/channels?part=id&mine=true&key=${youtube_api_key}`;
      const response = await fetch(testUrl);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        isValid = true;
        if (!channelId) {
          channelId = data.items[0].id;
        }
      } else if (data.error) {
        return res.status(400).json({
          success: false,
          error: `API Key invalida: ${data.error.message}`,
        });
      }
    } catch (apiError) {
      return res.status(400).json({
        success: false,
        error: `Nao foi possivel validar a API Key: ${apiError.message}`,
      });
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Nao foi possivel validar a API Key. Verifique se a YouTube Data API v3 esta ativada.',
      });
    }

    // Verificar se OAuth foi fornecido (opcional)
    const hasOAuth = youtube_client_id && youtube_client_secret;

    // Salvar no banco (UPSERT)
    const pool = getPool();
    await pool.query(
      `INSERT INTO church_youtube_settings
       (church_id, youtube_api_key, youtube_channel_id, youtube_client_id, youtube_client_secret,
        is_connected, oauth_connected, connected_at, last_validated_at)
       VALUES (?, ?, ?, ?, ?, 1, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
         youtube_api_key = VALUES(youtube_api_key),
         youtube_channel_id = VALUES(youtube_channel_id),
         youtube_client_id = IFNULL(VALUES(youtube_client_id), youtube_client_id),
         youtube_client_secret = IFNULL(VALUES(youtube_client_secret), youtube_client_secret),
         is_connected = 1,
         oauth_connected = VALUES(oauth_connected),
         last_validated_at = NOW()`,
      [
        req.churchId,
        youtube_api_key,
        channelId,
        youtube_client_id || null,
        youtube_client_secret || null,
        hasOAuth ? 1 : 0,
      ]
    );

    res.json({
      success: true,
      message: 'API Key do YouTube configurada com sucesso!' + (hasOAuth ? ' OAuth tambem configurado.' : ''),
      data: { is_connected: true, youtube_channel_id: channelId, oauth_connected: hasOAuth }
    });
  } catch (error) {
    console.error('Error saving YouTube settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/church/youtube-settings - Remover configuracoes de YouTube
router.delete('/youtube-settings', authChurch, async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('DELETE FROM church_youtube_settings WHERE church_id = ?', [req.churchId]);

    res.json({ success: true, message: 'Configuracao de YouTube removida!' });
  } catch (error) {
    console.error('Error deleting YouTube settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
