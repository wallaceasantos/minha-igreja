/**
 * API: Super Admin - Comunicados/Notificações em Massa
 * ============================================
 * Rotas para gerenciar comunicados enviados às igrejas.
 *
 * Rotas:
 * GET    /api/admin/announcements           - Listar todos os comunicados
 * GET    /api/admin/announcements/:id       - Ver detalhes de um comunicado
 * POST   /api/admin/announcements           - Criar novo comunicado
 * PUT    /api/admin/announcements/:id       - Atualizar comunicado
 * DELETE /api/admin/announcements/:id       - Excluir comunicado
 * POST   /api/admin/announcements/:id/send  - Enviar comunicado
 * GET    /api/admin/announcements/stats     - Estatísticas de envio
 * GET    /api/admin/announcements/active    - Comunicados ativos no dashboard
 * POST   /api/admin/announcements/:id/read  - Registrar leitura
 * GET    /api/admin/announcements/:id/readers - Listar quem já leu
 * GET    /api/admin/announcements/:id/live-stats - Estatísticas em tempo real
 */

import express from 'express';
import { getPool } from '../config/database.js';
import { isAdmin } from '../middleware/permissions.js';

const router = express.Router();

/**
 * GET /api/admin/announcements
 * Listar todos os comunicados
 */
router.get('/announcements', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const { page = 1, limit = 20, type, status, priority } = req.query;
    const offset = (page - 1) * limit;

    const whereClauses = [];
    const params = [];

    if (type) {
      whereClauses.push('a.type = ?');
      params.push(type);
    }

    if (status) {
      whereClauses.push('a.status = ?');
      params.push(status);
    }

    if (priority) {
      whereClauses.push('a.priority = ?');
      params.push(priority);
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [announcements] = await pool.query(`
      SELECT
        a.*,
        u.name as creator_name,
        (SELECT COUNT(*) FROM announcement_recipients ar WHERE ar.announcement_id = a.id) as total_recipients,
        (SELECT COUNT(*) FROM announcement_recipients ar WHERE ar.announcement_id = a.id AND ar.status = 'read') as read_count
      FROM announcements a
      LEFT JOIN usuarios_admin u ON a.created_by = u.id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    const [totalResult] = await pool.query(`
      SELECT COUNT(*) as count FROM announcements a ${whereClause}
    `, params);

    const total = Array.isArray(totalResult) ? totalResult[0].count : 0;

    res.json({
      success: true,
      data: {
        announcements: Array.isArray(announcements) ? announcements : [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/announcements/stats
 * Estatísticas de comunicados
 */
router.get('/announcements/stats', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    // Total por status
    const [byStatus] = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM announcements
      GROUP BY status
    `);

    // Total por tipo
    const [byType] = await pool.query(`
      SELECT type, COUNT(*) as count
      FROM announcements
      GROUP BY type
    `);

    // Comunicados ativos
    const [active] = await pool.query(`
      SELECT COUNT(*) as count
      FROM announcements
      WHERE is_active = 1 AND status = 'sent'
      AND (expires_at IS NULL OR expires_at > NOW())
    `);

    // Total de visualizações (últimos 7 dias)
    const [views7days] = await pool.query(`
      SELECT COUNT(*) as count
      FROM announcement_views
      WHERE viewed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // Taxa média de leitura
    const [readRate] = await pool.query(`
      SELECT 
        AVG(
          (SELECT COUNT(*) FROM announcement_recipients WHERE status = 'read') * 100.0 / 
          NULLIF((SELECT COUNT(*) FROM announcement_recipients), 0)
        ) as avg_read_rate
      FROM announcements
      WHERE status = 'sent'
    `);

    res.json({
      success: true,
      data: {
        byStatus: Array.isArray(byStatus) ? byStatus : [],
        byType: Array.isArray(byType) ? byType : [],
        active: Array.isArray(active) ? active[0].count : 0,
        views7days: Array.isArray(views7days) ? views7days[0].count : 0,
        avgReadRate: Array.isArray(readRate) && readRate[0].avg_read_rate ? parseFloat(readRate[0].avg_read_rate) : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching announcements stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/announcements/active
 * Comunicados ativos para mostrar no dashboard
 */
router.get('/announcements/active', async (req, res) => {
  const pool = getPool();

  try {
    const [announcements] = await pool.query(`
      SELECT
        id,
        title,
        message,
        type,
        priority,
        show_on_dashboard,
        show_on_login,
        created_at,
        expires_at
      FROM announcements
      WHERE is_active = 1 
        AND status = 'sent'
        AND show_on_dashboard = 1
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY 
        CASE priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        created_at DESC
    `);

    res.json({
      success: true,
      data: Array.isArray(announcements) ? announcements : [],
    });
  } catch (error) {
    console.error('Error fetching active announcements:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/announcements/:id
 * Ver detalhes de um comunicado
 */
router.get('/announcements/:id', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const announcementId = req.params.id;

    const [announcements] = await pool.query(`
      SELECT
        a.*,
        u.name as creator_name,
        u.email as creator_email
      FROM announcements a
      LEFT JOIN usuarios_admin u ON a.created_by = u.id
      WHERE a.id = ?
    `, [announcementId]);

    if (!Array.isArray(announcements) || announcements.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Comunicado não encontrado',
      });
    }

    const announcement = announcements[0];

    // Buscar estatísticas de recebimento
    const [recipients] = await pool.query(`
      SELECT
        status,
        COUNT(*) as count
      FROM announcement_recipients
      WHERE announcement_id = ?
      GROUP BY status
    `, [announcementId]);

    res.json({
      success: true,
      data: {
        ...announcement,
        recipients: Array.isArray(recipients) ? recipients : [],
      },
    });
  } catch (error) {
    console.error('Error fetching announcement details:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/announcements
 * Criar novo comunicado
 */
router.post('/announcements', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const {
      title,
      message,
      type = 'info',
      priority = 'medium',
      send_method = 'platform',
      target_audience = 'all',
      target_churches = null,
      scheduled_at = null,
      expires_at = null,
      show_on_dashboard = true,
      show_on_login = false,
      require_acknowledgment = false,
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Título e mensagem são obrigatórios',
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO announcements (
        title, message, type, priority, send_method, target_audience,
        target_churches, scheduled_at, expires_at, show_on_dashboard,
        show_on_login, require_acknowledgment, created_by, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title,
      message,
      type,
      priority,
      send_method,
      target_audience,
      target_churches ? JSON.stringify(target_churches) : null,
      scheduled_at,
      expires_at,
      show_on_dashboard ? 1 : 0,
      show_on_login ? 1 : 0,
      require_acknowledgment ? 1 : 0,
      req.userId || null,
      scheduled_at ? 'scheduled' : 'draft',
    ]);

    res.json({
      success: true,
      message: 'Comunicado criado com sucesso!',
      announcement_id: result.insertId,
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/admin/announcements/:id
 * Atualizar comunicado
 */
router.put('/announcements/:id', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const announcementId = req.params.id;
    const {
      title,
      message,
      type,
      priority,
      send_method,
      target_audience,
      target_churches,
      expires_at,
      show_on_dashboard,
      show_on_login,
      require_acknowledgment,
      is_active,
    } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM announcements WHERE id = ?',
      [announcementId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Comunicado não encontrado',
      });
    }

    await pool.execute(`
      UPDATE announcements SET
        title = ?,
        message = ?,
        type = ?,
        priority = ?,
        send_method = ?,
        target_audience = ?,
        target_churches = ?,
        expires_at = ?,
        show_on_dashboard = ?,
        show_on_login = ?,
        require_acknowledgment = ?,
        is_active = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [
      title,
      message,
      type,
      priority,
      send_method,
      target_audience,
      target_churches ? JSON.stringify(target_churches) : null,
      expires_at,
      show_on_dashboard ? 1 : 0,
      show_on_login ? 1 : 0,
      require_acknowledgment ? 1 : 0,
      is_active ? 1 : 0,
      announcementId,
    ]);

    res.json({
      success: true,
      message: 'Comunicado atualizado com sucesso!',
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/admin/announcements/:id
 * Excluir comunicado
 */
router.delete('/announcements/:id', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const announcementId = req.params.id;

    const [existing] = await pool.query(
      'SELECT status FROM announcements WHERE id = ?',
      [announcementId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Comunicado não encontrado',
      });
    }

    // Se já foi enviado, não pode excluir, apenas cancelar
    if (existing[0].status === 'sent') {
      return res.status(400).json({
        success: false,
        error: 'Comunicado já enviado não pode ser excluído. Use o status "cancelled".',
      });
    }

    await pool.execute('DELETE FROM announcements WHERE id = ?', [announcementId]);

    res.json({
      success: true,
      message: 'Comunicado excluído com sucesso!',
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/announcements/:id/send
 * Enviar comunicado
 */
router.post('/announcements/:id/send', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const announcementId = req.params.id;

    // Buscar comunicado
    const [announcements] = await pool.query(
      'SELECT * FROM announcements WHERE id = ?',
      [announcementId]
    );

    if (!Array.isArray(announcements) || announcements.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Comunicado não encontrado',
      });
    }

    const announcement = announcements[0];

    // Verificar se já foi enviado
    if (announcement.status === 'sent') {
      return res.status(400).json({
        success: false,
        error: 'Comunicado já foi enviado',
      });
    }

    // Determinar igrejas alvo
    let churchIds = [];

    if (announcement.target_audience === 'all') {
      const [allChurches] = await pool.query('SELECT id FROM churches WHERE is_active = 1');
      churchIds = allChurches.map((c) => c.id);
    } else if (announcement.target_audience === 'specific' && announcement.target_churches) {
      churchIds = JSON.parse(announcement.target_churches);
    } else {
      const [filteredChurches] = await pool.query(
        'SELECT id FROM churches WHERE is_active = 1 AND plan_type = ?',
        [announcement.target_audience]
      );
      churchIds = filteredChurches.map((c) => c.id);
    }

    // Inserir registros de recebimento
    if (churchIds.length > 0) {
      const values = churchIds.map(churchId => 
        `(${announcementId}, ${churchId}, 'sent', NOW())`
      ).join(',');

      await pool.query(`
        INSERT INTO announcement_recipients (announcement_id, church_id, status, sent_at)
        VALUES ${values}
      `);
    }

    // Atualizar status do comunicado
    await pool.execute(`
      UPDATE announcements SET
        status = 'sent',
        sent_at = NOW()
      WHERE id = ?
    `, [announcementId]);

    // TODO: Enviar emails se send_method for 'email' ou 'both'
    // Isso requer integração com serviço de email (SendGrid, AWS SES, etc.)

    res.json({
      success: true,
      message: `Comunicado enviado para ${churchIds.length} igreja(s)!`,
      recipients_count: churchIds.length,
    });
  } catch (error) {
    console.error('Error sending announcement:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/announcements/:id/read
 * Registrar leitura de comunicado (para igrejas)
 */
router.post('/announcements/:id/read', async (req, res) => {
  const pool = getPool();

  try {
    const announcementId = req.params.id;
    const { church_id, user_id, ip_address } = req.body;

    console.log('📩 POST /api/admin/announcements/:id/read - Dados recebidos:', {
      announcementId,
      church_id,
      user_id,
      ip_address
    });

    if (!church_id) {
      console.error('❌ church_id não fornecido');
      return res.status(400).json({
        success: false,
        error: 'church_id é obrigatório',
      });
    }

    // Verificar se o recipient existe
    const [recipients] = await pool.query(
      'SELECT id, status FROM announcement_recipients WHERE announcement_id = ? AND church_id = ?',
      [announcementId, church_id]
    );

    console.log('🔍 Recipients encontrados:', recipients);

    if (recipients.length === 0) {
      console.warn('⚠️ Recipient não encontrado, criando agora...');
      // Criar recipient se não existir (caso o envio tenha falhado)
      await pool.execute(`
        INSERT INTO announcement_recipients (announcement_id, church_id, status, sent_at)
        VALUES (?, ?, 'sent', NOW())
      `, [announcementId, church_id]);
    }

    // Verificar se já foi registrado na tabela de views
    const [existing] = await pool.query(
      'SELECT id FROM announcement_views WHERE announcement_id = ? AND church_id = ?',
      [announcementId, church_id]
    );

    console.log('🔍 existing:', existing.length > 0 ? 'Já registrado' : 'Não registrado');

    if (existing.length === 0) {
      // Registrar visualização
      // Se user_id for null, inserir apenas church_id
      const [viewResult] = user_id 
        ? await pool.execute(`
          INSERT INTO announcement_views (announcement_id, user_id, church_id, viewed_at, ip_address)
          VALUES (?, ?, ?, NOW(), ?)
        `, [announcementId, user_id, church_id, ip_address || null])
        : await pool.execute(`
          INSERT INTO announcement_views (announcement_id, church_id, viewed_at, ip_address)
          VALUES (?, ?, NOW(), ?)
        `, [announcementId, church_id, ip_address || null]);
      console.log('✅ announcement_views inserido:', viewResult);
    }

    // Atualizar status do recipient para 'read'
    const [updateResult] = await pool.execute(`
      UPDATE announcement_recipients SET
        status = 'read',
        read_at = NOW()
      WHERE announcement_id = ? AND church_id = ?
    `, [announcementId, church_id]);

    console.log('✅ announcement_recipients atualizado:', updateResult.affectedRows, 'linhas afetadas');

    res.json({
      success: true,
      message: 'Leitura registrada!',
      affectedRows: updateResult.affectedRows,
    });
  } catch (error) {
    console.error('❌ Error registering announcement read:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/announcements/:id/readers
 * Listar igrejas que já leram o comunicado
 */
router.get('/announcements/:id/readers', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const announcementId = req.params.id;

    const [readers] = await pool.query(`
      SELECT
        c.id as church_id,
        c.name as church_name,
        c.slug as church_slug,
        ar.status,
        ar.sent_at,
        ar.read_at,
        ar.acknowledged_at,
        u.name as user_name,
        u.email as user_email
      FROM announcement_recipients ar
      LEFT JOIN churches c ON ar.church_id = c.id
      LEFT JOIN announcement_views av ON ar.announcement_id = av.announcement_id AND ar.church_id = av.church_id
      LEFT JOIN usuarios_admin u ON av.user_id = u.id
      WHERE ar.announcement_id = ?
      ORDER BY ar.read_at DESC
    `, [announcementId]);

    res.json({
      success: true,
      data: Array.isArray(readers) ? readers : [],
    });
  } catch (error) {
    console.error('Error fetching readers:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/announcements/:id/live-stats
 * Estatísticas em tempo real de leitura
 */
router.get('/announcements/:id/live-stats', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const announcementId = req.params.id;

    // Total de recipients
    const [total] = await pool.query(`
      SELECT COUNT(*) as count
      FROM announcement_recipients
      WHERE announcement_id = ?
    `, [announcementId]);

    // Lidos
    const [read] = await pool.query(`
      SELECT COUNT(*) as count
      FROM announcement_recipients
      WHERE announcement_id = ? AND status = 'read'
    `, [announcementId]);

    // Confirmados (se requer confirmação)
    const [acknowledged] = await pool.query(`
      SELECT COUNT(*) as count
      FROM announcement_recipients
      WHERE announcement_id = ? AND status = 'acknowledged'
    `, [announcementId]);

    // Não lidos
    const [unread] = await pool.query(`
      SELECT COUNT(*) as count
      FROM announcement_recipients
      WHERE announcement_id = ? AND status = 'sent'
    `, [announcementId]);

    // Leituras por hora (últimas 24h)
    const [readsPerHour] = await pool.query(`
      SELECT
        HOUR(read_at) as hour,
        COUNT(*) as count
      FROM announcement_recipients
      WHERE announcement_id = ? AND read_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY HOUR(read_at)
      ORDER BY hour ASC
    `, [announcementId]);

    // Últimas leituras
    const [recentReads] = await pool.query(`
      SELECT
        c.name as church_name,
        ar.read_at,
        u.name as user_name
      FROM announcement_recipients ar
      LEFT JOIN churches c ON ar.church_id = c.id
      LEFT JOIN announcement_views av ON ar.announcement_id = av.announcement_id AND ar.church_id = av.church_id
      LEFT JOIN usuarios_admin u ON av.user_id = u.id
      WHERE ar.announcement_id = ? AND ar.status = 'read'
      ORDER BY ar.read_at DESC
      LIMIT 10
    `, [announcementId]);

    res.json({
      success: true,
      data: {
        total: Array.isArray(total) ? total[0].count : 0,
        read: Array.isArray(read) ? read[0].count : 0,
        acknowledged: Array.isArray(acknowledged) ? acknowledged[0].count : 0,
        unread: Array.isArray(unread) ? unread[0].count : 0,
        readsPerHour: Array.isArray(readsPerHour) ? readsPerHour : [],
        recentReads: Array.isArray(recentReads) ? recentReads : [],
        readRate: Array.isArray(total) && total[0].count > 0
          ? ((Array.isArray(read) ? read[0].count : 0) / total[0].count * 100).toFixed(1)
          : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching live stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
