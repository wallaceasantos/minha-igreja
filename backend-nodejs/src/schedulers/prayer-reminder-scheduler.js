/**
 * Prayer Reminder Scheduler
 * ============================================
 * Verifica e envia lembretes de pedidos de oração pendentes antigos.
 *
 * Funcionamento:
 * - Verifica a cada 1 hora se há pedidos pendentes com > 7 dias
 * - Notifica o admin da igreja sobre pedidos que precisam de atenção
 * - Atualiza campo last_reminder_at para controle
 */

import { getPool } from '../config/database.js';

let schedulerInterval = null;
let isRunning = false;

// Configurações
const REMINDER_THRESHOLD_DAYS = 7; // Pedidos com mais de 7 dias
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hora

/**
 * Enviar lembrete para a igreja sobre pedidos pendentes antigos
 */
async function sendReminderToChurch(churchId, oldPedidos) {
  const pool = getPool();

  try {
    // Buscar informações da igreja
    const [churches] = await pool.query(
      'SELECT name, email FROM churches WHERE id = ? AND is_active = 1 LIMIT 1',
      [churchId]
    );

    if (!Array.isArray(churches) || churches.length === 0) {
      console.error(`[PrayerReminder] Igreja ${churchId} não encontrada ou inativa`);
      return false;
    }

    const church = churches[0];
    const churchEmail = church.email;

    console.log(`[PrayerReminder] Enviando lembrete para ${church.name} (${churchEmail}) sobre ${oldPedidos.length} pedido(s) antigo(s)`);

    // Atualizar pedidos com último lembrete
    const pedidoIds = oldPedidos.map(p => p.id);
    if (pedidoIds.length > 0) {
      // Criar placeholders para IN clause
      const placeholders = pedidoIds.map(() => '?').join(',');
      await pool.execute(`
        UPDATE pedidos SET
          last_reminder_at = NOW()
        WHERE id IN (${placeholders})
      `, pedidoIds);
    }

    // TODO: Criar notificação quando tabela existir
    // TODO: Enviar email quando integração estiver disponível

    console.log(`[PrayerReminder] Lembrete enviado para ${church.name} com sucesso!`);
    return true;
  } catch (error) {
    console.error(`[PrayerReminder] Erro ao enviar lembrete para igreja ${churchId}:`, error);
    return false;
  }
}

/**
 * Verificar e enviar lembretes de pedidos pendentes antigos
 */
async function checkAndSendReminders() {
  if (isRunning) {
    console.log('[PrayerReminder] Já está executando, pulando esta verificação...');
    return;
  }

  isRunning = true;

  try {
    const pool = getPool();

    // Buscar pedidos pendentes com mais de 7 dias, agrupados por igreja
    // Apenas pedidos que nunca foram lembrados ou foram lembrados há mais de 24 horas
    const [oldPedidos] = await pool.query(`
      SELECT 
        p.id,
        p.church_id,
        p.titulo,
        p.oracao,
        p.created_at,
        p.last_reminder_at,
        c.name as church_name,
        c.email
      FROM pedidos p
      INNER JOIN churches c ON p.church_id = c.id
      WHERE p.status = 'pending'
        AND p.created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
        AND c.is_active = 1
        AND (p.last_reminder_at IS NULL OR p.last_reminder_at < DATE_SUB(NOW(), INTERVAL 24 HOUR))
      ORDER BY p.church_id, p.created_at ASC
    `, [REMINDER_THRESHOLD_DAYS]);

    if (!Array.isArray(oldPedidos) || oldPedidos.length === 0) {
      console.log('[PrayerReminder] Nenhum pedido pendente antigo encontrado');
      return;
    }

    // Agrupar pedidos por igreja
    const pedidosPorIgreja = oldPedidos.reduce((acc, pedido) => {
      if (!acc[pedido.church_id]) {
        acc[pedido.church_id] = [];
      }
      acc[pedido.church_id].push(pedido);
      return acc;
    }, {});

    const churchIds = Object.keys(pedidosPorIgreja);
    console.log(`[PrayerReminder] ${oldPedidos.length} pedido(s) pendente(s) antigo(s) em ${churchIds.length} igreja(s)`);

    // Enviar lembrete para cada igreja
    for (const churchId of churchIds) {
      const pedidos = pedidosPorIgreja[churchId];
      await sendReminderToChurch(churchId, pedidos);
    }

    console.log(`[PrayerReminder] Todos os lembretes foram processados`);
  } catch (error) {
    console.error('[PrayerReminder] Erro ao verificar pedidos pendentes:', error);
  } finally {
    isRunning = false;
  }
}

/**
 * Iniciar o scheduler
 */
export function startScheduler() {
  if (schedulerInterval) {
    console.log('[PrayerReminder] Já está em execução');
    return;
  }

  console.log('[PrayerReminder] Iniciando scheduler de lembretes (verifica a cada 1 hora)');

  // Verificar imediatamente ao iniciar
  checkAndSendReminders();

  // Verificar a cada 1 hora (3600000 ms)
  schedulerInterval = setInterval(checkAndSendReminders, CHECK_INTERVAL_MS);
}

/**
 * Parar o scheduler
 */
export function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[PrayerReminder] Parado');
  }
}

/**
 * Verificar se está rodando
 */
export function isSchedulerRunning() {
  return schedulerInterval !== null;
}

export default {
  startScheduler,
  stopScheduler,
  isSchedulerRunning,
  checkAndSendReminders,
};
