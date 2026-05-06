/**
 * API: Relatórios de Atividade - Páginas Mais Acessadas
 * ============================================
 * Rotas para visualizar estatísticas de acesso.
 *
 * Rotas:
 * GET    /api/admin/reports/top-pages         - Páginas mais acessadas
 * GET    /api/admin/reports/access-stats      - Estatísticas de acesso
 * GET    /api/admin/reports/hourly-traffic    - Tráfego por hora
 * GET    /api/admin/reports/user-activity     - Atividade por usuário
 */

import express from 'express';
import { getPool } from '../config/database.js';
import { isAdmin } from '../middleware/permissions.js';
import PDFDocument from 'pdfkit';
import { rateLimits } from '../middleware/rateLimiter.js';

const router = express.Router();

// Rate limiting para exportação de relatórios
router.get('/reports/export', rateLimits.export);

/**
 * GET /api/admin/reports/top-pages
 * Páginas mais acessadas
 */
router.get('/reports/top-pages', isAdmin, async (req, res) => {
  const pool = getPool();

  try {
    const { period = '24h', path, user_id, status, method, limit = 20 } = req.query;
    
    let interval = '24 HOUR';
    if (period === '7d') interval = '7 DAY';
    else if (period === '30d') interval = '30 DAY';

    // Construir WHERE clause com filtros
    const whereClauses = [`created_at >= DATE_SUB(NOW(), INTERVAL ${interval})`];
    const params = [];

    if (path) {
      whereClauses.push('path LIKE ?');
      params.push(`%${path}%`);
    }
    if (user_id) {
      whereClauses.push('user_id = ?');
      params.push(parseInt(user_id));
    }
    if (status) {
      whereClauses.push('status = ?');
      params.push(parseInt(status));
    }
    if (method) {
      whereClauses.push('method = ?');
      params.push(method);
    }

    const whereClause = whereClauses.length > 1 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [pages] = await pool.query(`
      SELECT
        path,
        COUNT(*) as views,
        AVG(duration) as avg_duration,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT ip_address) as unique_ips
      FROM access_logs
      ${whereClause}
      GROUP BY path
      ORDER BY views DESC
      LIMIT ?
    `, [...params, parseInt(limit)]);

    res.json({
      success: true,
      data: Array.isArray(pages) ? pages : [],
      period,
    });
  } catch (error) {
    console.error('Error fetching top pages:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/reports/access-stats
 * Estatísticas gerais de acesso
 */
router.get('/reports/access-stats', isAdmin, async (req, res) => {
  const pool = getPool();
  const { period = '24h', path, user_id, status, method, compare } = req.query;
  let interval = '24 HOUR';
  let previousInterval = '48 HOUR'; // Período anterior dobrado
  
  if (period === '7d') {
    interval = '7 DAY';
    previousInterval = '14 DAY';
  } else if (period === '30d') {
    interval = '30 DAY';
    previousInterval = '60 DAY';
  }

  // Construir WHERE clause com filtros
  const whereClauses = [`created_at >= DATE_SUB(NOW(), INTERVAL ${interval})`];
  const params = [];

  if (path) {
    whereClauses.push('path LIKE ?');
    params.push(`%${path}%`);
  }
  if (user_id) {
    whereClauses.push('user_id = ?');
    params.push(parseInt(user_id));
  }
  if (status) {
    whereClauses.push('status = ?');
    params.push(parseInt(status));
  }
  if (method) {
    whereClauses.push('method = ?');
    params.push(method);
  }

  const whereClause = whereClauses.length > 1 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Construir WHERE clause para período anterior
  const previousWhereClauses = [
    `created_at >= DATE_SUB(NOW(), INTERVAL ${previousInterval})`,
    `created_at < DATE_SUB(NOW(), INTERVAL ${interval})`,
  ];
  const previousParams = [];

  if (path) {
    previousWhereClauses.push('path LIKE ?');
    previousParams.push(`%${path}%`);
  }
  if (user_id) {
    previousWhereClauses.push('user_id = ?');
    previousParams.push(parseInt(user_id));
  }
  if (status) {
    previousWhereClauses.push('status = ?');
    previousParams.push(parseInt(status));
  }
  if (method) {
    previousWhereClauses.push('method = ?');
    previousParams.push(method);
  }

  const previousWhereClause = `WHERE ${previousWhereClauses.join(' AND ')}`;

  try {
    // Verificar se tabela existe
    const [tables] = await pool.query(`
      SELECT TABLE_NAME FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'access_logs'
    `);

    if (!Array.isArray(tables) || tables.length === 0) {
      return res.json({
        success: true,
        data: {
          totalRequests: 0,
          avgDuration: 0,
          uniqueUsers: 0,
          uniqueIPs: 0,
          statusDistribution: [],
          methods: [],
          period,
          message: 'Tabela access_logs não existe. Execute o script SQL.',
        },
      });
    }

    // Total de requisições
    const [total] = await pool.query(`
      SELECT COUNT(*) as count
      FROM access_logs
      ${whereClause}
    `, params);

    // Média de duração
    const [avgDuration] = await pool.query(`
      SELECT AVG(duration) as avg_ms
      FROM access_logs
      ${whereClause}
    `, params);

    // Usuários únicos
    const userWhereClause = whereClause ? `${whereClause} AND user_id IS NOT NULL` : 'WHERE user_id IS NOT NULL';
    const [uniqueUsers] = await pool.query(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM access_logs
      ${userWhereClause}
    `, params);

    // IPs únicos
    const [uniqueIPs] = await pool.query(`
      SELECT COUNT(DISTINCT ip_address) as count
      FROM access_logs
      ${whereClause}
    `, params);

    // Distribuição de status
    const [statusDist] = await pool.query(`
      SELECT
        status,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / ?, 2) as percentage
      FROM access_logs
      ${whereClause}
      GROUP BY status
      ORDER BY count DESC
    `, [parseInt(total[0]?.count || 1), ...params]);

    // Métodos HTTP
    const [methods] = await pool.query(`
      SELECT
        method,
        COUNT(*) as count
      FROM access_logs
      ${whereClause}
      GROUP BY method
    `, params);

    // Dados do período anterior (se solicitado)
    let prevTotal = [], prevAvgDuration = [], prevUniqueUsers = [], prevUniqueIPs = [];
    if (compare === 'previous') {
      const prevUserWhereClause = previousWhereClause ? `${previousWhereClause} AND user_id IS NOT NULL` : 'WHERE user_id IS NOT NULL';
      
      [prevTotal, prevAvgDuration, prevUniqueUsers, prevUniqueIPs] = await Promise.all([
        pool.query(`SELECT COUNT(*) as count FROM access_logs ${previousWhereClause}`, previousParams),
        pool.query(`SELECT AVG(duration) as avg_ms FROM access_logs ${previousWhereClause}`, previousParams),
        pool.query(`SELECT COUNT(DISTINCT user_id) as count FROM access_logs ${prevUserWhereClause}`, previousParams),
        pool.query(`SELECT COUNT(DISTINCT ip_address) as count FROM access_logs ${previousWhereClause}`, previousParams),
      ]);
    }

    res.json({
      success: true,
      data: {
        totalRequests: Array.isArray(total) ? total[0].count : 0,
        avgDuration: Array.isArray(avgDuration) ? avgDuration[0].avg_ms : 0,
        uniqueUsers: Array.isArray(uniqueUsers) ? uniqueUsers[0].count : 0,
        uniqueIPs: Array.isArray(uniqueIPs) ? uniqueIPs[0].count : 0,
        statusDistribution: Array.isArray(statusDist) ? statusDist : [],
        methods: Array.isArray(methods) ? methods : [],
        period,
        // Dados do período anterior (se solicitado)
        ...(compare === 'previous' && {
          previousPeriod: {
            totalRequests: Array.isArray(prevTotal) ? prevTotal[0].count : 0,
            avgDuration: Array.isArray(prevAvgDuration) ? prevAvgDuration[0].avg_ms : 0,
            uniqueUsers: Array.isArray(prevUniqueUsers) ? prevUniqueUsers[0].count : 0,
            uniqueIPs: Array.isArray(prevUniqueIPs) ? prevUniqueIPs[0].count : 0,
          },
        }),
      },
    });
  } catch (error) {
    console.error('Error fetching access stats:', error);
    res.json({
      success: true,
      data: {
        totalRequests: 0,
        avgDuration: 0,
        uniqueUsers: 0,
        uniqueIPs: 0,
        statusDistribution: [],
        methods: [],
        period,
        error: error.message,
      },
    });
  }
});

/**
 * GET /api/admin/reports/hourly-traffic
 * Tráfego por hora
 */
router.get('/reports/hourly-traffic', isAdmin, async (req, res) => {
  const pool = getPool();
  const { period = '24h', path, user_id, status, method } = req.query;
  let interval = '24 HOUR';
  
  if (period === '7d') interval = '7 DAY';
  else if (period === '30d') interval = '30 DAY';

  // Construir WHERE clause com filtros
  const whereClauses = [`created_at >= DATE_SUB(NOW(), INTERVAL ${interval})`];
  const params = [];

  if (path) {
    whereClauses.push('path LIKE ?');
    params.push(`%${path}%`);
  }
  if (user_id) {
    whereClauses.push('user_id = ?');
    params.push(parseInt(user_id));
  }
  if (status) {
    whereClauses.push('status = ?');
    params.push(parseInt(status));
  }
  if (method) {
    whereClauses.push('method = ?');
    params.push(method);
  }

  const whereClause = whereClauses.length > 1 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  try {
    // Verificar se tabela existe
    const [tables] = await pool.query(`
      SELECT TABLE_NAME FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'access_logs'
    `);

    if (!Array.isArray(tables) || tables.length === 0) {
      return res.json({
        success: true,
        data: [],
        period,
        message: 'Tabela access_logs não existe. Execute o script SQL.',
      });
    }

    const [hourly] = await pool.query(`
      SELECT
        HOUR(created_at) as hour,
        COUNT(*) as requests,
        COUNT(DISTINCT user_id) as unique_users,
        AVG(duration) as avg_duration
      FROM access_logs
      ${whereClause}
      GROUP BY HOUR(created_at)
      ORDER BY hour ASC
    `, params);

    res.json({
      success: true,
      data: Array.isArray(hourly) ? hourly : [],
      period,
    });
  } catch (error) {
    console.error('Error fetching hourly traffic:', error);
    res.json({
      success: true,
      data: [],
      period,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/reports/user-activity
 * Atividade por usuário
 */
router.get('/reports/user-activity', isAdmin, async (req, res) => {
  const pool = getPool();
  const { period = '24h', limit = 20, path, user_id, status, method } = req.query;
  let interval = '24 HOUR';
  
  if (period === '7d') interval = '7 DAY';
  else if (period === '30d') interval = '30 DAY';

  // Construir WHERE clause com filtros
  const whereClauses = [`created_at >= DATE_SUB(NOW(), INTERVAL ${interval})`];
  const params = [];

  if (path) {
    whereClauses.push('path LIKE ?');
    params.push(`%${path}%`);
  }
  if (user_id) {
    whereClauses.push('user_id = ?');
    params.push(parseInt(user_id));
  }
  if (status) {
    whereClauses.push('status = ?');
    params.push(parseInt(status));
  }
  if (method) {
    whereClauses.push('method = ?');
    params.push(method);
  }

  const whereClause = whereClauses.length > 1 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  try {
    // Verificar se tabela existe
    const [tables] = await pool.query(`
      SELECT TABLE_NAME FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'access_logs'
    `);

    if (!Array.isArray(tables) || tables.length === 0) {
      return res.json({
        success: true,
        data: [],
        period,
        message: 'Tabela access_logs não existe. Execute o script SQL.',
      });
    }

    const userWhereClause = whereClause ? `${whereClause} AND al.user_id IS NOT NULL` : 'WHERE al.user_id IS NOT NULL';

    const [users] = await pool.query(`
      SELECT
        al.user_id,
        u.name as user_name,
        u.email as user_email,
        COUNT(*) as total_actions,
        COUNT(DISTINCT al.path) as unique_pages,
        AVG(al.duration) as avg_duration,
        MAX(al.created_at) as last_activity
      FROM access_logs al
      LEFT JOIN usuarios_admin u ON al.user_id = u.id
      ${userWhereClause}
      GROUP BY al.user_id, u.name, u.email
      ORDER BY total_actions DESC
      LIMIT ?
    `, [...params, parseInt(limit)]);

    res.json({
      success: true,
      data: Array.isArray(users) ? users : [],
      period,
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.json({
      success: true,
      data: [],
      period,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/reports/export
 * Exportar relatório em CSV ou PDF
 */
router.get('/reports/export', isAdmin, async (req, res) => {
  const pool = getPool();
  const { period = '24h', format = 'csv', path, user_id, status, method } = req.query;
  let interval = '24 HOUR';
  
  if (period === '7d') interval = '7 DAY';
  else if (period === '30d') interval = '30 DAY';

  // Construir WHERE clause com filtros
  const whereClauses = [`created_at >= DATE_SUB(NOW(), INTERVAL ${interval})`];
  const params = [];

  if (path) {
    whereClauses.push('path LIKE ?');
    params.push(`%${path}%`);
  }
  if (user_id) {
    whereClauses.push('user_id = ?');
    params.push(parseInt(user_id));
  }
  if (status) {
    whereClauses.push('status = ?');
    params.push(parseInt(status));
  }
  if (method) {
    whereClauses.push('method = ?');
    params.push(method);
  }

  const whereClause = whereClauses.length > 1 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  try {
    // Buscar dados
    const [pages] = await pool.query(`
      SELECT
        path,
        COUNT(*) as views,
        AVG(duration) as avg_duration,
        COUNT(DISTINCT user_id) as unique_users
      FROM access_logs
      ${whereClause}
      GROUP BY path
      ORDER BY views DESC
      LIMIT 100
    `, params);

    const [stats] = await pool.query(`
      SELECT
        COUNT(*) as total_requests,
        AVG(duration) as avg_duration,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT ip_address) as unique_ips
      FROM access_logs
      ${whereClause}
    `, params);

    if (format === 'csv') {
      // Exportar CSV
      const headers = ['Página', 'Visualizações', 'Tempo Médio (ms)', 'Usuários Únicos'];
      const csvRows = [headers.join(';')];

      if (Array.isArray(pages)) {
        pages.forEach(page => {
          const row = [
            page.path,
            page.views,
            Math.round(page.avg_duration),
            page.unique_users,
          ];
          csvRows.push(row.join(';'));
        });
      }

      const csvContent = '\uFEFF' + csvRows.join('\n'); // BOM para UTF-8

      res.setHeader('Content-Type', 'text/csv; charset=UTF-8');
      res.setHeader('Content-Disposition', `attachment; filename="relatorio-acessos-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvContent);
    } else {
      // Exportar PDF
      const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="relatorio-acessos-${new Date().toISOString().split('T')[0]}.pdf"`);
      
      doc.pipe(res);

      // Cabeçalho
      doc.fontSize(20).text('Relatório de Acessos', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Período: ${period === '24h' ? 'Últimas 24 horas' : period === '7d' ? 'Últimos 7 dias' : 'Últimos 30 dias'}`, { align: 'right' });
      doc.moveDown();

      // Estatísticas
      if (Array.isArray(stats) && stats.length > 0) {
        const s = stats[0];
        doc.fontSize(14).text('Estatísticas Gerais', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).text(`Total de Requisições: ${s.total_requests}`);
        doc.text(`Tempo Médio: ${Math.round(s.avg_duration)}ms`);
        doc.text(`Usuários Únicos: ${s.unique_users}`);
        doc.text(`IPs Únicos: ${s.unique_ips}`);
        doc.moveDown(2);
      }

      // Tabela de páginas
      doc.fontSize(14).text('Páginas Mais Acessadas', { underline: true });
      doc.moveDown(1);

      if (Array.isArray(pages) && pages.length > 0) {
        // Cabeçalhos da tabela
        const tableTop = doc.y;
        const tableLeft = 50;
        
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Página', tableLeft, tableTop);
        doc.text('Visualizações', tableLeft + 250, tableTop);
        doc.text('Tempo Médio', tableLeft + 350, tableTop);
        doc.text('Usuários', tableLeft + 450, tableTop);
        
        // Linha separadora
        doc.moveTo(tableLeft, tableTop + 15)
           .lineTo(tableLeft + 500, tableTop + 15)
           .stroke();
        
        // Dados
        let currentY = tableTop + 30;
        pages.forEach((page, idx) => {
          if (currentY > 450) {
            doc.addPage();
            currentY = 50;
          }
          
          doc.font('Helvetica');
          doc.text(page.path, tableLeft, currentY, { width: 240 });
          doc.text(page.views.toString(), tableLeft + 250, currentY);
          doc.text(`${Math.round(page.avg_duration)}ms`, tableLeft + 350, currentY);
          doc.text(page.unique_users.toString(), tableLeft + 450, currentY);
          
          currentY += 20;
          
          // Linha separadora a cada 2 registros
          if (idx % 2 === 0) {
            doc.moveTo(tableLeft, currentY - 10)
               .lineTo(tableLeft + 500, currentY - 10)
               .stroke({ color: '#EEEEEE' });
          }
        });
      } else {
        doc.fontSize(11).text('Nenhum dado disponível', { align: 'center' });
      }

      doc.end();
    }
  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/reports/status-distribution
 * Distribuição de status HTTP para gráfico de pizza
 */
router.get('/reports/status-distribution', isAdmin, async (req, res) => {
  const pool = getPool();
  const { period = '24h', path, user_id, status, method } = req.query;
  let interval = '24 HOUR';
  
  if (period === '7d') interval = '7 DAY';
  else if (period === '30d') interval = '30 DAY';

  // Construir WHERE clause com filtros
  const whereClauses = [`created_at >= DATE_SUB(NOW(), INTERVAL ${interval})`];
  const params = [];

  if (path) {
    whereClauses.push('path LIKE ?');
    params.push(`%${path}%`);
  }
  if (user_id) {
    whereClauses.push('user_id = ?');
    params.push(parseInt(user_id));
  }
  if (status) {
    whereClauses.push('status = ?');
    params.push(parseInt(status));
  }
  if (method) {
    whereClauses.push('method = ?');
    params.push(method);
  }

  const whereClause = whereClauses.length > 1 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  try {
    const [statusDist] = await pool.query(`
      SELECT
        status,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM access_logs ${whereClause}), 2) as percentage
      FROM access_logs
      ${whereClause}
      GROUP BY status
      ORDER BY count DESC
    `, [...params, ...params]);

    res.json({
      success: true,
      data: Array.isArray(statusDist) ? statusDist : [],
    });
  } catch (error) {
    console.error('Error fetching status distribution:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/reports/error-details
 * Detalhes de erros 4xx/5xx para debugging
 */
router.get('/reports/error-details', isAdmin, async (req, res) => {
  const pool = getPool();
  const { period = '24h', path, user_id, method } = req.query;
  let interval = '24 HOUR';
  
  if (period === '7d') interval = '7 DAY';
  else if (period === '30d') interval = '30 DAY';

  // Construir WHERE clause com filtros
  const whereClauses = [
    `created_at >= DATE_SUB(NOW(), INTERVAL ${interval})`,
    '(status >= 400)', // Apenas erros 4xx e 5xx
  ];
  const params = [];

  if (path) {
    whereClauses.push('path LIKE ?');
    params.push(`%${path}%`);
  }
  if (user_id) {
    whereClauses.push('user_id = ?');
    params.push(parseInt(user_id));
  }
  if (method) {
    whereClauses.push('method = ?');
    params.push(method);
  }

  const whereClause = `WHERE ${whereClauses.join(' AND ')}`;

  try {
    const [errorDetails] = await pool.query(`
      SELECT
        status,
        path,
        COUNT(*) as count,
        MAX(created_at) as last_occurrence,
        GROUP_CONCAT(DISTINCT method) as methods
      FROM access_logs
      ${whereClause}
      GROUP BY status, path
      HAVING count > 0
      ORDER BY count DESC, last_occurrence DESC
      LIMIT 50
    `, params);

    res.json({
      success: true,
      data: Array.isArray(errorDetails) ? errorDetails : [],
    });
  } catch (error) {
    console.error('Error fetching error details:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
