from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement


def set_cell_shading(cell, color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:fill'), color)
    tcPr.append(shd)


def add_heading(doc, text, level=1):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = True
    if level == 1:
        run.font.size = Pt(16)
        run.font.color.rgb = RGBColor(0, 51, 102)
    elif level == 2:
        run.font.size = Pt(14)
    else:
        run.font.size = Pt(12)
    return p


def add_paragraph(doc, text, bold=False, italic=False):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = bold
    run.italic = italic
    return p


def add_table(doc, headers, rows):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = 'Table Grid'
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_cells = table.rows[0].cells
    for i, h in enumerate(headers):
        hdr_cells[i].text = h
        set_cell_shading(hdr_cells[i], 'D9E2F3')
        for paragraph in hdr_cells[i].paragraphs:
            for run in paragraph.runs:
                run.bold = True
    for row_data in rows:
        row_cells = table.add_row().cells
        for i, val in enumerate(row_data):
            row_cells[i].text = str(val)
    return table


def main():
    doc = Document()

    # Título
    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = title.add_run('TERMO DE ABERTURA DO PROJETO')
    run.bold = True
    run.font.size = Pt(20)
    run.font.color.rgb = RGBColor(0, 51, 102)

    subtitle = doc.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = subtitle.add_run('MINHA IGREJA - PLATAFORMA MULTI-TENANT PARA GESTÃO DE IGREJAS')
    run.bold = True
    run.font.size = Pt(14)

    doc.add_paragraph()

    # Gestor
    add_heading(doc, 'Gestor do Projeto', level=2)
    add_paragraph(doc, 'Wallace Almeida dos Santos')
    add_paragraph(doc, 'wallace.santos@igrejaconnect.com.br')
    add_paragraph(doc, '(92) 98855-1819')
    doc.add_paragraph()

    # Histórico
    add_heading(doc, 'Histórico de Revisões', level=2)
    add_table(doc,
        ['Data', 'Versão', 'Descrição', 'Autor'],
        [
            ['05/04/2026', '1.0', 'Criação do Termo de Abertura do Projeto', 'Wallace Almeida dos Santos'],
            ['05/04/2026', '1.1', 'Confirmação de 2 planos e exclusão de app mobile', 'Wallace Almeida dos Santos'],
            ['12/06/2026', '1.2', 'Atualização de status: funcionalidades implementadas, backlog revisado, cronograma e infraestrutura ajustados', 'Wallace Almeida dos Santos']
        ]
    )
    doc.add_paragraph()

    # 1. Descrição
    add_heading(doc, '1. DESCRIÇÃO RESUMIDA DO PROJETO', level=1)
    add_heading(doc, 'Contexto:', level=2)
    add_paragraph(doc, 'O projeto IGREJA CONNECT surge da necessidade de digitalizar e modernizar a gestão de igrejas cristãs no Brasil. Muitas igrejas de pequeno e médio porte não possuem recursos para desenvolver sistemas próprios de gestão, resultando em processos manuais, desorganizados e ineficientes.')

    add_heading(doc, 'Oportunidades Identificadas:', level=2)
    add_paragraph(doc, '• Mercado de igrejas cristãs no Brasil representa mais de 100 milhões de fiéis')
    add_paragraph(doc, '• Falta de soluções acessíveis e específicas para o nicho religioso')
    add_paragraph(doc, '• Crescente digitalização de serviços religiosos pós-pandemia')
    add_paragraph(doc, '• Necessidade de gestão profissional de membros, eventos, finanças e comunicação')

    add_heading(doc, 'Solução:', level=2)
    add_paragraph(doc, 'Desenvolvimento de uma plataforma SaaS (Software as a Service) multi-tenant que permite que igrejas de diferentes portes tenham seu próprio sistema de gestão completo, incluindo:')
    add_paragraph(doc, '• Dashboard administrativo para pastores e líderes')
    add_paragraph(doc, '• Site público personalizado para cada igreja')
    add_paragraph(doc, '• Gestão de membros, eventos, cultos e ministérios')
    add_paragraph(doc, '• Pedidos de oração online')
    add_paragraph(doc, '• Integração com Google Maps')
    add_paragraph(doc, '• Sistema de planos (Free e Essencial)')
    add_paragraph(doc, '• Transmissões ao vivo com player do YouTube e chat em tempo real (implementado)')
    add_paragraph(doc, '• Sistema de depoimentos dos membros (implementado)')
    add_paragraph(doc, '• PWA para instalação do dashboard no celular (implementado)')

    add_heading(doc, 'Justificativa:', level=2)
    add_paragraph(doc, 'O projeto visa democratizar o acesso à tecnologia para igrejas, oferecendo uma solução completa e acessível que permite aos líderes focarem em seu ministério principal enquanto o sistema cuida da gestão administrativa e digital.')

    doc.add_page_break()

    # 2. Escopo
    add_heading(doc, '2. ESCOPO – ROADMAP DO PRODUTO', level=1)

    add_heading(doc, 'Módulo Super Admin (Plataforma)', level=2)
    add_paragraph(doc, '[x] Dashboard da Plataforma')
    add_paragraph(doc, '[x] Gestão de Igrejas (CRUD)')
    add_paragraph(doc, '[x] Gestão de Usuários')
    add_paragraph(doc, '[x] Financeiro da Plataforma')
    add_paragraph(doc, '[x] Gestão de Inadimplência')
    add_paragraph(doc, '[x] Logs de Auditoria')
    add_paragraph(doc, '[x] Gestão de Planos (Free, Essencial)')
    add_paragraph(doc, '[x] Comunicados em Massa')
    add_paragraph(doc, '[x] Tickets de Suporte')
    add_paragraph(doc, '[x] Relatórios de Atividade')
    add_paragraph(doc, '[x] Dashboard de Segurança')
    add_paragraph(doc, '[x] Configurações do Sistema')

    add_heading(doc, 'Módulo Pastor/Admin (Igreja)', level=2)
    add_paragraph(doc, '[x] Dashboard da Igreja')
    add_paragraph(doc, '[x] Configurações da Igreja (Descrição Curta + Quem Somos)')
    add_paragraph(doc, '[x] Pedidos de Oração (CRUD + Limites por Plano)')
    add_paragraph(doc, '[x] Membros (CRUD)')
    add_paragraph(doc, '[x] Eventos (CRUD)')
    add_paragraph(doc, '[x] Cultos Fixos (CRUD)')
    add_paragraph(doc, '[x] Ministérios (CRUD + ícones)')
    add_paragraph(doc, '[x] Upload de Logo (Plano Essencial)')
    add_paragraph(doc, '[x] Integração Google Maps')
    add_paragraph(doc, '[x] Modo Claro/Escuro')
    add_paragraph(doc, '[x] Gestão de Lives')
    add_paragraph(doc, '[x] Gestão de Depoimentos')
    add_paragraph(doc, '[x] Galeria de Fotos')

    add_heading(doc, 'Site Público (Igreja)', level=2)
    add_paragraph(doc, '[x] Página Institucional Personalizada')
    add_paragraph(doc, '[x] Seção Sobre (Quem Somos)')
    add_paragraph(doc, '[x] Ministérios com Ícones')
    add_paragraph(doc, '[x] Grade de Cultos')
    add_paragraph(doc, '[x] Lista de Eventos')
    add_paragraph(doc, '[x] Pedidos de Oração Online')
    add_paragraph(doc, '[x] Google Maps Embed')
    add_paragraph(doc, '[x] Contato Inteligente')
    add_paragraph(doc, '[x] Modo Claro/Escuro')
    add_paragraph(doc, '[x] Hover Effects nos Cards')
    add_paragraph(doc, '[x] Seção de Depoimentos')
    add_paragraph(doc, '[x] Página de Transmissão ao Vivo')
    add_paragraph(doc, '[x] Página de Cadastro de Membro')

    add_heading(doc, 'Sistema de Planos', level=2)
    add_paragraph(doc, '[x] Plano Free: 50 membros, 20 pedidos/mês, 1 admin, sem upload de logo')
    add_paragraph(doc, '[x] Plano Essencial: 200 membros, pedidos ilimitados, 3 admins, com upload de logo')
    add_paragraph(doc, '[x] Solicitação de Upgrade via Dashboard')
    add_paragraph(doc, '[x] Validação de Limites por Plano (Frontend + Backend)')

    add_heading(doc, 'Backlog – Próximas Implementações', level=2)
    add_paragraph(doc, '[ ] Sistema de Pagamento (Mercado Pago/Stripe)')
    add_paragraph(doc, '[~] Autenticação JWT com Refresh Tokens (JWT implementado; refresh pendente)')
    add_paragraph(doc, '[~] Email Marketing (SendGrid/AWS SES) (Nodemailer/EmailJS configurados; campanhas pendentes)')
    add_paragraph(doc, '[x] Importação/Exportação de Membros (CSV)')
    add_paragraph(doc, '[ ] Calendário de Eventos com Inscrição')
    add_paragraph(doc, '[ ] Financeiro da Igreja (Dízimos e Ofertas)')
    add_paragraph(doc, '[ ] Relatórios Avançados e Exportação')
    add_paragraph(doc, '[ ] Upload de Vídeos de Cultos')
    add_paragraph(doc, '[x] Transmissão Ao Vivo')
    add_paragraph(doc, '[x] Domínio Personalizado')
    add_paragraph(doc, '[ ] Notificações Push no PWA')

    doc.add_page_break()

    # 3. Não escopo
    add_heading(doc, '3. NÃO ESCOPO', level=1)
    add_paragraph(doc, 'Os seguintes itens, mesmo relacionados ao objetivo do projeto, NÃO fazem parte do escopo do MVP:')
    add_paragraph(doc, '[x] Aplicativo Mobile Nativo: A plataforma será 100% web e responsiva, acessível via browser de qualquer dispositivo. Não haverá desenvolvimento de apps nativos para iOS ou Android.')
    add_paragraph(doc, '[x] Sistema de Contribuição Online Integrado: Será implementado em fase futura.')
    add_paragraph(doc, '[x] Módulo de Kids (Escola Bíblica): Previsto para versões futuras.')
    add_paragraph(doc, '[x] Integração com Redes Sociais Automática: Postagens manuais.')
    add_paragraph(doc, '[x] Múltiplas Unidades/Igrejas por Conta: Disponível apenas para plano Enterprise (futuro).')
    add_paragraph(doc, '[x] Personalização Avançada de Tema: Apenas cores primária e secundária.')
    add_paragraph(doc, '[x] API Pública para Terceiros: API interna apenas para consumo do frontend.')
    add_paragraph(doc, 'Atenção: O item Transmissão Ao Vivo de Cultos saiu do não-escopo e foi implementado no MVP.', bold=True)

    # 4. Equipe
    add_heading(doc, '4. EQUIPE ENVOLVIDA', level=1)
    add_table(doc,
        ['Área', 'Representante', 'Telefone', 'E-mail', 'Papel no Projeto'],
        [
            ['Gestão', 'Wallace Almeida dos Santos', '(92) 98855-1819', 'wallace.santos@igrejaconnect.com.br', 'Gestor do Projeto / Product Owner'],
            ['Desenvolvimento Backend', '', '', '', 'Tech Lead Backend'],
            ['Desenvolvimento Frontend', '', '', '', 'Tech Lead Frontend'],
            ['Banco de Dados', '', '', '', 'DBA / Arquiteto de Dados'],
            ['UX/UI Design', '', '', '', 'Designer de Interface'],
            ['QA/Testing', '', '', '', 'Analista de Qualidade'],
            ['Infraestrutura', '', '', '', 'DevOps Engineer'],
            ['Suporte', '', '', '', 'Customer Success']
        ]
    )
    add_paragraph(doc, 'Nota: Preencher os dados em branco com a equipe real do projeto.', italic=True)

    # 5. Premissas e restrições
    add_heading(doc, '5. PREMISSAS E RESTRIÇÕES', level=1)
    add_heading(doc, 'Premissas', level=2)
    add_paragraph(doc, '• A equipe terá acesso a ambientes de desenvolvimento, homologação e produção.')
    add_paragraph(doc, '• Os stakeholders estarão disponíveis para validações e feedbacks durante as sprints.')
    add_paragraph(doc, '• A infraestrutura de cloud estará disponível e estável.')
    add_paragraph(doc, '• As APIs de terceiros (Google Maps, YouTube Data API, Google OAuth) permanecerão operacionais.')
    add_paragraph(doc, '• O cliente (igrejas) possuirá acesso mínimo à internet para utilizar a plataforma.')
    add_paragraph(doc, '• A plataforma será acessada via browser, não sendo necessário desenvolvimento de app mobile.')

    add_heading(doc, 'Restrições', level=2)
    add_paragraph(doc, '• Orçamento: Limitado para contratação de ferramentas premium.')
    add_paragraph(doc, '• Tempo: Prazo máximo de 6 meses para MVP em produção.')
    add_paragraph(doc, '• Tecnologia:')
    add_paragraph(doc, '  - Frontend: React + TypeScript + Vite + TailwindCSS')
    add_paragraph(doc, '  - Backend: Node.js + Express + MySQL')
    add_paragraph(doc, '  - Hospedagem: Railway (backend + banco) + Vercel (frontend)')
    add_paragraph(doc, '  - Equipe: Time enxuto de 8 pessoas')
    add_paragraph(doc, '  - Conformidade: Necessário seguir LGPD para tratamento de dados dos fiéis')
    add_paragraph(doc, '  - Segurança: Dados sensíveis devem ser protegidos com autenticação JWT')
    add_paragraph(doc, '  - Planos: Apenas 2 planos disponíveis no MVP (Free e Essencial)')

    add_heading(doc, 'Recursos Desejáveis', level=2)
    add_paragraph(doc, '• Ambiente de CI/CD automatizado')
    add_paragraph(doc, '• Monitoramento contínuo (Sentry, New Relic)')
    add_paragraph(doc, '• Backup automático diário do banco de dados')
    add_paragraph(doc, '• Documentação técnica atualizada')

    doc.add_page_break()

    # 6. Riscos
    add_heading(doc, '6. RISCOS', level=1)
    add_table(doc,
        ['ID', 'Risco', 'Probabilidade', 'Impacto', 'Mitigação', 'Status'],
        [
            ['R01', 'Atraso na entrega de funcionalidades críticas', 'Média', 'Alto', 'Sprints bem definidas, daily meetings, buffer de tempo', 'Monitorado'],
            ['R02', 'Mudança de escopo durante o desenvolvimento', 'Alta', 'Médio', 'Backlog gerenciado, change control board', 'Monitorado'],
            ['R03', 'Instabilidade de APIs de terceiros (Google Maps / YouTube)', 'Baixa', 'Médio', 'Fallback para endereço textual, múltiplos providers', 'Monitorado'],
            ['R04', 'Vazamento de dados sensíveis dos fiéis', 'Baixa', 'Alto', 'Criptografia, auditoria, acesso restrito, LGPD compliance', 'Requer atenção'],
            ['R05', 'Baixa adoção da plataforma pelas igrejas', 'Média', 'Alto', 'Campanha de marketing, período de trial, suporte dedicado', 'Monitorado'],
            ['R06', 'Dificuldade de integração com sistemas legados', 'Média', 'Baixo', 'API bem documentada, suporte técnico especializado', 'Baixo risco'],
            ['R07', 'Problemas de performance com crescimento de usuários', 'Média', 'Médio', 'Arquitetura escalável, cache, CDN, monitoramento', 'Monitorado'],
            ['R08', 'Falta de pagamento das igrejas (inadimplência)', 'Alta', 'Alto', 'Sistema de cobrança automática, bloqueio após inadimplência', 'Monitorado']
        ]
    )
    add_paragraph(doc, 'Atenção: R04 requer revisão de segurança antes do lançamento (credenciais hardcoded, validação de JWT, CORS).', bold=True)

    # 7. Prazo
    add_heading(doc, '7. PRAZO ESTIMADO', level=1)
    add_table(doc,
        ['Fase', 'Duração', 'Data Início', 'Data Fim', 'Status'],
        [
            ['Planejamento', '2 semanas', '01/03/2026', '15/03/2026', 'Concluído'],
            ['Desenvolvimento MVP', '12 semanas', '16/03/2026', '07/06/2026', 'Concluído'],
            ['Testes e QA', '4 semanas', '08/06/2026', '05/07/2026', 'Em andamento'],
            ['Piloto (Beta)', '4 semanas', '06/07/2026', '02/08/2026', 'Planejado'],
            ['Lançamento Oficial', '2 semanas', '03/08/2026', '16/08/2026', 'Planejado']
        ]
    )
    add_paragraph(doc, 'Prazo Total Estimado: 6 meses (24 semanas)')
    add_paragraph(doc, 'Data de Entrega Esperada: 16/08/2026')
    add_paragraph(doc, 'Status atual (12/06/2026): Fase de Testes e QA.', bold=True)

    doc.add_page_break()

    # 8. Custo
    add_heading(doc, '8. CUSTO ESTIMADO', level=1)
    add_heading(doc, 'Custos de Desenvolvimento', level=2)
    add_table(doc,
        ['Item', 'Valor Mensal', 'Duração', 'Total'],
        [
            ['Equipe (8 pessoas)', 'R$ __', '6 meses', 'R$ __'],
            ['Infraestrutura (Cloud)', 'R$ __', '6 meses', 'R$ __'],
            ['Ferramentas e Licenças', 'R$ __', '6 meses', 'R$ __'],
            ['APIs de Terceiros', 'R$ __', '6 meses', 'R$ __'],
            ['Subtotal Desenvolvimento', '', '', 'R$ __']
        ]
    )

    add_heading(doc, 'Custos Operacionais (Pós-Lançamento)', level=2)
    add_table(doc,
        ['Item', 'Valor Mensal'],
        [
            ['Manutenção da Equipe', 'R$ __'],
            ['Infraestrutura de Produção', 'R$ __'],
            ['Suporte e Atendimento', 'R$ __'],
            ['Marketing e Vendas', 'R$ __'],
            ['Subtotal Operacional', 'R$ __ /mês']
        ]
    )

    add_heading(doc, 'Investimento Total', level=2)
    add_paragraph(doc, 'Desenvolvimento: R$ __')
    add_paragraph(doc, 'Operacional (12 meses): R$ __')
    add_paragraph(doc, 'TOTAL GERAL: R$ __', bold=True)
    add_paragraph(doc, 'Sugestão de estimativa didática: Desenvolvimento ~R$ 2.700,00 + Infraestrutura ~R$ 85,00 = Total aproximado ~R$ 2.795,00.', italic=True)

    # 9. Indicadores
    add_heading(doc, '9. INDICADORES DE SUCESSO', level=1)
    add_heading(doc, 'Indicadores de Input', level=2)
    add_paragraph(doc, '• Horas de Desenvolvimento: ≤ 960 horas/mês')
    add_paragraph(doc, '• Budget Utilizado: ≤ R$ __/mês')
    add_paragraph(doc, '• Recursos Alocados: 100% da equipe disponível')

    add_heading(doc, 'Indicadores de Processo', level=2)
    add_paragraph(doc, '• Velocity da Sprint: ≥ 40 story points/sprint')
    add_paragraph(doc, '• Bug Rate: ≤ 5 bugs críticos por release')
    add_paragraph(doc, '• Code Coverage: ≥ 80% de testes automatizados (ATENÇÃO: atualmente 0%)', bold=True)
    add_paragraph(doc, '• Lead Time: ≤ 5 dias para features pequenas')

    add_heading(doc, 'Indicadores de Resultado', level=2)
    add_paragraph(doc, '• Igrejas Ativas: ≥ 100 igrejas nos primeiros 6 meses')
    add_paragraph(doc, '• Usuários Ativos: ≥ 5.000 usuários mensais')
    add_paragraph(doc, '• Taxa de Conversão: ≥ 30% de Free para Essencial')
    add_paragraph(doc, '• NPS (Net Promoter Score): ≥ 70')
    add_paragraph(doc, '• Churn Rate: ≤ 5% ao mês')

    add_heading(doc, 'Indicadores de Impacto', level=2)
    add_paragraph(doc, '• Receita Recorrente (MRR): R$ __ em 12 meses')
    add_paragraph(doc, '• Satisfação do Cliente: ≥ 4.5/5 estrelas')
    add_paragraph(doc, '• Tempo de Atividade (Uptime): ≥ 99.9%')
    add_paragraph(doc, '• Redução de Tempo de Gestão: ≥ 40% para igrejas clientes')

    doc.add_page_break()

    # 10. Planos
    add_heading(doc, '10. ESTRUTURA DE PLANOS (APORTECH)', level=1)
    add_heading(doc, 'Plano Free', level=2)
    add_paragraph(doc, 'Público-Alvo: Igrejas pequenas e ministérios iniciantes')
    add_table(doc,
        ['Recurso', 'Limite'],
        [
            ['Membros', 'Até 50'],
            ['Pedidos de Oração', 'Até 20/mês'],
            ['Administradores', '1'],
            ['Upload de Logo', '❌ Não disponível'],
            ['Site Público', '✅ Básico'],
            ['Google Maps', '✅ Disponível'],
            ['Modo Claro/Escuro', '✅ Disponível'],
            ['Valor', 'Grátis']
        ]
    )

    add_heading(doc, 'Plano Essencial', level=2)
    add_paragraph(doc, 'Público-Alvo: Igrejas em crescimento que necessitam de mais recursos')
    add_table(doc,
        ['Recurso', 'Limite'],
        [
            ['Membros', 'Até 200'],
            ['Pedidos de Oração', 'Ilimitados'],
            ['Administradores', 'Até 3'],
            ['Upload de Logo', '✅ Disponível'],
            ['Site Público', '✅ Completo'],
            ['Google Maps', '✅ Disponível'],
            ['Modo Claro/Escuro', '✅ Disponível'],
            ['Suporte Prioritário', '✅ Disponível'],
            ['Valor', 'R$ 49,90/mês']
        ]
    )

    add_heading(doc, 'Comparativo de Planos', level=2)
    add_table(doc,
        ['Recurso', 'Free', 'Essencial'],
        [
            ['Membros', '50', '200'],
            ['Pedidos de Oração', '20/mês', 'Ilimitados'],
            ['Administradores', '1', '3'],
            ['Upload de Logo', '❌', '✅'],
            ['Site Público', 'Básico', 'Completo'],
            ['Suporte', 'Comunidade', 'Prioritário'],
            ['Valor', 'Grátis', 'R$ 49,90/mês']
        ]
    )

    # 11. Aprovação
    add_heading(doc, '11. APROVAÇÃO DO PROJETO', level=1)
    add_table(doc,
        ['Papel', 'Nome', 'Assinatura', 'Data'],
        [
            ['Gestor do Projeto', 'Wallace Almeida dos Santos', '', '05/04/2026'],
            ['Patrocinador Técnico', 'Wallace Almeida dos Santos', '', ''],
            ['Patrocinador Demandante', '[preencher]', '', '']
        ]
    )

    doc.add_paragraph()
    add_paragraph(doc, 'Documento criado em 05 de abril de 2026')
    add_paragraph(doc, 'Versão 1.2 - Igreja Connect')
    add_paragraph(doc, 'Atualização: Revisão de status do projeto em 12/06/2026')

    output_path = 'docs/TERMO DE ABERTURA DO PROJETO MINHA IGREJA v1.2.docx'
    doc.save(output_path)
    print(f'Documento Word atualizado gerado com sucesso: {output_path}')


if __name__ == '__main__':
    main()
