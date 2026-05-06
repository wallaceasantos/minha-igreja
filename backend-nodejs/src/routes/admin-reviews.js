/**
 * API: Avaliações da Plataforma
 * ============================================
 * Rotas para gerenciar avaliações dos clientes (pastores)
 *
 * Rotas:
 * POST   /api/admin/reviews           - Criar avaliação (Admin)
 * GET    /api/reviews                 - Listar avaliações publicadas (Público)
 */

import express from 'express';
import { getPool } from '../config/database.js';
import { identifyChurch } from '../middleware/planLimits.js';

const router = express.Router();

/**
 * GET /api/admin/reviews/me
 * Verificar se a igreja já tem uma avaliação
 */
router.get('/admin/reviews/me', identifyChurch, async (req, res) => {
  try {
    const churchId = req.churchId;
    const pool = getPool();

    const [reviews] = await pool.query(
      'SELECT id, rating, comment, created_at FROM church_reviews WHERE church_id = ? LIMIT 1',
      [churchId]
    );

    if (reviews.length > 0) {
      res.json({ success: true, hasReviewed: true, data: reviews[0] });
    } else {
      res.json({ success: true, hasReviewed: false, data: null });
    }
  } catch (error) {
    console.error('Error checking review:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/reviews
 * Pastor envia uma avaliação da plataforma
 */
router.post('/admin/reviews', identifyChurch, async (req, res) => {
  console.log('📝 Review request received:', {
    churchId: req.churchId,
    body: req.body,
    headers: req.headers['x-church-id']
  });

  try {
    const churchId = req.churchId;
    const { pastor_name, church_name, rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, error: 'Nota e comentário são obrigatórios' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Nota deve ser entre 1 e 5' });
    }

    const pool = getPool();

    // Verificar se já avaliou
    const [existing] = await pool.query(
      'SELECT id FROM church_reviews WHERE church_id = ? LIMIT 1',
      [churchId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'Você já enviou uma avaliação' });
    }

    const [result] = await pool.execute(`
      INSERT INTO church_reviews (church_id, pastor_name, church_name, rating, comment, is_published)
      VALUES (?, ?, ?, ?, ?, 1)
    `, [
      churchId,
      pastor_name || 'Pastor',
      church_name || req.church.name,
      rating,
      comment
    ]);

    res.json({
      success: true,
      message: 'Avaliação enviada com sucesso! Obrigado pelo feedback.',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/reviews
 * Landing page busca avaliações publicadas
 */
router.get('/reviews', async (req, res) => {
  try {
    const pool = getPool();
    const [reviews] = await pool.query(`
      SELECT id, pastor_name, church_name, rating, comment, created_at
      FROM church_reviews
      WHERE is_published = 1
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log('📥 GET /api/reviews - Found:', reviews.length, 'reviews');
    if (reviews.length > 0) {
      console.log('📝 First review:', reviews[0]);
    }

    res.json({
      success: true,
      data: Array.isArray(reviews) ? reviews : [],
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
