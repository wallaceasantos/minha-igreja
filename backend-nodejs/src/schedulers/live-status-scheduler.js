/**
 * Scheduler: Live Status Auto-Change (Com Verificação YouTube API)
 * ============================================
 * Verifica lives agendadas e muda status automaticamente
 * Usa a API do YouTube para confirmar se a live realmente começou
 *
 * Roda a cada 2 minutos
 */

import { getPool } from '../config/database.js';

const YOUTUBE_API_KEY = process.env.YOUTUBE_DATA_API_KEY;

async function updateLiveStatuses() {
  try {
    const pool = getPool();
    const now = new Date();

    // 1. Buscar todas as lives agendadas
    const [scheduledStreams] = await pool.query(`
      SELECT id, youtube_video_id, scheduled_start
      FROM church_live_streams 
      WHERE status = 'scheduled' 
        AND is_active = 1 
        AND youtube_video_id IS NOT NULL
    `);

    for (const stream of scheduledStreams) {
      let isLive = false;

      // 2. Verificação via API do YouTube (se chave configurada)
      if (YOUTUBE_API_KEY) {
        try {
          const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${stream.youtube_video_id}&part=liveStreamingDetails&key=${YOUTUBE_API_KEY}`;
          const response = await fetch(apiUrl);
          const data = await response.json();

          if (data.items && data.items.length > 0) {
            const details = data.items[0].liveStreamingDetails;
            // Se existe 'actualStartTime', o YouTube confirmou que a live começou
            if (details && details.actualStartTime) {
              isLive = true;
              console.log(`🔴 YouTube API confirmou: "${stream.youtube_video_id}" está AO VIVO`);
            }
          }
        } catch (apiError) {
          console.error(`❌ Erro ao consultar API do YouTube para vídeo ${stream.youtube_video_id}:`, apiError.message);
        }
      } 
      // 3. Fallback: Verificação por Horário (se chave API não configurada)
      else {
        if (new Date(stream.scheduled_start) <= now) {
          isLive = true;
          console.log(`⏰ Verificação por horário: "${stream.youtube_video_id}" deveria estar ao vivo agora`);
        }
      }

      // 4. Atualizar status no banco
      if (isLive) {
        await pool.query(
          `UPDATE church_live_streams SET status = 'live', actual_start = NOW() WHERE id = ?`,
          [stream.id]
        );
        console.log(`✅ Live ID ${stream.id} atualizada para 'live'`);
      }
    }

    // 2. VERIFICAR SE ALGUMA LIVE "AO VIVO" JÁ ACABOU (Via API YouTube)
    // Verifica lives ativas para ver se o YouTube informou o fim
    const [liveStreamsToCheck] = await pool.query(`
      SELECT id, youtube_video_id FROM church_live_streams
      WHERE status = 'live' AND youtube_video_id IS NOT NULL
    `);

    for (const stream of liveStreamsToCheck) {
      if (YOUTUBE_API_KEY) {
        try {
          const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${stream.youtube_video_id}&part=liveStreamingDetails&key=${YOUTUBE_API_KEY}`;
          const response = await fetch(apiUrl);
          const data = await response.json();

          // Se o YouTube informar que há um 'actualEndTime', a live acabou
          if (data.items?.[0]?.liveStreamingDetails?.actualEndTime) {
            await pool.query(
              'UPDATE church_live_streams SET status = "ended", actual_end = NOW() WHERE id = ?',
              [stream.id]
            );
            console.log(`🏁 YouTube API confirmou fim da live: ID ${stream.id}`);
            continue; // Pula o resto do loop para este stream
          }
        } catch (err) { console.error(`Erro ao checar fim da live ${stream.id}:`, err.message); }
      }
    }

    // Fallback: Se não tiver API ou a live não informou fim, encerra após 6 horas de transmissão
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

    // 3. Verificar lives para enviar notificações
    const [justLive] = await pool.query(`
      SELECT id, church_id, title, last_notification_sent
      FROM church_live_streams
      WHERE status = 'live'
        AND last_notification_sent = 0
    `);

    for (const live of justLive) {
      // Limpar chat antigo
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

  } catch (error) {
    console.error('❌ Error in live status scheduler:', error);
  }
}

// Executar a cada 2 minutos
setInterval(updateLiveStatuses, 2 * 60 * 1000);

// Executar imediatamente ao iniciar
updateLiveStatuses();

if (!YOUTUBE_API_KEY) {
  console.warn('⚠️  YOUTUBE_DATA_API_KEY não encontrada. Usando verificação por horário como fallback.');
} else {
  console.log('✅ Live Status Scheduler iniciado com Verificação YouTube API (rodando a cada 2 min)');
}

export default updateLiveStatuses;
