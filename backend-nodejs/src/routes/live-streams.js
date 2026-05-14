/**
 * API: Live Streams - Transmissões Ao Vivo
 * ============================================
 * Rotas para gerenciar lives do YouTube
 *
 * Rotas:
 * GET    /api/church/:churchId/live-streams       - Listar transmissões
 * POST   /api/church/admin/live-streams           - Criar transmissão
 * PUT    /api/church/admin/live-streams/:id       - Atualizar transmissão
 * DELETE /api/church/admin/live-streams/:id       - Deletar transmissão
 */

import express from 'express';
import { getPool } from '../config/database.js';
import { identifyChurch } from '../middleware/planLimits.js';

const router = express.Router();

/**
 * GET /api/church/:churchId/live-streams
 * Listar transmissões (público)
 */
router.get('/:churchId/live-streams', async (req, res) => {
  try {
    const churchId = req.params.churchId;
    const pool = getPool();

    const [streams] = await pool.query(`
      SELECT * FROM church_live_streams
      WHERE church_id = ? AND is_active = 1
      ORDER BY scheduled_start DESC
    `, [churchId]);

    res.json({
      success: true,
      data: Array.isArray(streams) ? streams : [],
    });
  } catch (error) {
    console.error('Error fetching live streams:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/church/admin/live-streams
 * Criar transmissão (Admin)
 */
router.post('/admin/live-streams', identifyChurch, async (req, res) => {
  try {
    const churchId = req.headers['x-church-id'] || req.body.church_id;
    const {
      title,
      description,
      youtube_url,
      youtube_video_id,
      facebook_url,
      instagram_url,
      twitch_url,
      primary_platform,
      scheduled_start,
      status,
    } = req.body;

    const pool = getPool();

    const [result] = await pool.execute(`
      INSERT INTO church_live_streams
      (church_id, title, description, youtube_url, youtube_video_id, facebook_url, instagram_url, twitch_url, primary_platform, scheduled_start, status, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      churchId,
      title,
      description || null,
      youtube_url || null,
      youtube_video_id || null,
      facebook_url || null,
      instagram_url || null,
      twitch_url || null,
      primary_platform || 'youtube',
      scheduled_start || null,
      status || 'scheduled',
    ]);

    res.json({
      success: true,
      message: 'Transmissão cadastrada com sucesso!',
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error('Error creating live stream:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/church/admin/live-streams/:id
 * Atualizar transmissão (Admin)
 */
router.put('/admin/live-streams/:id', identifyChurch, async (req, res) => {
  try {
    const streamId = req.params.id;
    const {
      title,
      description,
      youtube_url,
      youtube_video_id,
      facebook_url,
      instagram_url,
      twitch_url,
      primary_platform,
      scheduled_start,
      status,
      is_active,
    } = req.body;

    const pool = getPool();

    // Se o status está mudando para 'live', limpamos o chat antigo
    if (status === 'live') {
      await pool.query('DELETE FROM live_chat_messages WHERE live_stream_id = ?', [streamId]);
    }

    await pool.execute(`
      UPDATE church_live_streams
      SET title = ?, description = ?, youtube_url = ?, youtube_video_id = ?,
          facebook_url = ?, instagram_url = ?, twitch_url = ?, primary_platform = ?,
          scheduled_start = ?, status = ?, is_active = ?
      WHERE id = ?
    `, [
      title,
      description,
      youtube_url,
      youtube_video_id,
      facebook_url,
      instagram_url,
      twitch_url,
      primary_platform,
      scheduled_start,
      status,
      is_active !== undefined ? is_active : 1,
      streamId,
    ]);

    res.json({
      success: true,
      message: 'Transmissão atualizada com sucesso!',
    });
  } catch (error) {
    console.error('Error updating live stream:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/church/admin/live-streams/:id
 * Deletar transmissão (Admin)
 */
router.delete('/admin/live-streams/:id', async (req, res) => {
  try {
    const streamId = req.params.id;
    const pool = getPool();

    // First delete related notifications
    await pool.execute('DELETE FROM live_notifications WHERE live_stream_id = ?', [streamId]);

    // Then delete the stream
    await pool.execute('DELETE FROM church_live_streams WHERE id = ?', [streamId]);

    res.json({
      success: true,
      message: 'Transmissão excluída com sucesso!',
    });
  } catch (error) {
    console.error('Error deleting live stream:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao excluir transmissão',
    });
  }
});


/**
 * GET /api/church/slug/:slug/live-streams
 * Listar transmissões por slug da igreja (público)
 */
router.get('/slug/:slug/live-streams', async (req, res) => {
  try {
    const { slug } = req.params;
    const pool = getPool();

    // Buscar church_id pelo slug
    const [churches] = await pool.query(
      'SELECT id FROM churches WHERE slug = ? AND is_active = 1 LIMIT 1',
      [slug]
    );

    if (!Array.isArray(churches) || churches.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Igreja não encontrada',
      });
    }

    const churchId = churches[0].id;

    // Buscar lives ativas E encerradas (para lista de anteriores)
    const [streams] = await pool.query(`
      SELECT * FROM church_live_streams
      WHERE church_id = ? AND (is_active = 1 OR status = 'ended')
      ORDER BY 
        CASE status 
          WHEN 'live' THEN 1 
          WHEN 'scheduled' THEN 2 
          ELSE 3 
        END,
        scheduled_start DESC
    `, [churchId]);

    res.json({
      success: true,
      data: Array.isArray(streams) ? streams : [],
    });
  } catch (error) {
    console.error('Error fetching live streams by slug:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
