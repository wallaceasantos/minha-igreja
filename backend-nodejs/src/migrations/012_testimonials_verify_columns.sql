-- Migration: Verificar e adicionar colunas faltantes na tabela testimonials
-- Execute cada comando separadamente ignorando erros de duplicata

-- Verificar estrutura atual
DESCRIBE testimonials;

-- Se a coluna member_email não existir, adicionar
-- (ignore erro se já existir)

-- Se a coluna approved_at não existir, adicionar
-- (ignore erro se já existir)

-- Se a coluna approved_by não existir, adicionar
-- (ignore erro se já existir)

-- Se a coluna status não existir, adicionar
-- (ignore erro se já existir)

-- Atualizar registros sem status
UPDATE testimonials SET status = 'approved' WHERE status IS NULL OR status = '';

-- Verificar dados
SELECT id, member_name, status FROM testimonials LIMIT 5;
