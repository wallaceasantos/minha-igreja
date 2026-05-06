-- Verificar se tickets existem no banco
SELECT 
  id, 
  ticket_number, 
  church_id, 
  subject, 
  status, 
  priority, 
  category, 
  created_at 
FROM support_tickets 
ORDER BY created_at DESC 
LIMIT 10;

-- Verificar estrutura da tabela support_ticket_messages
DESCRIBE support_ticket_messages;

-- Verificar se há mensagens
SELECT 
  id, 
  ticket_id, 
  user_id, 
  LEFT(message, 50) as message_preview, 
  created_at 
FROM support_ticket_messages 
ORDER BY created_at DESC 
LIMIT 10;

-- Contar tickets por igreja
SELECT 
  church_id, 
  COUNT(*) as ticket_count 
FROM support_tickets 
GROUP BY church_id;

-- Corrigir user_id para NULL se necessário
ALTER TABLE support_ticket_messages 
MODIFY COLUMN user_id INT NULL;
