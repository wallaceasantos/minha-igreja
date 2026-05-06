/**
 * Announcement Scheduler
 * ============================================
 * Verifica e envia comunicados agendados automaticamente.
 * 
 * Funcionamento:
 * - Verifica a cada 1 minuto se há comunicados agendados para enviar
 * - Envia automaticamente quando chega a data/hora programada
 * - Atualiza status para 'sent' após envio
 * - Registra recipients para todas as igrejas alvo
 */

import { getPool } from '../config/database.js';

let schedulerInterval = null;
let isRunning = false;

/**
 * Enviar comunicado para as igrejas alvo
 */
async function sendAnnouncement(announcementId) {
  const pool = getPool();

  try {
    console.log(`[Scheduler] Enviando comunicado ${announcementId}...`);

    // Buscar comunicado
    const [announcements] = await pool.query(
      'SELECT * FROM announcements WHERE id = ?',
      [announcementId]
    );

    if (!Array.isArray(announcements) || announcements.length === 0) {
      console.error(`[Scheduler] Comunicado ${announcementId} não encontrado`);
      return false;
    }

    const announcement = announcements[0];

    // Determinar igrejas alvo
    let churchIds = [];

    if (announcement.target_audience === 'all') {
      const [allChurches] = await pool.query('SELECT id FROM churches WHERE is_active = 1');
      churchIds = allChurches.map((c) => c.id);
    } else if (announcement.target_audience === 'specific' && announcement.target_churches) {
      churchIds = JSON.parse(announcement.target_churches);
    } else {
      const [filteredChurches] = await pool.query(
        'SELECT id FROM churches WHERE is_active = 1 AND plan_type = ?',
        [announcement.target_audience]
      );
      churchIds = filteredChurches.map((c) => c.id);
    }

    console.log(`[Scheduler] Comunicado ${announcementId} será enviado para ${churchIds.length} igrejas`);

    // Inserir registros de recebimento
    if (churchIds.length > 0) {
      const values = churchIds.map(churchId => 
        `(${announcementId}, ${churchId}, 'sent', NOW())`
      ).join(',');

      await pool.query(`
        INSERT INTO announcement_recipients (announcement_id, church_id, status, sent_at)
        VALUES ${values}
      `);
    }

    // Atualizar status do comunicado
    await pool.execute(`
      UPDATE announcements SET
        status = 'sent',
        sent_at = NOW()
      WHERE id = ?
    `, [announcementId]);

    console.log(`[Scheduler] Comunicado ${announcementId} enviado com sucesso!`);

    // TODO: Enviar emails se send_method for 'email' ou 'both'
    // Isso requer integração com serviço de email (SendGrid, AWS SES, etc.)
    if (announcement.send_method === 'email' || announcement.send_method === 'both') {
      console.log(`[Scheduler] Emails seriam enviados para ${churchIds.length} igrejas (integração pendente)`);
    }

    return true;
  } catch (error) {
    console.error(`[Scheduler] Erro ao enviar comunicado ${announcementId}:`, error);
    return false;
  }
}

/**
 * Verificar e enviar comunicados agendados
 */
async function checkAndSendAnnouncements() {
  if (isRunning) {
    console.log('[Scheduler] Já está executando, pulando esta verificação...');
    return;
  }

  isRunning = true;

  try {
    const pool = getPool();

    // Buscar comunicados agendados que devem ser enviados agora
    const [dueAnnouncements] = await pool.query(`
      SELECT id, title, scheduled_at
      FROM announcements
      WHERE status = 'scheduled'
        AND scheduled_at <= NOW()
      ORDER BY scheduled_at ASC
    `);

    if (Array.isArray(dueAnnouncements) && dueAnnouncements.length > 0) {
      console.log(`[Scheduler] ${dueAnnouncements.length} comunicado(s) agendado(s) para enviar`);

      for (const announcement of dueAnnouncements) {
        await sendAnnouncement(announcement.id);
      }

      console.log(`[Scheduler] Todos os comunicados agendados foram processados`);
    }
  } catch (error) {
    console.error('[Scheduler] Erro ao verificar comunicados:', error);
  } finally {
    isRunning = false;
  }
}

/**
 * Iniciar o scheduler
 */
export function startScheduler() {
  if (schedulerInterval) {
    console.log('[Scheduler] Já está em execução');
    return;
  }

  console.log('[Scheduler] Iniciando scheduler de comunicados (verifica a cada 1 minuto)');

  // Verificar imediatamente ao iniciar
  checkAndSendAnnouncements();

  // Verificar a cada 1 minuto (60000 ms)
  schedulerInterval = setInterval(checkAndSendAnnouncements, 60000);
}

/**
 * Parar o scheduler
 */
export function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[Scheduler] Parado');
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
  checkAndSendAnnouncements,
};
