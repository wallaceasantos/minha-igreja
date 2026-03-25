/**
 * Página: Sobre Nós - Igreja Connect (Plataforma SaaS)
 * Informações sobre a plataforma Igreja Connect
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Church, Users, Heart, Globe, Shield, Zap, TrendingUp, Award, Menu, X, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SobreNos() {
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

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <Church className="h-20 w-20 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
              Sobre o Igreja Connect
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              A plataforma que está transformando a gestão de igrejas em todo o Brasil
            </p>
          </div>
        </div>
      </section>

      {/* Nossa História */}
      <section className="py-20 bg-background">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-primary mb-6 text-center">
              Nossa História
            </h2>
            <div className="prose prose-lg mx-auto text-muted-foreground">
              <p className="mb-4">
                O <strong>Igreja Connect</strong> nasceu em 2024 da necessidade de democratizar 
                o acesso à tecnologia para igrejas de todos os tamanhos no Brasil.
              </p>
              <p className="mb-4">
                Percebemos que muitas igrejas, especialmente as menores, não tinham acesso 
                a ferramentas modernas de gestão porque os sistemas disponíveis eram caros, 
                complexos ou exigiam conhecimento técnico avançado.
              </p>
              <p className="mb-4">
                Foi assim que criamos uma plataforma SaaS (Software as a Service) multi-tenant, 
                onde qualquer igreja pode ter um site profissional e ferramentas de gestão 
                completas, pagando apenas uma assinatura mensal acessível.
              </p>
              <p>
                Hoje, atendemos centenas de igrejas em todo o território nacional, desde 
                pequenas comunidades até grandes ministérios, todas usando a mesma plataforma 
                mas com experiências completamente personalizadas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Missão, Visão e Valores */}
      <section className="py-20 bg-muted/50">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-primary mb-12 text-center">
              Missão, Visão e Valores
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <CardContent className="pt-6 text-center">
                  <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Missão</h3>
                  <p className="text-muted-foreground">
                    Democratizar o acesso à tecnologia para igrejas brasileiras, 
                    permitindo que focem no que realmente importa: o ministério e 
                    o cuidado com as pessoas.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <CardContent className="pt-6 text-center">
                  <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Visão</h3>
                  <p className="text-muted-foreground">
                    Ser a principal plataforma de gestão para igrejas no Brasil, 
                    reconhecida pela qualidade, inovação e compromisso com o 
                    crescimento do Reino de Deus.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <CardContent className="pt-6 text-center">
                  <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Valores</h3>
                  <ul className="text-muted-foreground space-y-2">
                    <li>• Fé e integridade</li>
                    <li>• Inovação com propósito</li>
                    <li>• Atendimento humanizado</li>
                    <li>• Transparência total</li>
                    <li>• Compromisso com o cliente</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Números da Plataforma */}
      <section className="py-20 bg-background">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-primary mb-12 text-center">
              Números que Nos Orgulham
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-5xl font-bold text-primary mb-2">500+</div>
                <p className="text-muted-foreground">Igrejas Ativas</p>
              </div>

              <div className="text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-5xl font-bold text-primary mb-2">50K+</div>
                <p className="text-muted-foreground">Membros Cadastrados</p>
              </div>

              <div className="text-center">
                <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-5xl font-bold text-primary mb-2">100K+</div>
                <p className="text-muted-foreground">Pedidos de Oração</p>
              </div>

              <div className="text-center">
                <Award className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-5xl font-bold text-primary mb-2">99.9%</div>
                <p className="text-muted-foreground">Uptime Garantido</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona a Plataforma */}
      <section className="py-20 bg-muted/50">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-primary mb-12 text-center">
              Como Funciona a Plataforma
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <CardHeader className="text-center">
                  <Zap className="h-12 w-12 text-primary mx-auto mb-2" />
                  <CardTitle>1. Cadastro Rápido</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">
                    Em menos de 5 minutos sua igreja tem um site profissional no ar. 
                    Basta preencher um formulário e escolher um subdomínio.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <CardHeader className="text-center">
                  <Church className="h-12 w-12 text-primary mx-auto mb-2" />
                  <CardTitle>2. Personalização</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">
                    Cada igreja tem seu próprio espaço com logo, cores e 
                    conteúdo personalizados. Totalmente independente das demais.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <CardHeader className="text-center">
                  <Users className="h-12 w-12 text-primary mx-auto mb-2" />
                  <CardTitle>3. Gestão Completa</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">
                    Dashboard administrativo para gerenciar membros, pedidos 
                    de oração, eventos e muito mais, tudo em um só lugar.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais da Plataforma */}
      <section className="py-20 bg-background">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-primary mb-12 text-center">
              Por Que Escolher o Igreja Connect?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Shield className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-2">Segurança e Privacidade</h3>
                      <p className="text-muted-foreground">
                        Dados isolados por igreja, criptografia de ponta a ponta e 
                        conformidade total com a LGPD.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Zap className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-2">Sem Conhecimento Técnico</h3>
                      <p className="text-muted-foreground">
                        Interface intuitiva e fácil de usar. Você não precisa ser 
                        programador para gerenciar seu site.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-2">Escalabilidade</h3>
                      <p className="text-muted-foreground">
                        Comece grátis e cresça conforme sua igreja cresce. 
                        Planos flexíveis sem fidelidade.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Heart className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-2">Suporte Humanizado</h3>
                      <p className="text-muted-foreground">
                        Equipe de suporte pronta para ajudar você e sua igreja 
                        sempre que precisar.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Globe className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-2">Multi-Dispositivo</h3>
                      <p className="text-muted-foreground">
                        Site responsivo que funciona perfeitamente em computadores, 
                        tablets e celulares.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Award className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-2">Atualizações Constantes</h3>
                      <p className="text-muted-foreground">
                        Novas funcionalidades são adicionadas regularmente, 
                        sem custo adicional.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Equipe */}
      <section className="py-20 bg-muted/50">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-primary mb-6">
              Nossa Equipe
            </h2>
            <p className="text-lg text-muted-foreground mb-12">
              Somos um time apaixonado por tecnologia e fé, dedicado a servir as igrejas brasileiras
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <CardContent className="pt-6 text-center">
                  <div className="h-24 w-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Desenvolvimento</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Engenheiros dedicados a criar as melhores experiências
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <CardContent className="pt-6 text-center">
                  <div className="h-24 w-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Heart className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Suporte</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Pessoas reais prontas para ajudar você
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <CardContent className="pt-6 text-center">
                  <div className="h-24 w-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Globe className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Expansão</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Conectando igrejas em todo o Brasil
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground dark:bg-primary/90">
        <div className="container px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Quer Fazer Parte Dessa Transformação?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Junte-se a centenas de igrejas que já estão usando o Igreja Connect
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/criar"
              className="inline-flex items-center px-6 py-3 bg-secondary text-secondary-foreground rounded-md font-semibold hover:bg-secondary/90 transition-colors"
            >
              Começar Grátis Agora
            </a>
            <a
              href="/contato-institucional"
              className="inline-flex items-center px-6 py-3 bg-transparent border-2 border-primary-foreground rounded-md font-semibold hover:bg-primary-foreground/10 transition-colors"
            >
              Fale Conosco
            </a>
          </div>
        </div>
      </section>

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
