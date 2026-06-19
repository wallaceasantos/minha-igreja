/**
 * Middleware: Limites por Plano
 * ============================================
 * Modelo Trial-First: Todas as igrejas começam com 60 dias de trial
 * Após o trial, devem assinar o plano Essencial (R$ 79,90/mês)
 * - Trial: 60 dias com todos os recursos do Essencial
 * - Essencial: 200 membros, pedidos ilimitados, 3 admins
 * - Premium: 1000 membros, pedidos ilimitados, 10 admins
 * - Enterprise: ilimitado
 * - Modo Leitura: Após trial sem assinatura (apenas visualização)
 */

import { getPool } from '../config/database.js';

// Definição dos limites por plano
const PLAN_LIMITS = {
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
  premium: {
    maxMembers: 1000,
    maxPrayersPerMonth: -1,
    maxAdmins: 10,
    hasCustomDomain: true,
    hasLogoUpload: true,
    hasAnalytics: true,
    hasPixIntegration: true,
    hasPWA: true,
    hasMultiUnits: false,
  },
  enterprise: {
    maxMembers: -1,
    maxPrayersPerMonth: -1,
    maxAdmins: -1,
    hasCustomDomain: true,
    hasLogoUpload: true,
    hasAnalytics: true,
    hasPixIntegration: true,
    hasPWA: true,
    hasMultiUnits: true,
  },
  // Modo leitura: apenas visualização, sem criação
  readonly: {
    maxMembers: 0,
    maxPrayersPerMonth: 0,
    maxAdmins: 0,
    hasCustomDomain: false,
    hasLogoUpload: false,
    hasAnalytics: false,
    hasPixIntegration: false,
    hasPWA: false,
    hasMultiUnits: false,
  },
};

/**
 * Middleware para identificar igreja e plano
 * Nova lógica: trial de 60 dias, depois precisa assinar
 */
export async function identifyChurch(req, res, next) {
  try {
    const churchId = parseInt(req.headers['x-church-id']) || parseInt(req.body.church_id);

    if (!churchId) {
      return res.status(400).json({
        success: false,
        error: 'Church ID required',
      });
    }

    const pool = getPool();
    const [churches] = await pool.query(
      'SELECT id, plan_type, is_active, created_at FROM churches WHERE id = ? LIMIT 1',
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

    // Buscar trial/assinatura
    const [subscriptions] = await pool.query(
      'SELECT trial_end_date, is_trial, status FROM subscriptions WHERE church_id = ? LIMIT 1',
      [churchId]
    );

    const subscription = Array.isArray(subscriptions) ? subscriptions[0] : null;
    const now = new Date();

    // Verificar se trial está ativo (60 dias)
    const trialEndDate = subscription?.trial_end_date 
      ? new Date(subscription.trial_end_date) 
      : new Date(new Date(church.created_at).getTime() + 60 * 24 * 60 * 60 * 1000);
    
    const isTrialActive = trialEndDate > now;

    // Verificar se tem assinatura ativa
    const hasActiveSubscription = subscription?.status === 'active' || 
                                  subscription?.status === 'paid';

    // Determinar o plano efetivo
    let effectivePlan = 'readonly'; // Default: modo leitura
    
    if (isTrialActive) {
      effectivePlan = 'essencial'; // Trial = todos os recursos
    } else if (hasActiveSubscription) {
      effectivePlan = church.plan_type || 'essencial';
    }
    // Se trial acabou e não assinou, fica em modo readonly

    req.churchId = church.id;
    req.churchPlan = effectivePlan;
    req.isTrialActive = isTrialActive;
    req.hasActiveSubscription = hasActiveSubscription;
    req.trialEndDate = trialEndDate;

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
      const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.readonly;

      // Modo leitura: bloquear criação/edição
      if (plan === 'readonly') {
        return res.status(403).json({
          success: false,
          error: 'Seu trial encerrou. Assine o plano Essencial para continuar usando todos os recursos.',
          upgrade: true,
          plan: 'essencial',
          price: 'R$ 79,90/mês',
        });
      }

      if (feature in limits) {
        const featureLimit = limits[feature];
        if (typeof featureLimit === 'boolean' && !featureLimit) {
          return res.status(403).json({
            success: false,
            error: `Feature not available in your plan (${plan})`,
            upgrade: true,
          });
        }
      }

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
 * Verificar limites numéricos
 */
async function checkNumericLimit(churchId, feature, limits) {
  const pool = getPool();

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
  if (limit === 0) return; // Modo leitura - será bloqueado antes

  let query = `SELECT COUNT(*) as count FROM ${checkConfig.table} WHERE ${checkConfig.column} = ?`;
  if (checkConfig.where) {
    query += ` AND ${checkConfig.where}`;
  }

  const [rows] = await pool.query(query, [churchId]);
  const result = Array.isArray(rows) ? rows[0] : rows;
  const currentCount = result.count;

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

    // Modo leitura: bloquear
    if (req.churchPlan === 'readonly') {
      return res.status(403).json({
        success: false,
        error: 'Seu trial encerrou. Assine para continuar adicionando administradores.',
        upgrade: true,
      });
    }

    const plan = req.churchPlan;
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.essencial;

    if (limits.maxAdmins === -1) return next();

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

    // Modo leitura: bloquear
    if (req.churchPlan === 'readonly') {
      return res.status(403).json({
        success: false,
        error: 'Seu trial encerrou. Assine para continuar recebendo pedidos de oração.',
        upgrade: true,
      });
    }

    const plan = req.churchPlan;
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.essencial;

    if (limits.maxPrayersPerMonth === -1) return next();

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

export { PLAN_LIMITS };
