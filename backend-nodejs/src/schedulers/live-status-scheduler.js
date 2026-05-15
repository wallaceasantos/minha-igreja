/**
<<<<<<< HEAD
=======
<<<<<<< HEAD
 * Scheduler: Live Status Auto-Change (Com Verificação YouTube API)
 * ============================================
 * Verifica lives agendadas e muda status automaticamente
 * Usa a API do YouTube para confirmar se a live realmente começou
=======
>>>>>>> 0d9215edaec305cf40940fe60c9dccd88f667747
 * Scheduler: Live Status Auto-Change (Com Verificação YouTube API por Igreja)
 * =============================================================================
 * Verifica lives agendadas e muda status automaticamente
 * Usa a API Key propria de cada igreja (se configurada) com fallback global
<<<<<<< HEAD
=======
>>>>>>> 8b6745c (feat: inclusão da live pelo youtube)
>>>>>>> 0d9215edaec305cf40940fe60c9dccd88f667747
 *
 * Roda a cada 2 minutos
 */

import { getPool } from '../config/database.js';

<<<<<<< HEAD
=======
<<<<<<< HEAD
const YOUTUBE_API_KEY = process.env.YOUTUBE_DATA_API_KEY;
=======
>>>>>>> 0d9215edaec305cf40940fe60c9dccd88f667747
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
<<<<<<< HEAD
=======
>>>>>>> 8b6745c (feat: inclusão da live pelo youtube)
>>>>>>> 0d9215edaec305cf40940fe60c9dccd88f667747

async function updateLiveStatuses() {
  try {
    const pool = getPool();
    const now = new Date();

<<<<<<< HEAD
=======
<<<<<<< HEAD
    // 1. Buscar todas as lives agendadas
    const [scheduledStreams] = await pool.query(`
      SELECT id, youtube_video_id, scheduled_start
      FROM church_live_streams 
      WHERE status = 'scheduled' 
        AND is_active = 1 
=======
>>>>>>> 0d9215edaec305cf40940fe60c9dccd88f667747
    // ========================================
    // 1. LIVES AGENDADAS -> AO VIVO
    // ========================================
    const [scheduledStreams] = await pool.query(`
      SELECT id, church_id, youtube_video_id, scheduled_start
      FROM church_live_streams
      WHERE status = 'scheduled'
        AND is_active = 1
<<<<<<< HEAD
=======
>>>>>>> 8b6745c (feat: inclusão da live pelo youtube)
>>>>>>> 0d9215edaec305cf40940fe60c9dccd88f667747
        AND youtube_video_id IS NOT NULL
    `);

    for (const stream of scheduledStreams) {
      let isLive = false;

<<<<<<< HEAD
=======
<<<<<<< HEAD
      // 2. Verificação via API do YouTube (se chave configurada)
      if (YOUTUBE_API_KEY) {
        try {
          const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${stream.youtube_video_id}&part=liveStreamingDetails&key=${YOUTUBE_API_KEY}`;
=======
>>>>>>> 0d9215edaec305cf40940fe60c9dccd88f667747
      // Obter API Key: primeira escolhe a da igreja, senao usa a global
      const churchApiKey = await getChurchYoutubeApiKey(stream.church_id);

      if (churchApiKey) {
        try {
          const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${stream.youtube_video_id}&part=liveStreamingDetails&key=${churchApiKey}`;
<<<<<<< HEAD
=======
>>>>>>> 8b6745c (feat: inclusão da live pelo youtube)
>>>>>>> 0d9215edaec305cf40940fe60c9dccd88f667747
          const response = await fetch(apiUrl);
          const data = await response.json();

          if (data.items && data.items.length > 0) {
            const details = data.items[0].liveStreamingDetails;
<<<<<<< HEAD
            if (details && details.actualStartTime) {
              isLive = true;
              console.log(`🔴 YouTube API confirmou: "${stream.youtube_video_id}" (igreja ${stream.church_id}) está AO VIVO`);
=======
<<<<<<< HEAD
            // Se existe 'actualStartTime', o YouTube confirmou que a live começou
            if (details && details.actualStartTime) {
              isLive = true;
              console.log(`🔴 YouTube API confirmou: "${stream.youtube_video_id}" está AO VIVO`);
=======
            if (details && details.actualStartTime) {
              isLive = true;
              console.log(`🔴 YouTube API confirmou: "${stream.youtube_video_id}" (igreja ${stream.church_id}) está AO VIVO`);
>>>>>>> 8b6745c (feat: inclusão da live pelo youtube)
>>>>>>> 0d9215edaec305cf40940fe60c9dccd88f667747
            }
          }
        } catch (apiError) {
          console.error(`❌ Erro ao consultar API do YouTube para vídeo ${stream.youtube_video_id}:`, apiError.message);
        }
<<<<<<< HEAD
      }
      // Fallback por horário
=======
<<<<<<< HEAD
      } 
      // 3. Fallback: Verificação por Horário (se chave API não configurada)
=======
      }
      // Fallback por horário
>>>>>>> 8b6745c (feat: inclusão da live pelo youtube)
>>>>>>> 0d9215edaec305cf40940fe60c9dccd88f667747
      else {
        if (new Date(stream.scheduled_start) <= now) {
          isLive = true;
          console.log(`⏰ Verificação por horário: "${stream.youtube_video_id}" deveria estar ao vivo agora`);
        }
      }

<<<<<<< HEAD
=======
<<<<<<< HEAD
      // 4. Atualizar status no banco
=======
>>>>>>> 8b6745c (feat: inclusão da live pelo youtube)
>>>>>>> 0d9215edaec305cf40940fe60c9dccd88f667747
      if (isLive) {
        await pool.query(
          `UPDATE church_live_streams SET status = 'live', actual_start = NOW() WHERE id = ?`,
          [stream.id]
        );
        console.log(`✅ Live ID ${stream.id} atualizada para 'live'`);
      }
    }

<<<<<<< HEAD
=======
<<<<<<< HEAD
    // 2. VERIFICAR SE ALGUMA LIVE "AO VIVO" JÁ ACABOU (Via API YouTube)
    // Verifica lives ativas para ver se o YouTube informou o fim
    const [liveStreamsToCheck] = await pool.query(`
      SELECT id, youtube_video_id FROM church_live_streams
=======
>>>>>>> 0d9215edaec305cf40940fe60c9dccd88f667747
    // ========================================
    // 2. LIVES AO VIVO -> ENCERRADAS
    // ========================================
    const [liveStreamsToCheck] = await pool.query(`
      SELECT id, church_id, youtube_video_id FROM church_live_streams
<<<<<<< HEAD
=======
>>>>>>> 8b6745c (feat: inclusão da live pelo youtube)
>>>>>>> 0d9215edaec305cf40940fe60c9dccd88f667747
      WHERE status = 'live' AND youtube_video_id IS NOT NULL
    `);

    for (const stream of liveStreamsToCheck) {
<<<<<<< HEAD
=======
<<<<<<< HEAD
      if (YOUTUBE_API_KEY) {
        try {
          const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${stream.youtube_video_id}&part=liveStreamingDetails&key=${YOUTUBE_API_KEY}`;
          const response = await fetch(apiUrl);
          const data = await response.json();

          // Se o YouTube informar que há um 'actualEndTime', a live acabou
=======
>>>>>>> 0d9215edaec305cf40940fe60c9dccd88f667747
      const churchApiKey = await getChurchYoutubeApiKey(stream.church_id);

      if (churchApiKey) {
        try {
          const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${stream.youtube_video_id}&part=liveStreamingDetails&key=${churchApiKey}`;
          const response = await fetch(apiUrl);
          const data = await response.json();

<<<<<<< HEAD
=======
>>>>>>> 8b6745c (feat: inclusão da live pelo youtube)
>>>>>>> 0d9215edaec305cf40940fe60c9dccd88f667747
          if (data.items?.[0]?.liveStreamingDetails?.actualEndTime) {
            await pool.query(
              'UPDATE church_live_streams SET status = "ended", actual_end = NOW() WHERE id = ?',
              [stream.id]
            );
<<<<<<< HEAD
=======
<<<<<<< HEAD
            console.log(`🏁 YouTube API confirmou fim da live: ID ${stream.id}`);
            continue; // Pula o resto do loop para este stream
          }
        } catch (err) { console.error(`Erro ao checar fim da live ${stream.id}:`, err.message); }
      }
    }

    // Fallback: Se não tiver API ou a live não informou fim, encerra após 6 horas de transmissão
=======
>>>>>>> 0d9215edaec305cf40940fe60c9dccd88f667747
            console.log(`🏁 YouTube API confirmou fim da live: ID ${stream.id} (igreja ${stream.church_id})`);
            continue;
          }
        } catch (err) {
          console.error(`Erro ao checar fim da live ${stream.id}:`, err.message);
        }
      }
    }

    // Fallback por tempo: encerra lives com mais de 6 horas
<<<<<<< HEAD
=======
>>>>>>> 8b6745c (feat: inclusão da live pelo youtube)
>>>>>>> 0d9215edaec305cf40940fe60c9dccd88f667747
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

<<<<<<< HEAD
    // ========================================
    // 3. ENVIAR NOTIFICAÇÕES
    // ========================================
=======
<<<<<<< HEAD
    // 3. Verificar lives para enviar notificações
=======
    // ========================================
    // 3. ENVIAR NOTIFICAÇÕES
    // ========================================
>>>>>>> 8b6745c (feat: inclusão da live pelo youtube)
>>>>>>> 0d9215edaec305cf40940fe60c9dccd88f667747
    const [justLive] = await pool.query(`
      SELECT id, church_id, title, last_notification_sent
      FROM church_live_streams
      WHERE status = 'live'
        AND last_notification_sent = 0
    `);

    for (const live of justLive) {
<<<<<<< HEAD
      console.log(`🧹 Limpando chat para a live: ${live.title} (ID: ${live.id})`);
      await pool.query('DELETE FROM live_chat_messages WHERE live_stream_id = ?', [live.id]);

=======
<<<<<<< HEAD
      // Limpar chat antigo
      console.log(`🧹 Limpando chat para a live: ${live.title} (ID: ${live.id})`);
      await pool.query('DELETE FROM live_chat_messages WHERE live_stream_id = ?', [live.id]);
      
=======
      console.log(`🧹 Limpando chat para a live: ${live.title} (ID: ${live.id})`);
      await pool.query('DELETE FROM live_chat_messages WHERE live_stream_id = ?', [live.id]);

>>>>>>> 8b6745c (feat: inclusão da live pelo youtube)
>>>>>>> 0d9215edaec305cf40940fe60c9dccd88f667747
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
      
      // Marcar como notificado
      await pool.query('UPDATE church_live_streams SET last_notification_sent = 1 WHERE id = ?', [live.id]);
    }

    // 6. Encerrar lives antigas (mais de 6 horas)
    const [ended] = await pool.query(`
      UPDATE church_live_streams
      SET status = 'ended', actual_end = NOW()
      WHERE status = 'live'
        AND actual_start IS NOT NULL
        AND actual_start < DATE_SUB(NOW(), INTERVAL 6 HOUR)
    `);

    if (ended.affectedRows > 0) {
      console.log(`🏁 ${ended.affectedRows} live(s) encerradas automaticamente por tempo limite`);
    }

=======
>>>>>>> 0d9215edaec305cf40940fe60c9dccd88f667747

      await pool.query('UPDATE church_live_streams SET last_notification_sent = 1 WHERE id = ?', [live.id]);
    }

<<<<<<< HEAD
=======
>>>>>>> 8b6745c (feat: inclusão da live pelo youtube)
>>>>>>> 0d9215edaec305cf40940fe60c9dccd88f667747
  } catch (error) {
    console.error('❌ Error in live status scheduler:', error);
  }
}

// Executar a cada 2 minutos
setInterval(updateLiveStatuses, 2 * 60 * 1000);

// Executar imediatamente ao iniciar
updateLiveStatuses();

<<<<<<< HEAD
=======
<<<<<<< HEAD
if (!YOUTUBE_API_KEY) {
  console.warn('⚠️  YOUTUBE_DATA_API_KEY não encontrada. Usando verificação por horário como fallback.');
} else {
  console.log('✅ Live Status Scheduler iniciado com Verificação YouTube API (rodando a cada 2 min)');
=======
>>>>>>> 0d9215edaec305cf40940fe60c9dccd88f667747
if (!GLOBAL_YOUTUBE_API_KEY) {
  console.warn('⚠️  YOUTUBE_DATA_API_KEY (global) nao encontrada. Usando verificação por horario como fallback.');
} else {
  console.log('✅ Live Status Scheduler iniciado (API Key por igreja + fallback global, rodando a cada 2 min)');
<<<<<<< HEAD
=======
>>>>>>> 8b6745c (feat: inclusão da live pelo youtube)
>>>>>>> 0d9215edaec305cf40940fe60c9dccd88f667747
}

export default updateLiveStatuses;
