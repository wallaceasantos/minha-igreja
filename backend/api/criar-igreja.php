<?php
/**
 * API: Criar Igreja
 * POST /api/criar-igreja.php
 */

// Mostrar erros para debug
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

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
    // Carregar config do banco
    $configFile = __DIR__ . '/config/config.php';
    if (!file_exists($configFile)) {
        throw new Exception('Arquivo de configuração não encontrado: ' . $configFile);
    }

    $config = require $configFile;

    // Conectar ao banco
    $dsn = "mysql:host={$config['database']['host']};port={$config['database']['port']};dbname={$config['database']['name']};charset={$config['database']['charset']}";
    $pdo = new PDO($dsn, $config['database']['user'], $config['database']['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // Ler dados do request
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        throw new Exception('Dados inválidos');
    }

    // Validações
    $errors = [];

    if (empty($data['name']) || strlen($data['name']) < 5) {
        $errors[] = 'Nome da igreja deve ter pelo menos 5 caracteres';
    }

    if (empty($data['slug']) || strlen($data['slug']) < 3) {
        $errors[] = 'Subdomínio deve ter pelo menos 3 caracteres';
    }

    if (!preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $data['slug'])) {
        $errors[] = 'Subdomínio deve conter apenas letras minúsculas, números e hífens';
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
        echo json_encode([
            'success' => false,
            'error' => 'Erros de validação',
            'errors' => $errors
        ]);
        exit();
    }

    // Verificar se slug já existe
    $stmt = $pdo->prepare("SELECT id FROM churches WHERE slug = :slug LIMIT 1");
    $stmt->bindValue(':slug', $data['slug'], PDO::PARAM_STR);
    $stmt->execute();

    if ($stmt->fetch()) {
        throw new Exception('Este subdomínio já está em uso. Escolha outro.');
    }

    // Iniciar transação
    $pdo->beginTransaction();

    // Inserir igreja
    $sql = "INSERT INTO churches (
        name, slug, description,
        address_street, address_number, address_complement,
        address_neighborhood, address_city, address_state, address_zip,
        phone, whatsapp, email,
        facebook_url, instagram_url, youtube_url, youtube_channel_id,
        theme_primary_color, theme_secondary_color,
        plan_type, is_active, is_verified, created_at
    ) VALUES (
        :name, :slug, :description,
        :street, :number, :complement,
        :neighborhood, :city, :state, :zip,
        :phone, :whatsapp, :email,
        :facebook, :instagram, :youtube, :youtube_channel_id,
        :primary_color, :secondary_color,
        'free', 1, 0, NOW()
    )";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':name' => $data['name'],
        ':slug' => $data['slug'],
        ':description' => $data['description'] ?? null,
        ':street' => $data['address']['street'] ?? null,
        ':number' => $data['address']['number'] ?? null,
        ':complement' => $data['address']['complement'] ?? null,
        ':neighborhood' => $data['address']['neighborhood'] ?? null,
        ':city' => $data['address']['city'] ?? null,
        ':state' => $data['address']['state'] ?? null,
        ':zip' => $data['address']['zip'] ?? null,
        ':phone' => $data['phone'] ?? null,
        ':whatsapp' => $data['whatsapp'] ?? null,
        ':email' => $data['email'],
        ':facebook' => $data['facebook_url'] ?? null,
        ':instagram' => $data['instagram_url'] ?? null,
        ':youtube' => $data['youtube_url'] ?? null,
        ':youtube_channel_id' => $data['youtube_channel_id'] ?? null,
        ':primary_color' => $data['theme_primary_color'] ?? '#1e40af',
        ':secondary_color' => $data['theme_secondary_color'] ?? '#f59e0b',
    ]);

    $churchId = $pdo->lastInsertId();

    // Inserir administrador
    $sql = "INSERT INTO usuarios_admin (
        church_id, name, email, password, role, is_active, created_at
    ) VALUES (
        :church_id, :name, :email, :password, 'admin', 1, NOW()
    )";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':church_id' => $churchId,
        ':name' => $data['admin']['name'],
        ':email' => $data['admin']['email'],
        ':password' => password_hash($data['admin']['password'], PASSWORD_DEFAULT),
    ]);

    // Inserir assinatura (plano free com trial de 30 dias)
    $sql = "INSERT INTO subscriptions (
        church_id, plan_type, status,
        current_period_start, current_period_end, trial_end_date, created_at
    ) VALUES (
        :church_id, 'free', 'trial',
        DATE(NOW()), DATE_ADD(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), NOW()
    )";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':church_id' => $churchId]);

    // Commit
    $pdo->commit();

    // Sucesso
    http_response_code(201);
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
    // Rollback em caso de erro
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log("Erro ao criar igreja: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao criar igreja',
        'message' => $e->getMessage()
    ]);
}
