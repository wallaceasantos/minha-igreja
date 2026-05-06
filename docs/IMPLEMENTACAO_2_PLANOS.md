# ✅ Implementação de 2 Planos (Free e Essencial)

## 📋 O Que Foi Feito

### **1. Banco de Dados Atualizado** ✅
- **Arquivo:** `database/update_2_planos.sql`
- Removeu planos Premium e Enterprise
- Atualizou enum para apenas `'free'` e `'essencial'`
- Igrejas Premium/Enterprise → Essencial

**Como executar:**
```bash
mysql -u root -p igreja_connect < database/update_2_planos.sql
```

---

### **2. Landing Page Atualizada** ✅
- **Arquivo:** `src/pages/LandingPage.tsx`
- Agora mostra apenas 2 planos
- Cada botão leva para `/criar` com plano selecionado

**Planos:**
- **Free:** `planValue: 'free'`
- **Essencial:** `planValue: 'essencial'` (Mais Popular)

---

### **3. Componente de Seleção de Planos** ✅
- **Arquivo:** `src/components/PlanSelection.tsx`
- Componente reutilizável para seleção de planos
- Pode ser usado em qualquer lugar

---

### **4. CreateChurch.tsx Atualizado** ⚠️
- **Status:** Parcialmente atualizado
- **O que falta:** Adicionar tela de seleção de planos

---

## 🚀 Próximos Passos (Manual)

### **Passo 1: Atualizar CreateChurch.tsx**

Adicione este código após o header no `return` do CreateChurch.tsx:

```tsx
{/* Tela de Seleção de Planos */}
{showPlanSelection && (
  <PlanSelection
    selectedPlan={selectedPlan}
    onSelectPlan={setSelectedPlan}
    onContinue={() => setShowPlanSelection(false)}
  />
)}

{/* Formulário (só aparece após selecionar plano) */}
{!showPlanSelection && (
  // ... resto do formulário atual
)}
```

**Imports necessários no topo:**
```tsx
import PlanSelection from '@/components/PlanSelection';
import { useLocation } from 'react-router-dom';
```

---

### **Passo 2: Atualizar Backend para Receber Plano**

No `backend-nodejs/src/routes/church.js`, adicione:

```javascript
// Na função de criar igreja, após validar dados:
const plan_type = req.body.plan_type || 'free';

// Validação do plano
if (!['free', 'essencial'].includes(plan_type)) {
  errors.push('Plano inválido');
}

// No INSERT da igreja:
plan_type: plan_type,
```

---

### **Passo 3: Atualizar Middleware de Limites**

No `backend-nodejs/src/middleware/planLimits.js`, atualize:

```javascript
const PLAN_LIMITS = {
  free: {
    maxMembers: 50,
    maxPrayersPerMonth: 20,
    maxAdmins: 1,
    hasLogoUpload: false,
    hasCustomDomain: false,
    hasAnalytics: false,
  },
  essencial: {
    maxMembers: 200,
    maxPrayersPerMonth: -1,
    maxAdmins: 3,
    hasLogoUpload: true,
    hasCustomDomain: true,
    hasAnalytics: true,
  },
};
```

---

## 📊 Fluxo do Usuário

### **Cenário 1: Vem da Landing Page**
```
Landing Page (/)
  ↓
Clica em "Começar Grátis" (Free)
  ↓
URL: /criar (com state.selectedPlan = 'Free')
  ↓
Pula seleção de planos
  ↓
Mostra formulário direto
```

### **Cenário 2: Acesso Direto**
```
Acesso direto: /criar
  ↓
Sem plano selecionado
  ↓
Mostra tela de seleção de planos
  ↓
Usuário escolhe Free ou Essencial
  ↓
Clica em "Selecionar"
  ↓
Mostra formulário
```

---

## ✅ Checklist Final

- [ ] Executar `update_2_planos.sql` no banco
- [ ] Testar Landing Page (2 planos)
- [ ] Adicionar PlanSelection no CreateChurch
- [ ] Atualizar backend para receber `plan_type`
- [ ] Atualizar middleware de limites
- [ ] Testar fluxo completo
- [ ] Testar acesso direto (/criar)
- [ ] Testar vindo da Landing Page

---

## 🎯 Resumo

**Atualmente:**
- ✅ Landing Page com 2 planos
- ✅ Componente PlanSelection criado
- ✅ Banco atualizado (script pronto)
- ⚠️ CreateChurch precisa de integração manual

**Tempo estimado para completar:** 30-60 minutos

**Dificuldade:** Média

---

**Quer que eu faça a integração completa agora?** Posso finalizar o CreateChurch.tsx!
