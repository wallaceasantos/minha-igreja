/**
 * API: Upload de Fotos
 * Upload local de imagens para membros
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();

// Configurar diretório de uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads/membros');

// Criar pasta se não existir
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar multer para upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const churchId = req.headers['x-church-id'] || 'unknown';
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(file.originalname);
    cb(null, `church_${churchId}_${timestamp}_${randomId}${ext}`);
  }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Apenas JPEG, PNG, GIF e WebP.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// POST /api/upload/membro - Upload de foto de membro
router.post('/membro', upload.single('foto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado'
      });
    }

    // Verificar tamanho do arquivo
    if (req.file.size > 5 * 1024 * 1024) {
      // Remover arquivo
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'Arquivo muito grande. Máximo 5MB.'
      });
    }

    // URL da foto (acessível via API)
    const photoUrl = `/api/uploads/membros/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Foto carregada com sucesso!',
      data: {
        photoUrl: photoUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
