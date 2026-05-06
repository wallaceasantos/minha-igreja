# 🏠 Configuração Local - Domínios Fictícios

## 📋 Visão Geral

Este guia mostra como configurar o projeto **localmente** com domínios fictícios, simulando um ambiente de produção antes de contratar hospedagem.

---

## 🎯 Domínios Configurados

| Serviço | URL Local | Porta |
|---------|-----------|-------|
| **Frontend** | http://app.localhost | 5173 |
| **Backend** | http://api.localhost | 3000 |
| **Admin** | http://admin.localhost | 5173 |
| **MySQL** | localhost | 3306 |

---

## ✅ Pré-requisitos

- [ ] Node.js 18+ instalado
- [ ] MySQL instalado
- [ ] Windows (para scripts .bat)

---

## 📝 Passo 1: Configurar Hosts do Windows

### **1.1 Abrir hosts como Administrador**

1. Menu Iniciar → "Bloco de Notas"
2. Botão direito → "Executar como administrador"

### **1.2 Abrir arquivo hosts**

1. Arquivo → Abrir
2. Navegue até: `C:\Windows\System32\drivers\etc\`
3. Mude filtro para "Todos os arquivos"
4. Selecione: `hosts`

### **1.3 Adicionar domínios**

No final do arquivo, adicione:

```
127.0.0.1       app.localhost
127.0.0.1       api.localhost
127.0.0.1       admin.localhost
```

### **1.4 Salvar**

- Ctrl+S para salvar
- Feche Bloco de Notas

### **1.5 Testar**

No Prompt:
```bash
ping app.localhost
```

Deve responder de `127.0.0.1`

---

## 📝 Passo 2: Configurar Banco de Dados

### **2.1 Instalar MySQL**

Se não tem instalado:
- Baixe: https://dev.mysql.com/downloads/installer/
- Instale MySQL Server 8.0
- Anote a senha root

### **2.2 Criar Banco**

No MySQL Workbench ou terminal:

```sql
CREATE DATABASE igreja_connect;
USE igreja_connect;
```

### **2.3 Importar Tabelas**

```bash
# No MySQL Workbench ou terminal
source C:\Users\wallace\Documents\GPS\jesus-vitoria-connect-main\jesus-vitoria-connect-main\database\update_database_final.sql
```

Ou:
1. Abra MySQL Workbench
2. Conecte-se ao localhost
3. Selecione `igreja_connect`
4. Abra `update_database_final.sql`
5. Execute (rayzinho amarelo)

---

## 📝 Passo 3: Configurar Backend

### **3.1 Instalar Dependências**

```bash
cd backend-nodejs
npm install
```

### **3.2 Criar .env**

O arquivo `.env` já foi criado com:

```bash
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua-senha
DB_NAME=igreja_connect

JWT_SECRET=local-secret-key-development-2026
```

**Importante:** Edite com sua senha do MySQL!

### **3.3 Testar Backend**

```bash
npm run dev
```

Acesse: http://api.localhost:3000/health

Deve mostrar:
```json
{
  "status": "OK",
  "message": "Igreja Connect API",
  ...
}
```

---

## 📝 Passo 4: Configurar Frontend

### **4.1 Instalar Dependências**

```bash
cd ..
npm install
```

### **4.2 Configurar API**

O arquivo `.env.production` já está configurado:

```bash
VITE_API_URL=http://api.localhost:3000/api
```

### **4.3 Testar Frontend**

```bash
npm run dev
```

Acesse: http://app.localhost:5173

---

## 📝 Passo 5: Rodar Tudo Junto

### **Script Automático:**

```bash
start-dev.bat
```

Isso vai:
1. Iniciar backend em http://api.localhost:3000
2. Iniciar frontend em http://app.localhost:5173
3. Abrir duas janelas de terminal

---

## 🧪 Testes

### **Teste 1: Backend Health**

```
http://api.localhost:3000/health
```

**Esperado:**
```json
{
  "status": "healthy",
  "uptime": 123.45
}
```

### **Teste 2: Backend API**

```
http://api.localhost:3000/api/church
```

**Esperado:**
```json
{
  "success": true,
  "data": []
}
```

### **Teste 3: Frontend**

```
http://app.localhost:5173
```

**Esperado:** Site carregando

### **Teste 4: Integração**

No frontend, tente:
- Criar uma igreja
- Fazer login
- Verificar se dados são salvos

---

## 🐛 Solução de Problemas

### **Erro: Hosts não funciona**

**Solução:**
1. Verifique se editou como administrador
2. Reinicie o navegador
3. Limpe cache DNS:
   ```bash
   ipconfig /flushdns
   ```

### **Erro: MySQL não conecta**

**Solução:**
1. Verifique se MySQL está rodando
2. Confirme usuário/senha no `.env`
3. Teste:
   ```bash
   mysql -u root -p
   ```

### **Erro: Porta já em uso**

**Solução:**
1. Mude a porta no `.env`:
   ```bash
   PORT=3001
   ```
2. Ou mate o processo usando a porta

### **Erro: CORS no frontend**

**Solução:**
1. Verifique `ALLOWED_ORIGINS` no `.env` do backend
2. Reinicie backend após mudar

---

## 📊 Estrutura Local

```
┌─────────────────────────────────────────┐
│  SEU COMPUTADOR                         │
├─────────────────────────────────────────┤
│  app.localhost:5173  → Frontend React   │
│  api.localhost:3000  → Backend Node.js  │
│  localhost:3306      → MySQL            │
└─────────────────────────────────────────┘
```

---

## 🚀 Quando Estiver Pronto para Produção

### **1. Contratar Hospedagem**

Sugestões:
- **Vercel** (Frontend) - Grátis
- **Railway** (Backend) - US$5 crédito
- **PlanetScale** (Banco) - Grátis

### **2. Atualizar URLs**

No frontend, mude `.env.production`:

```bash
# Antes (local)
VITE_API_URL=http://api.localhost:3000/api

# Depois (produção)
VITE_API_URL=https://api.seudominio.com/api
```

### **3. Fazer Build**

```bash
npm run build
```

### **4. Deploy**

- Frontend: Suba `dist/` para Vercel
- Backend: Suba `backend-nodejs/` para Railway

---

## ✅ Checklist

- [ ] Hosts do Windows configurado
- [ ] MySQL instalado e rodando
- [ ] Banco `igreja_connect` criado
- [ ] Tabelas importadas
- [ ] Backend `.env` configurado
- [ ] Frontend `.env.production` configurado
- [ ] Backend rodando (http://api.localhost:3000)
- [ ] Frontend rodando (http://app.localhost:5173)
- [ ] Testes realizados

---

## 📚 Próximos Passos

1. ✅ Desenvolver localmente
2. ✅ Testar todas as features
3. ✅ Quando estiver pronto, contratar hospedagem
4. ✅ Fazer deploy para produção

---

**Desenvolva localmente, deploy quando precisar! 🚀**
