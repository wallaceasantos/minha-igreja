<?php
/**
 * Teste de Ambiente - Verifica se PHP está processando
 * Se ver este JSON, PHP está funcionando!
 */

header('Content-Type: application/json');

$result = [
    'teste' => 'AMBIENTE',
    'status' => 'SUCESSO',
    'mensagem' => 'PHP está processando corretamente!',
    'detalhes' => [
        'php_version' => phpversion(),
        'php_sapi' => php_sapi_name(),
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'N/A',
        'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'N/A',
        'script_path' => __FILE__,
        'script_filename' => $_SERVER['SCRIPT_FILENAME'] ?? 'N/A',
        'request_uri' => $_SERVER['REQUEST_URI'] ?? 'N/A',
        'https' => $_SERVER['HTTPS'] ?? 'N/A',
        'server_port' => $_SERVER['SERVER_PORT'] ?? 'N/A',
    ],
    'timestamp' => date('Y-m-d H:i:s')
];

echo json_encode($result, JSON_PRETTY_PRINT);
