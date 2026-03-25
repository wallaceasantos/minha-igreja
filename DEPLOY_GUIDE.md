# 📋 GUIA DE UPLOAD E TESTE - Igreja Connect

## 🚨 PROBLEMA ATUAL
Arquivos PHP na pasta `/api/` estão fazendo download em vez de executar.

---

## 📤 ARQUIVOS PARA ENVIAR (ORDEM CRÍTICA)

### Passo 1: .htaccess da RAIZ (/plataforma/)
**Arquivo:** `backend/.htaccess`
**Destino:** `/public_html/plataforma/.htaccess`
**Ação:** Substituir o existente

### Passo 2: .htaccess da API (/plataforma/api/)
**Arquivo:** `backend/api/.htaccess`
**Destino:** `/public_html/plataforma/api/.htaccess`
**Ação:** Substituir o existente

### Passo 3: Arquivos de Teste
**Arquivos:**
- `backend/api/test-simples-novo.php` → `/public_html/plataforma/api/test-simples-novo.php`
- `backend/api/diagnostico.php` → `/public_html/plataforma/api/diagnostico.php`
- `backend/api/ambiente-test.php` → `/public_html/plataforma/api/ambiente-test.php`
- `backend/teste.php` → `/public_html/plataforma/teste.php`

### Passo 4: Arquivos da API (se testes funcionarem)
**Arquivos:**
- `backend/api/church-create.php` → `/public_html/plataforma/api/church-create.php`
- `backend/api/criar-igreja.php` → `/public_html/plataforma/api/criar-igreja.php`
- `backend/api/config/config.php` → `/public_html/plataforma/api/config/config.php`
- `backend/api/includes/Database.php` → `/public_html/plataforma/api/includes/Database.php`
- `backend/api/includes/TenantMiddleware.php` → `/public_html/plataforma/api/includes/TenantMiddleware.php`
- `backend/api/includes/RateLimiter.php` → `/public_html/plataforma/api/includes/RateLimiter.php`

---

## 🧪 TESTES NO NAVEGADOR (ORDEM)

### Teste 1: Raiz do site
```
https://plataforma.ccjv.com.br/teste.php
```
**Resultado esperado:** JSON com status OK

### Teste 2: API - Simples
```
https://plataforma.ccjv.com.br/api/test-simples-novo.php
```
**Resultado esperado:** JSON com conexão do banco

### Teste 3: API - Diagnóstico
```
https://plataforma.ccjv.com.br/api/diagnostico.php
```
**Resultado esperado:** JSON com informações do ambiente

### Teste 4: API - Ambiente
```
https://plataforma.ccjv.com.br/api/ambiente-test.php
```
**Resultado esperado:** JSON detalhado do ambiente

---

## 🔧 SE OS TESTES FALHAREM (Download ao invés de JSON)

### Solução A: Forçar reconfiguração do PHP no cPanel

1. Acesse **cPanel → MultiPHP Manager**
2. Selecione `plataforma.ccjv.com.br`
3. Mude para **PHP 8.1** → Clique em "Apply"
4. Aguarde 30 segundos
5. Volte para **PHP 8.3** → Clique em "Apply"
6. Aguarde 1 minuto
7. Teste novamente

### Solução B: Verificar permissões via FTP

```bash
# Pastas
chmod 755 /public_html/plataforma/
chmod 755 /public_html/plataforma/api/
chmod 755 /public_html/plataforma/api/config/
chmod 755 /public_html/plataforma/api/includes/

# Arquivos
chmod 644 /public_html/plataforma/.htaccess
chmod 644 /public_html/plataforma/api/.htaccess
chmod 644 /public_html/plataforma/api/*.php
chmod 644 /public_html/plataforma/*.php
```

### Solução C: Criar arquivo de teste direto no File Manager

1. Acesse **cPanel → File Manager**
2. Navegue até `/public_html/plataforma/api/`
3. Clique em **"+ File"** (canto superior esquerdo)
4. Nome: `teste-cpanel.php`
5. Clique direito no arquivo → **Edit**
6. Cole:
   ```php
   <?php echo json_encode(['test' => 'cpanel', 'ok' => true]);
   ```
7. Salve
8. Acesse: `https://plataforma.ccjv.com.br/api/teste-cpanel.php`

### Solução D: Verificar .htaccess pai

1. Acesse **cPanel → File Manager**
2. Vá para `/public_html/` (pai de plataforma)
3. Verifique se existe `.htaccess`
4. Se existir, renomeie para `.htaccess.old` temporariamente
5. Teste novamente

### Solução E: Contatar Suporte HostGator

**Template de ticket:**

```
Assunto: PHP não executa na subpasta /api/ - arquivos fazem download

Descrição:
Olá, estou com um problema crítico no meu site plataforma.ccjv.com.br.

Arquivos PHP na pasta /public_html/plataforma/api/ estão fazendo download 
ao invés de serem executados pelo servidor.

Já verifiquei:
- Permissões dos arquivos (644 para arquivos, 755 para pastas)
- .htaccess da pasta api/ está correto
- PHP 8.3 está ativo no MultiPHP Manager
- Arquivos PHP na raiz (/public_html/plataforma/) funcionam normalmente

Testes realizados:
- test-simples.php funciona
- Arquivos novos (.php) fazem download
- Criar arquivo via File Manager também faz download

Poderiam verificar se há alguma configuração específica do Apache 
bloqueando execução de PHP na subpasta /api/?

Obrigado.
```

---

## ✅ QUANDO OS TESTES FUNCIONAREM

### Enviar arquivos restantes da API:

1. `church-create.php` (API de criar igreja)
2. `criar-igreja.php` (mesma função, nome alternativo)
3. `config/config.php`
4. `includes/Database.php`
5. `includes/TenantMiddleware.php`
6. `includes/RateLimiter.php`

### Testar criação de igreja:

```bash
curl -X POST https://plataforma.ccjv.com.br/api/church-create.php \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Igreja Teste",
    "slug": "igreja-teste",
    "email": "teste@igreja.com",
    "admin": {
      "name": "Admin Teste",
      "email": "admin@igreja.com",
      "password": "123456",
      "confirmPassword": "123456"
    }
  }'
```

---

## 📞 CONTATO DE EMERGÊNCIA

**HostGator Suporte:**
- Chat 24/7 via cPanel
- Ticket: https://www.hostgator.com.br/support

**Informações do Site:**
- Domínio: plataforma.ccjv.com.br
- Caminho: /public_html/plataforma/
- PHP: 8.3 (ea-php83)

---

## 📝 CHECKLIST FINAL

- [ ] .htaccess raiz enviado
- [ ] .htaccess api enviado
- [ ] teste.php na raiz funciona
- [ ] test-simples-novo.php na api funciona
- [ ] diagnostico.php na api funciona
- [ ] church-create.php enviado
- [ ] config/config.php enviado
- [ ] includes/ enviado
- [ ] Teste de criação de igreja funciona
- [ ] Frontend React integrado

---

**Última atualização:** 2026-03-25
**Status:** Em diagnóstico
