<?php
/**
 * Configuração do Banco de Dados
 * Usa .ccjv_secrets.php existente
 * Compatível com PHP 8.3
 */

// Caminho para .ccjv_secrets.php
$secretsFile = dirname(__DIR__) . '/.ccjv_secrets.php';

// Verificar se arquivo existe
if (!file_exists($secretsFile)) {
    throw new Exception('Arquivo .ccjv_secrets.php não encontrado em: ' . $secretsFile);
}

// Carregar segredos
$secrets = require $secretsFile;

// Retornar configuração no formato esperado
return [
    'database' => [
        'host' => $secrets['db_host'] ?? 'localhost',
        'port' => '3306',
        'name' => $secrets['db_name'] ?? 'walla573_ccjv_sistema',
        'user' => $secrets['db_user'] ?? 'walla573_admin',
        'pass' => $secrets['db_pass'] ?? '',
        'charset' => 'utf8mb4',
    ],
    'app' => [
        'env' => 'production',
        'url' => 'https://plataforma.ccjv.com.br',
        'debug' => 'false',
    ],
    'security' => [
        'jwt_secret' => '',
        'rate_limit_max' => 100,
        'rate_limit_window' => 3600,
    ],
    'mail' => [
        'host' => 'smtp.gmail.com',
        'port' => 587,
        'user' => $secrets['gmail_user'] ?? '',
        'pass' => $secrets['gmail_password'] ?? '',
        'from' => $secrets['gmail_user'] ?? 'noreply@ccjv.com.br',
        'from_name' => 'Igreja Connect',
    ],
    'telegram' => [
        'bot_token' => $secrets['telegram_bot_token'] ?? '',
        'chat_id' => $secrets['telegram_chat_id'] ?? '',
    ],
];
