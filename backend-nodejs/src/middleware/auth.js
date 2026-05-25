/**
 * Middleware: Auth - Autenticação JWT
 * ============================================
 * Verifica tokens JWT em rotas protegidas
 */

import jwt from 'jsonwebtoken';
import { getPool } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'minhaigreja-secret-key';

/**
 * Verificar token JWT
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token não fornecido'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('[Auth] Token inválido:', error.message);
    return res.status(403).json({
      success: false,
      error: 'Token inválido ou expirado'
    });
  }
}

/**
 * Verificar token opcional (não bloqueia se não existir)
 */
export function authenticateTokenOptional(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
}

/**
 * Gerar token JWT
 */
export function generateToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}
