/**
 * Middleware: Identify Church
 * ============================================
 * Identifica a igreja pelo ID passado nos headers ou query params
 */

import { getPool } from '../config/database.js';

export const identifyChurch = async (req, res, next) => {
  try {
    const churchId = req.headers['x-church-id'] || req.query.church_id || req.params.churchId;

    if (!churchId) {
      return res.status(400).json({
        success: false,
        error: 'Church ID is required',
      });
    }

    const pool = getPool();
    const [churches] = await pool.query(
      'SELECT id, name, slug, plan_type, is_active FROM churches WHERE id = ? LIMIT 1',
      [churchId]
    );

    if (churches.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Church not found',
      });
    }

    const church = churches[0];

    if (!church.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Church is inactive',
      });
    }

    // Adicionar church ao request para uso posterior
    req.church = church;
    req.churchId = churchId;

    next();
  } catch (error) {
    console.error('Error identifying church:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export default identifyChurch;
