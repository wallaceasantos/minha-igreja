-- ================================================================
-- Igreja Connect - Atualizar Planos para Free e Essencial
-- ================================================================
-- Atualiza igrejas e assinaturas para usar apenas Free e Essencial
-- Migrar Premium e Enterprise para Essencial
-- ================================================================

-- 1. Atualizar igrejas com plano Premium para Essencial
UPDATE churches 
SET plan_type = 'essencial' 
WHERE plan_type = 'premium';

-- 2. Atualizar igrejas com plano Enterprise para Essencial
UPDATE churches 
SET plan_type = 'essencial' 
WHERE plan_type = 'enterprise';

-- 3. Atualizar assinaturas com plano Premium para Essencial
UPDATE subscriptions 
SET plan_type = 'essencial' 
WHERE plan_type = 'premium';

-- 4. Atualizar assinaturas com plano Enterprise para Essencial
UPDATE subscriptions 
SET plan_type = 'essencial' 
WHERE plan_type = 'enterprise';

-- 5. Verificar distribuição atual de planos
SELECT 
  'Igrejas por Plano' AS Informacao,
  plan_type,
  COUNT(*) as quantidade,
  SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as ativas
FROM churches
GROUP BY plan_type
ORDER BY 
  CASE plan_type 
    WHEN 'free' THEN 1 
    WHEN 'essencial' THEN 2 
  END;

-- 6. Verificar assinaturas por plano
SELECT 
  'Assinaturas por Plano' AS Informacao,
  plan_type,
  COUNT(*) as quantidade,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as ativas
FROM subscriptions
GROUP BY plan_type
ORDER BY 
  CASE plan_type 
    WHEN 'free' THEN 1 
    WHEN 'essencial' THEN 2 
  END;

SELECT '✅ Planos atualizados com sucesso! Apenas Free e Essencial disponíveis.' AS Status;
