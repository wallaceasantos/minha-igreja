/**
 * API: Live Notifications
 * ============================================================
 * Rotas para inscricao em notificacoes de lives
 *
 * Rotas:
 * POST   /api/live/notify   - Inscrever para notificacao
 * DELETE /api/live/notify   - Cancelar notificacao
 * GET    /api/live/notify/stats - Estatisticas de notificacoes
 */

import express from 'express';
import { getPool } from '../config/database.js';
import nodemailer from 'nodemailer';

const router = express.Router();

const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * POST /api/live/notify
 * Inscrever para notificacao de live
 */
router.post('/notify', async (req, res) => {
  try {
    const { church_id, live_stream_id, name, email, phone, whatsapp, notification_type } = req.body;
    if (!church_id || !name) {
      return res.status(400).json({ success: false, error: 'church_id e name obrigatorios' });
    }

    const pool = getPool();

    // Verificar se igreja existe
    const [[church]] = await pool.query('SELECT id, name, slug FROM churches WHERE id = ?', [church_id]);
    if (!church) return res.status(404).json({ success: false, error: 'Igreja nao encontrada' });

    // Verificar se ja existe inscricao ativa
    const [existing] = await pool.query(
      'SELECT id FROM live_notifications WHERE church_id = ? AND (email = ? OR phone = ?) AND notified = 0',
      [church_id, email || '', phone || '']
    );

    if (existing.length > 0) {
      return res.json({ success: true, data: { already_subscribed: true }, message: 'Voce ja esta inscrito!' });
    }

    // Criar inscricao
    await pool.query(
      'INSERT INTO live_notifications (church_id, live_stream_id, name, email, phone, whatsapp, notification_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [church_id, live_stream_id || null, name, email || null, phone || null, whatsapp || phone || null, notification_type || 'both']
    );

    res.json({ success: true, data: { subscribed: true }, message: 'Inscricao realizada! Voce sera notificado quando a live comecar.' });
  } catch (error) {
    console.error('Error subscribing to notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/live/notify
 * Cancelar notificacao
 */
router.delete('/notify', async (req, res) => {
  try {
    const { church_id, email, phone } = req.body;
    if (!church_id || (!email && !phone)) {
      return res.status(400).json({ success: false, error: 'church_id e email/phone obrigatorios' });
    }

    const pool = getPool();
    await pool.query(
      'DELETE FROM live_notifications WHERE church_id = ? AND (email = ? OR phone = ?)',
      [church_id, email || '', phone || '']
    );

    res.json({ success: true, message: 'Inscricao cancelada.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/live/notify/send-all
 * Enviar notificacoes pendentes (usado pelo scheduler)
 */
router.post('/notify/send-all', async (req, res) => {
  try {
    const { church_id, live_stream_id } = req.body;
    if (!church_id || !live_stream_id) {
      return res.status(400).json({ success: false, error: 'church_id e live_stream_id obrigatorios' });
    }

    const pool = getPool();

    // Buscar inscricoes pendentes
    const [subscriptions] = await pool.query(
      'SELECT * FROM live_notifications WHERE church_id = ? AND notified = 0',
      [church_id]
    );

    if (subscriptions.length === 0) {
      return res.json({ success: true, data: { sent: 0 }, message: 'Nenhuma inscricao pendente' });
    }

    // Buscar dados da live
    const [[live]] = await pool.query('SELECT title FROM church_live_streams WHERE id = ?', [live_stream_id]);
    const liveTitle = live ? live.title : 'Transmissao ao Vivo';

    // Buscar dados da igreja
    const [[church]] = await pool.query('SELECT name FROM churches WHERE id = ?', [church_id]);

    let sentCount = 0;

    for (const sub of subscriptions) {
      try {
        // Enviar email
        if (sub.email && (sub.notification_type === 'email' || sub.notification_type === 'both')) {
          await emailTransporter.sendMail({
            from: process.env.SMTP_FROM || 'MinhaIgreja <noreply@minhaigreja.app>',
            to: sub.email,
            subject: `🔴 Ao Vivo Agora: ${liveTitle}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #e53e3e;">🔴 ${church.name} esta AO VIVO!</h1>
                <p>O culto <strong>${liveTitle}</strong> comecou agora!</p>
                <a href="https://${church.slug}.plataforma.minhaigreja.com.br/ao-vivo" 
                   style="display: inline-block; background: #e53e3e; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 8px; margin: 20px 0;">
                  Assistir Agora
                </a>
                <p style="color: #666; font-size: 12px;">Para cancelar notificacoes, responda este email.</p>
              </div>
            `,
          });
          sentCount++;
        }

        // Marcar como notificado
        await pool.query(
          'UPDATE live_notifications SET notified = 1, notified_at = NOW() WHERE id = ?',
          [sub.id]
        );
      } catch (e) {
        console.error(`Error sending notification to ${sub.email}:`, e.message);
      }
    }

    // Atualizar live para nao reenviar
    await pool.query(
      'UPDATE church_live_streams SET last_notification_sent = 1, notification_sent_at = NOW() WHERE id = ?',
      [live_stream_id]
    );

    res.json({ success: true, data: { sent: sentCount }, message: `${sentCount} notificacoes enviadas!` });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
