-- Migration: Adicionar campo last_reminder_at na tabela pedidos
-- ================================================
-- Estrutura atual da tabela pedidos (sem coluna 'answer')
-- Executar no MySQL Workbench
-- ================================================

-- Adicionar coluna last_reminder_at (após updated_at)
ALTER TABLE pedidos 
ADD COLUMN last_reminder_at DATETIME NULL AFTER updated_at;

-- Adicionar índices para performance
ALTER TABLE pedidos ADD INDEX idx_status_created_at (status, created_at);
ALTER TABLE pedidos ADD INDEX idx_last_reminder (last_reminder_at);

-- ================================================
-- Verificar se funcionou:
-- DESCRIBE pedidos;
-- SHOW INDEX FROM pedidos;
-- ================================================
