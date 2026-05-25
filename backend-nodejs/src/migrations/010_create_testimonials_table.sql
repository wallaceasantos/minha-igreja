-- Migration: Criar tabela de depoimentos dos membros
-- Para serem exibidos na tela de boas-vindas da live

CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  church_id INT NOT NULL,
  member_name VARCHAR(100) NOT NULL COMMENT 'Nome do membro que deu o depoimento',
  member_email VARCHAR(100) DEFAULT NULL COMMENT 'Email para contato (opcional)',
  member_avatar VARCHAR(10) DEFAULT NULL COMMENT 'Iniciais ou emoji do membro',
  member_since VARCHAR(50) DEFAULT NULL COMMENT 'Ex: 2 meses, 1 ano',
  testimonial_text TEXT NOT NULL COMMENT 'Texto do depoimento',
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT 'Status: pending=aguardando aprovação, approved=aprovado, rejected=rejeitado',
  is_active TINYINT(1) DEFAULT 1,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL DEFAULT NULL,
  approved_by INT DEFAULT NULL COMMENT 'ID do usuário que aprovou',
  
  FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_church_status (church_id, status),
  INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir depoimentos de exemplo para a IEQ (já aprovados)
INSERT INTO testimonials (church_id, member_name, member_avatar, member_since, testimonial_text, status, is_active, display_order) VALUES
(1, 'Maria S.', 'M', '2 meses', 'Fazer parte mudou minha vida! O apoio da comunidade é incrível.', 'approved', 1, 1),
(1, 'João P.', 'J', '6 meses', 'Sinto-me em casa. Aqui encontrei minha família espiritual.', 'approved', 1, 2),
(1, 'Ana L.', 'A', '1 ano', 'As lives são uma bênção! Participo de todas.', 'approved', 1, 3);
