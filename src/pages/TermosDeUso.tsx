/**
 * Página: Termos de Uso
 * Termos e condições de uso da plataforma
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { HoverFooter } from '@/components/ui/hover-footer';
import heroBg from '@/assets/img_bkg.png';
import { Church, Menu, X, LogIn, Sparkles, FileText } from 'lucide-react';

export default function TermosDeUso() {
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
            <FileText className="h-14 w-14 md:h-20 md:w-20 text-primary mx-auto mb-4 md:mb-6" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4 md:mb-6">
              Termos de Uso
            </h1>
            <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Última atualização: 22 de Março de 2026
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
                <Card className="border shadow-sm">
                  <CardContent className="pt-6 p-4 md:p-6">
                    <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">1. Aceitação dos Termos</h2>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Ao acessar e usar a plataforma MinhaIgreja, você aceita e concorda
                      com estes Termos de Uso. Se não concordar com algum termo, por favor
                      não utilize nossos serviços.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardContent className="pt-6 p-4 md:p-6">
                    <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">2. Descrição do Serviço</h2>
                    <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                      O MinhaIgreja é uma plataforma SaaS (Software as a Service) que
                      fornece ferramentas para gestão de igrejas, incluindo:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-muted-foreground ml-2 md:ml-4">
                      <li>Criação e gestão de sites para igrejas</li>
                      <li>Pedidos de oração online</li>
                      <li>Gestão de membros e visitantes</li>
                      <li>Agenda e calendário de eventos</li>
                      <li>Dashboard administrativo</li>
                      <li>Relatórios e analytics</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardContent className="pt-6 p-4 md:p-6">
                    <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">3. Cadastro e Conta</h2>
                    <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                      Para usar a plataforma, você deve:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-muted-foreground ml-2 md:ml-4">
                      <li>Ter pelo menos 18 anos de idade</li>
                      <li>Ser representante legal de uma igreja ou ministério</li>
                      <li>Fornecer informações verdadeiras e atualizadas</li>
                      <li>Manter a confidencialidade da sua senha</li>
                      <li>Não compartilhar sua conta com terceiros</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardContent className="pt-6 p-4 md:p-6">
                    <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">4. Planos e Pagamentos</h2>
                    <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                      Oferecemos os seguintes planos:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-muted-foreground ml-2 md:ml-4">
                      <li><strong>Essencial:</strong> R$ 79,90/mês</li>
                    </ul>
                    <p className="text-sm md:text-base text-muted-foreground mt-3 md:mt-4">
                      Os valores podem ser alterados com aviso prévio de 30 dias.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardContent className="pt-6 p-4 md:p-6">
                    <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">5. Cancelamento e Reembolso</h2>
                    <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                      Você pode cancelar sua assinatura a qualquer momento:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-muted-foreground ml-2 md:ml-4">
                      <li>Sem multa ou fidelidade</li>
                      <li>Acesso até o final do período pago</li>
                      <li>Reembolso proporcional apenas para planos anuais</li>
                      <li>Exportação de dados disponível por 30 dias após cancelamento</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardContent className="pt-6 p-4 md:p-6">
                    <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">6. Propriedade Intelectual</h2>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Todo o conteúdo da plataforma, incluindo código, design, logotipos e
                      documentação, é de propriedade do MinhaIgreja e protegido por leis
                      de propriedade intelectual.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardContent className="pt-6 p-4 md:p-6">
                    <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">7. Limitação de Responsabilidade</h2>
                    <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                      O MinhaIgreja não se responsabiliza por:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-muted-foreground ml-2 md:ml-4">
                      <li>Conteúdo publicado pelos usuários</li>
                      <li>Uso indevido da plataforma</li>
                      <li>Perda de dados por falhas do usuário</li>
                      <li>Indisponibilidade temporária do serviço</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardContent className="pt-6 p-4 md:p-6">
                    <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">8. Modificações nos Termos</h2>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Reservamo-nos o direito de modificar estes termos a qualquer momento.
                      Alterações significativas serão comunicadas com 30 dias de antecedência.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm">
                  <CardContent className="pt-6 p-4 md:p-6">
                    <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">9. Contato</h2>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Dúvidas sobre estes termos? Entre em contato:
                    </p>
                    <p className="text-sm md:text-base text-muted-foreground mt-2 md:mt-3">
                      Email: juridico@minhaigreja.app<br />
                      Telefone: (11) 99999-9999
                    </p>
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
