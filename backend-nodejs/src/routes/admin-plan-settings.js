/**
 * API: Super Admin - Configurações de Planos
 * ============================================
 * Rotas para gerenciar configurações dinâmicas dos planos.
 *
 * Rotas:
 * GET    /api/admin/plan-settings           - Listar configurações de todos os planos
 * GET    /api/admin/plan-settings/:slug     - Ver configuração de um plano
 * PUT    /api/admin/plan-settings/:slug     - Atualizar configuração de um plano
 * POST   /api/admin/plan-settings/apply-discount - Aplicar desconto promocional
 */

import express from 'express';
import { getPool } from '../config/database.js';
import { isAdmin } from '../middleware/permissions.js';

const router = express.Router();

/**
 * GET /api/admin/plan-settings
 * Listar configurações de todos os planos
 */
router.get('/plan-settings', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const { include_inactive } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (!include_inactive || include_inactive === 'false') {
      whereClause += ' AND is_active = 1';
    }

    const [plans] = await pool.query(`
      SELECT * FROM plan_settings
      ${whereClause}
      ORDER BY display_order, id ASC
    `, params);

    // Buscar quantidade de igrejas por plano
    const [churchesCount] = await pool.query(`
      SELECT plan_type, COUNT(*) as count
      FROM churches
      WHERE is_active = 1
      GROUP BY plan_type
    `);

    const churchesByPlan = {};
    if (Array.isArray(churchesCount)) {
      churchesCount.forEach(row => {
        churchesByPlan[row.plan_type] = row.count;
      });
    }

    // Calcular preço com desconto
    const plansWithDiscount = Array.isArray(plans) ? plans.map(plan => {
      const discount = plan.discount_percentage || 0;
      const monthlyWithDiscount = discount > 0 
        ? plan.price_monthly * (1 - discount / 100)
        : plan.price_monthly;
      const yearlyWithDiscount = discount > 0 
        ? plan.price_yearly * (1 - discount / 100)
        : plan.price_yearly;

      return {
        ...plan,
        price_monthly_original: plan.price_monthly,
        price_yearly_original: plan.price_yearly,
        price_monthly_final: monthlyWithDiscount,
        price_yearly_final: yearlyWithDiscount,
        churches_count: churchesByPlan[plan.plan_slug] || 0,
      };
    }) : [];

    res.json({
      success: true,
      data: plansWithDiscount,
    });
  } catch (error) {
    console.error('Error fetching plan settings:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/plan-settings/:slug
 * Ver configuração de um plano específico
 */
router.get('/plan-settings/:slug', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const planSlug = req.params.slug;

    const [plans] = await pool.query(
      'SELECT * FROM plan_settings WHERE plan_slug = ? LIMIT 1',
      [planSlug]
    );

    if (!Array.isArray(plans) || plans.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Plano não encontrado',
      });
    }

    const plan = plans[0];

    // Buscar quantidade de igrejas neste plano
    const [churchesCount] = await pool.query(
      'SELECT COUNT(*) as count FROM churches WHERE plan_type = ? AND is_active = 1',
      [planSlug]
    );

    // Calcular preço com desconto
    const discount = plan.discount_percentage || 0;
    const monthlyWithDiscount = discount > 0 
      ? plan.price_monthly * (1 - discount / 100)
      : plan.price_monthly;
    const yearlyWithDiscount = discount > 0 
      ? plan.price_yearly * (1 - discount / 100)
      : plan.price_yearly;

    res.json({
      success: true,
      data: {
        ...plan,
        price_monthly_original: plan.price_monthly,
        price_yearly_original: plan.price_yearly,
        price_monthly_final: monthlyWithDiscount,
        price_yearly_final: yearlyWithDiscount,
        churches_count: Array.isArray(churchesCount) ? churchesCount[0].count : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching plan settings:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/admin/plan-settings/:slug
 * Atualizar configuração de um plano
 */
router.put('/plan-settings/:slug', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const planSlug = req.params.slug;
    const {
      plan_name,
      price_monthly,
      price_yearly,
      discount_percentage,
      max_members,
      max_admins,
      max_events,
      max_prayers,
      has_email_support,
      has_priority_support,
      has_custom_domain,
      has_analytics,
      is_featured,
      display_order,
    } = req.body;

    // Verificar se plano existe
    const [existing] = await pool.query(
      'SELECT id FROM plan_settings WHERE plan_slug = ?',
      [planSlug]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Plano não encontrado',
      });
    }

    // Atualizar configuração
    await pool.execute(`
      UPDATE plan_settings SET
        plan_name = ?,
        price_monthly = ?,
        price_yearly = ?,
        discount_percentage = ?,
        max_members = ?,
        max_admins = ?,
        max_events = ?,
        max_prayers = ?,
        has_email_support = ?,
        has_priority_support = ?,
        has_custom_domain = ?,
        has_analytics = ?,
        is_featured = ?,
        display_order = ?,
        updated_by = ?,
        updated_at = NOW()
      WHERE plan_slug = ?
    `, [
      plan_name,
      price_monthly || 0,
      price_yearly || 0,
      discount_percentage || 0,
      max_members || 0,
      max_admins || 1,
      max_events || 0,
      max_prayers || 0,
      has_email_support ? 1 : 0,
      has_priority_support ? 1 : 0,
      has_custom_domain ? 1 : 0,
      has_analytics ? 1 : 0,
      is_featured ? 1 : 0,
      display_order || 0,
      req.userId || null,
      planSlug,
    ]);

    res.json({
      success: true,
      message: 'Configurações do plano atualizadas com sucesso!',
    });
  } catch (error) {
    console.error('Error updating plan settings:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/plan-settings/apply-discount
 * Aplicar desconto promocional em um plano
 */
router.post('/plan-settings/apply-discount', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const { plan_slug, discount_percentage, temporary } = req.body;

    if (!plan_slug || discount_percentage === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Plano e porcentagem de desconto são obrigatórios',
      });
    }

    if (discount_percentage < 0 || discount_percentage > 100) {
      return res.status(400).json({
        success: false,
        error: 'Desconto deve ser entre 0 e 100%',
      });
    }

    // Atualizar desconto
    await pool.execute(
      'UPDATE plan_settings SET discount_percentage = ?, updated_at = NOW() WHERE plan_slug = ?',
      [discount_percentage, plan_slug]
    );

    res.json({
      success: true,
      message: `Desconto de ${discount_percentage}% aplicado com sucesso!`,
      discount_percentage,
    });
  } catch (error) {
    console.error('Error applying discount:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
