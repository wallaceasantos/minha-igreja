/**
 * Middleware: Limites por Plano
 * ============================================
 * Verifica e aplica limites baseados no plano da igreja
 * - Free: 50 membros, 20 pedidos/mês, 1 admin
 * - Essencial: 200 membros, pedidos ilimitados, 3 admins
 * - Premium: 1000 membros, pedidos ilimitados, 10 admins
 * - Enterprise: ilimitado
 */

import { getPool } from '../config/database.js';

// Definição dos limites por plano
const PLAN_LIMITS = {
  free: {
    maxMembers: 50,
    maxPrayersPerMonth: 20,
    maxAdmins: 1,
    hasCustomDomain: false,
    hasLogoUpload: false,
    hasAnalytics: false,
    hasPixIntegration: false,
    hasPWA: false,
    hasMultiUnits: false,
  },
  essencial: {
    maxMembers: 200,
    maxPrayersPerMonth: -1, // ilimitado
    maxAdmins: 3,
    hasCustomDomain: true,
    hasLogoUpload: true,
    hasAnalytics: true,
    hasPixIntegration: false,
    hasPWA: false,
    hasMultiUnits: false,
  },
};

/**
 * Middleware para identificar igreja e plano
 */
export async function identifyChurch(req, res, next) {
  try {
    // Pegar church_id do header ou do corpo da requisição
    const churchId = req.headers['x-church-id'] || req.body.church_id;

    if (!churchId) {
      return res.status(400).json({
        success: false,
        error: 'Church ID required',
      });
    }

    // Buscar igreja no banco
    const pool = getPool();
    const [churches] = await pool.query(
      'SELECT id, plan_type, is_active FROM churches WHERE id = ? LIMIT 1',
      [churchId]
    );

    const church = Array.isArray(churches) ? churches[0] : null;

    if (!church) {
      return res.status(404).json({
        success: false,
        error: 'Church not found',
      });
    }

    if (!church.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Church is inactive',
      });
    }

    // Buscar trial da tabela subscriptions (se existir)
    const [subscriptions] = await pool.query(
      'SELECT trial_end_date, is_trial, status FROM subscriptions WHERE church_id = ? LIMIT 1',
      [churchId]
    );

    const subscription = Array.isArray(subscriptions) ? subscriptions[0] : null;

    // Verificar se trial está ativo
    const now = new Date();
    const trialEndDate = subscription?.trial_end_date ? new Date(subscription.trial_end_date) : null;
    const isTrialActive = subscription?.is_trial === 1 &&
                          subscription?.status === 'trial' &&
                          trialEndDate &&
                          trialEndDate > now;

    // Anexar informações da igreja ao request
    // Se trial está ativo, tratar como plano 'essencial'
    req.churchId = church.id;
    req.churchPlan = isTrialActive || church.plan_type === 'essencial' || church.plan_type === 'premium'
      ? 'essencial'
      : (church.plan_type || 'free');
    req.isTrialActive = isTrialActive;

    next();
  } catch (error) {
    console.error('Error identifying church:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

/**
 * Middleware para verificar limites de uso
 */
export function checkPlanLimits(feature) {
  return async (req, res, next) => {
    try {
      if (!req.churchId || !req.churchPlan) {
        return res.status(400).json({
          success: false,
          error: 'Church not identified',
        });
      }

      const plan = req.churchPlan;
      const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

      // Verificar se a feature está disponível no plano
      if (feature in limits) {
        const featureLimit = limits[feature];
        
        // Se for boolean e for false, a feature não está disponível
        if (typeof featureLimit === 'boolean' && !featureLimit) {
          return res.status(403).json({
            success: false,
            error: `Feature not available in your plan (${plan})`,
            upgrade: true,
          });
        }
      }

      // Verificar limites numéricos
      await checkNumericLimit(req.churchId, feature, limits);

      next();
    } catch (error) {
      console.error('Error checking plan limits:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };
}

/**
 * Verificar limites numéricos (membros, admins, pedidos)
 */
async function checkNumericLimit(churchId, feature, limits) {
  const pool = getPool();

  // Mapeamento de features para tabelas e queries
  const limitChecks = {
    maxMembers: {
      table: 'church_members',
      column: 'church_id',
      message: 'Member limit reached',
    },
    maxAdmins: {
      table: 'usuarios_admin',
      column: 'church_id',
      message: 'Admin limit reached',
    },
    maxPrayersPerMonth: {
      table: 'pedidos',
      column: 'church_id',
      where: 'created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)',
      message: 'Monthly prayer limit reached',
    },
  };

  const checkConfig = limitChecks[feature];
  if (!checkConfig) return;

  const limit = limits[feature];
  if (limit === -1) return; // Ilimitado

  // Contar registros atuais
  let query = `SELECT COUNT(*) as count FROM ${checkConfig.table} WHERE ${checkConfig.column} = ?`;
  if (checkConfig.where) {
    query += ` AND ${checkConfig.where}`;
  }

  const [rows] = await pool.query(query, [churchId]);
  const result = Array.isArray(rows) ? rows[0] : rows;
  const currentCount = result.count;

  // Verificar se atingiu o limite
  if (currentCount >= limit) {
    throw new Error(checkConfig.message);
  }
}

/**
 * Middleware para verificar se pode criar admin
 */
export async function canCreateAdmin(req, res, next) {
  try {
    if (!req.churchId || !req.churchPlan) {
      return res.status(400).json({
        success: false,
        error: 'Church not identified',
      });
    }

    const plan = req.churchPlan;
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

    if (limits.maxAdmins === -1) {
      return next(); // Ilimitado
    }

    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM usuarios_admin WHERE church_id = ?',
      [req.churchId]
    );

    const result = Array.isArray(rows) ? rows[0] : rows;
    const currentAdmins = result.count;

    if (currentAdmins >= limits.maxAdmins) {
      return res.status(403).json({
        success: false,
        error: `Admin limit reached for your plan (${limits.maxAdmins})`,
        upgrade: true,
      });
    }

    next();
  } catch (error) {
    console.error('Error checking admin limit:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

/**
 * Middleware para verificar se pode criar pedido de oração
 */
export async function canCreatePrayer(req, res, next) {
  try {
    if (!req.churchId || !req.churchPlan) {
      return res.status(400).json({
        success: false,
        error: 'Church not identified',
      });
    }

    const plan = req.churchPlan;
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

    if (limits.maxPrayersPerMonth === -1) {
      return next(); // Ilimitado
    }

    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT COUNT(*) as count FROM pedidos 
       WHERE church_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)`,
      [req.churchId]
    );

    const result = Array.isArray(rows) ? rows[0] : rows;
    const currentPrayers = result.count;

    if (currentPrayers >= limits.maxPrayersPerMonth) {
      return res.status(403).json({
        success: false,
        error: `Monthly prayer limit reached (${limits.maxPrayersPerMonth}/mês)`,
        upgrade: true,
      });
    }

    next();
  } catch (error) {
    console.error('Error checking prayer limit:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

// Exportar definição dos planos para uso em outras partes do código
export { PLAN_LIMITS };
