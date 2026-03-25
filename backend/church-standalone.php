<?php
/**
 * API: Criar Igreja - VERSÃO STANDALONE
 * Não depende de config externa
 * POST /church-standalone.php
 */

// Configurações diretas
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    exit();
}

// Credenciais diretas
$db_host = 'localhost';
$db_name = 'walla573_ccjv_sistema';
$db_user = 'walla573_admin';
$db_pass = 'S100cem%';

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        throw new Exception('Dados inválidos');
    }

    $errors = [];

    if (empty($data['name']) || strlen($data['name']) < 5) {
        $errors[] = 'Nome da igreja deve ter pelo menos 5 caracteres';
    }

    if (empty($data['slug']) || strlen($data['slug']) < 3) {
        $errors[] = 'Subdomínio deve ter pelo menos 3 caracteres';
    }

    if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $data['slug'])) {
        $errors[] = 'Subdomínio inválido';
    }

    if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Email válido é obrigatório';
    }

    if (empty($data['admin']['name'])) {
        $errors[] = 'Nome do administrador é obrigatório';
    }

    if (empty($data['admin']['email']) || !filter_var($data['admin']['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Email do administrador é obrigatório';
    }

    if (empty($data['admin']['password']) || strlen($data['admin']['password']) < 6) {
        $errors[] = 'Senha deve ter pelo menos 6 caracteres';
    }

    if ($data['admin']['password'] !== $data['admin']['confirmPassword']) {
        $errors[] = 'Senhas não conferem';
    }

    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Erros de validação', 'errors' => $errors]);
        exit();
    }

    // Conectar direto (sem config.php)
    $dsn = "mysql:host={$db_host};dbname={$db_name};charset=utf8mb4";
    $pdo = new PDO($dsn, $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // Verificar slug
    $stmt = $pdo->prepare("SELECT id FROM churches WHERE slug = :slug LIMIT 1");
    $stmt->execute([':slug' => $data['slug']]);

    if ($stmt->fetch()) {
        throw new Exception('Este subdomínio já está em uso');
    }

    $pdo->beginTransaction();

    // Inserir igreja
    $stmt = $pdo->prepare("INSERT INTO churches (
        name, slug, description, email, phone, whatsapp,
        address_street, address_number, address_complement,
        address_neighborhood, address_city, address_state, address_zip,
        facebook_url, instagram_url, youtube_url,
        theme_primary_color, theme_secondary_color,
        plan_type, is_active, is_verified, created_at
    ) VALUES (
        :name, :slug, :description, :email, :phone, :whatsapp,
        :street, :number, :complement, :neighborhood, :city, :state, :zip,
        :facebook, :instagram, :youtube,
        :primary_color, :secondary_color,
        'free', 1, 0, NOW()
    )");

    $stmt->execute([
        ':name' => $data['name'],
        ':slug' => $data['slug'],
        ':description' => $data['description'] ?? null,
        ':email' => $data['email'],
        ':phone' => $data['phone'] ?? null,
        ':whatsapp' => $data['whatsapp'] ?? null,
        ':street' => $data['address']['street'] ?? null,
        ':number' => $data['address']['number'] ?? null,
        ':complement' => $data['address']['complement'] ?? null,
        ':neighborhood' => $data['address']['neighborhood'] ?? null,
        ':city' => $data['address']['city'] ?? null,
        ':state' => $data['address']['state'] ?? null,
        ':zip' => $data['address']['zip'] ?? null,
        ':facebook' => $data['facebook_url'] ?? null,
        ':instagram' => $data['instagram_url'] ?? null,
        ':youtube' => $data['youtube_url'] ?? null,
        ':primary_color' => $data['theme_primary_color'] ?? '#1e40af',
        ':secondary_color' => $data['theme_secondary_color'] ?? '#f59e0b',
    ]);

    $churchId = $pdo->lastInsertId();

    // Inserir admin
    $stmt = $pdo->prepare("INSERT INTO usuarios_admin (
        church_id, name, email, password, role, is_active, created_at
    ) VALUES (?, ?, ?, ?, 'admin', 1, NOW())");

    $stmt->execute([
        $churchId,
        $data['admin']['name'],
        $data['admin']['email'],
        password_hash($data['admin']['password'], PASSWORD_DEFAULT)
    ]);

    // Inserir assinatura
    $stmt = $pdo->prepare("INSERT INTO subscriptions (
        church_id, plan_type, status, current_period_start, current_period_end, trial_end_date, created_at
    ) VALUES (?, 'free', 'trial', DATE(NOW()), DATE_ADD(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), NOW())");

    $stmt->execute([$churchId]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Igreja criada com sucesso!',
        'data' => [
            'church_id' => (int)$churchId,
            'slug' => $data['slug'],
            'url' => "https://{$data['slug']}.ccjv.com.br",
            'admin_url' => "https://{$data['slug']}.ccjv.com.br/login",
            'trial_days' => 30,
        ]
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log("Erro: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao criar igreja',
        'message' => $e->getMessage()
    ]);
}
