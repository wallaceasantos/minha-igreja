/**
 * Mock de Emails para Teste Local
 * ============================================
 * Simula envio de emails em ambiente de desenvolvimento
 * 
 * Em produção, substituir por envio real via nodemailer
 */

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

/**
 * Simula envio de email
 * Em produção, usaria nodemailer ou API de email
 */
export async function sendEmail(data: EmailData): Promise<boolean> {
  console.log('\n📧 EMAIL ENVIADO (MOCK)');
  console.log('┌─────────────────────────────────────────────────┐');
  console.log(`│ Para: ${data.to.padEnd(40)} │`);
  console.log(`│ Assunto: ${data.subject.padEnd(39)} │`);
  console.log('├─────────────────────────────────────────────────┤');
  console.log('│ Conteúdo (HTML):                                │');
  
  // Extrair texto do HTML para log
  const textContent = data.html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 100);
  
  console.log(`│ ${textContent.padEnd(40)}... │`);
  console.log('└─────────────────────────────────────────────────┘\n');

  // Em produção:
  // await transporter.sendMail({ ... });

  return true;
}

/**
 * Email: Domínio Solicitado
 */
export async function sendDomainRequestedEmail(church: any, domain: string) {
  await sendEmail({
    to: church.email,
    subject: `Solicitação de domínio: ${domain}`,
    html: `
      <h1>Solicitação Recebida!</h1>
      <p>Olá, ${church.name}!</p>
      <p>Sua solicitação de domínio próprio <strong>${domain}</strong> foi recebida.</p>
      <p>Nossa equipe vai configurar em breve!</p>
    `,
  });
}

/**
 * Email: Domínio Configurado
 */
export async function sendDomainConfiguredEmail(church: any, domain: string) {
  await sendEmail({
    to: church.email,
    subject: `Domínio configurado: ${domain}`,
    html: `
      <h1>🔧 Domínio Configurado!</h1>
      <p>Olá, ${church.name}!</p>
      <p>Seu domínio <strong>${domain}</strong> foi configurado!</p>
      <p>Agora aguarde a propagação do DNS (2-24 horas).</p>
    `,
  });
}

/**
 * Email: Domínio Ativado
 */
export async function sendDomainActivatedEmail(church: any, domain: string) {
  await sendEmail({
    to: church.email,
    subject: `✅ Domínio ativado: ${domain}`,
    html: `
      <h1>✅ Domínio Ativado!</h1>
      <p>Olá, ${church.name}!</p>
      <p>Seu domínio <strong>${domain}</strong> está ativo!</p>
      <p>Acesse: <a href="https://${domain}">https://${domain}</a></p>
    `,
  });
}

/**
 * Email: Domínio Rejeitado
 */
export async function sendDomainRejectedEmail(church: any, domain: string, reason: string) {
  await sendEmail({
    to: church.email,
    subject: `Solicitação rejeitada: ${domain}`,
    html: `
      <h1>Solicitação Rejeitada</h1>
      <p>Olá, ${church.name}!</p>
      <p>Sua solicitação de domínio <strong>${domain}</strong> foi rejeitada.</p>
      <p><strong>Motivo:</strong> ${reason}</p>
    `,
  });
}

export default {
  sendEmail,
  sendDomainRequestedEmail,
  sendDomainConfiguredEmail,
  sendDomainActivatedEmail,
  sendDomainRejectedEmail,
};
