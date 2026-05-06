# 🔄 Sistema de Migração de Planos com Trial de 30 Dias

## 📋 Visão Geral

Sistema completo para migração do plano **Free** para **Essencial** com **30 dias de teste grátis**.

---

## 🎯 Fluxo do Upgrade

### **1. Solicitação de Upgrade**
```
Pastor → Página de Planos → Clica "Solicitar Upgrade"
       → Sistema ativa trial de 30 dias
       → Pastor recebe email de confirmação
       → Acesso ao plano Essencial liberado
```

### **2. Período de Trial (30 dias)**
```
Dia 0:  Trial ativado ✅
Dia 25: Email de lembrete (5 dias restantes)
Dia 28: Email de lembrete (2 dias restantes)
Dia 29: Email de lembrete (1 dia restante)
Dia 30: Trial encerra → Pagamento ou volta para Free
```

### **3. Fim do Trial**
```
Opção A: Pastor paga → Mantém Essencial
Opção B: Pastor não paga → Volta para Free (dados preservados)
```

---

## 🗄️ Estrutura do Banco de Dados

### **Tabela: subscriptions**
```sql
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS `trial_start_date` DATE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS `trial_end_date` DATE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS `is_trial` TINYINT(1) DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS `upgrade_requested_at` TIMESTAMP NULL;
```

### **Tabela: subscription_trials** (nova)
```sql
CREATE TABLE IF NOT EXISTS `subscription_trials` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `subscription_id` INT NOT NULL,
  `church_id` INT NOT NULL,
  `trial_start_date` DATE NOT NULL,
  `trial_end_date` DATE NOT NULL,
  `status` ENUM('active', 'completed', 'converted', 'expired') DEFAULT 'active',
  `converted_to_paid` TINYINT(1) DEFAULT 0,
  `payment_date` DATE NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_trial_subscription` (`subscription_id`),
  KEY `idx_trial_church` (`church_id`),
  KEY `idx_trial_end_date` (`trial_end_date`),
  CONSTRAINT `fk_trial_subscription` FOREIGN KEY (`subscription_id`) 
    REFERENCES `subscriptions`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_trial_church` FOREIGN KEY (`church_id`) 
    REFERENCES `churches`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### **Tabela: subscription_notifications** (nova)
```sql
CREATE TABLE IF NOT EXISTS `subscription_notifications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `subscription_id` INT NOT NULL,
  `church_id` INT NOT NULL,
  `notification_type` ENUM('trial_started', 'trial_5_days', 'trial_2_days', 'trial_1_day', 'trial_ended') NOT NULL,
  `sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `opened_at` TIMESTAMP NULL,
  `status` ENUM('sent', 'opened', 'failed') DEFAULT 'sent',
  PRIMARY KEY (`id`),
  KEY `idx_notification_subscription` (`subscription_id`),
  CONSTRAINT `fk_notification_subscription` FOREIGN KEY (`subscription_id`) 
    REFERENCES `subscriptions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🔧 Backend - APIs

### **1. POST /api/admin/upgrade/request**
Solicitar upgrade com trial de 30 dias

**Request:**
```json
{
  "church_id": 16
}
```

**Response:**
```json
{
  "success": true,
  "message": "Upgrade solicitado com sucesso! 30 dias grátis ativados.",
  "data": {
    "trial_start_date": "2026-04-18",
    "trial_end_date": "2026-05-18",
    "days_remaining": 30
  }
}
```

### **2. GET /api/admin/upgrade/status**
Verificar status do trial

**Response:**
```json
{
  "success": true,
  "data": {
    "is_trial": true,
    "trial_start_date": "2026-04-18",
    "trial_end_date": "2026-05-18",
    "days_remaining": 25,
    "status": "active"
  }
}
```

### **3. POST /api/admin/upgrade/convert**
Converter trial para pago

**Request:**
```json
{
  "church_id": 16,
  "payment_method": "pix" // pix, boleto, card
}
```

**Response:**
```json
{
  "success": true,
  "message": "Plano Essencial ativado! Bem-vindo!",
  "data": {
    "new_status": "active",
    "next_billing_date": "2026-05-18"
  }
}
```

### **4. POST /api/admin/upgrade/cancel**
Cancelar trial e voltar para Free

**Response:**
```json
{
  "success": true,
  "message": "Trial cancelado. Você voltou para o plano Free.",
  "data": {
    "new_plan": "free",
    "downgrade_date": "2026-04-18"
  }
}
```

---

## 📧 Emails Automáticos

### **1. Email de Boas-vindas (Dia 0)**
```
Assunto: 🎉 Bem-vindo ao plano Essencial! 30 dias grátis!

Olá, [Nome da Igreja]!

Parabéns! Seu upgrade para o plano Essencial foi ativado.

✅ Período de trial: 30 dias grátis
✅ Início: [data]
✅ Fim do trial: [data]

Aproveite todos os recursos:
- 200 membros
- Pedidos de oração ilimitados
- 3 administradores
- Upload de logo
- Domínio próprio
- E muito mais!

Precisa de ajuda? Estamos aqui!

Equipe MinhaIgreja
```

### **2. Lembrete 5 Dias (Dia 25)**
```
Assunto: ⏰ Seu trial Essencial termina em 5 dias!

Olá, [Nome da Igreja]!

Seu período de teste de 30 dias está acabando.

📅 Fim do trial: [data]
⏳ Dias restantes: 5

Para manter todos os recursos, faça a conversão para o plano pago:
💰 Apenas R$ 49,90/mês

[Botão: Manter Plano Essencial]

Dúvidas? Responda este email!

Equipe MinhaIgreja
```

### **3. Lembrete 2 Dias (Dia 28)**
```
Assunto: ⚠️ Últimos 2 dias do seu trial!

Olá, [Nome da Igreja]!

Seu trial está quase acabando!

📅 Fim do trial: [data]
⏳ Dias restantes: 2

Não perca seus recursos! Converta agora:
💰 R$ 49,90/mês

[Botão: Manter Plano Essencial]

Equipe MinhaIgreja
```

### **4. Lembrete 1 Dia (Dia 29)**
```
Assunto: 🚨 Último dia do seu trial!

Olá, [Nome da Igreja]!

Hoje é o último dia do seu período de teste!

📅 Fim do trial: AMANHÃ
⏳ Dias restantes: 1

Converta agora para não perder os recursos:
💰 R$ 49,90/mês

[Botão: Manter Plano Essencial]

Equipe MinhaIgreja
```

### **5. Trial Encerrado (Dia 30)**
```
Assunto: Seu trial Essencial encerrou

Olá, [Nome da Igreja]!

Seu período de teste de 30 dias encerrou.

O que acontece agora:
- Sua igreja voltou para o plano Free
- Seus dados foram preservados
- Você pode fazer upgrade a qualquer momento

Para reativar o plano Essencial:
💰 R$ 49,90/mês

[Botão: Reativar Plano Essencial]

Equipe MinhaIgreja
```

---

## 🤖 Scheduler Automático

### **Arquivo: `backend-nodejs/src/schedulers/trial-scheduler.js`**

```javascript
/**
 * Scheduler: Verificação de Trials
 * ============================================
 * Roda diariamente para verificar trials expirando
 */

import { getPool } from '../config/database.js';
import nodemailer from 'nodemailer';

export function startTrialScheduler() {
  console.log('🕐 Scheduler de trials iniciado (roda diariamente às 9h)');

  // Rodar diariamente às 9h
  setInterval(() => {
    checkExpiringTrials();
    sendTrialNotifications();
  }, 24 * 60 * 60 * 1000); // 24 horas

  // Rodar na inicialização
  checkExpiringTrials();
  sendTrialNotifications();
}

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

    console.log(`📊 Trials expirando: ${expiringToday.length} hoje, ${expiringIn5Days.length} em 5 dias`);

    // Processar expirações
    for (const subscription of expiringToday) {
      await expireTrial(subscription);
    }

  } catch (error) {
    console.error('❌ Erro ao verificar trials:', error);
  }
}

async function sendTrialNotifications() {
  const pool = getPool();

  try {
    // Enviar emails de lembrete
    const [reminders] = await pool.query(`
      SELECT s.*, c.name as church_name, c.email as church_email,
             DATEDIFF(s.trial_end_date, CURDATE()) as days_remaining
      FROM subscriptions s
      JOIN churches c ON s.church_id = c.id
      WHERE s.is_trial = 1
        AND s.status = 'trial'
        AND DATEDIFF(s.trial_end_date, CURDATE()) IN (1, 2, 5)
    `);

    for (const reminder of reminders) {
      await sendTrialEmail(reminder);
    }

  } catch (error) {
    console.error('❌ Erro ao enviar notificações:', error);
  }
}

async function expireTrial(subscription) {
  const pool = getPool();

  try {
    // Voltar para plano Free
    await pool.execute(`
      UPDATE subscriptions
      SET status = 'free',
          is_trial = 0,
          plan_type = 'free'
      WHERE id = ?
    `, [subscription.id]);

    // Registrar notificação
    await pool.execute(`
      INSERT INTO subscription_notifications
      (subscription_id, church_id, notification_type, status)
      VALUES (?, ?, 'trial_ended', 'sent')
    `, [subscription.id, subscription.church_id]);

    // Enviar email
    await sendTrialEndedEmail(subscription);

    console.log(`✅ Trial expirado para ${subscription.church_name}`);

  } catch (error) {
    console.error(`❌ Erro ao expirar trial:`, error);
  }
}

async function sendTrialEmail(subscription) {
  // Implementar envio de email
  console.log(`📧 Email enviado para ${subscription.church_email} (${subscription.days_remaining} dias)`);
}

async function sendTrialEndedEmail(subscription) {
  // Implementar envio de email
  console.log(`📧 Email de trial encerrado enviado para ${subscription.church_email}`);
}
```

---

## 🎨 Frontend - Melhorias

### **1. Página de Planos**
- [ ] Mostrar "30 dias grátis" no plano Essencial
- [ ] Botão "Solicitar Upgrade" → Ativa trial
- [ ] Modal de confirmação antes de ativar

### **2. Dashboard do Pastor**
- [ ] Banner durante trial: "Dia X de 30 do seu trial"
- [ ] Contador regressivo
- [ ] Botão "Converter para Pago" visível

### **3. Página de Conversão**
- [ ] Explicação dos benefícios
- [ ] Escolha de pagamento (PIX, Boleto)
- [ ] Confirmação de upgrade

---

## ✅ Checklist de Implementação

### **Backend:**
- [ ] Criar migration das tabelas
- [ ] Implementar API de upgrade/request
- [ ] Implementar API de upgrade/convert
- [ ] Implementar API de upgrade/cancel
- [ ] Implementar API de upgrade/status
- [ ] Criar scheduler de trials
- [ ] Implementar envio de emails
- [ ] Registrar scheduler no server.js

### **Frontend:**
- [ ] Atualizar página de planos com "30 dias grátis"
- [ ] Adicionar modal de confirmação
- [ ] Criar banner de trial no dashboard
- [ ] Criar contador regressivo
- [ ] Criar página de conversão
- [ ] Adicionar botão "Converter para Pago"

### **Emails:**
- [ ] Template de boas-vindas
- [ ] Template de lembrete 5 dias
- [ ] Template de lembrete 2 dias
- [ ] Template de lembrete 1 dia
- [ ] Template de trial encerrado

---

## 🚀 Próximos Passos

1. **Criar migration** das tabelas
2. **Implementar APIs** de upgrade
3. **Criar scheduler** de trials
4. **Implementar frontend** da conversão
5. **Configurar emails** automáticos
6. **Testar fluxo completo**

---

**Quer que eu implemente alguma parte específica agora?** 🎯
