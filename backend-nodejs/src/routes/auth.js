/**
 * Rotas: Auth (Autenticação)
 * POST /api/auth/login - Login
 * POST /api/auth/register - Registro
 */

import express from 'express';
import { query } from '../config/database.js';
import bcrypt from 'bcrypt';
import {
  checkBlockedIP,
  checkUserLocked,
  recordLoginAttempt,
  createSession
} from '../middleware/security.js';
import { generateToken } from '../middleware/auth.js';
import { rateLimits } from '../middleware/rateLimiter.js';

const router = express.Router();

// Middleware de IP bloqueado para todas as rotas de auth
router.use(checkBlockedIP);

// Rate limiting para login (5 tentativas por 15 minutos)
router.post('/login', rateLimits.login, async (req, res) => {
  try {
    const { email, password, church_id } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;

    if (!email || !password) {
      await recordLoginAttempt(email, ip, false, null, 'invalid_email');
      return res.status(400).json({ success: false, error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const users = await query(
      'SELECT * FROM usuarios_admin WHERE email = ? AND is_active = 1 LIMIT 1',
      [email]
    );

    if (users.length === 0) {
      await recordLoginAttempt(email, ip, false, null, 'invalid_email');
      return res.status(401).json({ success: false, error: 'Credenciais inválidas' });
    }

    const user = users[0];

    // DEBUG: Log do hash da senha
    console.log('[DEBUG] User password hash:', user.password.substring(0, 10) + '...');
    console.log('[DEBUG] Password from request:', password);

    // Verificar se usuário está bloqueado
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      await recordLoginAttempt(email, ip, false, user.id, 'account_locked');
      return res.status(403).json({
        success: false,
        error: 'Conta temporariamente bloqueada',
        lockedUntil: new Date(user.locked_until).toISOString(),
        message: `Sua conta está bloqueada até ${new Date(user.locked_until).toLocaleString('pt-BR')}`,
      });
    }

    // Verificar senha
    // Primeiro verificar se senha tem tamanho mínimo
    if (!password || password.length < 1) {
      await recordLoginAttempt(email, ip, false, user.id, 'invalid_password');
      return res.status(401).json({ success: false, error: 'Credenciais inválidas' });
    }

    // Verificar formato do hash (deve começar com $2b$ ou $2y$)
    if (!user.password.startsWith('$2b$') && !user.password.startsWith('$2y$')) {
      console.error('[ERROR] Hash inválido no banco:', user.password.substring(0, 10));
      await recordLoginAttempt(email, ip, false, user.id, 'invalid_password');
      return res.status(500).json({ success: false, error: 'Erro interno de autenticação' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    console.log('[DEBUG] Password valid:', validPassword);

    if (!validPassword) {
      await recordLoginAttempt(email, ip, false, user.id, 'invalid_password');
      return res.status(401).json({ success: false, error: 'Credenciais inválidas' });
    }

    // Login bem-sucedido - registrar tentativa
    await recordLoginAttempt(email, ip, true, user.id);

    // Criar sessão para rastreamento
    await createSession(user.id, req);

    // Gerar JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      church_id: user.church_id,
      role: user.role
    });

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
