# 🚨 SUPORTE HOSTGATOR - PROBLEMA CRÍTICO

## Resumo do Problema

**Domínio:** plataforma.ccjv.com.br  
**Path:** /home2/walla573/plataforma.ccjv.com.br/  
**Problema:** Arquivos PHP fazem DOWNLOAD em vez de executar no navegador

## Sintomas

| URL | Comportamento Esperado | Comportamento Real |
|-----|------------------------|-------------------|
| https://plataforma.ccjv.com.br/teste.php | Executar PHP, mostrar JSON | Download do arquivo .php |
| https://plataforma.ccjv.com.br/api/teste.php | Executar PHP, mostrar JSON | Download do arquivo .php |
| https://plataforma.ccjv.com.br/index.html | Carregar HTML | Funciona normalmente |

## Configuração Atual

- **PHP Version:** 8.3 (ea-php83) - confirmado no MultiPHP Manager
- **Permissões dos arquivos:** 644 (correto)
- **Permissões das pastas:** 755 (correto)
- **.htaccess:** Configurado com handler PHP 8.3

## .htaccess Atual

```apache
# .htaccess - Igreja Connect
# Subdomínio: plataforma.ccjv.com.br
# Path: /home2/walla573/plataforma.ccjv.com.br/

# Forçar PHP 8.3
<IfModule mod_mime.c>
    RemoveHandler .php
    RemoveType .php
</IfModule>

<FilesMatch \.php$>
    SetHandler application/x-httpd-php83
</FilesMatch>

<IfModule mod_mime.c>
    AddType application/x-httpd-php .php
    AddType application/x-httpd-php83 .php
</IfModule>

RewriteEngine On
RewriteBase /

RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

RewriteCond %{REQUEST_URI} \.php$ [NC]
RewriteRule ^ - [L]

RewriteCond %{REQUEST_URI} ^/api/ [NC]
RewriteRule ^ - [L]

RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

RewriteRule ^(.*)$ index.html [QSA,L]
```

## Testes Já Realizados

### ✅ O que FUNCIONA:
- Arquivos HTML (.html, .htm)
- Arquivos CSS (.css)
- Arquivos JavaScript (.js)
- Imagens (.png, .jpg, .svg, .ico)
- .htaccess (rewrite rules)

### ❌ O que NÃO FUNCIONA:
- Qualquer arquivo .php (faz download)
- Teste com .phtml (também faz download)
- Teste com .cgi (não executado)

### Testes de .htaccess:
1. ✅ Múltiplas versões de .htaccess testadas
2. ✅ Recriado manualmente via File Manager
3. ✅ Handler PHP 8.3 configurado corretamente
4. ✅ Permissões verificadas (644 para arquivos)
5. ✅ PHP 8.3 ativo no MultiPHP Manager
6. ✅ .user.ini criado na raiz
7. ✅ php.ini criado na raiz

### Testes de Arquivos:
1. ✅ teste.php (simples, header JSON + echo)
2. ✅ api/teste.php (mesmo conteúdo)
3. ✅ server-info.php (diagnóstico)
4. ✅ Arquivos criados via File Manager (também falham)
5. ✅ Arquivos enviados via FTP (também falham)

## Estrutura de Arquivos

```
/home2/walla573/plataforma.ccjv.com.br/
├── .htaccess (954 bytes, 644)
├── .user.ini (358 bytes, 644)
├── php.ini (356 bytes, 644)
├── .ccjv_secrets.php (835 bytes, 600)
├── index.html (2.28 KB, 644)
├── teste.php (207 bytes, 644) ← FAZ DOWNLOAD
├── api/ (755)
│   ├── .htaccess
│   └── teste.php ← FAZ DOWNLOAD
├── assets/ (755)
├── config/ (755)
└── includes/ (755)
```

## Informações do Servidor

- **Servidor:** HostGator
- **Painel:** cPanel 118.0.61
- **PHP:** 8.3 (ea-php83)
- **Path:** /home2/walla573/plataforma.ccjv.com.br/
- **Domínio:** plataforma.ccjv.com.br

## Solicitação

Por favor, verifiquem:

1. **Módulo PHP está ativo** para esta conta de hospedagem?
2. **Handler `application/x-httpd-php83`** está disponível no servidor?
3. **Módulo mime_module** está carregado e configurado corretamente?
4. **Existe algum bloqueio** específico para execução de PHP neste subdomínio?
5. **Configuração do Apache** para este diretório está correta?
6. **Existe algum .htaccess global** em /home2/walla573/ que possa estar sobrescrevendo?

## Teste Rápido para Equipe HostGator

1. Acessem: https://plataforma.ccjv.com.br/teste.php
2. Observem: O navegador faz download do arquivo em vez de executar
3. Conteúdo do arquivo:
   ```php
   <?php
   header('Content-Type: application/json');
   echo json_encode(['status' => 'OK', 'message' => 'PHP funcionando!']);
   ```

## Urgência

**CRÍTICO** - Site em produção parado.

Aguardo retorno urgente.

Obrigado.

---

**Contato:** [Seu email/telefone]  
**Data:** 2026-03-25  
**Ticket:** [Aguardando número]
