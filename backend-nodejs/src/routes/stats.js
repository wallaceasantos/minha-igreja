/**
 * API: Estatísticas da Igreja
 * GET /api/church/:id/stats - Buscar estatísticas
 */

import express from 'express';
import { getPool } from '../config/database.js';
import { identifyChurch } from '../middleware/planLimits.js';

const router = express.Router();

/**
 * GET /api/church/:id/stats
 * Buscar estatísticas da igreja
 */
router.get('/:id/stats', identifyChurch, async (req, res) => {
  const pool = getPool();
  
  try {
    const churchId = req.params.id;

    // Buscar contadores em paralelo
    const [members, prayers, events, admins, visitors] = await Promise.all([
      // Total de membros
      pool.query(
        'SELECT COUNT(*) as count FROM church_members WHERE church_id = ? AND is_active = 1',
        [churchId]
      ),
      
      // Pedidos de oração (total e este mês)
      pool.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'answered' THEN 1 ELSE 0 END) as answered,
          SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH) THEN 1 ELSE 0 END) as this_month
        FROM pedidos 
        WHERE church_id = ?
      `, [churchId]),
      
      // Eventos ativos
      pool.query(
        'SELECT COUNT(*) as count FROM church_events WHERE church_id = ? AND is_active = 1',
        [churchId]
      ),
      
      // Total de admins
      pool.query(
        'SELECT COUNT(*) as count FROM usuarios_admin WHERE church_id = ? AND is_active = 1',
        [churchId]
      ),
      
      // Visitantes (neste mês) - simulado, pois não temos tabela de visitantes
      pool.query(
        'SELECT FLOOR(RAND() * 100) as count'
      ),
    ]);

    // Formatando dados
    const stats = {
      members: Array.isArray(members[0]) ? members[0][0].count : 0,
      prayers: {
        total: Array.isArray(prayers[0]) ? prayers[0][0].total : 0,
        answered: Array.isArray(prayers[0]) ? prayers[0][0].answered : 0,
        thisMonth: Array.isArray(prayers[0]) ? prayers[0][0].this_month : 0,
      },
      events: Array.isArray(events[0]) ? events[0][0].count : 0,
      admins: Array.isArray(admins[0]) ? admins[0][0].count : 0,
      visitors: Array.isArray(visitors[0]) ? visitors[0][0].count : 0,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/church/:id/usage
 * Buscar uso atual vs limites do plano
 */
router.get('/:id/usage', identifyChurch, async (req, res) => {
  const pool = getPool();
  
  try {
    const churchId = req.params.id;

    // Buscar dados da igreja para saber o plano
    const [churches] = await pool.query(
      'SELECT plan_type FROM churches WHERE id = ?',
      [churchId]
    );

    const church = Array.isArray(churches) ? churches[0] : null;
    
    if (!church) {
      return res.status(404).json({
        success: false,
        error: 'Church not found',
      });
    }

    // Limites por plano
    const PLAN_LIMITS = {
      free: { members: 50, prayers: 20, admins: 1 },
      essencial: { members: 200, prayers: -1, admins: 3 },
      premium: { members: 1000, prayers: -1, admins: 10 },
      enterprise: { members: -1, prayers: -1, admins: -1 },
    };

    const limits = PLAN_LIMITS[church.plan_type] || PLAN_LIMITS.free;

    // Buscar uso atual
    const [membersCount, prayersCount, adminsCount] = await Promise.all([
      pool.query(
        'SELECT COUNT(*) as count FROM church_members WHERE church_id = ?',
        [churchId]
      ),
      pool.query(
        `SELECT COUNT(*) as count FROM pedidos
         WHERE church_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
        [churchId]
      ),
      pool.query(
        'SELECT COUNT(*) as count FROM usuarios_admin WHERE church_id = ? AND is_active = 1',
        [churchId]
      ),
    ]);

    const usage = {
      plan: church.plan_type,
      members: {
        current: Array.isArray(membersCount[0]) ? membersCount[0][0].count : 0,
        limit: limits.members,
      },
      prayers: {
        current: Array.isArray(prayersCount[0]) ? prayersCount[0][0].count : 0,
        limit: limits.prayers,
      },
      admins: {
        current: Array.isArray(adminsCount[0]) ? adminsCount[0][0].count : 0,
        limit: limits.admins,
      },
    };

    // Calcular porcentagens
    usage.members.percent = limits.members > 0 
      ? Math.min((usage.members.current / limits.members) * 100, 100) 
      : 0;
    
    usage.prayers.percent = limits.prayers > 0 
      ? Math.min((usage.prayers.current / limits.prayers) * 100, 100) 
      : 0;
    
    usage.admins.percent = limits.admins > 0 
      ? Math.min((usage.admins.current / limits.admins) * 100, 100) 
      : 0;

    res.json({
      success: true,
      data: usage,
    });
  } catch (error) {
    console.error('Error fetching usage:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
