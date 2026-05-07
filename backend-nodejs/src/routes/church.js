/**
 * Rotas: Church (Igreja)
 * Backend Node.js simplificado
 */

import express from 'express';
import { getPool } from '../config/database.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// GET /api/church - Listar todas
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [churches] = await pool.query('SELECT * FROM churches WHERE is_active = 1 ORDER BY name');
    res.json({ success: true, data: churches });
  } catch (error) {
    console.error('Error listing churches:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/church/:id - Buscar por ID
router.get('/:id', async (req, res) => {
  try {
    const churchId = req.params.id;
    console.log(`Buscando igreja por ID: ${churchId}`);

    const pool = getPool();
    const [churches] = await pool.query(
      'SELECT * FROM churches WHERE id = ? LIMIT 1',
      [churchId]
    );

    console.log('Resultado:', churches);

    if (churches.length === 0) {
      return res.status(404).json({ success: false, error: 'Church not found' });
    }

    res.json({ success: true, data: churches[0] });
  } catch (error) {
    console.error('Error fetching church:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/church/:id/stats - Buscar estatísticas (DEPOIS DO SLUG!)
router.get('/:id/stats', async (req, res) => {
  try {
    const churchId = req.params.id;
    console.log(`Buscando stats da igreja: ${churchId}`);

    const pool = getPool();

    // Buscar contadores em paralelo
    const [members, prayers, events, admins] = await Promise.all([
      // Total de membros
      pool.query(
        'SELECT COUNT(*) as count FROM church_members WHERE church_id = ?',
        [churchId]
      ),

      // Pedidos de oração (últimos 30 dias - rolling)
      pool.query(
        `SELECT COUNT(*) as count FROM pedidos
         WHERE church_id = ?
         AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
        [churchId]
      ),

      // Eventos ativos
      pool.query(
        'SELECT COUNT(*) as count FROM church_events WHERE church_id = ?',
        [churchId]
      ),

      // Total de admins
      pool.query(
        'SELECT COUNT(*) as count FROM usuarios_admin WHERE church_id = ? AND is_active = 1',
        [churchId]
      ),
    ]);

    const stats = {
      members: Array.isArray(members[0]) ? members[0][0].count : 0,
      prayers: Array.isArray(prayers[0]) ? prayers[0][0].count : 0,
      events: Array.isArray(events[0]) ? events[0][0].count : 0,
      admins: Array.isArray(admins[0]) ? admins[0][0].count : 0,
    };

    console.log('Stats encontrados:', stats);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/church/:slug - Buscar por slug (DEVE VIR ANTES DE /:id)
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(`Buscando igreja por slug: ${slug}`);

    const pool = getPool();
    const [churches] = await pool.query(
      'SELECT * FROM churches WHERE slug = ? AND is_active = 1 LIMIT 1',
      [slug]
    );

    console.log('Resultado:', churches);

    if (churches.length === 0) {
      return res.status(404).json({ success: false, error: 'Church not found' });
    }

    const church = churches[0];

    // Buscar trial da tabela subscriptions
    const [subscriptions] = await pool.query(
      'SELECT trial_end_date, is_trial, status FROM subscriptions WHERE church_id = ? LIMIT 1',
      [church.id]
    );

    console.log('Subscriptions found:', subscriptions);
    
    const subscription = subscriptions[0];
    if (subscription) {
      church.trial_end_date = subscription.trial_end_date;
      church.is_trial = subscription.is_trial;
      church.subscription_status = subscription.status;
      console.log('Subscription data:', { trial_end_date: subscription.trial_end_date, is_trial: subscription.is_trial, status: subscription.status });
    } else {
      console.log('No subscription found for church:', church.id);
    }

    res.json({ success: true, data: church });
  } catch (error) {
    console.error('Error fetching church:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/church/check-slug/:slug - Verificar disponibilidade de slug
router.get('/check-slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(`Verificando slug: ${slug}`);

    const pool = getPool();
    const [churches] = await pool.query(
      'SELECT id FROM churches WHERE slug = ? LIMIT 1',
      [slug]
    );

    const isAvailable = churches.length === 0;
    console.log('Slug disponível:', isAvailable);

    res.json({ 
      success: true, 
      available: isAvailable,
      slug: slug
    });
  } catch (error) {
    console.error('Error checking slug:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/church - Criar igreja
router.post('/', async (req, res) => {
  const pool = getPool();
  let connection;

  try {
    console.log('=== [CREATE CHURCH] Recebendo request ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));

    const {
      name, slug, description, email, phone, whatsapp,
      address, facebook_url, instagram_url, youtube_url,
      plan_type, admin
    } = req.body;

    console.log('Dados extraídos:', { 
      name, 
      slug, 
      email, 
      plan_type,
      admin: admin ? { name: admin.name, email: admin.email } : 'UNDEFINED'
    });

    // Validações básicas
    const errors = [];

    if (!name || name.length < 5) {
      errors.push('Nome da igreja deve ter pelo menos 5 caracteres');
    }

    if (!slug || slug.length < 3) {
      errors.push('Subdomínio deve ter pelo menos 3 caracteres');
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      errors.push('Subdomínio deve conter apenas letras minúsculas, números e hífens');
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      errors.push('Email válido é obrigatório');
    }

    if (!admin?.name) {
      errors.push('Nome do administrador é obrigatório');
      console.error('[CREATE CHURCH] admin.name está faltando!');
    }

    if (!admin?.email || !/^\S+@\S+\.\S+$/.test(admin.email)) {
      errors.push('Email do administrador é obrigatório');
      console.error('[CREATE CHURCH] admin.email está faltando ou é inválido!');
    }

    if (!admin?.password || admin.password.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
    }

    if (admin.password !== admin.confirmPassword) {
      errors.push('Senhas não conferem');
    }

    console.log('Erros de validação:', errors);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Erro de validação',
        details: errors
      });
    }

    // Verificar duplicidades ANTES de criar
    if (errors.length === 0) {
      // Verificar slug duplicado
      const [existingSlug] = await pool.query(
        'SELECT id FROM churches WHERE slug = ? LIMIT 1',
        [slug]
      );

      if (existingSlug.length > 0) {
        errors.push('Este subdomínio já está em uso. Escolha outro.');
      }

      // Verificar email da igreja duplicado
      const [existingChurchEmail] = await pool.query(
        'SELECT id FROM churches WHERE email = ? LIMIT 1',
        [email]
      );

      if (existingChurchEmail.length > 0) {
        errors.push('Esta igreja já está cadastrada com este email.');
      }

      // Verificar email do administrador duplicado
      const [existingAdminEmail] = await pool.query(
        'SELECT id FROM usuarios_admin WHERE email = ? LIMIT 1',
        [admin.email]
      );

      if (existingAdminEmail.length > 0) {
        errors.push('Este email de administrador já está cadastrado. Use outro email ou faça login.');
      }

      // CNPJ removido - coluna não existe na tabela
      // if (req.body.cnpj) {
      //   const [existingCNPJ] = await pool.query(
      //     'SELECT id FROM churches WHERE cnpj = ? LIMIT 1',
      //     [req.body.cnpj]
      //   );
      //   if (existingCNPJ.length > 0) {
      //     errors.push('Este CNPJ já está cadastrado.');
      //   }
      // }
    }

    if (errors.length > 0) {
      console.error('[CREATE CHURCH] Erros de validação:', errors);
      return res.status(400).json({
        success: false,
        error: 'Erros de validação',
        errors: errors
      });
    }

    console.log('[CREATE CHURCH] Validação OK, iniciando transação...');

    // Obter conexão para transação
    connection = await pool.getConnection();
    console.log('[CREATE CHURCH] Conexão obtida:', connection ? 'OK' : 'FAIL');
    
    try {
      await connection.beginTransaction();
      console.log('[CREATE CHURCH] Transação iniciada');

      // Dados da igreja
      const churchData = {
        name,
        slug,
        description: description || null,
        email,
        phone: phone || null,
        whatsapp: whatsapp || null,
        address_street: address?.street || null,
        address_number: address?.number || null,
        address_complement: address?.complement || null,
        address_neighborhood: address?.neighborhood || null,
        address_city: address?.city || null,
        address_state: address?.state || null,
        address_zip: address?.zip || null,
        facebook_url: facebook_url || null,
        instagram_url: instagram_url || null,
        youtube_url: youtube_url || null,
        plan_type: plan_type || 'free',
        is_active: 1,
        is_verified: 0
      };

      console.log('[CREATE CHURCH] Dados da igreja:', churchData);

      // Inserir igreja
      const [churchResult] = await connection.execute(`
        INSERT INTO churches (
          name, slug, description, email, phone, whatsapp,
          address_street, address_number, address_complement,
          address_neighborhood, address_city, address_state, address_zip,
          facebook_url, instagram_url, youtube_url,
          plan_type, is_active, is_verified, created_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()
        )
      `, [
        churchData.name,
        churchData.slug,
        churchData.description,
        churchData.email,
        churchData.phone,
        churchData.whatsapp,
        churchData.address_street,
        churchData.address_number,
        churchData.address_complement,
        churchData.address_neighborhood,
        churchData.address_city,
        churchData.address_state,
        churchData.address_zip,
        churchData.facebook_url,
        churchData.instagram_url,
        churchData.youtube_url,
        churchData.plan_type,
        churchData.is_active,
        churchData.is_verified
      ]);

      const churchId = churchResult.insertId;
      console.log('✅ Igreja criada com ID:', churchId);

      // Hash da senha
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash(admin.password, 10);

      // Inserir administrador
      await connection.execute(`
        INSERT INTO usuarios_admin (church_id, name, email, password, role, is_active, created_at)
        VALUES (?, ?, ?, ?, 'admin', 1, NOW())
      `, [churchId, admin.name, admin.email, hashedPassword]);

      console.log('✅ Admin criado');

      // Criar subscription
      // Se o plano for 'essencial', cria um Trial de 30 dias.
      // Se o plano for 'free' (ou outro), cria uma assinatura ativa sem trial.
      const isTrial = plan_type === 'essencial';
      const status = isTrial ? 'trial' : 'active';
      // Define a data de fim do trial (30 dias) ou null para plano free
      const trialEndDate = isTrial ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null;
      // Define o fim do período atual (fim do trial ou 1 ano)
      const periodEndDate = isTrial ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      await connection.execute(`
        INSERT INTO subscriptions (church_id, plan_type, status, current_period_start, current_period_end, trial_end_date, created_at)
        VALUES (?, ?, ?, CURDATE(), ?, ?, NOW())
      `, [churchId, plan_type, status, periodEndDate, trialEndDate]);

      console.log('✅ Subscription criada');

      await connection.commit();
      console.log('✅ Transação completada com sucesso!');

      // Enviar Email de Confirmação
      try {
        const smtpHost = process.env.SMTP_HOST;
        const smtpPort = process.env.SMTP_PORT;
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        const smtpFrom = process.env.SMTP_FROM || 'MinhaIgreja <noreply@minhaigreja.app>';

        if (smtpHost && smtpUser && smtpPass) {
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort || 587,
            secure: smtpPort == 465,
            auth: {
              user: smtpUser,
              pass: smtpPass
            }
          });

          const churchUrl = `https://${slug}.plataforma.minhaigreja.com.br`;
          const dashboardUrl = `${churchUrl}/login`;

          const htmlContent = `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333; background-color: #f9fafb; padding: 20px;">
              <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <h1 style="color: #1e40af; text-align: center; font-size: 28px; margin-top: 0;">🎉 Parabéns!</h1>
                <h2 style="text-align: center; color: #111827; font-size: 22px; margin-bottom: 30px;">Sua Igreja Está no Ar!</h2>
                <p style="font-size: 16px; color: #4b5563; text-align: center; margin-bottom: 30px;">
                  A igreja <strong style="color: #1e40af;">${name}</strong> foi criada com sucesso.
                </p>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e40af;">
                  <h3 style="margin-top: 0; color: #1f2937;">Detalhes da Igreja:</h3>
                  <p style="margin: 5px 0;"><strong>Nome:</strong> ${name}</p>
                  <p style="margin: 5px 0;"><strong>Subdomínio:</strong> ${slug}</p>
                  <p style="margin: 5px 0;"><strong>Plano:</strong> Trial (30 dias grátis)</p>
                </div>

                <p style="font-size: 16px;">Seu site está acessível em:</p>
                <p style="text-align: center; margin: 10px 0 30px;">
                  <a href="${churchUrl}" style="color: #1e40af; font-weight: bold; text-decoration: none; font-size: 18px;">${churchUrl}</a>
                </p>

                <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bae6fd;">
                  <h3 style="margin-top: 0; color: #0369a1;">🔐 Credenciais de Acesso:</h3>
                  <p style="margin: 5px 0;"><strong>Email:</strong> ${admin.email}</p>
                  <p style="margin: 5px 0;"><strong>Senha:</strong> •••••••• (a que você cadastrou)</p>
                  <p style="margin: 15px 0 5px; font-style: italic; color: #6b7280; font-size: 14px;">💡 Importante: Anote sua senha! Você vai precisar dela para acessar o dashboard.</p>
                </div>

                <h3 style="color: #1f2937; margin-top: 30px;">🚀 Próximos Passos:</h3>
                <ul style="color: #4b5563; line-height: 1.8;">
                  <li>Fazer login no dashboard</li>
                  <li>Configurar sua igreja (logo, cores, etc.)</li>
                  <li>Adicionar membros</li>
                  <li>Criar primeiros cultos</li>
                </ul>

                <div style="text-align: center; margin-top: 40px;">
                  <a href="${dashboardUrl}" style="background-color: #1e40af; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Ir para Dashboard</a>
                  <div style="margin-top: 15px;">
                    <a href="${churchUrl}" style="color: #1e40af; text-decoration: none; font-weight: bold;">Ver Meu Site →</a>
                  </div>
                </div>

                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 40px 0;">
                <p style="text-align: center; color: #9ca3af; font-size: 12px;">
                  Email enviado por MinhaIgreja - Plataforma Digital para Igrejas.<br>
                  Você pode acessar seu dashboard a qualquer momento em <a href="${dashboardUrl}" style="color: #6b7280;">${dashboardUrl}</a>.
                </p>
              </div>
            </div>
          `;

          await transporter.sendMail({
            from: smtpFrom,
            to: admin.email,
            subject: '🎉 Parabéns! Sua Igreja Está no Ar!',
            html: htmlContent
          });

          console.log(`📧 Email de confirmação enviado para ${admin.email}`);
        } else {
          console.warn('⚠️ Configuração de SMTP ausente. Email não enviado.');
        }
      } catch (emailError) {
        console.error('❌ Erro ao enviar email de confirmação:', emailError);
      }

      res.json({
        success: true,
        message: 'Igreja criada com sucesso!',
        data: {
          church_id: churchId,
          slug: slug,
          name: name,
          email: email,
          url: `https://${slug}.plataforma.minhaigreja.com.br`,
          admin_url: `https://${slug}.plataforma.minhaigreja.com.br/login`,
          trial_days: 30,
          admin: {
            name: admin.name,
            email: admin.email
          }
        }
      });

    } catch (dbError) {
      console.error('[CREATE CHURCH] Erro na transação:', dbError);
      console.error('[CREATE CHURCH] SQL Error:', dbError.message);
      console.error('[CREATE CHURCH] SQL Code:', dbError.code);
      
      if (connection) {
        await connection.rollback();
        console.log('[CREATE CHURCH] Transação revertida (rollback)');
      }
      
      res.status(500).json({
        success: false,
        error: 'Erro ao criar igreja',
        message: dbError.message
      });
    } finally {
      if (connection) {
        connection.release();
        console.log('[CREATE CHURCH] Conexão liberada');
      }
    }
  } catch (error) {
    console.error('[CREATE CHURCH] Erro geral:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
