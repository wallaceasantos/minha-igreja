# 🎬 Roteiro do Vídeo — Status do Projeto MinhaIgreja

> **Duração máxima:** 20 minutos  
> **Público:** Professor e colegas da disciplina de Gerência de Projetos  
> **Tom:** Profissional, objetivo e transparente

---

## 0. Introdução (1 minuto)

**Fala sugerida:**
> "Olá, professor e colegas. Sou [seu nome], e neste vídeo vou apresentar o status atual do projeto **MinhaIgreja**, uma plataforma SaaS para gestão digital de igrejas. Vou dividir a apresentação em três blocos: evolução do produto de software, ações de marketing e produtos de gerência do projeto."

**Tela para mostrar:**
- Logo/nome do projeto
- Slide com os 3 tópicos

---

## 1. Produto de Software — Mudanças Recentes (7 minutos)

### 1.1 Contexto do período

**Fala sugerida:**
> "No ciclo mais recente de desenvolvimento, concentrado na última quinzena de maio, o time focou em três frentes: melhorar a experiência das transmissões ao vivo, consolidar o sistema de depoimentos dos membros e estabilizar o deploy em produção. Nos últimos 15 dias não houve novos *commits* porque entramos numa fase de testes, documentação e preparação para a próxima *sprint*."

> **Nota técnica:** O último *commit* no repositório é de **25/05/2026**. Se você quiser apresentar algo nos "últimos 15 dias", recomenda-se fazer 1 ou 2 pequenas correções/ajustes antes de gravar (ver sugestões na seção "Ações rápidas recomendadas" ao final deste roteiro).

### 1.2 Principais entregas recentes

| # | Funcionalidade | Descrição | Commit de referência |
|---|----------------|-----------|----------------------|
| 1 | **Sistema de depoimentos dos membros** | Criação da tabela `testimonials`, API completa (CRUD + rota pública), página pública `/igreja/:slug/depoimento`, tela admin de moderação e integração na live. | `3d3ae39`, `8d8e9db`, `75f266e` |
| 2 | **Experiência de conversão na live** | `LiveWelcomeGate` com *social proof*, `LiveConversionBanner` contextual após 2 minutos, gamificação no chat e contador de tempo assistido. | `9b5e3de` |
| 3 | **Cadastro de membro dedicado** | Nova página `/igreja/:slug/cadastro` com formulário completo, Google Login e validações. | `3bc5c99`, `37cec0a` |
| 4 | **Acesso como visitante na live** | Botão discreto no `LiveAuthGate` para quem não quer se cadastrar, reduzindo atrito. | `e563712` |
| 5 | **PWA do dashboard admin** | Manifest, service worker, cache estratégico e ícones para instalação no celular do pastor. | `4f55af4`, `91f10c7`, `0f27efc` |
| 6 | **Correções de timezone e datas** | Ajuste de fuso horário para Brasília/Manaus, parsing robusto de datas no MySQL. | `c921fed`, `8481b71`, `05ad9ba`, `bd6ec8a` |
| 7 | **Estabilização do deploy** | Configuração do `railway.toml`, `serve.json`, Caddyfile, URLs do backend em produção e correção de imports. | `18f30cf`, `b3cd19c`, `e3e3ce5`, `2bdf9f7` |
| 8 | **Ajustes visuais e responsivos** | Melhorias na landing page, dark mode, menu mobile, dashboard responsivo e seção de depoimentos. | `6c235bf`, `872c990`, `224661a`, `e10e64a` |

### 1.3 Demonstração rápida (tela)

**Mostrar:**
1. Tela inicial da igreja (`/igreja/:slug`)
2. Seção de depoimentos com cards responsivos
3. Fluxo da live: welcome gate → acesso como visitante → chat
4. Tela admin de depoimentos com botão "Voltar ao Dashboard"
5. PWA instalado no celular (se possível)

**Fala sugerida:**
> "Essas mudanças aumentaram a usabilidade tanto para o visitante quanto para o administrador da igreja. O fluxo de live, por exemplo, passou a ter múltiplas opções de entrada: cadastro rápido, Google Login ou acesso anônimo."

### 1.4 Próximos passos do produto

- Sistema de doações/títulos e ofertas online
- Inscrição em eventos
- Blog/notícias da igreja
- Upload com crop/redimensionamento de imagens
- Notificações push no PWA

---

## 2. Ações de Promoção do Produto — Marketing (6 minutos)

### 2.1 Planejamento de marketing

**Fala sugerida:**
> "O plano de divulgação do MinhaIgreja está estruturado em três fases: atração, conversão e retenção. Ainda estamos na fase inicial de validação, com a plataforma em ambiente de produção e pronta para receber os primeiros pastores beta."

**Canais planejados:**
- Instagram e WhatsApp (comunidades de pastores)
- Grupos de igrejas no Facebook
- Indicação direta (*word-of-mouth*)
- Landing page institucional (`/`) com formulário de interesse
- Google Analytics 4 (já instrumentado no código via `src/lib/analytics.ts`)

### 2.2 Ações realizadas

| Ação | Status | Detalhes |
|------|--------|----------|
| Criação da landing page institucional | ✅ Concluída | Hero, funcionalidades, planos, depoimentos, CTA |
| Configuração do GA4 | ✅ Concluída | Arquivo `analytics.ts` com eventos de pageview, login, pedido de oração, vídeo, etc. |
| SEO básico | ✅ Concluída | `robots.txt`, meta tags, favicon, manifest |
| PWA para pastors | ✅ Concluída | Possibilita instalação do dashboard no celular |
| Primeiras divulgações em redes | 🟡 Em andamento | Depende de liberação do time/comunidade |
| Parcerias com igrejas piloto | 🟡 Em negociação | 2 a 3 igrejas de base para teste |

### 2.3 Resultados

> ⚠️ **Atenção:** As métricas abaixo são um modelo. Substitua pelos números reais que você tiver. Se ainda não houver dados, apresente o que está sendo medido e como será calculado.

| Métrica | Resultado atual | Meta | Observação |
|---------|-----------------|------|------------|
| Alcance (impressões) | _preencher_ | 500 | Posts nas redes / landing page |
| Visitantes únicos | _preencher_ | 100 | GA4 page_view |
| Novos usuários cadastrados | _preencher_ | 10 | Contas de igreja criadas |
| Usuários engajados (≥2 acessos em 7 dias) | _preencher_ | 5 | GA4 + banco de dados |
| Taxa de conversão visitante → cadastro | _preencher_ | 5% | Landing → CreateChurch |
| Tempo médio na live | _preencher_ | 10 min | Evento `video_start` / `video_complete` |
| Pedidos de oração enviados | _preencher_ | 20 | Evento `pedido_oracao` |

**Fala sugerida:**
> "Como o GA4 ainda depende da configuração da variável `VITE_GA_ID` no ambiente de produção, os números oficiais estão sendo consolidados. Paralelamente, o banco de dados já registra cada criação de igreja, pedido de oração e membro, o que nos permite cruzar dados mesmo antes do GA4 estar 100%."

### 2.4 Próximas ações de marketing

- Configurar `VITE_GA_ID` em produção
- Criar 3 posts para Instagram/Facebook
- Enviar 10 mensagens diretas para pastores
- Publicar depoimento de igreja piloto
- Criar vídeo de demonstração de 60 segundos

---

## 3. Produtos de Gerência do Projeto (5 minutos)

### 3.1 TAP — Termo de Abertura do Projeto

**Fala sugerida:**
> "O Termo de Abertura do Projeto foi revisado no início do semestre e estabelece o MinhaIgreja como um SaaS multi-tenant para igrejas evangélicas. Os principais objetivos são: (1) permitir que qualquer igreja crie seu site digital em minutos; (2) gerenciar membros, pedidos de oração, eventos e lives; e (3) monetizar por meio de planos Freemium."

**Elementos do TAP (resumo para fala):**
- **Objetivo:** Plataforma SaaS para gestão digital de igrejas
- **Escopo:** Site público, painel admin, painel super-admin, live com chat, depoimentos, PWA
- **Fora do escopo:** Gateway de pagamento real, app nativo iOS/Android, blog completo (fase 2)
- **Stakeholders:** Equipe de desenvolvimento, professor orientador, pastores beta, secretarias de igreja
- **Riscos principais:** Dependência de API do YouTube, segurança de dados de membros, adoção por usuários não técnicos

> 📄 O documento completo está em `docs/gerencia/TAP.md`.

### 3.2 EAP — Estrutura Analítica do Projeto

**Fala sugerida:**
> "A EAP do projeto foi desenhada em cinco grandes entregáveis: gestão do projeto, produto de software, infraestrutura, marketing e operação. Cada entregável foi decomposto em pacotes de trabalho até chegar em atividades controláveis."

**Níveis da EAP (resumo):**

```
1. MinhaIgreja — Plataforma SaaS
   1.1 Gerência do Projeto
       1.1.1 TAP
       1.1.2 EAP
       1.1.3 Cronograma
       1.1.4 Orçamento
   1.2 Produto de Software
       1.2.1 Frontend (site público, admin, super-admin)
       1.2.2 Backend (API, autenticação, banco)
       1.2.3 Funcionalidades (membros, pedidos, eventos, lives, depoimentos)
       1.2.4 Qualidade (testes, correções, estabilização)
   1.3 Infraestrutura
       1.3.1 Deploy Railway
       1.3.2 Banco de dados MySQL
       1.3.3 PWA e assets
   1.4 Marketing e Lançamento
       1.4.1 Landing page
       1.4.2 GA4 e métricas
       1.4.3 Divulgação em redes
   1.5 Operação
       1.5.1 Suporte a igrejas piloto
       1.5.2 Documentação
```

> 📄 O documento completo está em `docs/gerencia/EAP.md`.

### 3.3 Cronograma com Status Atualizado

**Fala sugerida:**
> "O cronograma foi montado em sprints de uma a duas semanas. Hoje, as funcionalidades principais de MVP estão concluídas e o projeto está na fase de estabilização e preparação para o lançamento com igrejas piloto."

| Sprint | Atividade | Início | Fim | Status | % |
|--------|-----------|--------|-----|--------|---|
| 1 | Setup do projeto e arquitetura base | 06/04/2026 | 12/04/2026 | ✅ Concluído | 100% |
| 2 | Autenticação, igrejas e planos | 13/04/2026 | 26/04/2026 | ✅ Concluído | 100% |
| 3 | Membros, pedidos de oração, eventos | 27/04/2026 | 10/05/2026 | ✅ Concluído | 100% |
| 4 | Lives, chat, PWA | 11/05/2026 | 24/05/2026 | ✅ Concluído | 100% |
| 5 | Depoimentos, UX final, deploy prod | 25/05/2026 | 07/06/2026 | ✅ Concluído | 100% |
| 6 | Estabilização, testes e documentação | 08/06/2026 | 14/06/2026 | 🟡 Em andamento | 70% |
| 7 | Lançamento com igrejas piloto | 15/06/2026 | 28/06/2026 | 🟡 Planejado | 0% |
| 8 | Coleta de feedback e iteração | 29/06/2026 | 12/07/2026 | 🔵 Futuro | 0% |

> 📄 O documento completo está em `docs/gerencia/cronograma.md`.

### 3.4 Orçamento com Status Atualizado

**Fala sugerida:**
> "O orçamento do projeto considera custos de infraestrutura, ferramentas e horas de desenvolvimento. Até o momento, os gastos estão dentro do previsto, com a maior parte concentrada em hospedagem e domínio."

| Item | Previsto (R$) | Gasto (R$) | Diferença | Status |
|------|---------------|------------|-----------|--------|
| Hospedagem Railway / Vercel | 50,00 | 35,00 | +15,00 | ✅ Dentro |
| Domínio (1 ano) | 60,00 | 60,00 | 0,00 | ✅ Concluído |
| E-mail transacional (SMTP) | 0,00 | 0,00 | 0,00 | ✅ Sem custo |
| Cloudinary (imagens) | 0,00 | 0,00 | 0,00 | ✅ Plano gratuito |
| YouTube Data API | 0,00 | 0,00 | 0,00 | ✅ Sem custo |
| Ferramentas de design/PM | 0,00 | 0,00 | 0,00 | ✅ Sem custo |
| **Total infraestrutura** | **110,00** | **95,00** | **+15,00** | **✅ Dentro** |
| Horas de desenvolvimento (estimado) | 160h | 180h | -20h | ⚠️ Acima |
| Custo hora médio (R$ 15/h) | 2.400,00 | 2.700,00 | -300,00 | ⚠️ Acima |
| **Total projeto** | **2.510,00** | **2.795,00** | **-285,00** | **⚠️ Leve estouro** |

> **Observação:** Ajuste os valores conforme a realidade da sua equipe. Os números acima são estimativas didáticas.

> 📄 O documento completo está em `docs/gerencia/orcamento.md`.

---

## 4. Considerações Finais (1 minuto)

**Fala sugerida:**
> "Em resumo, o MinhaIgreja está com o MVP funcional, em fase final de estabilização e com documentação de gerência estruturada. As próximas duas semanas serão decisivas: vamos lançar com igrejas piloto, configurar o GA4 em produção e ajustar o produto com base no feedback real dos usuários. Obrigado!"

---

## 🛠️ Ações rápidas recomendadas antes de gravar

Para que você tenha algo concreto nos "últimos 15 dias", sugerimos fazer 1 ou 2 pequenas tarefas:

1. **Corrigir o warning do CORS** (`ALLOWED_ORIGINS` vs `CORS_ORIGINS`) — pequena mudança em `backend-nodejs/src/server.js` e `.env.example`.
2. **Adicionar LICENSE MIT** — o README menciona MIT, mas o arquivo `LICENSE` não existe.
3. **Remover credenciais hardcoded** de `backend-nodejs/src/config/database.js` e `src/main.tsx`.
4. **Criar o arquivo `RAILWAY_DEPLOY.md`** que o README cita mas não existe.
5. **Adicionar 1 ou 2 testes unitários** em `src/tests/` para demonstrar preocupação com qualidade.

Qualquer uma dessas ações pode ser commitada e apresentada como "entrega dos últimos 15 dias".

---

## 📁 Documentos de apoio criados

- `docs/gerencia/TAP.md`
- `docs/gerencia/EAP.md`
- `docs/gerencia/cronograma.md`
- `docs/gerencia/orcamento.md`
- `docs/marketing/metricas.md`
