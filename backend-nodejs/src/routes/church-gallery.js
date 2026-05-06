/**
 * API: Church Gallery - Galeria de Imagens
 * ============================================
 * Rotas para gerenciar galeria de imagens da igreja
 *
 * Rotas:
 * GET    /api/church/:churchId/gallery          - Listar imagens da galeria
 * POST   /api/admin/church/gallery/upload       - Upload de imagem (Admin)
 * PUT    /api/admin/church/gallery/:id          - Atualizar imagem (Admin)
 * DELETE /api/admin/church/gallery/:id          - Deletar imagem (Admin)
 */

import express from 'express';
import { getPool } from '../config/database.js';
import { identifyChurch, PLAN_LIMITS } from '../middleware/planLimits.js';
import { isAdmin } from '../middleware/permissions.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configurar multer para upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/gallery';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `gallery-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens JPEG, PNG e WebP são permitidas'));
    }
  }
});

/**
 * GET /api/church/:churchId/gallery
 * Listar imagens da galeria (público)
 */
router.get('/church/:churchId/gallery', async (req, res) => {
  try {
    const churchId = req.params.churchId;
    const pool = getPool();

    const [images] = await pool.query(`
      SELECT id, image_url, title, description, display_order
      FROM church_gallery
      WHERE church_id = ? AND is_active = 1
      ORDER BY display_order ASC, uploaded_at DESC
      LIMIT 12
    `, [churchId]);

    res.json({
      success: true,
      data: Array.isArray(images) ? images : [],
    });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/church/gallery
 * Listar TODAS as imagens da galeria (Admin - inclui ativas e inativas)
 */
router.get('/admin/church/gallery', identifyChurch, async (req, res) => {
  try {
    const churchId = req.headers['x-church-id'] || req.body.church_id;
    const pool = getPool();

    const [images] = await pool.query(`
      SELECT id, image_url, title, description, display_order, is_active
      FROM church_gallery
      WHERE church_id = ?
      ORDER BY display_order ASC, uploaded_at DESC
    `, [churchId]);

    res.json({
      success: true,
      data: Array.isArray(images) ? images : [],
    });
  } catch (error) {
    console.error('Error fetching admin gallery:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/church/gallery/upload
 * Upload de imagem (Admin)
 */
router.post('/admin/church/gallery/upload', identifyChurch, upload.single('image'), async (req, res) => {
  try {
    const { church_id, title, description, display_order } = req.body;

    // Verificar permissão (plano Essencial+ ou trial ativo)
    const limits = PLAN_LIMITS[req.churchPlan] || PLAN_LIMITS.free;
    if (!limits.hasLogoUpload) {
      // Deletar arquivo se não tem permissão
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({
        success: false,
        error: `Upload de imagens não disponível no plano ${req.churchPlan}`,
        upgrade: true,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhuma imagem enviada',
      });
    }

    const pool = getPool();
    const imageUrl = `/api/uploads/gallery/${req.file.filename}`;

    const [result] = await pool.execute(`
      INSERT INTO church_gallery
      (church_id, image_url, title, description, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `, [church_id, imageUrl, title || null, description || null, display_order || 0]);

    res.json({
      success: true,
      message: 'Imagem enviada com sucesso!',
      data: {
        id: result.insertId,
        image_url: imageUrl,
        title,
        description,
      },
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/admin/church/gallery/:id
 * Atualizar imagem (Admin)
 */
router.put('/admin/church/gallery/:id', identifyChurch, async (req, res) => {
  try {
    const imageId = req.params.id;
    const { title, description, display_order, is_active } = req.body;
    const pool = getPool();

    // Construir query dinamicamente baseada nos campos fornecidos
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (display_order !== undefined) {
      updates.push('display_order = ?');
      values.push(display_order);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(parseInt(is_active, 10));
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum campo para atualizar',
      });
    }

    values.push(imageId);

    await pool.execute(`
      UPDATE church_gallery
      SET ${updates.join(', ')}
      WHERE id = ?
    `, values);

    res.json({
      success: true,
      message: 'Imagem atualizada com sucesso!',
    });
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/admin/church/gallery/:id
 * Deletar imagem (Admin)
 */
router.delete('/admin/church/gallery/:id', identifyChurch, async (req, res) => {
  try {
    const imageId = req.params.id;
    const pool = getPool();

    // Buscar URL da imagem para deletar o arquivo
    const [images] = await pool.query(`
      SELECT image_url FROM church_gallery WHERE id = ?
    `, [imageId]);

    if (images.length > 0) {
      const imageUrl = images[0].image_url;
      const filePath = `.${imageUrl}`;
      
      // Deletar arquivo físico
      if (require('fs').existsSync(filePath)) {
        require('fs').unlinkSync(filePath);
      }
    }

    await pool.execute(`
      DELETE FROM church_gallery WHERE id = ?
    `, [imageId]);

    res.json({
      success: true,
      message: 'Imagem deletada com sucesso!',
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
