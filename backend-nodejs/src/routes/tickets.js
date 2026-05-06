/**
 * API: Tickets de Suporte
 * POST   /api/tickets - Criar novo ticket
 * GET    /api/tickets - Listar tickets da igreja
 * GET    /api/tickets/stats - Estatísticas dos tickets
 * GET    /api/tickets/:id - Ver detalhes do ticket + mensagens
 * PUT    /api/tickets/:id - Atualizar ticket (responder)
 * POST   /api/tickets/:id/messages - Adicionar mensagem ao ticket
 * DELETE /api/tickets/:id - Excluir ticket
 */

import express from 'express';
import { getPool } from '../config/database.js';
import { identifyChurch } from '../middleware/planLimits.js';

const router = express.Router();

/**
 * POST /api/tickets
 * Criar novo ticket de suporte
 */
router.post('/', identifyChurch, async (req, res) => {
  const pool = getPool();

  try {
    const {
      subject,
      description,
      category = 'other',
      priority = 'medium',
    } = req.body;

    // Validações
    const errors = [];

    if (!subject || subject.trim().length < 5) {
      errors.push('Assunto deve ter pelo menos 5 caracteres');
    }

    if (!description || description.trim().length < 20) {
      errors.push('Descrição deve ter pelo menos 20 caracteres');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Erro de validação',
        details: errors,
      });
    }

    // Gerar número do ticket (ex: TKT-2026-000001)
    const year = new Date().getFullYear();
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as count FROM support_tickets WHERE YEAR(created_at) = ?',
      [year]
    );
    const ticketNumber = `TKT-${year}-${String(countResult[0].count + 1).padStart(6, '0')}`;

    // Inserir ticket
    const [result] = await pool.execute(
      `INSERT INTO support_tickets
       (ticket_number, church_id, subject, description, category, priority, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'open', NOW(), NOW())`,
      [
        ticketNumber,
        req.churchId,
        subject.trim(),
        description.trim(),
        category,
        priority,
      ]
    );

    const ticketId = result.insertId;

    // Criar primeira mensagem (descrição do ticket)
    // user_id pode ser null se não houver usuário autenticado
    await pool.execute(
      `INSERT INTO support_ticket_messages
       (ticket_id, user_id, message, is_internal, created_at)
       VALUES (?, NULL, ?, 0, NOW())`,
      [
        ticketId,
        description.trim(),
      ]
    );

    // Buscar ticket criado
    const [newTicket] = await pool.query(
      'SELECT * FROM support_tickets WHERE id = ? LIMIT 1',
      [ticketId]
    );

    res.status(201).json({
      success: true,
      message: 'Ticket criado com sucesso! Nossa equipe entrará em contato em até 24 horas.',
      data: newTicket[0],
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
 * GET /api/tickets
 * Listar tickets da igreja
 */
router.get('/', identifyChurch, async (req, res) => {
  const pool = getPool();

  try {
    const { status, category, priority, page = 1, limit = 20 } = req.query;

    console.log('[TICKETS] Listando tickets para church_id:', req.churchId);
    console.log('[TICKETS] Filtros:', { status, category, priority, page, limit });

    let whereClause = 'WHERE church_id = ?';
    const params = [req.churchId];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    if (priority) {
      whereClause += ' AND priority = ?';
      params.push(priority);
    }

    const offset = (page - 1) * limit;

    // Buscar tickets
    const [tickets] = await pool.query(
      `SELECT * FROM support_tickets
       ${whereClause}
       ORDER BY
         CASE priority
           WHEN 'urgent' THEN 1
           WHEN 'high' THEN 2
           WHEN 'medium' THEN 3
           WHEN 'low' THEN 4
         END,
         updated_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    console.log('[TICKETS] Tickets encontrados:', tickets.length);

    // Contar total
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM support_tickets ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: tickets,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (error) {
    console.error('Error listing tickets:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/tickets/stats
 * Estatísticas dos tickets
 */
router.get('/stats', identifyChurch, async (req, res) => {
  const pool = getPool();

  try {
    // Total por status
    const [byStatus] = await pool.query(
      `SELECT status, COUNT(*) as count 
       FROM support_tickets 
       WHERE church_id = ? 
       GROUP BY status`,
      [req.churchId]
    );

    // Total por prioridade
    const [byPriority] = await pool.query(
      `SELECT priority, COUNT(*) as count 
       FROM support_tickets 
       WHERE church_id = ? 
       GROUP BY priority`,
      [req.churchId]
    );

    // Total por categoria
    const [byCategory] = await pool.query(
      `SELECT category, COUNT(*) as count 
       FROM support_tickets 
       WHERE church_id = ? 
       GROUP BY category`,
      [req.churchId]
    );

    // Tickets abertos
    const [openTickets] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM support_tickets 
       WHERE church_id = ? AND status IN ('open', 'in_progress', 'waiting_customer')`,
      [req.churchId]
    );

    res.json({
      success: true,
      data: {
        byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item.status]: item.count }), {}),
        byPriority: byPriority.reduce((acc, item) => ({ ...acc, [item.priority]: item.count }), {}),
        byCategory: byCategory.reduce((acc, item) => ({ ...acc, [item.category]: item.count }), {}),
        openTickets: openTickets[0].count,
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
 * GET /api/tickets/:id
 * Ver detalhes do ticket + mensagens
 */
router.get('/:id', identifyChurch, async (req, res) => {
  const pool = getPool();

  try {
    const ticketId = req.params.id;

    // Buscar ticket
    const [tickets] = await pool.query(
      'SELECT * FROM support_tickets WHERE id = ? AND church_id = ? LIMIT 1',
      [ticketId, req.churchId]
    );

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ticket não encontrado',
      });
    }

    // Buscar mensagens do ticket
    const [messages] = await pool.query(
      `SELECT m.*, u.name as user_name
       FROM support_ticket_messages m
       LEFT JOIN usuarios_admin u ON m.user_id = u.id
       WHERE m.ticket_id = ?
       ORDER BY m.created_at ASC`,
      [ticketId]
    );

    res.json({
      success: true,
      data: {
        ...tickets[0],
        messages: messages,
      },
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/tickets/:id/messages
 * Adicionar mensagem ao ticket
 */
router.post('/:id/messages', identifyChurch, async (req, res) => {
  const pool = getPool();

  try {
    const ticketId = req.params.id;
    const { message, is_internal = false } = req.body;

    // Validações
    if (!message || message.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Mensagem deve ter pelo menos 3 caracteres',
      });
    }

    // Verificar se ticket existe
    const [tickets] = await pool.query(
      'SELECT id, status FROM support_tickets WHERE id = ? AND church_id = ?',
      [ticketId, req.churchId]
    );

    if (tickets.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ticket não encontrado',
      });
    }

    // Ticket fechado não pode receber mensagens
    if (tickets[0].status === 'closed') {
      return res.status(400).json({
        success: false,
        error: 'Ticket fechado não pode receber mensagens',
      });
    }

    // Inserir mensagem
    await pool.execute(
      `INSERT INTO support_ticket_messages
       (ticket_id, user_id, message, is_internal, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [
        ticketId,
        req.userId || null,
        message.trim(),
        is_internal ? 1 : 0,
      ]
    );

    // Atualizar updated_at do ticket
    await pool.execute(
      'UPDATE support_tickets SET updated_at = NOW() WHERE id = ?',
      [ticketId]
    );

    res.json({
      success: true,
      message: 'Mensagem enviada com sucesso!',
    });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/tickets/:id
 * Atualizar ticket (responder/fechar)
 */
router.put('/:id', identifyChurch, async (req, res) => {
  const pool = getPool();

  try {
    const ticketId = req.params.id;
    const {
      status,
      priority,
      description,
    } = req.body;

    // Verificar se ticket existe
    const [existing] = await pool.query(
      'SELECT id FROM support_tickets WHERE id = ? AND church_id = ? LIMIT 1',
      [ticketId, req.churchId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ticket não encontrado',
      });
    }

    // Atualizar campos permitidos
    const updates = [];
    const values = [];

    if (status) {
      updates.push('status = ?');
      values.push(status);

      if (status === 'resolved') {
        updates.push('resolved_at = NOW()');
      } else if (status === 'closed') {
        updates.push('closed_at = NOW()');
      }
    }

    if (priority) {
      updates.push('priority = ?');
      values.push(priority);
    }

    if (description) {
      // Adicionar como nota/resposta (implementação futura)
      // Por enquanto, apenas atualizamos updated_at
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum campo para atualizar',
      });
    }

    updates.push('updated_at = NOW()');
    values.push(ticketId);

    await pool.execute(
      `UPDATE support_tickets SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

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
 * DELETE /api/tickets/:id
 * Excluir ticket
 */
router.delete('/:id', identifyChurch, async (req, res) => {
  const pool = getPool();

  try {
    const ticketId = req.params.id;

    // Verificar se ticket existe
    const [existing] = await pool.query(
      'SELECT id, status FROM support_tickets WHERE id = ? AND church_id = ? LIMIT 1',
      [ticketId, req.churchId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Ticket não encontrado',
      });
    }

    // Só permite excluir tickets fechados ou resolvidos
    if (!['resolved', 'closed'].includes(existing[0].status)) {
      return res.status(400).json({
        success: false,
        error: 'Apenas tickets resolvidos ou fechados podem ser excluídos',
      });
    }

    await pool.execute(
      'DELETE FROM support_tickets WHERE id = ?',
      [ticketId]
    );

    res.json({
      success: true,
      message: 'Ticket excluído com sucesso!',
    });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
