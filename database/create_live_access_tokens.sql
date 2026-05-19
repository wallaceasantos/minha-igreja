-- Tabela para tokens de acesso OTP (One-Time Password) para lives
-- Substitui o sistema de PINs estaticos por codigos temporarios enviados por email

CREATE TABLE IF NOT EXISTS live_access_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  church_id INT NOT NULL,
  email VARCHAR(255) NOT NULL,
  otp_code VARCHAR(6) NOT NULL COMMENT 'Codigo OTP de 6 digitos',
  expires_at DATETIME NOT NULL COMMENT 'Expira em 10 minutos',
  used BOOLEAN DEFAULT FALSE COMMENT 'Se o codigo ja foi utilizado',
  used_at DATETIME DEFAULT NULL,
  session_token VARCHAR(255) DEFAULT NULL COMMENT 'Token de sessao apos verificacao',
  session_expires_at DATETIME DEFAULT NULL COMMENT 'Sessao valida por 30 dias',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email_church (email, church_id),
  INDEX idx_otp_code (otp_code, church_id),
  INDEX idx_session_token (session_token),
  FOREIGN KEY (church_id) REFERENCES churches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Tokens OTP para acesso a lives ao vivo';
