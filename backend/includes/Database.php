<?php
/**
 * Classe Database
 * Singleton para conexão com banco de dados
 * Compatível com PHP 8.3
 */

class Database {
    private static $instance = null;
    private $connection; // PDO connection
    
    /**
     * Construtor privado (Singleton)
     */
    private function __construct() {
        $this->connect();
    }
    
    /**
     * Previne clonagem da instância
     */
    private function __clone() {}
    
    /**
     * Previne desserialização da instância
     */
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
    
    /**
     * Obtém a instância única da classe
     * 
     * @return Database Instância única
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Realiza a conexão com o banco de dados
     * 
     * @return void
     * @throws PDOException Se falhar na conexão
     */
    private function connect() {
        $config = require __DIR__ . '/../config/config.php';
        $db = $config['database'];
        
        $dsn = "mysql:host={$db['host']};port={$db['port']};dbname={$db['name']};charset={$db['charset']}";
        
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
        ];
        
        try {
            $this->connection = new PDO($dsn, $db['user'], $db['pass'], $options);
        } catch (PDOException $e) {
            if (getenv('APP_ENV') === 'development') {
                throw $e;
            } else {
                error_log("Database connection failed: " . $e->getMessage());
                throw new PDOException("Database connection failed");
            }
        }
    }
    
    /**
     * Prepara uma declaração SQL para execução
     * 
     * @param string $sql Declaração SQL
     * @return PDOStatement|false Declaração preparada ou false
     */
    public function prepare($sql) {
        return $this->connection->prepare($sql);
    }
    
    /**
     * Executa uma consulta SQL e retorna o resultado
     * 
     * @param string $sql Declaração SQL
     * @return array Resultados da consulta
     */
    public function query($sql) {
        $stmt = $this->connection->query($sql);
        return $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
    }
    
    /**
     * Executa um comando SQL (INSERT, UPDATE, DELETE)
     * 
     * @param string $sql Declaração SQL
     * @return int|false Número de linhas afetadas ou false
     */
    public function execute($sql) {
        return $this->connection->exec($sql);
    }
    
    /**
     * Retorna o último ID inserido
     * 
     * @param string|null $name Nome da sequência (opcional)
     * @return string|false Último ID ou false se falhar
     */
    public function lastInsertId($name = null) {
        return $this->connection->lastInsertId($name);
    }
    
    /**
     * Inicia uma transação
     * 
     * @return bool TRUE se sucesso, FALSE se falhar
     */
    public function beginTransaction() {
        return $this->connection->beginTransaction();
    }
    
    /**
     * Confirma uma transação
     * 
     * @return bool TRUE se sucesso, FALSE se falhar
     */
    public function commit() {
        return $this->connection->commit();
    }
    
    /**
     * Desfaz uma transação
     * 
     * @return bool TRUE se sucesso, FALSE se falhar
     */
    public function rollBack() {
        return $this->connection->rollBack();
    }
    
    /**
     * Verifica se está em uma transação ativa
     * 
     * @return bool TRUE se em transação
     */
    public function inTransaction() {
        return $this->connection->inTransaction();
    }
    
    /**
     * Retorna a conexão PDO bruta
     * 
     * @return PDO Conexão PDO
     */
    public function getConnection() {
        return $this->connection;
    }
    
    /**
     * Fecha a conexão com o banco de dados
     * 
     * @return void
     */
    public function close() {
        $this->connection = null;
        self::$instance = null;
    }
}
