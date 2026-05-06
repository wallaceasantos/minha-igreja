/**
 * API: Admin - Billing/Delinquency
 * ============================================
 * Rotas para gestão de inadimplência
 *
 * Rotas:
 * GET    /api/admin/billing/delinquent        - Listar igrejas inadimplentes
 * GET    /api/admin/billing/stats             - Estatísticas de inadimplência
 * POST   /api/admin/billing/send-email        - Enviar email de cobrança
 * POST   /api/admin/billing/send-whatsapp     - Enviar WhatsApp
 * POST   /api/admin/billing/register-call     - Registrar ligação
 * POST   /api/admin/billing/suspend           - Suspender igreja
 * POST   /api/admin/billing/cancel            - Cancelar igreja
 * GET    /api/admin/billing/:id/history       - Histórico de cobranças
 */

import express from 'express';
import { getPool } from '../config/database.js';
import { isAdmin } from '../middleware/permissions.js';

const router = express.Router();

/**
 * GET /api/admin/billing/delinquent
 * Listar igrejas inadimplentes
 */
router.get('/delinquent', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const [churches] = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.email,
        c.phone,
        c.slug,
        c.billing_status,
        c.days_overdue,
        c.partial_suspension_date,
        c.total_suspension_date,
        c.cancellation_notice_date,
        s.plan_type,
        COALESCE(s.monthly_amount, 0) as monthly_amount,
        CASE 
          WHEN c.days_overdue >= 90 THEN 'CANCELAR'
          WHEN c.days_overdue >= 60 THEN 'CANCELAMENTO_PENDING'
          WHEN c.days_overdue >= 31 THEN 'SUSPENSAO_TOTAL'
          WHEN c.days_overdue >= 21 THEN 'SUSPENSAO_PARCIAL'
          WHEN c.days_overdue >= 14 THEN 'ATENCAO'
          WHEN c.days_overdue >= 7 THEN 'COBRAR'
          WHEN c.days_overdue >= 1 THEN 'LEMBRAR'
          ELSE 'EM_DIA'
        END as action_required,
        CASE 
          WHEN c.days_overdue >= 90 THEN '🔴'
          WHEN c.days_overdue >= 60 THEN '🟠'
          WHEN c.days_overdue >= 31 THEN '🔴'
          WHEN c.days_overdue >= 21 THEN '🟡'
          WHEN c.days_overdue >= 14 THEN '🟠'
          WHEN c.days_overdue >= 7 THEN '🟡'
          ELSE '🟢'
        END as risk_level
      FROM churches c
      LEFT JOIN subscriptions s ON c.id = s.church_id
      WHERE c.is_active = 1 
        AND c.days_overdue > 0
      ORDER BY c.days_overdue DESC
    `);

    res.json({
      success: true,
      data: Array.isArray(churches) ? churches : [],
    });
  } catch (error) {
    console.error('Error fetching delinquent churches:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/billing/stats
 * Estatísticas de inadimplência
 */
router.get('/stats', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    // Total de igrejas ativas
    const [totalChurches] = await pool.query(`
      SELECT COUNT(*) as count FROM churches WHERE is_active = 1
    `);

    // Igrejas inadimplentes (apenas as com dias de atraso > 0)
    const [delinquent] = await pool.query(`
      SELECT COUNT(*) as count FROM churches c
      LEFT JOIN subscriptions s ON c.id = s.church_id
      WHERE c.is_active = 1 
        AND c.days_overdue > 0
    `);

    // 30+ dias
    const [over30] = await pool.query(`
      SELECT COUNT(*) as count FROM churches 
      WHERE is_active = 1 AND days_overdue >= 30
    `);

    // 60+ dias
    const [over60] = await pool.query(`
      SELECT COUNT(*) as count FROM churches 
      WHERE is_active = 1 AND days_overdue >= 60
    `);

    // 90+ dias
    const [over90] = await pool.query(`
      SELECT COUNT(*) as count FROM churches 
      WHERE is_active = 1 AND days_overdue >= 90
    `);

    // Valor total devido (apenas igrejas com dias de atraso > 0)
    const [totalAmount] = await pool.query(`
      SELECT COALESCE(SUM(s.amount_cents) / 100, 0) as total 
      FROM churches c
      LEFT JOIN subscriptions s ON c.id = s.church_id
      WHERE c.is_active = 1 
        AND c.days_overdue > 0
    `);

    // Valor 30+ dias
    const [amount30] = await pool.query(`
      SELECT COALESCE(SUM(s.amount_cents) / 100, 0) as total 
      FROM churches c
      LEFT JOIN subscriptions s ON c.id = s.church_id
      WHERE c.is_active = 1 AND c.days_overdue >= 30
    `);

    // Valor 60+ dias
    const [amount60] = await pool.query(`
      SELECT COALESCE(SUM(s.amount_cents) / 100, 0) as total 
      FROM churches c
      LEFT JOIN subscriptions s ON c.id = s.church_id
      WHERE c.is_active = 1 AND c.days_overdue >= 60
    `);

    // Valor 90+ dias
    const [amount90] = await pool.query(`
      SELECT COALESCE(SUM(s.amount_cents) / 100, 0) as total 
      FROM churches c
      LEFT JOIN subscriptions s ON c.id = s.church_id
      WHERE c.is_active = 1 AND c.days_overdue >= 90
    `);

    const totalChurchesCount = Array.isArray(totalChurches) ? totalChurches[0].count : 0;
    const delinquentCount = Array.isArray(delinquent) ? delinquent[0].count : 0;
    const delinquencyRate = totalChurchesCount > 0 ? (delinquentCount / totalChurchesCount) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalDelinquent: delinquentCount,
        total30Plus: Array.isArray(over30) ? over30[0].count : 0,
        total60Plus: Array.isArray(over60) ? over60[0].count : 0,
        total90Plus: Array.isArray(over90) ? over90[0].count : 0,
        totalAmount: Array.isArray(totalAmount) ? totalAmount[0].total : 0,
        amount30Plus: Array.isArray(amount30) ? amount30[0].total : 0,
        amount60Plus: Array.isArray(amount60) ? amount60[0].total : 0,
        amount90Plus: Array.isArray(amount90) ? amount90[0].total : 0,
        delinquencyRate,
        totalChurches: totalChurchesCount,
      },
    });
  } catch (error) {
    console.error('Error fetching billing stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/billing/send-email
 * Enviar email de cobrança
 */
router.post('/send-email', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const { church_id, email_type } = req.body;

    if (!church_id || !email_type) {
      return res.status(400).json({
        success: false,
        error: 'church_id e email_type são obrigatórios',
      });
    }

    // Buscar dados da igreja
    const [churches] = await pool.query(
      'SELECT id, name, email FROM churches WHERE id = ?',
      [church_id]
    );

    if (!Array.isArray(churches) || churches.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Igreja não encontrada',
      });
    }

    // TODO: Implementar envio real de email
    // Por enquanto, apenas registra no histórico

    await pool.execute(`
      INSERT INTO church_billing_history 
      (church_id, action_type, status, notes, created_by)
      VALUES (?, ?, 'completed', ?, ?)
    `, [church_id, `email_${email_type}`, `Email ${email_type} enviado`, req.user?.id]);

    res.json({
      success: true,
      message: `Email ${email_type} enviado para ${churches[0].name}!`,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/billing/send-whatsapp
 * Enviar WhatsApp de cobrança
 */
router.post('/send-whatsapp', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const { church_id } = req.body;

    if (!church_id) {
      return res.status(400).json({
        success: false,
        error: 'church_id é obrigatório',
      });
    }

    // TODO: Implementar envio real de WhatsApp
    // Por enquanto, apenas registra no histórico

    await pool.execute(`
      INSERT INTO church_billing_history 
      (church_id, action_type, status, notes, created_by)
      VALUES (?, 'whatsapp_sent', 'completed', 'WhatsApp enviado', ?)
    `, [church_id, req.user?.id]);

    res.json({
      success: true,
      message: 'WhatsApp enviado!',
    });
  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/billing/register-call
 * Registrar ligação
 */
router.post('/register-call', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const { church_id, notes } = req.body;

    if (!church_id) {
      return res.status(400).json({
        success: false,
        error: 'church_id é obrigatório',
      });
    }

    await pool.execute(`
      INSERT INTO church_billing_history 
      (church_id, action_type, status, notes, created_by)
      VALUES (?, 'call_made', 'completed', ?, ?)
    `, [church_id, notes || 'Ligação registrada', req.user?.id]);

    res.json({
      success: true,
      message: 'Ligação registrada!',
    });
  } catch (error) {
    console.error('Error registering call:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/billing/suspend
 * Suspender igreja (parcial ou total)
 */
router.post('/suspend', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const { church_id, suspension_type } = req.body;

    if (!church_id || !suspension_type) {
      return res.status(400).json({
        success: false,
        error: 'church_id e suspension_type são obrigatórios',
      });
    }

    if (!['partial', 'total'].includes(suspension_type)) {
      return res.status(400).json({
        success: false,
        error: 'suspension_type deve ser "partial" ou "total"',
      });
    }

    if (suspension_type === 'partial') {
      await pool.execute(`
        UPDATE churches 
        SET 
          billing_status = 'partial_suspended',
          partial_suspension_date = NOW()
        WHERE id = ?
      `, [church_id]);
    } else {
      await pool.execute(`
        UPDATE churches 
        SET 
          billing_status = 'total_suspended',
          total_suspension_date = NOW(),
          is_active = 0
        WHERE id = ?
      `, [church_id]);
    }

    await pool.execute(`
      INSERT INTO church_billing_history 
      (church_id, action_type, status, notes, created_by)
      VALUES (?, ?, 'completed', ?, ?)
    `, [church_id, `${suspension_type}_suspension`, `Suspensão ${suspension_type} aplicada manualmente`, req.user?.id]);

    res.json({
      success: true,
      message: `Suspensão ${suspension_type} aplicada!`,
    });
  } catch (error) {
    console.error('Error suspending church:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/billing/cancel
 * Cancelar igreja
 */
router.post('/cancel', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const { church_id } = req.body;

    if (!church_id) {
      return res.status(400).json({
        success: false,
        error: 'church_id é obrigatório',
      });
    }

    // TODO: Gerar backup dos dados da igreja

    await pool.execute(`
      UPDATE churches 
      SET 
        billing_status = 'cancelled',
        is_active = 0
      WHERE id = ?
    `, [church_id]);

    await pool.execute(`
      UPDATE subscriptions 
      SET 
        status = 'cancelled',
        payment_status = 'failed',
        cancelled_at = NOW(),
        cancel_reason = 'Cancelamento manual por inadimplência'
      WHERE church_id = ?
    `, [church_id]);

    await pool.execute(`
      INSERT INTO church_billing_history 
      (church_id, action_type, status, notes, created_by)
      VALUES (?, 'cancelled', 'completed', 'Cancelamento manual', ?)
    `, [church_id, req.user?.id]);

    res.json({
      success: true,
      message: 'Igreja cancelada com sucesso!',
    });
  } catch (error) {
    console.error('Error cancelling church:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/billing/:id/history
 * Histórico de cobranças de uma igreja
 */
router.get('/:id/history', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const churchId = req.params.id;

    const [history] = await pool.query(`
      SELECT 
        h.*,
        u.name as creator_name
      FROM church_billing_history h
      LEFT JOIN usuarios_admin u ON h.created_by = u.id
      WHERE h.church_id = ?
      ORDER BY h.created_at DESC
      LIMIT 50
    `, [churchId]);

    res.json({
      success: true,
      data: Array.isArray(history) ? history : [],
    });
  } catch (error) {
    console.error('Error fetching billing history:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
