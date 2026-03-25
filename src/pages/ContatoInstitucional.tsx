/**
 * Página: Contato Institucional - Igreja Connect (Plataforma SaaS)
 * Formulário de contato e informações sobre a plataforma
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ModeToggle } from '@/components/mode-toggle';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Headphones, Users, Church, Menu, X, LogIn } from 'lucide-react';

export default function ContatoInstitucional() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    church: '',
    churchSize: '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    // TODO: Implementar envio real para API
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Mensagem enviada com sucesso!', {
      description: 'Nossa equipe entrará em contato em até 24 horas úteis.',
    });

    setFormData({
      name: '',
      email: '',
      phone: '',
      church: '',
      churchSize: '',
      subject: '',
      message: '',
    });
    setSending(false);
  };

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
            <MessageCircle className="h-20 w-20 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
              Entre em Contato
            </h1>
            <p className="text-xl text-muted-foreground">
              Tire suas dúvidas sobre a plataforma Igreja Connect
            </p>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="py-20 bg-background">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Formulário */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Envie uma Mensagem</CardTitle>
                    <CardDescription>
                      Preencha o formulário abaixo e nossa equipe comercial entrará em contato em até 24 horas úteis
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Seu nome"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="seu@email.com"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="(00) 00000-0000"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="churchSize">Tamanho da Igreja</Label>
                          <select
                            id="churchSize"
                            value={formData.churchSize}
                            onChange={(e) => setFormData({ ...formData, churchSize: e.target.value })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="">Selecione</option>
                            <option value="ate-50">Até 50 membros</option>
                            <option value="50-200">50-200 membros</option>
                            <option value="200-500">200-500 membros</option>
                            <option value="500-1000">500-1000 membros</option>
                            <option value="mais-1000">Mais de 1000 membros</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="church">Nome da Igreja</Label>
                        <Input
                          id="church"
                          value={formData.church}
                          onChange={(e) => setFormData({ ...formData, church: e.target.value })}
                          placeholder="Nome da sua igreja"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Assunto *</Label>
                        <select
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          required
                        >
                          <option value="">Selecione um assunto</option>
                          <option value="comercial">Dúvidas Comerciais</option>
                          <option value="tecnico">Suporte Técnico</option>
                          <option value="parceria">Parcerias</option>
                          <option value="imprensa">Imprensa</option>
                          <option value="outro">Outro</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Mensagem *</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Como podemos ajudar você e sua igreja?"
                          rows={5}
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={sending}>
                        {sending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Enviar Mensagem
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </form>
                </Card>
              </div>

              {/* Informações de Contato */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-6">
                    Informações de Contato
                  </h2>
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <Mail className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-semibold">Email Comercial</p>
                            <a href="mailto:comercial@igrejaconnect.com.br" className="text-muted-foreground hover:text-primary">
                              comercial@igrejaconnect.com.br
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <Headphones className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-semibold">Suporte Técnico</p>
                            <a href="mailto:suporte@igrejaconnect.com.br" className="text-muted-foreground hover:text-primary">
                              suporte@igrejaconnect.com.br
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <Phone className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-semibold">Telefone / WhatsApp</p>
                            <a href="tel:+5511999999999" className="text-muted-foreground hover:text-primary">
                              (11) 99999-9999
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-semibold">Endereço Comercial</p>
                            <p className="text-muted-foreground">
                              Avenida Paulista, 1000 - Bela Vista<br />
                              São Paulo - SP, 01310-100
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-semibold">Horário de Atendimento</p>
                            <p className="text-muted-foreground">
                              Comercial: Seg-Sex, 09:00 - 18:00<br />
                              Suporte: Seg-Sex, 09:00 - 18:00
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* FAQ Rápido */}
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle>Perguntas Frequentes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="font-semibold">Quanto tempo leva para criar minha igreja?</p>
                      <p className="text-muted-foreground">Menos de 5 minutos! É só preencher o formulário.</p>
                    </div>
                    <div>
                      <p className="font-semibold">Tem plano grátis?</p>
                      <p className="text-muted-foreground">Sim! Plano Free para sempre, sem cartão de crédito.</p>
                    </div>
                    <div>
                      <p className="font-semibold">Posso cancelar quando quiser?</p>
                      <p className="text-muted-foreground">Sim! Sem multa ou fidelidade.</p>
                    </div>
                    <div>
                      <p className="font-semibold">Como funciona o período de teste?</p>
                      <p className="text-muted-foreground">30 dias grátis em qualquer plano. Sem compromisso.</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Redes Sociais */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Siga-nos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <a href="#" className="text-muted-foreground hover:text-primary">
                        LinkedIn
                      </a>
                      <a href="#" className="text-muted-foreground hover:text-primary">
                        Instagram
                      </a>
                      <a href="#" className="text-muted-foreground hover:text-primary">
                        Facebook
                      </a>
                      <a href="#" className="text-muted-foreground hover:text-primary">
                        YouTube
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mapa */}
      <section className="py-20 bg-muted/50">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-primary mb-8 text-center">
              Nossa Localização
            </h2>
            <Card>
              <CardContent className="pt-6">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold">Mapa de Localização</p>
                    <p className="text-sm">Integração com Google Maps em breve</p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
