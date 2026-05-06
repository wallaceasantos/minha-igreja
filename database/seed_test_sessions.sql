-- ================================================================
-- Igreja Connect - Popular Sessões de Teste
-- ================================================================
-- Cria sessões ativas para teste do dashboard de segurança
-- ================================================================

-- Criar sessão para Super Admin
INSERT INTO `user_sessions` (`user_id`, `session_token`, `ip_address`, `user_agent`, `device_info`, `expires_at`, `is_active`)
SELECT 
  id,
  CONCAT('sess_', UNIX_TIMESTAMP(), '_admin1'),
  '192.168.1.100',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
  'Chrome / Windows',
  DATE_ADD(NOW(), INTERVAL 24 HOUR),
  1
FROM usuarios_admin 
WHERE email = 'admin@igreja-connect.com'
ON DUPLICATE KEY UPDATE last_activity = NOW();

-- Criar sessão para Pastor
INSERT INTO `user_sessions` (`user_id`, `session_token`, `ip_address`, `user_agent`, `device_info`, `expires_at`, `is_active`)
SELECT 
  id,
  CONCAT('sess_', UNIX_TIMESTAMP(), '_pastor1'),
  '10.0.0.50',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Firefox/121.0',
  'Firefox / Mac',
  DATE_ADD(NOW(), INTERVAL 24 HOUR),
  1
FROM usuarios_admin 
WHERE email LIKE '%pastor%'
LIMIT 1;

-- Criar mais sessões de teste
INSERT INTO `user_sessions` (`user_id`, `session_token`, `ip_address`, `user_agent`, `device_info`, `expires_at`, `is_active`) VALUES
(1, CONCAT('sess_', UNIX_TIMESTAMP(), '_dev1'), '172.16.0.25', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1', 'Safari / iPhone', DATE_ADD(NOW(), INTERVAL 12 HOUR), 1),
(1, CONCAT('sess_', UNIX_TIMESTAMP(), '_dev2'), '192.168.1.105', 'Mozilla/5.0 (Linux; Android 14) Chrome/120.0.0.0 Mobile', 'Chrome / Android', DATE_ADD(NOW(), INTERVAL 6 HOUR), 1);

-- Verificar sessões criadas
SELECT '✅ Sessões de teste criadas!' AS Status;
SELECT 
  s.id,
  u.email,
  s.ip_address,
  s.user_agent,
  s.created_at,
  s.last_activity,
  s.expires_at,
  s.is_active,
  CASE 
    WHEN s.is_active = 0 THEN 'Inativa'
    WHEN s.expires_at < NOW() THEN 'Expirada'
    ELSE 'Ativa'
  END as status
FROM user_sessions s
LEFT JOIN usuarios_admin u ON s.user_id = u.id
ORDER BY s.last_activity DESC;

-- Contar sessões ativas
SELECT COUNT(*) as sessoes_ativas FROM user_sessions WHERE is_active = 1 AND expires_at > NOW();
