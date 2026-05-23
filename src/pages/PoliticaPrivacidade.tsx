/**
 * Página: Política de Privacidade
 * Informações sobre privacidade e proteção de dados da plataforma
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { HoverFooter } from '@/components/ui/hover-footer';
import heroBg from '@/assets/img_bkg.png';
import { Shield, Eye, Lock, User, Mail, Database, Church, Menu, X, LogIn, Sparkles } from 'lucide-react';

export default function PoliticaPrivacidade() {
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
            <Button asChild className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-600/20">
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
              <Button asChild className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
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
              Política de Privacidade
            </h1>
            <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Igreja MinhaIgreja
            </p>
            <p className="text-xs md:text-sm text-muted-foreground mt-2">
              Última atualização: 20/05/2026
            </p>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <main className="flex-1">
        <section className="py-12 md:py-20 bg-background">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              {/* Conteúdo */}
              <div className="space-y-6 md:space-y-8">
                <Card className="border shadow-sm">
                  <CardContent className="pt-6 p-4 md:p-6">
                    <div className="flex items-start gap-3 mb-3 md:mb-4">
                      <Eye className="h-5 w-5 md:h-6 md:w-6 text-primary mt-0.5 flex-shrink-0" />
                      <h2 className="text-xl md:text-2xl font-bold">1. Coleta de Informações</h2>
                    </div>
                    <div className="space-y-3 md:space-y-4 text-sm md:text-base text-muted-foreground">
                      <p>
                        Coletamos informações que você nos fornece diretamente, como:
                      </p>
                      <ul className="list-disc list-inside space-y-1.5 md:space-y-2 ml-2 md:ml-4">
                        <li>Nome completo</li>
                        <li>Endereço de e-mail</li>
                        <li>Número de telefone</li>
                        <li>CPF (apenas quando necessário para emissão de notas fiscais)</li>
                        <li>Endereço completo</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardContent className="pt-6 p-4 md:p-6">
                    <div className="flex items-start gap-3 mb-3 md:mb-4">
                      <Database className="h-5 w-5 md:h-6 md:w-6 text-primary mt-0.5 flex-shrink-0" />
                      <h2 className="text-xl md:text-2xl font-bold">2. Dados de Navegação</h2>
                    </div>
                    <div className="space-y-3 md:space-y-4 text-sm md:text-base text-muted-foreground">
                      <p>
                        Coletamos automaticamente informações sobre sua navegação:
                      </p>
                      <ul className="list-disc list-inside space-y-1.5 md:space-y-2 ml-2 md:ml-4">
                        <li>Endereço IP</li>
                        <li>Tipo de navegador e dispositivo</li>
                        <li>Páginas acessadas e tempo de permanência</li>
                        <li>Cookies e tecnologias similares</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardContent className="pt-6 p-4 md:p-6">
                    <div className="flex items-start gap-3 mb-3 md:mb-4">
                      <User className="h-5 w-5 md:h-6 md:w-6 text-primary mt-0.5 flex-shrink-0" />
                      <h2 className="text-xl md:text-2xl font-bold">3. Finalidade do Tratamento</h2>
                    </div>
                    <div className="space-y-3 md:space-y-4 text-sm md:text-base text-muted-foreground">
                      <p>
                        Utilizamos seus dados para:
                      </p>
                      <ul className="list-disc list-inside space-y-1.5 md:space-y-2 ml-2 md:ml-4">
                        <li>Prestação dos serviços contratados</li>
                        <li>Comunicação com o usuário (e-mails, notificações, suporte)</li>
                        <li>Faturamento e emissão de notas fiscais</li>
                        <li>Melhoria contínua da plataforma</li>
                        <li>Cumprimento de obrigações legais e regulatórias</li>
                        <li>Prevenção a fraudes e segurança</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardContent className="pt-6 p-4 md:p-6">
                    <div className="flex items-start gap-3 mb-3 md:mb-4">
                      <Lock className="h-5 w-5 md:h-6 md:w-6 text-primary mt-0.5 flex-shrink-0" />
                      <h2 className="text-xl md:text-2xl font-bold">4. Segurança de Dados</h2>
                    </div>
                    <div className="space-y-3 md:space-y-4 text-sm md:text-base text-muted-foreground">
                      <p>
                        Adotamos medidas de segurança técnicas, administrativas e organizacionais para proteger seus dados pessoais:
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

                <Card className="border shadow-sm">
                  <CardContent className="pt-6 p-4 md:p-6">
                    <div className="flex items-start gap-3 mb-3 md:mb-4">
                      <Mail className="h-5 w-5 md:h-6 md:w-6 text-primary mt-0.5 flex-shrink-0" />
                      <h2 className="text-xl md:text-2xl font-bold">5. Compartilhamento de Dados</h2>
                    </div>
                    <div className="space-y-3 md:space-y-4 text-sm md:text-base text-muted-foreground">
                      <p>
                        Seus dados pessoais são compartilhados apenas quando necessário e com as seguintes finalidades:
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

                <Card className="border shadow-sm">
                  <CardContent className="pt-6 p-4 md:p-6">
                    <div className="flex items-start gap-3 mb-3 md:mb-4">
                      <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary mt-0.5 flex-shrink-0" />
                      <h2 className="text-xl md:text-2xl font-bold">6. Seus Direitos (Titular dos Dados)</h2>
                    </div>
                    <div className="space-y-3 md:space-y-4 text-sm md:text-base text-muted-foreground">
                      <p>
                        De acordo com a LGPD, você tem os seguintes direitos:
                      </p>
                      <ul className="list-disc list-inside space-y-1.5 md:space-y-2 ml-2 md:ml-4">
                        <li><strong>Confirmação:</strong> Confirmar a existência de tratamento de dados</li>
                        <li><strong>Acesso:</strong> Acessar seus dados pessoais</li>
                        <li><strong>Correção:</strong> Corrigir dados incompletos, inexatos ou desatualizados</li>
                        <li><strong>Anonimização:</strong> Anonimizar, bloquear ou eliminar dados desnecessários</li>
                        <li><strong>Portabilidade:</strong> Solicitar a portabilidade dos dados</li>
                        <li><strong>Eliminação:</strong> Eliminar dados tratados com consentimento</li>
                        <li><strong>Informação:</strong> Informação sobre entidades com quem compartilhamos dados</li>
                        <li><strong>Revogação:</strong> Revogar o consentimento a qualquer momento</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardContent className="pt-6 p-4 md:p-6">
                    <div className="flex items-start gap-3 mb-3 md:mb-4">
                      <User className="h-5 w-5 md:h-6 md:w-6 text-primary mt-0.5 flex-shrink-0" />
                      <h2 className="text-xl md:text-2xl font-bold">7. Como Exercer Seus Direitos</h2>
                    </div>
                    <div className="space-y-3 md:space-y-4 text-sm md:text-base text-muted-foreground">
                      <p>
                        Para exercer seus direitos previstos na LGPD, entre em contato com nosso Encarregado de Proteção de Dados (DPO):
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
                      <p className="text-xs md:text-sm">
                        Prazo de resposta: Até 15 (quinze) dias úteis, conforme previsto na legislação.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardContent className="pt-6 p-4 md:p-6">
                    <div className="flex items-start gap-3 mb-3 md:mb-4">
                      <Eye className="h-5 w-5 md:h-6 md:w-6 text-primary mt-0.5 flex-shrink-0" />
                      <h2 className="text-xl md:text-2xl font-bold">8. Política de Cookies</h2>
                    </div>
                    <div className="space-y-3 md:space-y-4 text-sm md:text-base text-muted-foreground">
                      <p>
                        Utilizamos cookies e tecnologias similares para melhorar sua experiência em nossa plataforma. Você pode gerenciar suas preferências de cookies a qualquer momento.
                      </p>
                      <div>
                        <h3 className="font-semibold mb-2 text-sm md:text-base">Tipos de Cookies que Utilizamos:</h3>
                        <ul className="list-disc list-inside space-y-1.5 md:space-y-2 ml-2 md:ml-4 text-sm md:text-base">
                          <li><strong>Essenciais:</strong> Necessários para o funcionamento da plataforma</li>
                          <li><strong>De desempenho:</strong> Coletam informações anônimas sobre o uso</li>
                          <li><strong>De funcionalidade:</strong> Lembram suas preferências</li>
                          <li><strong>De publicidade:</strong> Não utilizamos para fins publicitários</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardContent className="pt-6 p-4 md:p-6">
                    <div className="flex items-start gap-3 mb-3 md:mb-4">
                      <Database className="h-5 w-5 md:h-6 md:w-6 text-primary mt-0.5 flex-shrink-0" />
                      <h2 className="text-xl md:text-2xl font-bold">9. Retenção de Dados</h2>
                    </div>
                    <div className="space-y-3 md:space-y-4 text-sm md:text-base text-muted-foreground">
                      <p>
                        Mantemos seus dados pessoais apenas pelo tempo necessário para cumprir as finalidades para as quais foram coletados:
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

                <Card className="border shadow-sm">
                  <CardContent className="pt-6 p-4 md:p-6">
                    <div className="flex items-start gap-3 mb-3 md:mb-4">
                      <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary mt-0.5 flex-shrink-0" />
                      <h2 className="text-xl md:text-2xl font-bold">10. Alterações nesta Política</h2>
                    </div>
                    <div className="space-y-3 md:space-y-4 text-sm md:text-base text-muted-foreground">
                      <p>
                        Esta Política de Privacidade pode ser atualizada periodicamente para refletir mudanças em nossas práticas ou na legislação aplicável.
                      </p>
                      <p>
                        Alterações significativas serão comunicadas com antecedência através de e-mail ou notificação em nossa plataforma.
                      </p>
                      <p className="text-xs md:text-sm">
                        Última atualização: 20/05/2026
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardContent className="pt-6 p-4 md:p-6">
                    <div className="flex items-start gap-3 mb-3 md:mb-4">
                      <Mail className="h-5 w-5 md:h-6 md:w-6 text-primary mt-0.5 flex-shrink-0" />
                      <h2 className="text-xl md:text-2xl font-bold">11. Contato</h2>
                    </div>
                    <div className="space-y-3 md:space-y-4 text-sm md:text-base text-muted-foreground">
                      <p>
                        Se você tiver dúvidas sobre esta política, sobre o tratamento de seus dados ou quiser exercer seus direitos, entre em contato com nosso Encarregado de Proteção de Dados (DPO):
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
