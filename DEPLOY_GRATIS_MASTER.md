# 🚀 GUIA DEFINITIVO - Deploy Gratuito Igreja Connect

## 📊 Resumo das Opções Gratuitas

| Opção | Frontend | Backend | Banco | Dificuldade | Limites |
|-------|----------|---------|-------|-------------|---------|
| **Netlify + InfinityFree** | ✅ Netlify | ✅ InfinityFree | ✅ Incluso | Fácil | 5GB, 50k/dia |
| **Vercel + 000webhost** | ✅ Vercel | ✅ 000webhost | ✅ Incluso | Fácil | 1GB, 3GB/mês |
| **Render (tudo junto)** | ✅ Render | ✅ Render | ✅ Render | Médio | 256MB, sleep |
| **Cloudflare Pages** | ✅ Cloudflare | ⚠️ Workers* | ⚠️ D1* | Difícil | 100k req/dia |
| **Oracle Cloud** | ✅ VPS | ✅ VPS | ✅ VPS | Difícil | 24GB RAM, 200GB |

*Precisa reescrever backend para JavaScript

---

## 🎯 RECOMENDAÇÃO: Netlify + InfinityFree

### ✅ Vantagens:
- 100% grátis para sempre
- Sem sleep (InfinityFree não dorme)
- 5GB storage + 50k visitas/dia
- Fácil de configurar
- SSL automático
- Sem necessidade de cartão de crédito

### ❌ Desvantagens:
- Subdomínio (.rf.gd ou similar)
- Anúncios ocasionais (popups)
- Performance não é a melhor

---

## 📝 PASSO-A-PASSO COMPLETO

### **PARTE 1: Frontend (Netlify)**

#### 1.1 Build do React
```bash
npm run build
```

#### 1.2 Deploy na Netlify

**Opção A: Arrastar e Soltar (5 minutos)**
1. Acesse https://app.netlify.com/
2. Crie conta grátis (GitHub/Google)
3. Arraste a pasta `dist/` para a área indicada
4. Pronto! URL: `https://seu-projeto.netlify.app`

**Opção B: CLI (mais controle)**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

#### 1.3 Configurar URL da API

Edite `src/services/api.ts`:
```typescript
export const API_BASE_URL = 'https://seusite.rf.gd/api';
```

Rebuild:
```bash
npm run build
netlify deploy --prod
```

---

### **PARTE 2: Backend (InfinityFree)**

#### 2.1 Criar Conta
1. Acesse https://infinityfree.net/
2. Clique em "Sign Up"
3. Preencha dados e confirme email

#### 2.2 Criar Site
1. Login no painel
2. "Create Account"
3. Escolha subdomínio:
   - `igrejaconnect.rf.gd`
   - `igrejaconnect.great-site.net`
   - `igrejaconnect.infinityfreeapp.com`

#### 2.3 Configurar Banco de Dados
1. Painel → MySQL Databases
2. Crie banco:
   - Database: `epiz_XXXXXXX_ccjv`
   - Username: `epiz_XXXXXXX`
   - Password: (anote!)
   - Host: `sqlXXX.infinityfree.com` (anote!)

#### 2.4 Atualizar .ccjv_secrets.php

```php
<?php
return [
    'db_host' => 'sqlXXX.infinityfree.com',
    'db_name' => 'epiz_XXXXXXX_ccjv',
    'db_user' => 'epiz_XXXXXXX',
    'db_pass' => 'SUA_SENHA',
    'gmail_user' => 'ccjv1670@gmail.com',
    'gmail_password' => '',
    'telegram_bot_token' => '',
    'telegram_chat_id' => '',
];
```

#### 2.5 Upload dos Arquivos

**Via FileZilla (Recomendado):**
1. Baixe: https://filezilla-project.org/
2. Dados FTP (do painel InfinityFree):
   ```
   Host: ftpupload.net (ou outro fornecido)
   User: epiz_XXXXXXX
   Pass: sua_senha
   Porta: 21
   ```
3. Conecte e navegue até `/htdocs/`
4. Upload dos arquivos:
   ```
   /htdocs/
   ├── api/
   │   ├── .htaccess
   │   ├── criar-igreja.php
   │   ├── church.php
   │   ├── contact.php
   │   └── test-simples.php
   ├── config/
   │   └── config.php
   ├── includes/
   │   ├── Database.php
   │   ├── TenantMiddleware.php
   │   └── RateLimiter.php
   └── .ccjv_secrets.php
   ```

**Via File Manager:**
1. Painel → File Manager
2. `/htdocs/`
3. Delete arquivos padrão
4. Upload → Selecione arquivos
5. Extraia se for ZIP

#### 2.6 Criar Tabelas no Banco
1. Painel → phpMyAdmin
2. Selecione seu banco
3. Aba "SQL"
4. Cole o script `update_database_final.sql`
5. Executar

#### 2.7 Testar API
```
https://seusite.rf.gd/api/test-simples.php
```

Deve retornar JSON de sucesso.

---

### **PARTE 3: Integração**

#### 3.1 Atualizar Frontend
```typescript
// src/services/api.ts
export const API_BASE_URL = 'https://seusite.rf.gd/api';
```

#### 3.2 Rebuild e Deploy
```bash
npm run build
netlify deploy --prod
```

#### 3.3 Testar Fluxo Completo
1. Acesse: `https://seuprojeto.netlify.app`
2. Tente criar uma igreja
3. Verifique se dados foram salvos no banco

---

## 🔧 Configurações Adicionais

### .htaccess (API) - InfinityFree

```apache
# Forçar PHP
AddHandler application/x-httpd-php83 .php

# CORS
<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type"
</IfModule>
```

### Variáveis de Ambiente (Netlify)

1. Netlify → Site Settings → Build & Deploy → Environment
2. Adicione:
   ```
   VITE_API_URL=https://seusite.rf.gd/api
   ```

---

## 🎉 URLs Finais

| Serviço | URL |
|---------|-----|
| Frontend | `https://seuprojeto.netlify.app` |
| Backend | `https://seusite.rf.gd/api/` |
| phpMyAdmin | `https://app.infinityfree.com/phpmyadmin` |

---

## 🐛 Solução de Problemas

### Frontend não carrega
- Verifique console do navegador (F12)
- Erros de CORS? Atualize backend
- 404? Pasta dist/ vazia?

### API não responde
- Teste direto: `https://seusite.rf.gd/api/test-simples.php`
- Erro 500? Verifique .ccjv_secrets.php
- Download ao invés de JSON? .htaccess errado

### Banco de dados não conecta
- Verifique credenciais no .ccjv_secrets.php
- Host correto? (sqlXXX.infinityfree.com)
- Banco criado no phpMyAdmin?

### Erro de CORS
- Backend não tem headers CORS?
- Adicione no .htaccess da API

---

## 📊 Limites e Upgrade

### Limites InfinityFree:
- 5GB storage
- 50,000 visitas/dia
- 400 bancos MySQL
- 25,000 inodes
- CPU limit (não pode minerar!)

### Quando crescer:
- **Upgrade 1:** Hostinger Cloud (R$29/mês)
- **Upgrade 2:** DigitalOcean + CloudPanel ($6/mês)
- **Upgrade 3:** VPS dedicada

---

## 🎁 Bônus: Domínio Próprio Grátis

### Freenom (às vezes disponível):
1. Acesse https://www.freenom.com/
2. Registre domínio grátis (.tk, .ml, .ga, .cf, .gq)
3. Aponte para Netlify e InfinityFree

### Ou use seu domínio ccjv.com.br:
1. Netlify → Domain Settings → Add domain
2. InfinityFree → Domains → Add domain
3. Configure DNS no registro.br

---

## ✅ Checklist Final

- [ ] Frontend buildado (`npm run build`)
- [ ] Frontend na Netlify
- [ ] Conta InfinityFree criada
- [ ] Site criado no InfinityFree
- [ ] Banco de dados criado
- [ ] .ccjv_secrets.php configurado
- [ ] Arquivos PHP uploadados
- [ ] Tabelas criadas no banco
- [ ] API testada e funcionando
- [ ] Frontend configurado com URL da API
- [ ] Rebuild e deploy final
- [ ] Fluxo completo testado

---

## 📞 Suporte

- Netlify: https://answers.netlify.com/
- InfinityFree: https://forum.infinityfree.com/
- Documentação: README.md do projeto

---

**Última atualização:** 2026-03-25  
**Status:** ✅ Funcionando  
**Custo:** R$ 0,00/mês 🎉
