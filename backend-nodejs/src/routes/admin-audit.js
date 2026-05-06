/**
 * API: Super Admin - Logs de Auditoria
 * ============================================
 * Rotas para gerenciar e visualizar logs de auditoria da plataforma.
 *
 * Rotas:
 * GET    /api/admin/audit-logs              - Listar logs com filtros
 * GET    /api/admin/audit-logs/stats        - Estatísticas dos logs
 * GET    /api/admin/audit-logs/export/csv   - Exportar logs em CSV
 * GET    /api/admin/audit-logs/export/pdf   - Exportar logs em PDF
 * DELETE /api/admin/audit-logs/:id          - Excluir log individual
 * DELETE /api/admin/audit-logs/bulk-delete  - Excluir múltiplos logs
 */

import express from 'express';
import { getPool } from '../config/database.js';
import { isAdmin } from '../middleware/permissions.js';
import PDFDocument from 'pdfkit';

const router = express.Router();

/**
 * GET /api/admin/audit-logs
 * Listar logs de auditoria com filtros e paginação
 * 
 * Query params:
 * - page: número da página (default: 1)
 * - limit: itens por página (default: 50)
 * - action: filtrar por ação (ex: 'church.suspended')
 * - church_id: filtrar por igreja
 * - user_id: filtrar por usuário
 * - date_from: data inicial (YYYY-MM-DD)
 * - date_to: data final (YYYY-MM-DD)
 * - search: buscar em action e details
 */
router.get('/audit-logs', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // Construir cláusula WHERE com filtros
    const whereClauses = [];
    const params = [];

    // Filtro por ação
    if (req.query.action) {
      whereClauses.push('al.action = ?');
      params.push(req.query.action);
    }

    // Filtro por igreja
    if (req.query.church_id) {
      whereClauses.push('al.church_id = ?');
      params.push(req.query.church_id);
    }

    // Filtro por usuário
    if (req.query.user_id) {
      whereClauses.push('al.user_id = ?');
      params.push(req.query.user_id);
    }

    // Filtro por data inicial
    if (req.query.date_from) {
      whereClauses.push('al.created_at >= ?');
      params.push(`${req.query.date_from} 00:00:00`);
    }

    // Filtro por data final
    if (req.query.date_to) {
      whereClauses.push('al.created_at <= ?');
      params.push(`${req.query.date_to} 23:59:59`);
    }

    // Busca textual
    if (req.query.search) {
      whereClauses.push('(al.action LIKE ? OR al.details LIKE ?)');
      params.push(`%${req.query.search}%`, `%${req.query.search}%`);
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Query principal com JOIN para trazer nomes
    const selectQuery = `
      SELECT
        al.id,
        al.action,
        al.details,
        al.ip_address,
        al.user_agent,
        al.created_at,
        al.church_id,
        c.name as church_name,
        al.user_id,
        u.name as user_name,
        u.email as user_email
      FROM audit_logs al
      LEFT JOIN churches c ON al.church_id = c.id
      LEFT JOIN usuarios_admin u ON al.user_id = u.id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [logs] = await pool.query(selectQuery, [...params, limit, offset]);

    // Contar total para paginação
    const countQuery = `
      SELECT COUNT(*) as count
      FROM audit_logs al
      ${whereClause}
    `;
    const [totalResult] = await pool.query(countQuery, params);
    const total = Array.isArray(totalResult) ? totalResult[0].count : 0;

    // Formatar logs
    const formattedLogs = Array.isArray(logs) ? logs.map(log => {
      let parsedDetails = null;
      if (log.details) {
        // Verificar se é uma string que parece JSON (começa com { ou [)
        const detailsStr = String(log.details).trim();
        if (detailsStr.startsWith('{') || detailsStr.startsWith('[')) {
          try {
            parsedDetails = JSON.parse(detailsStr);
          } catch (e) {
            console.warn('Failed to parse details for log', log.id, e);
            parsedDetails = { raw: detailsStr };
          }
        } else {
          // Texto simples, não JSON
          parsedDetails = { raw: detailsStr };
        }
      }
      
      return {
        id: log.id,
        action: log.action,
        details: parsedDetails,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        createdAt: log.created_at,
        church: log.church_id ? {
          id: log.church_id,
          name: log.church_name,
        } : null,
        user: log.user_id ? {
          id: log.user_id,
          name: log.user_name,
          email: log.user_email,
        } : null,
      };
    }) : [];

    res.json({
      success: true,
      data: {
        logs: formattedLogs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      params: params,
      query: selectQuery,
    });
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});

/**
 * GET /api/admin/audit-logs/stats
 * Estatísticas dos logs de auditoria
 */
router.get('/audit-logs/stats', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    // Total de logs
    const [totalLogs] = await pool.query('SELECT COUNT(*) as count FROM audit_logs');

    // Logs por ação (top 20)
    const [actionsCount] = await pool.query(`
      SELECT
        action,
        COUNT(*) as count
      FROM audit_logs
      GROUP BY action
      ORDER BY count DESC
      LIMIT 20
    `);

    // Logs nas últimas 24 horas
    const [last24h] = await pool.query(`
      SELECT COUNT(*) as count
      FROM audit_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);

    // Logs nos últimos 7 dias
    const [last7d] = await pool.query(`
      SELECT COUNT(*) as count
      FROM audit_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // Logs por dia (últimos 30 dias)
    const [logsPerDay] = await pool.query(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM audit_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // IPs mais ativos (top 10)
    const [topIPs] = await pool.query(`
      SELECT
        ip_address,
        COUNT(*) as count
      FROM audit_logs
      WHERE ip_address IS NOT NULL
      GROUP BY ip_address
      ORDER BY count DESC
      LIMIT 10
    `);

    // Usuários mais ativos (top 10)
    const [topUsers] = await pool.query(`
      SELECT
        al.user_id,
        u.name as user_name,
        u.email as user_email,
        COUNT(*) as count
      FROM audit_logs al
      LEFT JOIN usuarios_admin u ON al.user_id = u.id
      WHERE al.user_id IS NOT NULL
      GROUP BY al.user_id, u.name, u.email
      ORDER BY count DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        total: Array.isArray(totalLogs) ? totalLogs[0].count : 0,
        last24h: Array.isArray(last24h) ? last24h[0].count : 0,
        last7d: Array.isArray(last7d) ? last7d[0].count : 0,
        actions: Array.isArray(actionsCount) ? actionsCount : [],
        logsPerDay: Array.isArray(logsPerDay) ? logsPerDay : [],
        topIPs: Array.isArray(topIPs) ? topIPs : [],
        topUsers: Array.isArray(topUsers) ? topUsers : [],
      },
    });
  } catch (error) {
    console.error('Error fetching audit logs stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/audit-logs/export/csv
 * Exportar logs de auditoria em CSV (Padrão Excel Brasileiro)
 */
router.get('/audit-logs/export/csv', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const limit = parseInt(req.query.limit) || 1000;

    // Buscar logs
    const [logs] = await pool.query(`
      SELECT
        al.id,
        al.action,
        al.details,
        al.ip_address,
        al.user_agent,
        al.created_at,
        c.name as church_name,
        u.name as user_name,
        u.email as user_email
      FROM audit_logs al
      LEFT JOIN churches c ON al.church_id = c.id
      LEFT JOIN usuarios_admin u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ?
    `, [limit]);

    // Gerar CSV no padrão Excel Brasileiro
    // Usando ponto e vírgula (;) como separador
    // Codificação UTF-8 com BOM para Excel reconhecer acentos
    const bom = '\uFEFF'; // BOM para UTF-8
    const separator = ';'; // Separador padrão brasileiro
    
    const headers = ['ID', 'Ação', 'Data/Hora', 'Usuário', 'Email', 'Igreja', 'IP', 'Detalhes'];
    
    const csvRows = [headers.join(separator)];

    if (Array.isArray(logs)) {
      logs.forEach(log => {
        // Escapar aspas duplas e preparar detalhes
        const details = log.details ? log.details.replace(/"/g, '""') : '';
        
        // Formatar data para padrão brasileiro
        const dataHora = new Date(log.created_at).toLocaleString('pt-BR');
        
        // Montar linha com campos entre aspas se contiverem separador ou aspas
        const row = [
          log.id.toString(),
          log.action,
          dataHora,
          log.user_name || 'N/A',
          log.user_email || 'N/A',
          log.church_name || 'N/A',
          log.ip_address || 'N/A',
          `"${details}"`, // Detalhes sempre entre aspas
        ];
        
        csvRows.push(row.join(separator));
      });
    }

    const csvContent = bom + csvRows.join('\n');

    // Configurar headers para download
    res.setHeader('Content-Type', 'text/csv; charset=UTF-8');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting audit logs to CSV:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/audit-logs/:id
 * Ver detalhes de um log específico
 */
router.get('/audit-logs/:id', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const logId = req.params.id;

    const [logs] = await pool.query(`
      SELECT
        al.*,
        c.name as church_name,
        c.slug as church_slug,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role
      FROM audit_logs al
      LEFT JOIN churches c ON al.church_id = c.id
      LEFT JOIN usuarios_admin u ON al.user_id = u.id
      WHERE al.id = ?
    `, [logId]);

    if (!Array.isArray(logs) || logs.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Log not found',
      });
    }

    const log = logs[0];

    res.json({
      success: true,
      data: {
        id: log.id,
        action: log.action,
        details: log.details ? JSON.parse(log.details) : null,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        createdAt: log.created_at,
        church: log.church_id ? {
          id: log.church_id,
          name: log.church_name,
          slug: log.church_slug,
        } : null,
        user: log.user_id ? {
          id: log.user_id,
          name: log.user_name,
          email: log.user_email,
          role: log.user_role,
        } : null,
      },
    });
  } catch (error) {
    console.error('Error fetching audit log details:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/admin/audit-logs/:id
 * Excluir um log de auditoria
 */
router.delete('/audit-logs/:id', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const logId = req.params.id;

    const [result] = await pool.query('DELETE FROM audit_logs WHERE id = ?', [logId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Log não encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Log excluído com sucesso!',
    });
  } catch (error) {
    console.error('Error deleting audit log:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/admin/audit-logs/bulk-delete
 * Excluir múltiplos logs de auditoria
 */
router.delete('/audit-logs/bulk-delete', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const { logIds } = req.body;

    if (!Array.isArray(logIds) || logIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum log selecionado para exclusão',
      });
    }

    const placeholders = logIds.map(() => '?').join(',');
    const [result] = await pool.query(`DELETE FROM audit_logs WHERE id IN (${placeholders})`, logIds);

    res.json({
      success: true,
      message: `${result.affectedRows} log(s) excluído(s) com sucesso!`,
      deletedCount: result.affectedRows,
    });
  } catch (error) {
    console.error('Error bulk deleting audit logs:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/audit-logs/export/pdf
 * Exportar logs de auditoria em PDF
 */
router.get('/audit-logs/export/pdf', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const limit = parseInt(req.query.limit) || 100;

    // Construir filtros
    const whereClauses = [];
    const params = [];

    if (req.query.action) {
      whereClauses.push('al.action = ?');
      params.push(req.query.action);
    }

    if (req.query.date_from) {
      whereClauses.push('al.created_at >= ?');
      params.push(`${req.query.date_from} 00:00:00`);
    }

    if (req.query.date_to) {
      whereClauses.push('al.created_at <= ?');
      params.push(`${req.query.date_to} 23:59:59`);
    }

    if (req.query.search) {
      whereClauses.push('(al.action LIKE ? OR al.details LIKE ?)');
      params.push(`%${req.query.search}%`, `%${req.query.search}%`);
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Buscar logs
    const [logs] = await pool.query(`
      SELECT
        al.id,
        al.action,
        al.details,
        al.ip_address,
        al.created_at,
        c.name as church_name,
        u.name as user_name,
        u.email as user_email
      FROM audit_logs al
      LEFT JOIN churches c ON al.church_id = c.id
      LEFT JOIN usuarios_admin u ON al.user_id = u.id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT ?
    `, [...params, limit]);

    // Criar documento PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
    
    // Configurar headers para download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.pdf"`);
    
    doc.pipe(res);

    // Cabeçalho
    doc.fontSize(20).text('Relatório de Logs de Auditoria', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'right' });
    doc.moveDown();

    // Tabela - Header
    const tableTop = 150;
    const tableLeft = 50;
    
    doc.fontSize(10);
    doc.font('Helvetica-Bold');
    doc.text('ID', tableLeft, tableTop);
    doc.text('Ação', tableLeft + 50, tableTop);
    doc.text('Data/Hora', tableLeft + 200, tableTop);
    doc.text('Usuário', tableLeft + 350, tableTop);
    doc.text('Igreja', tableLeft + 500, tableTop);
    doc.text('IP', tableLeft + 700, tableTop);

    // Linha separadora
    doc.moveTo(tableLeft, tableTop + 15)
       .lineTo(tableLeft + 800, tableTop + 15)
       .stroke();

    // Dados da tabela
    let currentTop = tableTop + 30;
    
    if (Array.isArray(logs)) {
      logs.forEach((log, index) => {
        if (currentTop > 550) {
          // Nova página
          doc.addPage();
          currentTop = 50;
        }

        doc.font('Helvetica');
        doc.fontSize(9);
        
        doc.text(`#${log.id}`, tableLeft, currentTop);
        doc.text(log.action, tableLeft + 50, currentTop, { width: 140 });
        doc.text(new Date(log.created_at).toLocaleString('pt-BR'), tableLeft + 200, currentTop, { width: 140 });
        doc.text(log.user_name || 'Sistema', tableLeft + 350, currentTop, { width: 140 });
        doc.text(log.church_name || '-', tableLeft + 500, currentTop, { width: 140 });
        doc.text(log.ip_address || 'N/A', tableLeft + 700, currentTop, { width: 100 });

        currentTop += 20;

        // Linha separadora a cada registro
        if (index % 2 === 0) {
          doc.moveTo(tableLeft, currentTop - 10)
             .lineTo(tableLeft + 800, currentTop - 10)
             .stroke({ color: '#EEEEEE' });
        }
      });
    }

    // Rodapé com total
    doc.moveDown(2);
    doc.fontSize(10);
    doc.text(`Total de registros: ${Array.isArray(logs) ? logs.length : 0}`, 50, 550);

    doc.end();
  } catch (error) {
    console.error('Error exporting audit logs to PDF:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
