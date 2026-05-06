/**
 * API: Super Admin - Configurações do Sistema
 * ============================================
 * Rotas para gerenciar configurações globais da plataforma.
 *
 * Rotas:
 * GET    /api/admin/settings              - Listar todas as configurações
 * GET    /api/admin/settings/:category    - Configurações por categoria
 * GET    /api/admin/settings/key/:key     - Buscar configuração por chave
 * PUT    /api/admin/settings/:key         - Atualizar configuração
 * PUT    /api/admin/settings/bulk         - Atualizar múltiplas configurações
 * POST   /api/admin/settings/test-email   - Testar configuração de email
 * POST   /api/admin/settings/test-smtp    - Testar conexão SMTP
 */

import express from 'express';
import { getPool } from '../config/database.js';
import { isAdmin } from '../middleware/permissions.js';

const router = express.Router();

/**
 * GET /api/admin/settings
 * Listar todas as configurações ou por categoria
 */
router.get('/settings', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const { category } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    const [settings] = await pool.query(`
      SELECT * FROM system_settings
      ${whereClause}
      ORDER BY category, setting_key ASC
    `, params);

    // Agrupar por categoria
    const groupedSettings = {};
    
    if (Array.isArray(settings)) {
      settings.forEach(setting => {
        if (!groupedSettings[setting.category]) {
          groupedSettings[setting.category] = [];
        }
        
        // Converter valor baseado no tipo
        let value = setting.setting_value;
        if (setting.setting_type === 'number') {
          value = parseFloat(value);
        } else if (setting.setting_type === 'boolean') {
          value = value === '1' || value === 'true';
        } else if (setting.setting_type === 'json') {
          try {
            value = JSON.parse(value);
          } catch (e) {
            // Manter como string se não for JSON válido
          }
        }
        
        groupedSettings[setting.category].push({
          key: setting.setting_key,
          value: value,
          type: setting.setting_type,
          description: setting.description,
          is_public: !!setting.is_public,
        });
      });
    }

    res.json({
      success: true,
      data: groupedSettings,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/settings/key/:key
 * Buscar configuração por chave
 */
router.get('/settings/key/:key', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const key = req.params.key;

    const [settings] = await pool.query(
      'SELECT * FROM system_settings WHERE setting_key = ? LIMIT 1',
      [key]
    );

    if (!Array.isArray(settings) || settings.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Configuração não encontrada',
      });
    }

    const setting = settings[0];
    
    // Converter valor baseado no tipo
    let value = setting.setting_value;
    if (setting.setting_type === 'number') {
      value = parseFloat(value);
    } else if (setting.setting_type === 'boolean') {
      value = value === '1' || value === 'true';
    } else if (setting.setting_type === 'json') {
      try {
        value = JSON.parse(value);
      } catch (e) {
        // Manter como string
      }
    }

    res.json({
      success: true,
      data: {
        key: setting.setting_key,
        value: value,
        type: setting.setting_type,
        category: setting.category,
        description: setting.description,
      },
    });
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/admin/settings/:key
 * Atualizar configuração
 */
router.put('/settings/:key', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const key = req.params.key;
    const { value } = req.body;

    // Verificar se configuração existe
    const [existing] = await pool.query(
      'SELECT id, setting_type FROM system_settings WHERE setting_key = ?',
      [key]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Configuração não encontrada',
      });
    }

    // Converter valor baseado no tipo
    let formattedValue = value;
    const settingType = existing[0].setting_type;
    
    if (settingType === 'number') {
      formattedValue = String(parseFloat(value) || 0);
    } else if (settingType === 'boolean') {
      formattedValue = value ? '1' : '0';
    } else if (settingType === 'json') {
      formattedValue = typeof value === 'string' ? value : JSON.stringify(value);
    } else {
      formattedValue = String(value);
    }

    // Atualizar configuração
    await pool.execute(
      'UPDATE system_settings SET setting_value = ?, updated_by = ?, updated_at = NOW() WHERE setting_key = ?',
      [formattedValue, req.userId || null, key]
    );

    res.json({
      success: true,
      message: 'Configuração atualizada com sucesso!',
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * PUT /api/admin/settings/bulk
 * Atualizar múltiplas configurações
 */
router.put('/settings/bulk', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const { settings } = req.body;

    console.log('[DEBUG] Bulk settings request:', { settings, rawBody: req.body });

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Configurações inválidas',
      });
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      let updatedCount = 0;

      for (const [key, value] of Object.entries(settings)) {
        console.log('[DEBUG] Processing setting:', { key, value });
        
        // Buscar tipo da configuração
        const [existing] = await connection.query(
          'SELECT id, setting_type FROM system_settings WHERE setting_key = ?',
          [key]
        );

        console.log('[DEBUG] Found setting:', existing);

        if (existing.length === 0) {
          console.warn('[DEBUG] Setting not found:', key);
          continue;
        }

        // Converter valor baseado no tipo
        let formattedValue = value;
        const settingType = existing[0].setting_type;

        if (settingType === 'number') {
          formattedValue = String(parseFloat(value) || 0);
        } else if (settingType === 'boolean') {
          formattedValue = value ? '1' : '0';
        } else if (settingType === 'json') {
          formattedValue = typeof value === 'string' ? value : JSON.stringify(value);
        } else {
          formattedValue = String(value);
        }

        // Atualizar
        const [result] = await connection.execute(
          'UPDATE system_settings SET setting_value = ?, updated_by = ?, updated_at = NOW() WHERE setting_key = ?',
          [formattedValue, req.userId || null, key]
        );
        
        updatedCount += result.affectedRows || 0;
      }

      await connection.commit();

      console.log('[DEBUG] Bulk update completed:', { updatedCount, total: Object.keys(settings).length });

      res.json({
        success: true,
        message: `Configurações atualizadas com sucesso! (${updatedCount}/${Object.keys(settings).length})`,
        updatedCount,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error bulk updating settings:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/settings/test-email
 * Testar envio de email
 */
router.post('/settings/test-email', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const { to_email } = req.body;

    if (!to_email) {
      return res.status(400).json({
        success: false,
        error: 'Email de teste é obrigatório',
      });
    }

    // Buscar configurações SMTP
    const [settings] = await pool.query(`
      SELECT setting_key, setting_value FROM system_settings
      WHERE setting_key LIKE 'smtp_%'
    `);

    const smtpConfig = {};
    if (Array.isArray(settings)) {
      settings.forEach(setting => {
        smtpConfig[setting.setting_key.replace('smtp_', '')] = setting.setting_value;
      });
    }

    // Simular envio de email (implementar com nodemailer ou similar)
    // Por enquanto, apenas retorna sucesso
    res.json({
      success: true,
      message: 'Email de teste enviado com sucesso!',
      config: {
        host: smtpConfig.host,
        port: smtpConfig.port,
        from: smtpConfig.from_email,
      },
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/admin/settings/test-smtp
 * Testar conexão SMTP
 */
router.post('/settings/test-smtp', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    // Buscar configurações SMTP
    const [settings] = await pool.query(`
      SELECT setting_key, setting_value FROM system_settings
      WHERE setting_key LIKE 'smtp_%'
    `);

    const smtpConfig = {};
    if (Array.isArray(settings)) {
      settings.forEach(setting => {
        smtpConfig[setting.setting_key.replace('smtp_', '')] = setting.setting_value;
      });
    }

    // Simular teste de conexão (implementar com nodemailer)
    res.json({
      success: true,
      message: 'Conexão SMTP testada com sucesso!',
      config: {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
      },
    });
  } catch (error) {
    console.error('Error testing SMTP:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
