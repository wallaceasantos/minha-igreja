/**
 * API: Super Admin - Sistema de Suporte/Tickets
 * ============================================
 * Rotas para gerenciar tickets de suporte.
 *
 * Rotas:
 * GET    /api/admin/tickets              - Listar todos os tickets
 * GET    /api/admin/tickets/:id          - Ver detalhes de um ticket
 * PUT    /api/admin/tickets/:id          - Atualizar ticket (status, prioridade, responsável)
 * POST   /api/admin/tickets/:id/assign   - Atribuir responsável
 * POST   /api/admin/tickets/:id/reply    - Responder ticket
 * GET    /api/admin/tickets/stats        - Estatísticas dos tickets
 */

import express from 'express';
import { getPool } from '../config/database.js';
import { isAdmin } from '../middleware/permissions.js';

const router = express.Router();

/**
 * GET /api/admin/tickets
 * Listar todos os tickets com filtros
 */
router.get('/tickets', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      priority, 
      category, 
      assigned_to, 
      search,
      date_range = 'all', // all, 7days, 30days, 90days, 6months, 12months
      archived = '0', // 0=active, 1=archived, all=both
      date_from,
      date_to
    } = req.query;
    
    const offset = (page - 1) * limit;

    // Construir WHERE
    const whereClauses = [];
    const params = [];

    if (status && status !== 'all') {
      whereClauses.push('st.status = ?');
      params.push(status);
    }

    if (priority && priority !== 'all') {
      whereClauses.push('st.priority = ?');
      params.push(priority);
    }

    if (category && category !== 'all') {
      whereClauses.push('st.category = ?');
      params.push(category);
    }

    if (assigned_to) {
      if (assigned_to === 'unassigned') {
        whereClauses.push('st.assigned_to IS NULL');
      } else {
        whereClauses.push('st.assigned_to = ?');
        params.push(assigned_to);
      }
    }

    // Filtro por arquivamento
    if (archived !== 'all') {
      whereClauses.push('st.is_archived = ?');
      params.push(archived === '1' ? 1 : 0);
    }

    // Filtro por data
    if (date_range && date_range !== 'all') {
      let days = 0;
      switch (date_range) {
        case '7days': days = 7; break;
        case '30days': days = 30; break;
        case '90days': days = 90; break;
        case '6months': days = 180; break;
        case '12months': days = 365; break;
      }
      if (days > 0) {
        whereClauses.push('st.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)');
        params.push(days);
      }
    }

    // Filtro por data personalizada
    if (date_from) {
      whereClauses.push('st.created_at >= ?');
      params.push(date_from);
    }
    if (date_to) {
      whereClauses.push('st.created_at <= ?');
      params.push(date_to);
    }

    if (search) {
      whereClauses.push('(st.subject LIKE ? OR st.description LIKE ? OR st.ticket_number LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Buscar tickets
    const [tickets] = await pool.query(`
      SELECT
        st.*,
        c.name as church_name,
        c.slug as church_slug,
        u.name as user_name,
        u.email as user_email,
        a.name as assigned_to_name,
        (SELECT COUNT(*) FROM support_ticket_messages WHERE ticket_id = st.id) as message_count
      FROM support_tickets st
      LEFT JOIN churches c ON st.church_id = c.id
      LEFT JOIN usuarios_admin u ON st.user_id = u.id
      LEFT JOIN usuarios_admin a ON st.assigned_to = a.id
      ${whereClause}
      ORDER BY 
        CASE st.priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        st.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    // Contar total
    const countQuery = `SELECT COUNT(*) as count FROM support_tickets st ${whereClause}`;
    const [totalResult] = await pool.query(countQuery, params);
    const total = Array.isArray(totalResult) ? totalResult[0].count : 0;

    res.json({
      success: true,
      data: {
        tickets: Array.isArray(tickets) ? tickets : [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/tickets/stats
 * Estatísticas dos tickets
 */
router.get('/tickets/stats', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    // Total por status
    const [byStatus] = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM support_tickets
      GROUP BY status
    `);

    // Total por prioridade
    const [byPriority] = await pool.query(`
      SELECT priority, COUNT(*) as count
      FROM support_tickets
      GROUP BY priority
    `);

    // Total por categoria
    const [byCategory] = await pool.query(`
      SELECT category, COUNT(*) as count
      FROM support_tickets
      GROUP BY category
    `);

    // Tickets não atribuídos
    const [unassigned] = await pool.query(`
      SELECT COUNT(*) as count
      FROM support_tickets
      WHERE assigned_to IS NULL
    `);

    // Tickets criados nos últimos 7 dias
    const [last7days] = await pool.query(`
      SELECT COUNT(*) as count
      FROM support_tickets
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // Tempo médio de resolução (em horas)
    const [avgResolutionTime] = await pool.query(`
      SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avg_hours
      FROM support_tickets
      WHERE resolved_at IS NOT NULL
    `);

    res.json({
      success: true,
      data: {
        byStatus: Array.isArray(byStatus) ? byStatus : [],
        byPriority: Array.isArray(byPriority) ? byPriority : [],
        byCategory: Array.isArray(byCategory) ? byCategory : [],
        unassigned: Array.isArray(unassigned) ? unassigned[0].count : 0,
        last7days: Array.isArray(last7days) ? last7days[0].count : 0,
        avgResolutionTime: Array.isArray(avgResolutionTime) ? avgResolutionTime[0].avg_hours : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/tickets/admins
 * Listar admins disponíveis para atribuição
 */
router.get('/tickets/admins', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const [admins] = await pool.query(`
      SELECT id, name, email, role
      FROM usuarios_admin
      WHERE is_active = 1
      ORDER BY name ASC
    `);

    res.json({
      success: true,
      data: Array.isArray(admins) ? admins : [],
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/tickets/:id
 * Ver detalhes de um ticket
 */
router.get('/tickets/:id', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const ticketId = req.params.id;

    // Buscar ticket
    const [tickets] = await pool.query(`
      SELECT
        st.*,
        c.name as church_name,
        c.slug as church_slug,
        c.email as church_email,
        u.name as user_name,
        u.email as user_email,
        a.name as assigned_to_name,
        a.email as assigned_to_email
      FROM support_tickets st
      LEFT JOIN churches c ON st.church_id = c.id
      LEFT JOIN usuarios_admin u ON st.user_id = u.id
      LEFT JOIN usuarios_admin a ON st.assigned_to = a.id
      WHERE st.id = ?
    `, [ticketId]);

    if (!Array.isArray(tickets) || tickets.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ticket não encontrado',
      });
    }

    const ticket = tickets[0];

    // Buscar mensagens
    const [messages] = await pool.query(`
      SELECT
        stm.*,
        u.name as user_name,
        u.email as user_email
      FROM support_ticket_messages stm
      LEFT JOIN usuarios_admin u ON stm.user_id = u.id
      WHERE stm.ticket_id = ?
      ORDER BY stm.created_at ASC
    `, [ticketId]);

    res.json({
      success: true,
      data: {
        ...ticket,
        messages: Array.isArray(messages) ? messages : [],
      },
    });
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/admin/tickets/:id
 * Atualizar ticket (status, prioridade, categoria)
 */
router.put('/tickets/:id', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const ticketId = req.params.id;
    const { status, priority, category } = req.body;

    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
      if (status === 'resolved') {
        updates.push('resolved_at = NOW()');
      }
    }

    if (priority) {
      updates.push('priority = ?');
      params.push(priority);
    }

    if (category) {
      updates.push('category = ?');
      params.push(category);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum campo para atualizar',
      });
    }

    updates.push('updated_at = NOW()');
    params.push(ticketId);

    await pool.execute(`
      UPDATE support_tickets SET ${updates.join(', ')} WHERE id = ?
    `, params);

    res.json({
      success: true,
      message: 'Ticket atualizado com sucesso!',
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/tickets/:id/assign
 * Atribuir responsável ao ticket
 */
router.post('/tickets/:id/assign', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const ticketId = req.params.id;
    const { assigned_to } = req.body;

    await pool.execute(
      'UPDATE support_tickets SET assigned_to = ?, updated_at = NOW(), status = "in_progress" WHERE id = ?',
      [assigned_to || null, ticketId]
    );

    res.json({
      success: true,
      message: assigned_to ? 'Responsável atribuído com sucesso!' : 'Responsável removido com sucesso!',
    });
  } catch (error) {
    console.error('Error assigning ticket:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/tickets/:id/reply
 * Responder ticket
 */
router.post('/tickets/:id/reply', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const ticketId = req.params.id;
    const { message, is_internal = false, user_id } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Mensagem é obrigatória',
      });
    }

    // Inserir mensagem
    const [result] = await pool.execute(
      'INSERT INTO support_ticket_messages (ticket_id, user_id, message, is_internal) VALUES (?, ?, ?, ?)',
      [ticketId, user_id || 1, message, is_internal ? 1 : 0]
    );

    // Atualizar ticket
    await pool.execute(
      'UPDATE support_tickets SET updated_at = NOW() WHERE id = ?',
      [ticketId]
    );

    res.json({
      success: true,
      message: 'Resposta enviada com sucesso!',
      message_id: result.insertId,
    });
  } catch (error) {
    console.error('Error replying to ticket:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/tickets
 * Criar novo ticket
 */
router.post('/tickets', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const { church_id, user_id, subject, description, priority = 'medium', category = 'other' } = req.body;

    if (!church_id || !subject || !description) {
      return res.status(400).json({
        success: false,
        error: 'Igreja, assunto e descrição são obrigatórios',
      });
    }

    // Gerar número do ticket
    const [lastTicket] = await pool.query(
      'SELECT ticket_number FROM support_tickets ORDER BY id DESC LIMIT 1'
    );

    let ticketNumber = 'TKT-001';
    if (Array.isArray(lastTicket) && lastTicket.length > 0) {
      const lastNumber = parseInt(lastTicket[0].ticket_number.replace('TKT-', ''));
      ticketNumber = `TKT-${String(lastNumber + 1).padStart(3, '0')}`;
    }

    // Inserir ticket
    const [result] = await pool.execute(
      'INSERT INTO support_tickets (ticket_number, church_id, user_id, subject, description, priority, category, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [ticketNumber, church_id, user_id || 1, subject, description, priority, category, 'open']
    );

    res.json({
      success: true,
      message: 'Ticket criado com sucesso!',
      ticket_id: result.insertId,
      ticket_number: ticketNumber,
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/tickets/:id/close
 * Encerrar ticket
 */
router.post('/tickets/:id/close', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const ticketId = req.params.id;

    await pool.execute(
      'UPDATE support_tickets SET status = "closed", closed_at = NOW(), updated_at = NOW() WHERE id = ?',
      [ticketId]
    );

    res.json({
      success: true,
      message: 'Ticket encerrado com sucesso!',
    });
  } catch (error) {
    console.error('Error closing ticket:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/tickets/:id/history
 * Histórico de status do ticket
 */
router.get('/tickets/:id/history', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const ticketId = req.params.id;

    // Buscar histórico de mudanças de status
    const [history] = await pool.query(`
      SELECT 
        stm.created_at,
        stm.message,
        u.name as user_name,
        'status_change' as type
      FROM support_ticket_messages stm
      LEFT JOIN usuarios_admin u ON stm.user_id = u.id
      WHERE stm.ticket_id = ? AND stm.is_internal = 1
      UNION ALL
      SELECT 
        st.created_at,
        CONCAT('Ticket criado com status: ', st.status) as message,
        'Sistema' as user_name,
        'initial_status' as type
      FROM support_tickets st
      WHERE st.id = ?
      ORDER BY created_at ASC
    `, [ticketId, ticketId]);

    res.json({
      success: true,
      data: Array.isArray(history) ? history : [],
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/tickets/archive-old
 * Arquivar tickets antigos automaticamente
 */
router.post('/tickets/archive-old', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const { days_old = 730 } = req.body; // Padrão: 2 anos (730 dias)

    // Arquivar tickets fechados há mais de X dias
    const [result] = await pool.query(`
      UPDATE support_tickets 
      SET is_archived = 1, 
          archived_at = NOW()
      WHERE status = 'closed' 
        AND closed_at < DATE_SUB(NOW(), INTERVAL ? DAY)
        AND is_archived = 0
    `, [days_old]);

    console.log(`[ARCHIVE] Tickets arquivados: ${result.affectedRows}`);

    res.json({
      success: true,
      data: {
        archived: result.affectedRows,
        days_old: days_old,
      },
    });
  } catch (error) {
    console.error('Error archiving tickets:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
