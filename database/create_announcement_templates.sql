-- ================================================================
-- Igreja Connect - Templates de Comunicados
-- ================================================================
-- Tabela para armazenar templates de comunicados recorrentes
-- ================================================================

-- Criar tabela de templates
CREATE TABLE IF NOT EXISTS `announcement_templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','warning','success','error','maintenance') DEFAULT 'info',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `send_method` enum('platform','email','both') DEFAULT 'platform',
  `target_audience` enum('all','free','essencial','premium','enterprise') DEFAULT 'all',
  `show_on_dashboard` tinyint(1) DEFAULT 1,
  `show_on_login` tinyint(1) DEFAULT 0,
  `require_acknowledgment` tinyint(1) DEFAULT 0,
  `usage_count` int DEFAULT 0,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_active` (`is_active`),
  KEY `idx_type` (`type`),
  CONSTRAINT `fk_templates_user` FOREIGN KEY (`created_by`) REFERENCES `usuarios_admin` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir templates padrão
INSERT INTO `announcement_templates` (`name`, `title`, `message`, `type`, `priority`, `target_audience`, `show_on_dashboard`, `usage_count`) VALUES
('Manutenção Programada', '🔧 Manutenção Programada', 'Informamos que o sistema passará por manutenção programada no dia {DATA} das {HORA_INICIO} às {HORA_FIM}.\n\nDurante este período, o acesso poderá ficar instável.\n\nAgradecemos a compreensão.', 'maintenance', 'high', 'all', 1, 0),
('Boas-vindas', '🎉 Bem-vindo ao Igreja Connect!', 'É um prazer ter sua igreja conosco!\n\nO Igreja Connect é uma plataforma completa para gestão da sua igreja. Aqui você pode:\n\n✅ Gerenciar membros\n✅ Controlar finanças\n✅ Criar eventos\n✅ Enviar comunicados\n\nEm caso de dúvidas, nossa equipe de suporte está à disposição.\n\nQue Deus abençoe grandemente!', 'success', 'medium', 'all', 1, 0),
('Atualização de Sistema', '🚀 Nova Funcionalidade Disponível', 'Temos uma novidade para você!\n\nAcabamos de lançar uma nova funcionalidade que vai facilitar ainda mais a gestão da sua igreja.\n\nConfira no dashboard todas as novidades e comece a usar agora mesmo.\n\nDúvidas? Entre em contato com nosso suporte!', 'info', 'medium', 'all', 1, 0),
('Alerta de Segurança', '⚠️ Atualização de Senha Recomendada', 'Por medida de segurança, recomendamos que todos os administradores atualizem suas senhas.\n\nPara isso, acesse:\nConfigurações > Segurança > Alterar Senha\n\nUse senhas fortes com:\n• Mínimo 8 caracteres\n• Letras maiúsculas e minúsculas\n• Números e símbolos\n\nContamos com sua colaboração!', 'warning', 'high', 'all', 1, 0),
('Lembrete de Pagamento', '💳 Lembrete de Fatura', 'Olá! Passando para lembrar que sua fatura do plano {PLANO} está com vencimento em {DIAS} dias.\n\nValor: R$ {VALOR}\nVencimento: {DATA_VENCIMENTO}\n\nPara evitar interrupção no serviço, realize o pagamento antes do vencimento.\n\nDúvidas? Entre em contato conosco!', 'warning', 'medium', 'all', 1, 0),
('Feriado', '🎊 Comunicado de Feriado', 'Informamos que nosso atendimento funcionará em horário especial no feriado de {NOME_FERIADO} ({DATA}).\n\nAtendimento:\n{HORARIO_ESPECIAL}\n\nRetornaremos ao horário normal em {DATA_RETORNO}.\n\nBom feriado a todos!', 'info', 'low', 'all', 1, 0);

-- Verificar templates
SELECT '✅ Templates de comunicados criados com sucesso!' AS Status;
SELECT COUNT(*) as total_templates FROM announcement_templates;
SELECT name, type, usage_count FROM announcement_templates ORDER BY name;
