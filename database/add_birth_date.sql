-- Adicionar data de nascimento na tabela de membros
-- Para funcionalidade de aniversariantes do mês

ALTER TABLE church_members 
ADD COLUMN birth_date DATE NULL AFTER phone;

-- Adicionar índice para busca por mês de aniversário
CREATE INDEX idx_members_birth_month ON church_members (MONTH(birth_date));

-- Adicionar comentário (opcional)
ALTER TABLE church_members 
MODIFY COLUMN birth_date DATE NULL COMMENT 'Data de nascimento do membro';

-- Verificar estrutura
DESCRIBE church_members;

-- Exemplo: Atualizar membros existentes com datas aleatórias (opcional)
-- UPDATE church_members 
-- SET birth_date = DATE_SUB(CURDATE(), INTERVAL FLOOR(RAND() * 80 + 18) YEAR)
-- WHERE birth_date IS NULL
-- LIMIT 10;
