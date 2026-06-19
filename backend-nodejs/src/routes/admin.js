/**
 * API: Super Admin - Estatísticas da Plataforma
 * GET /api/admin/stats - Estatísticas gerais da plataforma
 * GET /api/admin/churches - Listar todas igrejas
 * GET /api/admin/revenue - Receita da plataforma
 */

import express from 'express';
import { getPool } from '../config/database.js';
import { isAdmin } from '../middleware/permissions.js';

const router = express.Router();

/**
 * GET /api/admin/stats
 * Buscar estatísticas gerais da plataforma
 */
router.get('/stats', isAdmin, async (req, res) => {
  const pool = getPool();
  
  try {
    // Buscar contadores em paralelo
    const [totalChurches, activeChurches, totalUsers, totalMembers, totalPrayers] = await Promise.all([
      // Total de igrejas
      pool.query('SELECT COUNT(*) as count FROM churches'),
      
      // Igrejas ativas
      pool.query('SELECT COUNT(*) as count FROM churches WHERE is_active = 1'),
      
      // Total de usuários (admins)
      pool.query('SELECT COUNT(*) as count FROM usuarios_admin'),
      
      // Total de membros (todas igrejas)
      pool.query('SELECT COUNT(*) as count FROM church_members'),
      
      // Total de pedidos de oração
      pool.query('SELECT COUNT(*) as count FROM pedidos'),
    ]);

    // Buscar distribuição de planos
    const [planDistribution] = await pool.query(`
      SELECT 
        plan_type,
        COUNT(*) as count,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active
      FROM churches
      GROUP BY plan_type
    `);

    // Formatar dados
    const stats = {
      churches: {
        total: Array.isArray(totalChurches[0]) ? totalChurches[0][0].count : 0,
        active: Array.isArray(activeChurches[0]) ? activeChurches[0][0].count : 0,
      },
      users: {
        total: Array.isArray(totalUsers[0]) ? totalUsers[0][0].count : 0,
      },
      members: {
        total: Array.isArray(totalMembers[0]) ? totalMembers[0][0].count : 0,
      },
      prayers: {
        total: Array.isArray(totalPrayers[0]) ? totalPrayers[0][0].count : 0,
      },
      plans: Array.isArray(planDistribution) ? planDistribution.reduce((acc, plan) => {
        acc[plan.plan_type] = {
          total: plan.count,
          active: plan.active,
        };
        return acc;
      }, {}) : {},
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/churches
 * Listar todas igrejas da plataforma
 */
router.get('/churches', isAdmin, async (req, res) => {
  const pool = getPool();
  
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const plan = req.query.plan || '';
    
    const offset = (page - 1) * limit;
    
    // Construir query com filtros
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (search) {
      whereClause += ' AND (name LIKE ? OR slug LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (plan) {
      whereClause += ' AND plan_type = ?';
      params.push(plan);
    }
    
    // Buscar igrejas com paginação
    const selectQuery = `
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM church_members cm WHERE cm.church_id = c.id) as member_count,
        (SELECT COUNT(*) FROM usuarios_admin ua WHERE ua.church_id = c.id) as admin_count
      FROM churches c
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [churches] = await pool.query(selectQuery, [...params, limit, offset]);
    
    // Contar total para paginação
    const countQuery = `SELECT COUNT(*) as count FROM churches ${whereClause}`;
    const [totalResult] = await pool.query(countQuery, params);
    
    const total = Array.isArray(totalResult) ? totalResult[0].count : 0;
    
    res.json({
      success: true,
      data: {
        churches: Array.isArray(churches) ? churches : [],
        pagination: {
          page: page,
          limit: limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching churches:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/revenue
 * Buscar receita da plataforma (MRR, ARR, etc.)
 */
router.get('/revenue', isAdmin, async (req, res) => {
  const pool = getPool();
  
  try {
    // Preços dos planos (em centavos para evitar problemas de float)
    const PLAN_PRICES = {
      free: 0,
      essencial: 4990, // R$ 49,90
      premium: 9990, // R$ 99,90
      enterprise: 29990, // R$ 299,90
    };

    // Buscar igrejas ativas por plano
    const [churchesByPlan] = await pool.query(`
      SELECT 
        plan_type,
        COUNT(*) as count,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active
      FROM churches
      WHERE plan_type != 'free'
      GROUP BY plan_type
    `);

    // Calcular MRR (Monthly Recurring Revenue)
    let mrr = 0;
    if (Array.isArray(churchesByPlan)) {
      churchesByPlan.forEach(plan => {
        const price = PLAN_PRICES[plan.plan_type] || 0;
        const active = plan.active || 0;
        mrr += price * active;
      });
    }

    // MRR em reais
    const mrrInBRL = mrr / 100;

    // ARR (Annual Recurring Revenue)
    const arrInBRL = mrrInBRL * 12;

    // Projeção de crescimento (últimos 3 meses vs meses anteriores)
    const [growthData] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as churches_created,
        SUM(CASE WHEN plan_type != 'free' THEN 1 ELSE 0 END) as paid_churches
      FROM churches
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
    `);

    res.json({
      success: true,
      data: {
        mrr: mrrInBRL,
        arr: arrInBRL,
        plans: Array.isArray(churchesByPlan) ? churchesByPlan.reduce((acc, plan) => {
          acc[plan.plan_type] = {
            count: plan.count,
            active: plan.active,
            price: PLAN_PRICES[plan.plan_type] / 100,
            revenue: (PLAN_PRICES[plan.plan_type] * (plan.active || 0)) / 100,
          };
          return acc;
        }, {}) : {},
        growth: Array.isArray(growthData) ? growthData : [],
      },
    });
  } catch (error) {
    console.error('Error fetching revenue:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/recent-churches
 * Buscar últimas igrejas criadas
 */
router.get('/recent-churches', isAdmin, async (req, res) => {
  const pool = getPool();
  
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const [churches] = await pool.query(`
      SELECT 
        id,
        name,
        slug,
        email,
        plan_type,
        is_active,
        created_at
      FROM churches
      ORDER BY created_at DESC
      LIMIT ?
    `, [limit]);
    
    res.json({
      success: true,
      data: Array.isArray(churches) ? churches : [],
    });
  } catch (error) {
    console.error('Error fetching recent churches:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/trials-ending
 * Buscar igrejas com trial acabando
 * Nota: Usa created_at + 60 dias como trial_end_date simulado
 */
router.get('/trials-ending', isAdmin, async (req, res) => {
  const pool = getPool();
  
  try {
    const days = parseInt(req.query.days) || 7;
    
    const [churches] = await pool.query(`
      SELECT 
        id,
        name,
        slug,
        email,
        plan_type,
        is_active,
        created_at,
        DATE_ADD(created_at, INTERVAL 60 DAY) as trial_end_date,
        DATEDIFF(DATE_ADD(created_at, INTERVAL 60 DAY), NOW()) as days_remaining
      FROM churches
      WHERE plan_type = 'free' 
        AND is_active = 1
        AND DATE_ADD(created_at, INTERVAL 60 DAY) >= NOW()
        AND DATE_ADD(created_at, INTERVAL 60 DAY) <= DATE_ADD(NOW(), INTERVAL ? DAY)
      ORDER BY trial_end_date ASC
    `, [days]);
    
    res.json({
      success: true,
      data: Array.isArray(churches) ? churches : [],
    });
  } catch (error) {
    console.error('Error fetching trials ending:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
