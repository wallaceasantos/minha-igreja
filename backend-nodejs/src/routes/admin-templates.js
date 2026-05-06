/**
 * API: Templates de Comunicados
 * ============================================
 * Rotas para gerenciar templates de comunicados recorrentes.
 *
 * Rotas:
 * GET    /api/admin/templates              - Listar todos os templates
 * GET    /api/admin/templates/:id          - Ver detalhes de um template
 * POST   /api/admin/templates              - Criar novo template
 * PUT    /api/admin/templates/:id          - Atualizar template
 * DELETE /api/admin/templates/:id          - Excluir template
 * POST   /api/admin/templates/:id/use      - Registrar uso do template
 */

import express from 'express';
import { getPool } from '../config/database.js';
import { isAdmin } from '../middleware/permissions.js';

const router = express.Router();

/**
 * GET /api/admin/templates
 * Listar todos os templates
 */
router.get('/templates', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const { active_only } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (active_only === 'true') {
      whereClause += ' AND is_active = 1';
    }

    const [templates] = await pool.query(`
      SELECT * FROM announcement_templates
      ${whereClause}
      ORDER BY usage_count DESC, name ASC
    `, params);

    res.json({
      success: true,
      data: Array.isArray(templates) ? templates : [],
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/templates/:id
 * Ver detalhes de um template
 */
router.get('/templates/:id', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const templateId = req.params.id;

    const [templates] = await pool.query(
      'SELECT * FROM announcement_templates WHERE id = ?',
      [templateId]
    );

    if (!Array.isArray(templates) || templates.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Template não encontrado',
      });
    }

    res.json({
      success: true,
      data: templates[0],
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/templates
 * Criar novo template
 */
router.post('/templates', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const {
      name,
      title,
      message,
      type = 'info',
      priority = 'medium',
      send_method = 'platform',
      target_audience = 'all',
      show_on_dashboard = true,
      show_on_login = false,
      require_acknowledgment = false,
    } = req.body;

    if (!name || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Nome, título e mensagem são obrigatórios',
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO announcement_templates (
        name, title, message, type, priority, send_method,
        target_audience, show_on_dashboard, show_on_login,
        require_acknowledgment, created_by, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      name,
      title,
      message,
      type,
      priority,
      send_method,
      target_audience,
      show_on_dashboard ? 1 : 0,
      show_on_login ? 1 : 0,
      require_acknowledgment ? 1 : 0,
      req.userId || null,
    ]);

    res.json({
      success: true,
      message: 'Template criado com sucesso!',
      template_id: result.insertId,
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/admin/templates/:id
 * Atualizar template
 */
router.put('/templates/:id', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const templateId = req.params.id;
    const {
      name,
      title,
      message,
      type,
      priority,
      send_method,
      target_audience,
      show_on_dashboard,
      show_on_login,
      require_acknowledgment,
      is_active,
    } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM announcement_templates WHERE id = ?',
      [templateId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Template não encontrado',
      });
    }

    await pool.execute(`
      UPDATE announcement_templates SET
        name = ?,
        title = ?,
        message = ?,
        type = ?,
        priority = ?,
        send_method = ?,
        target_audience = ?,
        show_on_dashboard = ?,
        show_on_login = ?,
        require_acknowledgment = ?,
        is_active = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [
      name,
      title,
      message,
      type,
      priority,
      send_method,
      target_audience,
      show_on_dashboard ? 1 : 0,
      show_on_login ? 1 : 0,
      require_acknowledgment ? 1 : 0,
      is_active ? 1 : 0,
      templateId,
    ]);

    res.json({
      success: true,
      message: 'Template atualizado com sucesso!',
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/admin/templates/:id
 * Excluir template
 */
router.delete('/templates/:id', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const templateId = req.params.id;

    const [existing] = await pool.query(
      'SELECT id FROM announcement_templates WHERE id = ?',
      [templateId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Template não encontrado',
      });
    }

    await pool.execute('DELETE FROM announcement_templates WHERE id = ?', [templateId]);

    res.json({
      success: true,
      message: 'Template excluído com sucesso!',
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/templates/:id/use
 * Registrar uso do template
 */
router.post('/templates/:id/use', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const templateId = req.params.id;

    await pool.execute(`
      UPDATE announcement_templates SET
        usage_count = usage_count + 1,
        last_used_at = NOW()
      WHERE id = ?
    `, [templateId]);

    res.json({
      success: true,
      message: 'Uso do template registrado!',
    });
  } catch (error) {
    console.error('Error registering template use:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
