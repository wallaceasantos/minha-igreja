-- ================================================================
-- Igreja Connect - Adicionar coluna is_active em church_members
-- ================================================================
-- Corrige erro: Unknown column 'is_active' in 'where clause'
-- ================================================================

-- Primeiro verifica se a coluna já existe
SELECT 'Verificando estrutura da tabela church_members...' AS Status;
DESCRIBE church_members;

-- Se a coluna is_active NÃO existir, execute os comandos abaixo:
-- Nota: Execute apenas se a coluna não existir

-- Adicionar coluna is_active
ALTER TABLE `church_members` 
ADD COLUMN `is_active` tinyint(1) DEFAULT '1';

-- Atualizar registros existentes para ativo
UPDATE `church_members` SET `is_active` = 1 WHERE `is_active` IS NULL;

-- Criar índice para performance
ALTER TABLE `church_members` 
ADD INDEX `idx_members_active` (`is_active`);

-- Verificar resultado
SELECT '✅ Coluna is_active adicionada com sucesso!' AS Status;
SELECT COUNT(*) as total_membros, SUM(is_active) as ativos FROM church_members;

-- Verificar estrutura final
DESCRIBE church_members;
