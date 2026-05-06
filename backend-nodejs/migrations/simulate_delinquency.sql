-- ============================================
-- Script de Teste: Simular Inadimplência
-- ============================================
-- Define algumas igrejas como inadimplentes para teste

USE jesus_vitoria_connect;

-- Igreja 1: 45 dias de atraso (Suspenso Parcial)
UPDATE subscriptions 
SET 
  current_period_end = DATE_SUB(NOW(), INTERVAL 45 DAY),
  payment_status = 'pending'
WHERE church_id = 1;

-- Igreja 2: 35 dias de atraso (Suspenso Total)
UPDATE subscriptions 
SET 
  current_period_end = DATE_SUB(NOW(), INTERVAL 35 DAY),
  payment_status = 'pending'
WHERE church_id = 2;

-- Igreja 3: 95 dias de atraso (Cancelar)
UPDATE subscriptions 
SET 
  current_period_end = DATE_SUB(NOW(), INTERVAL 95 DAY),
  payment_status = 'failed'
WHERE church_id = 3;

-- Igreja 4: 15 dias de atraso (Atenção)
UPDATE subscriptions 
SET 
  current_period_end = DATE_SUB(NOW(), INTERVAL 15 DAY),
  payment_status = 'pending'
WHERE church_id = 4;

-- Igreja 5: 7 dias de atraso (Cobrar)
UPDATE subscriptions 
SET 
  current_period_end = DATE_SUB(NOW(), INTERVAL 7 DAY),
  payment_status = 'pending'
WHERE church_id = 5;

-- Igreja 6: 65 dias de atraso (Cancelamento Pendente)
UPDATE subscriptions 
SET 
  current_period_end = DATE_SUB(NOW(), INTERVAL 65 DAY),
  payment_status = 'failed'
WHERE church_id = 6;

-- Atualizar status das igrejas
UPDATE churches c
JOIN subscriptions s ON c.id = s.church_id
SET 
  c.days_overdue = GREATEST(0, DATEDIFF(NOW(), s.current_period_end)),
  c.billing_status = CASE
    WHEN s.payment_status = 'paid' THEN 'current'
    WHEN DATEDIFF(NOW(), s.current_period_end) >= 90 THEN 'cancelled'
    WHEN DATEDIFF(NOW(), s.current_period_end) >= 60 THEN 'cancellation_pending'
    WHEN DATEDIFF(NOW(), s.current_period_end) >= 31 THEN 'total_suspended'
    WHEN DATEDIFF(NOW(), s.current_period_end) >= 21 THEN 'partial_suspended'
    WHEN DATEDIFF(NOW(), s.current_period_end) >= 7 THEN 'warning'
    ELSE 'current'
  END
WHERE c.id IN (SELECT id FROM (SELECT id FROM churches) AS tmp);

-- Verificar resultado
SELECT 
  c.name as igreja,
  s.plan_type,
  s.payment_status,
  DATEDIFF(NOW(), s.current_period_end) as dias_atraso,
  c.billing_status,
  c.days_overdue
FROM churches c
JOIN subscriptions s ON c.id = s.church_id
WHERE c.days_overdue > 0
ORDER BY c.days_overdue DESC;

SELECT '✅ Igrejas inadimplentes simuladas!' AS Status;
SELECT 'Acesse: http://localhost:5173/super-admin/delinquency' AS Info;
