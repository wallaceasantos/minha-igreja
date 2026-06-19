# Resumo das Modificações no TAP

## Documento analisado
- **Arquivo:** `docs/TERMO DE ABERTURA DO PROJETO MINHA IGREJA.docx`
- **Versão original:** 1.1 (05/04/2026)
- **Versão atualizada:** 1.2 (12/06/2026)
- **Arquivo atualizado:** `docs/gerencia/TAP.md`

---

## Principais alterações realizadas

### 1. Status das funcionalidades atualizado

O documento original tinha vários itens no backlog que **já foram implementados** no código. Eles foram movidos para a seção de escopo implementado:

| Funcionalidade | Status no original | Status atualizado |
|----------------|--------------------|-------------------|
| Importação/Exportação de Membros (CSV) | Backlog | ✅ Implementado |
| Transmissão Ao Vivo | Não escopo / Backlog | ✅ Implementado |
| Domínio Personalizado | Backlog | ✅ Implementado |
| Sistema de Depoimentos | Não existia no TAP | ✅ Implementado |
| PWA do Dashboard Admin | Não existia no TAP | ✅ Implementado |
| Galeria de Fotos | Não existia no TAP | ✅ Implementado |

### 2. Seção "Não Escopo" revisada

- O item **"Transmissão Ao Vivo de Cultos"** saiu do não-escopo, pois foi implementado.
- Mantidos no não-escopo: app mobile nativo, contribuição online, módulo de kids, posts automáticos em redes sociais, múltiplas unidades, personalização avançada de tema e API pública.

### 3. Tecnologia e infraestrutura atualizada

| Item | Original | Atualizado |
|------|----------|------------|
| Hospedagem | Hostinger ou similar | Railway (backend + banco) + Vercel (frontend) |
| Integrações | Google Maps, SendGrid, Mercado Pago | Google Maps, YouTube Data API, Google OAuth, Cloudinary, Nodemailer |

### 4. Cronograma com status real

O cronograma original foi mantido, mas com status por fase:

| Fase | Status |
|------|--------|
| Planejamento | ✅ Concluído |
| Desenvolvimento MVP | ✅ Concluído |
| Testes e QA | 🟡 Em andamento |
| Piloto (Beta) | 🔵 Planejado |
| Lançamento Oficial | 🔵 Planejado |

> Hoje é 12/06/2026. O projeto está na fase de Testes e QA.

### 5. Riscos atualizados

- Adicionada coluna de **status** para cada risco.
- Destacado o **R04 (vazamento de dados)** como requerendo atenção devido a credenciais hardcoded e JWT.
- Atualizada a mitigação do R03 para incluir **YouTube Data API** como dependência crítica.

### 6. Indicadores de sucesso com alertas

- **Code Coverage ≥ 80%:** adicionado alerta de que atualmente está em **0%** (nenhum teste real encontrado).
- Outros indicadores mantidos como metas a serem alcançadas pós-lançamento.

### 7. Custos e orçamento

- O documento original deixou os valores em branco (`R$ __`).
- Na versão atualizada, mantivemos os campos para preenchimento, mas adicionamos uma **sugestão de estimativa didática**:
  - Desenvolvimento: ~R$ 2.700,00
  - Infraestrutura: ~R$ 85,00
  - Total aproximado: ~R$ 2.795,00

### 8. Equipe

- Mantida a tabela de equipe, mas destacado que os campos de representantes (exceto Gestão) estão em branco no documento original e precisam ser preenchidos.

### 9. Novas seções adicionadas

- **Seção 3.5 — Backlog:** organizado em implementado / parcial / futuro.
- **Seção 13 — Principais Mudanças da Revisão 1.2:** resumo das alterações.
- **Histórico de revisões:** adicionada entrada da versão 1.2.

---

## Itens que ainda precisam de atenção

1. **Preencher dados da equipe** na tabela da Seção 5.
2. **Preencher valores reais** do orçamento na Seção 9.
3. **Revisar risco R04** e fazer correções de segurança antes do lançamento.
4. **Adicionar testes automatizados** para atingir a meta de 80% de code coverage.
5. **Atualizar o arquivo .docx original** (caso queira entregar o documento no formato Word).

---

## Sugestão para o vídeo

No vídeo de status, você pode falar:

> "O TAP foi revisado na última semana para refletir o estado real do projeto. As principais mudanças foram: mover funcionalidades do backlog para implementadas — como transmissão ao vivo, importação CSV, PWA e depoimentos —, atualizar a infraestrutura para Railway + Vercel, e ajustar o cronograma para a fase atual de Testes e QA. Também destacamos o risco de segurança e a necessidade de aumentar a cobertura de testes antes do lançamento."
