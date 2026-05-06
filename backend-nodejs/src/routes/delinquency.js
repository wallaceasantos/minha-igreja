/**
 * API: Super Admin - Controle de Inadimplência
 * GET /api/admin/delinquency - Lista de inadimplentes
 * POST /api/admin/delinquency/:id/send-reminder - Enviar lembrete
 * POST /api/admin/delinquency/:id/suspend - Suspender igreja
 * POST /api/admin/delinquency/:id/cancel - Cancelar assinatura
 */

import express from 'express';
import { getPool } from '../config/database.js';
import { isAdmin } from '../middleware/permissions.js';

const router = express.Router();

/**
 * GET /api/admin/delinquency
 * Buscar lista de igrejas inadimplentes
 */
router.get('/delinquency', isAdmin, async (req, res) => {
  const pool = getPool();
  
  try {
    const { status = 'all', days = 'all' } = req.query;
    
    // Construir query
    let whereClause = `
      WHERE c.plan_type != 'free' 
      AND c.is_active = 1
      AND s.status IN ('active', 'trial', 'past_due')
    `;
    
    const params = [];
    
    // Filtrar por status
    if (status === 'overdue') {
      whereClause += ` AND p.status = 'overdue'`;
    } else if (status === 'pending') {
      whereClause += ` AND p.status = 'pending'`;
    }
    
    // Filtrar por dias de atraso
    if (days !== 'all') {
      const daysNum = parseInt(days);
      if (daysNum === 30) {
        whereClause += ` AND DATEDIFF(NOW(), p.due_date) >= 30`;
      } else if (daysNum === 60) {
        whereClause += ` AND DATEDIFF(NOW(), p.due_date) >= 60`;
      } else if (daysNum === 90) {
        whereClause += ` AND DATEDIFF(NOW(), p.due_date) >= 90`;
      }
    }
    
    // Buscar igrejas inadimplentes
    const [churches] = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.email,
        c.phone,
        c.plan_type,
        c.is_active,
        c.created_at as church_created_at,
        s.id as subscription_id,
        s.status as subscription_status,
        s.current_period_end,
        p.id as payment_id,
        p.amount,
        p.status as payment_status,
        p.due_date,
        DATEDIFF(NOW(), p.due_date) as days_overdue,
        (
          SELECT COUNT(*) 
          FROM collection_notes cn 
          WHERE cn.church_id = c.id
        ) as collection_notes_count
      FROM churches c
      INNER JOIN subscriptions s ON c.id = s.church_id
      LEFT JOIN subscriptions_payments p ON s.id = p.subscription_id AND p.status IN ('pending', 'overdue')
      ${whereClause}
      ORDER BY days_overdue DESC
    `);
    
    // Calcular totais
    const totalOverdue = churches.filter(c => c.payment_status === 'overdue').length;
    const totalPending = churches.filter(c => c.payment_status === 'pending').length;
    const totalAmount = churches.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
    const amountOverdue30 = churches
      .filter(c => c.days_overdue >= 30)
      .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
    const amountOverdue60 = churches
      .filter(c => c.days_overdue >= 60)
      .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
    const amountOverdue90 = churches
      .filter(c => c.days_overdue >= 90)
      .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
    
    res.json({
      success: true,
      data: {
        churches: Array.isArray(churches) ? churches : [],
        summary: {
          total: churches.length,
          overdue: totalOverdue,
          pending: totalPending,
          totalAmount,
          byDays: {
            days30: { count: churches.filter(c => c.days_overdue >= 30).length, amount: amountOverdue30 },
            days60: { count: churches.filter(c => c.days_overdue >= 60).length, amount: amountOverdue60 },
            days90: { count: churches.filter(c => c.days_overdue >= 90).length, amount: amountOverdue90 },
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching delinquency:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/delinquency/:churchId/send-reminder
 * Enviar lembrete de pagamento
 */
router.post('/delinquency/:churchId/send-reminder', isAdmin, async (req, res) => {
  const pool = getPool();
  
  try {
    const { churchId } = req.params;
    const { message, method = 'email' } = req.body;
    
    // Buscar dados da igreja
    const [churches] = await pool.query(
      'SELECT id, name, email, slug FROM churches WHERE id = ?',
      [churchId]
    );
    
    const church = Array.isArray(churches) ? churches[0] : null;
    
    if (!church) {
      return res.status(404).json({
        success: false,
        error: 'Church not found',
      });
    }
    
    // TODO: Implementar envio real de email
    // Por enquanto, apenas simula
    console.log(`Sending ${method} to ${church.email}: ${message}`);
    
    // Salvar nota de cobrança
    await pool.execute(`
      INSERT INTO collection_notes (church_id, subscription_id, user_id, note_type, note, follow_up_date)
      VALUES (?, ?, 1, ?, ?, DATE_ADD(NOW(), INTERVAL 3 DAY))
    `, [churchId, req.body.subscriptionId, method === 'email' ? 'email' : 'message', message]);
    
    res.json({
      success: true,
      message: `${method === 'email' ? 'Email' : 'Mensagem'} enviado com sucesso para ${church.email}`,
    });
  } catch (error) {
    console.error('Error sending reminder:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/delinquency/:churchId/suspend
 * Suspender igreja por inadimplência
 */
router.post('/delinquency/:churchId/suspend', isAdmin, async (req, res) => {
  const pool = getPool();
  
  try {
    const { churchId } = req.params;
    const { reason } = req.body;
    
    // Suspender igreja
    await pool.execute(`
      UPDATE churches SET is_active = 0 WHERE id = ?
    `, [churchId]);
    
    // Atualizar assinatura
    await pool.execute(`
      UPDATE subscriptions SET status = 'suspended' WHERE church_id = ?
    `, [churchId]);
    
    // Salvar nota de cobrança
    await pool.execute(`
      INSERT INTO collection_notes (church_id, subscription_id, user_id, note_type, note)
      VALUES (?, ?, 1, 'suspension_warning', ?)
    `, [churchId, req.body.subscriptionId, `Igreja suspensa por inadimplência: ${reason || 'Pagamento atrasado'}`]);
    
    res.json({
      success: true,
      message: 'Igreja suspensa com sucesso',
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
 * POST /api/admin/delinquency/:churchId/cancel
 * Cancelar assinatura por inadimplência
 */
router.post('/delinquency/:churchId/cancel', isAdmin, async (req, res) => {
  const pool = getPool();
  
  try {
    const { churchId } = req.params;
    const { reason = 'non_payment' } = req.body;
    
    // Cancelar assinatura
    await pool.execute(`
      UPDATE subscriptions 
      SET status = 'cancelled', canceled_at = NOW(), cancel_reason = ?
      WHERE church_id = ?
    `, [reason, churchId]);
    
    // Desativar igreja
    await pool.execute(`
      UPDATE churches SET is_active = 0 WHERE id = ?
    `, [churchId]);
    
    // Salvar nota de cobrança
    await pool.execute(`
      INSERT INTO collection_notes (church_id, subscription_id, user_id, note_type, note)
      VALUES (?, ?, 1, 'cancellation_warning', ?)
    `, [churchId, req.body.subscriptionId, `Assinatura cancelada: ${reason === 'non_payment' ? 'Inadimplência' : reason}`]);
    
    res.json({
      success: true,
      message: 'Assinatura cancelada com sucesso',
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/delinquency/stats
 * Buscar estatísticas de inadimplência
 */
router.get('/delinquency/stats', isAdmin, async (req, res) => {
  const pool = getPool();
  
  try {
    // Buscar totais por período
    const [overdueStats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN DATEDIFF(NOW(), due_date) >= 30 THEN 1 ELSE 0 END) as days30,
        SUM(CASE WHEN DATEDIFF(NOW(), due_date) >= 60 THEN 1 ELSE 0 END) as days60,
        SUM(CASE WHEN DATEDIFF(NOW(), due_date) >= 90 THEN 1 ELSE 0 END) as days90,
        SUM(amount) as total_amount,
        SUM(CASE WHEN DATEDIFF(NOW(), due_date) >= 30 THEN amount ELSE 0 END) as amount30,
        SUM(CASE WHEN DATEDIFF(NOW(), due_date) >= 60 THEN amount ELSE 0 END) as amount60,
        SUM(CASE WHEN DATEDIFF(NOW(), due_date) >= 90 THEN amount ELSE 0 END) as amount90
      FROM subscriptions_payments
      WHERE status IN ('pending', 'overdue')
    `);
    
    // Buscar taxa de inadimplência
    const [delinquencyRate] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM subscriptions_payments WHERE status IN ('pending', 'overdue')) as overdue_count,
        (SELECT COUNT(*) FROM subscriptions_payments WHERE status = 'paid') as paid_count
    `);
    
    const stats = Array.isArray(overdueStats) ? overdueStats[0] : {};
    const rate = Array.isArray(delinquencyRate) ? delinquencyRate[0] : {};
    
    const ratePercent = rate.paid_count > 0 
      ? ((rate.overdue_count / (rate.overdue_count + rate.paid_count)) * 100).toFixed(2)
      : 0;
    
    res.json({
      success: true,
      data: {
        total: stats.total || 0,
        byDays: {
          days30: stats.days30 || 0,
          days60: stats.days60 || 0,
          days90: stats.days90 || 0,
        },
        amount: {
          total: parseFloat(stats.total_amount) || 0,
          days30: parseFloat(stats.amount30) || 0,
          days60: parseFloat(stats.amount60) || 0,
          days90: parseFloat(stats.amount90) || 0,
        },
        rate: parseFloat(ratePercent) || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching delinquency stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
