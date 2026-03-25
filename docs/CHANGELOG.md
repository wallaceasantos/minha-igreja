# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-03-22

### 🎉 Transformação Multi-Tenant SaaS

#### Removido (Projeto Original Jesus Vitória Connect)
- **Páginas**: Historia, Lideranca, Calendario2026, Eventos, Agenda, AoVivo, AdminPedidos (antigo)
- **Assets específicos**: img_mulher.png, campanha.png, culto_campanha.jpg, cccjv.jpg
- **Serviços**: auth.service.ts, pedidos.service.ts, report.service.ts
- **Documentação antiga**: 19 arquivos específicos do projeto Jesus Vitória
- **Pasta coverage/**: Arquivos de teste gerados automaticamente

#### Alterado (Generalização)
- **index.html**: Meta tags generalizadas para plataforma SaaS
  - Título: "Igreja Connect - Plataforma Digital para Igrejas"
  - Descrição: Genérica para plataforma
  - Google Analytics: Agora configurável via `.env`
  - Open Graph: Informações genéricas da plataforma

- **vite.config.ts**: Proxy de API configurável
  - Antigo: `target: 'https://ccjv.com.br'`
  - Novo: `target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:8080'`

- **src/lib/api.ts**: Redes sociais removidas
  - Antigo: URLs hardcoded do Facebook, Instagram, YouTube
  - Novo: Strings vazias (serão carregadas dinamicamente por igreja)

- **src/lib/analytics.ts**: Google Analytics configurável
  - Antigo: ID `G-7R1T8R16RM` hardcoded
  - Novo: Usa `import.meta.env.VITE_GA_ID`

- **src/components/layout/Header.tsx**: Fallback genérico
  - Antigo: `'Comunidade Cristã Jesus é a Vitória'`
  - Novo: `'Minha Igreja'`

- **src/components/layout/Footer.tsx**: Fallbacks genéricos
  - Nome da igreja: `'Minha Igreja'`
  - Endereço: `'Endereço não informado'`

- **src/components/CookieConsent.tsx**: Texto generalizado
  - Removido: Nome específico da igreja
  - Texto: "Utilizamos cookies para melhorar sua experiência..."

- **src/pages/CreateChurch.tsx**: Placeholders genéricos
  - Nome: `"Ex: Primeira Igreja Batista"` (era "de Manaus")
  - Telefone: `"(00) 0000-0000"` (era "(92) 3232-0000")
  - Rua: `"Ex: Rua Principal"` (era "Avenida Tarumã")
  - Bairro: `"Centro"` (era "Praça 14")
  - Cidade: `"Sua Cidade"` (era "Manaus")

- **database/multi_tenant_schema.sql**: Dados de exemplo genéricos
  - Igreja: `'Igreja Exemplo'` (era "Comunidade Cristã Jesus é a Vitória")
  - Slug: `'igreja-exemplo'` (era "jesus-vitoria")
  - Endereço: Genérico (era específico de Manaus/AM)
  - Email: `'contato@igrejaexemplo.com.br'` (era "ccjv.com.br")
  - Redes sociais: Vazias (eram URLs específicas)

- **database/Database.php**: Nome do pacote e banco
  - Pacote: `@package Igreja_Connect` (era "Jesus_Vitoria_Connect")
  - Banco padrão: `'igreja_connect'` (era "jesus_vitoria")

- **lib/RateLimiter.php**: Nome do pacote
  - Pacote: `@package Igreja_Connect`

#### Adicionado (Nova Funcionalidade SaaS)
- **src/pages/**:
  - `LandingPage.tsx`: Página institucional da plataforma
  - `CreateChurch.tsx`: Formulário de cadastro de igrejas
  - `Home.tsx`: Home genérica para igrejas
  - `Sobre.tsx`: Página "Sobre Nós" genérica
  - `Contato.tsx`: Formulário de contato genérico
  - `PedidosOracao.tsx`: Pedidos de oração genérico
  - `Login.tsx`: Login administrativo genérico
  - `PoliticaPrivacidade.tsx`: Política de privacidade genérica
  - `admin/Dashboard.tsx`: Painel administrativo
  - `admin/Pedidos.tsx`: Gestão de pedidos de oração
  - `admin/Configuracoes.tsx`: Configurações da igreja

- **src/hooks/**:
  - `useChurch.ts`: Hook para carregar dados dinâmicos da igreja

- **api/**:
  - `criar-igreja.php`: API de cadastro de igrejas
  - `church/slug.php`: API para buscar dados da igreja

- **database/**:
  - `Database.php`: Classe singleton para conexão
  - `multi_tenant_schema.sql`: Schema completo multi-tenant

- **lib/**:
  - `TenantMiddleware.php`: Middleware para identificar igreja

- **Documentação**:
  - `README.md`: Documentação principal atualizada
  - `MULTI_TENANT_IMPLEMENTACAO.md`: Guia de implementação
  - `RESUMO_MULTI_TENANT.md`: Resumo da transformação
  - `.env.example`: Variáveis de ambiente atualizadas

### 🛠️ Technical Changes

#### Banco de Dados
- Tabela `churches`: Cadastro de igrejas multi-tenant
- Tabela `subscriptions`: Gestão de assinaturas e planos
- Tabelas modificadas: `usuarios_admin`, `pedidos`, `audit_logs` (adicionado `church_id`)
- Novas tabelas: `church_members`, `church_events`

#### Arquitetura
- **Multi-Tenant**: Isolamento completo de dados por igreja
- **Subdomínios**: Suporte a `igreja.igrejaconnect.com.br`
- **Domínio Próprio**: Estrutura pronta para `igreja.com.br`
- **Planos**: Free, Essential, Premium, Enterprise

#### Segurança
- Rate limiting no cadastro de igrejas
- Prepared statements (previne SQL injection)
- Senhas hasheadas com `password_hash()`
- Validação de slug única

---

## [1.0.0] - 2025-XX-XX

### Projeto Original: Jesus Vitória Connect

- Site institucional da Comunidade Cristã Jesus é a Vitória
- Pedidos de oração online
- Área administrativa
- Integração com YouTube Live
- Google Analytics 4
- Acessibilidade (VLibras)

---

## Notas de Migração

### Para Desenvolvedores

Se você estava acostumado com a estrutura antiga:

1. **Páginas removidas** → Use as novas páginas genéricas
2. **Dados hardcoded** → Agora são carregados dinamicamente via `useChurch()`
3. **API endpoints** → Agora suportam multi-tenant com `church_id`

### Para Usuários Finais

- O site agora é dinâmico e personalizável
- Cada igreja tem seus próprios dados isolados
- Cadastro de novas igrejas é automático e instantâneo

---

**Links**
- [README](README.md)
- [Documentação Multi-Tenant](MULTI_TENANT_IMPLEMENTACAO.md)
- [Resumo da Transformação](RESUMO_MULTI_TENANT.md)
