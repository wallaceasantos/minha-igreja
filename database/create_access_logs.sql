-- ================================================================
-- Igreja Connect - Logs de Acesso (Páginas Mais Acessadas)
-- ================================================================
-- Tabela para rastrear todas as requisições e páginas acessadas
-- ================================================================

-- Criar tabela de logs de acesso
CREATE TABLE IF NOT EXISTS `access_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `path` varchar(255) NOT NULL,
  `method` varchar(10) NOT NULL DEFAULT 'GET',
  `status` int DEFAULT 200,
  `duration` int DEFAULT 0, -- tempo de resposta em ms
  `ip_address` varchar(45),
  `user_agent` varchar(255),
  `user_id` int DEFAULT NULL,
  `church_id` int DEFAULT NULL,
  `referer` varchar(500),
  `query_params` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_path` (`path`),
  KEY `idx_created` (`created_at`),
  KEY `idx_user` (`user_id`),
  KEY `idx_church` (`church_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índice composto para queries de período
CREATE INDEX `idx_path_created` ON `access_logs` (`path`, `created_at`);

-- View para páginas mais acessadas (últimas 24h)
CREATE OR REPLACE VIEW `v_top_pages_24h` AS
SELECT
  path,
  COUNT(*) as views,
  AVG(duration) as avg_duration,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT ip_address) as unique_ips
FROM access_logs
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY path
ORDER BY views DESC
LIMIT 20;

-- View para páginas mais acessadas (últimos 7 dias)
CREATE OR REPLACE VIEW `v_top_pages_7d` AS
SELECT
  path,
  COUNT(*) as views,
  AVG(duration) as avg_duration,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT ip_address) as unique_ips
FROM access_logs
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY path
ORDER BY views DESC
LIMIT 20;

-- View para acessos por hora (últimas 24h)
CREATE OR REPLACE VIEW `v_access_per_hour_24h` AS
SELECT
  HOUR(created_at) as hour,
  COUNT(*) as requests,
  COUNT(DISTINCT user_id) as unique_users
FROM access_logs
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY HOUR(created_at)
ORDER BY hour ASC;

-- View para status de requisições
CREATE OR REPLACE VIEW `v_status_distribution_24h` AS
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM access_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)), 2) as percentage
FROM access_logs
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY status
ORDER BY count DESC;

-- Inserir dados de exemplo (opcional - para teste)
-- DELETE FROM access_logs;

INSERT INTO `access_logs` (`path`, `method`, `status`, `duration`, `ip_address`, `user_agent`, `user_id`, `church_id`, `created_at`) VALUES
('/super-admin/dashboard', 'GET', 200, 45, '192.168.1.100', 'Mozilla/5.0', 1, NULL, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
('/super-admin/churches', 'GET', 200, 32, '192.168.1.100', 'Mozilla/5.0', 1, NULL, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('/super-admin/tickets', 'GET', 200, 28, '192.168.1.101', 'Mozilla/5.0', 2, NULL, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
('/super-admin/announcements', 'GET', 200, 35, '192.168.1.100', 'Mozilla/5.0', 1, NULL, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
('/super-admin/dashboard', 'GET', 200, 42, '192.168.1.102', 'Mozilla/5.0', 3, NULL, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
('/api/admin/churches', 'GET', 200, 15, '192.168.1.100', 'Mozilla/5.0', 1, NULL, DATE_SUB(NOW(), INTERVAL 6 HOUR)),
('/super-admin/users', 'GET', 200, 38, '192.168.1.101', 'Mozilla/5.0', 2, NULL, DATE_SUB(NOW(), INTERVAL 7 HOUR)),
('/super-admin/dashboard', 'GET', 200, 40, '192.168.1.103', 'Mozilla/5.0', 4, NULL, DATE_SUB(NOW(), INTERVAL 8 HOUR)),
('/super-admin/plans', 'GET', 200, 25, '192.168.1.100', 'Mozilla/5.0', 1, NULL, DATE_SUB(NOW(), INTERVAL 9 HOUR)),
('/super-admin/settings', 'GET', 200, 22, '192.168.1.102', 'Mozilla/5.0', 3, NULL, DATE_SUB(NOW(), INTERVAL 10 HOUR));

-- Verificar estrutura
SELECT '✅ Tabela de logs de acesso criada com sucesso!' AS Status;
SELECT COUNT(*) as total_logs FROM access_logs;
SELECT * FROM v_top_pages_24h;
