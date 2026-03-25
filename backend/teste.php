<?php
header('Content-Type: application/json');
echo json_encode([
    'status' => 'OK',
    'message' => 'PHP funcionando!',
    'time' => date('Y-m-d H:i:s'),
    'php_version' => phpversion(),
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'N/A'
]);
