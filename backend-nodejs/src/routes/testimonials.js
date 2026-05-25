/**
 * Testimonials API
 * Gerencia depoimentos dos membros para exibição na live
 */

import express from 'express';
import { getPool } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/church/:churchId/testimonials
 * Retorna depoimentos ativos de uma igreja (público)
 */
router.get('/church/:churchId/testimonials', async (req, res) => {
  try {
    const { churchId } = req.params;
    const pool = getPool();
    
    const [testimonials] = await pool.query(
      `SELECT id, member_name, member_avatar, member_since, testimonial_text
       FROM testimonials
       WHERE church_id = ? AND is_active = 1
       ORDER BY display_order ASC, created_at DESC
       LIMIT 10`,
      [churchId]
    );
    
    res.json({
      success: true,
      data: testimonials
    });
  } catch (error) {
    console.error('❌ Error fetching testimonials:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar depoimentos'
    });
  }
});

/**
 * GET /api/testimonials
 * Lista todos os depoimentos da igreja do usuário logado (admin)
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const churchId = req.user.church_id;
    const pool = getPool();
    
    const [testimonials] = await pool.query(
      `SELECT id, member_name, member_avatar, member_since, testimonial_text, 
              is_active, display_order, created_at
       FROM testimonials
       WHERE church_id = ?
       ORDER BY display_order ASC, created_at DESC`,
      [churchId]
    );
    
    res.json({
      success: true,
      data: testimonials
    });
  } catch (error) {
    console.error('❌ Error fetching testimonials:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar depoimentos'
    });
  }
});

/**
 * POST /api/testimonials
 * Cria um novo depoimento (admin)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const churchId = req.user.church_id;
    const { member_name, member_avatar, member_since, testimonial_text, display_order } = req.body;
    
    if (!member_name || !testimonial_text) {
      return res.status(400).json({
        success: false,
        error: 'Nome e texto do depoimento são obrigatórios'
      });
    }
    
    const pool = getPool();
    const [result] = await pool.execute(
      `INSERT INTO testimonials (church_id, member_name, member_avatar, member_since, testimonial_text, display_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [churchId, member_name, member_avatar || member_name.charAt(0).toUpperCase(), member_since || '', testimonial_text, display_order || 0]
    );
    
    res.json({
      success: true,
      message: 'Depoimento criado com sucesso',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('❌ Error creating testimonial:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar depoimento'
    });
  }
});

/**
 * PUT /api/testimonials/:id
 * Atualiza um depoimento (admin)
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const churchId = req.user.church_id;
    const { member_name, member_avatar, member_since, testimonial_text, is_active, display_order } = req.body;
    
    const pool = getPool();
    const [result] = await pool.execute(
      `UPDATE testimonials 
       SET member_name = ?, member_avatar = ?, member_since = ?, 
           testimonial_text = ?, is_active = ?, display_order = ?
       WHERE id = ? AND church_id = ?`,
      [member_name, member_avatar, member_since, testimonial_text, is_active, display_order, id, churchId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Depoimento não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Depoimento atualizado com sucesso'
    });
  } catch (error) {
    console.error('❌ Error updating testimonial:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar depoimento'
    });
  }
});

/**
 * DELETE /api/testimonials/:id
 * Remove um depoimento (admin)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const churchId = req.user.church_id;
    
    const pool = getPool();
    const [result] = await pool.execute(
      'DELETE FROM testimonials WHERE id = ? AND church_id = ?',
      [id, churchId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Depoimento não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Depoimento removido com sucesso'
    });
  } catch (error) {
    console.error('❌ Error deleting testimonial:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao remover depoimento'
    });
  }
});

export default router;
