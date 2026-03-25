<?php
/**
 * Tenant Middleware
 * Identifica qual igreja está acessando o sistema baseado no subdomínio
 * Compatível com PHP 8.3
 */

require_once __DIR__ . '/Database.php';

class TenantMiddleware {
    private static $currentChurch = null;
    private static $currentChurchId = null;
    
    /**
     * Identifica a igreja atual
     * Pode ser por subdomínio ou domínio customizado
     * 
     * @return array|null Dados da igreja ou null se não encontrada
     */
    public static function identify() {
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
            return null; // Domínio principal - landing page
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
    public static function getChurchId() {
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
    public static function getChurchData() {
        return self::identify();
    }
    
    /**
     * Verifica se há uma igreja identificada
     * 
     * @return bool True se há igreja identificada
     */
    public static function hasChurch() {
        return self::identify() !== null;
    }
    
    /**
     * Limpa o cache da igreja atual
     */
    public static function reset() {
        self::$currentChurch = null;
        self::$currentChurchId = null;
    }
    
    /**
     * Extrai o subdomínio do host
     * 
     * @param string $host Host atual
     * @return string|null Subdomínio ou null
     */
    private static function extractSubdomain($host) {
        $host = explode(':', $host)[0];
        $parts = explode('.', $host);
        
        if ($parts[0] === 'www') {
            array_shift($parts);
        }
        
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
    private static function loadBySlug($slug) {
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
            
            return $stmt->fetch() ?: null;
            
        } catch (PDOException $e) {
            error_log("TenantMiddleware::loadBySlug - Erro: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Carrega igreja por domínio customizado
     * 
     * @param string $domain Domínio
     * @return array|null Dados da igreja ou null
     */
    private static function loadByCustomDomain($domain) {
        try {
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
            
            return $stmt->fetch() ?: null;
            
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
    private static function isMainDomain($host) {
        $host = explode(':', $host)[0];
        $host = str_replace('www.', '', $host);
        
        $mainDomains = [
            'ccjv.com.br',
            'plataforma.ccjv.com.br',
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
    private static function getHost() {
        return $_SERVER['HTTP_HOST'] ?? 'localhost';
    }
    
    /**
     * Middleware para APIs - Retorna erro JSON se igreja não for encontrada
     * 
     * @return array Dados da igreja
     * @throws Exception Se igreja não for encontrada
     */
    public static function requireChurch() {
        $church = self::identify();
        
        if (!$church) {
            http_response_code(404);
            throw new Exception('Igreja não encontrada ou inativa');
        }
        
        return $church;
    }
}
