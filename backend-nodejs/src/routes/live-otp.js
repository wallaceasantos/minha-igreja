/**
 * Live OTP Routes - Autenticacao por Email + Codigo OTP
 * ====================================================
 * Substitui o sistema de PINs estaticos por codigos temporarios
 *
 * Rotas:
 * POST /api/live/otp/request  - Solicita codigo OTP por email
 * POST /api/live/otp/verify   - Verifica codigo OTP e retorna token de sessao
 */

import express from 'express';
import { getPool } from '../config/database.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const router = express.Router();

// Configurar transporter de email (reusa configuracao SMTP existente)
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * POST /api/live/otp/request
 * Gera codigo OTP de 6 digitos e envia por email
 */
router.post('/otp/request', async (req, res) => {
  try {
    const { church_id, email } = req.body;

    if (!church_id || !email) {
      return res.status(400).json({
        success: false,
        error: 'church_id e email sao obrigatorios',
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email invalido',
      });
    }

    const pool = getPool();

    // Verificar se a igreja existe e esta ativa
    const [churches] = await pool.query(
      'SELECT id, name, slug FROM churches WHERE id = ? AND is_active = 1 LIMIT 1',
      [church_id]
    );

    if (!churches.length) {
      return res.status(404).json({
        success: false,
        error: 'Igreja nao encontrada ou inativa',
      });
    }

    const church = churches[0];

    // Gerar codigo OTP de 6 digitos
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Expiracao em 10 minutos
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Invalidar codigos anteriores nao utilizados para este email
    await pool.query(
      'UPDATE live_access_tokens SET used = TRUE WHERE church_id = ? AND email = ? AND used = FALSE AND expires_at > NOW()',
      [church_id, email]
    );

    // Salvar novo OTP
    await pool.query(
      `INSERT INTO live_access_tokens (church_id, email, otp_code, expires_at)
       VALUES (?, ?, ?, ?)`,
      [church_id, email, otpCode, expiresAt]
    );

    // Enviar email com o codigo
    const churchName = church.name || 'Sua Igreja';
    const siteUrl = process.env.FRONTEND_URL || 'https://minhaigreja.up.railway.app';

    try {
      await emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'MinhaIgreja <noreply@minhaigreja.app>',
        to: email,
        subject: `🔑 Seu codigo de acesso para ${churchName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">🔑 Codigo de Acesso</h2>
            <p>Olá! Seu codigo de acesso para assistir a transmissao ao vivo de <strong>${churchName}</strong> e:</p>
            <div style="background: #f0f7ff; border: 2px solid #2563eb; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-size: 36px; font-weight: bold; color: #2563eb; letter-spacing: 8px;">${otpCode}</span>
            </div>
            <p style="color: #666; font-size: 14px;">Este codigo expira em <strong>10 minutos</strong>.</p>
            <p style="color: #666; font-size: 14px;">Se voce nao solicitou este codigo, ignore este email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">${churchName} • Powered by MinhaIgreja</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Erro ao enviar email OTP:', emailError.message);
      // Mesmo com erro de email, o OTP foi gerado (pode ser usado se o membro souber)
    }

    res.json({
      success: true,
      message: 'Codigo OTP enviado por email!',
      data: {
        email: email,
        expires_in: 600, // 10 minutos em segundos
      },
    });
  } catch (error) {
    console.error('Error requesting OTP:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/live/otp/verify
 * Verifica codigo OTP e retorna token de sessao
 */
router.post('/otp/verify', async (req, res) => {
  try {
    const { church_id, email, otp_code } = req.body;

    if (!church_id || !email || !otp_code) {
      return res.status(400).json({
        success: false,
        error: 'church_id, email e otp_code sao obrigatorios',
      });
    }

    const pool = getPool();

    // Buscar OTP valido
    const [tokens] = await pool.query(
      `SELECT id, church_id, email, otp_code, expires_at
       FROM live_access_tokens
       WHERE church_id = ? AND email = ? AND otp_code = ? AND used = FALSE AND expires_at > NOW()
       LIMIT 1`,
      [church_id, email, otp_code]
    );

    if (!tokens.length) {
      // Verificar se o codigo existe mas expirou
      const [expiredTokens] = await pool.query(
        `SELECT id FROM live_access_tokens
         WHERE church_id = ? AND email = ? AND otp_code = ? AND expires_at <= NOW()
         LIMIT 1`,
        [church_id, email, otp_code]
      );

      if (expiredTokens.length) {
        return res.status(400).json({
          success: false,
          error: 'Codigo expirado. Solicite um novo.',
          expired: true,
        });
      }

      return res.status(400).json({
        success: false,
        error: 'Codigo invalido',
      });
    }

    const token = tokens[0];

    // Gerar token de sessao (valido por 30 dias)
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias

    // Marcar OTP como usado e salvar token de sessao
    await pool.query(
      `UPDATE live_access_tokens
       SET used = TRUE, used_at = NOW(), session_token = ?, session_expires_at = ?
       WHERE id = ?`,
      [sessionToken, sessionExpiresAt, token.id]
    );

    // Buscar info da igreja
    const [churches] = await pool.query(
      'SELECT id, name, slug FROM churches WHERE id = ? LIMIT 1',
      [church_id]
    );

    const church = churches[0];

    res.json({
      success: true,
      message: 'Acesso liberado!',
      data: {
        session_token: sessionToken,
        session_expires_at: sessionExpiresAt,
        member: {
          email: email,
        },
        church: {
          id: church.id,
          name: church.name,
          slug: church.slug,
        },
      },
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/live/otp/check-session
 * Verifica se a sessao ainda e valida
 */
router.post('/otp/check-session', async (req, res) => {
  try {
    const { session_token, church_id } = req.body;

    if (!session_token || !church_id) {
      return res.status(400).json({
        success: false,
        error: 'session_token e church_id sao obrigatorios',
      });
    }

    const pool = getPool();

    const [tokens] = await pool.query(
      `SELECT id, email, session_expires_at
       FROM live_access_tokens
       WHERE church_id = ? AND session_token = ? AND session_expires_at > NOW()
       LIMIT 1`,
      [church_id, session_token]
    );

    if (!tokens.length) {
      return res.json({
        success: false,
        valid: false,
        message: 'Sessao invalida ou expirada',
      });
    }

    res.json({
      success: true,
      valid: true,
      data: {
        email: tokens[0].email,
        expires_at: tokens[0].session_expires_at,
      },
    });
  } catch (error) {
    console.error('Error checking session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
