-- ================================================================
-- Igreja Connect - Adicionar coordenadas do Google Maps
-- ================================================================
-- Adiciona campos para latitude e longitude na tabela churches
-- ================================================================

-- Adicionar colunas de coordenadas
ALTER TABLE `churches` 
ADD COLUMN `latitude` decimal(10, 8) NULL AFTER `address_zip`,
ADD COLUMN `longitude` decimal(11, 8) NULL AFTER `latitude`;

-- Adicionar índice para performance
ALTER TABLE `churches` 
ADD INDEX `idx_churches_location` (`latitude`, `longitude`);

-- Verificar colunas adicionadas
SELECT '✅ Colunas latitude e longitude adicionadas com sucesso!' AS Status;

-- Exemplo de como atualizar uma igreja específica:
-- UPDATE churches 
-- SET latitude = -3.1190, longitude = -60.0217 
-- WHERE slug = 'ministerio-nacional-da-restauracao';
-- (Coordenadas de Manaus - AM)
