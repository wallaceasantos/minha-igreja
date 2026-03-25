# .htaccess - Forçar PHP 8.3
# /public_html/plataforma/.htaccess

# REMOVER handler PHP anterior
<IfModule mod_mime.c>
    RemoveHandler .php
    RemoveType .php
</IfModule>

# ADICIONAR handler PHP 8.3 HostGator
<FilesMatch \.php$>
    SetHandler application/x-httpd-php83
</FilesMatch>

# Forçar tipo MIME
<IfModule mod_mime.c>
    AddType application/x-httpd-php .php
    AddType application/x-httpd-php83 .php
</IfModule>

# ============================================
# REACT ROUTER (SPA)
# ============================================
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /plataforma/

    # Forçar HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

    # NÃO tocar em arquivos PHP
    RewriteCond %{REQUEST_URI} \.php$ [NC]
    RewriteRule ^ - [L]

    # NÃO tocar na pasta api/
    RewriteCond %{REQUEST_URI} ^/plataforma/api/ [NC]
    RewriteRule ^ - [L]

    # Se arquivo/diretório existe, serve diretamente
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]

    # Resto vai para index.html (React)
    RewriteRule ^(.*)$ /plataforma/index.html [QSA,L]
</IfModule>

# ============================================
# SEGURANÇA
# ============================================
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
</IfModule>
