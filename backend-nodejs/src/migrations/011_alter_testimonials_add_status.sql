-- Migration: Garantir que todos os registros tenham status aprovado
-- Executar se houver registros sem status definido

-- Desativar safe update mode
SET SQL_SAFE_UPDATES = 0;

-- Atualizar registros sem status
UPDATE testimonials SET status = 'approved' WHERE status IS NULL OR status = '';

-- Reativar safe update mode
SET SQL_SAFE_UPDATES = 1;

SELECT 'Registros atualizados com sucesso' as resultado;
