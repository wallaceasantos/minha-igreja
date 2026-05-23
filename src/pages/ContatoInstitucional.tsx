/**
 * Página: Contato Institucional - MinhaIgreja (Plataforma SaaS)
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
import { HoverFooter } from '@/components/ui/hover-footer';
import heroBg from '@/assets/img_bkg.png';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Headphones, Users, Church, Menu, X, LogIn, Sparkles } from 'lucide-react';

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
            <MessageCircle className="h-14 w-14 md:h-20 md:w-20 text-primary mx-auto mb-4 md:mb-6" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4 md:mb-6">
              Entre em Contato
            </h1>
            <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Tire suas dúvidas sobre a plataforma MinhaIgreja
            </p>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
              {/* Formulário */}
              <div>
                <Card className="border-2 shadow-xl">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-xl md:text-2xl">Envie uma Mensagem</CardTitle>
                    <CardDescription className="text-sm">
                      Preencha o formulário abaixo e nossa equipe comercial entrará em contato em até 24 horas úteis
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4 p-4 md:p-6">
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-w-0"
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

                      <Button type="submit" className="w-full h-11 md:h-12 text-base md:text-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-600/20" disabled={sending}>
                        {sending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 md:h-5 md:w-5 mr-2" />
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
                  <h2 className="text-xl md:text-2xl font-bold text-primary mb-4 md:mb-6">
                    Informações de Contato
                  </h2>
                  <div className="space-y-4">
                    <Card>
                      <CardContent className="pt-4 md:pt-6">
                        <div className="flex items-start gap-3">
                          <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-sm md:text-base">Email Comercial</p>
                            <a href="mailto:comercial@minhaigreja.app" className="text-muted-foreground hover:text-primary text-sm md:text-base">
                              comercial@minhaigreja.app
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4 md:pt-6">
                        <div className="flex items-start gap-3">
                          <Headphones className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-sm md:text-base">Suporte Técnico</p>
                            <a href="mailto:suporte@minhaigreja.app" className="text-muted-foreground hover:text-primary text-sm md:text-base">
                              suporte@minhaigreja.app
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4 md:pt-6">
                        <div className="flex items-start gap-3">
                          <Phone className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-sm md:text-base">Telefone / WhatsApp</p>
                            <a href="tel:+5511999999999" className="text-muted-foreground hover:text-primary text-sm md:text-base">
                              (92) 98421-3885
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4 md:pt-6">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-sm md:text-base">Endereço Comercial</p>
                            <p className="text-muted-foreground text-sm md:text-base">
                              Avenida Urucará, 1275 - Cachoeirinha<br />
                              Manaus - AM, 69065-180
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4 md:pt-6">
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-sm md:text-base">Horário de Atendimento</p>
                            <p className="text-muted-foreground text-sm md:text-base">
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
                  <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                    <CardTitle className="text-lg md:text-xl">Perguntas Frequentes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4 md:p-6 pt-2 md:pt-4 text-sm md:text-base">
                    <div>
                      <p className="font-semibold">Quanto tempo leva para criar minha igreja?</p>
                      <p className="text-muted-foreground">Menos de 5 minutos! É só preencher o formulário.</p>
                    </div>
                    <div>
                      <p className="font-semibold">Tem plano grátis?</p>
                      <p className="text-muted-foreground">Sim! Plano Essencial para sempre, sem cartão de crédito.</p>
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
                  <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                      <Users className="h-5 w-5" />
                      Siga-nos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-2 md:pt-4">
                    <div className="flex flex-wrap gap-3 md:gap-4">
                      <a href="#" className="text-muted-foreground hover:text-primary text-sm md:text-base">
                        LinkedIn
                      </a>
                      <a href="#" className="text-muted-foreground hover:text-primary text-sm md:text-base">
                        Instagram
                      </a>
                      <a href="#" className="text-muted-foreground hover:text-primary text-sm md:text-base">
                        Facebook
                      </a>
                      <a href="#" className="text-muted-foreground hover:text-primary text-sm md:text-base">
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
      <section className="py-12 md:py-20 bg-muted/50">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6 md:mb-8 text-center">
              Nossa Localização
            </h2>
            <Card className="border-2 shadow-xl">
              <CardContent className="pt-4 md:pt-6 p-4 md:p-6">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-3 md:mb-4 opacity-50" />
                    <p className="text-base md:text-lg font-semibold">Mapa de Localização</p>
                    <p className="text-xs md:text-sm">Integração com Google Maps em breve</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer Premium */}
      <HoverFooter />
    </div>
  );
}
