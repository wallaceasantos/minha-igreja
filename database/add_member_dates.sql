-- Adicionar campos de datas na tabela church_members
-- Necessario para o sistema de aniversario e datas importantes
-- Execute no banco de dados do Railway

-- Adicionar birth_date (ignora erro se ja existir)
ALTER TABLE church_members ADD COLUMN birth_date DATE DEFAULT NULL COMMENT 'Data de nascimento do membro' AFTER phone;

-- Adicionar baptism_date
ALTER TABLE church_members ADD COLUMN baptism_date DATE DEFAULT NULL COMMENT 'Data de batismo nas aguas' AFTER birth_date;

-- Adicionar membership_date
ALTER TABLE church_members ADD COLUMN membership_date DATE DEFAULT NULL COMMENT 'Data de ingresso como membro' AFTER baptism_date;

-- Verificar se as colunas foram adicionadas
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'church_members' 
  AND COLUMN_NAME IN ('birth_date', 'baptism_date', 'membership_date')
ORDER BY ORDINAL_POSITION;
