-- Migration: Alterar tabela announcement_views para permitir user_id NULL
-- Data: 10/04/2026
-- Descrição: Permitir que visualizações de comunicados sejam registradas sem usuário específico

-- Alterar coluna user_id para permitir NULL
ALTER TABLE `announcement_views` 
MODIFY COLUMN `user_id` int NULL;

-- Verificar alteração
SHOW COLUMNS FROM `announcement_views` LIKE 'user_id';

SELECT '✅ Migration aplicada com sucesso! user_id agora permite NULL.' AS Status;
