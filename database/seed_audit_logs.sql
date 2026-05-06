-- ================================================================
-- Igreja Connect - Popular Logs de Auditoria (Teste)
-- ================================================================
-- Script para popular a tabela audit_logs com dados de exemplo
-- para testes do módulo de Logs de Auditoria
-- ================================================================

-- Inserir logs de exemplo para teste
INSERT INTO `audit_logs` (`church_id`, `user_id`, `action`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES
-- Logs de igrejas
(1, 1, 'church.created', '{"name": "Ministério Nova Vida", "slug": "ministerio-nova-vida", "success": true}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(1, 1, 'church.plan_changed', '{"plan_type": "free", "reason": "Trial"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 29 DAY)),
(2, 1, 'church.created', '{"name": "Igreja Batista da Graça", "slug": "batista-graca", "success": true}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 25 DAY)),
(3, 1, 'church.created', '{"name": "Igreja Metodista de Manaus", "slug": "metodista-manaus", "success": true}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(1, 1, 'church.updated', '{"name": "Ministério Nova Vida", "email": "contato@novavida.com.br"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(2, 1, 'church.suspended', '{"reason": "Inadimplência - 30 dias"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(2, 1, 'church.reactivated', '{"action": "Igreja reativada após pagamento"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 8 DAY)),

-- Logs de usuários
(NULL, 1, 'user.created', '{"name": "Pastor João", "email": "pastor@novavida.com.br", "role": "pastor"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 28 DAY)),
(NULL, 1, 'user.created', '{"name": "Secretária Maria", "email": "secretaria@novavida.com.br", "role": "secretary"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 27 DAY)),
(1, 2, 'user.login', '{"success": true}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(1, 2, 'user.updated', '{"name": "Pastor João Silva", "role": "pastor"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(NULL, 1, 'user.password_reset', '{"action": "Senha resetada por Super Admin", "user_id": 2}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(3, 3, 'user.banned', '{"reason": "Violação de termos de uso"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(3, 4, 'user.reactivated', '{"action": "Usuário reativado"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- Logs financeiros
(1, 1, 'invoice.created', '{"amount": 49.90, "due_date": "2025-04-01"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(1, 1, 'invoice.paid', '{"amount": 49.90, "payment_method": "pix"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 18 DAY)),
(2, 1, 'invoice.created', '{"amount": 99.90, "due_date": "2025-04-01"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(2, 1, 'payment.received', '{"amount": 99.90, "method": "credit_card"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 12 DAY)),

-- Logs de sistema
(NULL, 1, 'export.data', '{"type": "invoices", "count": 100}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(NULL, 1, 'settings.changed', '{"smtp_host": "smtp.sendgrid.net", "changed_by": "Super Admin"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(1, 2, 'export.data', '{"type": "members", "count": 50}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- Logs recentes (últimas 24 horas)
(1, 2, 'user.login', '{"success": true}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 23 HOUR)),
(1, 2, 'church.updated', '{"name": "Ministério Nova Vida", "phone": "(11) 99999-9999"}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 20 HOUR)),
(3, 3, 'user.login', '{"success": true}', '192.168.1.150', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', DATE_SUB(NOW(), INTERVAL 18 HOUR)),
(1, 1, 'church.plan_changed', '{"plan_type": "essencial", "reason": "Upgrade após trial"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 12 HOUR)),
(NULL, 1, 'user.created', '{"name": "Novo Admin", "email": "admin@teste.com", "role": "admin"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(2, 2, 'user.login', '{"success": true}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- Verificar logs inseridos
SELECT 
  'Logs inseridos com sucesso!' as Status,
  COUNT(*) as 'Total de Logs',
  COUNT(DISTINCT action) as 'Ações Diferentes',
  COUNT(DISTINCT user_id) as 'Usuários com Logs',
  COUNT(DISTINCT church_id) as 'Igrejas com Logs'
FROM audit_logs;

-- Mostrar distribuição de ações
SELECT 
  action,
  COUNT(*) as quantidade,
  MIN(created_at) as primeira_ocorrencia,
  MAX(created_at) as ultima_ocorrencia
FROM audit_logs
GROUP BY action
ORDER BY quantidade DESC;
