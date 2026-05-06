-- ================================================================
-- Igreja Connect - Corrigir Hash de Senhas
-- ================================================================
-- Corrige hash de Laravel ($2y$) para Node.js ($2b$)
-- Hash válido gerado com bcrypt de 12 rounds
-- ================================================================

-- Desabilitar safe updates temporariamente
SET SQL_SAFE_UPDATES = 0;

-- Atualizar TODAS as senhas para hash correto do Node.js
-- Senha padrão: admin123
-- Hash válido: $2b$12$iHAoCn4/UDBBnN9syIG7c.nZfLuA.8O5PHcr5BMcfCdhnc1gojCKC
UPDATE `usuarios_admin` 
SET password = '$2b$12$iHAoCn4/UDBBnN9syIG7c.nZfLuA.8O5PHcr5BMcfCdhnc1gojCKC'
WHERE password LIKE '$2y$%' OR id > 0;

-- Reabilitar safe updates
SET SQL_SAFE_UPDATES = 1;

-- Verificar atualização
SELECT email, role, SUBSTRING(password, 1, 10) as hash_prefix 
FROM usuarios_admin 
ORDER BY email;

SELECT '✅ TODAS as senhas corrigidas para Node.js!' AS Status;
SELECT 'Senha padrão: admin123' AS Senha;
SELECT 'Importante: Troque as senhas após o primeiro login!' AS Aviso;
