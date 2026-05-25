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
 * Retorna depoimentos APROVADOS de uma igreja (público - para a live)
 */
router.get('/church/:churchId/testimonials', async (req, res) => {
  try {
    const { churchId } = req.params;
    const pool = getPool();
    
    const [testimonials] = await pool.query(
      `SELECT id, member_name, member_avatar, member_since, testimonial_text
       FROM testimonials
       WHERE church_id = ? AND status = 'approved' AND is_active = 1
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
 * POST /api/testimonials/public
 * Membro envia depoimento (público - fica em pending)
 */
router.post('/public', async (req, res) => {
  try {
    const { church_id, member_name, member_email, member_since, testimonial_text } = req.body;
    
    if (!church_id || !member_name || !testimonial_text) {
      return res.status(400).json({
        success: false,
        error: 'Igreja, nome e texto do depoimento são obrigatórios'
      });
    }
    
    // Validar texto mínimo
    if (testimonial_text.length < 20) {
      return res.status(400).json({
        success: false,
        error: 'O depoimento deve ter pelo menos 20 caracteres'
      });
    }
    
    // Validar nome
    if (member_name.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Nome deve ter pelo menos 2 caracteres'
      });
    }
    
    const pool = getPool();
    
    // Gerar avatar automaticamente (primeira letra do nome)
    const member_avatar = member_name.charAt(0).toUpperCase();
    
    const [result] = await pool.execute(
      `INSERT INTO testimonials (church_id, member_name, member_email, member_avatar, member_since, testimonial_text, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [church_id, member_name, member_email, member_avatar, member_since || '', testimonial_text]
    );
    
    res.json({
      success: true,
      message: 'Depoimento enviado com sucesso! Aguardando aprovação do pastor.',
      data: { id: result.insertId, status: 'pending' }
    });
  } catch (error) {
    console.error('❌ Error creating testimonial:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error code:', error.code);
    res.status(500).json({
      success: false,
      error: 'Erro ao enviar depoimento',
      details: error.message
    });
  }
});

/**
 * GET /api/testimonials/pending
 * Lista depoimentos pendentes (admin)
 */
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    const churchId = req.user.church_id;
    const pool = getPool();
    
    const [testimonials] = await pool.query(
      `SELECT id, member_name, member_email, member_avatar, member_since, testimonial_text, 
              status, created_at
       FROM testimonials
       WHERE church_id = ? AND status = 'pending'
       ORDER BY created_at DESC`,
      [churchId]
    );
    
    res.json({
      success: true,
      data: testimonials
    });
  } catch (error) {
    console.error('❌ Error fetching pending testimonials:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar depoimentos pendentes'
    });
  }
});

/**
 * GET /api/testimonials
 * Lista todos os depoimentos da igreja (admin) - pode filtrar por status
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const churchId = req.user.church_id;
    const { status } = req.query; // opcional: ?status=pending|approved|rejected
    
    const pool = getPool();
    
    let query = `
      SELECT t.id, t.member_name, t.member_email, t.member_avatar, t.member_since,
             t.testimonial_text, t.status, t.is_active, t.display_order,
             t.created_at, t.approved_at
      FROM testimonials t
      WHERE t.church_id = ?
    `;
    const params = [churchId];
    
    if (status) {
      query += ' AND t.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY t.created_at DESC';
    
    const [testimonials] = await pool.query(query, params);
    
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
 * PUT /api/testimonials/:id/status
 * Aprovar ou rejeitar depoimento (admin)
 */
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const churchId = req.user.church_id;
    const userId = req.user.id;
    const { status } = req.body; // 'approved' ou 'rejected'
    
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status deve ser "approved" ou "rejected"'
      });
    }
    
    const pool = getPool();
    
    // Verificar se o depoimento existe e pertence à igreja
    const [existing] = await pool.query(
      'SELECT id, status FROM testimonials WHERE id = ? AND church_id = ?',
      [id, churchId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Depoimento não encontrado'
      });
    }
    
    if (existing[0].status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Este depoimento já foi processado'
      });
    }
    
    // Atualizar status
    const approvedAt = status === 'approved' ? new Date() : null;
    
    await pool.execute(
      `UPDATE testimonials 
       SET status = ?, approved_by = ?, approved_at = ?
       WHERE id = ? AND church_id = ?`,
      [status, userId, approvedAt, id, churchId]
    );
    
    const message = status === 'approved' 
      ? 'Depoimento aprovado com sucesso!'
      : 'Depoimento rejeitado.';
    
    res.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('❌ Error updating testimonial status:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar status do depoimento'
    });
  }
});

/**
 * PUT /api/testimonials/:id
 * Atualizar depoimento (admin) - editar texto, ordem, etc
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const churchId = req.user.church_id;
    const { member_name, member_since, testimonial_text, is_active, display_order } = req.body;
    
    const pool = getPool();
    
    const [result] = await pool.execute(
      `UPDATE testimonials 
       SET member_name = ?, member_since = ?, 
           testimonial_text = ?, is_active = ?, display_order = ?
       WHERE id = ? AND church_id = ?`,
      [member_name, member_since, testimonial_text, is_active, display_order, id, churchId]
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
 * Remover depoimento (admin)
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

/**
 * GET /api/testimonials/stats
 * Estatísticas de depoimentos (admin)
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const churchId = req.user.church_id;
    const pool = getPool();
    
    const [stats] = await pool.query(
      `SELECT 
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
        COUNT(*) as total_count
       FROM testimonials
       WHERE church_id = ?`,
      [churchId]
    );
    
    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('❌ Error fetching testimonial stats:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar estatísticas'
    });
  }
});

export default router;
