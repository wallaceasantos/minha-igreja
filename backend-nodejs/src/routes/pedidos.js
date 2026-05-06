/**
 * Rotas: Pedidos de Oração
 * Backend Node.js
 */

import express from 'express';
import { getPool } from '../config/database.js';
import { identifyChurch as identifyChurchPlan, checkPlanLimits } from '../middleware/planLimits.js';

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
      return res.status(404).json({
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

// POST /api/pedidos/public - Criar pedido via site público (sem auth)
router.post('/public', async (req, res) => {
  try {
    const {
      church_slug,
      nome,
      email,
      categoria,
      tema,
      oracao,
      lgpd
    } = req.body;

    // Validações
    const errors = [];

    if (!church_slug) {
      errors.push('Identificação da igreja é obrigatória');
    }

    if (!oracao || oracao.trim().length < 10) {
      errors.push('Oração deve ter pelo menos 10 caracteres');
    }

    if (oracao && oracao.length > 500) {
      errors.push('Oração não pode exceder 500 caracteres');
    }

    if (!lgpd) {
      errors.push('É necessário concordar com a LGPD');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Erro de validação',
        details: errors
      });
    }

    const pool = getPool();

    // Buscar church_id pelo slug
    const [churches] = await pool.query(
      'SELECT id, plan_type FROM churches WHERE slug = ? AND is_active = 1 LIMIT 1',
      [church_slug]
    );

    if (churches.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Igreja não encontrada'
      });
    }

    const churchId = churches[0].id;
    const churchPlan = churches[0].plan_type || 'free';

    // Verificar limite de pedidos/mês baseado no plano
    const PLAN_LIMITS = {
      free: 20,
      essencial: -1,
    };

    const limit = PLAN_LIMITS[churchPlan] || PLAN_LIMITS.free;

    if (limit > 0) {
      const [countResult] = await pool.query(
        `SELECT COUNT(*) as count FROM pedidos
         WHERE church_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)`,
        [churchId]
      );

      const currentCount = countResult[0].count;

      if (currentCount >= limit) {
        return res.status(403).json({
          success: false,
          error: `Limite mensal de pedidos atingido (${currentCount}/${limit})`,
          upgrade: true,
        });
      }
    }

    // Inserir pedido
    const [result] = await pool.execute(
      `INSERT INTO pedidos
       (church_id, titulo, oracao, status, pedido_atendido, created_by, created_at, updated_at)
       VALUES (?, ?, ?, 'pending', 0, NULL, NOW(), NOW())`,
      [
        churchId,
        nome?.trim() || 'Anônimo',
        oracao.trim()
      ]
    );

    const pedidoId = result.insertId;

    // Buscar pedido criado
    const [newPedido] = await pool.query(
      'SELECT * FROM pedidos WHERE id = ? LIMIT 1',
      [pedidoId]
    );

    res.status(201).json({
      success: true,
      message: 'Pedido de oração enviado com sucesso! Estaremos orando por você.',
      data: newPedido[0]
    });
  } catch (error) {
    console.error('Error creating public pedido:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/pedidos - Listar todos os pedidos
router.get('/', identifyChurch, async (req, res) => {
  try {
    const pool = getPool();
    const { status } = req.query;
    
    let query = 'SELECT * FROM pedidos WHERE church_id = ?';
    const params = [req.churchId];

    // Filtro por status
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [pedidos] = await pool.query(query, params);

    res.json({ 
      success: true, 
      data: pedidos,
      count: pedidos.length
    });
  } catch (error) {
    console.error('Error listing pedidos:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/pedidos/old-pending - Pedidos pendentes com mais de 7 dias (DEVE VIR ANTES DE /:id)
router.get('/old-pending', identifyChurch, async (req, res) => {
  try {
    const pool = getPool();
    const daysThreshold = req.query.days || 7;

    // Buscar pedidos pendentes com mais de X dias
    const [oldPedidos] = await pool.query(`
      SELECT
        id,
        titulo,
        oracao,
        status,
        created_at,
        last_reminder_at,
        DATEDIFF(NOW(), created_at) as days_pending
      FROM pedidos
      WHERE church_id = ?
        AND status = 'pending'
        AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
      ORDER BY created_at ASC
    `, [req.churchId, daysThreshold]);

    res.json({
      success: true,
      data: oldPedidos,
      count: oldPedidos.length,
      threshold: daysThreshold
    });
  } catch (error) {
    console.error('Error fetching old pending pedidos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/pedidos/stats/reminders - Estatísticas de lembretes (DEVE VIR ANTES DE /:id)
router.get('/stats/reminders', identifyChurch, async (req, res) => {
  try {
    const pool = getPool();
    const daysThreshold = req.query.days || 7;

    // Total de pedidos pendentes antigos
    const [totalResult] = await pool.query(`
      SELECT COUNT(*) as count FROM pedidos
      WHERE church_id = ?
        AND status = 'pending'
        AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
    `, [req.churchId, daysThreshold]);

    // Pedido mais antigo
    const [oldestResult] = await pool.query(`
      SELECT
        id,
        titulo,
        created_at,
        DATEDIFF(NOW(), created_at) as days_pending
      FROM pedidos
      WHERE church_id = ?
        AND status = 'pending'
      ORDER BY created_at ASC
      LIMIT 1
    `, [req.churchId]);

    res.json({
      success: true,
      data: {
        oldPendingCount: totalResult[0]?.count || 0,
        oldestPedido: oldestResult[0] || null
      }
    });
  } catch (error) {
    console.error('Error fetching reminder stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/pedidos/:id - Buscar pedido por ID
router.get('/:id', identifyChurch, async (req, res) => {
  try {
    const pedidoId = req.params.id;
    const pool = getPool();

    const [pedidos] = await pool.query(
      'SELECT * FROM pedidos WHERE id = ? AND church_id = ? LIMIT 1',
      [pedidoId, req.churchId]
    );

    if (pedidos.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Pedido não encontrado' 
      });
    }

    res.json({ 
      success: true, 
      data: pedidos[0] 
    });
  } catch (error) {
    console.error('Error fetching pedido:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/pedidos/stats/overview - Estatísticas
router.get('/stats/overview', identifyChurch, async (req, res) => {
  try {
    const pool = getPool();

    // Total de pedidos
    const [total] = await pool.query(
      'SELECT COUNT(*) as count FROM pedidos WHERE church_id = ?',
      [req.churchId]
    );

    // Pedidos pendentes
    const [pending] = await pool.query(
      "SELECT COUNT(*) as count FROM pedidos WHERE church_id = ? AND status = 'pending'",
      [req.churchId]
    );

    // Pedidos respondidos
    const [answered] = await pool.query(
      "SELECT COUNT(*) as count FROM pedidos WHERE church_id = ? AND status = 'answered'",
      [req.churchId]
    );

    // Pedidos arquivados
    const [archived] = await pool.query(
      "SELECT COUNT(*) as count FROM pedidos WHERE church_id = ? AND status = 'archived'",
      [req.churchId]
    );

    // Pedidos atendidos
    const [atendidos] = await pool.query(
      'SELECT COUNT(*) as count FROM pedidos WHERE church_id = ? AND pedido_atendido = 1',
      [req.churchId]
    );

    res.json({
      success: true,
      data: {
        total: total[0].count,
        pending: pending[0].count,
        answered: answered[0].count,
        archived: archived[0].count,
        atendidos: atendidos[0].count
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// POST /api/pedidos - Criar novo pedido (com auth ou church_id header)
router.post('/', identifyChurch, async (req, res) => {
  try {
    console.log('📥 Recebendo pedido:', {
      churchId: req.churchId,
      church: req.church,
      body: req.body
    });
    
    const {
      tipo,
      nome,
      email,
      categoria,
      tema,
      oracao,
      privacidade,
      status,
    } = req.body;

    // Identificar igreja para verificar plano
    req.churchId = req.churchId;
    
    // Verificar se está em trial (deve vir do identifyChurch do planLimits)
    // Se não, buscamos aqui
    if (!req.churchPlan) {
      const pool = getPool();
      const [subscriptions] = await pool.query(
        'SELECT trial_end_date, is_trial, status FROM subscriptions WHERE church_id = ? LIMIT 1',
        [req.churchId]
      );
      
      const subscription = subscriptions[0];
      const trialEndDate = subscription?.trial_end_date ? new Date(subscription.trial_end_date) : null;
      const isTrialActive = subscription?.is_trial === 1 && 
                            subscription?.status === 'trial' && 
                            trialEndDate && 
                            trialEndDate > new Date();
      
      req.churchPlan = isTrialActive || req.church.plan_type === 'essencial' || req.church.plan_type === 'premium'
        ? 'essencial'
        : (req.church.plan_type || 'free');
    }
    
    console.log('🎯 Plano da igreja:', req.churchPlan);

    // Verificar limite de pedidos/mês baseado no plano
    await checkPlanLimits('maxPrayersPerMonth')(req, res, async () => {
      // Continuar se tiver permissão
    });

    // Se chegou aqui e não tem permissão, o middleware já retornou erro
    if (res.headersSent) return;

    // Validações
    const errors = [];

    if (!nome || nome.trim().length < 3) {
      errors.push('Nome deve ter pelo menos 3 caracteres');
    }

    if (!email || !email.includes('@')) {
      errors.push('Email inválido');
    }

    if (!tema || tema.trim().length < 3) {
      errors.push('Tema é obrigatório');
    }

    if (!oracao || oracao.trim().length < 10) {
      errors.push('Descrição deve ter pelo menos 10 caracteres');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Erro de validação',
        details: errors
      });
    }

    const pool = getPool();

    // Inserir pedido com novos campos
    const [result] = await pool.execute(
      `INSERT INTO pedidos
       (church_id, tipo, nome, email, categoria, tema, oracao, privacidade, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        req.churchId,
        tipo || 'pedido',
        nome?.trim(),
        email?.trim(),
        categoria || null,
        tema?.trim(),
        oracao?.trim() || '',
        privacidade || 'private',
        status || 'pending'
      ]
    );

    const pedidoId = result.insertId;

    // Buscar pedido criado
    const [newPedido] = await pool.query(
      'SELECT * FROM pedidos WHERE id = ? LIMIT 1',
      [pedidoId]
    );

    res.status(201).json({
      success: true,
      message: 'Pedido de oração cadastrado com sucesso!',
      data: newPedido[0]
    });
  } catch (error) {
    console.error('❌ Error creating pedido:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sql: error.sql,
      sqlState: error.sqlState
    });
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// PUT /api/pedidos/:id - Atualizar pedido
router.put('/:id', identifyChurch, async (req, res) => {
  try {
    const pedidoId = req.params.id;
    const { 
      titulo, 
      oracao,
      status,
      pedido_atendido,
      answer
    } = req.body;

    // Validações
    const errors = [];

    if (!oracao || oracao.trim().length < 10) {
      errors.push('Oração deve ter pelo menos 10 caracteres');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Erro de validação',
        details: errors
      });
    }

    const pool = getPool();

    // Verificar se pedido existe
    const [existing] = await pool.query(
      'SELECT id FROM pedidos WHERE id = ? AND church_id = ? LIMIT 1',
      [pedidoId, req.churchId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Pedido não encontrado' 
      });
    }

    // Atualizar pedido
    await pool.execute(
      `UPDATE pedidos 
       SET titulo = ?, oracao = ?, status = ?, pedido_atendido = ?, answer = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        titulo?.trim() || null, 
        oracao.trim(), 
        status || 'pending',
        pedido_atendido ? 1 : 0,
        answer || null,
        pedidoId
      ]
    );

    // Buscar pedido atualizado
    const [updatedPedido] = await pool.query(
      'SELECT * FROM pedidos WHERE id = ? LIMIT 1',
      [pedidoId]
    );

    res.json({
      success: true,
      message: 'Pedido de oração atualizado com sucesso!',
      data: updatedPedido[0]
    });
  } catch (error) {
    console.error('Error updating pedido:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// DELETE /api/pedidos/:id - Excluir pedido
router.delete('/:id', identifyChurch, async (req, res) => {
  try {
    const pedidoId = req.params.id;
    const pool = getPool();

    // Verificar se pedido existe
    const [existing] = await pool.query(
      'SELECT id FROM pedidos WHERE id = ? AND church_id = ? LIMIT 1',
      [pedidoId, req.churchId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Pedido não encontrado' 
      });
    }

    // Excluir pedido
    await pool.execute(
      'DELETE FROM pedidos WHERE id = ?',
      [pedidoId]
    );

    res.json({
      success: true,
      message: 'Pedido de oração excluído com sucesso!'
    });
  } catch (error) {
    console.error('Error deleting pedido:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
