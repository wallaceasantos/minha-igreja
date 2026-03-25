<?php
/**
 * Verifica configuração do ambiente
 */
header('Content-Type: text/plain');

echo "=== DIAGNÓSTICO DO SERVIDOR ===\n\n";

echo "1. DADOS DO REQUEST:\n";
echo "   DOCUMENT_ROOT: " . ($_SERVER['DOCUMENT_ROOT'] ?? 'N/A') . "\n";
echo "   SCRIPT_FILENAME: " . ($_SERVER['SCRIPT_FILENAME'] ?? 'N/A') . "\n";
echo "   REQUEST_URI: " . ($_SERVER['REQUEST_URI'] ?? 'N/A') . "\n";
echo "   HTTPS: " . ($_SERVER['HTTPS'] ?? 'N/A') . "\n";
echo "   SERVER_SOFTWARE: " . ($_SERVER['SERVER_SOFTWARE'] ?? 'N/A') . "\n";
echo "   PHP_SAPI: " . php_sapi_name() . "\n";
echo "\n";

echo "2. PHP VERSION:\n";
echo "   " . phpversion() . "\n";
echo "\n";

echo "3. ARQUIVOS .htaccess NO CAMINHO:\n";
$paths = [
    '/',
    '/public_html',
    '/public_html/plataforma',
    '/public_html/plataforma/api'
];

foreach ($paths as $path) {
    $fullPath = $_SERVER['DOCUMENT_ROOT'] . $path . '/.htaccess';
    if (file_exists($fullPath)) {
        echo "   [EXISTS] $fullPath\n";
    } else {
        echo "   [MISSING] $fullPath\n";
    }
}
echo "\n";

echo "4. MÓDULOS CARREGADOS:\n";
if (function_exists('apache_get_modules')) {
    $modules = apache_get_modules();
    $php_related = array_filter($modules, function($m) {
        return stripos($m, 'php') !== false || stripos($m, 'mime') !== false;
    });
    foreach ($php_related as $module) {
        echo "   - $module\n";
    }
} else {
    echo "   apache_get_modules() não disponível\n";
}
echo "\n";

echo "5. DIRETIVA PHP HANDLER:\n";
echo "   Se PHP está executando, este arquivo está funcionando!\n";
echo "   Se fez download, handler PHP NÃO está aplicado.\n";
echo "\n";

echo "=== FIM DO DIAGNÓSTICO ===\n";
