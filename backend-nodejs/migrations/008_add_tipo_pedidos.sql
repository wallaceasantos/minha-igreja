-- ============================================
-- Migration 008: Atualizar tabela pedidos
-- ============================================
-- Data: 19/04/2026
-- Descrição: Adiciona campos para novo formulário de pedidos (tipo, nome, email, categoria, tema, privacidade)

USE jesus_vitoria_connect;

-- ============================================
-- 1. Adicionar colunas faltantes
-- ============================================

-- Tipo do registro (pedido, agradecimento, testemunho)
ALTER TABLE `pedidos`
ADD COLUMN `tipo` ENUM('pedido', 'agradecimento', 'testemunho') DEFAULT 'pedido' AFTER `church_id`;

-- Nome da pessoa que enviou
ALTER TABLE `pedidos`
ADD COLUMN `nome` VARCHAR(255) NOT NULL AFTER `tipo`;

-- Email de contato
ALTER TABLE `pedidos`
ADD COLUMN `email` VARCHAR(255) NOT NULL AFTER `nome`;

-- Categoria (para compatibilidade)
ALTER TABLE `pedidos`
ADD COLUMN `categoria` VARCHAR(50) DEFAULT NULL AFTER `email`;

-- Tema específico
ALTER TABLE `pedidos`
ADD COLUMN `tema` VARCHAR(255) DEFAULT NULL AFTER `categoria`;

-- Privacidade do pedido
ALTER TABLE `pedidos`
ADD COLUMN `privacidade` ENUM('private', 'public') DEFAULT 'private' AFTER `tema`;

-- ============================================
-- 2. Renomear campo titulo para manter compatibilidade
-- ============================================

-- O campo 'titulo' será mantido como alias de 'tema' para compatibilidade
-- O sistema usará 'tema' como principal

-- ============================================
-- 3. Adicionar índices para performance
-- ============================================

ALTER TABLE `pedidos` ADD INDEX `idx_tipo` (`tipo`);
ALTER TABLE `pedidos` ADD INDEX `idx_privacidade` (`privacidade`);
ALTER TABLE `pedidos` ADD INDEX `idx_tema` (`tema`);
ALTER TABLE `pedidos` ADD INDEX `idx_categoria` (`categoria`);

-- ============================================
-- Mensagem Final
-- ============================================

SELECT '✅ Migration 008 - Tabela pedidos atualizada com sucesso!' AS Status;
SELECT '📊 Colunas adicionadas: tipo, nome, email, categoria, tema, privacidade' AS Info;

-- Verificar estrutura final
DESCRIBE pedidos;
