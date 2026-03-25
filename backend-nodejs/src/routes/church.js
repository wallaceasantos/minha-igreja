/**
 * Rotas: Church (Igreja)
 * GET /api/church - Listar
 * GET /api/church/:slug - Buscar por slug
 * POST /api/church - Criar igreja
 */

import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// GET /api/church - Listar todas
router.get('/', async (req, res) => {
  try {
    const churches = await query('SELECT * FROM churches WHERE is_active = 1 ORDER BY name');
    res.json({ success: true, data: churches });
  } catch (error) {
    console.error('Error listing churches:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/church/:slug - Buscar por slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const churches = await query(
      'SELECT * FROM churches WHERE slug = ? AND is_active = 1 LIMIT 1',
      [slug]
    );
    
    if (churches.length === 0) {
      return res.status(404).json({ success: false, error: 'Church not found' });
    }
    
    res.json({ success: true, data: churches[0] });
  } catch (error) {
    console.error('Error fetching church:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/church - Criar igreja
router.post('/', async (req, res) => {
  try {
    const {
      name, slug, description, email, phone, whatsapp,
      address, facebook_url, instagram_url, youtube_url,
      theme_primary_color, theme_secondary_color,
      admin
    } = req.body;

    // Validações
    const errors = [];

    if (!name || name.length < 5) {
      errors.push('Nome deve ter pelo menos 5 caracteres');
    }

    if (!slug || slug.length < 3) {
      errors.push('Subdomínio deve ter pelo menos 3 caracteres');
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      errors.push('Subdomínio inválido');
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      errors.push('Email inválido');
    }

    if (!admin?.name) {
      errors.push('Nome do administrador é obrigatório');
    }

    if (!admin?.email || !/^\S+@\S+\.\S+$/.test(admin.email)) {
      errors.push('Email do administrador inválido');
    }

    if (!admin?.password || admin.password.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
    }

    if (admin.password !== admin.confirmPassword) {
      errors.push('Senhas não conferem');
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // Verificar slug duplicado
    const existing = await query('SELECT id FROM churches WHERE slug = ? LIMIT 1', [slug]);
    if (existing.length > 0) {
      return res.status(409).json({ 
        success: false, 
        error: 'Este subdomínio já está em uso' 
      });
    }

    // Inserir igreja (transação)
    await query('START TRANSACTION');

    try {
      const churchResult = await query(`
        INSERT INTO churches (
          name, slug, description, email, phone, whatsapp,
          address_street, address_number, address_complement,
          address_neighborhood, address_city, address_state, address_zip,
          facebook_url, instagram_url, youtube_url,
          theme_primary_color, theme_secondary_color,
          plan_type, is_active, is_verified, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, NOW())
      `, [
        name, slug, description || null, email, phone || null, whatsapp || null,
        address?.street || null, address?.number || null, address?.complement || null,
        address?.neighborhood || null, address?.city || null, address?.state || null, address?.zip || null,
        facebook_url || null, instagram_url || null, youtube_url || null,
        theme_primary_color || '#1e40af', theme_secondary_color || '#f59e0b',
      ]);

      const churchId = churchResult.insertId;

      // Inserir administrador
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash(admin.password, 10);

      await query(`
        INSERT INTO usuarios_admin (church_id, name, email, password, role, is_active, created_at)
        VALUES (?, ?, ?, ?, 'admin', 1, NOW())
      `, [churchId, admin.name, admin.email, hashedPassword]);

      // Inserir assinatura (trial 30 dias)
      await query(`
        INSERT INTO subscriptions (church_id, plan_type, status, current_period_start, current_period_end, trial_end_date, created_at)
        VALUES (?, 'free', 'trial', DATE(NOW()), DATE_ADD(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), NOW())
      `, [churchId]);

      await query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Igreja criada com sucesso!',
        data: {
          church_id: churchId,
          slug: slug,
          url: `https://${slug}.ccjv.com.br`,
          admin_url: `https://${slug}.ccjv.com.br/login`,
          trial_days: 30
        }
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error creating church:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
