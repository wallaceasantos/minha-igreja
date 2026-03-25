<?php
/**
 * Teste de Conexão SIMPLES
 * Acesse: https://plataforma.ccjv.com.br/api/test-simples-novo.php
 */

// Mostrar erros
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

// Credenciais DIRETAS (sem config.php)
$db_host = 'localhost';
$db_name = 'walla573_ccjv_sistema';
$db_user = 'walla573_admin';
$db_pass = 'S100cem%';

try {
    // Conectar
    $dsn = "mysql:host={$db_host};dbname={$db_name};charset=utf8mb4";
    $pdo = new PDO($dsn, $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    // Sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Conexão bem-sucedida!',
        'db_name' => $db_name,
        'db_user' => $db_user,
        'db_host' => $db_host,
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro na conexão',
        'message' => $e->getMessage(),
        'code' => $e->getCode(),
        'db_name' => $db_name,
        'db_user' => $db_user,
        'db_host' => $db_host,
    ]);
}
