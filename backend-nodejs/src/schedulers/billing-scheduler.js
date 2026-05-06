/**
 * Scheduler: Cobrança e Inadimplência Automatizada
 * ============================================
 * Roda a cada 1 hora para verificar e executar ações de cobrança
 * 
 * Política "Firme mas Justa":
 * - Dia 0  → Email de vencimento
 * - Dia 3  → WhatsApp amigável
 * - Dia 7  → Ligação humana (registro no dashboard)
 * - Dia 14 → Email "Atenção" + notificação dashboard
 * - Dia 21 → Suspensão PARCIAL (funcionalidades)
 * - Dia 30 → Ligação formal + email
 * - Dia 31 → Suspensão TOTAL (acesso bloqueado)
 * - Dia 45 → Email "Última chance"
 * - Dia 60 → Notificação cancelamento (30 dias)
 * - Dia 90 → Cancelamento + backup
 */

import { getPool } from '../config/database.js';
import nodemailer from 'nodemailer';

// Configurações de email (substituir com seu provedor)
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

// Criar transporter de email
const transporter = nodemailer.createTransport(emailConfig);

/**
 * Enviar email de cobrança
 */
async function sendBillingEmail(church, daysOverdue, emailType) {
  const pool = getPool();

  const emailTemplates = {
    vencimento: {
      subject: `Lembrete: Fatura vencendo hoje - ${church.name}`,
      body: `Olá, ${church.name}!
      
Esta é apenas uma lembrança amigável de que sua fatura mensal do Jesus Vitória Connect vence hoje.

Valor: R$ ${church.monthly_amount || '49,90'}
Vencimento: ${new Date().toLocaleDateString('pt-BR')}

Acesse seu dashboard para realizar o pagamento:
https://plataforma.minhaigreja.com.br/admin/faturas

Qualquer dúvida, estamos à disposição!

Equipe Jesus Vitória Connect`,
    },
    amigavel: {
      subject: `Fatura em aberto - ${church.name}`,
      body: `Olá, ${church.name}!

Notamos que sua fatura ainda está em aberto.

Dias de atraso: ${daysOverdue}
Valor: R$ ${church.monthly_amount || '49,90'}

Sabemos que imprevistos acontecem! Se houver alguma dificuldade, nos avise para que possamos ajudar.

Regularize aqui: https://plataforma.minhaigreja.com.br/admin/faturas

Equipe Jesus Vitória Connect`,
    },
    atencao: {
      subject: `⚠️ ATENÇÃO: Fatura vencida há ${daysOverdue} dias - ${church.name}`,
      body: `Prezados da ${church.name},

Sua fatura está vencida há ${daysOverdue} dias.

⚠️ IMPORTANTE:
- Seu acesso continua ativo
- Mas é importante regularizar o quanto antes
- Após 21 dias, funcionalidades serão suspensas
- Após 31 dias, o acesso será totalmente bloqueado

Valor: R$ ${church.monthly_amount || '49,90'}

Regularize agora: https://plataforma.minhaigreja.com.br/admin/faturas

Precisa de ajuda? Responda este email.

Equipe Jesus Vitória Connect`,
    },
    ultima_chance: {
      subject: `🔴 ÚLTIMA CHANCE: Regularize sua conta - ${church.name}`,
      body: `Prezados da ${church.name},

Esta é sua ÚLTIMA CHANCE antes do bloqueio total.

Sua conta está suspensa parcialmente desde ${church.partial_suspension_date ? new Date(church.partial_suspension_date).toLocaleDateString('pt-BR') : 'dias atrás'}.

⚠️ AVISO FINAL:
- Em ${90 - daysOverdue} dias seu cadastro será CANCELADO
- Todos os dados serão apagados (conforme LGPD)
- Você receberá apenas um backup

Valor pendente: R$ ${church.monthly_amount || '49,90'}

Regularize AGORA: https://plataforma.minhaigreja.com.br/admin/faturas

Última oportunidade de falar conosco antes do cancelamento.

Equipe Jesus Vitória Connect`,
    },
    cancelamento_aviso: {
      subject: `🚨 NOTIFICAÇÃO DE CANCELAMENTO - 30 dias - ${church.name}`,
      body: `Prezados da ${church.name},

NOTIFICAÇÃO FORMAL DE CANCELAMENTO

Seu cadastro no Jesus Vitória Connect será CANCELADO em 30 dias.

📅 DATA DO CANCELAMENTO: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}

O que acontecerá:
✗ Acesso ao sistema será bloqueado permanentemente
✗ Site público será desativado
✗ Todos os dados serão apagados (conforme LGPD)
✓ Você receberá um backup completo dos seus dados

Para evitar o cancelamento, regularize IMEDIATAMENTE:
https://plataforma.minhaigreja.com.br/admin/faturas

Valor pendente: R$ ${church.monthly_amount || '49,90'}

Esta é uma notificação formal. Após o cancelamento, não será possível recuperar os dados.

Equipe Jesus Vitória Connect`,
    },
  };

  const template = emailTemplates[emailType];

  if (!template) {
    console.error(`❌ Template de email não encontrado: ${emailType}`);
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'MinhaIgreja <noreply@minhaigreja.com.br>',
      to: church.email,
      subject: template.subject,
      text: template.body,
    });

    // Registrar no log de comunicações
    await pool.execute(`
      INSERT INTO church_communication_log 
      (church_id, communication_type, subject, message, status)
      VALUES (?, 'email', ?, ?, 'sent')
    `, [church.id, template.subject, template.body]);

    console.log(`✅ Email enviado para ${church.name} (${emailType})`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao enviar email para ${church.name}:`, error.message);
    return false;
  }
}

/**
 * Enviar WhatsApp de cobrança (integração com API de WhatsApp)
 */
async function sendBillingWhatsApp(church, daysOverdue) {
  const pool = getPool();

  // TODO: Implementar integração com API de WhatsApp (Twilio, Z-API, etc.)
  // Por enquanto, apenas registra no log

  const message = `Olá, ${church.name}! 👋

Vimos lembrar que sua fatura do Jesus Vitória Connect está em aberto.

Dias de atraso: ${daysOverdue}
Valor: R$ ${church.monthly_amount || '49,90'}

Regularize aqui: https://plataforma.minhaigreja.com.br/admin/faturas

Qualquer dúvida, estamos à disposição! 🙏`;

  try {
    await pool.execute(`
      INSERT INTO church_communication_log 
      (church_id, communication_type, subject, message, status)
      VALUES (?, 'whatsapp', 'Lembrete de pagamento', ?, 'sent')
    `, [church.id, message]);

    console.log(`📱 WhatsApp registrado para ${church.name}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao registrar WhatsApp para ${church.name}:`, error.message);
    return false;
  }
}

/**
 * Aplicar suspensão parcial
 */
async function applyPartialSuspension(church) {
  const pool = getPool();

  try {
    await pool.execute(`
      UPDATE churches 
    SET 
      billing_status = 'partial_suspended',
      partial_suspension_date = NOW()
      WHERE id = ?
    `, [church.id]);

    // Registrar no histórico
    await pool.execute(`
      INSERT INTO church_billing_history 
      (church_id, action_type, status, days_overdue, notes)
      VALUES (?, 'partial_suspension', 'completed', ?, 'Suspensão parcial aplicada automaticamente')
    `, [church.id, church.days_overdue]);

    // Registrar no log
    await pool.execute(`
      INSERT INTO church_communication_log 
      (church_id, communication_type, subject, message, status)
      VALUES (?, 'dashboard_notification', 'Suspensão Parcial', 'Funcionalidades não-essenciais suspensas', 'sent')
    `, [church.id]);

    console.log(`⚠️ Suspensão parcial aplicada para ${church.name}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao aplicar suspensão parcial em ${church.name}:`, error.message);
    return false;
  }
}

/**
 * Aplicar suspensão total
 */
async function applyTotalSuspension(church) {
  const pool = getPool();

  try {
    await pool.execute(`
      UPDATE churches 
      SET 
        billing_status = 'total_suspended',
        total_suspension_date = NOW(),
        is_active = 0
      WHERE id = ?
    `, [church.id]);

    // Registrar no histórico
    await pool.execute(`
      INSERT INTO church_billing_history 
      (church_id, action_type, status, days_overdue, notes)
      VALUES (?, 'total_suspension', 'completed', ?, 'Suspensão total aplicada automaticamente')
    `, [church.id, church.days_overdue]);

    console.log(`🔒 Suspensão total aplicada para ${church.name}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao aplicar suspensão total em ${church.name}:`, error.message);
    return false;
  }
}

/**
 * Aplicar cancelamento
 */
async function applyCancellation(church) {
  const pool = getPool();

  try {
    // TODO: Gerar backup dos dados da igreja
    // TODO: Enviar backup por email

    await pool.execute(`
      UPDATE churches 
      SET 
        billing_status = 'cancelled',
        is_active = 0
      WHERE id = ?
    `, [church.id]);

    // Atualizar subscription
    await pool.execute(`
      UPDATE subscriptions 
      SET 
        status = 'cancelled',
        payment_status = 'failed',
        cancelled_at = NOW(),
        cancel_reason = 'Inadimplência (90+ dias)'
      WHERE church_id = ?
    `, [church.id]);

    // Registrar no histórico
    await pool.execute(`
      INSERT INTO church_billing_history 
      (church_id, action_type, status, days_overdue, notes)
      VALUES (?, 'cancelled', 'completed', ?, 'Cancelamento por inadimplência')
    `, [church.id, church.days_overdue]);

    console.log(`🗑️ Cancelamento aplicado para ${church.name}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao cancelar ${church.name}:`, error.message);
    return false;
  }
}

/**
 * Atualizar dias de atraso de todas as igrejas
 */
async function updateDaysOverdue() {
  const pool = getPool();

  try {
    await pool.execute(`
      UPDATE churches c
      JOIN subscriptions s ON c.id = s.church_id
      SET 
        c.days_overdue = GREATEST(0, DATEDIFF(NOW(), s.current_period_end)),
        c.billing_status = CASE
          WHEN s.payment_status = 'paid' THEN 'current'
          WHEN DATEDIFF(NOW(), s.current_period_end) >= 90 THEN 'cancelled'
          WHEN DATEDIFF(NOW(), s.current_period_end) >= 60 THEN 'cancellation_pending'
          WHEN DATEDIFF(NOW(), s.current_period_end) >= 31 THEN 'total_suspended'
          WHEN DATEDIFF(NOW(), s.current_period_end) >= 21 THEN 'partial_suspended'
          WHEN DATEDIFF(NOW(), s.current_period_end) >= 7 THEN 'warning'
          ELSE 'current'
        END
      WHERE c.is_active = 1
    `);

    console.log('✅ Dias de atraso atualizados');
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar dias de atraso:', error.message);
    return false;
  }
}

/**
 * Processar ações de cobrança
 */
async function processBillingActions() {
  const pool = getPool();

  console.log('🔍 Iniciando processamento de cobrança...');

  try {
    // Buscar todas as igrejas inadimplentes
    const [churches] = await pool.query(`
      SELECT 
        c.*,
        s.monthly_amount,
        s.billing_day,
        s.current_period_end,
        s.payment_status,
        c.days_overdue,
        c.billing_status
      FROM churches c
      LEFT JOIN subscriptions s ON c.id = s.church_id
      WHERE c.is_active = 1 
        AND (s.payment_status != 'paid' OR s.payment_status IS NULL)
        AND c.days_overdue > 0
    `);

    console.log(`📊 Encontradas ${churches.length} igrejas inadimplentes`);

    for (const church of churches) {
      const days = church.days_overdue;

      console.log(`\n📋 Processando ${church.name} (${days} dias de atraso)`);

      // Dia 0 - Email de vencimento
      if (days === 0 && !church.notification_sent) {
        await sendBillingEmail(church, days, 'vencimento');
      }

      // Dia 3 - WhatsApp amigável
      if (days === 3) {
        await sendBillingWhatsApp(church, days);
      }

      // Dia 7 - Registro para ligação humana
      if (days === 7) {
        await pool.execute(`
          INSERT INTO church_billing_history 
          (church_id, action_type, status, days_overdue, notes)
          VALUES (?, 'call_made', 'pending', 7, 'Necessário ligar para a igreja')
        `, [church.id]);
        console.log(`📞 Ligação necessária para ${church.name}`);
      }

      // Dia 14 - Email "Atenção"
      if (days === 14) {
        await sendBillingEmail(church, days, 'atencao');
      }

      // Dia 21 - Suspensão Parcial
      if (days === 21 && church.billing_status !== 'partial_suspended') {
        await applyPartialSuspension(church);
        await sendBillingEmail(church, days, 'suspensao_parcial');
      }

      // Dia 30 - Registro para ligação formal
      if (days === 30) {
        await pool.execute(`
          INSERT INTO church_billing_history 
          (church_id, action_type, status, days_overdue, notes)
          VALUES (?, 'call_made', 'pending', 30, 'Ligação formal antes da suspensão total')
        `, [church.id]);
        console.log(`📞 Ligação formal necessária para ${church.name}`);
      }

      // Dia 31 - Suspensão Total
      if (days === 31 && church.billing_status !== 'total_suspended') {
        await applyTotalSuspension(church);
      }

      // Dia 45 - Email "Última chance"
      if (days === 45) {
        await sendBillingEmail(church, days, 'ultima_chance');
      }

      // Dia 60 - Notificação de cancelamento
      if (days === 60 && church.billing_status !== 'cancellation_pending') {
        await sendBillingEmail(church, days, 'cancelamento_aviso');
        await pool.execute(`
          UPDATE churches 
          SET cancellation_notice_date = NOW()
          WHERE id = ?
        `, [church.id]);
      }

      // Dia 90 - Cancelamento
      if (days >= 90 && church.billing_status !== 'cancelled') {
        await applyCancellation(church);
      }
    }

    console.log('✅ Processamento de cobrança concluído');
    return true;
  } catch (error) {
    console.error('❌ Erro ao processar cobrança:', error.message);
    return false;
  }
}

/**
 * Scheduler principal - Roda a cada 1 hora
 */
export function startBillingScheduler() {
  console.log('🕐 Scheduler de cobrança iniciado (roda a cada 1 hora)');

  // Rodar imediatamente ao iniciar
  updateDaysOverdue();
  processBillingActions();

  // Rodar a cada 1 hora
  setInterval(() => {
    updateDaysOverdue();
    processBillingActions();
  }, 60 * 60 * 1000); // 1 hora
}

export default startBillingScheduler;
