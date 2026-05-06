-- ================================================================
-- Atualização: Simplificar para 2 Planos (Free e Essencial)
-- ================================================================

USE igreja_connect;

-- 1. Atualizar enum das tabelas
ALTER TABLE `churches` 
MODIFY COLUMN `plan_type` ENUM('free','essencial') DEFAULT 'free';

ALTER TABLE `subscriptions` 
MODIFY COLUMN `plan_type` ENUM('free','essencial') DEFAULT 'free';

-- 2. Atualizar igrejas existentes (Premium/Enterprise → Essencial)
UPDATE churches SET plan_type = 'essencial' WHERE plan_type IN ('premium', 'enterprise');

-- 3. Atualizar assinaturas existentes
UPDATE subscriptions SET plan_type = 'essencial' WHERE plan_type IN ('premium', 'enterprise');

-- 4. Verificar atualização
SELECT 'Planos atualizados:' AS Status;
SELECT plan_type, COUNT(*) as quantidade FROM churches GROUP BY plan_type;
SELECT plan_type, COUNT(*) as quantidade FROM subscriptions GROUP BY plan_type;
