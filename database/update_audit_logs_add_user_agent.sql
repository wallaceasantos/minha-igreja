-- ================================================================
-- Igreja Connect - Atualizar tabela audit_logs
-- ================================================================
-- Adiciona colunas faltantes na tabela audit_logs (se necessário)
-- ================================================================

-- Adicionar coluna user_agent se não existir
ALTER TABLE `audit_logs` 
ADD COLUMN IF NOT EXISTS `user_agent` varchar(255) AFTER `ip_address`;

-- Verificar estrutura da tabela
DESCRIBE `audit_logs`;

SELECT '✅ Tabela audit_logs atualizada com sucesso!' AS Status;
