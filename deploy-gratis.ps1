# Deploy Automático - Igreja Connect (GRÁTIS)
# Netlify + InfinityFree

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  DEPLOY GRATUITO - Igreja Connect" -ForegroundColor Cyan
Write-Host "  Frontend: Netlify | Backend: InfinityFree" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# =====================
# FRONTEND - NETLIFY
# =====================

Write-Host "=== FRONTEND - NETLIFY ===" -ForegroundColor Yellow
Write-Host ""

# Verificar se Netlify CLI está instalado
$netlifyInstalled = netlify --version 2>$null
if (-not $netlifyInstalled) {
    Write-Host "Instalando Netlify CLI..." -NoNewline
    npm install -g netlify-cli > $null 2>&1
    Write-Host " OK" -ForegroundColor Green
} else {
    Write-Host "Netlify CLI já instalado" -ForegroundColor Green
}

# Build do React
Write-Host ""
Write-Host "Criando build do React..." -NoNewline
npm run build > $null 2>&1
Write-Host " OK" -ForegroundColor Green

# Verificar pasta dist
if (!(Test-Path ".\dist")) {
    Write-Host "ERRO: Pasta dist/ não encontrada!" -ForegroundColor Red
    exit 1
}

# Login Netlify
Write-Host ""
Write-Host "Faça login no Netlify:" -ForegroundColor Yellow
Write-Host "  O navegador vai abrir automaticamente..." -ForegroundColor Yellow
netlify login

# Deploy
Write-Host ""
Write-Host "Enviando frontend para Netlify..." -ForegroundColor Yellow
$deployResult = netlify deploy --prod --dir=dist 2>&1
Write-Host $deployResult

# Extrair URL do frontend
$frontendUrl = $deployResult | Select-String "Website Draft URL" | ForEach-Object { $_.Line -replace ".*Website Draft URL: ", "" }

# =====================
# BACKEND - INFINITYFREE
# =====================

Write-Host ""
Write-Host "=== BACKEND - INFINITYFREE ===" -ForegroundColor Yellow
Write-Host ""

Write-Host "Instruções para Backend:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Acesse: https://infinityfree.net/" -ForegroundColor White
Write-Host "2. Crie conta grátis (ou login)" -ForegroundColor White
Write-Host "3. Crie um novo site com subdomínio grátis" -ForegroundColor White
Write-Host "4. Anote as credenciais FTP e do Banco de Dados" -ForegroundColor White
Write-Host ""

Write-Host "Dados para configurar no backend:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Arquivo: backend/.ccjv_secrets.php" -ForegroundColor Cyan
Write-Host ""

# Template .ccjv_secrets.php
$secretsTemplate = @"
<?php
// InfinityFree Secrets

return [
    'db_host' => 'sqlXXX.infinityfree.com',  // Troque pelo host do seu banco
    'db_name' => 'epiz_XXXXXXX_ccjv',        // Troque pelo nome do seu banco
    'db_user' => 'epiz_XXXXXXX',             // Troque pelo seu usuário
    'db_pass' => 'SUA_SENHA',                // Troque pela sua senha
    'gmail_user' => 'ccjv1670@gmail.com',
    'gmail_password' => '',
    'telegram_bot_token' => '',
    'telegram_chat_id' => '',
];
"@

Write-Host $secretsTemplate -ForegroundColor White
Write-Host ""

Write-Host "Upload via FTP (FileZilla):" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Host: ftpupload.net (ou o que InfinityFree fornecer)" -ForegroundColor White
Write-Host "  User: epiz_XXXXXXX (seu usuário)" -ForegroundColor White
Write-Host "  Pass: (sua senha)" -ForegroundColor White
Write-Host "  Path: /htdocs/" -ForegroundColor White
Write-Host ""

Write-Host "Arquivos para upload:" -ForegroundColor Cyan
Write-Host ""

$backendFiles = @(
    "backend/api/.htaccess",
    "backend/api/criar-igreja.php",
    "backend/api/church.php",
    "backend/api/contact.php",
    "backend/api/test-simples.php",
    "backend/api/config/config.php",
    "backend/api/includes/Database.php",
    "backend/api/includes/TenantMiddleware.php",
    "backend/api/includes/RateLimiter.php",
    "backend/.ccjv_secrets.php"
)

foreach ($file in $backendFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (NÃO ENCONTRADO)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== PRÓXIMOS PASSOS ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. No InfinityFree:" -ForegroundColor Yellow
Write-Host "   - Acesse phpMyAdmin" -ForegroundColor White
Write-Host "   - Importe o script: database/update_database_final.sql" -ForegroundColor White
Write-Host ""

Write-Host "2. Atualize a URL da API no React:" -ForegroundColor Yellow
Write-Host "   Edite: src/services/api.ts" -ForegroundColor White
Write-Host "   Mude para: const API_BASE_URL = 'https://seusite.rf.gd/api';" -ForegroundColor White
Write-Host ""

Write-Host "3. Teste a API:" -ForegroundColor Yellow
Write-Host "   https://seusite.rf.gd/api/test-simples.php" -ForegroundColor White
Write-Host ""

Write-Host "4. Rebuild e deploy do frontend:" -ForegroundColor Yellow
Write-Host "   npm run build" -ForegroundColor White
Write-Host "   netlify deploy --prod" -ForegroundColor White
Write-Host ""

Write-Host "=== URLs FINAIS ===" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend: https://seuprojeto.netlify.app" -ForegroundColor Cyan
Write-Host "  Backend:  https://seusite.rf.gd/api/" -ForegroundColor Cyan
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Deploy iniciado com sucesso!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
