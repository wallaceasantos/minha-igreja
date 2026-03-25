# 🚀 IGREJA CONNECT - Plataforma Multi-Tenant

> **Status da Implementação:** ✅ Estrutura Base Completa

---

## 📋 Visão Geral

O **Igreja Connect** é uma plataforma SaaS multi-tenant que permite que qualquer igreja tenha um site profissional em minutos, usando subdomínios ou domínios próprios.

### Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    IGREJA CONNECT PLATFORM                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🌐 Frontend Único (React + TypeScript)                     │
│     └── Carrega configurações dinâmicas por igreja          │
│                                                             │
│  🔧 Subdomínios Automáticos:                                │
│     ├── igreja1.igrejaconnect.com.br                        │
│     ├── igreja2.igrejaconnect.com.br                        │
│     └── ... (ilimitado)                                     │
│                                                             │
│  🗄️ Banco de Dados Multi-Tenant:                            │
│     ├── churches (dados da igreja)                          │
│     ├── users (usuários por igreja)                         │
│     ├── pedidos (pedidos isolados por church_id)            │
│     └── ... (todas tabelas com church_id)                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Arquivos Criados

### Backend (PHP)

```
api/
├── criar-igreja.php          # API de cadastro de igrejas
└── church/
    └── slug.php              # API para buscar igreja por slug

database/
├── Database.php              # Classe singleton para DB
└── multi_tenant_schema.sql   # Script completo do banco

lib/
└── TenantMiddleware.php      # Middleware para identificar igreja
```

### Frontend (React)

```
src/
├── hooks/
│   └── useChurch.ts          # Hook para dados dinâmicos da igreja
│
├── pages/
│   ├── LandingPage.tsx       # Landing page institucional
│   └── CreateChurch.tsx      # Formulário de cadastro
│
├── components/layout/
│   ├── Header.tsx            # Modificado para dados dinâmicos
│   └── Footer.tsx            # Modificado para dados dinâmicos
│
└── App.tsx                   # Rotas atualizadas
```

---

## 🏗️ Como Funciona

### 1. Fluxo de Cadastro

```
1. Pastor acessa: https://igrejaconnect.com.br/criar
2. Preenche formulário com:
   - Nome da igreja
   - Subdomínio (ex: primeira-batista)
   - Dados da igreja
   - Dados do administrador
3. Clica em "Criar Minha Igreja"
4. Backend:
   - Valida dados
   - Verifica disponibilidade do subdomínio
   - Cria registro em `churches`
   - Cria usuário admin
   - Cria assinatura (trial 30 dias)
5. Redireciona para: https://primeira-batista.igrejaconnect.com.br
```

### 2. Identificação da Igreja (Tenant)

```php
// Em qualquer página do site da igreja:

use TenantMiddleware;

// Identifica automaticamente pelo subdomínio
$church = TenantMiddleware::identify();
// Retorna: ['id' => 123, 'name' => 'Primeira Igreja', ...]

// Ou usa o hook React no frontend:
const { church, loading } = useChurch();
```

### 3. Isolamento de Dados

```sql
-- TODAS as queries incluem church_id
SELECT * FROM pedidos WHERE church_id = 123;
SELECT * FROM church_members WHERE church_id = 123;

-- Igreja A nunca vê dados da Igreja B
```

---

## 💾 Banco de Dados

### Tabela `churches`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | INT | ID único da igreja |
| name | VARCHAR(255) | Nome da igreja |
| slug | VARCHAR(100) | Subdomínio (URL amigável) |
| cnpj | VARCHAR(18) | CNPJ |
| logo_url | VARCHAR(500) | URL da logo |
| address_* | VARCHAR | Campos de endereço |
| phone | VARCHAR(20) | Telefone |
| whatsapp | VARCHAR(20) | WhatsApp |
| email | VARCHAR(100) | Email |
| theme_primary_color | CHAR(7) | Cor primária (hex) |
| theme_secondary_color | CHAR(7) | Cor secundária |
| custom_domain | VARCHAR(255) | Domínio próprio (opcional) |
| plan_type | ENUM | free, essential, premium, enterprise |
| is_active | BOOLEAN | Status da igreja |

### Tabela `subscriptions`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | INT | ID da assinatura |
| church_id | INT | Vínculo com a igreja |
| plan_type | ENUM | Tipo de plano |
| status | ENUM | active, inactive, cancelled, etc |
| stripe_* | VARCHAR | Dados do Stripe |
| current_period_end | DATE | Fim do período |

### Tabelas com `church_id`

- `usuarios_admin` - Admins por igreja
- `pedidos` - Pedidos de oração por igreja
- `audit_logs` - Logs de auditoria por igreja
- `church_members` - Membros da igreja
- `church_events` - Eventos da igreja

---

## 🎨 Frontend Multi-Tenant

### Hook `useChurch()`

```typescript
// Em qualquer componente:
import { useChurch } from '@/hooks/useChurch';

function Header() {
  const { church, loading, error } = useChurch();
  
  if (loading) return <Loading />;
  if (error) return <Error />;
  
  return (
    <header>
      <img src={church?.logo_url} alt={church?.name} />
      <h1>{church?.name}</h1>
    </header>
  );
}
```

### Cores Dinâmicas

```typescript
// O hook aplica automaticamente as cores no CSS
document.documentElement.style.setProperty('--theme-primary', church.theme_primary_color);
document.documentElement.style.setProperty('--theme-secondary', church.theme_secondary_color);
```

---

## 🔧 Configuração

### 1. Banco de Dados

```bash
# Executar script SQL
mysql -u root -p jesus_vitoria < database/multi_tenant_schema.sql
```

### 2. Variáveis de Ambiente

```bash
# Copiar .env.example para .env.local
cp .env.example .env.local

# Editar com seus dados:
VITE_API_URL=https://api.igrejaconnect.com.br
DB_HOST=localhost
DB_NAME=igreja_connect
DB_USER=root
DB_PASS=sua_senha
```

### 3. Servidor Web (Nginx)

```nginx
server {
    listen 80;
    listen 443 ssl;
    
    # ACEITA QUALQUER SUBDOMÍNIO
    server_name .igrejaconnect.com.br .igrejaconnect.com;
    
    root /var/www/igrejaconnect/public;
    index index.php index.html;
    
    # SSL Wildcard
    ssl_certificate /etc/letsencrypt/live/igrejaconnect.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/igrejaconnect.com.br/privkey.pem;
    
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

### 4. SSL Wildcard

```bash
# Certificado para todos os subdomínios
sudo certbot --nginx -d igrejaconnect.com.br -d *.igrejaconnect.com.br
```

---

## 📊 Planos e Limites

| Plano | Preço | Membros | Pedidos | Admins | Recursos |
|-------|-------|---------|---------|--------|----------|
| **Free** | R$ 0 | 100 | 50/mês | 1 | Site básico |
| **Essential** | R$ 29,90 | 500 | Ilimitado | 5 | Domínio próprio |
| **Premium** | R$ 79,90 | 2.000 | Ilimitado | 15 | App mobile, Dízimos |
| **Enterprise** | R$ 199,90 | ∞ | Ilimitado | ∞ | API, Multi-unidades |

---

## 🚀 Próximos Passos

### Fase 1: ✅ Completa

- [x] Estrutura do banco de dados
- [x] Middleware de identificação
- [x] API de cadastro
- [x] Hook React useChurch()
- [x] Componentes dinâmicos (Header, Footer)
- [x] Landing page institucional
- [x] Formulário de cadastro

### Fase 2: Pendente

- [ ] Painel Super Admin (gerenciar igrejas)
- [ ] Integração com pagamentos (Stripe/Mercado Pago)
- [ ] Upload de logo no cadastro
- [ ] Email de boas-vindas automático
- [ ] Verificação de domínio personalizado
- [ ] Dashboard por igreja

### Fase 3: Avançado

- [ ] App mobile white-label
- [ ] Módulo de dízimos e ofertas
- [ ] WhatsApp integration
- [ ] CRM pastoral
- [ ] Escola bíblica online

---

## 🔐 Segurança

### Isolamento de Dados

```php
// TODAS as queries devem incluir church_id
$sql = "SELECT * FROM pedidos WHERE church_id = :church_id";
```

### Validações

- Rate limiting no cadastro (3 por hora)
- Validação de slug (apenas letras minúsculas, números, hífens)
- Senhas hasheadas com `password_hash()`
- Prepared statements (previne SQL injection)

### HTTPS Obrigatório

```php
// Forçar HTTPS em produção
if ($_SERVER['HTTP_X_FORWARDED_PROTO'] !== 'https') {
    header('Location: https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
    exit;
}
```

---

## 📝 Exemplo de Uso

### Criar Nova Igreja (Programaticamente)

```typescript
const response = await fetch('/api/criar-igreja.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Primeira Igreja Batista',
    slug: 'primeira-batista',
    email: 'contato@igreja.com.br',
    admin: {
      name: 'Pastor João',
      email: 'pastor@igreja.com.br',
      password: 'senha123'
    }
  })
});

const data = await response.json();
// { success: true, data: { church_id: 123, slug: 'primeira-batista', ... } }
```

### Acessar Dados da Igreja (Frontend)

```typescript
import { useChurch } from '@/hooks/useChurch';

function MinhaPagina() {
  const { church, loading } = useChurch();
  
  if (loading) return <div>Carregando...</div>;
  
  return (
    <div>
      <h1>{church?.name}</h1>
      <p>{church?.description}</p>
      <img src={church?.logo_url} alt={church?.name} />
    </div>
  );
}
```

---

## 🆘 Suporte

### Problemas Comuns

**1. Igreja não carrega**
- Verificar se `is_active = TRUE` no banco
- Verificar se slug está correto
- Verificar DNS do subdomínio

**2. Erro ao criar igreja**
- Verificar rate limiting (máx 3/hora)
- Verificar se slug já existe
- Verificar logs de erro

**3. Cores não aplicam**
- Verificar se hook useChurch() foi chamado
- Verificar se cores estão em formato hex (#1e40af)

---

## 📞 Contato

- **Email:** suporte@igrejaconnect.com.br
- **Documentação:** https://igrejaconnect.com.br/docs

---

**Criado com ❤️ para transformar igrejas no Brasil**
