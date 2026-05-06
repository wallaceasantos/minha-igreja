-- ================================================================
-- POPULAR BANCO DE DADOS - IGREJA CONNECT
-- ================================================================
-- Dados de demonstração: 10 igrejas em Manaus
-- Planos: Free, Essencial, Premium, Enterprise
-- ================================================================

USE igreja_connect;

SET FOREIGN_KEY_CHECKS = 0;

-- ================================================================
-- 1. LIMPAR DADOS EXISTENTES (para evitar duplicação)
-- ================================================================

TRUNCATE TABLE `audit_logs`;
TRUNCATE TABLE `admin_tokens`;
TRUNCATE TABLE `contact_messages`;
TRUNCATE TABLE `pedidos`;
TRUNCATE TABLE `church_events`;
TRUNCATE TABLE `church_members`;
TRUNCATE TABLE `church_service_times`;
TRUNCATE TABLE `subscriptions_payments`;
TRUNCATE TABLE `collection_notes`;
TRUNCATE TABLE `usage_counters`;
TRUNCATE TABLE `subscriptions`;
TRUNCATE TABLE `usuarios_admin`;
TRUNCATE TABLE `churches`;

-- ================================================================
-- 2. ATUALIZAR ENUM DE PLANOS (se necessário)
-- ================================================================

-- Atualizar enum para incluir 'enterprise'
ALTER TABLE `churches` MODIFY COLUMN `plan_type` ENUM('free','essencial','premium','enterprise') DEFAULT 'free';
ALTER TABLE `subscriptions` MODIFY COLUMN `plan_type` ENUM('free','essencial','premium','enterprise') DEFAULT 'free';

-- ================================================================
-- 3. INSERIR IGREJAS (10 igrejas em Manaus com planos variados)
-- ================================================================

INSERT INTO `churches` (`id`, `name`, `slug`, `description`, `address_street`, `address_number`, `address_neighborhood`, `address_city`, `address_state`, `address_zip`, `phone`, `whatsapp`, `email`, `plan_type`, `is_active`, `is_verified`, `created_at`) VALUES

-- PLANO FREE (3 igrejas - igrejas pequenas/iniciantes)
(1, 'Ministério Nova Vida', 'ministerio-nova-vida', 'Um ministério comprometido com o evangelho e a missão de fazer discípulos em Manaus.', 'Rua São João Batista', '123', 'São Lázaro', 'Manaus', 'AM', '69073-120', '(92) 3234-1111', '(92) 99234-1111', 'contato@novavida.com.br', 'free', 1, 0, DATE_SUB(NOW(), INTERVAL 5 DAY)),

(2, 'Igreja Batista da Graça', 'batista-graca', 'Pela graça sois salvos, mediante a fé. Efésios 2:8', 'Rua Marquês de Santa Cruz', '450', 'Nossa Senhora das Graças', 'Manaus', 'AM', '69053-360', '(92) 3234-2222', '(92) 99234-2222', 'contato@batistagraca.com.br', 'free', 1, 0, DATE_SUB(NOW(), INTERVAL 15 DAY)),

(3, 'Igreja Metodista de Manaus', 'metodista-manaus', 'Uma igreja histórica, comprometida com a santidade e justiça social.', 'Rua São João Batista', '300', 'São Lázaro', 'Manaus', 'AM', '69073-120', '(92) 3234-3333', '(92) 99234-3333', 'contato@metodistamanaus.com.br', 'free', 1, 0, DATE_SUB(NOW(), INTERVAL 25 DAY)),

-- PLANO ESSENCIAL (4 igrejas - igrejas em crescimento)
(4, 'Primeira Igreja Batista de Manaus', 'primeira-batista-manaus', 'Uma igreja comprometida com o evangelho de Cristo e a missão de fazer discípulos em Manaus.', 'Avenida Ipixuna', '1000', 'Cachoeirinha', 'Manaus', 'AM', '69065-010', '(92) 3234-5678', '(92) 99234-5678', 'contato@primeirabatista.com.br', 'essencial', 1, 1, DATE_SUB(NOW(), INTERVAL 10 DAY)),

(5, 'Igreja Assembleia de Deus - Centro', 'assembleia-deus-centro', 'Levando a palavra de Deus para toda a cidade de Manaus desde 1950.', 'Rua dos Andradas', '500', 'Centro', 'Manaus', 'AM', '69010-020', '(92) 3622-1234', '(92) 99122-1234', 'secretaria@assembleiacentro.com.br', 'essencial', 1, 1, DATE_SUB(NOW(), INTERVAL 12 DAY)),

(6, 'Igreja Batista da Liberdade', 'batista-liberdade', 'Anunciando a liberdade que há em Cristo Jesus para toda Manaus.', 'Rua Frei José dos Santos', '800', 'Liberdade', 'Manaus', 'AM', '69065-120', '(92) 3238-4567', '(92) 99238-4567', 'contato@batistaliberdade.com.br', 'essencial', 1, 1, DATE_SUB(NOW(), INTERVAL 8 DAY)),

(7, 'Igreja Batista Nacional', 'batista-nacional', 'Uma igreja brasileira, comprometida com a evangelização e o discipulado.', 'Avenida Autaz Mirim', '1200', 'Jorge Teixeira', 'Manaus', 'AM', '69079-000', '(92) 3656-7890', '(92) 99656-7890', 'contato@batistanacional.com.br', 'essencial', 1, 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- PLANO PREMIUM (2 igrejas - igrejas estabelecidas)
(8, 'Igreja do Evangelho Quadrangular', 'quadrangular-manaus', 'Jesus Cristo salva, batiza com o Espírito Santo, cura e em breve virá!', 'Rua Coronel Ferreira', '600', 'São Geraldo', 'Manaus', 'AM', '69055-230', '(92) 3238-1122', '(92) 99238-1122', 'contato@quadrangularmanaus.com.br', 'premium', 1, 1, DATE_SUB(NOW(), INTERVAL 3 DAY)),

(9, 'Igreja Presbiteriana de Manaus', 'presbiteriana-manaus', 'Uma igreja reformada, comprometida com as doutrinas bíblicas e a adoração a Deus.', 'Avenida Sete de Setembro', '1500', 'Centro', 'Manaus', 'AM', '69020-030', '(92) 3232-9876', '(92) 99321-9876', 'contato@presbiterianamanaus.com.br', 'premium', 1, 1, DATE_SUB(NOW(), INTERVAL 6 DAY)),

-- PLANO ENTERPRISE (1 igreja - igreja grande/rede)
(10, 'Igreja Universal do Reino de Deus - Manaus', 'universal-manaus', 'Pare de sofrer! Venha para a Universal e tenha uma vida de vitórias.', 'Avenida Djalma Batista', '2000', 'Chapada', 'Manaus', 'AM', '69050-010', '(92) 3634-8900', '(92) 99634-8900', 'contato@universalmanaus.com.br', 'enterprise', 1, 1, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ================================================================
-- 4. INSERIR ADMINISTRADORES/PASTORES (10 pastores + 1 super admin)
-- ================================================================

-- Senha padrão para todos: pastor123 (hash bcrypt)
INSERT INTO `usuarios_admin` (`id`, `church_id`, `name`, `email`, `password`, `role`, `is_active`) VALUES

-- SUPER ADMIN (você)
(1, NULL, 'Super Admin', 'admin@igreja-connect.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin', 1),

-- PASTORES PLANO FREE (3)
(2, 1, 'Pr. Marcos Silva', 'pastor@novavida.com.br', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1),
(3, 2, 'Pr. Lucas Martins', 'pastor@batistagraca.com.br', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1),
(4, 3, 'Pr. Carlos Mendes', 'pastor@metodistamanaus.com.br', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1),

-- PASTORES PLANO ESSENCIAL (4)
(5, 4, 'Pr. João Silva', 'pastor@primeirabatista.com.br', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1),
(6, 5, 'Pr. José Santos', 'pastor@assembleiacentro.com.br', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1),
(7, 6, 'Pr. Marcos Ferreira', 'pastor@batistaliberdade.com.br', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1),
(8, 7, 'Pr. Roberto Alves', 'pastor@batistanacional.com.br', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1),

-- PASTORES PLANO PREMIUM (2)
(9, 8, 'Pr. Daniel Souza', 'pastor@quadrangularmanaus.com.br', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1),
(10, 9, 'Pr. Pedro Oliveira', 'pastor@presbiterianamanaus.com.br', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1),

-- PASTOR PLANO ENTERPRISE (1)
(11, 10, 'Bispo Antônio Costa', 'bispo@universalmanaus.com.br', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1);

-- ================================================================
-- 5. INSERIR ASSINATURAS (uma por igreja)
-- ================================================================

INSERT INTO `subscriptions` (`church_id`, `plan_type`, `status`, `current_period_start`, `current_period_end`, `trial_end_date`, `created_at`) VALUES

-- PLANO FREE (3 igrejas - trial ou grátis)
(1, 'free', 'trial', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 'free', 'trial', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),
(3, 'free', 'trial', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY)),

-- PLANO ESSENCIAL (4 igrejas - R$ 49,90/mês)
(4, 'essencial', 'active', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), NULL, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(5, 'essencial', 'active', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), NULL, DATE_SUB(NOW(), INTERVAL 12 DAY)),
(6, 'essencial', 'active', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), NULL, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(7, 'essencial', 'active', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), NULL, DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- PLANO PREMIUM (2 igrejas - R$ 99,90/mês)
(8, 'premium', 'active', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), NULL, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(9, 'premium', 'active', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), NULL, DATE_SUB(NOW(), INTERVAL 6 DAY)),

-- PLANO ENTERPRISE (1 igreja - R$ 299,90/mês)
(10, 'enterprise', 'active', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), NULL, DATE_SUB(NOW(), INTERVAL 1 DAY));

-- ================================================================
-- 6. INSERIR PAGAMENTOS (para demonstrar inadimplência)
-- ================================================================

-- Igreja 1 (Free): Em dia (trial)
INSERT INTO `subscriptions_payments` (`subscription_id`, `church_id`, `amount`, `status`, `due_date`, `paid_date`, `payment_method`) VALUES
(1, 1, 0.00, 'paid', DATE_SUB(CURDATE(), INTERVAL 5 DAY), DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'credit_card');

-- Igreja 2 (Free): 10 dias atrasada (trial vencido)
INSERT INTO `subscriptions_payments` (`subscription_id`, `church_id`, `amount`, `status`, `due_date`, `paid_date`, `payment_method`) VALUES
(2, 2, 0.00, 'overdue', DATE_SUB(CURDATE(), INTERVAL 10 DAY), NULL, 'boleto');

-- Igreja 3 (Free): Trial acabando em 5 dias
INSERT INTO `subscriptions_payments` (`subscription_id`, `church_id`, `amount`, `status`, `due_date`, `paid_date`, `payment_method`) VALUES
(3, 3, 0.00, 'pending', DATE_ADD(CURDATE(), INTERVAL 5 DAY), NULL, 'credit_card');

-- Igreja 4 (Essencial - R$ 49,90): Em dia
INSERT INTO `subscriptions_payments` (`subscription_id`, `church_id`, `amount`, `status`, `due_date`, `paid_date`, `payment_method`, `transaction_id`) VALUES
(4, 4, 49.90, 'paid', DATE_SUB(CURDATE(), INTERVAL 30 DAY), DATE_SUB(CURDATE(), INTERVAL 28 DAY), 'credit_card', 'TXN004'),
(4, 4, 49.90, 'pending', CURDATE(), NULL, 'credit_card', NULL);

-- Igreja 5 (Essencial - R$ 49,90): 15 dias atrasada
INSERT INTO `subscriptions_payments` (`subscription_id`, `church_id`, `amount`, `status`, `due_date`, `paid_date`, `payment_method`) VALUES
(5, 5, 49.90, 'overdue', DATE_SUB(CURDATE(), INTERVAL 15 DAY), NULL, 'boleto');

-- Igreja 6 (Essencial - R$ 49,90): 35 dias atrasada (crítico - suspender)
INSERT INTO `subscriptions_payments` (`subscription_id`, `church_id`, `amount`, `status`, `due_date`, `paid_date`, `payment_method`) VALUES
(6, 6, 49.90, 'overdue', DATE_SUB(CURDATE(), INTERVAL 35 DAY), NULL, 'boleto');

-- Igreja 7 (Essencial - R$ 49,90): Em dia
INSERT INTO `subscriptions_payments` (`subscription_id`, `church_id`, `amount`, `status`, `due_date`, `paid_date`, `payment_method`, `transaction_id`) VALUES
(7, 7, 49.90, 'paid', DATE_SUB(CURDATE(), INTERVAL 30 DAY), DATE_SUB(CURDATE(), INTERVAL 27 DAY), 'pix', 'TXN007'),
(7, 7, 49.90, 'pending', CURDATE(), NULL, 'pix', NULL);

-- Igreja 8 (Premium - R$ 99,90): Em dia
INSERT INTO `subscriptions_payments` (`subscription_id`, `church_id`, `amount`, `status`, `due_date`, `paid_date`, `payment_method`, `transaction_id`) VALUES
(8, 8, 99.90, 'paid', DATE_SUB(CURDATE(), INTERVAL 30 DAY), DATE_SUB(CURDATE(), INTERVAL 28 DAY), 'credit_card', 'TXN008'),
(8, 8, 99.90, 'pending', CURDATE(), NULL, 'credit_card', NULL);

-- Igreja 9 (Premium - R$ 99,90): 5 dias atrasada
INSERT INTO `subscriptions_payments` (`subscription_id`, `church_id`, `amount`, `status`, `due_date`, `paid_date`, `payment_method`) VALUES
(9, 9, 99.90, 'overdue', DATE_SUB(CURDATE(), INTERVAL 5 DAY), NULL, 'boleto');

-- Igreja 10 (Enterprise - R$ 299,90): Em dia
INSERT INTO `subscriptions_payments` (`subscription_id`, `church_id`, `amount`, `status`, `due_date`, `paid_date`, `payment_method`, `transaction_id`) VALUES
(10, 10, 299.90, 'paid', DATE_SUB(CURDATE(), INTERVAL 30 DAY), DATE_SUB(CURDATE(), INTERVAL 28 DAY), 'bank_transfer', 'TXN010'),
(10, 10, 299.90, 'pending', CURDATE(), NULL, 'bank_transfer', NULL);

-- ================================================================
-- 7. INSERIR MEMBROS (distribuição realista por plano)
-- ================================================================

-- Igreja 1 (Free): 15 membros
INSERT INTO `church_members` (`church_id`, `name`, `email`, `phone`) VALUES
(1, 'Maria da Silva', 'maria.silva@email.com', '(92) 99111-2222'),
(1, 'José Oliveira', 'jose.oliveira@email.com', '(92) 99222-3333'),
(1, 'Ana Santos', 'ana.santos@email.com', '(92) 99333-4444'),
(1, 'Pedro Costa', 'pedro.costa@email.com', '(92) 99444-5555'),
(1, 'João Ferreira', 'joao.ferreira@email.com', '(92) 99555-6666');

-- Igreja 2 (Free): 8 membros
INSERT INTO `church_members` (`church_id`, `name`, `email`, `phone`) VALUES
(2, 'Francisca Almeida', 'francisca.almeida@email.com', '(92) 99666-7777'),
(2, 'Antônio Souza', 'antonio.souza@email.com', '(92) 99777-8888'),
(2, 'Raimunda Pereira', 'raimunda.pereira@email.com', '(92) 99888-9999');

-- Igreja 3 (Free): 5 membros
INSERT INTO `church_members` (`church_id`, `name`, `email`, `phone`) VALUES
(3, 'Carlos Barbosa', 'carlos.barbosa@email.com', '(92) 99111-3333'),
(3, 'Luciana Ribeiro', 'luciana.ribeiro@email.com', '(92) 99222-4444');

-- Igreja 4 (Essencial): 85 membros
INSERT INTO `church_members` (`church_id`, `name`, `email`, `phone`) VALUES
(4, 'Patricia Araújo', 'patricia.araujo@email.com', '(92) 99444-6666'),
(4, 'Fernando Lopes', 'fernando.lopes@email.com', '(92) 99555-7777'),
(4, 'Cristina Dias', 'cristina.dias@email.com', '(92) 99666-8888'),
(4, 'Ricardo Monteiro', 'ricardo.monteiro@email.com', '(92) 99777-9999'),
(4, 'Juliana Teixeira', 'juliana.teixeira@email.com', '(92) 99888-0000');

-- Igreja 5 (Essencial): 120 membros
INSERT INTO `church_members` (`church_id`, `name`, `email`, `phone`) VALUES
(5, 'Alexandre Pires', 'alexandre.pires@email.com', '(92) 99999-1111'),
(5, 'Vanessa Correia', 'vanessa.correia@email.com', '(92) 99000-2222'),
(5, 'Gustavo Nunes', 'gustavo.nunes@email.com', '(92) 99111-4444'),
(5, 'Simone Azevedo', 'simone.azevedo@email.com', '(92) 99222-5555'),
(5, 'Edson Ramos', 'edson.ramos@email.com', '(92) 99333-6666');

-- Igreja 6 (Essencial): 65 membros
INSERT INTO `church_members` (`church_id`, `name`, `email`, `phone`) VALUES
(6, 'Márcia Cunha', 'marcia.cunha@email.com', '(92) 99444-7777'),
(6, 'Rodrigo Freitas', 'rodrigo.freitas@email.com', '(92) 99555-8888'),
(6, 'Adriana Castro', 'adriana.castro@email.com', '(92) 99666-9999');

-- Igreja 7 (Essencial): 95 membros
INSERT INTO `church_members` (`church_id`, `name`, `email`, `phone`) VALUES
(7, 'Bruno Machado', 'bruno.machado@email.com', '(92) 99777-0000'),
(7, 'Eliane Borges', 'eliane.borges@email.com', '(92) 99888-1111'),
(7, 'Wilson Carvalho', 'wilson.carvalho@email.com', '(92) 99999-2222'),
(7, 'Silvia Moreira', 'silvia.moreira@email.com', '(92) 99000-3333');

-- Igreja 8 (Premium): 250 membros
INSERT INTO `church_members` (`church_id`, `name`, `email`, `phone`) VALUES
(8, 'Jorge Pinto', 'jorge.pinto@email.com', '(92) 99111-5555'),
(8, 'Renata Gomes', 'renata.gomes@email.com', '(92) 99222-6666'),
(8, 'Fabio Cardoso', 'fabio.cardoso@email.com', '(92) 99333-7777'),
(8, 'Camila Nunes', 'camila.nunes@email.com', '(92) 99444-8888'),
(8, 'Thiago Alves', 'thiago.alves@email.com', '(92) 99555-9999');

-- Igreja 9 (Premium): 180 membros
INSERT INTO `church_members` (`church_id`, `name`, `email`, `phone`) VALUES
(9, 'André Sousa', 'andre.sousa@email.com', '(92) 99666-0000'),
(9, 'Larissa Dias', 'larissa.dias@email.com', '(92) 99777-1111'),
(9, 'Rafael Rocha', 'rafael.rocha@email.com', '(92) 99888-2222'),
(9, 'Beatriz Lima', 'beatriz.lima@email.com', '(92) 99999-3333');

-- Igreja 10 (Enterprise): 500 membros
INSERT INTO `church_members` (`church_id`, `name`, `email`, `phone`) VALUES
(10, 'Gabriel Ferreira', 'gabriel.ferreira@email.com', '(92) 99000-4444'),
(10, 'Amanda Costa', 'amanda.costa@email.com', '(92) 99111-6666'),
(10, 'Leonardo Oliveira', 'leonardo.oliveira@email.com', '(92) 99222-7777'),
(10, 'Fernanda Santos', 'fernanda.santos@email.com', '(92) 99333-8888'),
(10, 'Henrique Silva', 'henrique.silva@email.com', '(92) 99444-9999');

-- ================================================================
-- 8. INSERIR PEDIDOS DE ORAÇÃO
-- ================================================================

INSERT INTO `pedidos` (`church_id`, `titulo`, `oracao`, `pedido_atendido`, `status`, `created_by`, `created_at`) VALUES
(1, 'Cura de enfermidade', 'Senhor, peço cura para minha mãe que está enferma.', 0, 'pending', 2, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(1, 'Emprego', 'Preciso de um emprego para sustentar minha família.', 1, 'answered', 2, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(2, 'Salvação', 'Oro pela salvação do meu filho.', 0, 'pending', 3, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(4, 'Restauração familiar', 'Oro pela restauração do meu casamento.', 0, 'pending', 5, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(4, 'Prosperidade', 'Oro por prosperidade financeira.', 1, 'answered', 5, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(5, 'Libertação', 'Preciso de libertação de vícios.', 0, 'pending', 6, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(7, 'Direção', 'Peço direção de Deus para minha decisão.', 0, 'pending', 8, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(8, 'Cura física', 'Oro por cura de uma doença crônica.', 1, 'answered', 9, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(8, 'Unção', 'Peço unção do Espírito Santo.', 0, 'pending', 9, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(10, 'Milagre', 'Preciso de um milagre em minha vida.', 1, 'answered', 11, DATE_SUB(NOW(), INTERVAL 8 DAY));

-- ================================================================
-- 9. INSERIR EVENTOS
-- ================================================================

INSERT INTO `church_events` (`church_id`, `title`, `description`, `event_type`, `start_datetime`, `location`, `status`) VALUES
(1, 'Culto de Celebração', 'Culto dominical de celebração a Deus.', 'culto', DATE_ADD(NOW(), INTERVAL 3 DAY), 'Templo Principal', 'scheduled'),
(1, 'Escola Bíblica', 'Aula para crianças e jovens.', 'reuniao', DATE_ADD(NOW(), INTERVAL 5 DAY), 'Salão de Aulas', 'scheduled'),
(4, 'Batismo', 'Cerimônia de batismo nas águas.', 'evento', DATE_ADD(NOW(), INTERVAL 14 DAY), 'Lago do Parque', 'scheduled'),
(4, 'Culto Familiar', 'Culto para toda a família.', 'culto', DATE_ADD(NOW(), INTERVAL 7 DAY), 'Templo Principal', 'scheduled'),
(5, 'Congresso de Mocidade', 'Encontro de jovens da assembleia.', 'congresso', DATE_ADD(NOW(), INTERVAL 10 DAY), 'Ginásio da Igreja', 'scheduled'),
(7, 'Confraternização', 'Festa de integração dos membros.', 'evento', DATE_ADD(NOW(), INTERVAL 20 DAY), 'Salão de Festas', 'scheduled'),
(8, 'Culto de Cura', 'Ministração de cura divina.', 'culto', DATE_ADD(NOW(), INTERVAL 5 DAY), 'Templo Principal', 'scheduled'),
(8, 'Retiro Espiritual', 'Retiro de 3 dias para liderança.', 'retiro', DATE_ADD(NOW(), INTERVAL 30 DAY), 'Sítio da Igreja', 'scheduled'),
(9, 'Estudo Bíblico', 'Estudo do livro de Romanos.', 'reuniao', DATE_ADD(NOW(), INTERVAL 4 DAY), 'Auditório', 'scheduled'),
(10, 'Campanha de Libertação', '7 dias de campanha de libertação.', 'congresso', DATE_ADD(NOW(), INTERVAL 2 DAY), 'Templo Principal', 'scheduled');

-- ================================================================
-- 10. INSERIR HORÁRIOS DE CULTO
-- ================================================================

INSERT INTO `church_service_times` (`church_id`, `day_of_week`, `service_name`, `service_time`, `description`) VALUES
(1, 'Sunday', 'Culto de Celebração', '19:00:00', 'Culto dominical'),
(1, 'Wednesday', 'Estudo Bíblico', '19:30:00', 'Estudo das escrituras'),
(4, 'Sunday', 'Culto de Adoração', '19:00:00', 'Adoração e louvor'),
(4, 'Wednesday', 'Culto de Ensino', '19:30:00', 'Estudo bíblico'),
(4, 'Friday', 'Culto de Oração', '19:00:00', 'Noite de oração'),
(5, 'Sunday', 'Culto da Família', '18:00:00', 'Culto para toda família'),
(5, 'Tuesday', 'Reunião de Oração', '19:30:00', 'Oração e intercessão'),
(7, 'Sunday', 'Culto Evangélico', '19:00:00', 'Culto dominical'),
(7, 'Thursday', 'Estudo Bíblico', '19:30:00', 'Estudo das escrituras'),
(8, 'Sunday', 'Culto Quadrangular', '19:00:00', 'Culto oficial'),
(8, 'Wednesday', 'Culto de Milagres', '19:30:00', 'Ministração de milagres'),
(9, 'Sunday', 'Culto Solene', '19:00:00', 'Culto reformado'),
(9, 'Wednesday', 'Estudo de Doutrina', '19:30:00', 'Estudo doutrinário'),
(10, 'Sunday', 'Culto da Vitória', '10:00:00', 'Culto da manhã'),
(10, 'Sunday', 'Culto da Libertação', '19:00:00', 'Culto da noite'),
(10, 'Tuesday', 'Reunião de Cura', '19:30:00', 'Ministração de cura');

-- ================================================================
-- 11. INSERIR NOTAS DE COBRANÇA (para inadimplentes)
-- ================================================================

INSERT INTO `collection_notes` (`church_id`, `subscription_id`, `user_id`, `note_type`, `note`, `follow_up_date`) VALUES
(2, 2, 1, 'email', 'Email de cobrança enviado - 10 dias de atraso (trial vencido)', DATE_ADD(NOW(), INTERVAL 3 DAY)),
(5, 5, 1, 'email', 'Email de cobrança enviado - 15 dias de atraso', DATE_ADD(NOW(), INTERVAL 5 DAY)),
(6, 6, 1, 'email', 'Email de cobrança enviado - 35 dias de atraso', DATE_ADD(NOW(), INTERVAL 2 DAY)),
(6, 6, 1, 'call', 'Ligação realizada - Pastor prometeu pagar até sexta', DATE_ADD(NOW(), INTERVAL 5 DAY)),
(9, 9, 1, 'email', 'Email de cobrança enviado - 5 dias de atraso', DATE_ADD(NOW(), INTERVAL 7 DAY));

-- ================================================================
-- 12. INSERIR CONTADORES DE USO
-- ================================================================

INSERT INTO `usage_counters` (`church_id`, `counter_type`, `counter_value`, `period_start`, `period_end`) VALUES
(1, 'members', 15, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(1, 'prayers', 2, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(1, 'admins', 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(2, 'members', 8, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(2, 'prayers', 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(2, 'admins', 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(3, 'members', 5, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(3, 'prayers', 0, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(3, 'admins', 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(4, 'members', 85, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(4, 'prayers', 2, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(4, 'admins', 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(5, 'members', 120, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(5, 'prayers', 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(5, 'admins', 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(6, 'members', 65, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(6, 'prayers', 0, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(6, 'admins', 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(7, 'members', 95, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(7, 'prayers', 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(7, 'admins', 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(8, 'members', 250, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(8, 'prayers', 2, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(8, 'admins', 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(9, 'members', 180, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(9, 'prayers', 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(9, 'admins', 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(10, 'members', 500, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(10, 'prayers', 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(10, 'admins', 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY));

SET FOREIGN_KEY_CHECKS = 1;

-- ================================================================
-- 13. MOSTRAR RESUMO DOS DADOS
-- ================================================================

SELECT '✅ BANCO DE DADOS POPULADO COM SUCESSO!' AS Status;

SELECT 'DISTRIBUIÇÃO DE PLANOS:' AS Resumo;
SELECT 
  plan_type,
  COUNT(*) as quantidade,
  SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as ativas,
  CASE plan_type
    WHEN 'free' THEN 'R$ 0,00/mês'
    WHEN 'essencial' THEN 'R$ 49,90/mês'
    WHEN 'premium' THEN 'R$ 99,90/mês'
    WHEN 'enterprise' THEN 'R$ 299,90/mês'
  END as preco
FROM churches
GROUP BY plan_type
ORDER BY 
  CASE plan_type
    WHEN 'free' THEN 1
    WHEN 'essencial' THEN 2
    WHEN 'premium' THEN 3
    WHEN 'enterprise' THEN 4
  END;

SELECT 'RECEITA MENSAL (MRR):' AS Resumo;
SELECT 
  SUM(CASE 
    WHEN c.plan_type = 'free' THEN 0
    WHEN c.plan_type = 'essencial' THEN 49.90
    WHEN c.plan_type = 'premium' THEN 99.90
    WHEN c.plan_type = 'enterprise' THEN 299.90
  END) as MRR_Total
FROM churches c
JOIN subscriptions s ON c.id = s.church_id
WHERE s.status = 'active' AND c.is_active = 1;

SELECT 'INADIMPLÊNCIA:' AS Resumo;
SELECT 
  COUNT(DISTINCT c.name) as igrejas_inadimplentes,
  SUM(sp.amount) as valor_total_devido,
  AVG(DATEDIFF(NOW(), sp.due_date)) as media_dias_atraso
FROM subscriptions_payments sp
JOIN churches c ON sp.church_id = c.id
WHERE sp.status IN ('pending', 'overdue');

SELECT 'MEMBROS POR PLANO:' AS Resumo;
SELECT 
  c.plan_type,
  COUNT(cm.id) as total_membros
FROM churches c
LEFT JOIN church_members cm ON c.id = cm.church_id
GROUP BY c.plan_type
ORDER BY 
  CASE c.plan_type
    WHEN 'free' THEN 1
    WHEN 'essencial' THEN 2
    WHEN 'premium' THEN 3
    WHEN 'enterprise' THEN 4
  END;

SELECT 'SENHAS DE ACESSO:' AS Resumo;
SELECT 'Super Admin: admin@igreja-connect.com / admin123' AS Login
UNION ALL
SELECT 'Pastores: pastor@[igreja].com.br / pastor123' AS Login;
