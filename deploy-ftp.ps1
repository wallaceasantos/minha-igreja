# Script de Deploy FTP - Igreja Connect
# Execute: .\deploy-ftp.ps1

$ftpServer = "ftp.ccjv.com.br"
$ftpUser = "walla573_admin"
$ftpPass = Read-Host "Digite a senha FTP" -AsSecureString
$ftpPassPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($ftpPass))

$localPath = ".\backend\api"
$remotePath = "/public_html/plataforma/api"

Write-Host "=== DEPLOY FTP - Igreja Connect ===" -ForegroundColor Green
Write-Host "Servidor: $ftpServer"
Write-Host "Destino: $remotePath"
Write-Host ""

# Arquivos para enviar
$files = @(
    ".htaccess",
    "teste-copy.php",
    "teste-minimo.php",
    "criar-igreja.php",
    "config/config.php",
    "includes/Database.php",
    "includes/TenantMiddleware.php",
    "includes/RateLimiter.php"
)

foreach ($file in $files) {
    $localFile = Join-Path $localPath $file
    $remoteFile = "$remotePath/$file"

    if (Test-Path $localFile) {
        Write-Host "Enviando: $file ..." -NoNewline

        try {
            $uri = "ftp://$ftpServer$remoteFile"
            $credential = New-Object System.Net.NetworkCredential($ftpUser, $ftpPassPlain)

            $webclient = New-Object System.Net.WebClient
            $webclient.Credentials = $credential
            $webclient.UploadFile($uri, $localFile)

            Write-Host " OK" -ForegroundColor Green
        } catch {
            Write-Host " ERRO: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "Arquivo não encontrado: $localFile" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== Deploy concluído ===" -ForegroundColor Green
Write-Host "Teste em: https://plataforma.ccjv.com.br/api/teste-copy.php"
