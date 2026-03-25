<?php
/**
 * API: Buscar Igreja por Slug
 * GET /api/church/[slug].php
 * 
 * Retorna os dados públicos de uma igreja
 * Compatível com PHP 8.3
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Apenas GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Método não permitido'
    ]);
    exit();
}

try {
    require_once __DIR__ . '/../includes/TenantMiddleware.php';
    
    // Extrair slug da URL
    $pathInfo = $_SERVER['SCRIPT_NAME'] ?? '';
    $pathParts = explode('/', trim($pathInfo, '/'));
    $filename = end($pathParts);
    $slug = str_replace('.php', '', $filename);
    
    // Validar slug
    if (empty($slug) || $slug === 'church') {
        throw new Exception('Slug não informado');
    }
    
    // Identificar igreja
    $church = TenantMiddleware::identify();
    
    if (!$church) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Igreja não encontrada'
        ]);
        exit();
    }
    
    // Retornar dados públicos da igreja
    $publicData = [
        'id' => (int)$church['id'],
        'name' => $church['name'],
        'slug' => $church['slug'],
        'description' => $church['description'],
        'logo_url' => $church['logo_url'],
        'favicon_url' => $church['favicon_url'],
        'hero_image_url' => $church['hero_image_url'],
        'address_street' => $church['address_street'],
        'address_number' => $church['address_number'],
        'address_neighborhood' => $church['address_neighborhood'],
        'address_city' => $church['address_city'],
        'address_state' => $church['address_state'],
        'address_zip' => $church['address_zip'],
        'phone' => $church['phone'],
        'whatsapp' => $church['whatsapp'],
        'email' => $church['email'],
        'facebook_url' => $church['facebook_url'],
        'instagram_url' => $church['instagram_url'],
        'youtube_url' => $church['youtube_url'],
        'youtube_channel_id' => $church['youtube_channel_id'],
        'theme_primary_color' => $church['theme_primary_color'],
        'theme_secondary_color' => $church['theme_secondary_color'],
        'plan_type' => $church['plan_type'],
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $publicData
    ]);
    
} catch (Exception $e) {
    error_log("Erro ao buscar igreja: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao buscar igreja',
        'message' => getenv('APP_ENV') === 'development' ? $e->getMessage() : 'Erro interno do servidor'
    ]);
}
