# Estrutura Analítica do Projeto (EAP)

## MinhaIgreja — Plataforma SaaS para Gestão Digital de Igrejas

---

## Estrutura hierárquica

```
1. MinhaIgreja — Plataforma SaaS
│
├── 1.1 Gerência do Projeto
│   ├── 1.1.1 Termo de Abertura do Projeto (TAP)
│   ├── 1.1.2 Estrutura Analítica do Projeto (EAP)
│   ├── 1.1.3 Cronograma e controle de prazos
│   ├── 1.1.4 Orçamento e controle de custos
│   ├── 1.1.5 Gestão de riscos
│   ├── 1.1.6 Acompanhamento e relatórios de status
│   └── 1.1.7 Fechamento do projeto
│
├── 1.2 Produto de Software — Frontend
│   ├── 1.2.1 Setup e configuração
│   │   ├── 1.2.1.1 Configuração do Vite + React + TypeScript
│   │   ├── 1.2.1.2 Configuração do TailwindCSS e shadcn/ui
│   │   ├── 1.2.1.3 Configuração do ESLint e TypeScript
│   │   └── 1.2.1.4 Configuração do PWA (manifest + service worker)
│   ├── 1.2.2 Site público da igreja
│   │   ├── 1.2.2.1 Página inicial (Hero, Sobre, Contato)
│   │   ├── 1.2.2.2 Seção de ministérios
│   │   ├── 1.2.2.3 Seção de eventos e cultos
│   │   ├── 1.2.2.4 Seção de depoimentos
│   │   ├── 1.2.2.5 Galeria de fotos
│   │   ├── 1.2.2.6 Pedido de oração público
│   │   ├── 1.2.2.7 Página de transmissão ao vivo
│   │   └── 1.2.2.8 Página de cadastro de membro
│   ├── 1.2.3 Painel administrativo da igreja
│   │   ├── 1.2.3.1 Dashboard com estatísticas
│   │   ├── 1.2.3.2 Gestão de membros
│   │   ├── 1.2.3.3 Gestão de pedidos de oração
│   │   ├── 1.2.3.4 Gestão de eventos e cultos
│   │   ├── 1.2.3.5 Gestão de ministérios
│   │   ├── 1.2.3.6 Gestão de galeria
│   │   ├── 1.2.3.7 Gestão de lives
│   │   ├── 1.2.3.8 Gestão de depoimentos
│   │   ├── 1.2.3.9 Configurações da igreja
│   │   └── 1.2.3.10 Upgrade de plano
│   └── 1.2.4 Painel super-admin
│       ├── 1.2.4.1 Dashboard geral da plataforma
│       ├── 1.2.4.2 Gestão de igrejas
│       ├── 1.2.4.3 Gestão de usuários
│       ├── 1.2.4.4 Gestão de planos
│       ├── 1.2.4.5 Faturas e pagamentos
│       ├── 1.2.4.6 Comunicados
│       ├── 1.2.4.7 Logs de auditoria
│       └── 1.2.4.8 Configurações do sistema
│
├── 1.3 Produto de Software — Backend
│   ├── 1.3.1 Setup e configuração
│   │   ├── 1.3.1.1 Configuração do Express
│   │   ├── 1.3.1.2 Configuração do pool MySQL
│   │   ├── 1.3.1.3 Configuração de CORS
│   │   └── 1.3.1.4 Configuração de WebSocket (Socket.IO)
│   ├── 1.3.2 Autenticação e segurança
│   │   ├── 1.3.2.1 Login com JWT
│   │   ├── 1.3.2.2 Cadastro de administradores
│   │   ├── 1.3.2.3 Google OAuth
│   │   ├── 1.3.2.4 Rate limiting e bloqueio de IP
│   │   ├── 1.3.2.5 Logs de auditoria
│   │   └── 1.3.2.6 Middleware de permissões
│   ├── 1.3.3 APIs REST
│   │   ├── 1.3.3.1 API de igrejas
│   │   ├── 1.3.3.2 API de membros
│   │   ├── 1.3.3.3 API de pedidos de oração
│   │   ├── 1.3.3.4 API de eventos e cultos
│   │   ├── 1.3.3.5 API de ministérios
│   │   ├── 1.3.3.6 API de lives
│   │   ├── 1.3.3.7 API de depoimentos
│   │   ├── 1.3.3.8 API de galeria
│   │   ├── 1.3.3.9 API de upload
│   │   ├── 1.3.3.10 API de assinaturas
│   │   └── 1.3.3.11 API de suporte/tickets
│   ├── 1.3.4 Banco de dados
│   │   ├── 1.3.4.1 Modelagem inicial
│   │   ├── 1.3.4.2 Migrations
│   │   └── 1.3.4.3 Seeds de teste
│   └── 1.3.5 Schedulers e automações
│       ├── 1.3.5.1 Trial scheduler
│       ├── 1.3.5.2 Billing scheduler
│       ├── 1.3.5.3 Live status checker
│       ├── 1.3.5.4 Prayer reminder scheduler
│       └── 1.3.5.5 Domain DNS checker
│
├── 1.4 Infraestrutura e Deploy
│   ├── 1.4.1 Ambiente de desenvolvimento
│   ├── 1.4.2 Ambiente de produção (Railway)
│   ├── 1.4.3 Configuração de variáveis de ambiente
│   ├── 1.4.4 Configuração de domínio personalizado
│   ├── 1.4.5 Configuração de CDN para imagens (Cloudinary)
│   └── 1.4.6 Monitoramento básico (healthcheck)
│
├── 1.5 Marketing e Lançamento
│   ├── 1.5.1 Landing page institucional
│   ├── 1.5.2 Configuração do Google Analytics 4
│   ├── 1.5.3 SEO e meta tags
│   ├── 1.5.4 Redes sociais (Instagram, Facebook, WhatsApp)
│   ├── 1.5.5 Vídeo de demonstração
│   └── 1.5.6 Recrutamento de igrejas piloto
│
└── 1.6 Operação e Suporte
    ├── 1.6.1 Documentação do usuário
    ├── 1.6.2 Documentação técnica
    ├── 1.6.3 Suporte a igrejas piloto
    ├── 1.6.4 Coleta de feedback
    └── 1.6.5 Roadmap pós-MVP
```

---

## Dicionário da EAP

| Código | Nome | Descrição | Responsável |
|--------|------|-----------|-------------|
| 1.1 | Gerência do Projeto | Atividades de planejamento, controle e fechamento | Gerente |
| 1.2 | Produto de Software — Frontend | Interface web do produto | Desenvolvedor frontend |
| 1.3 | Produto de Software — Backend | API, banco e regras de negócio | Desenvolvedor backend |
| 1.4 | Infraestrutura e Deploy | Ambientes, hospedagem e configurações | DevOps |
| 1.5 | Marketing e Lançamento | Divulgação e aquisição de usuários | Marketing |
| 1.6 | Operação e Suporte | Atendimento, documentação e evolução | Suporte |

---

## Legenda de status

| Status | Significado |
|--------|-------------|
| ✅ | Concluído |
| 🟡 | Em andamento |
| 🔵 | Planejado |
| 🔴 | Atrasado/Bloqueado |
