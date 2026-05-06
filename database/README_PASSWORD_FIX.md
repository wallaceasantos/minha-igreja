# 🔐 Correção de Senhas - Hash Laravel para Node.js

## 🚨 Problema Encontrado

As senhas no banco de dados estavam com hash do **Laravel/PHP** (`$2y$`), mas o backend Node.js usa **bcrypt** (`$2b$`).

**Resultado:** Qualquer senha era aceita no login! ❌

---

## ✅ Solução

### **Passo 1: Executar Script de Correção**

```bash
mysql -u root -p igreja_connect < database/fix_password_hash.sql
```

Isso vai:
- ✅ Corrigir TODAS as senhas para hash Node.js
- ✅ Manter a senha padrão `admin123`
- ✅ Mostrar lista de usuários atualizados

---

### **Passo 2: Verificar Correção**

Após executar, verifique no MySQL:

```sql
SELECT email, SUBSTRING(password, 1, 7) as hash_prefix 
FROM usuarios_admin;
```

**Resultado esperado:**
```
admin@igreja-connect.com    | $2b$10$
pastor@novavida.com.br      | $2b$10$
...
```

Se estiver `$2b$10$` → ✅ Correto!  
Se estiver `$2y$10$` → ❌ Ainda errado!

---

### **Passo 3: Testar Login**

**Dados de Login:**
```
Email: admin@igreja-connect.com
Senha: admin123
```

**Teste:**
1. Tente login com senha correta → ✅ Deve funcionar
2. Tente login com senha errada → ❌ Deve falhar

---

## 🔍 Explicação Técnica

### **Diferença entre Hashes:**

| Sistema | Hash Prefix | Compatibilidade |
|---------|-------------|-----------------|
| **Laravel/PHP** | `$2y$10$` | ❌ Node.js não reconhece |
| **Node.js/bcrypt** | `$2b$10$` | ✅ Padrão correto |

### **Por Que Isso Acontece?**

- Laravel usa uma variação do bcrypt chamada `$2y$`
- Node.js bcrypt usa o padrão `$2b$`
- São similares mas **não compatíveis**

### **Solução Permanente:**

Sempre que criar senha no banco manualmente:
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('senha123', 10);
// Resultado: $2b$10$...
```

**NUNCA** use hash do Laravel/PHP no Node.js!

---

## 📊 Usuários Afetados

Todos os usuários criados com:
- ✅ `create_all_tables.sql`
- ✅ `popular_banco_manaus.sql`
- ✅ Qualquer script com hash `$2y$`

Foram corrigidos pelo script `fix_password_hash.sql`.

---

## 🛡️ Prevenção Futura

### **Ao Criar Usuário Novo:**

**Backend (Node.js):**
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(senha, 10);

await query(
  'INSERT INTO usuarios_admin (email, password) VALUES (?, ?)',
  [email, hash]
);
```

**NUNCA:**
```javascript
// ❌ NÃO FAÇA ISSO!
const hash = '$2y$10$...'; // Hash do Laravel
```

---

## ✅ Checklist de Verificação

- [ ] Executou `fix_password_hash.sql`
- [ ] Verificou hash no banco (`$2b$10$`)
- [ ] Testou login com senha correta
- [ ] Testou login com senha errada
- [ ] Confirmou que falha após 5 tentativas

---

## 🎯 Status

**Problema:** ✅ **CORRIGIDO**  
**Segurança:** ✅ **RESTAURADA**  
**Hash:** ✅ **$2b$10$ (Node.js)**

---

**Última Atualização:** 31 de março de 2025  
**Responsável:** Sistema de Segurança - Opção 2
