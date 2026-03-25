# 📚 Documentação Igreja Connect

Bem-vindo à documentação do Igreja Connect - Plataforma SaaS multi-tenant para igrejas.

---

## 📖 Índice de Documentação

### **Geral**
- [README.md](../README.md) - Visão geral do projeto
- [CHANGELOG.md](./CHANGELOG.md) - Histórico de mudanças
- [DARK_MODE.md](./DARK_MODE.md) - Implementação do modo escuro

### **Implementação Multi-Tenant**
- [MULTI_TENANT_IMPLEMENTACAO.md](./MULTI_TENANT_IMPLEMENTACAO.md) - Guia completo de implementação
- [RESUMO_MULTI_TENANT.md](./RESUMO_MULTI_TENANT.md) - Resumo da transformação

### **Deploy e Hospedagem**
- [HOSTGATOR_DEPLOY.md](./HOSTGATOR_DEPLOY.md) - Guia de deploy na HostGator
- [CHECKLIST_HOSTGATOR.md](./CHECKLIST_HOSTGATOR.md) - Checklist de implantação
- [CONFIGURACAO_CCJV.md](./CONFIGURACAO_CCJV.md) - Configuração do domínio ccjv.com.br

### **Backend**
- [BACKEND_README.md](./BACKEND_README.md) - Documentação do backend PHP

### **Frontend**
- [FRONTEND_VISUAL.md](./FRONTEND_VISUAL.md) - Representação visual do frontend
- [IMAGE_GENERATION_PROMPTS.md](./IMAGE_GENERATION_PROMPTS.md) - Prompts para IA de imagens

### **Limpeza e Organização**
- [CLEANUP_REPORT.md](./CLEANUP_REPORT.md) - Relatório de limpeza do projeto

---

## 🗂️ Estrutura do Projeto

```
igreja-connect/
├── 📁 docs/                    # Documentação (esta pasta)
├── 📁 backend/                 # Backend PHP
│   ├── api/                   # APIs da aplicação
│   ├── config/                # Configurações
│   └── includes/              # Classes utilitárias
├── 📁 database/                # Scripts de banco de dados
├── 📁 src/                     # Código fonte React
│   ├── components/            # Componentes React
│   ├── pages/                 # Páginas da aplicação
│   ├── hooks/                 # Hooks personalizados
│   └── lib/                   # Bibliotecas e utilitários
├── 📁 public/                  # Arquivos públicos
├── .env                        # Variáveis de ambiente (produção)
├── .env.example                # Modelo de variáveis de ambiente
├── package.json                # Dependências do projeto
└── README.md                   # Documentação principal
```

---

## 🚀 Links Rápidos

### **Para Desenvolvedores**
- [Backend README](./BACKEND_README.md) - APIs e configuração do backend
- [Multi-Tenant Implementação](./MULTI_TENANT_IMPLEMENTACAO.md) - Arquitetura multi-tenant
- [HostGator Deploy](./HOSTGATOR_DEPLOY.md) - Guia de deploy

### **Para Implantação**
- [Checklist HostGator](./CHECKLIST_HOSTGATOR.md) - Passo a passo de implantação
- [Configuração CCJV](./CONFIGURACAO_CCJV.md) - Configuração do domínio

### **Para Design**
- [Frontend Visual](./FRONTEND_VISUAL.md) - Representação visual das páginas
- [Image Generation](./IMAGE_GENERATION_PROMPTS.md) - Prompts para geração de imagens

---

## 📝 Notas Importantes

### **Variáveis de Ambiente**

Existem 2 arquivos principais:

1. **`.env`** - Variáveis de ambiente atuais (produção)
   - Configure com os dados reais do servidor
   - **Não commitar no Git**

2. **`.env.example`** - Modelo de variáveis de ambiente
   - Template para novos desenvolvedores
   - **Pode ser commitado no Git**

### **Banco de Dados**

Os scripts de banco de dados estão em:
- `database/multi_tenant_schema.sql` - Schema completo multi-tenant

### **Backend PHP**

O backend está organizado em:
- `backend/api/` - Endpoints da API
- `backend/includes/` - Classes utilitárias
- `backend/config/` - Configurações

---

## 🆘 Suporte

Para dúvidas ou problemas, consulte:
1. [README.md](../README.md) - Visão geral
2. [BACKEND_README.md](./BACKEND_README.md) - Backend
3. [HOSTGATOR_DEPLOY.md](./HOSTGATOR_DEPLOY.md) - Deploy

---

**Última atualização:** Março de 2026
