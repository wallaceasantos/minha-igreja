# Script de Upload Final - Igreja Connect
# Execute: .\upload-final.ps1

$ftpServer = "ftp.ccjv.com.br"
$ftpUser = "walla573_admin"
$ftpPass = Read-Host "Digite a senha FTP" -AsSecureString
$ftpPassPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($ftpPass))

Write-Host ""
Write-Host "========================================" -ForegroundColor Red
Write-Host "  UPLOAD FINAL - Igreja Connect" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

function Upload-File {
    param([string]$LocalFile, [string]$RemoteFile)
    
    Write-Host "Enviando: $LocalFile" -NoNewline
    
    if (!(Test-Path $LocalFile)) {
        Write-Host " ARQUIVO NÃO ENCONTRADO" -ForegroundColor Red
        return $false
    }
    
    try {
        $uri = "ftp://$ftpServer$RemoteFile"
        $credential = New-Object System.Net.NetworkCredential($ftpUser, $ftpPassPlain)
        $webclient = New-Object System.Net.WebClient
        $webclient.Credentials = $credential
        $webclient.UploadFile($uri, $LocalFile)
        Write-Host " OK" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host " ERRO: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "=== ARQUIVOS CRÍTICOS ===" -ForegroundColor Yellow
Upload-File ".\backend\.htaccess" "/plataforma.ccjv.com.br/.htaccess"
Upload-File ".\backend\api\.htaccess" "/plataforma.ccjv.com.br/api/.htaccess"
Upload-File ".\backend\teste.php" "/plataforma.ccjv.com.br/teste.php"
Upload-File ".\backend\api\teste.php" "/plataforma.ccjv.com.br/api/teste.php"

Write-Host ""
Write-Host "=== ARQUIVOS DA API (se testes funcionarem) ===" -ForegroundColor Yellow
Upload-File ".\backend\api\criar-igreja.php" "/plataforma.ccjv.com.br/api/criar-igreja.php"
Upload-File ".\backend\api\config\config.php" "/plataforma.ccjv.com.br/api/config/config.php"
Upload-File ".\backend\api\includes\Database.php" "/plataforma.ccjv.com.br/api/includes/Database.php"
Upload-File ".\backend\api\includes\TenantMiddleware.php" "/plataforma.ccjv.com.br/api/includes/TenantMiddleware.php"
Upload-File ".\backend\api\includes\RateLimiter.php" "/plataforma.ccjv.com.br/api/includes/RateLimiter.php"

Write-Host ""
Write-Host "=== UPLOAD CONCLUÍDO ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "TESTE AGORA:" -ForegroundColor Yellow
Write-Host "  https://plataforma.ccjv.com.br/teste.php" -ForegroundColor White
Write-Host ""
Write-Host "Se ainda fizer DOWNLOAD:" -ForegroundColor Red
Write-Host "  1. Acesse cPanel → File Manager" -ForegroundColor Yellow
Write-Host "  2. Vá para: /home2/walla573/plataforma.ccjv.com.br/" -ForegroundColor Yellow
Write-Host "  3. Delete .htaccess existente" -ForegroundColor Yellow
Write-Host "  4. Crie NOVO .htaccess manualmente" -ForegroundColor Yellow
Write-Host "  5. Cole o conteúdo de backend/.htaccess" -ForegroundColor Yellow
Write-Host "  6. Salve e teste novamente" -ForegroundColor Yellow
Write-Host ""
Write-Host "Se ainda falhar, contate HostGator (veja SUPORTE_HOSTGATOR.md)" -ForegroundColor Red
Write-Host ""
