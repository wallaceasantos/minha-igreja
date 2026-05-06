-- Tabela: Upgrade Requests
-- Armazena solicitações de upgrade de plano das igrejas

CREATE TABLE IF NOT EXISTS upgrade_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  church_id INT NOT NULL,
  church_name VARCHAR(255) NOT NULL,
  church_email VARCHAR(255),
  current_plan VARCHAR(50) NOT NULL,
  requested_plan VARCHAR(50) NOT NULL,
  requested_at DATETIME NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
  reviewed_by INT NULL,
  reviewed_at DATETIME NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES usuarios_admin(id) ON DELETE SET NULL,
  INDEX idx_church_id (church_id),
  INDEX idx_status (status),
  INDEX idx_requested_at (requested_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comentários (opcional, para documentação)
ALTER TABLE upgrade_requests COMMENT 'Solicitações de upgrade de plano das igrejas';
