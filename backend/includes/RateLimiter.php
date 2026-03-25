<?php
/**
 * Rate Limiter - Baseado em Arquivo
 * 
 * Implementa rate limiting persistente
 * Compatível com PHP 8.3
 */

class RateLimiter {
    private $dir = '/tmp/rate_limit/';
    private $maxFileAge = 86400; // 24 horas

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
     * @param string $key Identificador único
     * @param int $maxAttempts Número máximo de tentativas
     * @param int $windowSeconds Janela de tempo em segundos
     * @return bool TRUE se permitido, FALSE se excedeu
     */
    public function check($key, $maxAttempts = 5, $windowSeconds = 300) {
        $file = $this->getFile($key);
        $now = time();
        $data = ['count' => 0, 'time' => $now];

        if (file_exists($file)) {
            $content = @file_get_contents($file);
            if ($content !== false) {
                $decoded = json_decode($content, true);
                if (is_array($decoded)) {
                    $data = $decoded;
                }
            }

            if ($now - $data['time'] > $windowSeconds) {
                $data = ['count' => 0, 'time' => $now];
            }
        }

        $data['count']++;
        $data['time'] = $now;
        $this->save($file, $data);

        return $data['count'] <= $maxAttempts;
    }

    /**
     * Remove manualmente um rate limit
     *
     * @param string $key Identificador único
     * @return bool TRUE se removido
     */
    public function reset($key) {
        $file = $this->getFile($key);
        if (file_exists($file)) {
            return @unlink($file);
        }
        return false;
    }

    /**
     * Gera nome do arquivo seguro
     *
     * @param string $key Chave original
     * @return string Caminho do arquivo
     */
    private function getFile($key) {
        return $this->dir . md5($key) . '.rl';
    }

    /**
     * Salva dados no arquivo
     *
     * @param string $file Caminho do arquivo
     * @param array $data Dados para salvar
     * @return bool TRUE se salvo
     */
    private function save($file, $data) {
        $result = @file_put_contents($file, json_encode($data), LOCK_EX);
        return $result !== false;
    }
}
