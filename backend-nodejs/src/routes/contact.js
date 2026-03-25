/**
 * Rotas: Contact (Contato)
 * POST /api/contact - Enviar mensagem
 */

import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// POST /api/contact - Enviar mensagem
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message, church_id } = req.body;

    // Validações
    const errors = [];

    if (!name || name.length < 3) {
      errors.push('Nome é obrigatório');
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      errors.push('Email válido é obrigatório');
    }

    if (!message || message.length < 10) {
      errors.push('Mensagem deve ter pelo menos 10 caracteres');
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // Inserir mensagem
    await query(`
      INSERT INTO contact_messages (church_id, name, email, phone, message, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [church_id || null, name, email, phone || null, message]);

    // TODO: Enviar email de confirmação
    // TODO: Enviar notificação Telegram

    res.status(201).json({
      success: true,
      message: 'Mensagem enviada com sucesso!'
    });

  } catch (error) {
    console.error('Error sending contact message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
