-- Migration Alternativa: Adicionar campo last_reminder_at na tabela pedidos
-- Use esta se a migration principal falhar com erro "Unknown column 'answer'"
-- Executar no MySQL Workbench ou phpMyAdmin

-- Adicionar coluna last_reminder_at (sem AFTER, vai para o final)
ALTER TABLE pedidos 
ADD COLUMN last_reminder_at DATETIME NULL;

-- Adicionar índices
ALTER TABLE pedidos ADD INDEX idx_status_created_at (status, created_at);
ALTER TABLE pedidos ADD INDEX idx_last_reminder (last_reminder_at);

-- Verificar se funcionou:
-- DESCRIBE pedidos;
-- SHOW INDEX FROM pedidos;

-- Resultado esperado:
-- last_reminder_at | datetime | YES | | NULL |
