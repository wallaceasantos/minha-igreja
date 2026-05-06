-- Migration: Adicionar colunas de arquivamento para tickets
-- Executar: mysql -u root -p igreja_connect < migrations/002_add_ticket_archive.sql

-- Adicionar colunas de arquivamento na tabela support_tickets
ALTER TABLE support_tickets 
ADD COLUMN is_archived TINYINT(1) DEFAULT 0 COMMENT '0=Ativo, 1=Arquivado' AFTER status,
ADD COLUMN archived_at DATETIME NULL COMMENT 'Data do arquivamento' AFTER is_archived,
ADD INDEX idx_archived (is_archived),
ADD INDEX idx_closed_at (closed_at);

-- Criar tabela de histórico de arquivos (backup)
CREATE TABLE IF NOT EXISTS support_tickets_archive (
  id INT PRIMARY KEY,
  ticket_number VARCHAR(20) NOT NULL,
  church_id INT,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('open', 'in_progress', 'waiting_customer', 'resolved', 'closed') DEFAULT 'open',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  category ENUM('technical', 'billing', 'feature', 'other') DEFAULT 'other',
  assigned_to INT,
  created_by INT,
  created_at DATETIME,
  updated_at DATETIME,
  resolved_at DATETIME NULL,
  closed_at DATETIME NULL,
  is_archived TINYINT(1) DEFAULT 0,
  archived_at DATETIME NULL,
  archived_reason VARCHAR(255) NULL COMMENT 'Motivo do arquivamento',
  original_database_id INT COMMENT 'ID no banco original',
  archived_by INT COMMENT 'Usuário que arquivou',
  INDEX idx_ticket_number (ticket_number),
  INDEX idx_archived_at (archived_at),
  INDEX idx_church_id (church_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comentário: Esta migration é segura e não deleta dados existentes
-- Os tickets atuais permanecem ativos (is_archived = 0)
