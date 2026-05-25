-- Migration: Adicionar colunas de status e aprovação à tabela testimonials
-- Executar se a tabela já existir sem as colunas novas

-- Adicionar coluna status
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved' 
COMMENT 'Status: pending=aguardando aprovação, approved=aprovado, rejected=rejeitado';

-- Adicionar coluna member_email
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS member_email VARCHAR(100) DEFAULT NULL 
COMMENT 'Email para contato (opcional)';

-- Adicionar coluna approved_at
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL DEFAULT NULL;

-- Adicionar coluna approved_by
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS approved_by INT DEFAULT NULL 
COMMENT 'ID do usuário que aprovou';

-- Adicionar foreign key para approved_by
ALTER TABLE testimonials 
ADD CONSTRAINT IF NOT EXISTS fk_testimonials_approved_by 
FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- Atualizar índice existente
DROP INDEX IF EXISTS idx_church_active ON testimonials;
CREATE INDEX idx_church_status ON testimonials(church_id, status);

-- Atualizar registros existentes para status approved
UPDATE testimonials SET status = 'approved' WHERE status IS NULL;
