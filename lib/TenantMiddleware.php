<?php
/**
 * Tenant Middleware
 * ==================
 * Identifica qual igreja está acessando o sistema
 * Baseado no subdomínio ou domínio customizado
 * 
 * Uso:
 * require_once 'lib/TenantMiddleware.php';
 * $church = TenantMiddleware::identify();
 */

require_once __DIR__ . '/../database/Database.php';

class TenantMiddleware {
    
    private static ?array $currentChurch = null;
    private static ?int $currentChurchId = null;
    
    /**
     * Identifica a igreja atual
     * Pode ser por subdomínio ou domínio customizado
     * 
     * @return array|null Dados da igreja ou null se não encontrada
     */
    public static function identify(): ?array {
        // Retorna cache se já foi identificado
        if (self::$currentChurch !== null) {
            return self::$currentChurch;
        }
        
        $host = self::getHost();
        
        // Tenta identificar por domínio customizado primeiro
        $church = self::loadByCustomDomain($host);
        
        // Se não encontrou, tenta por subdomínio
        if (!$church) {
            $subdomain = self::extractSubdomain($host);
            if ($subdomain) {
                $church = self::loadBySlug($subdomain);
            }
        }
        
        // Se ainda não encontrou, verifica se é o domínio principal
        if (!$church && self::isMainDomain($host)) {
            // Domínio principal - retorna null (landing page)
            return null;
        }
        
        // Igreja não encontrada ou inativa
        if (!$church || !$church['is_active']) {
            return null;
        }
        
        // Cache e retorna
        self::$currentChurch = $church;
        self::$currentChurchId = (int)$church['id'];
        
        return $church;
    }
    
    /**
     * Retorna o ID da igreja atual
     * 
     * @return int|null ID da igreja ou null
     */
    public static function getChurchId(): ?int {
        if (self::$currentChurchId !== null) {
            return self::$currentChurchId;
        }
        
        $church = self::identify();
        return $church ? (int)$church['id'] : null;
    }
    
    /**
     * Retorna todos os dados da igreja atual
     * 
     * @return array|null Dados da igreja
     */
    public static function getChurchData(): ?array {
        return self::identify();
    }
    
    /**
     * Retorna um campo específico da igreja atual
     * 
     * @param string $field Nome do campo
     * @return mixed|null Valor do campo ou null
     */
    public static function getChurchField(string $field): mixed {
        $church = self::identify();
        return $church && isset($church[$field]) ? $church[$field] : null;
    }
    
    /**
     * Verifica se há uma igreja identificada
     * 
     * @return bool True se há igreja identificada
     */
    public static function hasChurch(): bool {
        return self::identify() !== null;
    }
    
    /**
     * Limpa o cache da igreja atual
     * Útil para testes ou quando trocar de contexto
     */
    public static function reset(): void {
        self::$currentChurch = null;
        self::$currentChurchId = null;
    }
    
    /**
     * Extrai o subdomínio do host
     * 
     * Exemplos:
     * - primeira-batista.igrejaconnect.com.br → primeira-batista
     * - www.primeira-batista.igrejaconnect.com.br → primeira-batista
     * - igrejaconnect.com.br → null
     * 
     * @param string $host Host atual
     * @return string|null Subdomínio ou null
     */
    private static function extractSubdomain(string $host): ?string {
        // Remove porta se existir
        $host = explode(':', $host)[0];
        
        // Remove www. se existir
        $parts = explode('.', $host);
        if ($parts[0] === 'www') {
            array_shift($parts);
        }
        
        // Se tiver mais de 2 partes, tem subdomínio
        // Ex: subdominio.igrejaconnect.com.br → 4 partes
        if (count($parts) > 2) {
            return $parts[0];
        }
        
        return null;
    }
    
    /**
     * Carrega igreja pelo slug (subdomínio)
     * 
     * @param string $slug Slug da igreja
     * @return array|null Dados da igreja ou null
     */
    private static function loadBySlug(string $slug): ?array {
        try {
            $db = Database::getInstance();
            
            $sql = "SELECT * FROM churches 
                    WHERE slug = :slug 
                    AND is_active = TRUE 
                    AND deleted_at IS NULL 
                    LIMIT 1";
            
            $stmt = $db->prepare($sql);
            $stmt->bindValue(':slug', $slug, PDO::PARAM_STR);
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ?: null;
            
        } catch (PDOException $e) {
            error_log("TenantMiddleware::loadBySlug - Erro: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Carrega igreja por domínio customizado
     * 
     * @param string $domain Domínio (ex: igreja.com.br)
     * @return array|null Dados da igreja ou null
     */
    private static function loadByCustomDomain(string $domain): ?array {
        try {
            // Remove www. se existir
            $domain = str_replace('www.', '', $domain);
            $domain = rtrim($domain, '/');
            
            $db = Database::getInstance();
            
            $sql = "SELECT * FROM churches 
                    WHERE custom_domain = :domain 
                    AND custom_domain_verified = TRUE
                    AND is_active = TRUE 
                    AND deleted_at IS NULL 
                    LIMIT 1";
            
            $stmt = $db->prepare($sql);
            $stmt->bindValue(':domain', $domain, PDO::PARAM_STR);
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ?: null;
            
        } catch (PDOException $e) {
            error_log("TenantMiddleware::loadByCustomDomain - Erro: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Verifica se o host é o domínio principal da plataforma
     * 
     * @param string $host Host atual
     * @return bool True se for domínio principal
     */
    private static function isMainDomain(string $host): bool {
        // Remove porta se existir
        $host = explode(':', $host)[0];
        
        // Remove www. se existir
        $host = str_replace('www.', '', $host);
        
        // Domínios principais (configurar conforme ambiente)
        $mainDomains = [
            'igrejaconnect.com.br',
            'igrejaconnect.com',
            'localhost',
            '127.0.0.1'
        ];
        
        return in_array($host, $mainDomains);
    }
    
    /**
     * Retorna o host atual
     * 
     * @return string Host atual
     */
    private static function getHost(): string {
        return $_SERVER['HTTP_HOST'] ?? 'localhost';
    }
    
    /**
     * Middleware para APIs
     * Retorna erro JSON se igreja não for encontrada
     * 
     * @return array Dados da igreja
     * @throws Exception Se igreja não for encontrada
     */
    public static function requireChurch(): array {
        $church = self::identify();
        
        if (!$church) {
            http_response_code(404);
            throw new Exception('Igreja não encontrada ou inativa');
        }
        
        return $church;
    }
    
    /**
     * Middleware para Super Admin
     * Verifica se usuário tem permissão de super admin
     * 
     * @param int $userId ID do usuário
     * @return bool True se for super admin
     */
    public static function isSuperAdmin(int $userId): bool {
        try {
            $db = Database::getInstance();
            
            $sql = "SELECT role FROM usuarios_admin 
                    WHERE id = :id 
                    AND is_active = TRUE 
                    LIMIT 1";
            
            $stmt = $db->prepare($sql);
            $stmt->bindValue(':id', $userId, PDO::PARAM_INT);
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result && $result['role'] === 'super_admin';
            
        } catch (PDOException $e) {
            error_log("TenantMiddleware::isSuperAdmin - Erro: " . $e->getMessage());
            return false;
        }
    }
}
