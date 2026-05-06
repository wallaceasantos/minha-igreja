/**
 * API: Admin - Domínio Próprio
 * ============================================
 * Rotas para verificação e solicitação de domínio próprio
 *
 * Rotas:
 * POST   /api/admin/domain/validate     - Validar formato do domínio
 * GET    /api/admin/domain/check        - Verificar se domínio já está em uso
 * GET    /api/admin/domain/dns-check    - Check básico de DNS
 * POST   /api/admin/domain/request      - Solicitar domínio
 * GET    /api/admin/domain/requests     - Listar solicitações (Super Admin)
 */

import express from 'express';
import { getPool } from '../config/database.js';
import { isAdmin } from '../middleware/permissions.js';

const router = express.Router();

/**
 * Validação de formato de domínio
 */
function isValidDomain(domain) {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return domainRegex.test(domain);
}

/**
 * POST /api/admin/domain/validate
 * Validar formato do domínio
 */
router.post('/validate', async (req, res) => {
  try {
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domínio é obrigatório',
      });
    }

    // Validar formato
    const valid = isValidDomain(domain);

    if (!valid) {
      return res.json({
        success: false,
        valid: false,
        message: 'Formato de domínio inválido. Exemplo: www.suaigreja.com.br',
      });
    }

    res.json({
      success: true,
      valid: true,
      message: 'Formato de domínio válido!',
    });

  } catch (error) {
    console.error('Error validating domain:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/domain/check
 * Verificar se domínio já está cadastrado no sistema
 */
router.get('/check', async (req, res) => {
  try {
    const { domain } = req.query;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domínio é obrigatório',
      });
    }

    const pool = getPool();

    // Verificar se já está cadastrado
    const [requests] = await pool.query(`
      SELECT * FROM church_domain_requests
      WHERE requested_domain = ?
      AND status IN ('verified', 'configured', 'active')
      LIMIT 1
    `, [domain]);

    const isRegistered = Array.isArray(requests) && requests.length > 0;

    res.json({
      success: true,
      isRegistered,
      message: isRegistered 
        ? 'Domínio já está cadastrado no sistema' 
        : 'Domínio disponível para configuração',
    });

  } catch (error) {
    console.error('Error checking domain:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/domain/dns-check
 * Check básico de DNS (verifica se já tem registros)
 */
router.get('/dns-check', async (req, res) => {
  try {
    const { domain } = req.query;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domínio é obrigatório',
      });
    }

    // Nota: Em produção, usaríamos uma API de DNS real
    // Por enquanto, apenas validamos o formato
    const hasValidFormat = isValidDomain(domain);

    res.json({
      success: true,
      hasDNS: false, // Em produção: verificar DNS real
      hasValidFormat,
      message: hasValidFormat 
        ? 'Formato válido. DNS será verificado após solicitação.' 
        : 'Formato de domínio inválido',
    });

  } catch (error) {
    console.error('Error checking DNS:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/domain/request
 * Solicitar domínio próprio
 */
router.post('/request', isAdmin, async (req, res) => {
  try {
    const { church_id, domain, dns_provider } = req.body;

    if (!church_id || !domain) {
      return res.status(400).json({
        success: false,
        error: 'church_id e domain são obrigatórios',
      });
    }

    // Validar formato
    const valid = isValidDomain(domain);
    if (!valid) {
      return res.status(400).json({
        success: false,
        error: 'Formato de domínio inválido',
      });
    }

    const pool = getPool();

    // Verificar se já não está solicitado
    const [existing] = await pool.query(`
      SELECT * FROM church_domain_requests
      WHERE requested_domain = ?
      AND church_id = ?
      AND status IN ('pending', 'verified', 'configured', 'active')
      LIMIT 1
    `, [domain, church_id]);

    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Você já solicitou este domínio',
      });
    }

    // Inserir solicitação
    await pool.execute(`
      INSERT INTO church_domain_requests
      (church_id, requested_domain, status, dns_provider, dns_check_result)
      VALUES (?, ?, 'pending', ?, ?)
    `, [church_id, domain, dns_provider || null, JSON.stringify({
      checked_at: new Date().toISOString(),
      hasValidFormat: true,
    })]);

    // TODO: Enviar e-mail para o Super Admin configurar

    res.json({
      success: true,
      message: 'Solicitação de domínio enviada! Você receberá instruções por e-mail.',
    });

  } catch (error) {
    console.error('Error requesting domain:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/domain/requests
 * Listar solicitações de domínio (Super Admin)
 */
router.get('/requests', isAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const whereClauses = [];
    const params = [];

    if (status) {
      whereClauses.push('status = ?');
      params.push(status);
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [requests] = await pool.query(`
      SELECT 
        r.*,
        c.name as church_name,
        c.email as church_email
      FROM church_domain_requests r
      JOIN churches c ON r.church_id = c.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    const [totalResult] = await pool.query(`
      SELECT COUNT(*) as count
      FROM church_domain_requests r
      ${whereClause}
    `, params);

    res.json({
      success: true,
      data: {
        requests: Array.isArray(requests) ? requests : [],
        total: Array.isArray(totalResult) ? totalResult[0].count : 0,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    });

  } catch (error) {
    console.error('Error fetching domain requests:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
