/**
 * Página: LGPD - Lei Geral de Proteção de Dados
 * Informações sobre conformidade com a LGPD
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { HoverFooter } from '@/components/ui/hover-footer';
import heroBg from '@/assets/img_bkg.png';
import { Shield, Lock, User, Database, Eye, CheckCircle, AlertCircle, Church, Menu, X, LogIn, Sparkles } from 'lucide-react';

export default function LGPD() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Fixo - Estilo Landing Page */}
      <header className="border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Church className="h-7 w-7 text-primary" />
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-amber-500 animate-pulse" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">MinhaIgreja</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 ml-auto">
            <a href="/#funcionalidades" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Funcionalidades
            </a>
            <a href="/#planos" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Planos
            </a>
            <a href="/#depoimentos" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Depoimentos
            </a>
            <Button variant="ghost" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <ModeToggle />
            <Button asChild>
              <Link to="/criar">Criar Minha Igreja</Link>
            </Button>
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden ml-auto">
            <ModeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-3">
              <a
                href="/#funcionalidades"
                className="text-sm font-medium py-2 px-3 rounded-md transition-colors hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                Funcionalidades
              </a>
              <a
                href="/#planos"
                className="text-sm font-medium py-2 px-3 rounded-md transition-colors hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                Planos
              </a>
              <a
                href="/#depoimentos"
                className="text-sm font-medium py-2 px-3 rounded-md transition-colors hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                Depoimentos
              </a>
              <Button variant="ghost" asChild className="justify-start">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Entrar
                </Link>
              </Button>
              <Button asChild>
                <Link to="/criar" onClick={() => setMobileMenuOpen(false)}>
                  Criar Minha Igreja
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
        {/* Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/70 via-background/40 to-background/70 dark:from-background/80 dark:via-background/50 dark:to-background/80" />

        <div className="container px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <Shield className="h-14 w-14 md:h-20 md:w-20 text-primary mx-auto mb-4 md:mb-6" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4 md:mb-6">
              LGPD - Lei Geral de Proteção de Dados
            </h1>
            <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Como o MinhaIgreja protege seus dados e está em conformidade com a Lei nº 13.709/2018
            </p>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <main className="flex-1">
        <section className="py-12 md:py-20 bg-background">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6 md:space-y-8">

              {/* O Que é LGPD */}
              <Card className="border shadow-sm">
                <CardContent className="pt-6 p-4 md:p-6">
                  <div className="flex items-start gap-3 mb-3 md:mb-4">
                    <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-primary mt-0.5 flex-shrink-0" />
                    <h2 className="text-xl md:text-2xl font-bold">O Que é a LGPD?</h2>
                  </div>
                  <div className="space-y-3 md:space-y-4 text-sm md:text-base text-muted-foreground">
                    <p>
                      A <strong>Lei Geral de Proteção de Dados Pessoais (LGPD)</strong> - Lei nº 13.709/2018
                      é a legislação brasileira que regula as atividades de tratamento e proteção de dados
                      pessoais.
                    </p>
                    <p>
                      A lei tem como objetivo proteger os direitos fundamentais de liberdade e de privacidade
                      e o livre desenvolvimento da personalidade da pessoa natural.
                    </p>
                    <div className="bg-primary/10 p-3 md:p-4 rounded-lg">
                      <p className="font-semibold text-primary mb-2 text-sm md:text-base">Principais Pilares:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm md:text-base">
                        <li>Transparência no tratamento de dados</li>
                        <li>Finalidade específica e legítima</li>
                        <li>Necessidade e minimização de dados</li>
                        <li>Segurança e prevenção de danos</li>
                        <li>Responsabilização e prestação de contas</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Como Protegemos Seus Dados */}
              <Card className="border shadow-sm">
                <CardContent className="pt-6 p-4 md:p-6">
                  <div className="flex items-start gap-3 mb-3 md:mb-4">
                    <Lock className="h-5 w-5 md:h-6 md:w-6 text-primary mt-0.5 flex-shrink-0" />
                    <h2 className="text-xl md:text-2xl font-bold">Como Protegemos Seus Dados</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="flex items-start gap-3">
                      <Database className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1 text-sm md:text-base">Criptografia de Dados</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Todos os dados são criptografados em trânsito (SSL/TLS) e em repouso.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1 text-sm md:text-base">Acesso Restrito</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Apenas pessoas autorizadas têm acesso aos dados, com autenticação de dois fatores.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Eye className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1 text-sm md:text-base">Isolamento de Dados</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Cada igreja tem seus dados completamente isolados das demais.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1 text-sm md:text-base">Backups Regulares</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Backups automáticos diários em servidores seguros e redundantes.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dados que Coletamos */}
              <Card className="border shadow-sm">
                <CardContent className="pt-6 p-4 md:p-6">
                  <div className="flex items-start gap-3 mb-3 md:mb-4">
                    <User className="h-5 w-5 md:h-6 md:w-6 text-primary mt-0.5 flex-shrink-0" />
                    <h2 className="text-xl md:text-2xl font-bold">Dados que Coletamos</h2>
                  </div>
                  <div className="space-y-3 md:space-y-4 text-sm md:text-base">
                    <div>
                      <h3 className="font-semibold mb-2 text-sm md:text-base">Dados Pessoais:</h3>
                      <ul className="list-disc list-inside space-y-1.5 md:space-y-2 text-muted-foreground ml-2 md:ml-4">
                        <li>Nome completo</li>
                        <li>Endereço de e-mail</li>
                        <li>Número de telefone</li>
                        <li>CPF (apenas quando necessário para emissão de notas fiscais)</li>
                        <li>Endereço completo</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 text-sm md:text-base">Dados de Navegação:</h3>
                      <ul className="list-disc list-inside space-y-1.5 md:space-y-2 text-muted-foreground ml-2 md:ml-4">
                        <li>Endereço IP</li>
                        <li>Tipo de navegador e dispositivo</li>
                        <li>Páginas acessadas e tempo de permanência</li>
                        <li>Cookies e tecnologias similares</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 text-sm md:text-base">Dados da Igreja:</h3>
                      <ul className="list-disc list-inside space-y-1.5 md:space-y-2 text-muted-foreground ml-2 md:ml-4">
                        <li>Nome e CNPJ da igreja</li>
                        <li>Endereço e informações de contato</li>
                        <li>Dados dos membros cadastrados</li>
                        <li>Pedidos de oração e mensagens</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Finalidade do Tratamento */}
              <Card className="border shadow-sm">
                <CardContent className="pt-6 p-4 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Finalidade do Tratamento de Dados</h2>
                  <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                    Coletamos e tratamos seus dados pessoais para as seguintes finalidades:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 md:space-y-2 text-sm md:text-base text-muted-foreground ml-2 md:ml-4">
                    <li>Prestação dos serviços contratados</li>
                    <li>Comunicação com o usuário (e-mails, notificações, suporte)</li>
                    <li>Faturamento e emissão de notas fiscais</li>
                    <li>Melhoria contínua da plataforma</li>
                    <li>Cumprimento de obrigações legais e regulatórias</li>
                    <li>Prevenção a fraudes e segurança</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Seus Direitos */}
              <Card className="border shadow-sm">
                <CardContent className="pt-6 p-4 md:p-6">
                  <div className="flex items-start gap-3 mb-3 md:mb-4">
                    <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-primary mt-0.5 flex-shrink-0" />
                    <h2 className="text-xl md:text-2xl font-bold">Seus Direitos (Titular dos Dados)</h2>
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                    De acordo com a LGPD, você tem os seguintes direitos:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-sm md:text-base">Confirmação</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Confirmar a existência de tratamento de dados
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-sm md:text-base">Acesso</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Acessar seus dados pessoais
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-sm md:text-base">Correção</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Corrigir dados incompletos, inexatos ou desatualizados
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-sm md:text-base">Anonimização</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Anonimizar, bloquear ou eliminar dados desnecessários
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-sm md:text-base">Portabilidade</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Solicitar a portabilidade dos dados
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-sm md:text-base">Eliminação</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Eliminar dados tratados com consentimento
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-sm md:text-base">Informação</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Informação sobre entidades com quem compartilhamos dados
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-sm md:text-base">Revogação</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Revogar o consentimento a qualquer momento
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Como Exercer Seus Direitos */}
              <Card className="border shadow-sm">
                <CardContent className="pt-6 p-4 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Como Exercer Seus Direitos</h2>
                  <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                    Para exercer seus direitos previstos na LGPD, entre em contato com nosso
                    <strong> Encarregado de Proteção de Dados (DPO)</strong>:
                  </p>
                  <div className="bg-muted/50 p-3 md:p-4 rounded-lg space-y-2 text-sm md:text-base">
                    <div className="flex items-center gap-2">
                      <strong>Email:</strong>
                      <a href="mailto:dpo@minhaigreja.app" className="text-primary hover:underline">
                        dpo@minhaigreja.app
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <strong>Telefone:</strong>
                      <span>(11) 99999-9999</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <strong>Correspondência:</strong>
                      <span>Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100</span>
                    </div>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground mt-3 md:mt-4">
                    Prazo de resposta: Até 15 (quinze) dias úteis, conforme previsto na legislação.
                  </p>
                </CardContent>
              </Card>

              {/* Cookies */}
              <Card className="border shadow-sm">
                <CardContent className="pt-6 p-4 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Política de Cookies</h2>
                  <div className="space-y-3 md:space-y-4 text-sm md:text-base text-muted-foreground">
                    <p>
                      Utilizamos cookies e tecnologias similares para melhorar sua experiência em nossa
                      plataforma. Você pode gerenciar suas preferências de cookies a qualquer momento.
                    </p>
                    <div>
                      <h3 className="font-semibold mb-2 text-sm md:text-base">Tipos de Cookies que Utilizamos:</h3>
                      <ul className="list-disc list-inside space-y-1.5 md:space-y-2 ml-2 md:ml-4">
                        <li><strong>Essenciais:</strong> Necessários para o funcionamento da plataforma</li>
                        <li><strong>De desempenho:</strong> Coletam informações anônimas sobre o uso</li>
                        <li><strong>De funcionalidade:</strong> Lembram suas preferências</li>
                        <li><strong>De publicidade:</strong> Não utilizamos para fins publicitários</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Segurança de Dados */}
              <Card className="border shadow-sm">
                <CardContent className="pt-6 p-4 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Medidas de Segurança</h2>
                  <div className="space-y-3 md:space-y-4 text-sm md:text-base text-muted-foreground">
                    <p>
                      Adotamos medidas de segurança técnicas, administrativas e organizacionais para
                      proteger seus dados pessoais:
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 md:space-y-2 ml-2 md:ml-4">
                      <li>Criptografia de dados em trânsito e em repouso</li>
                      <li>Controle de acesso rigoroso</li>
                      <li>Monitoramento contínuo de segurança</li>
                      <li>Treinamento regular da equipe</li>
                      <li>Políticas internas de proteção de dados</li>
                      <li>Avaliação periódica de riscos</li>
                      <li>Plano de resposta a incidentes</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Compartilhamento de Dados */}
              <Card className="border shadow-sm">
                <CardContent className="pt-6 p-4 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Compartilhamento de Dados</h2>
                  <div className="space-y-3 md:space-y-4 text-sm md:text-base text-muted-foreground">
                    <p>
                      Seus dados pessoais são <strong>compartilhados apenas quando necessário</strong> e
                      com as seguintes finalidades:
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 md:space-y-2 ml-2 md:ml-4">
                      <li><strong>Provedores de serviço:</strong> Hospedagem, e-mail marketing, pagamentos</li>
                      <li><strong>Obrigações legais:</strong> Quando exigido por lei ou autoridade competente</li>
                      <li><strong>Proteção de direitos:</strong> Para defender nossos direitos em processos judiciais</li>
                    </ul>
                    <p className="font-semibold">
                      Não vendemos, alugamos ou comercializamos seus dados pessoais com terceiros.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Retenção de Dados */}
              <Card className="border shadow-sm">
                <CardContent className="pt-6 p-4 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Retenção de Dados</h2>
                  <div className="space-y-3 md:space-y-4 text-sm md:text-base text-muted-foreground">
                    <p>
                      Mantemos seus dados pessoais apenas pelo tempo necessário para cumprir as finalidades
                      para as quais foram coletados:
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 md:space-y-2 ml-2 md:ml-4">
                      <li><strong>Durante a vigência do contrato:</strong> Enquanto você usar a plataforma</li>
                      <li><strong>Após cancelamento:</strong> Até 5 anos para cumprimento de obrigações legais</li>
                      <li><strong>Dados de navegação:</strong> Até 6 meses, conforme Marco Civil da Internet</li>
                    </ul>
                    <p>
                      Após esses períodos, os dados são eliminados ou anonimizados de forma segura.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Alterações na Política */}
              <Card className="border shadow-sm">
                <CardContent className="pt-6 p-4 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Alterações nesta Política</h2>
                  <div className="space-y-3 md:space-y-4 text-sm md:text-base text-muted-foreground">
                    <p>
                      Esta Política de Privacidade e LGPD pode ser atualizada periodicamente para refletir
                      mudanças em nossas práticas ou na legislação aplicável.
                    </p>
                    <p className="text-xs md:text-sm">
                      Última atualização: 20/05/2026
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Contato */}
              <Card className="bg-primary/10 border-primary">
                <CardContent className="pt-6 p-4 md:p-6">
                  <div className="flex items-start gap-3 mb-3 md:mb-4">
                    <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary mt-0.5 flex-shrink-0" />
                    <h2 className="text-xl md:text-2xl font-bold">Dúvidas sobre LGPD?</h2>
                  </div>
                  <div className="space-y-3 md:space-y-4 text-sm md:text-base text-muted-foreground">
                    <p>
                      Se você tiver dúvidas sobre esta política, sobre o tratamento de seus dados ou quiser
                      exercer seus direitos, entre em contato com nosso Encarregado de Proteção de Dados (DPO):
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <strong>Email:</strong>
                        <a href="mailto:dpo@minhaigreja.app" className="text-primary hover:underline">
                          dpo@minhaigreja.app
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <strong>Telefone:</strong>
                        <span>(11) 99999-9999</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>

    {/* Footer Premium */}
    <HoverFooter />
  </div>
);
}
