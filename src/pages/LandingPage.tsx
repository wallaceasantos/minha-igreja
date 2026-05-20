/**
 * Landing Page Institucional - MinhaIgreja
 * ============================================
 * Página inicial da plataforma (domínio principal)
 * URL: https://minhaigreja.app
 */

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModeToggle } from '@/components/mode-toggle';
import { buildApiUrl } from '@/lib/config';
import { AnimatedTestimonials } from '@/components/ui/animated-testimonials';
import BorderGlow from '@/components/ui/BorderGlow';
import { HoverFooter } from '@/components/ui/hover-footer';
import heroBg from '@/assets/img_bkg.png';
import {
  Church,
  Check,
  CheckCircle2,
  Globe,
  Users,
  HeartHandshake,
  Calendar,
  BarChart3,
  Smartphone,
  Shield,
  Zap,
  ArrowRight,
  Play,
  Star,
  Info,
  Menu,
  X,
  Share2,
  MapPin,
  MessageCircle,
  Lock,
  Cloud,
  Headphones,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Rocket,
  MousePointerClick
} from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: 'Site Profissional',
    description: 'Design moderno e responsivo. Sua igreja sempre visível para membros e visitantes.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: HeartHandshake,
    title: 'Pedidos de Oração',
    description: 'Receba e gerencie pedidos de oração online. Pastoreio mais próximo e eficiente.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Users,
    title: 'Gestão de Membros',
    description: 'Cadastre membros, controle frequência e acompanhe o crescimento da igreja.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Calendar,
    title: 'Agenda de Cultos',
    description: 'Organize cultos e eventos. Mantenha todos informados sobre as atividades.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: BarChart3,
    title: 'Relatórios Inteligentes',
    description: 'Acompanhe métricas importantes. Tome decisões baseadas em dados.',
    color: 'from-emerald-500 to-green-500',
  },
  {
    icon: Smartphone,
    title: 'App Mobile',
    description: 'Disponível para Android. Sua igreja no bolso dos membros.',
    color: 'from-sky-500 to-blue-500',
  },
];

const plans = [
  {
    name: 'Essencial',
    price: 'R\$ 79,90',
    period: '/mês',
    annualPrice: 'R\$ 1.798,80',
    description: 'Para igrejas em crescimento',
    features: [
      'Todos os recursos +',
      'Até 200 membros',
      'Pedidos de oração ILIMITADOS',
      '3 administradores',
      'Domínio próprio',
      'Upload de logo',
      'Google Maps',
      'Redes sociais',
      'Analytics básico',
      'Suporte por email',
    ],
    detailedFeatures: [
      { icon: Globe, text: 'TUDO do plano Essencial', included: true },
      { icon: Users, text: 'Até 200 membros', included: true },
      { icon: HeartHandshake, text: 'Pedidos ILIMITADOS', included: true },
      { icon: Users, text: '3 administradores', included: true },
      { icon: Shield, text: 'Domínio próprio', included: true },
      { icon: Smartphone, text: 'Upload de logo', included: true },
      { icon: MapPin, text: 'Google Maps', included: true },
      { icon: Church, text: 'Redes sociais', included: true },
      { icon: BarChart3, text: 'Analytics', included: true },
    ],
    cta: 'Testar Grátis (60 dias)',
    popular: true,
    bestFor: 'Igrejas em crescimento',
    storage: '5 GB',
    support: 'Email (24h)',
    planValue: 'essencial',
  },
];

export default function LandingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPlanForDetails, setSelectedPlanForDetails] = useState<typeof plans[0] | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll Reveal State - Pricing
  const pricingRef = useRef<HTMLElement | null>(null);
  const [isPricingInView, setIsPricingInView] = useState(false);

  // Scroll Reveal State - Hero
  const statsRef = useRef<HTMLElement | null>(null);
  const [isHeroInView, setIsHeroInView] = useState(true); // Hero já começa visível (está no topo)
  const [isStatsInView, setIsStatsInView] = useState(false);

  // Scroll Reveal State - Features
  const featuresRef = useRef<HTMLElement | null>(null);
  const [isFeaturesInView, setIsFeaturesInView] = useState(false);

  // Scroll Reveal State - Steps
  const stepsRef = useRef<HTMLElement | null>(null);
  const [isStepsInView, setIsStepsInView] = useState(false);

  // Scroll Reveal State - CTA Final
  const ctaRef = useRef<HTMLElement | null>(null);
  const [isCtaInView, setIsCtaInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setIsPricingInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    if (pricingRef.current) {
      observer.observe(pricingRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Stats Section Observer
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setIsStatsInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Features Section Observer
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setIsFeaturesInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Steps Section Observer
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setIsStepsInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    if (stepsRef.current) {
      observer.observe(stepsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Final CTA Section Observer
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setIsCtaInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });

    if (ctaRef.current) {
      observer.observe(ctaRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Church className="h-7 w-7 text-primary" />
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-amber-500 animate-pulse" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">MinhaIgreja</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 ml-auto">
            <a href="#funcionalidades" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Funcionalidades
            </a>
            <a href="#planos" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Plano
            </a>
            <a href="#depoimentos" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Depoimentos
            </a>
            <Button variant="ghost" asChild className="text-sm">
              <Link to="/login">Entrar</Link>
            </Button>
            <ModeToggle />
            <Button asChild className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20">
              <Link to="/criar">Criar Minha Igreja</Link>
            </Button>
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <ModeToggle />
            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background px-4 py-4 space-y-3">
            <a href="#funcionalidades" className="block py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>
              Funcionalidades
            </a>
            <a href="#planos" className="block py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>
              Plano
            </a>
            <a href="#depoimentos" className="block py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>
              Depoimentos
            </a>
            <Link to="/login" className="block py-2" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">Entrar</Button>
            </Link>
            <Link to="/criar" className="block py-2" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full">Criar Minha Igreja</Button>
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        {/* Overlay suave em gradiente para mostrar a imagem mas manter legibilidade */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/50 via-background/20 to-background/50 dark:from-background/60 dark:via-background/30 dark:to-background/60" />
        
        {/* Background Orbs/Gradients */}
        <div className={`hero-bg-orb absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-3xl`} />
        <div className={`hero-bg-orb absolute bottom-0 right-0 w-[400px] h-[300px] bg-blue-500/10 rounded-full blur-3xl`} />

        <div className="container px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className={`hero-badge inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 shadow-sm ${isHeroInView ? 'animate' : ''}`}>
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                60 dias grátis • Todos os recursos desbloqueados
              </span>
            </div>

            <h1 className={`hero-title text-4xl md:text-6xl lg:text-7xl font-bold text-primary leading-tight tracking-tight ${isHeroInView ? 'animate' : ''}`}>
              Crie o Site da Sua Igreja em <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Minutos</span>
            </h1>

            <p className={`hero-subtitle text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed ${isHeroInView ? 'animate' : ''}`}>
              Plataforma completa e segura para igrejas que desejam se <span className="text-primary font-semibold">conectar com membros</span>, <span className="text-primary font-semibold">crescer de verdade</span> e <span className="text-primary font-semibold">transformar vidas</span> de forma profissional.
            </p>

            <div className={`hero-cta flex flex-col sm:flex-row gap-4 justify-center mt-8 ${isHeroInView ? 'animate' : ''}`}>
              <Button size="lg" asChild className="hero-cta-primary text-lg h-14 px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-xl shadow-primary/20">
                <Link to="/criar">
                  Testar Grátis (60 dias) Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button size="lg" variant="outline" className="hero-cta-primary text-lg h-14 px-8 border-2 hover:bg-primary/5">
                <Play className="mr-2 h-5 w-5" />
                Ver Demonstração
              </Button>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className={`hero-trust-badge flex items-center gap-2 ${isHeroInView ? 'animate' : ''}`}>
                <Shield className="h-4 w-4 text-green-500" />
                <span>Seguro e confiável</span>
              </div>
              <div className={`hero-trust-badge flex items-center gap-2 ${isHeroInView ? 'animate' : ''}`}>
                <Lock className="h-4 w-4 text-blue-500" />
                <span>Dados protegidos</span>
              </div>
              <div className={`hero-trust-badge flex items-center gap-2 ${isHeroInView ? 'animate' : ''}`}>
                <Cloud className="h-4 w-4 text-purple-500" />
                <span>100% na nuvem</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="py-12 bg-card/50 border-y backdrop-blur-sm">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
            {[
              { value: '500+', label: 'Igrejas Ativas', icon: Church },
              { value: '50K+', label: 'Membros', icon: Users },
              { value: '100K+', label: 'Pedidos de Oração', icon: HeartHandshake },
              { value: '99.9%', label: 'Uptime', icon: Cloud },
            ].map((stat, index) => (
              <div key={index} className={`hero-stat text-center group ${isStatsInView ? 'animate' : ''}`}>
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section ref={featuresRef} id="funcionalidades" className="py-24 bg-background">
        <div className="container px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className={`mb-4 px-4 py-1.5 text-sm font-medium features-badge ${isFeaturesInView ? 'animate' : ''}`}>
              ✨ Recursos Completos
            </Badge>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3 sm:mb-4 features-title ${isFeaturesInView ? 'animate' : ''}`}>
              Tudo o Que Sua Igreja Precisa
            </h2>
            <p className={`text-lg text-muted-foreground max-w-2xl mx-auto features-subtitle ${isFeaturesInView ? 'animate' : ''}`}>
              Ferramentas completas para gestão, comunicação e crescimento da sua igreja
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`group border-2 hover:border-primary/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden relative features-card ${isFeaturesInView ? 'animate' : ''}`}
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <CardHeader className="pb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section ref={stepsRef} className="py-24 bg-gradient-to-b from-muted/50 to-background">
        <div className="container px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className={`mb-4 px-4 py-1.5 text-sm font-medium steps-badge ${isStepsInView ? 'animate' : ''}`}>
              🚀 Simples e Rápido
            </Badge>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3 sm:mb-4 steps-title ${isStepsInView ? 'animate' : ''}`}>
              Comece em 3 Passos Simples
            </h2>
            <p className={`text-lg text-muted-foreground max-w-2xl mx-auto steps-subtitle ${isStepsInView ? 'animate' : ''}`}>
              Em menos de 10 minutos sua igreja estará online
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto relative">
            {/* Linha conectora */}
            <div className={`hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 steps-connector ${isStepsInView ? 'animate' : ''}`} />

            {[
              { step: 1, title: 'Preencha o Cadastro', desc: 'Informe os dados da sua igreja e escolha um subdomínio', icon: Rocket },
              { step: 2, title: 'Personalize', desc: 'Adicione logo, cores e informações da sua igreja', icon: MousePointerClick },
              { step: 3, title: 'Publique', desc: 'Seu site estará no ar e pronto para receber visitantes', icon: Globe },
            ].map((item, index) => (
              <div key={index} className={`relative text-center group steps-item ${isStepsInView ? 'animate' : ''}`}>
                <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                  <item.icon className="w-10 h-10 text-white" />
                </div>
                <div className="text-5xl font-bold text-primary/10 absolute -top-4 -right-4">{item.step}</div>
                <h3 className="text-xl font-semibold mb-3 text-primary">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
            {/* Planos Premium - Adaptado */}
      <section id="planos" ref={pricingRef} className="py-24 bg-background relative overflow-hidden">
        {/* Background Grid e Efeitos */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>

        <div className="container px-4 relative z-10">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="mb-2 px-4 py-1.5 text-sm font-medium bg-primary/5 hover:bg-primary/10 transition-colors">
              💎 Escolha o Plano
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Plano que cabe na sua <span className="text-primary">Igreja</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comece grátis e evolua conforme sua igreja cresce. Sem surpresas, sem taxas ocultas.
            </p>

            {/* Toggle Premium */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                Mensal
              </span>
              
              <div 
                className="relative z-10 w-[140px] h-10 rounded-full bg-muted border border-border p-1 cursor-pointer select-none" 
                onClick={() => setIsAnnual(!isAnnual)}
              >
                {/* Sliding Pill */}
                <div 
                  className={`absolute top-1 left-1 h-8 w-[64px] rounded-full bg-primary shadow-lg transition-all duration-300 ease-in-out ${isAnnual ? 'translate-x-[68px]' : 'translate-x-0'}`}
                ></div>
                
                <div className="relative flex h-full w-full items-center justify-between px-2 z-20">
                  <div className={`w-2 h-2 rounded-full transition-colors ${!isAnnual ? 'bg-primary-foreground' : 'bg-muted-foreground'}`} />
                  <div className={`w-2 h-2 rounded-full transition-colors ${isAnnual ? 'bg-primary-foreground' : 'bg-muted-foreground'}`} />
                </div>
              </div>

              <div className="flex flex-col items-start">
                <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Anual
                </span>
                <span className="text-[10px] text-green-600 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">-2 MESES GRÁTIS</span>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid gap-8 max-w-2xl mx-auto">
            {/* Plano Essencial (Popular) com BorderGlow */}
            <div className={`${isPricingInView ? 'animate-card-reveal' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              <BorderGlow
                glowColor="210 80 60"
                backgroundColor="transparent"
                colors={['#3b82f6', '#6366f1', '#8b5cf6']}
                glowIntensity={0.4}
                edgeSensitivity={40}
                glowRadius={25}
                animated={true}
                borderRadius={24}
                fillOpacity={0.08}
              >
                <div className="relative rounded-3xl bg-gradient-to-b from-primary/10 to-primary/5 p-[2px]">
                  <div className="relative rounded-[22px] bg-card p-6 sm:p-8">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-foreground">Essencial</h3>
                        <p className="text-muted-foreground text-sm">Para igrejas em crescimento acelerado.</p>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm text-muted-foreground">R$</span>
                        <span className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">{isAnnual ? '799' : '79,90'}</span>
                        <span className="text-muted-foreground self-end mb-1">/{isAnnual ? 'ano' : 'mês'}</span>
                      </div>

                      <Button className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25" asChild>
                        <Link to="/criar" state={{ selectedPlan: 'essencial' }}>
                          Testar Grátis (60 dias)
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>

                      <div className="pt-6 border-t border-border space-y-4">
                        <p className="text-sm font-medium text-foreground">Todos os recursos incluídos:</p>
                        <ul className="space-y-3">
                          {[
                            'Até 200 membros',
                            'Pedidos de oração ILIMITADOS',
                            '3 administradores',
                            'Domínio próprio',
                            'Upload de logo',
                            'Google Maps integrado',
                            'Analytics avançado',
                            'Suporte prioritário'
                          ].map((feature, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </BorderGlow>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos Reais (Novo Componente) */}
      <AnimatedTestimonials
        title="💬 Depoimentos Reais"
        subtitle="O Que Dizem Nossos Clientes"
        badgeText="Igrejas que transformaram sua comunicação conosco"
        autoRotateInterval={8000}
        testimonials={[
          {
            id: 1,
            name: "Pastor Almeida",
            role: "Pastor",
            company: "Igreja do Evangelho Quadrangular",
            content: "O sistema é simples de usar! Gostaria do recurso de dízimos e ofertas!",
            rating: 5,
            avatar: "https://ui-avatars.com/api/?name=Pastor+Almeida&background=2563eb&color=fff",
          },
        ]}
      />

      {/* Stats de Confiança */}
      <section className="py-8 bg-background">
        <div className="container px-4">
          <div className="text-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 px-4 sm:px-8 py-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">500+</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Igrejas Ativas</div>
              </div>
              <div className="w-px h-12 bg-gray-200 dark:bg-gray-700"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">98%</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Satisfação</div>
              </div>
              <div className="w-px h-12 bg-gray-200 dark:bg-gray-700"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">24/7</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Suporte</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section ref={ctaRef} className="py-20 bg-gradient-to-b from-primary to-primary/80 text-primary-foreground dark:from-gray-900 dark:to-gray-800 dark:text-white">
        <div className="container px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className={`text-3xl md:text-4xl font-bold cta-title ${isCtaInView ? 'animate' : ''}`}>
              Pronto para Começar?
            </h2>
            <p className={`text-lg text-primary-foreground/90 dark:text-gray-300 cta-subtitle ${isCtaInView ? 'animate' : ''}`}>
              Junte-se a igrejas que já estão usando o MinhaIgreja
              para se conectar com seus membros.
            </p>
            <div className={`flex flex-col sm:flex-row gap-4 justify-center mt-8 cta-buttons ${isCtaInView ? 'animate' : ''}`}>
              <Button size="lg" variant="secondary" asChild className="cta-button-primary text-lg h-12 px-8 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100">
                <Link to="/criar">
                  Criar Minha Igreja Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="cta-button-primary text-lg h-12 px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 dark:border-white dark:text-white dark:hover:bg-white/10"
              >
                Falar com Consultor
              </Button>
            </div>
            <p className="text-sm text-primary-foreground/75 dark:text-gray-400 mt-4">
              60 dias de teste no Essencial • Não requer cartão de crédito
            </p>
          </div>
        </div>
      </section>

      {/* Footer Premium */}
      <HoverFooter />
    </div>
  );
}
