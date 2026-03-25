# 🚀 DEPLOY RÁPIDO - 15 Minutos

## Opção Mais Rápida: Netlify + InfinityFree

### ⚡ 1. Frontend na Netlify (3 minutos)

```bash
# Build
npm run build

# Deploy (arraste a pasta dist/ para netlify.com)
# Ou use CLI:
npx vercel
```

**URL:** `https://seu-projeto.netlify.app`

---

### ⚡ 2. Backend na InfinityFree (10 minutos)

1. **Crie conta:** https://infinityfree.net/ (2 min)
2. **Crie site:** Escolha subdomínio grátis (1 min)
3. **Crie banco:** Painel → MySQL (2 min)
4. **Upload arquivos:** (3 min)
   - Via FileZilla ou File Manager
   - Pasta `/htdocs/`
5. **Importe banco:** phpMyAdmin → SQL (2 min)

**URL:** `https://seusite.rf.gd/api/`

---

### ⚡ 3. Configure API URL (2 minutos)

Edite `src/services/api.ts`:
```typescript
export const API_BASE_URL = 'https://seusite.rf.gd/api';
```

Rebuild:
```bash
npm run build
```

---

## ✅ Pronto!

- Frontend: `https://seu-projeto.netlify.app`
- Backend: `https://seusite.rf.gd/api/`
- Custo: **R$ 0,00/mês**

---

## 📁 Arquivos para Upload (Backend)

```
/htdocs/
├── api/
│   ├── .htaccess
│   ├── test-simples.php
│   ├── church.php
│   ├── contact.php
│   └── criar-igreja.php
├── config/
│   └── config.php
├── includes/
│   ├── Database.php
│   ├── TenantMiddleware.php
│   └── RateLimiter.php
└── .ccjv_secrets.php
```

---

## 🧪 Teste

```
https://seusite.rf.gd/api/test-simples.php
```

Deve mostrar JSON com `"success": true`

---

## 📖 Instruções Completas

Veja `DEPLOY_GRATIS_MASTER.md` para guia completo.
