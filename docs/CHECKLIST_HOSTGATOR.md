# 📋 CHECKLIST RÁPIDO - HOSTGATOR

## ⚡ Configuração em 10 Passos

---

### 1️⃣ DNS (5 minutos)

**cPanel → Zone Editor**

Adicione:

```
Nome: ccjv.com.br
Tipo: A
Destino: SEU_IP (ex: 192.168.1.1)
```

```
Nome: *.ccjv.com.br  ← WILDCARD (IMPORTANTE!)
Tipo: A
Destino: SEU_IP (mesmo IP acima)
```

---

### 2️⃣ Banco de Dados (5 minutos)

**cPanel → MySQL Databases**

1. Criar banco: `igreja_connect`
2. Criar usuário: `SEU_USUARIO` / `SUA_SENHA`
3. Associar usuário ao banco
4. Marcar: **ALL PRIVILEGES**

---

### 3️⃣ phpMyAdmin (5 minutos)

**cPanel → phpMyAdmin**

1. Selecionar banco `igreja_connect`
2. Clicar em **SQL**
3. Copiar conteúdo de `database/multi_tenant_schema.sql`
4. Colar e executar

---

### 4️⃣ .env.local (3 minutos)

**No seu computador:**

```bash
cp .env.local.example .env.local
nano .env.local
```

**Preencher:**
```bash
DB_NAME=igreja_connect
DB_USER=SEU_USUARIO_BANCO
DB_PASS=SUA_SENHA_BANCO
VITE_APP_URL=https://ccjv.com.br
VITE_API_URL=https://ccjv.com.br/api
```

---

### 5️⃣ Build (2 minutos)

**No seu computador:**

```bash
npm run build
```

**Aguardar:** `✓ built in X.XXs`

---

### 6️⃣ Upload FTP (10 minutos)

**FileZilla / WinSCP:**

```
Host: ftp.ccjv.com.br
Usuário: SEU_USUARIO_FTP
Senha: SUA_SENHA_FTP
Porta: 21
```

**Upload para `/public_html/`:**

```
✅ dist/* (conteúdo da pasta)
✅ api/
✅ database/
✅ lib/
```

---

### 7️⃣ .htaccess (3 minutos)

**Criar arquivo `/public_html/.htaccess`:**

```apache
RewriteEngine On

# HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# CORS
Header set Access-Control-Allow-Origin "*"

# React Router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule ^(.*)$ /index.html [QSA,L]
```

---

### 8️⃣ SSL (10 minutos + espera)

**cPanel → SSL/TLS Status**

1. Marcar:
   - [x] `ccjv.com.br`
   - [x] `www.ccjv.com.br`
   - [x] `*.ccjv.com.br`
2. Clicar: **Run AutoSSL**
3. Aguardar 5-10 minutos

**Verificar:** `https://ccjv.com.br` (cadeado 🔒)

---

### 9️⃣ Testes (5 minutos)

**Testar:**

1. `https://ccjv.com.br` → Landing Page ✅
2. `https://ccjv.com.br/criar` → Formulário ✅
3. `https://ccjv.com.br/api/church/teste.php` → JSON ✅

---

### 🔟 Criar Primeira Igreja (5 minutos)

**Acessar:** `https://ccjv.com.br/criar`

**Preencher:**
- Nome: Igreja Teste
- Slug: teste
- Email: seu@email.com
- Senha: 123456

**Acessar:** `https://teste.ccjv.com.br`

**Resultado:** Site da igreja no ar! 🎉

---

## ⏱️ Tempo Total: ~50 minutos

| Etapa | Tempo |
|-------|-------|
| DNS | 5 min |
| Banco | 5 min |
| Schema | 5 min |
| .env | 3 min |
| Build | 2 min |
| Upload | 10 min |
| .htaccess | 3 min |
| SSL | 10 min (+ espera) |
| Testes | 5 min |
| Primeira Igreja | 5 min |
| **TOTAL** | **~50 min** |

---

## 🐛 Problemas Comuns

### Erro 404 em todas as páginas

**Solução:** Verifique `.htaccess`

```apache
# Deve ter esta linha:
RewriteRule ^(.*)$ /index.html [QSA,L]
```

### Subdomínio não carrega

**Solução:** Verifique DNS wildcard

```bash
# No terminal (Windows):
ping teste.ccjv.com.br

# Deve retornar mesmo IP de ccjv.com.br
```

### Erro de banco de dados

**Solução:** Verifique `.env.local`

```bash
DB_USER=correto?
DB_PASS=correta?
DB_NAME=correto?
```

### SSL não ativa

**Solução:** Aguarde mais 10 minutos ou force:

**cPanel → SSL/TLS → Reemitir**

---

## ✅ Checklist Impressão

```
[ ] 1. DNS configurado (A + Wildcard)
[ ] 2. Banco de dados criado
[ ] 3. Schema executado
[ ] 4. .env.local configurado
[ ] 5. Build realizado
[ ] 6. Upload FTP completo
[ ] 7. .htaccess criado
[ ] 8. SSL ativo
[ ] 9. Testes realizados
[ ] 10. Primeira igreja criada
```

---

## 📞 Contatos Úteis

### HostGator

- **Chat:** cPanel → Suporte → Chat
- **Telefone:** 0800-047-4587
- **Email:** suporte@hostgator.com.br

### Documentação

- `HOSTGATOR_DEPLOY.md` - Guia completo
- `README.md` - Documentação do projeto
- `MULTI_TENANT_IMPLEMENTACAO.md` - Implementação técnica

---

**🚀 Bom deploy!**

Qualquer dúvida, consulte a documentação completa! 😊
