<?php
/**
 * Rate Limiter - Baseado em Arquivo
 *
 * Implementa rate limiting persistente (não é burlado ao limpar cookies)
 *
 * USO:
 * $rateLimiter = new RateLimiter();
 *
 * if (!$rateLimiter->check('login_' . $ip, 5, 300)) {
 *     die('Muitas tentativas. Tente em 5 minutos.');
 * }
 *
 * @package Igreja_Connect
 * @version 1.0.0
 */

class RateLimiter {
    /**
     * Diretório para armazenar arquivos de rate limit
     * Fora do public_html para segurança
     */
    private string $dir = '/tmp/rate_limit/';
    
    /**
     * Tempo máximo de vida do arquivo (24 horas)
     */
    private int $maxFileAge = 86400;

    /**
     * Construtor - Cria diretório se não existir
     */
    public function __construct() {
        if (!is_dir($this->dir)) {
            mkdir($this->dir, 0700, true);
        }
    }

    /**
     * Verifica se a chave excedeu o limite de tentativas
     * 
     * @param string $key Identificador único (ex: 'login_192.168.1.1')
     * @param int $maxAttempts Número máximo de tentativas permitidas
     * @param int $windowSeconds Janela de tempo em segundos
     * @return bool TRUE se permitido, FALSE se excedeu limite
     */
    public function check(string $key, int $maxAttempts = 5, int $windowSeconds = 300): bool {
        $file = $this->getFile($key);
        $now = time();
        
        // Dados padrão
        $data = ['count' => 0, 'time' => $now];
        
        // Tenta ler dados existentes
        if (file_exists($file)) {
            $content = @file_get_contents($file);
            if ($content !== false) {
                $decoded = json_decode($content, true);
                if (is_array($decoded)) {
                    $data = $decoded;
                }
            }
            
            // Se passou da janela de tempo, reseta
            if ($now - $data['time'] > $windowSeconds) {
                $data = ['count' => 0, 'time' => $now];
            }
        }
        
        // Incrementa contador
        $data['count']++;
        $data['time'] = $now;
        
        // Salva dados
        $this->save($file, $data);
        
        // Retorna se está dentro do limite
        return $data['count'] <= $maxAttempts;
    }

    /**
     * Obtém informações sobre o rate limit atual
     * 
     * @param string $key Identificador único
     * @param int $windowSeconds Janela de tempo em segundos
     * @return array ['count' => int, 'remaining' => int, 'reset' => int]
     */
    public function getInfo(string $key, int $windowSeconds = 300): array {
        $file = $this->getFile($key);
        $now = time();
        
        if (!file_exists($file)) {
            return [
                'count' => 0,
                'remaining' => PHP_INT_MAX,
                'reset' => $now,
            ];
        }
        
        $content = @file_get_contents($file);
        if ($content === false) {
            return [
                'count' => 0,
                'remaining' => PHP_INT_MAX,
                'reset' => $now,
            ];
        }
        
        $data = json_decode($content, true);
        if (!is_array($data)) {
            return [
                'count' => 0,
                'remaining' => PHP_INT_MAX,
                'reset' => $now,
            ];
        }
        
        // Se passou da janela, reseta
        if ($now - $data['time'] > $windowSeconds) {
            return [
                'count' => 0,
                'remaining' => PHP_INT_MAX,
                'reset' => $now,
            ];
        }
        
        return [
            'count' => $data['count'],
            'remaining' => max(0, 5 - $data['count']), // Assume max 5 como exemplo
            'reset' => $data['time'] + $windowSeconds,
        ];
    }

    /**
     * Limpa arquivos antigos automaticamente
     * 
     * @param int $maxAgeSeconds Idade máxima em segundos
     * @return int Número de arquivos removidos
     */
    public function cleanup(int $maxAgeSeconds = null): int {
        $maxAge = $maxAgeSeconds ?? $this->maxFileAge;
        $now = time();
        $removed = 0;
        
        $files = glob($this->dir . '*');
        if ($files === false) {
            return 0;
        }
        
        foreach ($files as $file) {
            if (!is_file($file)) {
                continue;
            }
            
            // Remove se for muito antigo
            if ($now - filemtime($file) > $maxAge) {
                if (@unlink($file)) {
                    $removed++;
                }
            }
        }
        
        return $removed;
    }

    /**
     * Remove manualmente um rate limit
     * 
     * @param string $key Identificador único
     * @return bool TRUE se removido, FALSE se não existia
     */
    public function reset(string $key): bool {
        $file = $this->getFile($key);
        if (file_exists($file)) {
            return @unlink($file);
        }
        return false;
    }

    /**
     * Gera nome do arquivo seguro a partir da chave
     * 
     * @param string $key Chave original
     * @return string Caminho completo do arquivo
     */
    private function getFile(string $key): string {
        // Usa MD5 para evitar problemas com caracteres especiais
        return $this->dir . md5($key) . '.rl';
    }

    /**
     * Salva dados no arquivo com lock
     * 
     * @param string $file Caminho do arquivo
     * @param array $data Dados para salvar
     * @return bool TRUE se salvo com sucesso
     */
    private function save(string $file, array $data): bool {
        $result = @file_put_contents(
            $file,
            json_encode($data),
            LOCK_EX
        );
        return $result !== false;
    }
}
