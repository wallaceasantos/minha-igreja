# Script de Upload FTP - Igreja Connect - Diagnóstico
# Execute no PowerShell: .\upload-diagnostico.ps1

$ftpServer = "ftp.ccjv.com.br"
$ftpUser = "walla573_admin"
$ftpPass = Read-Host "Digite a senha FTP" -AsSecureString
$ftpPassPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($ftpPass))

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  UPLOAD DE DIAGNÓSTICO - Igreja Connect" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Servidor: $ftpServer"
Write-Host "Usuário: $ftpUser"
Write-Host ""

# Função para upload
function Upload-File {
    param(
        [string]$LocalFile,
        [string]$RemoteFile,
        [string]$Description
    )
    
    Write-Host "[$Description] $LocalFile -> $RemoteFile" -NoNewline
    
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

Write-Host ""
Write-Host "=== PASSO 1: .htaccess ===" -ForegroundColor Yellow

Upload-File ".\backend\.htaccess" "/public_html/plataforma/.htaccess" ".htaccess (Raiz)"
Upload-File ".\backend\api\.htaccess" "/public_html/plataforma/api/.htaccess" ".htaccess (API)"

Write-Host ""
Write-Host "=== PASSO 2: Arquivos de Teste ===" -ForegroundColor Yellow

Upload-File ".\backend\teste.php" "/public_html/plataforma/teste.php" "teste.php (Raiz)"
Upload-File ".\backend\api\test-simples-novo.php" "/public_html/plataforma/api/test-simples-novo.php" "test-simples-novo.php"
Upload-File ".\backend\api\diagnostico.php" "/public_html/plataforma/api/diagnostico.php" "diagnostico.php"
Upload-File ".\backend\api\ambiente-test.php" "/public_html/plataforma/api/ambiente-test.php" "ambiente-test.php"

Write-Host ""
Write-Host "=== UPLOAD CONCLUÍDO ===" -ForegroundColor Green
Write-Host ""
Write-Host "AGORA TESTE NO NAVEGADOR (nesta ordem):" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. https://plataforma.ccjv.com.br/teste.php" -ForegroundColor White
Write-Host "   Esperado: JSON com status OK"
Write-Host ""
Write-Host "2. https://plataforma.ccjv.com.br/api/test-simples-novo.php" -ForegroundColor White
Write-Host "   Esperado: JSON com conexão do banco"
Write-Host ""
Write-Host "3. https://plataforma.ccjv.com.br/api/diagnostico.php" -ForegroundColor White
Write-Host "   Esperado: JSON com informações do ambiente"
Write-Host ""
Write-Host "4. https://plataforma.ccjv.com.br/api/ambiente-test.php" -ForegroundColor White
Write-Host "   Esperado: JSON detalhado"
Write-Host ""
Write-Host "Se algum teste fizer DOWNLOAD ao invés de mostrar JSON," -ForegroundColor Red
Write-Host "siga as instruções no arquivo DEPLOY_GUIDE.md" -ForegroundColor Red
Write-Host ""
