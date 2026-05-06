-- ================================================================
-- Igreja Connect - Corrigir Hash de Senhas (Método Alternativo)
-- ================================================================
-- Método mais agressivo para corrigir senhas
-- ================================================================

-- Método 1: Usando ID específico (mais seguro)
UPDATE `usuarios_admin` 
SET password = '$2b$10$6giwtFqlpO/H7z1u6D6DC.9wOzaYQLkroP8H7amusD7fKXlcnbiEa'
WHERE id > 0;

-- Verificar resultado
SELECT 
  email, 
  SUBSTRING(password, 1, 10) as hash_prefix,
  CASE 
    WHEN password LIKE '$2b$%' THEN '✅ Correto'
    WHEN password LIKE '$2y$%' THEN '❌ Errado'
    ELSE '❓ Outro'
  END as status
FROM usuarios_admin 
ORDER BY id;

SELECT '✅ Correção concluída!' AS Status;
