-- ================================================================
-- Igreja Connect - Tabela de Configurações do Sistema
-- ================================================================
-- Armazena configurações globais da plataforma
-- ================================================================

-- Criar tabela de configurações
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL UNIQUE,
  `setting_value` text,
  `setting_type` enum('string','number','boolean','json','email') DEFAULT 'string',
  `category` enum('general','email','smtp','branding','limits','features','security') DEFAULT 'general',
  `description` varchar(255),
  `is_public` tinyint(1) DEFAULT 0,
  `updated_by` int DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================
-- CONFIGURAÇÕES GERAIS
-- ================================================================

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `category`, `description`, `is_public`) VALUES
('platform_name', 'Igreja Connect', 'string', 'general', 'Nome da plataforma', 1),
('platform_url', 'http://localhost:5173', 'string', 'general', 'URL base da plataforma', 0),
('platform_description', 'Plataforma de gestão para igrejas', 'string', 'general', 'Descrição da plataforma', 1),
('platform_logo_url', '/logo.png', 'string', 'branding', 'URL do logo da plataforma', 1),
('platform_favicon_url', '/favicon.ico', 'string', 'branding', 'URL do favicon', 1),
('platform_primary_color', '#1e40af', 'string', 'branding', 'Cor primária da marca', 1),
('platform_secondary_color', '#f59e0b', 'string', 'branding', 'Cor secundária da marca', 1),
('support_email', 'suporte@igrejaconnect.com.br', 'email', 'email', 'Email de suporte', 1),
('support_phone', '(11) 99999-9999', 'string', 'email', 'Telefone/WhatsApp de suporte', 1),
('timezone', 'America/Sao_Paulo', 'string', 'general', 'Fuso horário padrão', 0),
('language', 'pt-BR', 'string', 'general', 'Idioma padrão', 0);

-- ================================================================
-- CONFIGURAÇÕES SMTP (Email)
-- ================================================================

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `category`, `description`, `is_public`) VALUES
('smtp_host', 'smtp.gmail.com', 'string', 'smtp', 'Servidor SMTP', 0),
('smtp_port', '587', 'number', 'smtp', 'Porta do SMTP', 0),
('smtp_secure', 'tls', 'string', 'smtp', 'Tipo de segurança (tls/ssl)', 0),
('smtp_username', '', 'string', 'smtp', 'Usuário do SMTP', 0),
('smtp_password', '', 'string', 'smtp', 'Senha do SMTP', 0),
('smtp_from_email', 'noreply@igrejaconnect.com.br', 'email', 'smtp', 'Email de envio', 0),
('smtp_from_name', 'Igreja Connect', 'string', 'smtp', 'Nome de envio', 0);

-- ================================================================
-- CONFIGURAÇÕES DE EMAIL
-- ================================================================

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `category`, `description`, `is_public`) VALUES
('email_welcome_enabled', '1', 'boolean', 'email', 'Enviar email de boas-vindas', 0),
('email_welcome_subject', 'Bem-vindo ao Igreja Connect!', 'string', 'email', 'Assunto do email de boas-vindas', 0),
('email_trial_end_enabled', '1', 'boolean', 'email', 'Enviar alerta de trial acabando', 0),
('email_trial_end_days', '5', 'number', 'email', 'Dias antes do trial acabar para enviar alerta', 0),
('email_invoice_enabled', '1', 'boolean', 'email', 'Enviar fatura por email', 0),
('email_payment_confirmation_enabled', '1', 'boolean', 'email', 'Enviar confirmação de pagamento', 0);

-- ================================================================
-- LIMITES DO SISTEMA
-- ================================================================

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `category`, `description`, `is_public`) VALUES
('max_churches_per_admin', '10', 'number', 'limits', 'Máximo de igrejas por admin', 0),
('max_login_attempts', '5', 'number', 'security', 'Máximo de tentativas de login', 0),
('login_lockout_minutes', '15', 'number', 'security', 'Tempo de bloqueio após falhas (minutos)', 0),
('session_timeout_minutes', '120', 'number', 'security', 'Timeout da sessão (minutos)', 0),
('max_upload_size_mb', '10', 'number', 'limits', 'Tamanho máximo de upload (MB)', 0),
('allowed_file_types', 'jpg,png,pdf,doc,docx', 'string', 'limits', 'Tipos de arquivo permitidos', 0);

-- ================================================================
-- FEATURES DO SISTEMA
-- ================================================================

INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `category`, `description`, `is_public`) VALUES
('feature_multi_church', '1', 'boolean', 'features', 'Permitir múltiplas igrejas por admin', 0),
('feature_custom_domain', '0', 'boolean', 'features', 'Habilitar domínio personalizado', 0),
('feature_api_access', '1', 'boolean', 'features', 'Habilitar acesso à API', 0),
('feature_analytics', '1', 'boolean', 'features', 'Habilitar analytics', 0),
('maintenance_mode', '0', 'boolean', 'general', 'Modo de manutenção', 0),
('maintenance_message', 'Sistema em manutenção. Voltamos em breve!', 'string', 'general', 'Mensagem de manutenção', 1);

-- Verificar configurações inseridas
SELECT '✅ Configurações do sistema criadas com sucesso!' AS Status;
SELECT category, COUNT(*) as quantidade FROM system_settings GROUP BY category;
