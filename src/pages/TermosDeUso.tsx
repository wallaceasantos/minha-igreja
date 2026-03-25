/**
 * Página: Termos de Uso
 * Termos e condições de uso da plataforma
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Church, Menu, X, LogIn } from 'lucide-react';

export default function TermosDeUso() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Fixo */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <Church className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">Igreja Connect</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 ml-auto">
            <a href="/#funcionalidades" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Funcionalidades
            </a>
            <a href="/#planos" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Planos
            </a>
            <a href="/#depoimentos" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Depoimentos
            </a>
            <Button variant="ghost" asChild>
              <Link to="/login">
                <LogIn className="h-4 w-4 mr-2" />
                Entrar
              </Link>
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

      {/* Conteúdo Principal */}
      <main className="flex-1">
        <section className="py-20 bg-background">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-primary mb-8 text-center">
                Termos de Uso
              </h1>
              <p className="text-muted-foreground text-center mb-12">
                Última atualização: 22 de Março de 2026
              </p>

              <div className="space-y-8">
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold mb-4">1. Aceitação dos Termos</h2>
                    <p className="text-muted-foreground">
                      Ao acessar e usar a plataforma Igreja Connect, você aceita e concorda
                      com estes Termos de Uso. Se não concordar com algum termo, por favor
                      não utilize nossos serviços.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold mb-4">2. Descrição do Serviço</h2>
                    <p className="text-muted-foreground mb-4">
                      O Igreja Connect é uma plataforma SaaS (Software as a Service) que
                      fornece ferramentas para gestão de igrejas, incluindo:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Criação e gestão de sites para igrejas</li>
                      <li>Pedidos de oração online</li>
                      <li>Gestão de membros e visitantes</li>
                      <li>Agenda e calendário de eventos</li>
                      <li>Dashboard administrativo</li>
                      <li>Relatórios e analytics</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold mb-4">3. Cadastro e Conta</h2>
                    <p className="text-muted-foreground mb-4">
                      Para usar a plataforma, você deve:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Ter pelo menos 18 anos de idade</li>
                      <li>Ser representante legal de uma igreja ou ministério</li>
                      <li>Fornecer informações verdadeiras e atualizadas</li>
                      <li>Manter a confidencialidade da sua senha</li>
                      <li>Não compartilhar sua conta com terceiros</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold mb-4">4. Planos e Pagamentos</h2>
                    <p className="text-muted-foreground mb-4">
                      Oferecemos os seguintes planos:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li><strong>Free:</strong> Gratuito, com recursos limitados</li>
                      <li><strong>Essencial:</strong> R$ 29,90/mês</li>
                      <li><strong>Premium:</strong> R$ 79,90/mês</li>
                      <li><strong>Enterprise:</strong> R$ 199,90/mês</li>
                    </ul>
                    <p className="text-muted-foreground mt-4">
                      Os valores podem ser alterados com aviso prévio de 30 dias.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold mb-4">5. Cancelamento e Reembolso</h2>
                    <p className="text-muted-foreground mb-4">
                      Você pode cancelar sua assinatura a qualquer momento:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Sem multa ou fidelidade</li>
                      <li>Acesso até o final do período pago</li>
                      <li>Reembolso proporcional apenas para planos anuais</li>
                      <li>Exportação de dados disponível por 30 dias após cancelamento</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold mb-4">6. Propriedade Intelectual</h2>
                    <p className="text-muted-foreground">
                      Todo o conteúdo da plataforma, incluindo código, design, logotipos e
                      documentação, é de propriedade do Igreja Connect e protegido por leis
                      de propriedade intelectual.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold mb-4">7. Limitação de Responsabilidade</h2>
                    <p className="text-muted-foreground">
                      O Igreja Connect não se responsabiliza por:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                      <li>Conteúdo publicado pelos usuários</li>
                      <li>Uso indevido da plataforma</li>
                      <li>Perda de dados por falhas do usuário</li>
                      <li>Indisponibilidade temporária do serviço</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold mb-4">8. Modificações nos Termos</h2>
                    <p className="text-muted-foreground">
                      Reservamo-nos o direito de modificar estes termos a qualquer momento.
                      Alterações significativas serão comunicadas com 30 dias de antecedência.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold mb-4">9. Contato</h2>
                    <p className="text-muted-foreground">
                      Dúvidas sobre estes termos? Entre em contato:
                    </p>
                    <p className="text-muted-foreground mt-2">
                      Email: juridico@igrejaconnect.com.br<br />
                      Telefone: (11) 99999-9999
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-divine-shadow text-white dark:bg-card dark:border-t dark:border-border py-12">
        <div className="container px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Church className="h-6 w-6" />
                <span className="text-xl font-bold">Igreja Connect</span>
              </div>
              <p className="text-sm text-gray-300 dark:text-muted-foreground">
                Plataforma digital para igrejas que desejam se conectar com membros e visitantes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-gray-300 dark:text-muted-foreground">
                <li><a href="/#funcionalidades" className="hover:text-white dark:hover:text-primary">Funcionalidades</a></li>
                <li><a href="/#planos" className="hover:text-white dark:hover:text-primary">Planos</a></li>
                <li><a href="/criar" className="hover:text-white dark:hover:text-primary">Começar Grátis</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-gray-300 dark:text-muted-foreground">
                <li><a href="/sobre-nos" className="hover:text-white dark:hover:text-primary">Sobre Nós</a></li>
                <li><a href="/contato-institucional" className="hover:text-white dark:hover:text-primary">Contato</a></li>
                <li><a href="/blog" className="hover:text-white dark:hover:text-primary">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-300 dark:text-muted-foreground">
                <li><a href="/termos-de-uso" className="hover:text-white dark:hover:text-primary">Termos de Uso</a></li>
                <li><a href="/politica-privacidade" className="hover:text-white dark:hover:text-primary">Privacidade</a></li>
                <li><a href="/lgpd" className="hover:text-white dark:hover:text-primary">LGPD</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-600 dark:border-border mt-8 pt-6 text-center text-sm text-gray-400 dark:text-muted-foreground">
            <p>Copyright © {new Date().getFullYear()} Igreja Connect. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
