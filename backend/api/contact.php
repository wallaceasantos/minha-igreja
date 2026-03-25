<?php
/**
 * API: Enviar Mensagem de Contato
 * POST /api/contact.php
 * 
 * Envia mensagem de contato para a plataforma
 * Compatível com PHP 8.3
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../includes/Database.php';
require_once __DIR__ . '/../includes/RateLimiter.php';

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Apenas POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Método não permitido'
    ]);
    exit();
}

try {
    // Rate limiting
    $rateLimiter = new RateLimiter();
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    
    if (!$rateLimiter->check('contact_' . $ip, 5, 3600)) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'error' => 'Muitas tentativas. Aguarde 1 hora antes de tentar novamente.'
        ]);
        exit();
    }
    
    // Ler dados do request
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Dados inválidos'
        ]);
        exit();
    }
    
    // Validações
    $errors = [];
    
    if (empty($data['name'])) {
        $errors[] = 'Nome é obrigatório';
    }
    
    if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Email válido é obrigatório';
    }
    
    if (empty($data['subject'])) {
        $errors[] = 'Assunto é obrigatório';
    }
    
    if (empty($data['message'])) {
        $errors[] = 'Mensagem é obrigatória';
    }
    
    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Erros de validação',
            'errors' => $errors
        ]);
        exit();
    }
    
    // Salvar mensagem no banco
    $db = Database::getInstance();
    
    $sql = "INSERT INTO contact_messages 
            (name, email, phone, church, church_size, subject, message, created_at)
            VALUES 
            (:name, :email, :phone, :church, :church_size, :subject, :message, NOW())";
    
    $stmt = $db->prepare($sql);
    $stmt->bindValue(':name', $data['name'], PDO::PARAM_STR);
    $stmt->bindValue(':email', $data['email'], PDO::PARAM_STR);
    $stmt->bindValue(':phone', $data['phone'] ?? null, PDO::PARAM_STR);
    $stmt->bindValue(':church', $data['church'] ?? null, PDO::PARAM_STR);
    $stmt->bindValue(':church_size', $data['church_size'] ?? null, PDO::PARAM_STR);
    $stmt->bindValue(':subject', $data['subject'], PDO::PARAM_STR);
    $stmt->bindValue(':message', $data['message'], PDO::PARAM_STR);
    
    $stmt->execute();
    
    // Sucesso
    echo json_encode([
        'success' => true,
        'message' => 'Mensagem enviada com sucesso! Entraremos em contato em até 24 horas úteis.'
    ]);
    
} catch (Exception $e) {
    error_log("Erro ao enviar contato: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao enviar mensagem',
        'message' => getenv('APP_ENV') === 'development' ? $e->getMessage() : 'Erro interno do servidor'
    ]);
}
