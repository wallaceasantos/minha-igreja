/**
 * Rotas: Auth (Autenticação)
 * POST /api/auth/login - Login
 * POST /api/auth/register - Registro
 */

import express from 'express';
import { query } from '../config/database.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// POST /api/auth/login - Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, church_id } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const users = await query(
      'SELECT * FROM usuarios_admin WHERE email = ? AND is_active = 1 LIMIT 1',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, error: 'Credenciais inválidas' });
    }

    const user = users[0];

    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Credenciais inválidas' });
    }

    // Gerar token simples (em produção use JWT)
    const token = Buffer.from(JSON.stringify({
      id: user.id,
      email: user.email,
      church_id: user.church_id,
      role: user.role
    })).toString('base64');

    // Log auditoria
    await query(
      'INSERT INTO audit_logs (church_id, user_id, action, details, created_at) VALUES (?, ?, ?, ?, NOW())',
      [user.church_id, user.id, 'login', `Login realizado com sucesso`]
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          church_id: user.church_id
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/register - Registro de novo admin
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, church_id } = req.body;

    if (!name || name.length < 3) {
      return res.status(400).json({ success: false, error: 'Nome inválido' });
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Email inválido' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Senha deve ter 6+ caracteres' });
    }

    // Verificar email duplicado
    const existing = await query('SELECT id FROM usuarios_admin WHERE email = ? LIMIT 1', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: 'Email já cadastrado' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserir usuário
    const result = await query(`
      INSERT INTO usuarios_admin (church_id, name, email, password, role, is_active, created_at)
      VALUES (?, ?, ?, ?, 'admin', 1, NOW())
    `, [church_id, name, email, hashedPassword]);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso!',
      data: {
        id: result.insertId,
        name,
        email,
        church_id
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
