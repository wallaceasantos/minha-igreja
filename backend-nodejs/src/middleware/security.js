/**
 * Middleware: Security - Rate Limiting e Bloqueio de IPs
 * ============================================
 * Protege contra brute force e ataques.
 * 
 * Funcionalidades:
 * - Rate limiting por IP
 * - Verificação de IPs bloqueados
 * - Contador de tentativas de login
 * - Bloqueio automático após falhas
 */

import { getPool } from '../config/database.js';

/**
 * Verificar se IP está bloqueado
 */
export async function checkBlockedIP(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;
  
  if (!ip) {
    return next();
  }

  try {
    const pool = getPool();
    
    const [blocked] = await pool.query(
      'SELECT * FROM blocked_ips WHERE ip_address = ? AND (is_permanent = 1 OR blocked_until > NOW())',
      [ip]
    );

    if (Array.isArray(blocked) && blocked.length > 0) {
      const block = blocked[0];
      
      return res.status(403).json({
        success: false,
        error: 'IP bloqueado',
        reason: block.reason,
        blockedUntil: block.blocked_until,
        isPermanent: !!block.is_permanent,
      });
    }

    next();
  } catch (error) {
    console.error('[Security] Error checking blocked IP:', error);
    next(); // Não bloqueia se houver erro
  }
}

/**
 * Rate limiting simples (sem dependências externas)
 */
const requestCounts = new Map();

export function rateLimit(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutos
    max = 5, // 5 requisições
    message = 'Muitas requisições, tente novamente mais tarde',
  } = options;

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;
    const key = `${ip}-${Math.floor(Date.now() / windowMs)}`;

    const current = requestCounts.get(key) || 0;
    
    if (current >= max) {
      return res.status(429).json({
        success: false,
        error: message,
        retryAfter: Math.ceil(windowMs / 1000),
      });
    }

    requestCounts.set(key, current + 1);

    // Limpar contagem antiga após windowMs
    setTimeout(() => {
      requestCounts.delete(key);
    }, windowMs);

    next();
  };
}

/**
 * Registrar tentativa de login
 */
export async function recordLoginAttempt(email, ip, success, userId = null, failureReason = null) {
  try {
    const pool = getPool();
    
    // Log da tentativa
    await pool.execute(`
      INSERT INTO login_attempts (email, ip_address, success, user_id, failure_reason)
      VALUES (?, ?, ?, ?, ?)
    `, [email, ip, success ? 1 : 0, userId, failureReason]);

    if (!success) {
      // Incrementar contador de falhas
      const [user] = await pool.query(
        'SELECT id, failed_login_attempts, locked_until FROM usuarios_admin WHERE email = ?',
        [email]
      );

      if (Array.isArray(user) && user.length > 0) {
        const currentUser = user[0];
        const newAttempts = (currentUser.failed_login_attempts || 0) + 1;

        // Bloquear após 5 tentativas
        if (newAttempts >= 5) {
          const lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
          
          await pool.execute(`
            UPDATE usuarios_admin 
            SET failed_login_attempts = ?, locked_until = ?, last_failed_login = NOW()
            WHERE email = ?
          `, [newAttempts, lockedUntil, email]);

          // Adicionar IP à lista de bloqueados temporários
          await pool.execute(`
            INSERT INTO blocked_ips (ip_address, reason, blocked_until, is_permanent)
            VALUES (?, 'Múltiplas tentativas de login falhas', DATE_ADD(NOW(), INTERVAL 15 MINUTE), 0)
            ON DUPLICATE KEY UPDATE 
              blocked_until = DATE_ADD(NOW(), INTERVAL 15 MINUTE),
              reason = 'Múltiplas tentativas de login falhas'
          `, [ip]);
        } else {
          await pool.execute(`
            UPDATE usuarios_admin 
            SET failed_login_attempts = ?, last_failed_login = NOW()
            WHERE email = ?
          `, [newAttempts, email]);
        }
      }
    } else {
      // Resetar contador após login bem-sucedido
      await pool.execute(`
        UPDATE usuarios_admin 
        SET failed_login_attempts = 0, locked_until = NULL
        WHERE email = ?
      `, [email]);
    }
  } catch (error) {
    console.error('[Security] Error recording login attempt:', error);
  }
}

/**
 * Verificar se usuário está bloqueado
 */
export async function checkUserLocked(email, req, res, next) {
  try {
    const pool = getPool();
    
    const [user] = await pool.query(
      'SELECT locked_until FROM usuarios_admin WHERE email = ?',
      [email]
    );

    if (Array.isArray(user) && user.length > 0 && user[0].locked_until) {
      const lockedUntil = new Date(user[0].locked_until);
      
      if (lockedUntil > new Date()) {
        return res.status(403).json({
          success: false,
          error: 'Conta temporariamente bloqueada',
          lockedUntil: lockedUntil.toISOString(),
          message: `Sua conta está bloqueada até ${lockedUntil.toLocaleString('pt-BR')}`,
        });
      } else {
        // Desbloquear automaticamente
        await pool.execute(`
          UPDATE usuarios_admin 
          SET locked_until = NULL, failed_login_attempts = 0
          WHERE email = ?
        `, [email]);
      }
    }

    next();
  } catch (error) {
    console.error('[Security] Error checking user locked:', error);
    next();
  }
}

/**
 * Criar sessão de usuário
 */
export async function createSession(userId, req) {
  try {
    const pool = getPool();
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Gerar token único
    const sessionToken = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Expiração: 24 horas
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.execute(`
      INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, sessionToken, ip, userAgent, expiresAt]);

    return sessionToken;
  } catch (error) {
    console.error('[Security] Error creating session:', error);
    return null;
  }
}

/**
 * Verificar sessão válida
 */
export async function validateSession(sessionToken) {
  try {
    const pool = getPool();
    
    const [sessions] = await pool.query(`
      SELECT s.*, u.name as user_name, u.email, u.role
      FROM user_sessions s
      LEFT JOIN usuarios_admin u ON s.user_id = u.id
      WHERE s.session_token = ? 
        AND s.is_active = 1 
        AND s.expires_at > NOW()
    `, [sessionToken]);

    if (Array.isArray(sessions) && sessions.length > 0) {
      // Atualizar última atividade
      await pool.execute(`
        UPDATE user_sessions SET last_activity = NOW()
        WHERE session_token = ?
      `, [sessionToken]);

      return sessions[0];
    }

    return null;
  } catch (error) {
    console.error('[Security] Error validating session:', error);
    return null;
  }
}

/**
 * Destruir sessão
 */
export async function destroySession(sessionToken) {
  try {
    const pool = getPool();
    
    await pool.execute(`
      UPDATE user_sessions SET is_active = 0
      WHERE session_token = ?
    `, [sessionToken]);

    return true;
  } catch (error) {
    console.error('[Security] Error destroying session:', error);
    return false;
  }
}

/**
 * Limpar sessões expiradas (rodar periodicamente)
 */
export async function cleanupExpiredSessions() {
  try {
    const pool = getPool();
    
    const [result] = await pool.execute(`
      DELETE FROM user_sessions 
      WHERE expires_at < NOW() OR is_active = 0
    `);

    console.log(`[Security] Cleaned up ${result.affectedRows} expired sessions`);
    return result.affectedRows;
  } catch (error) {
    console.error('[Security] Error cleaning up sessions:', error);
    return 0;
  }
}

export default {
  checkBlockedIP,
  rateLimit,
  recordLoginAttempt,
  checkUserLocked,
  createSession,
  validateSession,
  destroySession,
  cleanupExpiredSessions,
};
