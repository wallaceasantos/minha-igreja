# Deploy Backend - InfinityFree (GRÁTIS)

## Passo 1: Criar Conta

1. Acesse: https://infinityfree.net/
2. Clique em "Sign Up"
3. Preencha dados
4. Confirme email

## Passo 2: Criar Site

1. Login no painel
2. Clique em "Create Account"
3. Escolha subdomínio grátis:
   - `suaigreja.rf.gd`
   - `suaigreja.great-site.net`
   - `suaigreja.infinityfreeapp.com`
4. Ou use domínio próprio: `plataforma.ccjv.com.br`

## Passo 3: Configurar Banco de Dados

1. Painel → MySQL Databases
2. Crie banco:
   - Database Name: `epiz_XXXXXXX_ccjv`
   - Username: `epiz_XXXXXXX`
   - Password: (gerada automaticamente)
   - Host: `sqlXXX.infinityfree.com`

**IMPORTANTE:** Anote essas credenciais!

## Passo 4: Atualizar .ccjv_secrets.php

```php
<?php
// .ccjv_secrets.php - InfinityFree

return [
    'db_host' => 'sqlXXX.infinityfree.com',  // Host do banco
    'db_name' => 'epiz_XXXXXXX_ccjv',        // Nome do banco
    'db_user' => 'epiz_XXXXXXX',             // Usuário
    'db_pass' => 'SUA_SENHA',                // Senha
    'gmail_user' => 'ccjv1670@gmail.com',
    'gmail_password' => '',
    'telegram_bot_token' => '',
    'telegram_chat_id' => '',
];
```

## Passo 5: Upload dos Arquivos

### Via FTP (FileZilla):

1. Baixe FileZilla: https://filezilla-project.org/
2. Dados FTP (no painel InfinityFree):
   ```
   Host: ftpupload.net
   Username: epiz_XXXXXXX
   Password: (sua senha)
   Porta: 21
   ```
3. Conecte
4. Navegue até: `/htdocs/`
5. Upload dos arquivos:
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
   ├── .ccjv_secrets.php
   └── .htaccess
   ```

### Via File Manager (Navegador):

1. Painel InfinityFree → File Manager
2. Navegue até `/htdocs/`
3. Delete arquivos padrão
4. Upload → Selecione arquivos
5. Extraia se for ZIP

## Passo 6: Criar Tabelas no Banco

1. Painel → phpMyAdmin
2. Selecione seu banco
3. Aba "SQL"
4. Cole o script `update_database_final.sql`
5. Executar

## Passo 7: Testar API

Acesse no navegador:
```
https://seusite.rf.gd/api/test-simples.php
```

Deve retornar:
```json
{
  "success": true,
  "message": "Conexão bem-sucedida!",
  ...
}
```

## Passo 8: Configurar CORS

No `.htaccess` da pasta `/api/`:

```apache
<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>
```

## Passo 9: Atualizar Frontend

No React, atualize a URL da API:

```typescript
// src/services/api.ts
export const API_BASE_URL = 'https://seusite.rf.gd/api';
```

Rebuild e deploy na Netlify:
```bash
npm run build
netlify deploy --prod
```

## Limites InfinityFree:

✅ 5GB storage
✅ 50,000 visitas/dia
✅ 400 bancos MySQL
✅ Sem sleep
✅ SSL grátis (Let's Encrypt)
✅ PHP 8.3
✅ File Manager
✅ FTP

❌ Sem domínio próprio grátis (subdomínio .rf.gd)
❌ Anúncios ocasionais (popups)
❌ Limite de 25,000 inodes
❌ Sem SSH

## URL Final:

- API: `https://seusite.rf.gd/api/`
- Frontend: `https://seuprojeto.netlify.app`
- Frontend com API: `https://seuprojeto.netlify.app` → `https://seusite.rf.gd/api/`

## Dicas:

1. **Cache:** InfinityFree tem cache. Após upload, aguarde 5 minutos.
2. **Erros:** Ative `display_errors` no `.htaccess` para debug
3. **Backup:** Exporte banco semanalmente no phpMyAdmin
4. **Performance:** Use Cloudflare CDN na frente
