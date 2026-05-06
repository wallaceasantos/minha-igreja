/**
 * API: Super Admin - Gerenciamento de Igrejas
 * GET    /api/admin/churches - Listar igrejas
 * GET    /api/admin/churches/:id - Ver igreja
 * PUT    /api/admin/churches/:id - Editar igreja
 * DELETE /api/admin/churches/:id - Excluir igreja
 * POST   /api/admin/churches/:id/plans - Mudar plano
 * POST   /api/admin/churches/:id/suspend - Suspender igreja
 * POST   /api/admin/churches/:id/reactivate - Reativar igreja
 * POST   /api/super-admin/upgrade-request - Solicitar upgrade (pastor)
 */

import express from 'express';
import { getPool } from '../config/database.js';
import { isAdmin } from '../middleware/permissions.js';
import { logAudit, AuditActions, extractDetails } from '../middleware/auditLog.js';

const router = express.Router();

/**
 * GET /api/admin/churches
 * Listar todas igrejas com filtros e paginação
 */
router.get('/churches', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      plan = '',
      status = '',
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    // Construir query com filtros
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ? OR slug LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (plan) {
      whereClause += ' AND plan_type = ?';
      params.push(plan);
    }

    if (status) {
      if (status === 'active') {
        whereClause += ' AND is_active = 1';
      } else if (status === 'inactive') {
        whereClause += ' AND is_active = 0';
      } else if (status === 'trial') {
        whereClause += ' AND plan_type = "free" AND trial_end_date >= NOW()';
      }
    }

    // Buscar igrejas
    const [churches] = await pool.query(`
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM church_members cm WHERE cm.church_id = c.id) as member_count,
        (SELECT COUNT(*) FROM usuarios_admin ua WHERE ua.church_id = c.id) as admin_count,
        (SELECT COUNT(*) FROM subscriptions_payments sp WHERE sp.church_id = c.id AND sp.status = 'overdue') as overdue_payments
      FROM churches c
      ${whereClause}
      ORDER BY ${sort} ${order}
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    // Contar total
    const [totalResult] = await pool.query(`
      SELECT COUNT(*) as count FROM churches ${whereClause}
    `, params);

    const total = Array.isArray(totalResult) ? totalResult[0].count : 0;

    res.json({
      success: true,
      data: {
        churches: Array.isArray(churches) ? churches : [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching churches:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/admin/churches/:id
 * Ver detalhes de uma igreja
 */
router.get('/churches/:id', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const churchId = req.params.id;

    const [churches] = await pool.query(
      'SELECT * FROM churches WHERE id = ? LIMIT 1',
      [churchId]
    );

    if (churches.length === 0) {
      return res.status(404).json({ success: false, error: 'Igreja não encontrada' });
    }

    const church = churches[0];

    // Buscar stats adicionais
    const [membersResult] = await pool.query(
      'SELECT COUNT(*) as count FROM church_members WHERE church_id = ?',
      [churchId]
    );

    const [admins] = await pool.query(
      'SELECT * FROM usuarios_admin WHERE church_id = ?',
      [churchId]
    );

    const [subscriptions] = await pool.query(
      'SELECT * FROM subscriptions WHERE church_id = ? LIMIT 1',
      [churchId]
    );

    // Extrair contagem de membros corretamente
    const membersCount = Array.isArray(membersResult) && membersResult.length > 0 
      ? (membersResult[0]?.count || membersResult[0]?.[0]?.count || 0) 
      : 0;

    console.log('📊 Church stats - membersResult:', membersResult, 'membersCount:', membersCount);

    res.json({
      success: true,
      data: {
        ...church,
        stats: {
          members: membersCount,
          admins: Array.isArray(admins) ? admins.length : 0,
        },
        subscription: Array.isArray(subscriptions) ? subscriptions[0] : null,
      },
    });
  } catch (error) {
    console.error('Error fetching church:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/admin/churches/:id
 * Editar dados de uma igreja
 */
router.put('/churches/:id', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const churchId = req.params.id;
    const {
      name,
      slug,
      email,
      phone,
      whatsapp,
      address_street,
      address_number,
      address_neighborhood,
      address_city,
      address_state,
      address_zip,
      facebook_url,
      instagram_url,
      youtube_url,
      theme_primary_color,
      theme_secondary_color,
    } = req.body;

    // Verificar se igreja existe
    const [existing] = await pool.query(
      'SELECT id FROM churches WHERE id = ?',
      [churchId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Igreja não encontrada' });
    }

    // Atualizar
    await pool.execute(`
      UPDATE churches SET
        name = ?,
        slug = ?,
        email = ?,
        phone = ?,
        whatsapp = ?,
        address_street = ?,
        address_number = ?,
        address_neighborhood = ?,
        address_city = ?,
        address_state = ?,
        address_zip = ?,
        facebook_url = ?,
        instagram_url = ?,
        youtube_url = ?,
        theme_primary_color = ?,
        theme_secondary_color = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [
      name,
      slug,
      email,
      phone,
      whatsapp,
      address_street,
      address_number,
      address_neighborhood,
      address_city,
      address_state,
      address_zip,
      facebook_url,
      instagram_url,
      youtube_url,
      theme_primary_color,
      theme_secondary_color,
      churchId,
    ]);

    // Log de auditoria
    await logAudit({
      action: AuditActions.CHURCH_UPDATED,
      userId: req.userId || req.headers['x-user-id'],
      churchId,
      details: extractDetails(req, { success: true }, ['name', 'slug', 'email', 'plan_type']),
      ipAddress: req.ip || req.headers['x-forwarded-for'],
    });

    res.json({
      success: true,
      message: 'Igreja atualizada com sucesso!',
    });
  } catch (error) {
    console.error('Error updating church:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/churches/:id/plans
 * Mudar plano de uma igreja
 */
router.post('/churches/:id/plans', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const churchId = req.params.id;
    const { plan_type, reason } = req.body;

    if (!plan_type || !['free', 'essencial', 'premium', 'enterprise'].includes(plan_type)) {
      return res.status(400).json({
        success: false,
        error: 'Plano inválido'
      });
    }

    // Atualizar plano na tabela churches
    await pool.execute(
      'UPDATE churches SET plan_type = ?, updated_at = NOW() WHERE id = ?',
      [plan_type, churchId]
    );

    // Atualizar assinatura
    await pool.execute(`
      UPDATE subscriptions SET
        plan_type = ?,
        updated_at = NOW()
      WHERE church_id = ?
    `, [plan_type, churchId]);

    // Log de auditoria
    await logAudit({
      action: AuditActions.CHURCH_PLAN_CHANGED,
      userId: req.userId || req.headers['x-user-id'],
      churchId,
      details: JSON.stringify({ plan_type, reason: reason || 'Admin' }),
      ipAddress: req.ip || req.headers['x-forwarded-for'],
    });

    res.json({
      success: true,
      message: `Plano alterado para ${plan_type} com sucesso!`,
    });
  } catch (error) {
    console.error('Error changing plan:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/churches/:id/suspend
 * Suspender igreja
 */
router.post('/churches/:id/suspend', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const churchId = req.params.id;
    const { reason } = req.body;

    // Suspender igreja
    await pool.execute(
      'UPDATE churches SET is_active = 0, updated_at = NOW() WHERE id = ?',
      [churchId]
    );

    // Log de auditoria
    await logAudit({
      action: AuditActions.CHURCH_SUSPENDED,
      userId: req.userId || req.headers['x-user-id'],
      churchId,
      details: JSON.stringify({ reason: reason || 'Não informado' }),
      ipAddress: req.ip || req.headers['x-forwarded-for'],
    });

    res.json({
      success: true,
      message: 'Igreja suspensa com sucesso!',
    });
  } catch (error) {
    console.error('Error suspending church:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/churches/:id/reactivate
 * Reativar igreja
 */
router.post('/churches/:id/reactivate', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const churchId = req.params.id;

    // Reativar igreja
    await pool.execute(
      'UPDATE churches SET is_active = 1, updated_at = NOW() WHERE id = ?',
      [churchId]
    );

    // Log de auditoria
    await logAudit({
      action: AuditActions.CHURCH_REACTIVATED,
      userId: req.userId || req.headers['x-user-id'],
      churchId,
      details: JSON.stringify({ action: 'Igreja reativada' }),
      ipAddress: req.ip || req.headers['x-forwarded-for'],
    });

    res.json({
      success: true,
      message: 'Igreja reativada com sucesso!',
    });
  } catch (error) {
    console.error('Error reactivating church:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/admin/churches/:id
 * Excluir igreja (apenas se nunca teve atividade)
 */
router.delete('/churches/:id', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const churchId = req.params.id;

    // Verificar se tem atividade
    const [members] = await pool.query(
      'SELECT COUNT(*) as count FROM church_members WHERE church_id = ?',
      [churchId]
    );

    const [payments] = await pool.query(
      'SELECT COUNT(*) as count FROM subscriptions_payments WHERE church_id = ?',
      [churchId]
    );

    if (Array.isArray(members[0]) && members[0][0].count > 0) {
      return res.status(400).json({
        success: false,
        error: 'Igreja tem membros cadastrados. Não pode ser excluída.'
      });
    }

    if (Array.isArray(payments[0]) && payments[0][0].count > 0) {
      return res.status(400).json({
        success: false,
        error: 'Igreja tem histórico de pagamentos. Não pode ser excluída.'
      });
    }

    // Excluir
    await pool.execute('DELETE FROM churches WHERE id = ?', [churchId]);

    // Log de auditoria
    await logAudit({
      action: AuditActions.CHURCH_DELETED,
      userId: req.userId || req.headers['x-user-id'],
      churchId,
      details: JSON.stringify({ action: 'Igreja excluída' }),
      ipAddress: req.ip || req.headers['x-forwarded-for'],
    });

    res.json({
      success: true,
      message: 'Igreja excluída com sucesso!',
    });
  } catch (error) {
    console.error('Error deleting church:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/super-admin/upgrade-request
 * Solicitar upgrade de plano (pastor)
 */
router.post('/super-admin/upgrade-request', async (req, res) => {
  const pool = getPool();

  try {
    const {
      church_id,
      church_name,
      church_email,
      current_plan,
      requested_plan,
      requested_at,
    } = req.body;

    // Validar dados
    if (!church_id || !requested_plan) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
      });
    }

    // Salvar solicitação na tabela de upgrade requests
    await pool.execute(`
      INSERT INTO upgrade_requests
      (church_id, church_name, church_email, current_plan, requested_plan, requested_at, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
    `, [
      church_id,
      church_name,
      church_email,
      current_plan,
      requested_plan,
      requested_at,
    ]);

    // TODO: Enviar email para o Super Admin sobre novo pedido de upgrade

    res.json({
      success: true,
      message: 'Solicitação de upgrade enviada com sucesso! Entraremos em contato em até 24 horas.',
    });
  } catch (error) {
    console.error('Error creating upgrade request:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
