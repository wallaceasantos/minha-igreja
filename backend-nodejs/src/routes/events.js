/**
 * Rotas: Church Events (Eventos da Igreja)
 * Backend Node.js
 */

import express from 'express';
import { getPool } from '../config/database.js';

const router = express.Router();

// Middleware para identificar a igreja pelo church_id
const identifyChurch = async (req, res, next) => {
  try {
    const churchId = req.headers['x-church-id'] || req.query.church_id;
    
    if (!churchId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Church ID required' 
      });
    }

    const pool = getPool();
    const [churches] = await pool.query(
      'SELECT id, name, is_active FROM churches WHERE id = ? LIMIT 1',
      [churchId]
    );

    if (churches.length === 0 || !churches[0].is_active) {
      return res.status(404).json({ 
        success: false, 
        error: 'Church not found or inactive' 
      });
    }

    req.churchId = churchId;
    req.church = churches[0];
    next();
  } catch (error) {
    console.error('Error identifying church:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// GET /api/events/public/:slug - Listar eventos públicos por slug da igreja
router.get('/public/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const pool = getPool();

    // Buscar church_id pelo slug
    const [churches] = await pool.query(
      'SELECT id FROM churches WHERE slug = ? AND is_active = 1 LIMIT 1',
      [slug]
    );

    if (churches.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Igreja não encontrada'
      });
    }

    const churchId = churches[0].id;

    // Buscar eventos futuros e ativos
    const [events] = await pool.query(
      `SELECT * FROM church_events 
       WHERE church_id = ? AND start_datetime >= NOW() 
       ORDER BY start_datetime ASC 
       LIMIT 10`,
      [churchId]
    );

    res.json({ 
      success: true, 
      data: events,
      count: events.length
    });
  } catch (error) {
    console.error('Error listing public events:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/events - Listar todos os eventos da igreja
router.get('/', identifyChurch, async (req, res) => {
  try {
    const pool = getPool();
    const { status } = req.query;
    
    let query = 'SELECT * FROM church_events WHERE church_id = ?';
    const params = [req.churchId];

    // Filtro por status
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY start_datetime ASC';

    const [events] = await pool.query(query, params);

    res.json({ 
      success: true, 
      data: events,
      count: events.length
    });
  } catch (error) {
    console.error('Error listing events:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/events/:id - Buscar evento por ID
router.get('/:id', identifyChurch, async (req, res) => {
  try {
    const eventId = req.params.id;
    const pool = getPool();

    const [events] = await pool.query(
      'SELECT * FROM church_events WHERE id = ? AND church_id = ? LIMIT 1',
      [eventId, req.churchId]
    );

    if (events.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Evento não encontrado' 
      });
    }

    res.json({ 
      success: true, 
      data: events[0] 
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/events/stats/overview - Estatísticas de eventos
router.get('/stats/overview', identifyChurch, async (req, res) => {
  try {
    const pool = getPool();

    // Total de eventos
    const [total] = await pool.query(
      'SELECT COUNT(*) as count FROM church_events WHERE church_id = ?',
      [req.churchId]
    );

    // Eventos futuros
    const [upcoming] = await pool.query(
      'SELECT COUNT(*) as count FROM church_events WHERE church_id = ? AND start_datetime >= NOW()',
      [req.churchId]
    );

    // Eventos passados
    const [past] = await pool.query(
      'SELECT COUNT(*) as count FROM church_events WHERE church_id = ? AND start_datetime < NOW()',
      [req.churchId]
    );

    res.json({
      success: true,
      data: {
        total: total[0].count,
        upcoming: upcoming[0].count,
        past: past[0].count
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// POST /api/events - Criar novo evento
router.post('/', identifyChurch, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      start_datetime, 
      end_datetime,
      location,
      address,
      event_type,
      status
    } = req.body;

    // Validações
    const errors = [];

    if (!title || title.trim().length < 3) {
      errors.push('Título deve ter pelo menos 3 caracteres');
    }

    if (!start_datetime) {
      errors.push('Data do evento é obrigatória');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Erro de validação',
        details: errors
      });
    }

    const pool = getPool();

    // Inserir evento
    const [result] = await pool.execute(
      `INSERT INTO church_events 
       (church_id, title, description, start_datetime, end_datetime, location, address, event_type, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        req.churchId, 
        title.trim(), 
        description?.trim() || null, 
        start_datetime, 
        end_datetime || null, 
        location?.trim() || null,
        address?.trim() || null,
        event_type || 'evento',
        status || 'scheduled'
      ]
    );

    const eventId = result.insertId;

    // Buscar evento criado
    const [newEvent] = await pool.query(
      'SELECT * FROM church_events WHERE id = ? LIMIT 1',
      [eventId]
    );

    res.status(201).json({
      success: true,
      message: 'Evento cadastrado com sucesso!',
      data: newEvent[0]
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// PUT /api/events/:id - Atualizar evento
router.put('/:id', identifyChurch, async (req, res) => {
  try {
    const eventId = req.params.id;
    const { 
      title, 
      description, 
      start_datetime, 
      end_datetime,
      location,
      address,
      event_type,
      status
    } = req.body;

    // Validações
    const errors = [];

    if (!title || title.trim().length < 3) {
      errors.push('Título deve ter pelo menos 3 caracteres');
    }

    if (!start_datetime) {
      errors.push('Data do evento é obrigatória');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Erro de validação',
        details: errors
      });
    }

    const pool = getPool();

    // Verificar se evento existe
    const [existing] = await pool.query(
      'SELECT id FROM church_events WHERE id = ? AND church_id = ? LIMIT 1',
      [eventId, req.churchId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Evento não encontrado' 
      });
    }

    // Atualizar evento
    await pool.execute(
      `UPDATE church_events 
       SET title = ?, description = ?, start_datetime = ?, end_datetime = ?, 
           location = ?, address = ?, event_type = ?, status = ?
       WHERE id = ?`,
      [
        title.trim(), 
        description?.trim() || null, 
        start_datetime, 
        end_datetime || null, 
        location?.trim() || null, 
        address?.trim() || null,
        event_type || 'evento',
        status || 'scheduled',
        eventId
      ]
    );

    // Buscar evento atualizado
    const [updatedEvent] = await pool.query(
      'SELECT * FROM church_events WHERE id = ? LIMIT 1',
      [eventId]
    );

    res.json({
      success: true,
      message: 'Evento atualizado com sucesso!',
      data: updatedEvent[0]
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// DELETE /api/events/:id - Excluir evento
router.delete('/:id', identifyChurch, async (req, res) => {
  try {
    const eventId = req.params.id;
    const pool = getPool();

    // Verificar se evento existe
    const [existing] = await pool.query(
      'SELECT id FROM church_events WHERE id = ? AND church_id = ? LIMIT 1',
      [eventId, req.churchId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Evento não encontrado' 
      });
    }

    // Excluir evento
    await pool.execute(
      'DELETE FROM church_events WHERE id = ?',
      [eventId]
    );

    res.json({
      success: true,
      message: 'Evento excluído com sucesso!'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;
