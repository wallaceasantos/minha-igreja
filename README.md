# ⛪ Igreja Connect

> **Plataforma SaaS Multi-Tenant para Igrejas**

[![Status do Projeto](https://img.shields.io/badge/status-produção-success)]()
[![Versão](https://img.shields.io/badge/versão-2.0.0-blue)]()
[![React](https://img.shields.io/badge/React-18.3.1-61dafb?logo=react)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178c6?logo=typescript)]()

---

## 📖 Sobre o Projeto

O **Igreja Connect** é uma plataforma SaaS que permite que qualquer igreja tenha um site profissional em minutos. Cada igreja possui seu próprio subdomínio (ex: `igreja.igrejaconnect.com.br`) com dados completamente isolados e personalizáveis.

### Funcionalidades

- ✅ **Multi-Tenant** - Múltiplas igrejas na mesma plataforma
- ✅ **Subdomínios Automáticos** - Cada igreja com seu próprio URL
- ✅ **Site Personalizável** - Cores, logo e conteúdo dinâmico
- ✅ **Pedidos de Oração** - Formulário online para membros
- ✅ **Painel Administrativo** - Gestão completa para cada igreja
- ✅ **Planos Flexíveis** - Free, Essential, Premium e Enterprise

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- npm ou bun
- PHP 8.3+ (backend)
- MySQL 5.7+ (banco de dados)

### Desenvolvimento

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local

# 3. Executar script do banco de dados
mysql -u root -p igreja_connect < database/multi_tenant_schema.sql

# 4. Iniciar servidor de desenvolvimento
npm run dev

# 5. Acessar http://localhost:5173
```

### Build de Produção

```bash
npm run build
```

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    IGREJA CONNECT PLATFORM                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🌐 Frontend (React + TypeScript)                           │
│     ├── Landing Page Institucional                          │
│     ├── Cadastro de Igrejas                                 │
│     └── Sites Dinâmicos por Igreja                          │
│                                                             │
│  🔧 Subdomínios:                                            │
│     ├── igreja1.igrejaconnect.com.br                        │
│     ├── igreja2.igrejaconnect.com.br                        │
│     └── ... (ilimitado)                                     │
│                                                             │
│  🗄️ Backend (PHP + MySQL)                                   │
│     ├── Tenant Middleware                                   │
│     ├── APIs RESTful                                        │
│     └── Isolamento por church_id                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes UI reutilizáveis
│   └── layout/          # Header, Footer, Layout
├── hooks/               # React Hooks
│   └── useChurch.ts     # Hook para dados da igreja
├── pages/               # Páginas da aplicação
│   ├── LandingPage.tsx  # Home institucional
│   ├── CreateChurch.tsx # Cadastro de igrejas
│   ├── Home.tsx         # Home genérica da igreja
│   ├── Sobre.tsx        # Sobre a igreja
│   ├── Contato.tsx      # Contato
│   ├── PedidosOracao.tsx# Pedidos de oração
│   ├── Login.tsx        # Login admin
│   └── admin/           # Painel administrativo
├── services/            # Serviços de API
└── lib/                 # Utilitários

api/                     # Backend PHP
├── criar-igreja.php     # Cadastro de igrejas
├── church/
│   └── slug.php         # Dados da igreja
└── ...

database/
├── Database.php         # Classe de conexão
└── multi_tenant_schema.sql
```

---

## 💾 Banco de Dados

### Tabelas Principais

**churches** - Dados das igrejas
- `id`, `name`, `slug`
- `logo_url`, `theme_colors`
- `address_*`, `phone`, `email`
- `plan_type`, `is_active`

**subscriptions** - Assinaturas e planos
- `church_id`, `plan_type`, `status`
- `stripe_*`, `current_period_*`

**usuarios_admin** - Administradores por igreja
- `church_id`, `name`, `email`, `password`
- `role`, `permissions`

**pedidos** - Pedidos de oração
- `church_id`, `title`, `description`
- `status`, `created_at`

---

## 💰 Planos

| Plano | Preço | Membros | Recursos |
|-------|-------|---------|----------|
| **Free** | R$ 0 | 100 | Site básico, 50 pedidos/mês |
| **Essential** | R$ 29,90 | 500 | Domínio próprio, pedidos ∞ |
| **Premium** | R$ 79,90 | 2.000 | App mobile, dízimos |
| **Enterprise** | R$ 199,90 | ∞ | API, multi-unidades |

---

## 🎯 Como Funciona

### 1. Cadastro de Igreja

```
Pastor → igrejaconnect.com.br/criar
       → Preenche formulário
       → Sistema cria:
           - Registro no banco
           - Subdomínio: igreja.igrejaconnect.com.br
           - Usuário admin
           - Plano Free (trial 30 dias)
```

### 2. Acesso ao Site

```
Visitante → igreja.igrejaconnect.com.br
          → Site carrega com:
              - Logo da igreja
              - Cores personalizadas
              - Endereço e horários
              - Formulário de contato
```

### 3. Isolamento de Dados

```sql
-- Cada igreja vê APENAS seus dados
SELECT * FROM pedidos WHERE church_id = 123;
```

---

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# .env.local
VITE_API_URL=https://api.igrejaconnect.com.br
DB_HOST=localhost
DB_NAME=igreja_connect
DB_USER=root
DB_PASS=sua_senha
```

### Servidor Web (Nginx)

```nginx
server {
    server_name .igrejaconnect.com.br;
    root /var/www/igrejaconnect/public;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

### SSL Wildcard

```bash
# Certificado para todos os subdomínios
sudo certbot --nginx -d igrejaconnect.com.br -d *.igrejaconnect.com.br
```

---

## 📚 Documentação

- [MULTI_TENANT_IMPLEMENTACAO.md](./MULTI_TENANT_IMPLEMENTACAO.md) - Guia completo de implementação
- [RESUMO_MULTI_TENANT.md](./RESUMO_MULTI_TENANT.md) - Resumo da transformação

---

## 🛠️ Tecnologias

| Frontend | Backend | Infra |
|----------|---------|-------|
| React 18 | PHP 8.3 | Nginx |
| TypeScript | MySQL 5.7+ | Let's Encrypt |
| Tailwind CSS | PDO | Certbot |
| shadcn/ui | Rate Limiter | VPS |
| TanStack Query | | |

---

## 🚀 Roadmap

### Fase 1: ✅ Base Multi-Tenant

- [x] Estrutura do banco de dados
- [x] Middleware de identificação
- [x] API de cadastro
- [x] Hook useChurch()
- [x] Componentes dinâmicos
- [x] Landing page

### Fase 2: Pagamentos

- [ ] Integração Stripe/Mercado Pago
- [ ] Gestão de assinaturas
- [ ] Webhooks de cancelamento
- [ ] Inadimplência automática

### Fase 3: Recursos Avançados

- [ ] Upload de logo
- [ ] App mobile white-label
- [ ] Dízimos e ofertas
- [ ] WhatsApp integration
- [ ] CRM pastoral

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit (`git commit -m 'Adiciona nova feature'`)
4. Push (`git push origin feature/nova-feature`)
5. Pull Request

---

## 📞 Suporte

- **Email:** suporte@igrejaconnect.com.br
- **Docs:** https://igrejaconnect.com.br/docs

---

## 📄 License

MIT - ver arquivo [LICENSE](LICENSE)

---

**Criado com ❤️ para transformar igrejas no Brasil**
