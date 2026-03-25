# Deploy Frontend - Netlify (GRÁTIS)

## Passo 1: Build do React
```bash
npm run build
```

## Passo 2: Deploy (2 opções)

### Opção A: Arrastar e Soltar (Mais fácil)
1. Acesse: https://app.netlify.com/
2. Crie conta grátis (GitHub/Google)
3. Na página inicial, arraste a pasta `dist/` para a área de deploy
4. Pronto! Site no ar em segundos

### Opção B: CLI (Mais controle)
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist

# Ou link com repositório
netlify init
netlify deploy --prod
```

## Passo 3: Configurar URL da API

No seu código React, atualize a URL da API:

```typescript
// src/services/api.ts
const API_BASE_URL = 'https://seusite.000webhostapp.com/api';
// ou
const API_BASE_URL = 'https://seusite.rf.gd/api';
```

## Passo 4: Domínio Personalizado (Opcional)

1. Netlify → Domain Settings
2. Add custom domain
3. Configure DNS no seu domínio (ccjv.com.br)
4. Aponte: `plataforma.ccjv.com.br` → Netlify

## Limites Netlify:
✅ 100GB banda/mês
✅ Sites ilimitados
✅ SSL automático
✅ CDN global
✅ Forms (100 submissions/mês)
✅ Functions (300k req/mês)

## URL Final:
- Produção: https://seu-projeto.netlify.app
- Ou domínio próprio: https://plataforma.ccjv.com.br
