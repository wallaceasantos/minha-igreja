-- ================================================================
-- Atualização Final: subscriptions e churches
-- ================================================================
-- Converter TODOS os planos para 'free' ou 'essencial'
-- ================================================================

USE igreja_connect;

-- ================================================================
-- PASSO 1: Atualizar subscriptions
-- ================================================================

-- Verificar antes
SELECT 'subscriptions ANTES:' AS Status;
SELECT plan_type, COUNT(*) as quantidade FROM subscriptions GROUP BY plan_type;

-- Atualizar enterprise → essencial
UPDATE subscriptions SET plan_type = 'essencial' WHERE plan_type = 'enterprise';

-- Atualizar premium → essencial
UPDATE subscriptions SET plan_type = 'essencial' WHERE plan_type = 'premium';

-- Atualizar basic → essencial (se existir)
UPDATE subscriptions SET plan_type = 'essencial' WHERE plan_type = 'basic';

-- Verificar depois
SELECT 'subscriptions DEPOIS:' AS Status;
SELECT plan_type, COUNT(*) as quantidade FROM subscriptions GROUP BY plan_type;

-- ================================================================
-- PASSO 2: Atualizar churches
-- ================================================================

-- Verificar antes
SELECT 'churches ANTES:' AS Status;
SELECT plan_type, COUNT(*) as quantidade FROM churches GROUP BY plan_type;

-- Atualizar enterprise → essencial
UPDATE churches SET plan_type = 'essencial' WHERE plan_type = 'enterprise';

-- Atualizar premium → essencial
UPDATE churches SET plan_type = 'essencial' WHERE plan_type = 'premium';

-- Atualizar basic → essencial (se existir)
UPDATE churches SET plan_type = 'essencial' WHERE plan_type = 'basic';

-- Verificar depois
SELECT 'churches DEPOIS:' AS Status;
SELECT plan_type, COUNT(*) as quantidade FROM churches GROUP BY plan_type;

-- ================================================================
-- PASSO 3: Agora modificar enum (seguro, só tem free e essencial)
-- ================================================================

ALTER TABLE `subscriptions` 
MODIFY COLUMN `plan_type` ENUM('free','essencial') DEFAULT 'free';

ALTER TABLE `churches` 
MODIFY COLUMN `plan_type` ENUM('free','essencial') DEFAULT 'free';

-- Verificar estrutura
SELECT 'Estrutura final:' AS Status;
SHOW COLUMNS FROM subscriptions LIKE 'plan_type';
SHOW COLUMNS FROM churches LIKE 'plan_type';

SELECT '✅ Atualização concluída com sucesso!' AS Status;
