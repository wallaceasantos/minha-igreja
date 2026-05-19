/**
 * Scheduler: Live Status Auto-Change (Com Verificação YouTube API por Igreja)
 * =============================================================================
 * Verifica lives agendadas e muda status automaticamente
 * Usa a API Key propria de cada igreja (se configurada) com fallback global
 *
 * Roda a cada 2 minutos
 */

import { getPool } from '../config/database.js';

const GLOBAL_YOUTUBE_API_KEY = process.env.YOUTUBE_DATA_API_KEY;

// Helper: Obter API Key do YouTube para uma igreja especifica
async function getChurchYoutubeApiKey(churchId) {
  try {
    const pool = getPool();
    const [settings] = await pool.query(
      'SELECT youtube_api_key FROM church_youtube_settings WHERE church_id = ? AND is_connected = 1 LIMIT 1',
      [churchId]
    );
    if (settings.length > 0 && settings[0].youtube_api_key) {
      return settings[0].youtube_api_key;
    }
  } catch (err) {
    // Silencioso - falhar aqui nao deve parar o scheduler
  }
  // Fallback: chave global do desenvolvedor
  return GLOBAL_YOUTUBE_API_KEY;
}

async function updateLiveStatuses() {
  try {
    const pool = getPool();
    const now = new Date();

    // ========================================
    // 1. LIVES AGENDADAS -> AO VIVO
    // ========================================
    const [scheduledStreams] = await pool.query(`
      SELECT id, church_id, youtube_video_id, scheduled_start
      FROM church_live_streams
      WHERE status = 'scheduled'
        AND is_active = 1
        AND youtube_video_id IS NOT NULL
    `);

    for (const stream of scheduledStreams) {
      let isLive = false;

      // Obter API Key: primeira escolhe a da igreja, senao usa a global
      const churchApiKey = await getChurchYoutubeApiKey(stream.church_id);

      if (churchApiKey) {
        try {
          const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${stream.youtube_video_id}&part=liveStreamingDetails&key=${churchApiKey}`;
          const response = await fetch(apiUrl);
          const data = await response.json();

          if (data.items && data.items.length > 0) {
            const details = data.items[0].liveStreamingDetails;
            if (details && details.actualStartTime) {
              isLive = true;
              console.log(`🔴 YouTube API confirmou: "${stream.youtube_video_id}" (igreja ${stream.church_id}) está AO VIVO`);
            }
          }
        } catch (apiError) {
          console.error(`❌ Erro ao consultar API do YouTube para vídeo ${stream.youtube_video_id}:`, apiError.message);
        }
      }
      // Fallback por horário
      else {
        if (new Date(stream.scheduled_start) <= now) {
          isLive = true;
          console.log(`⏰ Verificação por horário: "${stream.youtube_video_id}" deveria estar ao vivo agora`);
        }
      }

      if (isLive) {
        await pool.query(
          `UPDATE church_live_streams SET status = 'live', actual_start = NOW() WHERE id = ?`,
          [stream.id]
        );
        console.log(`✅ Live ID ${stream.id} atualizada para 'live'`);
      }
    }

    // ========================================
    // 2. LIVES AO VIVO -> ENCERRADAS
    // ========================================
    const [liveStreamsToCheck] = await pool.query(`
      SELECT id, church_id, youtube_video_id FROM church_live_streams
      WHERE status = 'live' AND youtube_video_id IS NOT NULL
    `);

    for (const stream of liveStreamsToCheck) {
      const churchApiKey = await getChurchYoutubeApiKey(stream.church_id);

      if (churchApiKey) {
        try {
          const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${stream.youtube_video_id}&part=liveStreamingDetails&key=${churchApiKey}`;
          const response = await fetch(apiUrl);
          const data = await response.json();

          if (data.items?.[0]?.liveStreamingDetails?.actualEndTime) {
            await pool.query(
              'UPDATE church_live_streams SET status = "ended", actual_end = NOW() WHERE id = ?',
              [stream.id]
            );
            console.log(`🏁 YouTube API confirmou fim da live: ID ${stream.id} (igreja ${stream.church_id})`);
            continue;
          }
        } catch (err) {
          console.error(`Erro ao checar fim da live ${stream.id}:`, err.message);
        }
      }
    }

    // Fallback por tempo: encerra lives com mais de 6 horas
    const [endedByTime] = await pool.query(`
      UPDATE church_live_streams
      SET status = 'ended', actual_end = NOW()
      WHERE status = 'live'
        AND actual_start IS NOT NULL
        AND actual_start < DATE_SUB(NOW(), INTERVAL 6 HOUR)
    `);

    if (endedByTime.affectedRows > 0) {
      console.log(`🏁 ${endedByTime.affectedRows} live(s) encerradas automaticamente por tempo limite`);
    }

    // ========================================
    // 3. ENVIAR NOTIFICAÇÕES
    // ========================================
    const [justLive] = await pool.query(`
      SELECT id, church_id, title, last_notification_sent
      FROM church_live_streams
      WHERE status = 'live'
        AND last_notification_sent = 0
    `);

    for (const live of justLive) {
      console.log(`🧹 Limpando chat para a live: ${live.title} (ID: ${live.id})`);
      await pool.query('DELETE FROM live_chat_messages WHERE live_stream_id = ?', [live.id]);

      console.log(`📧 Enviando notificações para live: ${live.title}`);
      try {
        await fetch(`http://localhost:3000/api/live/notify/send-all`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ church_id: live.church_id, live_stream_id: live.id }),
        }).then(r => r.json()).then(d => console.log(`Notificações enviadas: ${d.message}`));
      } catch (e) {
        console.error(`Error sending notifications:`, e.message);
      }

      await pool.query('UPDATE church_live_streams SET last_notification_sent = 1 WHERE id = ?', [live.id]);
    }

  } catch (error) {
    console.error('❌ Error in live status scheduler:', error);
  }
}

// Executar a cada 2 minutos
setInterval(updateLiveStatuses, 2 * 60 * 1000);

// Executar imediatamente ao iniciar
updateLiveStatuses();

if (!GLOBAL_YOUTUBE_API_KEY) {
  console.warn('⚠️  YOUTUBE_DATA_API_KEY (global) nao encontrada. Usando verificação por horario como fallback.');
} else {
  console.log('✅ Live Status Scheduler iniciado (API Key por igreja + fallback global, rodando a cada 2 min)');
}

export default updateLiveStatuses;
