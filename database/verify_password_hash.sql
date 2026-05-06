-- ================================================================
-- Igreja Connect - Verificar Hash de Senhas
-- ================================================================
-- Verifica se as senhas foram corrigidas
-- ================================================================

-- Verificar hash atual
SELECT 
  id,
  email, 
  role,
  SUBSTRING(password, 1, 10) as hash_prefix,
  LENGTH(password) as hash_length,
  CASE 
    WHEN password LIKE '$2b$%' THEN '✅ Node.js (Correto)'
    WHEN password LIKE '$2y$%' THEN '❌ Laravel (Errado)'
    ELSE '❓ Desconhecido'
  END as status
FROM usuarios_admin 
ORDER BY email;

-- Contar por tipo de hash
SELECT 
  CASE 
    WHEN password LIKE '$2b$%' THEN 'Node.js ($2b$)'
    WHEN password LIKE '$2y$%' THEN 'Laravel ($2y$)'
    ELSE 'Outro'
  END as tipo_hash,
  COUNT(*) as quantidade
FROM usuarios_admin
GROUP BY 
  CASE 
    WHEN password LIKE '$2b$%' THEN 'Node.js ($2b$)'
    WHEN password LIKE '$2y$%' THEN 'Laravel ($2y$)'
    ELSE 'Outro'
  END;

-- Se ainda tiver $2y$, executar correção
SELECT 'Se ainda tiver hash $2y$, execute o script fix_password_hash.sql' AS instrucao;
