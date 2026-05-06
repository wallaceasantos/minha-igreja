/**
 * API: Super Admin - Gerenciamento de Usuários
 * GET    /api/admin/users - Listar usuários
 * GET    /api/admin/users/:id - Ver usuário
 * PUT    /api/admin/users/:id - Editar usuário
 * POST   /api/admin/users/:id/reset-password - Resetar senha
 * POST   /api/admin/users/:id/ban - Banir usuário
 * POST   /api/admin/users/:id/reactivate - Reativar usuário
 * DELETE /api/admin/users/:id - Excluir usuário
 */

import express from 'express';
import { getPool } from '../config/database.js';
import { isAdmin } from '../middleware/permissions.js';
import bcrypt from 'bcrypt';
import { logAudit, AuditActions } from '../middleware/auditLog.js';

const router = express.Router();

/**
 * GET /api/admin/users
 * Listar todos usuários com filtros e paginação
 */
router.get('/users', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      role = '',
      status = '',
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;

    // Construir query com filtros
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    if (status) {
      if (status === 'active') {
        whereClause += ' AND is_active = 1';
      } else if (status === 'inactive') {
        whereClause += ' AND is_active = 0';
      }
    }

    // Buscar usuários
    const [users] = await pool.query(`
      SELECT 
        u.*,
        c.name as church_name,
        c.slug as church_slug
      FROM usuarios_admin u
      LEFT JOIN churches c ON u.church_id = c.id
      ${whereClause}
      ORDER BY ${sort} ${order}
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    // Contar total
    const [totalResult] = await pool.query(`
      SELECT COUNT(*) as count FROM usuarios_admin u
      ${whereClause}
    `, params);

    const total = Array.isArray(totalResult) ? totalResult[0].count : 0;

    res.json({
      success: true,
      data: {
        users: Array.isArray(users) ? users : [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/admin/users/:id
 * Ver detalhes de um usuário
 */
router.get('/users/:id', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const userId = req.params.id;

    const [users] = await pool.query(
      `SELECT u.*, c.name as church_name, c.slug as church_slug
       FROM usuarios_admin u
       LEFT JOIN churches c ON u.church_id = c.id
       WHERE u.id = ? LIMIT 1`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    }

    const user = users[0];

    // Buscar stats do usuário
    const [loginLogs] = await pool.query(
      'SELECT COUNT(*) as count FROM audit_logs WHERE user_id = ? AND action = "login"',
      [userId]
    );

    res.json({
      success: true,
      data: {
        ...user,
        stats: {
          logins: Array.isArray(loginLogs[0]) ? loginLogs[0][0].count : 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/admin/users/:id
 * Editar dados de um usuário
 */
router.put('/users/:id', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const userId = req.params.id;
    const {
      name,
      email,
      role,
      church_id,
    } = req.body;

    // Verificar se usuário existe
    const [existing] = await pool.query(
      'SELECT id FROM usuarios_admin WHERE id = ?',
      [userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    }

    // Verificar email duplicado (se mudou)
    if (email) {
      const [emailExists] = await pool.query(
        'SELECT id FROM usuarios_admin WHERE email = ? AND id != ?',
        [email, userId]
      );

      if (emailExists.length > 0) {
        return res.status(400).json({ success: false, error: 'Email já está em uso' });
      }
    }

    // Atualizar
    await pool.execute(`
      UPDATE usuarios_admin SET
        name = ?,
        email = ?,
        role = ?,
        church_id = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [name, email, role, church_id, userId]);

    // Log de auditoria
    await logAudit({
      action: AuditActions.USER_UPDATED,
      userId,
      churchId: church_id,
      details: JSON.stringify({ name, email, role, church_id }),
      ipAddress: req.ip || req.headers['x-forwarded-for'],
    });

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso!',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/users/:id/reset-password
 * Resetar senha de um usuário
 */
router.post('/users/:id/reset-password', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const userId = req.params.id;
    const { temporary_password } = req.body;

    if (!temporary_password) {
      return res.status(400).json({ success: false, error: 'Senha temporária é obrigatória' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(temporary_password, 10);

    // Atualizar senha
    await pool.execute(
      'UPDATE usuarios_admin SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, userId]
    );

    // Log de auditoria
    await logAudit({
      action: AuditActions.USER_PASSWORD_RESET,
      userId,
      churchId: null,
      details: JSON.stringify({ action: 'Senha resetada por Super Admin' }),
      ipAddress: req.ip || req.headers['x-forwarded-for'],
    });

    res.json({
      success: true,
      message: 'Senha resetada com sucesso!',
      temporary_password: temporary_password,
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/users/:id/ban
 * Banir usuário
 */
router.post('/users/:id/ban', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const userId = req.params.id;
    const { reason } = req.body;

    // Banir usuário
    await pool.execute(
      'UPDATE usuarios_admin SET is_active = 0, updated_at = NOW() WHERE id = ?',
      [userId]
    );

    // Log de auditoria
    await logAudit({
      action: AuditActions.USER_BANNED,
      userId,
      churchId: null,
      details: JSON.stringify({ reason: reason || 'Não informado' }),
      ipAddress: req.ip || req.headers['x-forwarded-for'],
    });

    res.json({
      success: true,
      message: 'Usuário banido com sucesso!',
    });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin/users/:id/reactivate
 * Reativar usuário
 */
router.post('/users/:id/reactivate', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const userId = req.params.id;

    // Reativar usuário
    await pool.execute(
      'UPDATE usuarios_admin SET is_active = 1, updated_at = NOW() WHERE id = ?',
      [userId]
    );

    // Log de auditoria
    await logAudit({
      action: AuditActions.USER_REACTIVATED,
      userId,
      churchId: null,
      details: JSON.stringify({ action: 'Usuário reativado' }),
      ipAddress: req.ip || req.headers['x-forwarded-for'],
    });

    res.json({
      success: true,
      message: 'Usuário reativado com sucesso!',
    });
  } catch (error) {
    console.error('Error reactivating user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Excluir usuário
 */
router.delete('/users/:id', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const userId = req.params.id;

    // Verificar se é Super Admin (não pode excluir)
    const [user] = await pool.query(
      'SELECT role FROM usuarios_admin WHERE id = ?',
      [userId]
    );

    if (Array.isArray(user[0]) && user[0].role === 'super_admin') {
      return res.status(400).json({
        success: false,
        error: 'Não é possível excluir Super Admin'
      });
    }

    // Excluir
    await pool.execute('DELETE FROM usuarios_admin WHERE id = ?', [userId]);

    // Log de auditoria
    await logAudit({
      action: AuditActions.USER_DELETED,
      userId,
      churchId: null,
      details: JSON.stringify({ action: 'Usuário excluído' }),
      ipAddress: req.ip || req.headers['x-forwarded-for'],
    });

    res.json({
      success: true,
      message: 'Usuário excluído com sucesso!',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
