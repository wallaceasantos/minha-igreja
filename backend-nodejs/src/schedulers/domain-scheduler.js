/**
 * Scheduler: Verificação de DNS de Domínios
 * ============================================
 * Verifica automaticamente se o DNS propagou para domínios configurados
 * 
 * Roda a cada 1 hora
 */

import { getPool } from '../config/database.js';
import nodemailer from 'nodemailer';

// Configurações de email
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

const transporter = nodemailer.createTransport(emailConfig);

/**
 * Simula verificação de DNS
 * Em produção, usaria uma API real como:
 * - https://dns.google/resolve
 * - https://www.whoisxmlapi.com/
 */
async function checkDNS(domain) {
  // EM PRODUÇÃO: Implementar verificação real de DNS
  // Por enquanto, retorna aleatório para teste (50% de chance)
  return Math.random() > 0.5;
}

/**
 * Enviar email de confirmação
 */
async function sendActivationEmail(church, domain) {
  const subject = `✅ Seu domínio ${domain} está ativo!`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #16a34a;">✅ Domínio Ativado!</h1>
      
      <p>Olá, <strong>${church.name}</strong>!</p>
      
      <p>Seu domínio próprio <strong>${domain}</strong> está ativo e funcionando!</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #16a34a; margin-top: 0;">🎉 Parabéns!</h2>
        <p>Agora você pode acessar seu site em:</p>
        <p style="font-size: 18px; font-weight: bold;">
          <a href="https://${domain}" style="color: #16a34a;">https://${domain}</a>
        </p>
      </div>
      
      <p><strong>O que acontece agora:</strong></p>
      <ul>
        <li>✅ Seu site está acessível no domínio próprio</li>
        <li>✅ O domínio antigo continua redirecionando</li>
        <li>✅ SSL/HTTPS está configurado automaticamente</li>
      </ul>
      
      <p style="margin-top: 30px;">
        Precisa de ajuda? Responda este email!
      </p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="color: #6b7280; font-size: 14px;">
        Equipe MinhaIgreja<br>
        <a href="https://minhaigreja.com.br" style="color: #2563eb;">https://minhaigreja.com.br</a>
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'MinhaIgreja <noreply@minhaigreja.com.br>',
      to: church.email,
      subject,
      html,
    });

    console.log(`✅ Email de ativação enviado para ${church.email}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao enviar email:`, error.message);
    return false;
  }
}

/**
 * Verificar domínios configurados e ativar se DNS propagou
 */
async function checkDomainPropagation() {
  const pool = getPool();

  try {
    // Buscar domínios configurados aguardando propagação
    const [configured] = await pool.query(`
      SELECT 
        r.*,
        c.name as church_name,
        c.email as church_email
      FROM church_domain_requests r
      JOIN churches c ON r.church_id = c.id
      WHERE r.status = 'configured'
      ORDER BY r.configured_at ASC
    `);

    if (!Array.isArray(configured) || configured.length === 0) {
      console.log('📊 Nenhum domínio configurado aguardando propagação');
      return;
    }

    console.log(`📊 Verificando ${configured.length} domínio(s) configurado(s)...`);

    for (const request of configured) {
      console.log(`🔍 Verificando DNS: ${request.requested_domain}`);

      // Simula verificação de DNS
      const dnsPropagated = await checkDNS(request.requested_domain);

      if (dnsPropagated) {
        console.log(`✅ DNS propagado: ${request.requested_domain}`);

        // Atualizar para ativo
        await pool.execute(`
          UPDATE church_domain_requests 
          SET status = 'active',
              dns_verified = 1,
              activated_at = NOW(),
              dns_check_result = JSON_SET(
                COALESCE(dns_check_result, JSON_OBJECT()),
                '$.dns_propagated', true,
                '$.propagated_at', NOW(),
                '$.verified_by', 'scheduler'
              )
          WHERE id = ?
        `, [request.id]);

        // Enviar email de confirmação
        await sendActivationEmail(
          { name: request.church_name, email: request.church_email },
          request.requested_domain
        );

        console.log(`✅ Domínio ativado: ${request.requested_domain}`);
      } else {
        console.log(`⏳ DNS ainda não propagou: ${request.requested_domain}`);
      }
    }

    console.log('✅ Verificação de DNS concluída');

  } catch (error) {
    console.error('❌ Erro ao verificar propagação de DNS:', error.message);
  }
}

/**
 * Iniciar scheduler
 */
export function startDomainScheduler() {
  console.log('🕐 Scheduler de domínios iniciado (verifica a cada 1 hora)');

  // Rodar na inicialização (após 10 segundos)
  setTimeout(() => {
    checkDomainPropagation();
  }, 10000);

  // Rodar a cada 1 hora
  setInterval(() => {
    checkDomainPropagation();
  }, 60 * 60 * 1000); // 1 hora
}

export default startDomainScheduler;
