# 🚀 Deploy Grátis - Node.js API

## Hospedagens Gratuitas para Node.js

### 1. **Render.com** (Recomendado) ⭐
- ✅ Web service grátis (sleep após 15min inativo)
- ✅ PostgreSQL grátis (256MB)
- ✅ Deploy automático do GitHub
- ✅ SSL automático

**Limites:**
- 750 horas/mês (sleep após 15min inatividade)
- 256MB RAM
- 0.1 CPU

### 2. **Railway.app**
- ✅ US$5 de crédito grátis/mês
- ✅ PostgreSQL incluso
- ✅ Deploy automático
- ✅ Sem sleep

**Limites:**
- US$5 crédito (dura ~500 horas)
- 512MB RAM

### 3. **Vercel** (Serverless)
- ✅ Functions serverless grátis
- ✅ 100GB banda/mês
- ✅ Sem sleep
- ✅ Deploy automático

**Limites:**
- 100GB banda/mês
- 300k req/mês
- 10s timeout máximo

### 4. **Fly.io**
- ✅ 3 VMs grátis (256MB cada)
- ✅ 3GB storage
- ✅ Sem sleep

**Limites:**
- 256MB RAM por VM
- Precisa de cartão (não cobra)

---

## 📝 Deploy no Render (Passo-a-Passo)

### 1. Preparar Código

```bash
cd backend-nodejs

# Instalar dependências
npm install

# Testar localmente
npm run dev
```

### 2. Subir para GitHub

```bash
git init
git add .
git commit -m "Initial commit - Node.js API"
git branch -M main
git remote add origin https://github.com/seu-user/igreja-connect-api.git
git push -u origin main
```

### 3. Criar Web Service no Render

1. Acesse: https://render.com/
2. Login com GitHub
3. **New +** → **Web Service**
4. Conecte repositório `igreja-connect-api`
5. Configure:
   - **Name:** igreja-connect-api
   - **Region:** Singapore (mais perto do Brasil grátis)
   - **Branch:** main
   - **Root Directory:** `backend-nodejs`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

6. **Environment Variables:**
   ```
   NODE_ENV=production
   DB_HOST=seu-host-mysql
   DB_USER=seu-user
   DB_PASSWORD=sua-senha
   DB_NAME=igreja_connect
   GMAIL_USER=ccjv1670@gmail.com
   JWT_SECRET=sua-chave-secreta
   ```

7. Clique em **Create Web Service**

### 4. Criar Banco de Dados (Render PostgreSQL)

1. Render Dashboard → **New +** → **PostgreSQL**
2. Configure:
   - **Name:** igreja-connect-db
   - **Region:** Same as web service
   - **Database Size:** Free (256MB)
3. **Create Database**

3. Copie **Internal Database URL**
4. Nas variáveis de ambiente do Web Service, adicione:
   ```
   DATABASE_URL=postgresql://...
   ```

### 5. Migrar Banco

Crie script de migração ou use DBeaver para conectar e importar tabelas.

---

## 📝 Deploy na Railway

### 1. Acesse Railway

1. https://railway.app/
2. Login com GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Selecione `igreja-connect-api`

### 2. Configurar

1. **Variables:**
   ```
   NODE_ENV=production
   DB_HOST=${{MYSQLHOST}}
   DB_USER=${{MYSQLUSER}}
   DB_PASSWORD=${{MYSQLPASSWORD}}
   DB_NAME=${{MYSQLDATABASE}}
   ```

2. **Add Service → MySQL**
   - Railway cria banco automaticamente

3. **Deploy**

---

## 📝 Deploy na Vercel (Serverless)

### 1. Estrutura para Vercel

Crie `api/index.js`:
```javascript
import app from '../src/server.js';
import { createServerAdapter } from '@vercel/node';

export const config = {
  runtime: 'experimental-edge',
};

export default createServerAdapter(app);
```

### 2. Deploy

```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## 🧪 Testar API

```bash
# Health check
curl https://sua-api.onrender.com/

# Criar igreja
curl -X POST https://sua-api.onrender.com/api/church \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Igreja Teste",
    "slug": "igreja-teste",
    "email": "teste@igreja.com",
    "admin": {
      "name": "Admin",
      "email": "admin@igreja.com",
      "password": "123456",
      "confirmPassword": "123456"
    }
  }'
```

---

## 🔧 Atualizar Frontend

No React, atualize a URL da API:

```typescript
// src/services/api.ts
export const API_BASE_URL = 'https://sua-api.onrender.com/api';
// ou
export const API_BASE_URL = 'https://igreja-connect-api.railway.app/api';
```

---

## 💰 Custos Reais

| Serviço | Grátis | Pago (se crescer) |
|---------|--------|------------------|
| Render | ✅ 750h/mês | $7/mês (sem sleep) |
| Railway | ✅ US$5 crédito | $5/mês |
| Vercel | ✅ 100GB/mês | $20/mês (pro) |
| Fly.io | ✅ 3 VMs | $2/mês por VM |

---

## ✅ Checklist Deploy

- [ ] Código no GitHub
- [ ] Conta criada (Render/Railway/Vercel)
- [ ] Web service criado
- [ ] Banco de dados criado
- [ ] Variáveis de ambiente configuradas
- [ ] Migração do banco executada
- [ ] API testada
- [ ] Frontend atualizado com nova URL

---

**URL Final:**
- API: `https://igreja-connect-api.onrender.com`
- Frontend: `https://igreja-connect.netlify.app`

**Custo: R$ 0,00/mês** 🎉
