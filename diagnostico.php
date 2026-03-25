#!/usr/bin/env php
<?php
/**
 * Script de Upload e Diagnóstico via SSH/FTP
 * Igreja Connect
 */

echo "=== IGREJA CONNECT - DIAGNÓSTICO COMPLETO ===\n\n";

// Verifica se PHP CLI está disponível
if (php_sapi_name() !== 'cli') {
    die("Este script deve ser executado via CLI\n");
}

echo "PHP Version: " . phpversion() . "\n";
echo "SAPI: " . php_sapi_name() . "\n\n";

// Lista de arquivos para upload
$files = [
    '.htaccess' => '/home2/walla573/plataforma.ccjv.com.br/.htaccess',
    'api/.htaccess' => '/home2/walla573/plataforma.ccjv.com.br/api/.htaccess',
    'teste.php' => '/home2/walla573/plataforma.ccjv.com.br/teste.php',
    'api/teste.php' => '/home2/walla573/plataforma.ccjv.com.br/api/teste.php',
    'api/criar-igreja.php' => '/home2/walla573/plataforma.ccjv.com.br/api/criar-igreja.php',
];

echo "Arquivos para upload:\n";
foreach ($files as $local => $remote) {
    $exists = file_exists(__DIR__ . '/' . $local) ? '✓' : '✗';
    echo "  [$exists] $local -> $remote\n";
}

echo "\n";
echo "=== INSTRUÇÕES ===\n\n";

echo "1. Acesse cPanel → File Manager\n";
echo "2. Navegue até: /home2/walla573/plataforma.ccjv.com.br/\n";
echo "3. Delete o .htaccess existente\n";
echo "4. Crie NOVO arquivo .htaccess com este conteúdo:\n\n";

echo file_get_contents(__DIR__ . '/.htaccess');

echo "\n5. Salve e teste: https://plataforma.ccjv.com.br/teste.php\n\n";

echo "=== SE AINDA FALHAR ===\n\n";
echo "Contate HostGator com este template:\n\n";
echo "---\n";
echo "ASSUNTO: Urgente - PHP não executa no subdomínio\n\n";
echo "Mensagem:\n\n";
echo "Olá,\n\n";
echo "Meu subdomínio plataforma.ccjv.com.br está com problema crítico.\n";
echo "Arquivos .php fazem DOWNLOAD em vez de executar.\n\n";
echo "Já tentei:\n";
echo "- Múltiplas versões de .htaccess\n";
echo "- Permissões 644 para arquivos\n";
echo "- PHP 8.3 confirmado no MultiPHP Manager\n";
echo "- Recriar .htaccess manualmente\n\n";
echo "Por favor verifiquem:\n";
echo "- Se módulo PHP está ativo para minha conta\n";
echo "- Se há bloqueio no mime_module\n";
echo "- Se handler application/x-httpd-php83 está disponível\n\n";
echo "Domínio: plataforma.ccjv.com.br\n";
echo "Path: /home2/walla573/plataforma.ccjv.com.br/\n\n";
echo "Teste: https://plataforma.ccjv.com.br/teste.php (faz download)\n\n";
echo "URGENTE - produção parada.\n\n";
echo "Obrigado.\n";
echo "---\n\n";
