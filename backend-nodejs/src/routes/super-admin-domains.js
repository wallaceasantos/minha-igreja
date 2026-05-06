/**
 * API: Super Admin - Domínios Próprios
 * ============================================
 * Rotas para gerenciamento de domínios próprios
 *
 * Rotas:
 * GET    /api/super-admin/domains                    - Listar todas solicitações
 * GET    /api/super-admin/domains/:id                - Detalhes da solicitação
 * POST   /api/super-admin/domains/:id/configure      - Configurar DNS
 * POST   /api/super-admin/domains/:id/activate       - Ativar domínio
 * POST   /api/super-admin/domains/:id/reject         - Rejeitar solicitação
 * DELETE /api/super-admin/domains/:id                - Deletar solicitação
 */

import express from 'express';
import { getPool } from '../config/database.js';
import { isAdmin } from '../middleware/permissions.js';

const router = express.Router();

/**
 * GET /api/super-admin/domains
 * Listar todas as solicitações de domínio
 */
router.get('/domains', isAdmin, async (req, res) => {
  try {
    const pool = getPool();

    const [requests] = await pool.query(`
      SELECT 
        r.id,
        r.church_id,
        c.name as church_name,
        c.email as church_email,
        r.requested_domain,
        r.status,
        r.dns_verified,
        r.dns_check_result,
        r.created_at,
        r.configured_at,
        r.activated_at,
        r.notes
      FROM church_domain_requests r
      JOIN churches c ON r.church_id = c.id
      ORDER BY r.created_at DESC
    `);

    res.json({
      success: true,
      data: Array.isArray(requests) ? requests : [],
    });
  } catch (error) {
    console.error('Error fetching domain requests:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/super-admin/domains/:id
 * Detalhes da solicitação
 */
router.get('/domains/:id', isAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const requestId = req.params.id;

    const [requests] = await pool.query(`
      SELECT 
        r.*,
        c.name as church_name,
        c.email as church_email,
        c.phone as church_phone,
        c.address_city,
        c.address_state
      FROM church_domain_requests r
      JOIN churches c ON r.church_id = c.id
      WHERE r.id = ?
    `, [requestId]);

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Solicitação não encontrada',
      });
    }

    res.json({
      success: true,
      data: requests[0],
    });
  } catch (error) {
    console.error('Error fetching domain request:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/super-admin/domains/:id/configure
 * Configurar DNS (Super Admin configurou manualmente)
 */
router.post('/domains/:id/configure', isAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const requestId = req.params.id;
    const { notes } = req.body;

    await pool.execute(`
      UPDATE church_domain_requests 
      SET status = 'configured',
          configured_at = NOW(),
          notes = COALESCE(CONCAT(notes, '\n', ?), ?),
          dns_check_result = JSON_SET(
            COALESCE(dns_check_result, JSON_OBJECT()),
            '$.configured_by', 'Super Admin',
            '$.configured_at', NOW(),
            '$.manual_config', true
          )
      WHERE id = ?
    `, [notes || '', notes || '', requestId]);

    // TODO: Enviar email para pastor informando que foi configurado

    res.json({
      success: true,
      message: 'Domínio configurado! DNS propagará em 2-24 horas.',
    });
  } catch (error) {
    console.error('Error configuring domain:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/super-admin/domains/:id/activate
 * Ativar domínio (DNS propagou)
 */
router.post('/domains/:id/activate', isAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const requestId = req.params.id;

    await pool.execute(`
      UPDATE church_domain_requests 
      SET status = 'active',
          dns_verified = 1,
          activated_at = NOW(),
          dns_check_result = JSON_SET(
            COALESCE(dns_check_result, JSON_OBJECT()),
            '$.activated_by', 'Super Admin',
            '$.activated_at', NOW(),
            '$.manual_activation', true
          )
      WHERE id = ?
    `, [requestId]);

    // TODO: Enviar email para pastor informando que está ativo

    res.json({
      success: true,
      message: 'Domínio ativado com sucesso!',
    });
  } catch (error) {
    console.error('Error activating domain:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/super-admin/domains/:id/reject
 * Rejeitar solicitação
 */
router.post('/domains/:id/reject', isAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const requestId = req.params.id;
    const { reason } = req.body;

    await pool.execute(`
      UPDATE church_domain_requests 
      SET status = 'rejected',
          notes = COALESCE(CONCAT(notes, '\nRejeitado: ', ?), ?)
      WHERE id = ?
    `, [reason || '', reason || '', requestId]);

    // TODO: Enviar email para pastor informando rejeição

    res.json({
      success: true,
      message: 'Solicitação rejeitada',
    });
  } catch (error) {
    console.error('Error rejecting domain:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/super-admin/domains/:id
 * Deletar solicitação
 */
router.delete('/domains/:id', isAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const requestId = req.params.id;

    await pool.execute(`
      DELETE FROM church_domain_requests 
      WHERE id = ?
    `, [requestId]);

    res.json({
      success: true,
      message: 'Solicitação deletada',
    });
  } catch (error) {
    console.error('Error deleting domain request:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
