# Backend Igreja Connect

Backend PHP para a plataforma Igreja Connect - SaaS multi-tenant para igrejas.

## 📁 Estrutura de Arquivos

```
backend/
├── .env.example              # Modelo de variáveis de ambiente
├── README.md                 # Esta documentação
├── api/                      # APIs da aplicação
│   ├── church.php           # Buscar igreja por slug
│   └── contact.php          # Enviar mensagem de contato
├── config/                   # Configurações
│   └── config.php           # Configuração centralizada
└── includes/                 # Classes utilitárias
    ├── Database.php         # Singleton de banco de dados
    ├── TenantMiddleware.php # Identificação de igreja por subdomínio
    └── RateLimiter.php      # Controle de rate limiting
```

## 🚀 Instalação

### 1. Configurar Variáveis de Ambiente

```bash
cd backend
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

### 2. Configurar Banco de Dados

Execute o script SQL em `database/multi_tenant_schema.sql` para criar as tabelas necessárias.

### 3. Configurar Servidor Web

#### Apache (.htaccess)

```apache
# Redirecionar todas as requisições para index.php
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

# CORS para API
Header set Access-Control-Allow-Origin "*"
Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header set Access-Control-Allow-Headers "Content-Type"
```

#### Nginx

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name .ccjv.com.br;
    
    root /var/www/igrejaconnect/backend;
    index index.php index.html;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

## 📡 APIs Disponíveis

### 1. Buscar Igreja por Slug

**Endpoint:** `GET /api/church/[slug].php`

**Exemplo:**
```bash
GET /api/church/primeira-batista.php
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Primeira Igreja Batista",
    "slug": "primeira-batista",
    "description": "...",
    "logo_url": "...",
    "theme_primary_color": "#1e40af",
    ...
  }
}
```

**Resposta de Erro:**
```json
{
  "success": false,
  "error": "Igreja não encontrada"
}
```

### 2. Enviar Mensagem de Contato

**Endpoint:** `POST /api/contact.php`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "phone": "(11) 99999-9999",
  "church": "Igreja Batista",
  "church_size": "200-500",
  "subject": "comercial",
  "message": "Gostaria de saber mais sobre a plataforma..."
}
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "message": "Mensagem enviada com sucesso! Entraremos em contato em até 24 horas úteis."
}
```

**Resposta de Erro:**
```json
{
  "success": false,
  "error": "Erros de validação",
  "errors": ["Nome é obrigatório", "Email válido é obrigatório"]
}
```

## 🔧 Classes Utilitárias

### Database (Singleton)

```php
require_once 'includes/Database.php';

$db = Database::getInstance();

// Preparar statement
$stmt = $db->prepare("SELECT * FROM churches WHERE slug = :slug");
$stmt->bindValue(':slug', $slug, PDO::PARAM_STR);
$stmt->execute();
$church = $stmt->fetch();

// Query simples
$results = $db->query("SELECT * FROM churches");

// Last insert ID
$lastId = $db->lastInsertId();
```

### TenantMiddleware

```php
require_once 'includes/TenantMiddleware.php';

// Identificar igreja atual
$church = TenantMiddleware::identify();

// Obter ID da igreja
$churchId = TenantMiddleware::getChurchId();

// Exigir igreja (lança erro se não existir)
try {
    $church = TenantMiddleware::requireChurch();
} catch (Exception $e) {
    http_response_code(404);
    echo json_encode(['error' => 'Igreja não encontrada']);
}
```

### RateLimiter

```php
require_once 'includes/RateLimiter.php';

$rateLimiter = new RateLimiter();
$ip = $_SERVER['REMOTE_ADDR'];

// Verificar limite (5 tentativas por hora)
if (!$rateLimiter->check('login_' . $ip, 5, 3600)) {
    die('Muitas tentativas. Tente novamente em 1 hora.');
}
```

## 🗄️ Banco de Dados

### Tabelas Principais

#### churches
```sql
CREATE TABLE churches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    theme_primary_color CHAR(7),
    theme_secondary_color CHAR(7),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ...
);
```

#### contact_messages
```sql
CREATE TABLE contact_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    church VARCHAR(255),
    church_size VARCHAR(50),
    subject VARCHAR(100),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔐 Segurança

### CORS (Cross-Origin Resource Sharing)

Todas as APIs incluem headers CORS para permitir acesso do frontend:

```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
```

### Rate Limiting

Implementado para prevenir abuso:

- **Contato:** 5 mensagens por hora por IP
- **Login:** 5 tentativas por hora por IP

### Prepared Statements

Todas as queries usam PDO prepared statements para prevenir SQL injection:

```php
$stmt = $db->prepare("SELECT * FROM churches WHERE slug = :slug");
$stmt->bindValue(':slug', $slug, PDO::PARAM_STR);
```

## 📝 Próximos Passos

### APIs para Implementar

- [ ] `POST /api/churches.php` - Criar nova igreja (cadastro)
- [ ] `POST /api/login.php` - Login de administrador
- [ ] `GET /api/pedidos.php` - Listar pedidos de oração
- [ ] `POST /api/pedidos.php` - Criar pedido de oração
- [ ] `PUT /api/churches.php` - Atualizar dados da igreja
- [ ] `POST /api/upload.php` - Upload de logo/imagens

### Funcionalidades para Implementar

- [ ] Envio de email via SMTP
- [ ] Integração com Telegram
- [ ] Autenticação JWT
- [ ] Upload de arquivos
- [ ] Validação de CNPJ
- [ ] Webhooks para notificações

## 📞 Suporte

Email: suporte@igrejaconnect.com.br
