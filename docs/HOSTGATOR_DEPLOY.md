# 🚀 GUIA DE IMPLANTAÇÃO - HOSTGATOR

## Domínio: ccjv.com.br

---

## 📋 1. CONFIGURAÇÃO DO DOMÍNIO

### 1.1. DNS na HostGator

Acesse o **cPanel → Zone Editor** e adicione:

```
Tipo: A
Nome: ccjv.com.br
Valor: IP_do_seu_servidor
TTL: 14400
```

```
Tipo: A
Nome: www.ccjv.com.br
Valor: IP_do_seu_servidor
TTL: 14400
```

```
Tipo: A (WILDCARD - IMPORTANTE!)
Nome: *.ccjv.com.br
Valor: IP_do_seu_servidor
TTL: 14400
```

**O wildcard é essencial** para que os subdomínios das igrejas funcionem:
- `igreja1.ccjv.com.br`
- `batista.ccjv.com.br`
- `assembleia.ccjv.com.br`

---

## 🗂️ 2. ESTRUTURA DE ARQUIVOS

### 2.1. Estrutura no Servidor

```
/home/usuario/public_html/
├── .htaccess              ← Redirecionamentos
├── index.php              ← Frontend (build do Vite)
├── api/                   ← Backend PHP
│   ├── criar-igreja.php
│   ├── church/
│   │   └── slug.php
│   └── ...
├── database/              ← Banco de dados
│   ├── Database.php
│   └── multi_tenant_schema.sql
├── lib/                   ← Bibliotecas PHP
│   ├── TenantMiddleware.php
│   └── RateLimiter.php
└── assets/                ← Assets do frontend
    ├── index-xxxxx.js
    ├── index-xxxxx.css
    └── ...
```

### 2.2. Upload dos Arquivos

**Via FTP (FileZilla, WinSCP):**

1. Conecte-se ao servidor:
   - Host: `ftp.ccjv.com.br`
   - Usuário: `seu_usuario`
   - Senha: `sua_senha`
   - Porta: `21`

2. Navegue até: `/public_html/`

3. Upload dos arquivos:
   - Backend PHP: `api/`, `database/`, `lib/`
   - Frontend: Conteúdo de `dist/` do build

---

## 💾 3. BANCO DE DADOS

### 3.1. Criar Banco no cPanel

1. Acesse: **cPanel → MySQL Databases**

2. Criar banco de dados:
   ```
   Nome: igreja_connect
   ```

3. Criar usuário:
   ```
   Usuário: seu_usuario
   Senha: sua_senha_forte
   ```

4. Associar usuário ao banco:
   - Marque todas as permissões (ALL PRIVILEGES)

### 3.2. Executar Schema

1. Acesse: **cPanel → phpMyAdmin**

2. Selecione o banco `igreja_connect`

3. Clique em **SQL** e execute:
   ```sql
   SOURCE database/multi_tenant_schema.sql;
   ```
   
   Ou copie e cole o conteúdo do arquivo `multi_tenant_schema.sql`

### 3.3. Atualizar .env.local

```bash
DB_HOST=localhost
DB_PORT=3306
DB_NAME=igreja_connect
DB_USER=seu_usuario_banco
DB_PASS=sua_senha_banco
DB_CHARSET=utf8mb4
```

---

## 🔧 4. CONFIGURAÇÃO DO SERVIDOR

### 4.1. .htaccess (IMPORTANTE!)

Crie o arquivo `/public_html/.htaccess`:

```apache
# Habilitar rewrite
RewriteEngine On

# Forçar HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# CORS para API (subdomínios)
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type"

# Frontend (React Router)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule ^(.*)$ /index.html [QSA,L]

# PHP API
<FilesMatch \.php$>
    SetHandler application/x-httpd-php
</FilesMatch>

# Segurança
<Files .env>
    Order allow,deny
    Deny from all
</Files>

# Cache para assets estáticos
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

### 4.2. php.ini (Opcional)

Se precisar aumentar limites, crie `/public_html/php.ini`:

```ini
memory_limit = 256M
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 300
max_input_time = 300
```

---

## 🔐 5. SSL/HTTPS

### 5.1. SSL na HostGator

1. Acesse: **cPanel → SSL/TLS Status**

2. Selecione os domínios:
   - [x] `ccjv.com.br`
   - [x] `www.ccjv.com.br`
   - [x] `*.ccjv.com.br` (wildcard)

3. Clique em **Run AutoSSL**

4. Aguarde ~5-10 minutos

### 5.2. Verificar SSL

Acesse: `https://ccjv.com.br`

Deve aparecer o cadeado 🔒

---

## 🏗️ 6. BUILD E DEPLOY

### 6.1. Build do Frontend

```bash
# 1. Criar .env.local
cp .env.example .env.local

# 2. Editar .env.local com dados da HostGator
nano .env.local

# 3. Build
npm run build
```

### 6.2. Upload

**Opção A: FTP (Manual)**

```bash
# Copiar arquivos do dist/ para o servidor
# Via FileZilla ou WinSCP
```

**Opção B: Script Automático**

Crie `deploy.sh`:

```bash
#!/bin/bash

# Build
echo "🔨 Building..."
npm run build

# Upload via rsync
echo "📤 Uploading..."
rsync -avz --delete \
    dist/ \
    usuario@ftp.ccjv.com.br:/home/usuario/public_html/

# Upload backend
rsync -avz \
    api/ \
    database/ \
    lib/ \
    usuario@ftp.ccjv.com.br:/home/usuario/public_html/

echo "✅ Deploy completo!"
```

---

## 🧪 7. TESTES

### 7.1. Testar Domínio Principal

```
https://ccjv.com.br
✅ Deve carregar Landing Page
```

### 7.2. Testar Cadastro

```
https://ccjv.com.br/criar
✅ Formulário deve carregar
✅ Submeter teste
```

### 7.3. Testar Subdomínio (após criar igreja)

```
https://teste.ccjv.com.br
✅ Deve carregar site da igreja de teste
```

### 7.4. Testar API

```bash
# Testar endpoint
curl https://ccjv.com.br/api/church/teste.php

# Deve retornar JSON
```

---

## 🐛 8. SOLUÇÃO DE PROBLEMAS

### Erro 404 em todas as páginas

**Solução:** Verifique o `.htaccess`

```apache
# Deve ter esta linha:
RewriteRule ^(.*)$ /index.html [QSA,L]
```

### Erro 500 na API

**Solução:** Verifique logs de erro

```
cPanel → Error Logs
```

### Subdomínio não carrega

**Solução:** Verifique DNS wildcard

```bash
# No terminal:
ping teste.ccjv.com.br

# Deve retornar o mesmo IP de ccjv.com.br
```

### CORS Error no console

**Solução:** Adicione headers no PHP

```php
header('Access-Control-Allow-Origin: *');
```

### Banco de dados não conecta

**Solução:** Verifique credenciais

```php
// Teste de conexão
$db = Database::getInstance();
echo "Conectado!";
```

---

## 📊 9. MONITORAMENTO

### 9.1. Google Analytics

1. Crie conta em: `analytics.google.com`

2. Adicione propriedade: `ccjv.com.br`

3. Pegue o ID: `G-XXXXXXXXXX`

4. Atualize `.env.local`:
   ```
   VITE_GA_ID=G-XXXXXXXXXX
   ```

5. Rebuild e deploy

### 9.2. Uptime

Use serviços gratuitos:
- [UptimeRobot](https://uptimerobot.com/)
- [Pingdom](https://www.pingdom.com/)

Configure para monitorar:
- `https://ccjv.com.br`
- `https://ccjv.com.br/api/criar-igreja.php`

---

## ✅ 10. CHECKLIST FINAL

### Antes de ir para produção:

- [ ] DNS configurado (A + Wildcard)
- [ ] SSL ativo (cadeado verde)
- [ ] Banco de dados criado
- [ ] Schema executado
- [ ] .env.local configurado
- [ ] .htaccess criado
- [ ] Frontend buildado e upload
- [ ] Backend PHP upload
- [ ] Testes realizados
- [ ] Analytics configurado
- [ ] Email de teste enviado

### Após produção:

- [ ] Monitoramento ativo
- [ ] Backups configurados
- [ ] Logs verificados
- [ ] Primeiras igrejas cadastradas
- [ ] Suporte pronto

---

## 📞 SUPORTE

### HostGator

- Chat 24/7: Disponível no cPanel
- Telefone: 0800-047-4587
- Email: suporte@hostgator.com.br

### Documentação

- [MULTI_TENANT_IMPLEMENTACAO.md](./MULTI_TENANT_IMPLEMENTACAO.md)
- [README.md](./README.md)
- [CLEANUP_REPORT.md](./CLEANUP_REPORT.md)

---

**🚀 Bom deploy!**

Qualquer dúvida, estou à disposição! 😊
