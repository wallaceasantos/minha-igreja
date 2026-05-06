# 🚀 Deploy - Backend Node.js

## 📋 Opções de Hospedagem Grátis

| Serviço | Grátis | Sleep | Limites |
|---------|--------|-------|---------|
| **Railway** | ✅ US$5/mês | ❌ Não | 500 horas |
| **Vercel** | ✅ | ❌ Não | 100GB/mês |
| **Render** | ✅ | ⚠️ 15min | 750h/mês |
| **Fly.io** | ✅ | ❌ Não | 3 VMs |

---

## 🎯 Opção 1: Railway (Recomendado)

### **Vantagens:**
- ✅ Sem sleep
- ✅ US$5 crédito grátis/mês
- ✅ PostgreSQL incluso
- ✅ Deploy automático

### **Passo-a-Passo:**

1. **Acesse:** https://railway.app/
2. Login com GitHub
3. **New Project** → **Deploy from GitHub**
4. Selecione: `igreja-connect-api`
5. **Variables:**
   ```
   NODE_ENV=production
   PORT=3000
   DB_HOST=seu-host
   DB_USER=seu-user
   DB_PASSWORD=sua-senha
   DB_NAME=igreja_connect
   ```
6. **Deploy!**

**URL:** `https://igreja-connect-api.railway.app`

---

## 🎯 Opção 2: Vercel (Serverless)

### **Vantagens:**
- ✅ Sem sleep
- ✅ 100GB banda/mês
- ✅ Deploy automático
- ✅ CDN global

### **Passo-a-Passo:**

1. **Criar `api/index.js`:**

```javascript
// api/index.js
import app from '../src/server.js';

export default async function handler(req, res) {
  await app(req, res);
}
```

2. **Criar `vercel.json`:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    }
  ]
}
```

3. **Push no GitHub**

4. **Acesse:** https://vercel.com/
5. Importar repositório
6. **Deploy!**

**URL:** `https://igreja-connect-api.vercel.app`

---

## 🎯 Opção 3: Render

### **Vantagens:**
- ✅ Fácil configuração
- ✅ Deploy automático
- ✅ SSL incluso

### **Desvantagens:**
- ⚠️ Sleep após 15min (free)

### **Passo-a-Passo:**

1. **Acesse:** https://render.com/
2. **New +** → **Web Service**
3. Conecte repositório
4. **Build:** `npm install`
5. **Start:** `npm start`
6. **Instance:** Free
7. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3000
   DB_HOST=...
   DB_USER=...
   DB_PASSWORD=...
   DB_NAME=...
   ```
8. **Create Web Service**

**URL:** `https://igreja-connect-api.onrender.com`

---

## 🎯 Opção 4: Fly.io

### **Vantagens:**
- ✅ Sem sleep
- ✅ 3 VMs grátis
- ✅ PostgreSQL incluso

### **Passo-a-Passo:**

1. **Instalar flyctl:**
   ```bash
   npm install -g @flydotio/flyctl
   ```

2. **Login:**
   ```bash
   fly auth login
   ```

3. **Launch:**
   ```bash
   cd backend-nodejs
   fly launch
   ```

4. **Deploy:**
   ```bash
   fly deploy
   ```

**URL:** `https://igreja-connect-api.fly.dev`

---

## 📊 Comparação

| Serviço | Facilidade | Performance | Custo |
|---------|------------|-------------|-------|
| **Railway** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Grátis |
| **Vercel** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Grátis |
| **Render** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Grátis |
| **Fly.io** | ⭐⭐⭐ | ⭐⭐⭐⭐ | Grátis |

---

## ✅ Minha Recomendação

**Para Produção:** Railway ou Vercel
- Sem sleep
- Performance ótima
- Grátis o suficiente

**Para Testes:** Render
- Mais fácil de configurar
- Bom para desenvolvimento

---

## 🔗 Links

- **Railway:** https://railway.app/
- **Vercel:** https://vercel.com/
- **Render:** https://render.com/
- **Fly.io:** https://fly.io/
