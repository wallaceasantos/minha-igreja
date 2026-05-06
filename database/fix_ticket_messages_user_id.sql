-- Corrigir tabela support_ticket_messages para permitir user_id NULL
-- Isso é necessário porque pastores/admins podem criar tickets sem estar logados como usuário específico

ALTER TABLE support_ticket_messages 
MODIFY COLUMN user_id INT NULL;

-- Adicionar comentário explicativo
ALTER TABLE support_ticket_messages 
MODIFY COLUMN user_id INT NULL COMMENT 'ID do usuário que enviou a mensagem (NULL se for ticket criado pela igreja)';

-- Verificar a estrutura
DESCRIBE support_ticket_messages;
