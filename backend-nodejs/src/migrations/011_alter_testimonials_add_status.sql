-- Migration: Adicionar colunas de status e aprovação à tabela testimonials
-- Compatível com MySQL 5.7+

-- Verificar e adicionar coluna status
SET @exist := (SELECT COUNT(*) FROM information_schema.columns 
WHERE table_schema = DATABASE() AND table_name = 'testimonials' AND column_name = 'status');

SET @sql := IF(@exist = 0, 
  'ALTER TABLE testimonials ADD COLUMN status ENUM(\'pending\', \'approved\', \'rejected\') DEFAULT \'approved\' COMMENT \'Status do depoimento\'', 
  'SELECT \'Coluna status já existe\' as msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar e adicionar coluna member_email
SET @exist := (SELECT COUNT(*) FROM information_schema.columns 
WHERE table_schema = DATABASE() AND table_name = 'testimonials' AND column_name = 'member_email');

SET @sql := IF(@exist = 0, 
  'ALTER TABLE testimonials ADD COLUMN member_email VARCHAR(100) DEFAULT NULL COMMENT \'Email para contato\'', 
  'SELECT \'Coluna member_email já existe\' as msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar e adicionar coluna approved_at
SET @exist := (SELECT COUNT(*) FROM information_schema.columns 
WHERE table_schema = DATABASE() AND table_name = 'testimonials' AND column_name = 'approved_at');

SET @sql := IF(@exist = 0, 
  'ALTER TABLE testimonials ADD COLUMN approved_at TIMESTAMP NULL DEFAULT NULL', 
  'SELECT \'Coluna approved_at já existe\' as msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar e adicionar coluna approved_by
SET @exist := (SELECT COUNT(*) FROM information_schema.columns 
WHERE table_schema = DATABASE() AND table_name = 'testimonials' AND column_name = 'approved_by');

SET @sql := IF(@exist = 0, 
  'ALTER TABLE testimonials ADD COLUMN approved_by INT DEFAULT NULL COMMENT \'ID do usuário que aprovou\'', 
  'SELECT \'Coluna approved_by já existe\' as msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar foreign key se não existir
SET @exist := (SELECT COUNT(*) FROM information_schema.table_constraints 
WHERE table_schema = DATABASE() AND table_name = 'testimonials' AND constraint_name = 'fk_testimonials_approved_by');

SET @sql := IF(@exist = 0, 
  'ALTER TABLE testimonials ADD CONSTRAINT fk_testimonials_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL', 
  'SELECT \'Foreign key já existe\' as msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Atualizar índice
DROP INDEX IF EXISTS idx_church_active ON testimonials;
CREATE INDEX IF NOT EXISTS idx_church_status ON testimonials(church_id, status);

-- Atualizar registros existentes
UPDATE testimonials SET status = 'approved' WHERE status IS NULL;
