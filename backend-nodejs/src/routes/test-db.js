/**
 * Teste de Conexão com Banco
 * GET /api/test-db
 */

import express from 'express';
import { testConnection } from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const connected = await testConnection();
    
    if (connected) {
      res.json({
        success: true,
        message: 'Conexão bem-sucedida!',
        database: 'MySQL conectado'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Falha na conexão'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
