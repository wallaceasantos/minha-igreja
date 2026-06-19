/**
 * API: Admin - Upgrade de Planos
 * ============================================
 * Rotas para gestão de upgrade de planos com trial de 60 dias
 *
 * Rotas:
 * POST   /api/admin/upgrade/request     - Solicitar upgrade com trial
 * GET    /api/admin/upgrade/status      - Verificar status do trial
 * POST   /api/admin/upgrade/convert     - Converter trial para pago
 * POST   /api/admin/upgrade/cancel      - Cancelar trial
 */

import express from 'express';
import { getPool } from '../config/database.js';
import { activateTrial, convertTrialToPaid, cancelTrial } from '../schedulers/trial-scheduler.js';

const router = express.Router();

// Middleware para identificar a igreja
const identifyChurch = async (req, res, next) => {
  try {
    const churchId = req.headers['x-church-id'] || req.query.church_id;

    if (!churchId) {
      return res.status(401).json({
        success: false,
        error: 'Church ID required'
      });
    }

    const pool = getPool();
    const [churches] = await pool.query(
      'SELECT id, name, is_active FROM churches WHERE id = ? LIMIT 1',
      [churchId]
    );

    if (churches.length === 0 || !churches[0].is_active) {
      return res.status(401).json({
        success: false,
        error: 'Church not found or inactive'
      });
    }

    req.churchId = churchId;
    req.church = churches[0];
    next();
  } catch (error) {
    console.error('Error identifying church:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * POST /api/admin/upgrade/request
 * Solicitar upgrade com trial de 60 dias
 */
router.post('/request', identifyChurch, async (req, res) => {
  try {
    const { church_id } = req.body;

    if (!church_id) {
      return res.status(400).json({
        success: false,
        error: 'church_id é obrigatório',
      });
    }

    // Verificar se já tem trial ativo
    const pool = getPool();
    const [subscriptions] = await pool.query(`
      SELECT * FROM subscriptions WHERE church_id = ? LIMIT 1
    `, [church_id]);

    if (subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Subscription não encontrada',
      });
    }

    const subscription = subscriptions[0];

    // Verificar se já está em trial (verifica is_trial=1 OU status='trial')
    if (subscription.is_trial === 1 || subscription.status === 'trial') {
      return res.status(400).json({
        success: false,
        error: 'Trial já está ativo para esta igreja',
      });
    }

    // Ativar trial
    const result = await activateTrial(church_id);

    if (result.success) {
      res.json({
        success: true,
        message: 'Upgrade solicitado com sucesso! 60 dias grátis ativados.',
        data: {
          trial_start_date: result.trialStartDate,
          trial_end_date: result.trialEndDate,
          days_remaining: result.daysRemaining,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }

  } catch (error) {
    console.error('Error requesting upgrade:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/upgrade/status
 * Verificar status do trial
 */
router.get('/status', identifyChurch, async (req, res) => {
  try {
    const churchId = req.headers['x-church-id'] || req.query.church_id;

    if (!churchId) {
      return res.status(400).json({
        success: false,
        error: 'church_id é obrigatório',
      });
    }

    const pool = getPool();
    const [subscriptions] = await pool.query(`
      SELECT * FROM subscriptions WHERE church_id = ? LIMIT 1
    `, [churchId]);

    if (subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Subscription não encontrada',
      });
    }

    const subscription = subscriptions[0];

    res.json({
      success: true,
      data: {
        is_trial: subscription.is_trial === 1,
        trial_start_date: subscription.trial_start_date,
        trial_end_date: subscription.trial_end_date,
        days_remaining: subscription.trial_end_date 
          ? Math.ceil((new Date(subscription.trial_end_date) - new Date()) / (1000 * 60 * 60 * 24))
          : 0,
        status: subscription.status,
        plan_type: subscription.plan_type,
      },
    });

  } catch (error) {
    console.error('Error fetching upgrade status:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/upgrade/convert
 * Converter trial para pago
 */
router.post('/convert', identifyChurch, async (req, res) => {
  try {
    const { church_id, payment_method } = req.body;

    if (!church_id) {
      return res.status(400).json({
        success: false,
        error: 'church_id é obrigatório',
      });
    }

    // Converter trial para pago
    const result = await convertTrialToPaid(church_id);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: {
          new_status: 'active',
          plan_type: 'essential',
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }

  } catch (error) {
    console.error('Error converting trial:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/upgrade/cancel
 * Cancelar trial e voltar para Free
 */
router.post('/cancel', identifyChurch, async (req, res) => {
  try {
    const { church_id } = req.body;

    if (!church_id) {
      return res.status(400).json({
        success: false,
        error: 'church_id é obrigatório',
      });
    }

    // Cancelar trial
    const result = await cancelTrial(church_id);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: {
          new_plan: 'free',
          downgrade_date: new Date(),
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }

  } catch (error) {
    console.error('Error cancelling trial:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
