# Métricas de Marketing — MinhaIgreja

> 📊 Este é um modelo de acompanhamento. Preencha com dados reais do Google Analytics 4, banco de dados e redes sociais.

---

## 1. KPIs principais

| KPI | Definição | Meta | Atual | Fonte |
|-----|-----------|------|-------|-------|
| **Alcance** | Pessoas que visualizaram algum conteúdo da plataforma | 500 | _preencher_ | GA4 + redes sociais |
| **Visitantes únicos** | Usuários únicos na landing page ou site de igreja | 100 | _preencher_ | GA4 `total_users` |
| **Novos usuários cadastrados** | Igrejas que criaram conta | 10 | _preencher_ | Banco: tabela `churches` |
| **Usuários engajados** | Usuários com ≥2 acessos em 7 dias | 5 | _preencher_ | GA4 `engaged_sessions` + banco |
| **Taxa de conversão** | Visitantes que criaram igreja / total de visitantes | 5% | _preencher_ | GA4 + banco |
| **Tempo médio na live** | Média de minutos assistidos | 10 min | _preencher_ | Evento `video_start` / `video_complete` |
| **Pedidos de oração** | Quantidade de pedidos enviados | 20 | _preencher_ | Banco: tabela `pedidos` |
| **Depoimentos enviados** | Quantidade de depoimentos aprovados | 10 | _preencher_ | Banco: tabela `testimonials` |

---

## 2. Funil de conversão

```
Impressões (alcance)
    ↓
Cliques no link
    ↓
Visitantes na landing page
    ↓
Cliques em "Criar Igreja"
    ↓
Cadastro iniciado
    ↓
Cadastro concluído (nova igreja)
    ↓
Admin loga no dashboard (≥2x em 7 dias)
```

| Etapa | Quantidade | Taxa de conversão |
|-------|------------|-------------------|
| Impressões | _preencher_ | — |
| Cliques no link | _preencher_ | _preencher_% |
| Visitantes landing | _preencher_ | _preencher_% |
| Cadastro iniciado | _preencher_ | _preencher_% |
| Cadastro concluído | _preencher_ | _preencher_% |
| Usuários engajados | _preencher_ | _preencher_% |

---

## 3. Canais de aquisição

| Canal | Visitantes | Novos usuários | Usuários engajados |
|-------|------------|----------------|--------------------|
| Instagram | _preencher_ | _preencher_ | _preencher_ |
| Facebook | _preencher_ | _preencher_ | _preencher_ |
| WhatsApp | _preencher_ | _preencher_ | _preencher_ |
| Busca orgânica | _preencher_ | _preencher_ | _preencher_ |
| Indicação direta | _preencher_ | _preencher_ | _preencher_ |
| **Total** | | | |

---

## 4. Eventos rastreados (GA4)

O arquivo `src/lib/analytics.ts` já instrumenta os seguintes eventos:

| Evento | Quando dispara | Dados enviados |
|--------|----------------|----------------|
| `page_view` | Mudança de rota | `page_path`, `page_title`, `page_location` |
| `login` | Login bem-sucedido | `event_category`, `event_label` |
| `logout` | Logout | `event_category`, `event_label` |
| `pedido_oracao` | Envio de pedido | categoria, tema |
| `contato` | Envio de formulário de contato | assunto |
| `video_start` | Início da live | título, duração |
| `video_complete` | Fim da live | título |
| `search` | Busca interna | termo |
| `download` | Download de arquivo | nome, tipo |
| `click_outbound` | Clique em link externo | URL, texto |

> **Importante:** para os eventos começarem a ser enviados, configure a variável de ambiente `VITE_GA_ID=G-XXXXXXXXXX` no arquivo `.env` do frontend.

---

## 5. Ações de marketing realizadas

| # | Ação | Data | Responsável | Status | Resultado |
|---|------|------|-------------|--------|-----------|
| 1 | Criação da landing page institucional | _preencher_ | | ✅ | _preencher_ |
| 2 | Configuração do GA4 no código | _preencher_ | | ✅ | _preencher_ |
| 3 | Configuração de SEO/meta tags | _preencher_ | | ✅ | _preencher_ |
| 4 | Publicação de posts no Instagram | _preencher_ | | 🟡 | _preencher_ |
| 5 | Divulgação em grupos de pastores | _preencher_ | | 🟡 | _preencher_ |
| 6 | Contato com igrejas piloto | _preencher_ | | 🟡 | _preencher_ |

---

## 6. Próximas ações de marketing

| # | Ação | Prazo | Responsável |
|---|------|-------|-------------|
| 1 | Configurar `VITE_GA_ID` em produção | 15/06/2026 | |
| 2 | Criar 3 posts para Instagram/Facebook | 18/06/2026 | |
| 3 | Enviar 10 mensagens diretas para pastores | 20/06/2026 | |
| 4 | Publicar 1 depoimento de igreja piloto | 25/06/2026 | |
| 5 | Gravar vídeo de demonstração de 60s | 28/06/2026 | |
| 6 | Avaliar resultados e ajustar campanha | 05/07/2026 | |

---

## 7. Como medir "usuários engajados"

A atividade pede: **"Usuário Engajados (mínimo 2 acessos dentro de 7 dias)"**.

### Opção A: pelo banco de dados
```sql
SELECT member_email, COUNT(*) AS acessos
FROM access_logs
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY member_email
HAVING acessos >= 2;
```

### Opção B: pelo Google Analytics 4
No GA4, usar o relatório **Engajamento > Eventos** ou criar um público com condição:
- `session_start` ≥ 2 vezes nos últimos 7 dias.

### Opção C: híbrida (recomendada)
- **Usuários do site público:** GA4
- **Administradores/pastores:** banco de dados (`access_logs` + `user_sessions`)
