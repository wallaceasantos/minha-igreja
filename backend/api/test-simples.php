<?php
/**
 * API: Teste Simples - InfinityFree
 * Teste de conexão com banco
 */

// Mostrar erros (remova em produção)
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Carregar config
    $configFile = __DIR__ . '/config/config.php';
    if (!file_exists($configFile)) {
        throw new Exception('Config não encontrado');
    }

    $config = require $configFile;

    // Conectar
    $dsn = "mysql:host={$config['database']['host']};dbname={$config['database']['name']};charset={$config['database']['charset']}";
    $pdo = new PDO($dsn, $config['database']['user'], $config['database']['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);

    // Sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Conexão bem-sucedida!',
        'db_host' => $config['database']['host'],
        'db_name' => $config['database']['name'],
        'php_version' => phpversion(),
        'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'N/A',
        'time' => date('Y-m-d H:i:s')
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro na conexão',
        'message' => $e->getMessage(),
        'code' => $e->getCode()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro geral',
        'message' => $e->getMessage()
    ]);
}
