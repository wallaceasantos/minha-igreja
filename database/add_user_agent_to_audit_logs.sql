-- ================================================================
-- Igreja Connect - Adicionar coluna user_agent em audit_logs
-- ================================================================
-- Executar este script para adicionar a coluna faltante
-- ================================================================

-- Adicionar coluna user_agent
ALTER TABLE `audit_logs` 
ADD COLUMN `user_agent` varchar(255) AFTER `ip_address`;

-- Verificar estrutura atualizada
SELECT 'Estrutura da tabela audit_logs:' AS Informacao;
DESCRIBE `audit_logs`;

SELECT '✅ Coluna user_agent adicionada com sucesso!' AS Status;
