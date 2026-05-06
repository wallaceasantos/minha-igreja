/**
 * Middleware: Access Logger
 * ============================================
 * Registra todas as requisições para análise de páginas mais acessadas.
 * 
 * Uso:
 * - Adicionar como middleware global no server.js
 * - Registra path, método, status, duração, IP, user agent
 * - Salva no banco de dados na tabela access_logs
 */

import { getPool } from '../config/database.js';

/**
 * Middleware para logar acessos
 */
export function accessLogger(req, res, next) {
  // Capturar tempo de início
  const startTime = Date.now();
  
  // Capturar dados da requisição
  const logData = {
    path: req.path,
    method: req.method,
    ip: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent'],
    referer: req.headers['referer'],
    userId: req.userId || req.headers['x-user-id'] || null,
    churchId: req.churchId || (req.headers['x-church-id'] && req.headers['x-church-id'] !== 'undefined' ? req.headers['x-church-id'] : null),
    queryParams: req.query,
  };
  
  // Capturar quando a resposta terminar
  res.on('finish', async () => {
    const duration = Date.now() - startTime;
    
    // Ignorar rotas de health check e estáticos
    if (shouldIgnoreLog(req.path)) {
      return;
    }
    
    try {
      const pool = getPool();

      // Converter churchId para inteiro ou null
      const churchIdInt = logData.churchId && logData.churchId !== 'undefined' && logData.churchId !== null
        ? parseInt(logData.churchId)
        : null;

      await pool.execute(`
        INSERT INTO access_logs (
          path, method, status, duration, ip_address, user_agent,
          user_id, church_id, referer, query_params, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        logData.path,
        logData.method,
        res.statusCode,
        duration,
        logData.ip,
        logData.userAgent,
        logData.userId || null,
        churchIdInt,
        logData.referer,
        logData.queryParams ? JSON.stringify(logData.queryParams) : null,
      ]);
      
      // Log em desenvolvimento (opcional)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[ACCESS] ${logData.method} ${logData.path} ${res.statusCode} ${duration}ms`);
      }
    } catch (error) {
      // Não lançar erro para não quebrar a requisição
      console.error('[ACCESS LOGGER ERROR]', error.message);
    }
  });
  
  next();
}

/**
 * Verificar se deve ignorar o log
 * Rotas que não precisamos rastrear
 */
function shouldIgnoreLog(path) {
  const ignoredPaths = [
    '/health',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
  ];
  
  // Ignorar arquivos estáticos
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
  const hasStaticExtension = staticExtensions.some(ext => path.toLowerCase().endsWith(ext));
  
  return ignoredPaths.includes(path) || hasStaticExtension;
}

/**
 * Helper para limpar logs antigos (manter apenas 30 dias)
 * Chamar periodicamente (ex: uma vez por dia)
 */
export async function cleanupOldLogs(daysToKeep = 30) {
  try {
    const pool = getPool();
    
    const [result] = await pool.execute(`
      DELETE FROM access_logs
      WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
    `, [daysToKeep]);
    
    console.log(`[CLEANUP] ${result.affectedRows} logs antigos removidos`);
    return result.affectedRows;
  } catch (error) {
    console.error('[CLEANUP ERROR]', error.message);
    return 0;
  }
}

export default {
  accessLogger,
  cleanupOldLogs,
  shouldIgnoreLog,
};
