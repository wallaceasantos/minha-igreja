-- Adicionar campo about_content na tabela churches
-- Para separar descrição curta (hero) do conteúdo completo (sobre)

ALTER TABLE churches 
ADD COLUMN about_content TEXT NULL AFTER description;

-- Adicionar comentário (opcional)
ALTER TABLE churches 
MODIFY COLUMN about_content TEXT NULL COMMENT 'Conteúdo completo da seção Sobre (Quem Somos)';

-- Atualizar igrejas existentes: copiar description para about_content se tiver conteúdo longo
-- Usando ID para evitar erro do safe update mode
UPDATE churches 
SET about_content = description 
WHERE id IN (
    SELECT id FROM (
        SELECT id FROM churches 
        WHERE LENGTH(description) > 200 AND about_content IS NULL
    ) AS temp
);

-- Para igrejas com descrição curta, manter description no hero e about_content vazio
-- O pastor poderá editar depois no dashboard
