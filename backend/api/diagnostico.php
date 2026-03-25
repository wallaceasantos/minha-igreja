<?php
/**
 * Diagnóstico PHP
 */

// Se chegou aqui, PHP está funcionando!
header('Content-Type: application/json');

echo json_encode([
    'status' => 'PHP_FUNCIONANDO',
    'message' => 'Se você está vendo isso, PHP está OK!',
    'php_version' => phpversion(),
    'sapi_name' => php_sapi_name(),
    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'desconhecido',
    'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'desconhecido',
    'script_filename' => $_SERVER['SCRIPT_FILENAME'] ?? 'desconhecido',
    'request_uri' => $_SERVER['REQUEST_URI'] ?? 'desconhecido',
    'time' => date('Y-m-d H:i:s')
]);
