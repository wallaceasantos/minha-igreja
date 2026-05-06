/**
 * API: Super Admin - Segurança
 * ============================================
 * Rotas para gerenciar segurança do sistema.
 *
 * Rotas:
 * GET    /api/admin/security/stats            - Estatísticas de segurança
 * GET    /api/admin/security/sessions         - Listar sessões ativas
 * DELETE /api/admin/security/sessions/:id     - Revogar sessão
 * GET    /api/admin/security/blocked-ips      - Listar IPs bloqueados
 * DELETE /api/admin/security/blocked-ips/:id  - Desbloquear IP
 * GET    /api/admin/security/login-attempts   - Listar tentativas de login
 */

import express from 'express';
import { getPool } from '../config/database.js';
import { isAdmin } from '../middleware/permissions.js';
import { rateLimits } from '../middleware/rateLimiter.js';

const router = express.Router();

// Rate limiting para rotas sensíveis de segurança
router.use('/security', rateLimits.sensitive);

/**
 * GET /api/admin/security/stats
 * Estatísticas de segurança
 */
router.get('/security/stats', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    // Sessões ativas
    const [activeSessions] = await pool.query(`
      SELECT COUNT(*) as count FROM user_sessions WHERE is_active = 1 AND expires_at > NOW()
    `);

    // IPs bloqueados
    const [blockedIPs] = await pool.query(`
      SELECT COUNT(*) as count FROM blocked_ips WHERE is_permanent = 1 OR blocked_until > NOW()
    `);

    // Tentativas falhas (24h)
    const [failedAttempts] = await pool.query(`
      SELECT COUNT(*) as count FROM login_attempts 
      WHERE success = 0 AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);

    // Contas bloqueadas
    const [lockedAccounts] = await pool.query(`
      SELECT COUNT(*) as count FROM usuarios_admin 
      WHERE locked_until > NOW()
    `);

    // Top 5 IPs com mais tentativas falhas (24h)
    const [topIPs] = await pool.query(`
      SELECT ip_address, COUNT(*) as attempts
      FROM login_attempts
      WHERE success = 0 AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY ip_address
      ORDER BY attempts DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        activeSessions: Array.isArray(activeSessions) ? activeSessions[0].count : 0,
        blockedIPs: Array.isArray(blockedIPs) ? blockedIPs[0].count : 0,
        failedAttempts: Array.isArray(failedAttempts) ? failedAttempts[0].count : 0,
        lockedAccounts: Array.isArray(lockedAccounts) ? lockedAccounts[0].count : 0,
        topIPs: Array.isArray(topIPs) ? topIPs : [],
      },
    });
  } catch (error) {
    console.error('Error fetching security stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/security/sessions
 * Listar sessões ativas
 */
router.get('/security/sessions', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [sessions] = await pool.query(`
      SELECT 
        s.id,
        s.session_token,
        s.user_id,
        u.name as user_name,
        u.email as user_email,
        s.ip_address,
        s.user_agent,
        s.device_info,
        s.created_at,
        s.last_activity,
        s.expires_at,
        s.is_active,
        CASE 
          WHEN s.is_active = 0 THEN 'Inativa'
          WHEN s.expires_at < NOW() THEN 'Expirada'
          ELSE 'Ativa'
        END as status
      FROM user_sessions s
      LEFT JOIN usuarios_admin u ON s.user_id = u.id
      ORDER BY s.last_activity DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);

    // Total
    const [total] = await pool.query(`
      SELECT COUNT(*) as count FROM user_sessions WHERE is_active = 1
    `);

    res.json({
      success: true,
      data: {
        sessions: Array.isArray(sessions) ? sessions : [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: Array.isArray(total) ? total[0].count : 0,
          totalPages: Math.ceil((Array.isArray(total) ? total[0].count : 0) / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/admin/security/sessions/:id
 * Revogar sessão
 */
router.delete('/security/sessions/:id', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const sessionId = req.params.id;

    const [result] = await pool.execute(`
      UPDATE user_sessions SET is_active = 0 WHERE id = ?
    `, [sessionId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Sessão não encontrada',
      });
    }

    res.json({
      success: true,
      message: 'Sessão revogada com sucesso!',
    });
  } catch (error) {
    console.error('Error revoking session:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/admin/security/sessions/revoke-all
 * Revogar TODAS as sessões
 */
router.delete('/security/sessions/revoke-all', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const [result] = await pool.execute(`
      UPDATE user_sessions SET is_active = 0 WHERE is_active = 1
    `);

    res.json({
      success: true,
      message: `${result.affectedRows} sessões revogadas com sucesso!`,
      revokedCount: result.affectedRows,
    });
  } catch (error) {
    console.error('Error revoking all sessions:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/security/blocked-ips
 * Listar IPs bloqueados
 */
router.get('/security/blocked-ips', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [ips] = await pool.query(`
      SELECT 
        b.id,
        b.ip_address,
        b.reason,
        b.blocked_until,
        b.is_permanent,
        b.created_at,
        u.name as blocked_by_name,
        u.email as blocked_by_email,
        CASE 
          WHEN b.is_permanent = 1 THEN 'Permanente'
          WHEN b.blocked_until < NOW() THEN 'Expirado'
          ELSE 'Ativo'
        END as status
      FROM blocked_ips b
      LEFT JOIN usuarios_admin u ON b.created_by = u.id
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), parseInt(offset)]);

    // Total
    const [total] = await pool.query(`
      SELECT COUNT(*) as count FROM blocked_ips
    `);

    res.json({
      success: true,
      data: {
        blockedIPs: Array.isArray(ips) ? ips : [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: Array.isArray(total) ? total[0].count : 0,
          totalPages: Math.ceil((Array.isArray(total) ? total[0].count : 0) / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching blocked IPs:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/admin/security/blocked-ips/:id
 * Desbloquear IP
 */
router.delete('/security/blocked-ips/:id', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const ipId = req.params.id;

    const [result] = await pool.execute(`
      DELETE FROM blocked_ips WHERE id = ?
    `, [ipId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'IP não encontrado',
      });
    }

    res.json({
      success: true,
      message: 'IP desbloqueado com sucesso!',
    });
  } catch (error) {
    console.error('Error unblocking IP:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/security/login-attempts
 * Listar tentativas de login
 */
router.get('/security/login-attempts', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const { page = 1, limit = 50, success } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (success !== undefined) {
      whereClause += ' AND success = ?';
      params.push(success === 'true' ? 1 : 0);
    }

    const [attempts] = await pool.query(`
      SELECT 
        l.*,
        u.name as user_name,
        u.email as matched_email
      FROM login_attempts l
      LEFT JOIN usuarios_admin u ON l.user_id = u.id
      ${whereClause}
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    // Total
    const [total] = await pool.query(`
      SELECT COUNT(*) as count FROM login_attempts ${whereClause}
    `, params);

    res.json({
      success: true,
      data: {
        attempts: Array.isArray(attempts) ? attempts : [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: Array.isArray(total) ? total[0].count : 0,
          totalPages: Math.ceil((Array.isArray(total) ? total[0].count : 0) / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching login attempts:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
