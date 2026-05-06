# 🕐 Scheduler de Comunicados - Igreja Connect

## 📋 Visão Geral

O **Scheduler de Comunicados** é um worker que roda em segundo plano e envia automaticamente os comunicados agendados na data/hora programada.

## 🎯 Funcionamento

### **Verificação Automática**
- ✅ Verifica a cada **1 minuto** se há comunicados agendados
- ✅ Envia automaticamente quando chega a data/hora
- ✅ Atualiza status para `sent` após envio
- ✅ Registra recipients para todas as igrejas alvo

### **Arquivo**
```
backend-nodejs/src/schedulers/announcement-scheduler.js
```

## 🚀 Como Funciona

### **1. Inicialização**

Quando o servidor Node.js inicia:

```javascript
// server.js
app.listen(PORT, () => {
  startScheduler(); // Inicia o scheduler
});
```

### **2. Verificação Periódica**

A cada 1 minuto (60000ms):

```javascript
setInterval(checkAndSendAnnouncements, 60000);
```

### **3. Busca Comunicados Pendentes**

```sql
SELECT id, title, scheduled_at
FROM announcements
WHERE status = 'scheduled'
  AND scheduled_at <= NOW()
ORDER BY scheduled_at ASC
```

### **4. Envia Cada Comunicado**

Para cada comunicado encontrado:
1. Determina igrejas alvo (por plano ou específicas)
2. Insere registros em `announcement_recipients`
3. Atualiza status para `sent`
4. Registra `sent_at`

### **5. Previne Execução Múltipla**

```javascript
let isRunning = false;

async function checkAndSendAnnouncements() {
  if (isRunning) return; // Pula se já está rodando
  isRunning = true;
  // ... processa
  isRunning = false;
}
```

## 📊 Logs no Console

Quando o scheduler está rodando, você verá:

```
[Scheduler] Iniciando scheduler de comunicados (verifica a cada 1 minuto)
[Scheduler] 2 comunicado(s) agendado(s) para enviar
[Scheduler] Enviando comunicado 5...
[Scheduler] Comunicado 5 será enviado para 15 igrejas
[Scheduler] Comunicado 5 enviado com sucesso!
[Scheduler] Todos os comunicados agendados foram processados
```

## 🧪 Como Testar

### **1. Agende um Comunicado**

No frontend:
1. Acesse `/super-admin/announcements`
2. Clique em **"Novo Comunicado"**
3. Preencha título e mensagem
4. **Ative "Agendar Envio"**
5. Selecione uma data/hora **2 minutos no futuro**
6. Clique em **"Criar e Enviar"**

### **2. Aguarde**

- Status inicial: **"scheduled"** (agendado)
- Após 1-2 minutos: Status muda para **"sent"** (enviado)

### **3. Verifique os Logs**

No terminal do backend:
```
[Scheduler] 1 comunicado(s) agendado(s) para enviar
[Scheduler] Enviando comunicado X...
[Scheduler] Comunicado X enviado com sucesso!
```

## ⚙️ Configuração

### **Intervalo de Verificação**

Atual: **1 minuto** (60000 ms)

Para mudar, edite em `announcement-scheduler.js`:

```javascript
// Verificar a cada 30 segundos
schedulerInterval = setInterval(checkAndSendAnnouncements, 30000);

// Verificar a cada 5 minutos
schedulerInterval = setInterval(checkAndSendAnnouncements, 300000);
```

### **Recomendações**

| Ambiente | Intervalo | Uso de Recursos |
|----------|-----------|-----------------|
| Desenvolvimento | 30s | Mais rápido para testes |
| Produção (baixo volume) | 1m | Padrão |
| Produção (alto volume) | 30s | Mais responsivo |

## 📁 Estrutura

```
backend-nodejs/
├── src/
│   ├── schedulers/
│   │   └── announcement-scheduler.js  ✅ Scheduler
│   └── server.js                       ✅ Inicia scheduler
```

## 🔧 Funções Exportadas

### **startScheduler()**
Inicia o scheduler. Chamado automaticamente ao iniciar o servidor.

### **stopScheduler()**
Para o scheduler. Útil para testes ou shutdown gracioso.

### **isSchedulerRunning()**
Retorna `true` se o scheduler está ativo.

### **checkAndSendAnnouncements()**
Executa uma verificação manual. Pode ser chamado via API se necessário.

## 🚨 Tratamento de Erros

O scheduler tem tratamento de erros robusto:

```javascript
try {
  await checkAndSendAnnouncements();
} catch (error) {
  console.error('[Scheduler] Erro:', error);
  // Scheduler continua rodando mesmo com erro
}
```

**Importante:** Se um comunicado falhar, o scheduler **continua** para o próximo e tenta novamente na próxima verificação.

## 📈 Melhorias Futuras

### **1. Email Real**
Atualmente só envia via plataforma. Para emails:

```javascript
// TODO: Implementar com nodemailer
if (announcement.send_method === 'email' || announcement.send_method === 'both') {
  await sendEmails(announcement, churchIds);
}
```

### **2. Retry com Backoff**
```javascript
// Tentar 3 vezes com intervalo exponencial
const maxRetries = 3;
for (let i = 0; i < maxRetries; i++) {
  if (await sendAnnouncement(id)) break;
  await sleep(Math.pow(2, i) * 1000);
}
```

### **3. Webhooks**
Notificar sistemas externos quando comunicado for enviado:

```javascript
await fetch('https://webhook.site/...', {
  method: 'POST',
  body: JSON.stringify({ event: 'announcement_sent', announcement })
});
```

### **4. Dashboard de Status**
Criar endpoint para monitorar scheduler:

```javascript
router.get('/scheduler/status', (req, res) => {
  res.json({
    running: isSchedulerRunning(),
    lastCheck: lastCheckTime,
    totalSent: totalSentCount
  });
});
```

## 🎯 Resumo

| Feature | Status |
|---------|--------|
| Verificação automática | ✅ |
| Envio automático | ✅ |
| Previne execução múltipla | ✅ |
| Logs detalhados | ✅ |
| Tratamento de erros | ✅ |
| Configuração de intervalo | ✅ |
| Email real | ⏳ Pendente |
| Retry com backoff | ⏳ Futuro |
| Webhooks | ⏳ Futuro |

---

**Status**: ✅ **Completo e Funcional**

**Versão**: 1.0.0

**Data**: 31 de março de 2025
