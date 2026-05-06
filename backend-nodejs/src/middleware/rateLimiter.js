/**
 * Middleware: Rate Limiting Avançado
 * ============================================
 * Protege rotas sensíveis contra brute force e abuso.
 * 
 * Uso:
 * - Login: 5 tentativas por 15 minutos
 * - Registro: 3 por hora
 * - Reset de senha: 3 por hora
 * - APIs sensíveis: 100 por 15 minutos
 */

import { getPool } from '../config/database.js';

// Armazenamento em memória para rate limiting simples
const requestCounts = new Map();
const ipBlockedUntil = new Map();

/**
 * Verificar se IP está bloqueado
 */
export function checkIpBlocked(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;
  
  if (!ip) {
    return next();
  }

  const blockedUntil = ipBlockedUntil.get(ip);
  
  if (blockedUntil && blockedUntil > Date.now()) {
    const minutesLeft = Math.ceil((blockedUntil - Date.now()) / 60000);
    
    return res.status(429).json({
      success: false,
      error: 'IP temporariamente bloqueado',
      message: `Muitas requisições. Tente novamente em ${minutesLeft} minutos.`,
      retryAfter: minutesLeft * 60,
    });
  }

  // Limpar bloqueio expirado
  if (blockedUntil && blockedUntil <= Date.now()) {
    ipBlockedUntil.delete(ip);
  }

  next();
}

/**
 * Criar middleware de rate limiting personalizado
 * @param {Object} options - Configurações do rate limit
 * @param {number} options.windowMs - Janela de tempo em milissegundos
 * @param {number} options.maxRequests - Máximo de requisições na janela
 * @param {string} options.message - Mensagem de erro
 * @param {boolean} options.blockIp - Bloquear IP após exceder limite
 * @param {number} options.blockDurationMs - Duração do bloqueio em ms
 */
export function rateLimit(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutos
    maxRequests = 100,
    message = 'Muitas requisições, tente novamente mais tarde',
    blockIp = false,
    blockDurationMs = 60 * 60 * 1000, // 1 hora
  } = options;

  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;
    const key = `${ip}-${Math.floor(Date.now() / windowMs)}`;

    const current = requestCounts.get(key) || 0;

    if (current >= maxRequests) {
      // Bloquear IP se configurado
      if (blockIp) {
        ipBlockedUntil.set(ip, Date.now() + blockDurationMs);
      }

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
 * Rate limits pré-configurados
 */
export const rateLimits = {
  // Login: 5 tentativas por 15 minutos (bloqueia IP por 1 hora)
  login: rateLimit({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: 'Muitas tentativas de login. Tente novamente mais tarde.',
    blockIp: true,
    blockDurationMs: 60 * 60 * 1000,
  }),

  // Registro: 3 por hora
  register: rateLimit({
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
    message: 'Muitos registros. Tente novamente mais tarde.',
  }),

  // Reset de senha: 3 por hora
  resetPassword: rateLimit({
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
    message: 'Muitas solicitações de reset. Tente novamente mais tarde.',
  }),

  // APIs gerais: 100 por 15 minutos
  general: rateLimit({
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
    message: 'Muitas requisições. Tente novamente mais tarde.',
  }),

  // APIs sensíveis: 50 por 15 minutos
  sensitive: rateLimit({
    windowMs: 15 * 60 * 1000,
    maxRequests: 50,
    message: 'Muitas requisições sensíveis. Tente novamente mais tarde.',
  }),

  // Upload de arquivos: 10 por hora
  upload: rateLimit({
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
    message: 'Muitos uploads. Tente novamente mais tarde.',
  }),

  // Exportação de dados: 5 por hora
  export: rateLimit({
    windowMs: 60 * 60 * 1000,
    maxRequests: 5,
    message: 'Muitas exportações. Tente novamente mais tarde.',
  }),
};

/**
 * Limpar dados antigos de rate limiting (rodar periodicamente)
 */
export function cleanupRateLimitData() {
  const now = Date.now();
  let cleaned = 0;

  // Limpar requestCounts
  for (const [key, value] of requestCounts.entries()) {
    const timestamp = parseInt(key.split('-')[1]) * 15 * 60 * 1000;
    if (now - timestamp > 15 * 60 * 1000) {
      requestCounts.delete(key);
      cleaned++;
    }
  }

  // Limpar ipBlockedUntil expirados
  for (const [ip, until] of ipBlockedUntil.entries()) {
    if (until <= now) {
      ipBlockedUntil.delete(ip);
      cleaned++;
    }
  }

  console.log(`[RateLimit] Cleaned up ${cleaned} expired entries`);
}

// Auto cleanup a cada 15 minutos
setInterval(cleanupRateLimitData, 15 * 60 * 1000);

export default {
  checkIpBlocked,
  rateLimit,
  rateLimits,
  cleanupRateLimitData,
};
