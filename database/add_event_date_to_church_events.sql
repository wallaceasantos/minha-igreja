-- ================================================================
-- Igreja Connect - Adicionar coluna event_date em church_events
-- ================================================================
-- Corrige erro: Unknown column 'event_date' in 'order clause'
-- ================================================================

-- Verificar estrutura atual
SELECT 'Verificando estrutura da tabela church_events...' AS Status;
DESCRIBE church_events;

-- Adicionar coluna event_date se não existir
-- Nota: Execute apenas se a coluna não existir
ALTER TABLE `church_events` 
ADD COLUMN `event_date` datetime NOT NULL AFTER `description`;

-- Verificar resultado
SELECT '✅ Coluna event_date adicionada com sucesso!' AS Status;
SELECT id, title, event_date, location FROM church_events LIMIT 5;
