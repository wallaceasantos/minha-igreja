/**
 * API: Configurações da Igreja
 * PUT /api/church/:id/config - Atualizar configurações
 * GET /api/church/:id/config - Buscar configurações
 */

import express from 'express';
import { getPool } from '../config/database.js';
import { identifyChurch, PLAN_LIMITS } from '../middleware/planLimits.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Garantir que diretório de logos exista
const LOGO_UPLOAD_DIR = 'uploads/logos';
if (!fs.existsSync(LOGO_UPLOAD_DIR)) {
  fs.mkdirSync(LOGO_UPLOAD_DIR, { recursive: true });
  console.log('📁 Created directory:', LOGO_UPLOAD_DIR);
}

// Configurar multer para upload de logo
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, LOGO_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const churchId = req.params.id || 'unknown';
    const ext = path.extname(file.originalname);
    cb(null, `logo-${churchId}-${Date.now()}${ext}`);
  }
});

const logoUpload = multer({
  storage: logoStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    // Verificar extensão do arquivo (aceita várias extensões de imagem)
    const allowedExts = /\.(jpeg|jpg|png|webp|jfif|jpe|bmp|gif)$/i;
    const extname = allowedExts.test(path.extname(file.originalname).toLowerCase());

    // Verificar mimetype (aceita image/*)
    const isImage = file.mimetype && file.mimetype.startsWith('image/');

    if (extname && isImage) {
      cb(null, true);
    } else {
      console.log('❌ File rejected:', { extname, mimetype: file.mimetype, originalname: file.originalname });
      cb(new Error('Apenas imagens JPEG, PNG, WebP, GIF e BMP são permitidas'));
    }
  }
});

const router = express.Router();

/**
 * PUT /api/church/:id/config
 * Atualizar configurações da igreja
 */
router.put('/:id/config', identifyChurch, async (req, res) => {
  const pool = getPool();

  try {
    const churchId = req.params.id;
    const {
      // Informações básicas
      name,
      description,
      about_content,
      email,
      phone,
      whatsapp,

      // Endereço
      address_street,
      address_number,
      address_complement,
      address_neighborhood,
      address_city,
      address_state,
      address_zip,
      latitude = null,
      longitude = null,

      // Logo (URL do Cloudinary ou outra fonte)
      logo_url,

      // Redes sociais
      facebook_url,
      instagram_url,
      youtube_url,
      youtube_channel_id,
    } = req.body;

    // Atualizar igreja (incluindo logo_url para suporte a Cloudinary)
    await pool.execute(`
      UPDATE churches SET
        name = ?,
        description = ?,
        about_content = ?,
        email = ?,
        phone = ?,
        whatsapp = ?,
        logo_url = ?,
        address_street = ?,
        address_number = ?,
        address_complement = ?,
        address_neighborhood = ?,
        address_city = ?,
        address_state = ?,
        address_zip = ?,
        latitude = NULL,
        longitude = NULL,
        facebook_url = ?,
        instagram_url = ?,
        youtube_url = ?,
        youtube_channel_id = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [
      name ?? null,
      description ?? null,
      about_content ?? null,
      email ?? null,
      phone ?? null,
      whatsapp ?? null,
      logo_url ?? null,
      address_street ?? null,
      address_number ?? null,
      address_complement ?? null,
      address_neighborhood ?? null,
      address_city ?? null,
      address_state ?? null,
      address_zip ?? null,
      // Removido latitude/longitude - usando apenas endereço textual
      facebook_url ?? null,
      instagram_url ?? null,
      youtube_url ?? null,
      youtube_channel_id ?? null,
      churchId,
    ]);

    res.json({
      success: true,
      message: 'Configurações salvas com sucesso!',
    });
  } catch (error) {
    console.error('Error saving church config:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/church/:id/config
 * Buscar configurações da igreja
 */
router.get('/:id/config', identifyChurch, async (req, res) => {
  const pool = getPool();
  
  try {
    const churchId = req.params.id;
    
    const [churches] = await pool.query(
      'SELECT * FROM churches WHERE id = ? LIMIT 1',
      [churchId]
    );
    
    const church = Array.isArray(churches) ? churches[0] : null;
    
    if (!church) {
      return res.status(404).json({
        success: false,
        error: 'Igreja não encontrada',
      });
    }
    
    res.json({
      success: true,
      data: church,
    });
  } catch (error) {
    console.error('Error fetching church config:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/church/:id/services
 * Salvar horários de culto
 */
router.post('/:id/services', identifyChurch, async (req, res) => {
  const pool = getPool();
  
  try {
    const churchId = req.params.id;
    const { services } = req.body; // Array de {day, name, time, description}
    
    // Deletar serviços existentes
    await pool.execute(
      'DELETE FROM church_service_times WHERE church_id = ?',
      [churchId]
    );
    
    // Inserir novos serviços
    if (services && services.length > 0) {
      const dayMap = {
        'Domingo': 'Sunday',
        'Segunda-feira': 'Monday',
        'Terça-feira': 'Tuesday',
        'Quarta-feira': 'Wednesday',
        'Quinta-feira': 'Thursday',
        'Sexta-feira': 'Friday',
        'Sábado': 'Saturday',
      };
      
      for (const service of services) {
        await pool.execute(`
          INSERT INTO church_service_times (
            church_id, day_of_week, service_name, service_time, description, is_active
          ) VALUES (?, ?, ?, ?, ?, 1)
        `, [
          churchId,
          dayMap[service.day] || 'Sunday',
          service.name,
          service.time,
          service.description || '',
        ]);
      }
    }
    
    res.json({
      success: true,
      message: 'Horários de culto salvos com sucesso!',
    });
  } catch (error) {
    console.error('Error saving service times:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/church/:id/services
 * Buscar horários de culto
 */
router.get('/:id/services', identifyChurch, async (req, res) => {
  const pool = getPool();
  
  try {
    const churchId = req.params.id;
    
    const [services] = await pool.query(
      `SELECT * FROM church_service_times 
       WHERE church_id = ? AND is_active = 1 
       ORDER BY FIELD(day_of_week, 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')`,
      [churchId]
    );
    
    // Mapear dias para português
    const dayMapReverse = {
      'Sunday': 'Domingo',
      'Monday': 'Segunda-feira',
      'Tuesday': 'Terça-feira',
      'Wednesday': 'Quarta-feira',
      'Thursday': 'Quinta-feira',
      'Friday': 'Sexta-feira',
      'Saturday': 'Sábado',
    };
    
    const servicesMapped = services.map(s => ({
      ...s,
      day: dayMapReverse[s.day_of_week] || s.day_of_week,
    }));
    
    res.json({
      success: true,
      data: servicesMapped,
    });
  } catch (error) {
    console.error('Error fetching service times:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/church/:id/logo
 * Upload de logo da igreja
 */
router.post('/:id/logo', identifyChurch, (req, res, next) => {
  logoUpload.single('logo')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: 'Erro no upload: ' + err.message,
      });
    }
    next();
  });
}, async (req, res) => {

  try {
    const churchId = req.params.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhuma imagem enviada',
      });
    }

    // Verificar se igreja tem permissão (plano Essencial+ ou trial ativo)
    const limits = PLAN_LIMITS[req.churchPlan] || PLAN_LIMITS.free;

    if (!limits.hasLogoUpload) {
      // Deletar arquivo se não tem permissão
      fs.unlinkSync(req.file.path);
      return res.status(403).json({
        success: false,
        error: `Upload de logo não disponível no plano ${req.churchPlan}`,
        upgrade: true,
      });
    }

    const pool = getPool();
    const logoUrl = `/api/uploads/logos/${req.file.filename}`;

    // Atualizar logo no banco
    await pool.execute(
      'UPDATE churches SET logo_url = ?, updated_at = NOW() WHERE id = ?',
      [logoUrl, churchId]
    );

    res.json({
      success: true,
      message: 'Logo enviada com sucesso!',
      data: {
        logo_url: logoUrl,
      },
    });
  } catch (error) {
    console.error('❌ Error uploading logo:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
