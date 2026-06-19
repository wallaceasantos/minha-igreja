/**
 * Scheduler: Trial de 60 Dias
 * ============================================
 * Verifica trials expirando e envia notificações automáticas
 * 
 * Roda diariamente às 9h da manhã
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
 * Enviar email
 */
async function sendEmail(to, subject, text, html) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'MinhaIgreja <noreply@minhaigreja.app>',
      to,
      subject,
      text,
      html,
    });
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error.message);
    return false;
  }
}

/**
 * Email de Boas-vindas ao Trial
 */
async function sendTrialWelcomeEmail(church, trialEndDate) {
  const subject = '🎉 Bem-vindo ao plano Essencial! 60 dias grátis!';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #16a34a;">Parabéns! 🎉</h1>
      
      <p>Olá, <strong>${church.name}</strong>!</p>
      
      <p>Seu upgrade para o plano <strong>Essencial</strong> foi ativado com sucesso!</p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #16a34a; margin-top: 0;">✅ Período de Trial Ativado</h2>
        <p><strong>Início:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        <p><strong>Fim do trial:</strong> ${trialEndDate.toLocaleDateString('pt-BR')}</p>
        <p><strong>Dias de trial:</strong> 60 dias grátis</p>
      </div>
      
      <h3>Aproveite todos os recursos:</h3>
      <ul>
        <li>✅ 200 membros (de 50)</li>
        <li>✅ Pedidos de oração ilimitados</li>
        <li>✅ 3 administradores</li>
        <li>✅ Upload de logo</li>
        <li>✅ Domínio próprio</li>
        <li>✅ Suporte prioritário</li>
      </ul>
      
      <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>💰 Após o trial:</strong> Apenas R$ 49,90/mês</p>
        <p style="margin: 5px 0 0 0; font-size: 14px;">Pagamento via PIX ou Boleto</p>
      </div>
      
      <p>Precisa de ajuda? Estamos aqui para você!</p>
      
      <p>Abraços,<br>
      <strong>Equipe MinhaIgreja</strong></p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="font-size: 12px; color: #6b7280;">
        Dúvidas? Responda este email ou entre em contato:<br>
        📧 Email: wallace.a.santos.wa@gmail.com<br>
        📱 WhatsApp: (92) 98421-3885
      </p>
    </div>
  `;
  
  const sent = await sendEmail(church.email, subject, subject, html);
  
  if (sent) {
    console.log(`✅ Email de boas-vindas enviado para ${church.email}`);
  }
  
  return sent;
}

/**
 * Email de Lembrete de Trial
 */
async function sendTrialReminderEmail(church, daysRemaining, trialEndDate) {
  let urgency = '';
  let emoji = '';
  
  if (daysRemaining >= 5) {
    urgency = '⏰';
    emoji = '📅';
  } else if (daysRemaining >= 2) {
    urgency = '⚠️';
    emoji = '🚨';
  } else {
    urgency = '🚨';
    emoji = '⏰';
  }
  
  const subject = `${urgency} Seu trial Essencial termina em ${daysRemaining} dias!`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #f59e0b;">${emoji} Seu trial está acabando!</h1>
      
      <p>Olá, <strong>${church.name}</strong>!</p>
      
      <p>Seu período de teste de 60 dias está quase terminando.</p>
      
      <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #f59e0b;">
        <h2 style="color: #d97706; margin-top: 0;">${emoji} Fim do trial em ${daysRemaining} dias!</h2>
        <p><strong>Data de encerramento:</strong> ${trialEndDate.toLocaleDateString('pt-BR')}</p>
      </div>
      
      <h3>Para manter todos os recursos:</h3>
      <ul>
        <li>✅ 200 membros</li>
        <li>✅ Pedidos ilimitados</li>
        <li>✅ 3 administradores</li>
        <li>✅ E muito mais!</li>
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="#" style="background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          💰 Manter Plano Essencial - R$ 49,90/mês
        </a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        Pagamento via PIX ou Boleto. Cancele quando quiser.
      </p>
      
      <p>Abraços,<br>
      <strong>Equipe MinhaIgreja</strong></p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="font-size: 12px; color: #6b7280;">
        Dúvidas? Responda este email ou entre em contato:<br>
        📧 Email: wallace.a.santos.wa@gmail.com<br>
        📱 WhatsApp: (92) 98421-3885
      </p>
    </div>
  `;
  
  const sent = await sendEmail(church.email, subject, subject, html);
  
  if (sent) {
    console.log(`✅ Email de lembrete enviado para ${church.email} (${daysRemaining} dias)`);
  }
  
  return sent;
}

/**
 * Email de Trial Encerrado
 */
async function sendTrialEndedEmail(church) {
  const subject = 'Seu trial Essencial encerrou';
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #6b7280;">Seu trial encerrou</h1>
      
      <p>Olá, <strong>${church.name}</strong>!</p>
      
      <p>Seu período de teste de 60 dias encerrou.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">O que acontece agora:</h3>
        <ul>
          <li>✅ Sua igreja voltou para o plano <strong>Free</strong></li>
          <li>✅ <strong>Seus dados foram preservados</strong></li>
          <li>✅ Você pode fazer upgrade a qualquer momento</li>
        </ul>
      </div>
      
      <h3>Quer reativar o plano Essencial?</h3>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="#" style="background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          🎉 Reativar Plano Essencial - R$ 49,90/mês
        </a>
      </div>
      
      <p>Abraços,<br>
      <strong>Equipe MinhaIgreja</strong></p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="font-size: 12px; color: #6b7280;">
        Dúvidas? Responda este email ou entre em contato:<br>
        📧 Email: wallace.a.santos.wa@gmail.com<br>
        📱 WhatsApp: (92) 98421-3885
      </p>
    </div>
  `;
  
  const sent = await sendEmail(church.email, subject, subject, html);
  
  if (sent) {
    console.log(`✅ Email de trial encerrado enviado para ${church.email}`);
  }
  
  return sent;
}

/**
 * Verificar trials expirando
 */
async function checkExpiringTrials() {
  const pool = getPool();

  try {
    // Trials que encerram hoje
    const [expiringToday] = await pool.query(`
      SELECT s.*, c.name as church_name, c.email as church_email
      FROM subscriptions s
      JOIN churches c ON s.church_id = c.id
      WHERE s.is_trial = 1
        AND s.trial_end_date = CURDATE()
        AND s.status = 'trial'
    `);

    // Trials que encerram em 5 dias
    const [expiringIn5Days] = await pool.query(`
      SELECT s.*, c.name as church_name, c.email as church_email
      FROM subscriptions s
      JOIN churches c ON s.church_id = c.id
      WHERE s.is_trial = 1
        AND s.trial_end_date = DATE_ADD(CURDATE(), INTERVAL 5 DAY)
        AND s.status = 'trial'
    `);

    // Trials que encerram em 2 dias
    const [expiringIn2Days] = await pool.query(`
      SELECT s.*, c.name as church_name, c.email as church_email
      FROM subscriptions s
      JOIN churches c ON s.church_id = c.id
      WHERE s.is_trial = 1
        AND s.trial_end_date = DATE_ADD(CURDATE(), INTERVAL 2 DAY)
        AND s.status = 'trial'
    `);

    // Trials que encerram em 1 dia
    const [expiringIn1Day] = await pool.query(`
      SELECT s.*, c.name as church_name, c.email as church_email
      FROM subscriptions s
      JOIN churches c ON s.church_id = c.id
      WHERE s.is_trial = 1
        AND s.trial_end_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
        AND s.status = 'trial'
    `);

    console.log(`📊 Trials expirando: ${expiringToday.length} hoje, ${expiringIn5Days.length} em 5 dias, ${expiringIn2Days.length} em 2 dias, ${expiringIn1Day.length} em 1 dia`);

    // Processar expirações
    for (const subscription of expiringToday) {
      await expireTrial(subscription);
    }

    // Enviar lembretes
    for (const subscription of expiringIn5Days) {
      await sendTrialReminderEmail(subscription, 5, new Date(subscription.trial_end_date));
      await registerNotification(subscription.id, subscription.church_id, 'trial_5_days');
    }

    for (const subscription of expiringIn2Days) {
      await sendTrialReminderEmail(subscription, 2, new Date(subscription.trial_end_date));
      await registerNotification(subscription.id, subscription.church_id, 'trial_2_days');
    }

    for (const subscription of expiringIn1Day) {
      await sendTrialReminderEmail(subscription, 1, new Date(subscription.trial_end_date));
      await registerNotification(subscription.id, subscription.church_id, 'trial_1_day');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar trials:', error.message);
  }
}

/**
 * Expirar trial
 */
async function expireTrial(subscription) {
  const pool = getPool();

  try {
    // Voltar para plano Free
    await pool.execute(`
      UPDATE subscriptions
      SET status = 'active',
          is_trial = 0,
          plan_type = 'free',
          trial_start_date = NULL,
          trial_end_date = NULL
      WHERE id = ?
    `, [subscription.id]);

    // Atualizar trial
    await pool.execute(`
      UPDATE subscription_trials
      SET status = 'expired',
          converted_to_paid = 0
      WHERE subscription_id = ?
    `, [subscription.id]);

    // Registrar notificação
    await registerNotification(subscription.id, subscription.church_id, 'trial_ended');

    // Enviar email
    await sendTrialEndedEmail(subscription);

    console.log(`✅ Trial expirado para ${subscription.church_name}`);

  } catch (error) {
    console.error(`❌ Erro ao expirar trial:`, error.message);
  }
}

/**
 * Registrar notificação
 */
async function registerNotification(subscriptionId, churchId, type) {
  const pool = getPool();

  try {
    await pool.execute(`
      INSERT INTO subscription_notifications
      (subscription_id, church_id, notification_type, status)
      VALUES (?, ?, ?, 'sent')
    `, [subscriptionId, churchId, type]);
  } catch (error) {
    console.error(`❌ Erro ao registrar notificação:`, error.message);
  }
}

/**
 * Ativar trial para uma igreja
 */
export async function activateTrial(churchId) {
  const pool = getPool();

  try {
    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 60);

    // Atualizar subscription
    await pool.execute(`
      UPDATE subscriptions
      SET status = 'trial',
          is_trial = 1,
          trial_start_date = ?,
          trial_end_date = ?,
          plan_type = 'essencial',
          upgrade_requested_at = NOW()
      WHERE church_id = ?
    `, [trialStartDate, trialEndDate, churchId]);

    // Criar registro de trial
    const [result] = await pool.execute(`
      INSERT INTO subscription_trials
      (subscription_id, church_id, trial_start_date, trial_end_date, status)
      SELECT id, ?, ?, ?, 'active'
      FROM subscriptions
      WHERE church_id = ?
    `, [churchId, trialStartDate, trialEndDate, churchId]);

    // Buscar dados da igreja
    const [churches] = await pool.query(`
      SELECT id, name, email FROM churches WHERE id = ?
    `, [churchId]);

    if (churches.length > 0) {
      const church = churches[0];
      
      // Enviar email de boas-vindas
      await sendTrialWelcomeEmail(church, trialEndDate);
      
      // Registrar notificação
      const [subs] = await pool.query(`
        SELECT id FROM subscriptions WHERE church_id = ?
      `, [churchId]);
      
      if (subs.length > 0) {
        await registerNotification(subs[0].id, churchId, 'trial_started');
      }
    }

    console.log(`✅ Trial ativado para igreja ${churchId}`);

    return {
      success: true,
      trialStartDate,
      trialEndDate,
      daysRemaining: 60
    };

  } catch (error) {
    console.error(`❌ Erro ao ativar trial:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Converter trial para pago
 */
export async function convertTrialToPaid(churchId) {
  const pool = getPool();

  try {
    // Atualizar subscription
    await pool.execute(`
      UPDATE subscriptions
      SET status = 'active',
          is_trial = 0,
          plan_type = 'essencial'
      WHERE church_id = ?
    `, [churchId]);

    // Atualizar trial
    await pool.execute(`
      UPDATE subscription_trials
      SET status = 'converted',
          converted_to_paid = 1,
          payment_date = CURDATE()
      WHERE subscription_id = (SELECT id FROM subscriptions WHERE church_id = ?)
    `, [churchId]);

    console.log(`✅ Trial convertido para pago - igreja ${churchId}`);

    return {
      success: true,
      message: 'Plano Essencial ativado! Bem-vindo!'
    };

  } catch (error) {
    console.error(`❌ Erro ao converter trial:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Cancelar trial e voltar para Free
 */
export async function cancelTrial(churchId) {
  const pool = getPool();

  try {
    // Atualizar subscription
    await pool.execute(`
      UPDATE subscriptions
      SET status = 'active',
          is_trial = 0,
          plan_type = 'free',
          trial_start_date = NULL,
          trial_end_date = NULL
      WHERE church_id = ?
    `, [churchId]);

    // Atualizar trial
    await pool.execute(`
      UPDATE subscription_trials
      SET status = 'completed',
          converted_to_paid = 0
      WHERE subscription_id = (SELECT id FROM subscriptions WHERE church_id = ?)
    `, [churchId]);

    console.log(`✅ Trial cancelado - igreja ${churchId} voltou para Free`);

    return {
      success: true,
      message: 'Trial cancelado. Você voltou para o plano Free.'
    };

  } catch (error) {
    console.error(`❌ Erro ao cancelar trial:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Iniciar scheduler
 */
export function startTrialScheduler() {
  console.log('🕐 Scheduler de trials iniciado (roda diariamente às 9h)');

  // Rodar diariamente às 9h
  setInterval(() => {
    checkExpiringTrials();
  }, 24 * 60 * 60 * 1000); // 24 horas

  // Rodar na inicialização
  setTimeout(() => {
    checkExpiringTrials();
  }, 5000); // 5 segundos após iniciar
}

export default startTrialScheduler;
