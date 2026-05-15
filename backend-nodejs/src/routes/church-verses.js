/**
 * API: Church Verses (Versículos Curados)
 * ============================================================
 * Rotas para gerenciar versículos da igreja na live
 *
 * Rotas:
 * GET    /api/church/:churchId/verses         - Listar versículos ativos
 * GET    /api/church/:churchId/verses/all     - Listar todos (admin)
 * POST   /api/church/admin/verses             - Criar versículo
 * PUT    /api/church/admin/verses/:id         - Atualizar versículo
 * DELETE /api/church/admin/verses/:id         - Deletar versículo
 */

import express from 'express';
import { getPool } from '../config/database.js';

const router = express.Router();

/**
 * GET /api/church/:churchId/verses
 * Listar versículos ativos para exibição pública
 */
router.get('/:churchId/verses', async (req, res) => {
  try {
    const { churchId } = req.params;
    const pool = getPool();

    const [verses] = await pool.query(
      'SELECT id, text, reference, sort_order FROM church_verses WHERE church_id = ? AND is_active = 1 ORDER BY sort_order ASC',
      [churchId]
    );

    res.json({ success: true, data: verses });
  } catch (error) {
    console.error('Error fetching verses:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/church/:churchId/verses/all
 * Listar todos os versículos (admin)
 */
router.get('/:churchId/verses/all', async (req, res) => {
  try {
    const { churchId } = req.params;
    const pool = getPool();

    const [verses] = await pool.query(
      'SELECT * FROM church_verses WHERE church_id = ? ORDER BY sort_order ASC',
      [churchId]
    );

    res.json({ success: true, data: verses });
  } catch (error) {
    console.error('Error fetching all verses:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/church/admin/verses
 * Criar versículo
 */
router.post('/admin/verses', async (req, res) => {
  try {
    const { church_id, text, reference, is_active, sort_order } = req.body;

    if (!church_id || !text || !reference) {
      return res.status(400).json({ success: false, error: 'church_id, text e reference são obrigatórios' });
    }

    const pool = getPool();
    const [result] = await pool.execute(
      'INSERT INTO church_verses (church_id, text, reference, is_active, sort_order) VALUES (?, ?, ?, ?, ?)',
      [church_id, text, reference, is_active ?? 1, sort_order ?? 0]
    );

    res.json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    console.error('Error creating verse:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/church/admin/verses/:id
 * Atualizar versículo
 */
router.put('/admin/verses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, reference, is_active, sort_order } = req.body;

    const pool = getPool();
    await pool.execute(
      'UPDATE church_verses SET text = ?, reference = ?, is_active = ?, sort_order = ? WHERE id = ?',
      [text, reference, is_active ?? 1, sort_order ?? 0, id]
    );

    res.json({ success: true, message: 'Versículo atualizado' });
  } catch (error) {
    console.error('Error updating verse:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/church/admin/verses/:id
 * Deletar versículo
 */
router.delete('/admin/verses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    await pool.execute('DELETE FROM church_verses WHERE id = ?', [id]);

    res.json({ success: true, message: 'Versículo excluído' });
  } catch (error) {
    console.error('Error deleting verse:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
