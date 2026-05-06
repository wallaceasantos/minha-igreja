# 📊 Todas as Tabelas do Banco de Dados - Igreja Connect

## 📋 Resumo das Tabelas

| # | Tabela | Descrição | Registros |
|---|--------|-----------|-----------|
| 1 | `churches` | Igrejas cadastradas | Ilimitado |
| 2 | `subscriptions` | Assinaturas e planos | 1 por igreja |
| 3 | `subscriptions_payments` | Pagamentos de assinaturas | Ilimitado |
| 4 | `usuarios_admin` | Administradores/usuários | Ilimitado |
| 5 | `admin_tokens` | Tokens de autenticação | Ilimitado |
| 6 | `church_members` | Membros das igrejas | Ilimitado |
| 7 | `church_events` | Eventos das igrejas | Ilimitado |
| 8 | `church_service_times` | Horários de culto | Ilimitado |
| 9 | `contact_messages` | Mensagens de contato | Ilimitado |
| 10 | `pedidos` | Pedidos de oração | Ilimitado |
| 11 | `audit_logs` | Logs de auditoria | Ilimitado |
| 12 | `collection_notes` | Notas de cobrança | Ilimitado |
| 13 | `event_attendees` | Participantes de eventos | Ilimitado |
| 14 | `member_ministries` | Ministérios de membros | Ilimitado |
| 15 | `notifications` | Notificações do sistema | Ilimitado |

---

## 📊 Detalhamento das Tabelas

### **1. churches (Igrejas)**
**Descrição:** Armazena todas as igrejas cadastradas na plataforma

**Campos:**
- `id` (INT, PK, AI) - ID da igreja
- `name` (VARCHAR 255) - Nome da igreja
- `slug` (VARCHAR 100, UNIQUE) - Subdomínio (ex: igreja-central)
- `description` (TEXT) - Descrição da igreja
- `logo_url` (VARCHAR 500) - URL da logo
- `favicon_url` (VARCHAR 500) - URL do favicon
- `hero_image_url` (VARCHAR 500) - URL da imagem de destaque
- `address_street` (VARCHAR 255) - Rua
- `address_number` (VARCHAR 20) - Número
- `address_complement` (VARCHAR 50) - Complemento
- `address_neighborhood` (VARCHAR 100) - Bairro
- `address_city` (VARCHAR 100) - Cidade
- `address_state` (CHAR 2) - Estado (UF)
- `address_zip` (VARCHAR 9) - CEP
- `phone` (VARCHAR 20) - Telefone
- `whatsapp` (VARCHAR 20) - WhatsApp
- `email` (VARCHAR 255) - Email
- `facebook_url` (VARCHAR 500) - Facebook
- `instagram_url` (VARCHAR 500) - Instagram
- `youtube_url` (VARCHAR 500) - YouTube
- `youtube_channel_id` (VARCHAR 100) - YouTube Channel ID
- `theme_primary_color` (VARCHAR 7) - Cor primária (#1e40af)
- `theme_secondary_color` (VARCHAR 7) - Cor secundária (#f59e0b)
- `plan_type` (ENUM) - Plano (free, essencial, premium, enterprise)
- `is_active` (BOOLEAN) - Igreja ativa
- `is_verified` (BOOLEAN) - Igreja verificada
- `trial_end_date` (DATETIME) - Fim do trial
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Data de atualização

**Índices:**
- PRIMARY KEY (`id`)
- UNIQUE KEY `slug` (`slug`)
- KEY `idx_churches_active` (`is_active`)
- KEY `idx_churches_plan` (`plan_type`)

---

### **2. subscriptions (Assinaturas)**
**Descrição:** Armazena as assinaturas e planos de cada igreja

**Campos:**
- `id` (INT, PK, AI) - ID da assinatura
- `church_id` (INT, FK) - ID da igreja
- `plan_type` (ENUM) - Plano (free, essencial, premium, enterprise)
- `status` (ENUM) - Status (active, inactive, trial, cancelled, expired)
- `current_period_start` (DATE) - Início do período atual
- `current_period_end` (DATE) - Fim do período atual
- `trial_end_date` (DATETIME) - Fim do trial
- `cancel_at_period_end` (BOOLEAN) - Cancelar no fim do período
- `canceled_at` (DATETIME) - Data do cancelamento
- `cancel_reason` (ENUM) - Motivo do cancelamento
- `seats_used` (INT) - Assentos usados
- `features_used` (JSON) - Features usadas
- `payment_method` (VARCHAR 50) - Método de pagamento
- `last_payment_date` (DATETIME) - Último pagamento
- `next_billing_date` (DATE) - Próxima cobrança
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Data de atualização

**Índices:**
- PRIMARY KEY (`id`)
- KEY `idx_subscriptions_church` (`church_id`)
- KEY `idx_subscriptions_status` (`status`)
- KEY `idx_subscriptions_plan` (`plan_type`)

**Foreign Keys:**
- `church_id` → `churches(id)` ON DELETE CASCADE

---

### **3. subscriptions_payments (Pagamentos)**
**Descrição:** Armazena todos os pagamentos de assinaturas

**Campos:**
- `id` (INT, PK, AI) - ID do pagamento
- `subscription_id` (INT, FK) - ID da assinatura
- `church_id` (INT, FK) - ID da igreja
- `amount` (DECIMAL 10,2) - Valor
- `status` (ENUM) - Status (pending, paid, overdue, cancelled, refunded)
- `due_date` (DATE) - Data de vencimento
- `paid_date` (DATE) - Data do pagamento
- `payment_method` (ENUM) - Método (credit_card, pix, boleto, bank_transfer)
- `transaction_id` (VARCHAR 100) - ID da transação
- `notes` (TEXT) - Observações
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Data de atualização

**Índices:**
- PRIMARY KEY (`id`)
- KEY `idx_payment_subscription` (`subscription_id`)
- KEY `idx_payment_church` (`church_id`)
- KEY `idx_payment_status` (`status`)
- KEY `idx_payment_due_date` (`due_date`)

**Foreign Keys:**
- `subscription_id` → `subscriptions(id)` ON DELETE CASCADE
- `church_id` → `churches(id)` ON DELETE CASCADE

---

### **4. usuarios_admin (Administradores)**
**Descrição:** Armazena todos os usuários administradores

**Campos:**
- `id` (INT, PK, AI) - ID do usuário
- `church_id` (INT, FK) - ID da igreja
- `name` (VARCHAR 255) - Nome
- `email` (VARCHAR 255, UNIQUE) - Email
- `password` (VARCHAR 255) - Senha (hash)
- `role` (ENUM) - Role (super_admin, admin, pastor, secretary, leader)
- `is_active` (BOOLEAN) - Usuário ativo
- `last_login_at` (TIMESTAMP) - Último login
- `last_login_ip` (VARCHAR 45) - IP do último login
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Data de atualização

**Índices:**
- PRIMARY KEY (`id`)
- UNIQUE KEY `email` (`email`)
- KEY `idx_users_church` (`church_id`)
- KEY `idx_users_role` (`role`)
- KEY `idx_users_active` (`is_active`)

**Foreign Keys:**
- `church_id` → `churches(id)` ON DELETE SET NULL

---

### **5. admin_tokens (Tokens)**
**Descrição:** Armazena tokens de autenticação

**Campos:**
- `id` (INT, PK, AI) - ID do token
- `user_id` (INT, FK) - ID do usuário
- `church_id` (INT, FK) - ID da igreja
- `token` (VARCHAR 500) - Token
- `expires_at` (DATETIME) - Expiração
- `used` (BOOLEAN) - Token usado
- `created_at` (TIMESTAMP) - Data de criação

**Índices:**
- PRIMARY KEY (`id`)
- KEY `idx_tokens_user` (`user_id`)
- KEY `idx_church` (`church_id`)

**Foreign Keys:**
- `user_id` → `usuarios_admin(id)` ON DELETE CASCADE
- `church_id` → `churches(id)` ON DELETE SET NULL

---

### **6. church_members (Membros)**
**Descrição:** Armazena os membros de cada igreja

**Campos:**
- `id` (INT, PK, AI) - ID do membro
- `church_id` (INT, FK) - ID da igreja
- `name` (VARCHAR 255) - Nome
- `email` (VARCHAR 255) - Email
- `phone` (VARCHAR 20) - Telefone
- `address` (TEXT) - Endereço
- `birth_date` (DATE) - Data de nascimento
- `baptism_date` (DATE) - Data de batismo
- `is_active` (BOOLEAN) - Membro ativo
- `member_since` (DATE) - Desde quando é membro
- `notes` (TEXT) - Observações
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Data de atualização

**Índices:**
- PRIMARY KEY (`id`)
- KEY `idx_members_church` (`church_id`)
- KEY `idx_members_active` (`is_active`)

**Foreign Keys:**
- `church_id` → `churches(id)` ON DELETE CASCADE

---

### **7. church_events (Eventos)**
**Descrição:** Armazena os eventos de cada igreja

**Campos:**
- `id` (INT, PK, AI) - ID do evento
- `church_id` (INT, FK) - ID da igreja
- `title` (VARCHAR 255) - Título
- `description` (TEXT) - Descrição
- `event_date` (DATETIME) - Data do evento
- `end_date` (DATETIME) - Data de término
- `location` (VARCHAR 255) - Local
- `address` (TEXT) - Endereço
- `is_recurring` (BOOLEAN) - É recorrente
- `recurrence_pattern` (ENUM) - Padrão (daily, weekly, monthly, yearly)
- `is_active` (BOOLEAN) - Evento ativo
- `created_by` (INT) - Criado por
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Data de atualização

**Índices:**
- PRIMARY KEY (`id`)
- KEY `idx_events_church` (`church_id`)
- KEY `idx_events_date` (`event_date`)
- KEY `idx_events_active` (`is_active`)

**Foreign Keys:**
- `church_id` → `churches(id)` ON DELETE CASCADE

---

### **8. church_service_times (Horários de Culto)**
**Descrição:** Armazena os horários de culto de cada igreja

**Campos:**
- `id` (INT, PK, AI) - ID do horário
- `church_id` (INT, FK) - ID da igreja
- `day_of_week` (ENUM) - Dia (Sunday-Saturday)
- `service_name` (VARCHAR 255) - Nome do culto
- `service_time` (TIME) - Horário
- `description` (TEXT) - Descrição
- `is_active` (BOOLEAN) - Horário ativo
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Data de atualização

**Índices:**
- PRIMARY KEY (`id`)
- KEY `idx_service_church` (`church_id`)

**Foreign Keys:**
- `church_id` → `churches(id)` ON DELETE CASCADE

---

### **9. contact_messages (Mensagens de Contato)**
**Descrição:** Armazena mensagens de contato enviadas

**Campos:**
- `id` (INT, PK, AI) - ID da mensagem
- `church_id` (INT, FK) - ID da igreja
- `name` (VARCHAR 255) - Nome
- `email` (VARCHAR 255) - Email
- `phone` (VARCHAR 20) - Telefone
- `message` (TEXT) - Mensagem
- `status` (ENUM) - Status (new, read, replied, archived)
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Data de atualização

**Índices:**
- PRIMARY KEY (`id`)
- KEY `idx_contact_church` (`church_id`)
- KEY `idx_contact_status` (`status`)

**Foreign Keys:**
- `church_id` → `churches(id)` ON DELETE SET NULL

---

### **10. pedidos (Pedidos de Oração)**
**Descrição:** Armazena pedidos de oração

**Campos:**
- `id` (INT, PK, AI) - ID do pedido
- `church_id` (INT, FK) - ID da igreja
- `titulo` (VARCHAR 255) - Título
- `oracao` (TEXT) - Oração
- `pedido_atendido` (BOOLEAN) - Pedido atendido
- `status` (ENUM) - Status (pending, answered, archived)
- `created_by` (INT) - Criado por
- `answered_by` (INT) - Respondido por
- `answered_at` (TIMESTAMP) - Respondido em
- `answer` (TEXT) - Resposta
- `is_public` (BOOLEAN) - É público
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Data de atualização

**Índices:**
- PRIMARY KEY (`id`)
- KEY `idx_pedidos_church` (`church_id`)
- KEY `idx_pedidos_status` (`status`)

**Foreign Keys:**
- `church_id` → `churches(id)` ON DELETE SET NULL

---

### **11. audit_logs (Logs de Auditoria)**
**Descrição:** Armazena logs de todas as ações no sistema

**Campos:**
- `id` (INT, PK, AI) - ID do log
- `church_id` (INT, FK) - ID da igreja
- `user_id` (INT) - ID do usuário
- `action` (VARCHAR 100) - Ação
- `details` (TEXT) - Detalhes
- `ip_address` (VARCHAR 45) - Endereço IP
- `user_agent` (VARCHAR 255) - User agent
- `created_at` (TIMESTAMP) - Data de criação

**Índices:**
- PRIMARY KEY (`id`)
- KEY `idx_audit_church` (`church_id`)
- KEY `idx_audit_user` (`user_id`)
- KEY `idx_audit_action` (`action`)
- KEY `idx_audit_created` (`created_at`)

**Foreign Keys:**
- `church_id` → `churches(id)` ON DELETE SET NULL

---

### **12. collection_notes (Notas de Cobrança)**
**Descrição:** Armazena notas de cobrança de inadimplentes

**Campos:**
- `id` (INT, PK, AI) - ID da nota
- `church_id` (INT, FK) - ID da igreja
- `subscription_id` (INT, FK) - ID da assinatura
- `user_id` (INT) - ID do usuário
- `note_type` (ENUM) - Tipo (email, call, message, suspension_warning, cancellation_warning)
- `note` (TEXT) - Nota
- `follow_up_date` (DATE) - Data de acompanhamento
- `created_at` (TIMESTAMP) - Data de criação

**Índices:**
- PRIMARY KEY (`id`)
- KEY `idx_collection_church` (`church_id`)
- KEY `idx_collection_subscription` (`subscription_id`)

**Foreign Keys:**
- `church_id` → `churches(id)` ON DELETE CASCADE
- `subscription_id` → `subscriptions(id)` ON DELETE CASCADE

---

### **13. event_attendees (Participantes de Eventos)**
**Descrição:** Armazena participantes de eventos

**Campos:**
- `id` (INT, PK, AI) - ID do participante
- `event_id` (INT, FK) - ID do evento
- `member_id` (INT, FK) - ID do membro
- `name` (VARCHAR 255) - Nome
- `email` (VARCHAR 255) - Email
- `phone` (VARCHAR 20) - Telefone
- `status` (ENUM) - Status (registered, confirmed, present, absent)
- `registered_at` (TIMESTAMP) - Registrado em
- `confirmed_at` (TIMESTAMP) - Confirmado em

**Índices:**
- PRIMARY KEY (`id`)
- KEY `idx_attendees_event` (`event_id`)
- KEY `idx_attendees_member` (`member_id`)

**Foreign Keys:**
- `event_id` → `church_events(id)` ON DELETE CASCADE
- `member_id` → `church_members(id)` ON DELETE SET NULL

---

### **14. member_ministries (Ministérios de Membros)**
**Descrição:** Armazena ministérios dos membros

**Campos:**
- `id` (INT, PK, AI) - ID do ministério
- `member_id` (INT, FK) - ID do membro
- `ministry_name` (VARCHAR 255) - Nome do ministério
- `role` (VARCHAR 255) - Cargo/função
- `started_at` (DATE) - Iniciado em
- `is_active` (BOOLEAN) - É ativo
- `notes` (TEXT) - Observações
- `created_at` (TIMESTAMP) - Data de criação

**Índices:**
- PRIMARY KEY (`id`)
- KEY `idx_ministry_member` (`member_id`)

**Foreign Keys:**
- `member_id` → `church_members(id)` ON DELETE CASCADE

---

### **15. notifications (Notificações)**
**Descrição:** Armazena notificações do sistema

**Campos:**
- `id` (INT, PK, AI) - ID da notificação
- `church_id` (INT, FK) - ID da igreja
- `user_id` (INT) - ID do usuário
- `title` (VARCHAR 255) - Título
- `message` (TEXT) - Mensagem
- `type` (ENUM) - Tipo (info, warning, error, success)
- `is_read` (BOOLEAN) - Foi lida
- `read_at` (TIMESTAMP) - Lida em
- `created_at` (TIMESTAMP) - Data de criação

**Índices:**
- PRIMARY KEY (`id`)
- KEY `idx_notifications_church` (`church_id`)
- KEY `idx_notifications_user` (`user_id`)
- KEY `idx_notifications_read` (`is_read`)

**Foreign Keys:**
- `church_id` → `churches(id)` ON DELETE CASCADE

---

## 📊 Relacionamentos entre Tabelas

```
churches (1) ── (N) subscriptions
churches (1) ── (N) subscriptions_payments
churches (1) ── (N) usuarios_admin
churches (1) ── (N) church_members
churches (1) ── (N) church_events
churches (1) ── (N) church_service_times
churches (1) ── (N) contact_messages
churches (1) ── (N) pedidos
churches (1) ── (N) audit_logs
churches (1) ── (N) collection_notes
churches (1) ── (N) notifications

subscriptions (1) ── (N) subscriptions_payments
subscriptions (1) ── (N) collection_notes

usuarios_admin (1) ── (N) admin_tokens
usuarios_admin (1) ── (N) audit_logs

church_members (1) ── (N) event_attendees
church_members (1) ── (N) member_ministries

church_events (1) ── (N) event_attendees
```

---

## 🚀 Como Usar

### **Criar Banco de Dados:**
```bash
mysql -u root -p < database/create_all_tables.sql
```

### **Verificar Tabelas:**
```sql
USE igreja_connect;
SHOW TABLES;
```

### **Verificar Estrutura:**
```sql
DESCRIBE churches;
DESCRIBE subscriptions;
-- etc...
```

---

## 📝 Dados Iniciais (Seed)

O script já inclui:
- ✅ 1 Super Admin (admin@igreja-connect.com / admin123)
- ✅ 3 Igrejas de exemplo
- ✅ 3 Assinaturas de exemplo

---

## ✅ Total de Tabelas: **15**

Todas as tabelas necessárias para o sistema **Igreja Connect** estão documentadas e prontas para uso!

**Script completo:** `database/create_all_tables.sql`

**Documentação completa:** `database/DATABASE_DOCUMENTATION.md`

---

**Todas as tabelas estão criadas e documentadas!** 📊✨
