-- ============================================
-- Atualizar valores das subscriptions
-- ============================================
-- Define valores baseados no plano

USE jesus_vitoria_connect;

-- Atualizar amount_cents e monthly_amount baseado no plan_type
UPDATE subscriptions
SET 
  amount_cents = CASE
    WHEN plan_type = 'free' THEN 0
    WHEN plan_type = 'essencial' THEN 4990
    WHEN plan_type = 'premium' THEN 9990
    WHEN plan_type = 'enterprise' THEN 29990
    ELSE 4990
  END,
  monthly_amount = CASE
    WHEN plan_type = 'free' THEN 0
    WHEN plan_type = 'essencial' THEN 49.90
    WHEN plan_type = 'premium' THEN 99.90
    WHEN plan_type = 'enterprise' THEN 299.90
    ELSE 49.90
  END
WHERE church_id IN (SELECT id FROM churches);

-- Verificar atualização
SELECT 
  s.plan_type,
  s.amount_cents,
  s.monthly_amount,
  c.name as church_name
FROM subscriptions s
JOIN churches c ON s.church_id = c.id
ORDER BY s.plan_type, c.name;

SELECT '✅ Valores das subscriptions atualizados!' AS Status;
