/**
 * Rotas: Church Members (Membros da Igreja)
 * Backend Node.js
 */

import express from 'express';
import { getPool } from '../config/database.js';
import multer from 'multer';
import { parseCSV, isValidCSV } from '../middleware/csvParser.js';
import { validateMembers } from '../middleware/csvValidator.js';

const router = express.Router();

// Configurar multer para upload de arquivos em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1
  }
});

// Middleware para identificar a igreja pelo church_id
const identifyChurch = async (req, res, next) => {
  try {
    const churchId = req.headers['x-church-id'] || req.query.church_id;
    
    if (!churchId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Church ID required' 
      });
    }

    const pool = getPool();
    const [churches] = await pool.query(
      'SELECT id, name, is_active FROM churches WHERE id = ? LIMIT 1',
      [churchId]
    );

    if (churches.length === 0 || !churches[0].is_active) {
      return res.status(404).json({ 
        success: false, 
        error: 'Church not found or inactive' 
      });
    }

    req.churchId = churchId;
    req.church = churches[0];
    next();
  } catch (error) {
    console.error('Error identifying church:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// GET /api/members - Listar todos os membros da igreja
router.get('/', identifyChurch, async (req, res) => {
  try {
    const pool = getPool();
    const { search, status } = req.query;

    let query = 'SELECT * FROM church_members WHERE church_id = ?';
    const params = [req.churchId];

    // Filtro por busca
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Filtro por status (somente se for 'active' ou 'inactive')
    if (status === 'active' || status === 'inactive') {
      query += ' AND is_active = ?';
      params.push(status === 'active' ? 1 : 0);
    }

    query += ' ORDER BY name ASC';

    console.log('🔍 Query members:', query);
    console.log('🔍 Params:', params);

    const [members] = await pool.query(query, params);

    console.log('📦 Members encontrados:', members.length);

    res.json({
      success: true,
      data: members,
      count: members.length
    });
  } catch (error) {
    console.error('Error listing members:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/members/export-csv - Exportar membros em CSV
router.get('/export-csv', identifyChurch, async (req, res) => {
  try {
    const pool = getPool();
    
    // Buscar todos os membros da igreja
    const [members] = await pool.query(
      `SELECT 
        name, email, phone, birth_date, baptism_date, membership_date, 
        member_status, ministry, is_leader, is_active, created_at
       FROM church_members 
       WHERE church_id = ? 
       ORDER BY name ASC`,
      [req.churchId]
    );
    
    // Converter para CSV
    const headers = ['nome', 'email', 'telefone', 'data_nascimento', 'data_batismo', 'data_membros', 'status', 'ministerio', 'e_lider'];
    
    const rows = members.map(member => {
      // Converter datas do banco (YYYY-MM-DD) para formato CSV (DD/MM/AAAA)
      const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date + 'T00:00:00'); // Adiciona timezone para evitar problemas
        if (isNaN(d.getTime())) return '';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      };
      
      // Converter telefone para formato brasileiro
      const formatPhone = (phone) => {
        if (!phone) return '';
        const digits = phone.replace(/\D/g, '');
        if (digits.length === 11) {
          return `( ${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
        } else if (digits.length === 10) {
          return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
        }
        return phone;
      };
      
      // Mapear campos do banco para CSV
      return [
        `"${member.name || ''}"`,
        `"${member.email || ''}"`,
        `"${formatPhone(member.phone) || ''}"`,
        `"${formatDate(member.birth_date) || ''}"`,
        `"${formatDate(member.baptism_date) || ''}"`,
        `"${formatDate(member.membership_date) || ''}"`,
        `"${member.member_status || 'visitor'}"`,
        `"${member.ministry || ''}"`,
        `"${member.is_leader || 0}"`
      ].join(';'); // Usar ponto e vírgula como separador (padrão BR)
    });
    
    // BOM para UTF-8 (Excel reconhece UTF-8)
    const BOM = '\uFEFF';
    const csvContent = BOM + [headers.join(';'), ...rows].join('\n');
    
    // Configurar headers para download
    const fileName = `membros_${new Date().toISOString().split('T')[0]}.csv`;
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao exportar CSV: ' + error.message
    });
  }
});

// GET /api/members/backup - Backup completo em JSON
router.get('/backup', identifyChurch, async (req, res) => {
  try {
    const pool = getPool();
    const churchId = req.churchId;
    
    // Buscar todos os dados da igreja
    const [members] = await pool.query(
      'SELECT * FROM church_members WHERE church_id = ? ORDER BY name ASC',
      [churchId]
    );
    
    const [pedidos] = await pool.query(
      'SELECT * FROM pedidos WHERE church_id = ? ORDER BY created_at DESC',
      [churchId]
    );
    
    const [events] = await pool.query(
      'SELECT * FROM church_events WHERE church_id = ? ORDER BY start_datetime DESC',
      [churchId]
    );
    
    const [ministries] = await pool.query(
      'SELECT * FROM church_ministries WHERE church_id = ? ORDER BY name ASC',
      [churchId]
    );
    
    const [services] = await pool.query(
      'SELECT * FROM church_service_times WHERE church_id = ? ORDER BY day_of_week, service_time',
      [churchId]
    );
    
    // Criar objeto de backup
    const backupData = {
      metadata: {
        church_id: churchId,
        church_name: req.church.name,
        export_date: new Date().toISOString(),
        version: '1.0'
      },
      data: {
        members: {
          total: members.length,
          records: members
        },
        pedidos: {
          total: pedidos.length,
          records: pedidos
        },
        events: {
          total: events.length,
          records: events
        },
        ministries: {
          total: ministries.length,
          records: ministries
        },
        services: {
          total: services.length,
          records: services
        }
      },
      summary: {
        total_members: members.length,
        total_pedidos: pedidos.length,
        total_events: events.length,
        total_ministries: ministries.length,
        total_services: services.length
      }
    };
    
    // Configurar download
    const fileName = `backup_${churchId}_${new Date().toISOString().split('T')[0]}.json`;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.send(JSON.stringify(backupData, null, 2));
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar backup: ' + error.message
    });
  }
});

// GET /api/members/import-template - Baixar template CSV
router.get('/import-template', (req, res) => {
  // BOM para UTF-8 (Excel reconhece UTF-8)
  const BOM = '\uFEFF';
  
  // Usar ponto e vírgula como separador (padrão BR)
  const template = `nome;email;telefone;data_nascimento;data_batismo;data_membros;status;ministerio;e_lider
"João Silva";"joao@email.com";"(92)988551819";"15/05/1990";"20/06/2010";"27/06/2010";"member";"Louvor";"0"
"Maria Santos";"maria@email.com";"";"22/08/1985";"";"";"visitor";"";""
"Pedro Oliveira";"pedro@email.com";"(92)999998888";"10/03/1995";"15/04/2015";"22/04/2015";"member";"Ensino";"1"`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=template_membros.csv');
  res.send(BOM + template);
});

// GET /api/members/:id/profile - Perfil completo com histórico
router.get('/:id/profile', identifyChurch, async (req, res) => {
  try {
    const memberId = req.params.id;
    const pool = getPool();

    // Buscar membro
    const [members] = await pool.query(
      'SELECT * FROM church_members WHERE id = ? AND church_id = ? LIMIT 1',
      [memberId, req.churchId]
    );

    if (members.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Membro não encontrado'
      });
    }

    const member = members[0];

    // Gerar timeline automática
    const timeline = [];

    // 1. Cadastro
    if (member.created_at) {
      timeline.push({
        id: 1,
        event_type: 'created',
        event_label: 'Cadastro',
        event_date: member.created_at,
        description: 'Membro registrado no sistema',
        icon: 'user'
      });
    }

    // 2. Batismo
    if (member.baptism_date) {
      timeline.push({
        id: 2,
        event_type: 'baptism',
        event_label: 'Batismo',
        event_date: member.baptism_date,
        description: `Data de batismo: ${new Date(member.baptism_date).toLocaleDateString('pt-BR')}`,
        icon: 'baptism'
      });
    }

    // 3. Membro (membership_date)
    if (member.membership_date) {
      timeline.push({
        id: 3,
        event_type: 'membership',
        event_label: 'Membro',
        event_date: member.membership_date,
        description: `Data de membresia: ${new Date(member.membership_date).toLocaleDateString('pt-BR')}`,
        icon: 'membership'
      });
    }

    // 4. Ministério
    if (member.ministry) {
      timeline.push({
        id: 4,
        event_type: 'ministry',
        event_label: 'Ministério',
        event_date: member.updated_at,
        description: `Ministério: ${member.ministry}`,
        icon: 'ministry'
      });
    }

    // 5. Liderança
    if (member.is_leader === 1) {
      timeline.push({
        id: 5,
        event_type: 'leader',
        event_label: 'Liderança',
        event_date: member.updated_at,
        description: 'Membro é líder',
        icon: 'leader'
      });
    }

    // 6. Notas
    if (member.notes) {
      timeline.push({
        id: 6,
        event_type: 'notes',
        event_label: 'Anotações',
        event_date: member.updated_at,
        description: member.notes,
        icon: 'notes'
      });
    }

    // 7. Última atualização
    if (member.updated_at) {
      timeline.push({
        id: 7,
        event_type: 'updated',
        event_label: 'Atualização',
        event_date: member.updated_at,
        description: 'Última atualização do cadastro',
        icon: 'updated'
      });
    }

    // Ordenar por data (mais recente primeiro)
    timeline.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));

    res.json({
      success: true,
      data: {
        member: member,
        timeline: timeline
      }
    });
  } catch (error) {
    console.error('Error fetching member profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/members/:id - Buscar membro por ID
router.get('/:id', identifyChurch, async (req, res) => {
  try {
    const memberId = req.params.id;
    const pool = getPool();

    const [members] = await pool.query(
      'SELECT * FROM church_members WHERE id = ? AND church_id = ? LIMIT 1',
      [memberId, req.churchId]
    );

    if (members.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Member not found' 
      });
    }

    res.json({ 
      success: true, 
      data: members[0] 
    });
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/members/stats - Estatísticas de membros
router.get('/stats/overview', identifyChurch, async (req, res) => {
  try {
    const pool = getPool();

    // Total de membros
    const [total] = await pool.query(
      'SELECT COUNT(*) as count FROM church_members WHERE church_id = ?',
      [req.churchId]
    );

    // Membros ativos
    const [active] = await pool.query(
      'SELECT COUNT(*) as count FROM church_members WHERE church_id = ? AND is_active = 1',
      [req.churchId]
    );

    // Membros inativos
    const [inactive] = await pool.query(
      'SELECT COUNT(*) as count FROM church_members WHERE church_id = ? AND is_active = 0',
      [req.churchId]
    );

    // Aniversariantes do mês
    const [birthdays] = await pool.query(
      `SELECT COUNT(*) as count FROM church_members 
       WHERE church_id = ? AND is_active = 1 
       AND MONTH(created_at) = MONTH(CURDATE())`,
      [req.churchId]
    );

    res.json({
      success: true,
      data: {
        total: total[0].count,
        active: active[0].count,
        inactive: inactive[0].count,
        birthdays: birthdays[0].count
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// POST /api/members - Criar novo membro
router.post('/', identifyChurch, async (req, res) => {
  try {
    const { name, email, phone, birth_date, photo_url } = req.body;

    // Validações
    const errors = [];

    if (!name || name.trim().length < 3) {
      errors.push('Nome deve ter pelo menos 3 caracteres');
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      errors.push('Email inválido');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Erro de validação',
        details: errors
      });
    }

    const pool = getPool();

    // Verificar email duplicado (se fornecido)
    if (email) {
      const [existing] = await pool.query(
        'SELECT id FROM church_members WHERE church_id = ? AND email = ? LIMIT 1',
        [req.churchId, email]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Este email já está cadastrado'
        });
      }
    }

    // Inserir membro com birth_date e photo_url
    const [result] = await pool.execute(
      `INSERT INTO church_members (church_id, name, email, phone, birth_date, photo_url, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, NOW())`,
      [req.churchId, name.trim(), email?.trim() || null, phone?.trim() || null, birth_date || null, photo_url || null]
    );

    const memberId = result.insertId;

    // Buscar membro criado
    const [newMember] = await pool.query(
      'SELECT * FROM church_members WHERE id = ? LIMIT 1',
      [memberId]
    );

    res.status(201).json({
      success: true,
      message: 'Membro cadastrado com sucesso!',
      data: newMember[0]
    });
  } catch (error) {
    console.error('Error creating member:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/members/:id - Atualizar membro
router.put('/:id', identifyChurch, async (req, res) => {
  try {
    const memberId = req.params.id;
    const { name, email, phone, birth_date, is_active, photo_url } = req.body;

    // Validações
    const errors = [];

    if (!name || name.trim().length < 3) {
      errors.push('Nome deve ter pelo menos 3 caracteres');
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      errors.push('Email inválido');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Erro de validação',
        details: errors
      });
    }

    const pool = getPool();

    // Verificar se membro existe
    const [existing] = await pool.query(
      'SELECT id FROM church_members WHERE id = ? AND church_id = ? LIMIT 1',
      [memberId, req.churchId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Membro não encontrado'
      });
    }

    // Verificar email duplicado (se fornecido e diferente do atual)
    if (email) {
      const [emailExists] = await pool.query(
        'SELECT id FROM church_members WHERE church_id = ? AND email = ? AND id != ? LIMIT 1',
        [req.churchId, email.trim(), memberId]
      );

      if (emailExists.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Este email já está cadastrado para outro membro'
        });
      }
    }

    // Atualizar membro com birth_date e photo_url
    await pool.execute(
      `UPDATE church_members SET
       name = ?,
       email = ?,
       phone = ?,
       birth_date = ?,
       is_active = ?,
       photo_url = ?,
       updated_at = NOW()
       WHERE id = ?`,
      [
        name.trim(),
        email?.trim() || null,
        phone?.trim() || null,
        birth_date || null,
        is_active ? 1 : 0,
        photo_url || null,
        memberId
      ]
    );

    // Buscar membro atualizado
    const [updatedMember] = await pool.query(
      'SELECT * FROM church_members WHERE id = ? LIMIT 1',
      [memberId]
    );

    res.json({
      success: true,
      message: 'Membro atualizado com sucesso!',
      data: updatedMember[0]
    });
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/members/:id - Excluir membro
router.delete('/:id', identifyChurch, async (req, res) => {
  try {
    const memberId = req.params.id;
    const pool = getPool();

    // Verificar se membro existe
    const [existing] = await pool.query(
      'SELECT id FROM church_members WHERE id = ? AND church_id = ? LIMIT 1',
      [memberId, req.churchId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Membro não encontrado' 
      });
    }

    // Excluir membro
    await pool.execute(
      'DELETE FROM church_members WHERE id = ?',
      [memberId]
    );

    res.json({
      success: true,
      message: 'Membro excluído com sucesso!'
    });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/members/import-csv - Importar membros via CSV
router.post('/import-csv', identifyChurch, upload.single('file'), async (req, res) => {
  try {
    const pool = getPool();
    
    // Verificar se arquivo foi enviado
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado'
      });
    }
    
    // Converter buffer para string
    const content = req.file.buffer.toString('utf-8');
    
    // Validar se é CSV
    if (!isValidCSV(content)) {
      return res.status(400).json({
        success: false,
        error: 'Arquivo CSV inválido. Verifique o formato.'
      });
    }
    
    // Parse do CSV
    const records = parseCSV(content);
    
    if (records.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Arquivo CSV vazio ou sem dados válidos'
      });
    }
    
    // Buscar emails já cadastrados para validação
    const [existingMembers] = await pool.query(
      'SELECT email FROM church_members WHERE church_id = ? AND email IS NOT NULL AND email != ""',
      [req.churchId]
    );
    
    const existingEmails = existingMembers
      .map(m => m.email ? m.email.toLowerCase().trim() : '')
      .filter(email => email.length > 0);
    
    // Validar todos os registros
    const validation = validateMembers(records, existingEmails);
    
    // Se tiver erros críticos, retornar
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Erros de validação encontrados',
        data: {
          total: validation.total,
          validCount: validation.validCount,
          invalidCount: validation.invalidCount,
          invalidRecords: validation.invalidRecords,
          warnings: validation.warnings
        }
      });
    }
    
    // Importar membros válidos (transação)
    const importedMembers = [];
    const warnings = [];
    
    for (const record of validation.validRecords) {
      try {
        // Mapear campos do CSV para campos do banco
        const memberData = {
          church_id: req.churchId,
          name: record.nome,
          email: record.email || null,
          phone: record.telefone || null,
          birth_date: record.data_nascimento || null,
          baptism_date: record.data_batismo || null,
          membership_date: record.data_membros || null,
          member_status: record.status || 'visitor',
          ministry: record.ministerio || null,
          is_leader: record.e_lider ? parseInt(record.e_lider) : 0,
          is_active: 1,
          created_at: new Date()
        };
        
        // Inserir membro
        const [result] = await pool.execute(
          `INSERT INTO church_members (
            church_id, name, email, phone, birth_date, baptism_date, 
            membership_date, member_status, ministry, is_leader, is_active, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            memberData.church_id,
            memberData.name,
            memberData.email,
            memberData.phone,
            memberData.birth_date,
            memberData.baptism_date,
            memberData.membership_date,
            memberData.member_status,
            memberData.ministry,
            memberData.is_leader,
            memberData.is_active,
            memberData.created_at
          ]
        );
        
        importedMembers.push({
          id: result.insertId,
          name: memberData.name,
          email: memberData.email
        });
        
        // Adicionar warnings se existir
        if (record.warnings && record.warnings.length > 0) {
          warnings.push({
            name: memberData.name,
            email: memberData.email,
            warnings: record.warnings
          });
        }
      } catch (error) {
        console.error('Erro ao importar membro:', record.nome, error);
        warnings.push({
          name: record.nome,
          email: record.email,
          warnings: ['Erro ao inserir: ' + error.message]
        });
      }
    }
    
    // Retornar resultado
    res.json({
      success: true,
      message: `${importedMembers.length} membro(s) importado(s) com sucesso`,
      data: {
        total: validation.total,
        imported: importedMembers.length,
        members: importedMembers,
        warnings: warnings
      }
    });
  } catch (error) {
    console.error('Error importing CSV:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao importar CSV: ' + error.message
    });
  }
});

export default router;
