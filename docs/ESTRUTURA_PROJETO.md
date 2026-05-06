# 📁 Estrutura do Projeto - Igreja Connect

## ✅ Estrutura Final (Limpa)

```
jesus-vitoria-connect/
│
├── 📂 backend-nodejs/           # Backend Node.js + Express
│   ├── src/
│   │   ├── server.js            # Servidor principal
│   │   ├── routes/
│   │   │   ├── church.js        # Rotas de igrejas
│   │   │   ├── contact.js       # Rotas de contato
│   │   │   └── auth.js          # Rotas de auth
│   │   └── config/
│   │       └── database.js      # Configuração MySQL
│   ├── package.json
│   └── .env.example
│
├── 📂 frontend/ (src/, public/) # Frontend React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
│
├── 📂 database/                 # Banco de Dados
│   └── update_database_final.sql
│
├── 📂 docs/                     # Documentação
│   ├── DEPLOY_BACKEND_NODEJS.md
│   └── RESUMO_LIMPEZA.md
│
├── 📄 README.md                 # Documentação principal
├── 📄 .gitignore                # Git ignore
├── 📄 .env.example              # Exemplo de ambiente
│
├── 🔧 start-dev.bat             # Rodar tudo (Windows)
├── 🔧 limpar-projeto.ps1        # Limpeza do projeto
└── 🔧 limpar-docs.ps1           # Limpeza de docs
```

---

## 📊 Resumo por Pasta

### **`backend-nodejs/`**
- **O que tem:** Backend Node.js + Express
- **Tecnologias:** Node.js, Express, MySQL, JWT, Bcrypt
- **Como rodar:** `cd backend-nodejs && npm run dev`
- **URL:** http://localhost:3000

### **`src/` e `public/`**
- **O que tem:** Frontend React
- **Tecnologias:** React, TypeScript, Vite, TailwindCSS, Radix UI
- **Como rodar:** `npm run dev`
- **URL:** http://localhost:5173

### **`database/`**
- **O que tem:** Scripts SQL do banco
- **Como usar:** Importar no MySQL Workbench ou phpMyAdmin

### **`docs/`**
- **O que tem:** Documentação do projeto
- **Arquivos:**
  - `DEPLOY_BACKEND_NODEJS.md` - Como fazer deploy do backend
  - `RESUMO_LIMPEZA.md` - Resumo da limpeza do projeto

---

## 🗑️ O Que Foi Removido

### **Pastas Inteiras:**
- ❌ `backend/` (PHP)
- ❌ `backend-python/` (Python)
- ❌ `lib/` (PHP)

### **Arquivos .md:**
- ❌ `DEPLOY_API_RENDER.md`
- ❌ `DEPLOY_FRONTEND_NETLIFY.md`
- ❌ `DEPLOY_FRONTEND_NETLIFY_VERCEL.md`
- ❌ `DEPLOY_RENDER_NODEJS.md`
- ❌ `RESUMO_DEPLOY_COMPLETO.md`
- ❌ `RESUMO_FRONTEND_GITHUB.md`
- ❌ `TUTORIAL_GIT_CMD.md`
- ❌ `BACKEND_COMPARATIVO.md`
- ❌ `CONFIGURAR_BANCO_DADOS.md`
- ❌ `DEPLOY_BACKEND_GRATIS.md`
- ❌ `DEPLOY_GRATIS_MASTER.md`
- ❌ `DEPLOY_GUIDE.md`
- ❌ `DEPLOY_INFINITYFREE.md`
- ❌ `DEPLOY_NETLIFY.md`
- ❌ `DEPLOY_RAPIDO.md`
- ❌ `RESOLVER_PROBLEMA.md`
- ❌ `SEPARAR_REPOSITORIOS.md`
- ❌ `SUPORTE_HOSTGATOR.md`
- ❌ `README_FINAL.md`

### **Scripts Antigos:**
- ❌ `corrigir-vite.ps1`
- ❌ `deploy-backend-github.ps1`
- ❌ `deploy-frontend-github.ps1`
- ❌ `deploy-frontend-gitcmd.bat`
- ❌ `deploy-ftp.ps1`
- ❌ `deploy-gratis.ps1`
- ❌ `deploy.sh`
- ❌ `upload-diagnostico.ps1`
- ❌ `upload-final.ps1`
- ❌ `diagnostico.php`
- ❌ `*.php` (todos)
- ❌ `render.yaml`
- ❌ `package-corrigido.json`

---

## ✅ O Que Foi Mantido

### **Documentação:**
- ✅ `README.md` - Visão geral do projeto
- ✅ `docs/DEPLOY_BACKEND_NODEJS.md` - Deploy do backend
- ✅ `docs/RESUMO_LIMPEZA.md` - Resumo da limpeza

### **Scripts Úteis:**
- ✅ `start-dev.bat` - Rodar frontend e backend juntos
- ✅ `limpar-projeto.ps1` - Limpeza geral do projeto
- ✅ `limpar-docs.ps1` - Limpeza de documentação

### **Configuração:**
- ✅ `.gitignore` - Para Node.js/React
- ✅ `.env.example` - Modelo de variáveis de ambiente

---

## 🎯 Projeto Atual

| Item | Status |
|------|--------|
| **Backend** | Node.js + Express ✅ |
| **Frontend** | React + TypeScript ✅ |
| **Banco** | MySQL ✅ |
| **PHP** | ❌ Removido |
| **Python** | ❌ Removido |
| **Documentação** | Limpa e objetiva ✅ |
| **Scripts** | Apenas úteis ✅ |

---

## 🚀 Como Começar

### **1. Instalar Dependências**
```bash
# Backend
cd backend-nodejs
npm install

# Frontend
cd ..
npm install
```

### **2. Configurar Ambiente**
```bash
cd backend-nodejs
cp .env.example .env
# Edite .env com suas credenciais
```

### **3. Rodar Desenvolvimento**
```bash
# Opção A: Script automático
start-dev.bat

# Opção B: Manual
# Terminal 1: cd backend-nodejs && npm run dev
# Terminal 2: npm run dev
```

---

## 📚 Próximos Passos

1. ✅ Testar localmente
2. ✅ Configurar banco de dados
3. ✅ Desenvolver features
4. ✅ Deploy quando estiver pronto

---

**Projeto 100% limpo e focado em Node.js! 🚀**
