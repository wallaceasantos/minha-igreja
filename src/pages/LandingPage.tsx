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
    name: 'Livre',
    price: 'Grátis',
    period: 'Ilimitado',
    annualPrice: 'Grátis',
    description: 'Para igrejas iniciantes e missões',
    features: [
      'Site em subdomínio',
      'Até 50 membros',
      '20 pedidos de oração/mês',
      '1 administrador',
      'Cultos e eventos básicos',
      'Cores personalizadas',
      'Redes sociais',
    ],
    detailedFeatures: [
      { icon: Globe, text: 'Site em subdomínio', included: true },
      { icon: Users, text: 'Até 50 membros', included: true },
      { icon: HeartHandshake, text: '20 pedidos/mês', included: true },
      { icon: Users, text: '1 administrador', included: true },
      { icon: Calendar, text: 'Cultos e eventos', included: true },
      { icon: Church, text: 'Cores personalizadas', included: true },
      { icon: Share2, text: 'Redes sociais', included: true },
      { icon: Shield, text: 'Domínio próprio', included: false },
      { icon: Smartphone, text: 'Upload de logo', included: false },
      { icon: BarChart3, text: 'Analytics', included: false },
    ],
    cta: 'Começar Grátis',
    popular: false,
    bestFor: 'Igrejas pequenas e missões',
    storage: '1 GB',
    support: 'Email',
    planValue: 'free',
  },
  {
    name: 'Essencial',
    price: 'R$ 99,90',
    period: '/mês',
    annualPrice: 'R$ 1.198,80',
    description: 'Para igrejas em crescimento',
    features: [
      'TUDO do Free +',
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
      { icon: Globe, text: 'TUDO do plano Free', included: true },
      { icon: Users, text: 'Até 200 membros', included: true },
      { icon: HeartHandshake, text: 'Pedidos ILIMITADOS', included: true },
      { icon: Users, text: '3 administradores', included: true },
      { icon: Shield, text: 'Domínio próprio', included: true },
      { icon: Smartphone, text: 'Upload de logo', included: true },
      { icon: MapPin, text: 'Google Maps', included: true },
      { icon: Church, text: 'Redes sociais', included: true },
      { icon: BarChart3, text: 'Analytics', included: true },
    ],
    cta: 'Testar Grátis (30 dias)',
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
  const [reviews, setReviews] = useState<any[]>([]);
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

  // Scroll Reveal State - Testimonials
  const testimonialsRef = useRef<HTMLElement | null>(null);
  const [isTestimonialsInView, setIsTestimonialsInView] = useState(false);

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

  // Testimonials Section Observer
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setIsTestimonialsInView(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    if (testimonialsRef.current) {
      observer.observe(testimonialsRef.current);
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

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const res = await fetch(buildApiUrl(`/api/reviews?t=${Date.now()}`));
        const data = await res.json();
        if (data.success) {
          setReviews(data.data);
        }
      } catch (error) {
        console.error('Erro ao carregar reviews:', error);
      }
    };
    loadReviews();
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
              Planos
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
      </header>


      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className={`hero-bg-orb absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-3xl`} />
        <div className={`hero-bg-orb absolute bottom-0 right-0 w-[400px] h-[300px] bg-blue-500/10 rounded-full blur-3xl`} />

        <div className="container px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className={`hero-badge inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 shadow-sm ${isHeroInView ? 'animate' : ''}`}>
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                Plano Livre ilimitado • 30 dias grátis no Essencial
              </span>
            </div>

            <h1 className={`hero-title text-4xl md:text-6xl lg:text-7xl font-bold text-primary leading-tight tracking-tight ${isHeroInView ? 'animate' : ''}`}>
              Crie o Site da Sua Igreja em <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Minutos</span>
            </h1>

            <p className={`hero-subtitle text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed ${isHeroInView ? 'animate' : ''}`}>
              Plataforma completa e segura para igrejas que desejam se conectar com membros
              e visitantes de forma profissional e eficiente.
            </p>

            <div className={`hero-cta flex flex-col sm:flex-row gap-4 justify-center mt-8 ${isHeroInView ? 'animate' : ''}`}>
              <Button size="lg" asChild className="hero-cta-primary text-lg h-14 px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-xl shadow-primary/20">
                <Link to="/criar">
                  Começar Grátis Agora
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
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
            <h2 className={`text-3xl md:text-5xl font-bold text-primary mb-4 features-title ${isFeaturesInView ? 'animate' : ''}`}>
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
            <h2 className={`text-3xl md:text-5xl font-bold text-primary mb-4 steps-title ${isStepsInView ? 'animate' : ''}`}>
              Comece em 3 Passos Simples
            </h2>
            <p className={`text-lg text-muted-foreground max-w-2xl mx-auto steps-subtitle ${isStepsInView ? 'animate' : ''}`}>
              Em menos de 10 minutos sua igreja estará online
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
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
              💎 Escolha seu Plano
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Planos que cabem na sua <span className="text-primary">Igreja</span>
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
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plano Livre */}
            <div className={`group relative rounded-3xl border border-border bg-card/50 dark:bg-card/50 p-8 transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:-translate-y-2 backdrop-blur-sm ${isPricingInView ? 'animate-card-reveal' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">Livre</h3>
                  <p className="text-muted-foreground text-sm">Para igrejas iniciantes e missões.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">Grátis</span>
                </div>
                
                <Button className="w-full rounded-xl" variant="outline" asChild>
                  <Link to="/criar" state={{ selectedPlan: 'free' }}>
                    Começar Grátis
                  </Link>
                </Button>

                <div className="pt-6 border-t border-border space-y-4">
                  <p className="text-sm font-medium text-foreground">Recursos incluídos:</p>
                  <ul className="space-y-3">
                    {[
                      'Site em subdomínio',
                      'Até 50 membros',
                      '20 pedidos de oração/mês',
                      '1 administrador',
                      'Cores personalizadas',
                      'Redes sociais'
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Plano Essencial (Popular) */}
            <div className={`group relative rounded-3xl bg-gradient-to-b from-primary/10 to-primary/5 p-[2px] transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(var(--primary),0.5)] hover:-translate-y-2 ${isPricingInView ? 'animate-card-reveal' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md -z-10"></div>
              
              <div className="relative h-full rounded-[22px] bg-card p-8 overflow-hidden">
                {/* Badge Popular */}
                <div className="absolute top-0 right-6 translate-y-1/2">
                  <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-none shadow-md px-3 py-1">
                    ⭐ Mais Popular
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">Essencial</h3>
                    <p className="text-muted-foreground text-sm">Para igrejas em crescimento acelerado.</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-muted-foreground">R$</span>
                    <span className="text-5xl font-bold tracking-tight text-foreground">{isAnnual ? '499' : '49,90'}</span>
                    <span className="text-muted-foreground self-end mb-1">/{isAnnual ? 'ano' : 'mês'}</span>
                  </div>
                  
                  <Button className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25" asChild>
                    <Link to="/criar" state={{ selectedPlan: 'essencial' }}>
                      Testar Grátis (30 dias)
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <div className="pt-6 border-t border-border space-y-4">
                    <p className="text-sm font-medium text-foreground">Tudo do plano Livre, mais:</p>
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
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section ref={testimonialsRef} id="depoimentos" className="py-24 bg-gradient-to-br from-gray-50 via-blue-50/50 to-purple-50/30 dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-800">
        <div className="container px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className={`mb-4 px-4 py-1.5 text-sm font-medium testimonials-badge ${isTestimonialsInView ? 'animate' : ''}`}>
              💬 Depoimentos Reais
            </Badge>
            <h2 className={`text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 testimonials-title ${isTestimonialsInView ? 'animate' : ''}`}>
              O Que Dizem Nossos Clientes
            </h2>
            <p className={`text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto testimonials-subtitle ${isTestimonialsInView ? 'animate' : ''}`}>
              Igrejas que transformaram sua comunicação conosco
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <Card
                  key={review.id}
                  className={`relative hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 overflow-hidden group testimonial-card ${isTestimonialsInView ? 'animate' : ''}`}
                  style={{ animationDelay: `${0.3 + index * 0.2}s` }}
                >
                  {/* Aspas decorativas */}
                  <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <svg className="w-16 h-16 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                    </svg>
                  </div>

                  <CardContent className="pt-8 pb-6 px-6">
                    {/* Estrelas */}
                    <div className={`flex gap-1 mb-4 testimonial-stars ${isTestimonialsInView ? 'animate' : ''}`}>
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                      ))}
                    </div>

                    {/* Texto do depoimento */}
                    <blockquote className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic">
                      "{review.comment}"
                    </blockquote>

                    {/* Autor */}
                    <div className="grid grid-cols-[auto_1fr] gap-4 pt-4 border-t border-gray-100 dark:border-gray-700 items-center">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {(review.pastor_name || 'P').charAt(0)}
                      </div>
                      {/* Info */}
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{review.pastor_name || 'Pastor'}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{review.church_name || 'Igreja'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Nenhum depoimento ainda. Seja o primeiro!</p>
              </div>
            )}
          </div>

          {/* Stats de confiança */}
          <div className={`mt-16 text-center testimonials-stats ${isTestimonialsInView ? 'animate' : ''}`}>
            <div className="inline-flex items-center gap-8 px-8 py-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
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
      <section ref={ctaRef} className="py-20 bg-primary text-primary-foreground dark:bg-primary/90">
        <div className="container px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className={`text-3xl md:text-4xl font-bold cta-title ${isCtaInView ? 'animate' : ''}`}>
              Pronto para Começar?
            </h2>
            <p className={`text-lg opacity-90 cta-subtitle ${isCtaInView ? 'animate' : ''}`}>
              Junte-se a centenas de igrejas que já estão usando o MinhaIgreja
              para se conectar com seus membros.
            </p>
            <div className={`flex flex-col sm:flex-row gap-4 justify-center mt-8 cta-buttons ${isCtaInView ? 'animate' : ''}`}>
              <Button size="lg" variant="secondary" asChild className="cta-button-primary text-lg h-12 px-8">
                <Link to="/criar">
                  Criar Minha Igreja Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="cta-button-primary text-lg h-12 px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
              >
                Falar com Consultor
              </Button>
            </div>
            <p className="text-sm opacity-75 mt-4">
              30 dias de teste no Essencial • Plano Grátis ilimitado • Não requer cartão de crédito
            </p>
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
                <span className="text-xl font-bold">MinhaIgreja</span>
              </div>
              <p className="text-sm text-gray-300 dark:text-muted-foreground">
                Plataforma digital para igrejas que desejam se conectar com membros e visitantes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-gray-300 dark:text-muted-foreground">
                <li><a href="#funcionalidades" className="hover:text-white dark:hover:text-primary">Funcionalidades</a></li>
                <li><a href="#planos" className="hover:text-white dark:hover:text-primary">Planos</a></li>
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
            <p>Copyright © {new Date().getFullYear()} MinhaIgreja. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
