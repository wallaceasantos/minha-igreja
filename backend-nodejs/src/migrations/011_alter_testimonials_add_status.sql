-- Migration: Adicionar colunas de status e aprovação à tabela testimonials
-- Versão simplificada - execute cada comando separadamente se necessário

-- Desativar verificação de erros para comandos opcionais
-- Execute cada ALTER TABLE separadamente

-- Adicionar coluna status (ignore erro se já existir)
ALTER TABLE testimonials 
ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved' 
COMMENT 'Status do depoimento';

-- Adicionar coluna member_email (ignore erro se já existir)
ALTER TABLE testimonials 
ADD COLUMN member_email VARCHAR(100) DEFAULT NULL 
COMMENT 'Email para contato';

-- Adicionar coluna approved_at (ignore erro se já existir)
ALTER TABLE testimonials 
ADD COLUMN approved_at TIMESTAMP NULL DEFAULT NULL;

-- Adicionar coluna approved_by (ignore erro se já existir)
ALTER TABLE testimonials 
ADD COLUMN approved_by INT DEFAULT NULL 
COMMENT 'ID do usuário que aprovou';

-- Adicionar foreign key (ignore erro se já existir ou se users não existir)
ALTER TABLE testimonials 
ADD CONSTRAINT fk_testimonials_approved_by 
FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- Remover índice antigo se existir (ignore erro se não existir)
DROP INDEX idx_church_active ON testimonials;

-- Criar novo índice (ignore erro se já existir)
CREATE INDEX idx_church_status ON testimonials(church_id, status);

-- Atualizar registros existentes
UPDATE testimonials SET status = 'approved' WHERE status IS NULL;
