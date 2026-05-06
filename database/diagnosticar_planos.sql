-- ================================================================
-- Diagnóstico: Verificar dados existentes
-- ================================================================

USE igreja_connect;

-- Ver TODOS os valores únicos de plan_type em subscriptions
SELECT 'Valores de plan_type em subscriptions:' AS Informacao;
SELECT DISTINCT plan_type FROM subscriptions;

-- Ver contagem
SELECT 'Contagem por plano:' AS Informacao;
SELECT plan_type, COUNT(*) as quantidade FROM subscriptions GROUP BY plan_type;

-- Ver se tem valores nulos ou vazios
SELECT 'Valores nulos ou vazios:' AS Informacao;
SELECT * FROM subscriptions WHERE plan_type IS NULL OR plan_type = '';

-- Ver churches também
SELECT 'Valores de plan_type em churches:' AS Informacao;
SELECT DISTINCT plan_type FROM churches;

SELECT 'Contagem por plano em churches:' AS Informacao;
SELECT plan_type, COUNT(*) as quantidade FROM churches GROUP BY plan_type;
