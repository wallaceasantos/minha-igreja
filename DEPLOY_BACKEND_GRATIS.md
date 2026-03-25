# 🚀 Script de Deploy - Backend Grátis

## Opção 1: Node.js

### Deploy Rápido (5 minutos)

```bash
# 1. Instalar dependências
cd backend-nodejs
npm install

# 2. Testar localmente
npm run dev
# Acesse: http://localhost:3000

# 3. Subir para GitHub
git init
git add .
git commit -m "Node.js API - Igreja Connect"
git branch -M main
git remote add origin https://github.com/SEU_USER/igreja-connect-api.git
git push -u origin main

# 4. Deploy no Render
# Acesse: https://render.com
# New + → Web Service
# Conecte repositório
# Build: npm install
# Start: npm start
# Instance: Free
```

### Variáveis de Ambiente (Render):
```
NODE_ENV=production
PORT=3000
DB_HOST=seu-host-mysql
DB_USER=seu-user
DB_PASSWORD=sua-senha
DB_NAME=igreja_connect
GMAIL_USER=ccjv1670@gmail.com
JWT_SECRET=sua-chave-secreta
```

---

## Opção 2: Python

### Deploy Rápido (5 minutos)

```bash
# 1. Instalar dependências
cd backend-python
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# 2. Testar localmente
python main.py
# Acesse: http://localhost:8000

# 3. Subir para GitHub
git init
git add .
git commit -m "Python FastAPI - Igreja Connect"
git branch -M main
git remote add origin https://github.com/SEU_USER/igreja-connect-python.git
git push -u origin main

# 4. Deploy no Render
# Acesse: https://render.com
# New + → Web Service
# Conecte repositório
# Build: pip install -r requirements.txt
# Start: uvicorn main:app --host 0.0.0.0 --port $PORT
# Instance: Free
```

### Variáveis de Ambiente (Render):
```
PYTHONUNBUFFERED=1
PORT=8000
DB_HOST=seu-host-mysql
DB_USER=seu-user
DB_PASSWORD=sua-senha
DB_NAME=igreja_connect
GMAIL_USER=ccjv1670@gmail.com
JWT_SECRET=sua-chave-secreta
```

---

## 📊 URLs Finais

| Serviço | Node.js | Python |
|---------|---------|--------|
| API | `https://igreja-connect-api.onrender.com` | `https://igreja-connect-python.onrender.com` |
| Frontend | `https://igreja-connect.netlify.app` | `https://igreja-connect.netlify.app` |

---

## 🔧 Atualizar Frontend

```typescript
// src/services/api.ts

// Para Node.js:
export const API_BASE_URL = 'https://igreja-connect-api.onrender.com/api';

// Para Python:
export const API_BASE_URL = 'https://igreja-connect-python.onrender.com/api';
```

---

## 🧪 Testes

```bash
# Health check
curl https://sua-api.onrender.com/

# Listar igrejas
curl https://sua-api.onrender.com/api/church

# Criar igreja (Node.js)
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

## ✅ Checklist Final

- [ ] Linguagem escolhida (Node.js ou Python)
- [ ] Código no GitHub
- [ ] Conta Render criada
- [ ] Web service criado
- [ ] Banco de dados configurado
- [ ] Variáveis de ambiente
- [ ] API testada (health check)
- [ ] Frontend atualizado com URL da API
- [ ] Deploy do frontend (Netlify/Vercel)
- [ ] Teste completo (criar igreja → login)

---

**Custo Total: R$ 0,00/mês** 🎉

**Tempo estimado: 15-30 minutos**
