/**
 * Middleware: Audit Logs
 * ============================================
 * Registra automaticamente ações importantes no sistema
 * para fins de auditoria e segurança.
 *
 * Uso:
 * - Adicionar como middleware em rotas que precisam de auditoria
 * - Ou chamar a função logAudit manualmente
 */

import { getPool } from '../config/database.js';

/**
 * Ações que serão registradas nos logs
 */
export const AuditActions = {
  // Igrejas
  CHURCH_CREATED: 'church.created',
  CHURCH_UPDATED: 'church.updated',
  CHURCH_DELETED: 'church.deleted',
  CHURCH_SUSPENDED: 'church.suspended',
  CHURCH_REACTIVATED: 'church.reactivated',
  CHURCH_PLAN_CHANGED: 'church.plan_changed',
  
  // Usuários
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_BANNED: 'user.banned',
  USER_REACTIVATED: 'user.reactivated',
  USER_PASSWORD_RESET: 'user.password_reset',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  
  // Financeiro
  INVOICE_CREATED: 'invoice.created',
  INVOICE_PAID: 'invoice.paid',
  INVOICE_CANCELLED: 'invoice.cancelled',
  PAYMENT_RECEIVED: 'payment.received',
  PAYMENT_REFUNDED: 'payment.refunded',
  
  // Assinaturas
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  SUBSCRIPTION_RENEWED: 'subscription.renewed',
  
  // Membros
  MEMBER_CREATED: 'member.created',
  MEMBER_UPDATED: 'member.updated',
  MEMBER_DELETED: 'member.deleted',
  
  // Pedidos de Oração
  PRAYER_CREATED: 'prayer.created',
  PRAYER_ANSWERED: 'prayer.answered',
  PRAYER_ARCHIVED: 'prayer.archived',
  
  // Eventos
  EVENT_CREATED: 'event.created',
  EVENT_UPDATED: 'event.updated',
  EVENT_DELETED: 'event.deleted',
  
  // Sistema
  SETTINGS_CHANGED: 'settings.changed',
  EXPORT_DATA: 'export.data',
  REPORT_GENERATED: 'report.generated',
};

/**
 * Middleware para registrar logs de auditoria
 * 
 * @param {string} action - Ação que será registrada (use AuditActions)
 * @param {function} detailsExtractor - Função opcional para extrair detalhes da request
 */
export function auditLog(action, detailsExtractor = null) {
  return async (req, res, next) => {
    // Armazenar referência ao método original para capturar a resposta
    const originalJson = res.json;
    const originalSend = res.send;
    
    // Capturar dados da resposta
    let responseData = null;
    
    res.json = function(data) {
      responseData = data;
      return originalJson.call(this, data);
    };
    
    res.send = function(data) {
      responseData = data;
      return originalSend.call(this, data);
    };
    
    // Continuar com a request
    await next();
    
    // Registrar log após a request ser processada
    // Usar setImmediate para não bloquear a resposta
    setImmediate(async () => {
      try {
        const pool = getPool();
        
        // Extrair detalhes
        let details = null;
        if (detailsExtractor && typeof detailsExtractor === 'function') {
          details = detailsExtractor(req, responseData);
        } else if (responseData) {
          details = JSON.stringify(responseData);
        }
        
        // Extrair dados do usuário
        const userId = req.userId || req.user?.id || req.headers['x-user-id'] || null;
        const churchId = req.churchId || req.user?.churchId || req.headers['x-church-id'] || null;
        
        // Obter IP e User Agent
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || null;
        const userAgent = req.headers['user-agent'] || null;
        
        // Inserir log no banco
        await pool.query(`
          INSERT INTO audit_logs (church_id, user_id, action, details, ip_address, user_agent)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [churchId, userId, action, details, ipAddress, userAgent]);
        
        console.log(`[AUDIT] ${action} - User: ${userId} - Church: ${churchId}`);
      } catch (error) {
        console.error('[AUDIT ERROR] Failed to log action:', error);
        // Não lançar erro para não quebrar a request original
      }
    });
  };
}

/**
 * Função utilitária para registrar logs manualmente
 * 
 * @param {Object} options - Opções do log
 * @param {string} options.action - Ação realizada
 * @param {number} options.userId - ID do usuário
 * @param {number} options.churchId - ID da igreja (opcional)
 * @param {string} options.details - Detalhes da ação (JSON string)
 * @param {string} options.ipAddress - IP do usuário
 * @param {string} options.userAgent - User agent do navegador
 */
export async function logAudit({ action, userId, churchId = null, details = null, ipAddress = null, userAgent = null }) {
  try {
    const pool = getPool();
    
    await pool.query(`
      INSERT INTO audit_logs (church_id, user_id, action, details, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [churchId, userId, action, details, ipAddress, userAgent]);
    
    console.log(`[AUDIT] ${action} - User: ${userId} - Church: ${churchId}`);
  } catch (error) {
    console.error('[AUDIT ERROR] Failed to log action:', error);
  }
}

/**
 * Helper para extrair detalhes de uma request
 */
export function extractDetails(req, responseData, fields = []) {
  const details = {};
  
  // Adicionar campos do body
  fields.forEach(field => {
    if (req.body?.[field] !== undefined) {
      details[field] = req.body[field];
    }
  });
  
  // Adicionar campos dos params
  fields.forEach(field => {
    if (req.params?.[field] !== undefined) {
      details[`${field}_id`] = req.params[field];
    }
  });
  
  // Adicionar status da resposta
  if (responseData?.success !== undefined) {
    details.success = responseData.success;
  }
  
  return JSON.stringify(details);
}

export default { auditLog, logAudit, AuditActions, extractDetails };
