# Termo de Abertura do Projeto (TAP)

## MINHA IGREJA — Plataforma Multi-Tenant para Gestão de Igrejas

> **Documento original:** `docs/TERMO DE ABERTURA DO PROJETO MINHA IGREJA.docx`  
> **Versão:** 1.2 (atualizada em 12/06/2026)  
> **Autor:** Wallace Almeida dos Santos  
> **Histórico de revisões:**

| Data | Versão | Descrição | Autor |
|------|--------|-----------|-------|
| 05/04/2026 | 1.0 | Criação do Termo de Abertura do Projeto | Wallace Almeida dos Santos |
| 05/04/2026 | 1.1 | Confirmação de 2 planos (Free e Essencial) e exclusão de app mobile | Wallace Almeida dos Santos |
| 12/06/2026 | 1.2 | Atualização de status do projeto: funcionalidades implementadas, backlog revisado, cronograma e infraestrutura ajustados | Wallace Almeida dos Santos |

---

## 1. Informações Gerais

| Campo | Descrição |
|-------|-----------|
| **Nome do projeto** | Minha Igreja (Igreja Connect) |
| **Gestor do Projeto / Product Owner** | Wallace Almeida dos Santos |
| **E-mail** | wallace.santos@igrejaconnect.com.br |
| **Telefone** | (92) 98855-1819 |
| **Data de emissão** | 05/04/2026 |
| **Última revisão** | 12/06/2026 |
| **Versão** | 1.2 |

---

## 2. Descrição Resumida do Projeto

### 2.1 Contexto

O projeto **Igreja Connect** surge da necessidade de digitalizar e modernizar a gestão de igrejas cristãs no Brasil. Muitas igrejas de pequeno e médio porte não possuem recursos para desenvolver sistemas próprios de gestão, resultando em processos manuais, desorganizados e ineficientes.

### 2.2 Oportunidades Identificadas

- Mercado de igrejas cristãs no Brasil representa mais de 100 milhões de fiéis.
- Falta de soluções acessíveis e específicas para o nicho religioso.
- Crescente digitalização de serviços religiosos pós-pandemia.
- Necessidade de gestão profissional de membros, eventos, finanças e comunicação.

### 2.3 Solução

Desenvolvimento de uma plataforma **SaaS (Software as a Service) multi-tenant** que permite que igrejas de diferentes portes tenham seu próprio sistema de gestão completo, incluindo:

- Dashboard administrativo para pastores e líderes;
- Site público personalizado para cada igreja;
- Gestão de membros, eventos, cultos e ministérios;
- Pedidos de oração online;
- Integração com Google Maps;
- Sistema de planos (Free e Essencial);
- Transmissões ao vivo com player do YouTube e chat em tempo real *(implementado após v1.1)*;
- Sistema de depoimentos dos membros *(implementado após v1.1)*;
- PWA para instalação do dashboard no celular *(implementado após v1.1)*.

### 2.4 Justificativa

O projeto visa democratizar o acesso à tecnologia para igrejas, oferecendo uma solução completa e acessível que permite aos líderes focarem em seu ministério principal enquanto o sistema cuida da gestão administrativa e digital.

---

## 3. Escopo — Roadmap do Produto

### 3.1 Módulo Super Admin (Plataforma)

| Funcionalidade | Status |
|----------------|--------|
| Dashboard da Plataforma | ✅ Implementado |
| Gestão de Igrejas (CRUD) | ✅ Implementado |
| Gestão de Usuários | ✅ Implementado |
| Financeiro da Plataforma | ✅ Implementado |
| Gestão de Inadimplência | ✅ Implementado |
| Logs de Auditoria | ✅ Implementado |
| Gestão de Planos (Free, Essencial) | ✅ Implementado |
| Comunicados em Massa | ✅ Implementado |
| Tickets de Suporte | ✅ Implementado |
| Relatórios de Atividade | ✅ Implementado |
| Dashboard de Segurança | ✅ Implementado |
| Configurações do Sistema | ✅ Implementado |

### 3.2 Módulo Pastor/Admin (Igreja)

| Funcionalidade | Status |
|----------------|--------|
| Dashboard da Igreja | ✅ Implementado |
| Configurações da Igreja (Descrição Curta + Quem Somos) | ✅ Implementado |
| Pedidos de Oração (CRUD + Limites por Plano) | ✅ Implementado |
| Membros (CRUD) | ✅ Implementado |
| Eventos (CRUD) | ✅ Implementado |
| Cultos Fixos (CRUD) | ✅ Implementado |
| Ministérios (CRUD + ícones) | ✅ Implementado |
| Upload de Logo (Plano Essencial) | ✅ Implementado |
| Integração Google Maps | ✅ Implementado |
| Modo Claro/Escuro | ✅ Implementado |
| Gestão de Lives | ✅ Implementado |
| Gestão de Depoimentos | ✅ Implementado |
| Galeria de Fotos | ✅ Implementado |

### 3.3 Site Público (Igreja)

| Funcionalidade | Status |
|----------------|--------|
| Página Institucional Personalizada | ✅ Implementado |
| Seção Sobre (Quem Somos) | ✅ Implementado |
| Ministérios com Ícones | ✅ Implementado |
| Grade de Cultos | ✅ Implementado |
| Lista de Eventos | ✅ Implementado |
| Pedidos de Oração Online | ✅ Implementado |
| Google Maps Embed | ✅ Implementado |
| Contato Inteligente | ✅ Implementado |
| Modo Claro/Escuro | ✅ Implementado |
| Hover Effects nos Cards | ✅ Implementado |
| Seção de Depoimentos | ✅ Implementado |
| Página de Transmissão ao Vivo | ✅ Implementado |
| Página de Cadastro de Membro | ✅ Implementado |

### 3.4 Sistema de Planos

| Plano | Limites | Status |
|-------|---------|--------|
| **Free** | Até 50 membros, 20 pedidos/mês, 1 admin, sem upload de logo | ✅ Implementado |
| **Essencial** | Até 200 membros, pedidos ilimitados, 3 admins, com upload de logo | ✅ Implementado |
| Solicitação de Upgrade via Dashboard | | ✅ Implementado |
| Validação de Limites por Plano (Frontend + Backend) | | ✅ Implementado |

### 3.5 Backlog — Próximas Implementações

| Funcionalidade | Status | Observação |
|----------------|--------|------------|
| Sistema de Pagamento (Mercado Pago/Stripe) | 🟡 Em planejamento | Gateway real integrado |
| Autenticação JWT com Refresh Tokens | 🟡 Parcial | JWT já implementado; refresh token pendente |
| Email Marketing (SendGrid/AWS SES) | 🟡 Parcial | Nodemailer/EmailJS configurados; campanhas não implementadas |
| Importação/Exportação de Membros (CSV) | ✅ Implementado | Adicionado após v1.1 |
| Calendário de Eventos com Inscrição | 🔵 Futuro | Roadmap pós-MVP |
| Financeiro da Igreja (Dízimos e Ofertas) | 🔵 Futuro | Roadmap pós-MVP |
| Relatórios Avançados e Exportação | 🔵 Futuro | Roadmap pós-MVP |
| Upload de Vídeos de Cultos | 🔵 Futuro | Roadmap pós-MVP |
| Transmissão Ao Vivo | ✅ Implementado | YouTube Data API + player + chat |
| Domínio Personalizado | ✅ Implementado | Configuração por igreja, com validação de DNS |
| Notificações Push no PWA | 🔵 Futuro | Roadmap pós-MVP |

---

## 4. Não Escopo

Os seguintes itens, mesmo relacionados ao objetivo do projeto, **NÃO** fazem parte do escopo do MVP:

- [x] **Aplicativo Mobile Nativo:** A plataforma será 100% web e responsiva, acessível via browser de qualquer dispositivo. Não haverá desenvolvimento de apps nativos para iOS ou Android.
- [x] **Sistema de Contribuição Online Integrado:** Será implementado em fase futura.
- [x] **Módulo de Kids (Escola Bíblica):** Previsto para versões futuras.
- [x] **Integração com Redes Sociais Automática:** Postagens manuais.
- [x] **Múltiplas Unidades/Igrejas por Conta:** Disponível apenas para plano Enterprise (futuro).
- [x] **Personalização Avançada de Tema:** Apenas cores primária e secundária.
- [x] **API Pública para Terceiros:** API interna apenas para consumo do frontend.

> **Atenção:** O item "Transmissão Ao Vivo de Cultos" saiu do não-escopo e foi implementado no MVP.

---

## 5. Equipe Envolvida

| Área | Representante | Telefone | E-mail | Papel no Projeto |
|------|---------------|----------|--------|------------------|
| Gestão | Wallace Almeida dos Santos | (92) 98855-1819 | wallace.santos@igrejaconnect.com.br | Gestor do Projeto / Product Owner |
| Desenvolvimento Backend | *(preencher)* | | | Tech Lead Backend |
| Desenvolvimento Frontend | *(preencher)* | | | Tech Lead Frontend |
| Banco de Dados | *(preencher)* | | | DBA / Arquiteto de Dados |
| UX/UI Design | *(preencher)* | | | Designer de Interface |
| QA/Testing | *(preencher)* | | | Analista de Qualidade |
| Infraestrutura | *(preencher)* | | | DevOps Engineer |
| Suporte | *(preencher)* | | | Customer Success |

> **Nota:** O documento original deixou os campos da equipe em branco. Preencha com os dados reais da sua equipe.

---

## 6. Premissas e Restrições

### 6.1 Premissas

- A equipe terá acesso a ambientes de desenvolvimento, homologação e produção.
- Os stakeholders estarão disponíveis para validações e feedbacks durante as sprints.
- A infraestrutura de cloud estará disponível e estável.
- As APIs de terceiros (Google Maps, YouTube Data API, Google OAuth) permanecerão operacionais.
- O cliente (igrejas) possuirá acesso mínimo à internet para utilizar a plataforma.
- A plataforma será acessada via browser, não sendo necessário desenvolvimento de app mobile.

### 6.2 Restrições

- **Orçamento:** Limitado para contratação de ferramentas premium.
- **Tempo:** Prazo máximo de 6 meses para MVP em produção.
- **Tecnologia:**
  - Frontend: React + TypeScript + Vite + TailwindCSS
  - Backend: Node.js + Express + MySQL
  - Hospedagem: **Railway (backend + banco) + Vercel (frontend)** *(atualizado: antes previsto Hostinger)*
  - Equipe: Time enxuto de 8 pessoas.
  - Conformidade: Necessário seguir LGPD para tratamento de dados dos fiéis.
  - Segurança: Dados sensíveis devem ser protegidos com autenticação JWT.
  - Planos: Apenas 2 planos disponíveis no MVP (Free e Essencial).

### 6.3 Recursos Desejáveis

- Ambiente de CI/CD automatizado.
- Monitoramento contínuo (Sentry, New Relic).
- Backup automático diário do banco de dados.
- Documentação técnica atualizada.

---

## 7. Riscos

| ID | Risco | Probabilidade | Impacto | Mitigação | Status |
|----|-------|---------------|---------|-----------|--------|
| R01 | Atraso na entrega de funcionalidades críticas | Média | Alto | Sprints bem definidas, daily meetings, buffer de tempo | 🟡 Monitorado |
| R02 | Mudança de escopo durante o desenvolvimento | Alta | Médio | Backlog gerenciado, change control board | 🟡 Monitorado |
| R03 | Instabilidade de APIs de terceiros (Google Maps / YouTube) | Baixa | Médio | Fallback para endereço textual, múltiplos providers | 🟡 Monitorado |
| R04 | Vazamento de dados sensíveis dos fiéis | Baixa | Alto | Criptografia, auditoria, acesso restrito, LGPD compliance | 🟡 Requer atenção |
| R05 | Baixa adoção da plataforma pelas igrejas | Média | Alto | Campanha de marketing, período de trial, suporte dedicado | 🟡 Monitorado |
| R06 | Dificuldade de integração com sistemas legados | Média | Baixo | API bem documentada, suporte técnico especializado | 🟢 Baixo risco |
| R07 | Problemas de performance com crescimento de usuários | Média | Médio | Arquitetura escalável, cache, CDN, monitoramento | 🟡 Monitorado |
| R08 | Falta de pagamento das igrejas (inadimplência) | Alta | Alto | Sistema de cobrança automática, bloqueio após inadimplência | 🟡 Monitorado |

> **Risco R04 — Atenção:** É necessário revisar a segurança antes do lançamento, especialmente: credenciais hardcoded no código, validação de JWT em rotas admin e configuração de CORS.

---

## 8. Prazo Estimado

| Fase | Duração | Data Início | Data Fim | Status |
|------|---------|-------------|----------|--------|
| Planejamento | 2 semanas | 01/03/2026 | 15/03/2026 | ✅ Concluído |
| Desenvolvimento MVP | 12 semanas | 16/03/2026 | 07/06/2026 | ✅ Concluído |
| Testes e QA | 4 semanas | 08/06/2026 | 05/07/2026 | 🟡 Em andamento |
| Piloto (Beta) | 4 semanas | 06/07/2026 | 02/08/2026 | 🔵 Planejado |
| Lançamento Oficial | 2 semanas | 03/08/2026 | 16/08/2026 | 🔵 Planejado |

**Prazo Total Estimado:** 6 meses (24 semanas)  
**Data de Entrega Esperada:** 16/08/2026  
**Status atual (12/06/2026):** Fase de Testes e QA.

---

## 9. Custo Estimado

### 9.1 Custos de Desenvolvimento

| Item | Valor Mensal | Duração | Total |
|------|--------------|---------|-------|
| Equipe (8 pessoas) | R$ *(preencher)* | 6 meses | R$ *(preencher)* |
| Infraestrutura (Cloud) | R$ *(preencher)* | 6 meses | R$ *(preencher)* |
| Ferramentas e Licenças | R$ *(preencher)* | 6 meses | R$ *(preencher)* |
| APIs de Terceiros | R$ *(preencher)* | 6 meses | R$ *(preencher)* |
| **Subtotal Desenvolvimento** | | | **R$ *(preencher)*** |

### 9.2 Custos Operacionais (Pós-Lançamento)

| Item | Valor Mensal |
|------|--------------|
| Manutenção da Equipe | R$ *(preencher)* |
| Infraestrutura de Produção | R$ *(preencher)* |
| Suporte e Atendimento | R$ *(preencher)* |
| Marketing e Vendas | R$ *(preencher)* |
| **Subtotal Operacional** | **R$ *(preencher)* /mês** |

### 9.3 Investimento Total

| Item | Valor |
|------|-------|
| Desenvolvimento | R$ *(preencher)* |
| Operacional (12 meses) | R$ *(preencher)* |
| **TOTAL GERAL** | **R$ *(preencher)*** |

> **Sugestão de preenchimento (estimativa didática):**
> - Desenvolvimento: 180h × R$ 15,00 = R$ 2.700,00
> - Infraestrutura: R$ 85,00 (Railway + domínio)
> - Total aproximado: R$ 2.795,00

---

## 10. Indicadores de Sucesso

### 10.1 Indicadores de Input

- Horas de Desenvolvimento: ≤ 960 horas/mês
- Budget Utilizado: ≤ R$ *(preencher)* /mês
- Recursos Alocados: 100% da equipe disponível

### 10.2 Indicadores de Processo

- Velocity da Sprint: ≥ 40 story points/sprint
- Bug Rate: ≤ 5 bugs críticos por release
- Code Coverage: ≥ 80% de testes automatizados *(atualmente 0% — ponto crítico)*
- Lead Time: ≤ 5 dias para features pequenas

### 10.3 Indicadores de Resultado

- Igrejas Ativas: ≥ 100 igrejas nos primeiros 6 meses
- Usuários Ativos: ≥ 5.000 usuários mensais
- Taxa de Conversão: ≥ 30% de Free para Essencial
- NPS (Net Promoter Score): ≥ 70
- Churn Rate: ≤ 5% ao mês

### 10.4 Indicadores de Impacto

- Receita Recorrente (MRR): R$ *(preencher)* em 12 meses
- Satisfação do Cliente: ≥ 4.5/5 estrelas
- Tempo de Atividade (Uptime): ≥ 99.9%
- Redução de Tempo de Gestão: ≥ 40% para igrejas clientes

---

## 11. Estrutura de Planos (APORTECH)

### 11.1 Plano Free

| Recurso | Limite |
|---------|--------|
| Membros | Até 50 |
| Pedidos de Oração | Até 20/mês |
| Administradores | 1 |
| Upload de Logo | ❌ Não disponível |
| Site Público | ✅ Básico |
| Google Maps | ✅ Disponível |
| Modo Claro/Escuro | ✅ Disponível |
| **Valor** | **Grátis** |

**Público-Alvo:** Igrejas pequenas e ministérios iniciantes.

### 11.2 Plano Essencial

| Recurso | Limite |
|---------|--------|
| Membros | Até 200 |
| Pedidos de Oração | Ilimitados |
| Administradores | Até 3 |
| Upload de Logo | ✅ Disponível |
| Site Público | ✅ Completo |
| Google Maps | ✅ Disponível |
| Modo Claro/Escuro | ✅ Disponível |
| Suporte Prioritário | ✅ Disponível |
| **Valor** | **R$ 49,90/mês** |

**Público-Alvo:** Igrejas em crescimento que necessitam de mais recursos.

### 11.3 Comparativo de Planos

| Recurso | Free | Essencial |
|---------|------|-----------|
| Membros | 50 | 200 |
| Pedidos de Oração | 20/mês | Ilimitados |
| Administradores | 1 | 3 |
| Upload de Logo | ❌ | ✅ |
| Site Público | Básico | Completo |
| Suporte | Comunidade | Prioritário |
| **Valor** | Grátis | R$ 49,90/mês |

---

## 12. Aprovação do Projeto

| Papel | Nome | Assinatura | Data |
|-------|------|------------|------|
| Gestor do Projeto | Wallace Almeida dos Santos | | 05/04/2026 |
| Patrocinador Técnico | Wallace Almeida dos Santos | | |
| Patrocinador Demandante | *(preencher)* | | |

---

## 13. Principais Mudanças da Revisão 1.2

1. **Funcionalidades movidas de backlog para implementadas:**
   - Importação/Exportação de membros (CSV)
   - Transmissão ao vivo (YouTube + chat)
   - Domínio personalizado
   - Sistema de depoimentos
   - PWA do dashboard admin
   - Galeria de fotos

2. **Atualização de infraestrutura:** hospedagem alterada de Hostinger para **Railway + Vercel**.

3. **Atualização de cronograma:** fase atual é Testes e QA (08/06 a 05/07/2026).

4. **Risco de segurança destacado:** credenciais hardcoded e validação de JWT requerem atenção antes do lançamento.

5. **Indicador crítico:** cobertura de testes está em 0% — meta de 80% ainda não alcançada.
