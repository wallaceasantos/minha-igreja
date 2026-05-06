/**
 * Rotas: Church Ministries (Ministérios da Igreja)
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

// GET /api/ministries - Listar todos os ministérios da igreja
router.get('/', identifyChurch, async (req, res) => {
  try {
    const pool = getPool();
    const { is_active } = req.query;
    
    let query = 'SELECT * FROM church_ministries WHERE church_id = ?';
    const params = [req.churchId];

    // Filtro por status
    if (is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(is_active === 'true' ? 1 : 0);
    }

    // Ordenar por ordem de exibição
    query += ' ORDER BY display_order ASC, name ASC';

    const [ministries] = await pool.query(query, params);

    res.json({ 
      success: true, 
      data: ministries,
      count: ministries.length
    });
  } catch (error) {
    console.error('Error listing ministries:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/ministries/public/:slug - Listar ministérios públicos por slug da igreja
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

    // Buscar ministérios ativos
    const [ministries] = await pool.query(
      `SELECT * FROM church_ministries 
       WHERE church_id = ? AND is_active = 1
       ORDER BY display_order ASC, name ASC`,
      [churchId]
    );

    res.json({ 
      success: true, 
      data: ministries,
      count: ministries.length
    });
  } catch (error) {
    console.error('Error listing public ministries:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/ministries/:id - Buscar ministério por ID
router.get('/:id', identifyChurch, async (req, res) => {
  try {
    const ministryId = req.params.id;
    const pool = getPool();

    const [ministries] = await pool.query(
      'SELECT * FROM church_ministries WHERE id = ? AND church_id = ? LIMIT 1',
      [ministryId, req.churchId]
    );

    if (ministries.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Ministério não encontrado' 
      });
    }

    res.json({ 
      success: true, 
      data: ministries[0] 
    });
  } catch (error) {
    console.error('Error fetching ministry:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// POST /api/ministries - Criar novo ministério
router.post('/', identifyChurch, async (req, res) => {
  try {
    const { 
      name,
      description,
      icon,
      display_order
    } = req.body;

    // Validações
    const errors = [];

    if (!name || name.trim().length < 3) {
      errors.push('Nome deve ter pelo menos 3 caracteres');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Erro de validação',
        details: errors
      });
    }

    const pool = getPool();

    // Inserir ministério
    const [result] = await pool.execute(
      `INSERT INTO church_ministries 
       (church_id, name, description, icon, display_order, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [
        req.churchId, 
        name.trim(), 
        description?.trim() || null,
        icon || 'Heart',
        display_order || 0
      ]
    );

    const ministryId = result.insertId;

    // Buscar ministério criado
    const [newMinistry] = await pool.query(
      'SELECT * FROM church_ministries WHERE id = ? LIMIT 1',
      [ministryId]
    );

    res.status(201).json({
      success: true,
      message: 'Ministério cadastrado com sucesso!',
      data: newMinistry[0]
    });
  } catch (error) {
    console.error('Error creating ministry:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// PUT /api/ministries/:id - Atualizar ministério
router.put('/:id', identifyChurch, async (req, res) => {
  try {
    const ministryId = req.params.id;
    const { 
      name,
      description,
      icon,
      display_order,
      is_active
    } = req.body;

    // Validações
    const errors = [];

    if (!name || name.trim().length < 3) {
      errors.push('Nome deve ter pelo menos 3 caracteres');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Erro de validação',
        details: errors
      });
    }

    const pool = getPool();

    // Verificar se ministério existe
    const [existing] = await pool.query(
      'SELECT id FROM church_ministries WHERE id = ? AND church_id = ? LIMIT 1',
      [ministryId, req.churchId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Ministério não encontrado' 
      });
    }

    // Atualizar ministério
    await pool.execute(
      `UPDATE church_ministries 
       SET name = ?, description = ?, icon = ?, display_order = ?, is_active = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        name.trim(), 
        description?.trim() || null,
        icon || 'Heart',
        display_order || 0,
        is_active ? 1 : 0,
        ministryId
      ]
    );

    // Buscar ministério atualizado
    const [updatedMinistry] = await pool.query(
      'SELECT * FROM church_ministries WHERE id = ? LIMIT 1',
      [ministryId]
    );

    res.json({
      success: true,
      message: 'Ministério atualizado com sucesso!',
      data: updatedMinistry[0]
    });
  } catch (error) {
    console.error('Error updating ministry:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// DELETE /api/ministries/:id - Excluir ministério
router.delete('/:id', identifyChurch, async (req, res) => {
  try {
    const ministryId = req.params.id;
    const pool = getPool();

    // Verificar se ministério existe
    const [existing] = await pool.query(
      'SELECT id FROM church_ministries WHERE id = ? AND church_id = ? LIMIT 1',
      [ministryId, req.churchId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Ministério não encontrado' 
      });
    }

    // Excluir ministério
    await pool.execute(
      'DELETE FROM church_ministries WHERE id = ?',
      [ministryId]
    );

    res.json({
      success: true,
      message: 'Ministério excluído com sucesso!'
    });
  } catch (error) {
    console.error('Error deleting ministry:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;
