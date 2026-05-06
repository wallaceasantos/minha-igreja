/**
 * Rotas: Church Services (Cultos Fixos)
 * Backend Node.js
 */

import express from 'express';
import { getPool } from '../config/database.js';

const router = express.Router();

// Middleware para identificar a igreja
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

// GET /api/services - Listar todos os cultos da igreja
router.get('/', identifyChurch, async (req, res) => {
  try {
    const pool = getPool();
    const { is_active } = req.query;
    
    let query = 'SELECT * FROM church_service_times WHERE church_id = ?';
    const params = [req.churchId];

    // Filtro por status
    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }

    // Ordenar por dia da semana e horário
    query += ' ORDER BY FIELD(day_of_week, "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"), service_time ASC';

    const [services] = await pool.query(query, params);

    res.json({ 
      success: true, 
      data: services,
      count: services.length
    });
  } catch (error) {
    console.error('Error listing services:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/services/public/:slug - Listar cultos públicos por slug da igreja
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

    // Buscar cultos ativos
    const [services] = await pool.query(
      `SELECT * FROM church_service_times 
       WHERE church_id = ? AND is_active = 1
       ORDER BY FIELD(day_of_week, "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"), service_time ASC`,
      [churchId]
    );

    res.json({ 
      success: true, 
      data: services,
      count: services.length
    });
  } catch (error) {
    console.error('Error listing public services:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/services/:id - Buscar culto por ID
router.get('/:id', identifyChurch, async (req, res) => {
  try {
    const serviceId = req.params.id;
    const pool = getPool();

    const [services] = await pool.query(
      'SELECT * FROM church_service_times WHERE id = ? AND church_id = ? LIMIT 1',
      [serviceId, req.churchId]
    );

    if (services.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Culto não encontrado' 
      });
    }

    res.json({ 
      success: true, 
      data: services[0] 
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// POST /api/services - Criar novo culto
router.post('/', identifyChurch, async (req, res) => {
  try {
    const { 
      day_of_week,
      service_name,
      service_time,
      description,
      is_active
    } = req.body;

    // Validações
    const errors = [];

    if (!day_of_week) {
      errors.push('Dia da semana é obrigatório');
    }

    if (!service_name || service_name.trim().length < 3) {
      errors.push('Nome do culto deve ter pelo menos 3 caracteres');
    }

    if (!service_time) {
      errors.push('Horário do culto é obrigatório');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Erro de validação',
        details: errors
      });
    }

    const pool = getPool();

    // Inserir culto
    const [result] = await pool.execute(
      `INSERT INTO church_service_times 
       (church_id, day_of_week, service_name, service_time, description, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        req.churchId, 
        day_of_week,
        service_name.trim(), 
        service_time,
        description?.trim() || null,
        is_active ? 1 : 0
      ]
    );

    const serviceId = result.insertId;

    // Buscar culto criado
    const [newService] = await pool.query(
      'SELECT * FROM church_service_times WHERE id = ? LIMIT 1',
      [serviceId]
    );

    res.status(201).json({
      success: true,
      message: 'Culto cadastrado com sucesso!',
      data: newService[0]
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// PUT /api/services/:id - Atualizar culto
router.put('/:id', identifyChurch, async (req, res) => {
  try {
    const serviceId = req.params.id;
    const { 
      day_of_week,
      service_name,
      service_time,
      description,
      is_active
    } = req.body;

    // Validações
    const errors = [];

    if (!day_of_week) {
      errors.push('Dia da semana é obrigatório');
    }

    if (!service_name || service_name.trim().length < 3) {
      errors.push('Nome do culto deve ter pelo menos 3 caracteres');
    }

    if (!service_time) {
      errors.push('Horário do culto é obrigatório');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Erro de validação',
        details: errors
      });
    }

    const pool = getPool();

    // Verificar se culto existe
    const [existing] = await pool.query(
      'SELECT id FROM church_service_times WHERE id = ? AND church_id = ? LIMIT 1',
      [serviceId, req.churchId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Culto não encontrado' 
      });
    }

    // Atualizar culto
    await pool.execute(
      `UPDATE church_service_times 
       SET day_of_week = ?, service_name = ?, service_time = ?, description = ?, is_active = ?
       WHERE id = ?`,
      [
        day_of_week,
        service_name.trim(), 
        service_time,
        description?.trim() || null,
        is_active ? 1 : 0,
        serviceId
      ]
    );

    // Buscar culto atualizado
    const [updatedService] = await pool.query(
      'SELECT * FROM church_service_times WHERE id = ? LIMIT 1',
      [serviceId]
    );

    res.json({
      success: true,
      message: 'Culto atualizado com sucesso!',
      data: updatedService[0]
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// DELETE /api/services/:id - Excluir culto
router.delete('/:id', identifyChurch, async (req, res) => {
  try {
    const serviceId = req.params.id;
    const pool = getPool();

    // Verificar se culto existe
    const [existing] = await pool.query(
      'SELECT id FROM church_service_times WHERE id = ? AND church_id = ? LIMIT 1',
      [serviceId, req.churchId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Culto não encontrado' 
      });
    }

    // Excluir culto
    await pool.execute(
      'DELETE FROM church_service_times WHERE id = ?',
      [serviceId]
    );

    res.json({
      success: true,
      message: 'Culto excluído com sucesso!'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;
