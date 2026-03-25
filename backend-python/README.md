# 🚀 Deploy Grátis - Python FastAPI

## Hospedagens Gratuitas para Python

### 1. **Render.com** (Recomendado) ⭐
- ✅ Web service grátis (sleep após 15min)
- ✅ PostgreSQL grátis (256MB)
- ✅ Deploy automático
- ✅ SSL automático

**Limites:** 750 horas/mês, 256MB RAM

### 2. **Railway.app**
- ✅ US$5 crédito/mês
- ✅ PostgreSQL incluso
- ✅ Sem sleep

**Limites:** US$5 crédito (~500 horas)

### 3. **PythonAnywhere**
- ✅ 1 web app grátis
- ✅ Sem sleep
- ✅ Python já instalado

**Limites:** 512MB storage, 1 CPU core

---

## 📝 Deploy no Render (Python)

### 1. Preparar Código

```bash
cd backend-python

# Criar ambiente virtual
python -m venv venv

# Ativar (Windows)
venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Testar localmente
python main.py
```

### 2. Subir para GitHub

```bash
git init
git add .
git commit -m "Python FastAPI API"
git branch -M main
git remote add origin https://github.com/seu-user/igreja-connect-api.git
git push -u origin main
```

### 3. Criar Web Service no Render

1. https://render.com → Login GitHub
2. **New +** → **Web Service**
3. Conecte repositório
4. Configure:
   - **Name:** igreja-connect-python
   - **Region:** Singapore (grátis)
   - **Branch:** main
   - **Root Directory:** `backend-python`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free

5. **Environment Variables:**
   ```
   PYTHONUNBUFFERED=1
   PORT=8000
   DB_HOST=seu-host-mysql
   DB_USER=seu-user
   DB_PASSWORD=sua-senha
   DB_NAME=igreja_connect
   ```

6. **Create Web Service**

### 4. Migrar Banco

Use DBeaver ou MySQL Workbench para conectar e importar tabelas.

---

## 📝 Deploy na PythonAnywhere

### 1. Criar Conta

1. https://www.pythonanywhere.com/
2. Sign up (grátis)
3. Console → Bash

### 2. Upload Código

```bash
# No console PythonAnywhere
git clone https://github.com/seu-user/igreja-connect-api.git
cd backend-python
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Configurar Web App

1. Web → **Add a new web app**
2. **Manual configuration**
3. **Python 3.10**
4. Configure:
   - Source code: `/home/seu-user/backend-python`
   - Working directory: `/home/seu-user/backend-python`
   - Virtualenv: `/home/seu-user/backend-python/venv`

5. **WSGI configuration file:**
   ```python
   import sys
   path = '/home/seu-user/backend-python'
   if path not in sys.path:
       sys.path.append(path)

   from main import app as application
   ```

6. **Reload**

---

## 📝 Deploy na Railway

### 1. Railway.app

1. https://railway.app/
2. Login GitHub
3. **New Project** → **Deploy from GitHub**
4. Selecione repositório

### 2. Configurar

1. **Variables:**
   ```
   PYTHONUNBUFFERED=1
   PORT=${{PORT}}
   DB_HOST=${{MYSQLHOST}}
   DB_USER=${{MYSQLUSER}}
   DB_PASSWORD=${{MYSQLPASSWORD}}
   DB_NAME=${{MYSQLDATABASE}}
   ```

2. **Add Service → MySQL**

3. **Deploy**

---

## 🧪 Testar API

```bash
# Health check
curl https://sua-api-python.onrender.com/

# Listar igrejas
curl https://sua-api-python.onrender.com/api/church

# Criar igreja
curl -X POST https://sua-api-python.onrender.com/api/church \
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

## 🔧 Atualizar Frontend React

```typescript
// src/services/api.ts
export const API_BASE_URL = 'https://igreja-connect-python.onrender.com/api';
// ou
export const API_BASE_URL = 'https://igreja-connect.railway.app/api';
```

---

## 💰 Custos Reais

| Serviço | Grátis | Pago |
|---------|--------|------|
| Render | ✅ 750h/mês | $7/mês |
| Railway | ✅ US$5 crédito | $5/mês |
| PythonAnywhere | ✅ 1 app | $5/mês |

---

## ✅ Checklist

- [ ] Código no GitHub
- [ ] Conta Render/Railway criada
- [ ] Web service criado
- [ ] Banco configurado
- [ ] Variáveis de ambiente
- [ ] Migração executada
- [ ] API testada
- [ ] Frontend atualizado

---

**URL Final:**
- API: `https://igreja-connect-python.onrender.com`
- Frontend: `https://igreja-connect.netlify.app`

**Custo: R$ 0,00/mês** 🎉
