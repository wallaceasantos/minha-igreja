/**
 * Landing Page Institucional - Igreja Connect
 * ============================================
 * Página inicial da plataforma (domínio principal)
 * URL: https://igrejaconnect.com.br
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ModeToggle } from '@/components/mode-toggle';
import { 
  Church, 
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
  HelpCircle,
  X,
  Info,
  Menu
} from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: 'Site Profissional',
    description: 'Design moderno e responsivo. Sua igreja sempre visível para membros e visitantes.',
  },
  {
    icon: HeartHandshake,
    title: 'Pedidos de Oração',
    description: 'Receba e gerencie pedidos de oração online. Pastoreio mais próximo e eficiente.',
  },
  {
    icon: Users,
    title: 'Gestão de Membros',
    description: 'Cadastre membros, controle frequência e acompanhe o crescimento da igreja.',
  },
  {
    icon: Calendar,
    title: 'Agenda de Cultos',
    description: 'Organize cultos e eventos. Mantenha todos informados sobre as atividades.',
  },
  {
    icon: BarChart3,
    title: 'Relatórios',
    description: 'Acompanhe métricas importantes. Tome decisões baseadas em dados.',
  },
  {
    icon: Smartphone,
    title: 'App Mobile',
    description: 'Disponível para Android e iOS. Sua igreja no bolso dos membros.',
  },
];

const plans = [
  {
    name: 'Free',
    price: 'R$ 0',
    period: '/mês',
    annualPrice: 'R$ 0',
    description: 'Para igrejas pequenas e missões',
    features: [
      'Site em subdomínio',
      'Até 100 membros',
      '50 pedidos de oração/mês',
      '1 administrador',
      'Analytics básico',
      'Suporte por email',
    ],
    detailedFeatures: [
      { icon: Globe, text: 'Site profissional em subdomínio', included: true },
      { icon: Users, text: 'Até 100 membros cadastrados', included: true },
      { icon: HeartHandshake, text: '50 pedidos de oração por mês', included: true },
      { icon: Users, text: '1 administrador', included: true },
      { icon: BarChart3, text: 'Analytics básico', included: true },
      { icon: Church, text: 'Suporte por email', included: true },
      { icon: Smartphone, text: 'App mobile', included: false },
      { icon: Shield, text: 'Domínio próprio', included: false },
      { icon: Calendar, text: 'Gestão de eventos', included: false },
    ],
    cta: 'Começar Grátis',
    popular: false,
    bestFor: 'Igrejas iniciantes e missões',
    storage: '1 GB',
    support: 'Email (48h)',
  },
  {
    name: 'Essencial',
    price: 'R$ 29,90',
    period: '/mês',
    annualPrice: 'R$ 299,90',
    description: 'Para igrejas em crescimento',
    features: [
      'Tudo do Free +',
      'Até 500 membros',
      'Pedidos ilimitados',
      '5 administradores',
      'Domínio próprio',
      'E-mail marketing (1.000/mês)',
      'Relatórios avançados',
      'Suporte prioritário',
    ],
    detailedFeatures: [
      { icon: Users, text: 'Até 500 membros cadastrados', included: true },
      { icon: HeartHandshake, text: 'Pedidos de oração ilimitados', included: true },
      { icon: Users, text: '5 administradores', included: true },
      { icon: Globe, text: 'Domínio próprio personalizado', included: true },
      { icon: Church, text: 'E-mail marketing (1.000/mês)', included: true },
      { icon: BarChart3, text: 'Relatórios avançados', included: true },
      { icon: Smartphone, text: 'App mobile', included: false },
      { icon: Calendar, text: 'Gestão completa de eventos', included: true },
      { icon: Shield, text: 'SSL incluso', included: true },
    ],
    cta: 'Testar Grátis (30 dias)',
    popular: false,
    bestFor: 'Igrejas em crescimento (100-500 membros)',
    storage: '10 GB',
    support: 'Email + WhatsApp (24h)',
  },
  {
    name: 'Premium',
    price: 'R$ 79,90',
    period: '/mês',
    annualPrice: 'R$ 799,90',
    description: 'Para igrejas estabelecidas',
    features: [
      'Tudo do Essencial +',
      'Até 2.000 membros',
      'Dízimos e ofertas online',
      '15 administradores',
      'App mobile white-label',
      'WhatsApp integration',
      'Escola bíblica online',
      'Grupos familiares',
    ],
    detailedFeatures: [
      { icon: Users, text: 'Até 2.000 membros cadastrados', included: true },
      { icon: HeartHandshake, text: 'Dízimos e ofertas online (PIX)', included: true },
      { icon: Users, text: '15 administradores', included: true },
      { icon: Smartphone, text: 'App mobile white-label', included: true },
      { icon: Church, text: 'WhatsApp integration', included: true },
      { icon: Globe, text: 'Escola bíblica online', included: true },
      { icon: Users, text: 'Grupos familiares', included: true },
      { icon: BarChart3, text: 'BI completo e métricas', included: true },
      { icon: Shield, text: 'Backup automático diário', included: true },
    ],
    cta: 'Testar Grátis (30 dias)',
    popular: true,
    bestFor: 'Igrejas estabelecidas (500-2000 membros)',
    storage: '50 GB',
    support: 'Prioritário (12h)',
  },
  {
    name: 'Enterprise',
    price: 'R$ 199,90',
    period: '/mês',
    annualPrice: 'R$ 1.999,90',
    description: 'Para igrejas grandes e ministérios',
    features: [
      'Tudo do Premium +',
      'Membros ilimitados',
      'Multi-unidades',
      'Administradores ilimitados',
      'Gateway de pagamento',
      'API aberta',
      'CRM pastoral',
      'Treinamento incluso',
      'Gerente de conta',
    ],
    detailedFeatures: [
      { icon: Users, text: 'Membros ilimitados', included: true },
      { icon: Globe, text: 'Multi-unidades (várias congregações)', included: true },
      { icon: Users, text: 'Administradores ilimitados', included: true },
      { icon: HeartHandshake, text: 'Gateway de pagamento integrado', included: true },
      { icon: Shield, text: 'API aberta e webhooks', included: true },
      { icon: BarChart3, text: 'CRM pastoral completo', included: true },
      { icon: Church, text: 'Treinamento da equipe incluso', included: true },
      { icon: Users, text: 'Gerente de conta dedicado', included: true },
      { icon: Smartphone, text: 'App mobile personalizado', included: true },
    ],
    cta: 'Falar com Vendas',
    popular: false,
    bestFor: 'Grandes igrejas e ministérios (2000+ membros)',
    storage: 'Ilimitado',
    support: '24/7 dedicado',
  },
];

const testimonials = [
  {
    name: 'Pr. João Silva',
    church: 'Primeira Igreja Batista',
    content: 'O Igreja Connect transformou nossa comunicação. Os membros estão mais engajados e os pedidos de oração chegam até nós de forma organizada.',
    rating: 5,
  },
  {
    name: 'Pr. Maria Santos',
    church: 'Igreja Assembleia de Deus',
    content: 'Fácil de usar e completo. Em menos de 1 hora tínhamos nosso site no ar. O suporte é excelente!',
    rating: 5,
  },
  {
    name: 'Pr. José Oliveira',
    church: 'Igreja do Nazareno',
    content: 'O módulo de dízimos e ofertas foi um divisor de águas. A transparência aumentou e os membros se sentem mais seguros.',
    rating: 5,
  },
];

export default function LandingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedPlanForDetails, setSelectedPlanForDetails] = useState<typeof plans[0] | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <Church className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">Igreja Connect</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 ml-auto">
            <a href="#funcionalidades" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Funcionalidades
            </a>
            <a href="#planos" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Planos
            </a>
            <a href="#depoimentos" className="text-sm font-medium text-muted-foreground hover:text-primary">
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
          <div className="flex items-center gap-2 md:hidden">
            <ModeToggle />
            <Button variant="ghost" size="sm">
              <Menu size={24} />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                30 dias grátis em todos os planos
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-primary leading-tight">
              Crie o Site da Sua Igreja em Minutos
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Plataforma completa para igrejas que desejam se conectar com membros 
              e visitantes de forma profissional e eficiente.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button size="lg" asChild className="text-lg h-12 px-8">
                <Link to="/criar">
                  Começar Grátis Agora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" className="text-lg h-12 px-8">
                <Play className="mr-2 h-5 w-5" />
                Ver Demonstração
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              Não requer cartão de crédito • Cancela quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-background border-y">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm md:text-base text-muted-foreground">Igrejas Ativas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">50K+</div>
              <div className="text-sm md:text-base text-muted-foreground">Membros</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">100K+</div>
              <div className="text-sm md:text-base text-muted-foreground">Pedidos de Oração</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-sm md:text-base text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="py-20 bg-background">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Tudo o Que Sua Igreja Precisa
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ferramentas completas para gestão, comunicação e crescimento da sua igreja
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="border-2 hover:border-primary hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 bg-muted/50">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Comece em 3 Passos Simples
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Em menos de 10 minutos sua igreja estará online
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Preencha o Cadastro</h3>
              <p className="text-muted-foreground">
                Informe os dados da sua igreja e escolha um subdomínio
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalize</h3>
              <p className="text-muted-foreground">
                Adicione logo, cores e informações da sua igreja
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Publique</h3>
              <p className="text-muted-foreground">
                Seu site estará no ar e pronto para receber visitantes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="py-20 bg-background">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Planos para Todos os Tamanhos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comece grátis e evolua conforme sua igreja cresce
            </p>
            
            {/* Toggle de Frequência de Pagamento */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className={`text-sm font-medium ${!isAnnual ? 'text-primary' : 'text-muted-foreground'}`}>
                Mensal
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative"
              >
                <div className={`w-10 h-5 rounded-full transition-colors ${isAnnual ? 'bg-primary' : 'bg-muted'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${isAnnual ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </Button>
              <span className={`text-sm font-medium ${isAnnual ? 'text-primary' : 'text-muted-foreground'}`}>
                Anual (2 meses grátis)
              </span>
            </div>
          </div>

          {/* Cards de Planos */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {plans.map((plan, index) => {
              const isSelected = selectedPlan === plan.name.toLowerCase();
              const displayPrice = isAnnual ? plan.annualPrice : plan.price;
              const displayPeriod = isAnnual ? '/ano' : plan.period;
              
              return (
                <Card
                  key={index}
                  className={`relative transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-2 ${
                    plan.popular
                      ? 'border-2 border-primary shadow-lg scale-105'
                      : 'border'
                  } ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                  onClick={() => setSelectedPlan(plan.name.toLowerCase())}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                        ⭐ Mais Popular
                      </div>
                    </div>
                  )}
                  
                  {/* Indicador de Seleção */}
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                  )}

                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-primary">
                        {displayPrice}
                      </span>
                      <span className="text-muted-foreground">
                        {displayPeriod}
                      </span>
                    </div>
                    <CardDescription className="mt-2">{plan.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {plan.features.slice(0, 5).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                      {plan.features.length > 5 && (
                        <li className="text-xs text-muted-foreground pl-7">
                          + {plan.features.length - 5} recursos adicionais
                        </li>
                      )}
                    </ul>

                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        variant={plan.popular ? 'default' : 'outline'}
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link to="/criar" state={{ selectedPlan: plan.name }}>
                          {plan.cta}
                        </Link>
                      </Button>
                      
                      {/* Botão Ver Detalhes */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlanForDetails(plan);
                        }}
                      >
                        <Info className="h-3 w-3 mr-1" />
                        Ver detalhes completos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Modal de Detalhes do Plano */}
          <Dialog open={!!selectedPlanForDetails} onOpenChange={() => setSelectedPlanForDetails(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-2xl">
                      {selectedPlanForDetails?.name}
                    </DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedPlanForDetails?.bestFor}
                    </DialogDescription>
                  </div>
                  <Badge variant={selectedPlanForDetails?.popular ? 'default' : 'secondary'}>
                    {selectedPlanForDetails?.popular ? '⭐ Mais Popular' : 'Plano'}
                  </Badge>
                </div>
              </DialogHeader>
              
              {selectedPlanForDetails && (
                <div className="space-y-6 mt-4">
                  {/* Preços */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Mensal</p>
                      <p className="text-2xl font-bold text-primary">{selectedPlanForDetails.price}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Anual</p>
                      <p className="text-2xl font-bold text-primary">{selectedPlanForDetails.annualPrice}</p>
                      <p className="text-xs text-green-600 font-medium">2 meses grátis</p>
                    </div>
                  </div>
                  
                  {/* Informações do Plano */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Armazenamento</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{selectedPlanForDetails.storage}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Suporte</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-semibold">{selectedPlanForDetails.support}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Ideal para</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{selectedPlanForDetails.bestFor}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Recursos Detalhados */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Recursos Incluídos</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {selectedPlanForDetails.detailedFeatures.map((feature, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-3 p-3 rounded-lg ${
                            feature.included ? 'bg-green-50' : 'bg-muted/30'
                          }`}
                        >
                          <feature.icon className={`h-5 w-5 ${
                            feature.included ? 'text-green-600' : 'text-muted-foreground'
                          }`} />
                          <span className={`text-sm ${
                            feature.included ? 'text-foreground' : 'text-muted-foreground line-through'
                          }`}>
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Call to Action */}
                  <div className="flex gap-4 pt-4 border-t">
                    <Button size="lg" className="flex-1" asChild>
                      <Link to="/criar" state={{ selectedPlan: selectedPlanForDetails.name }}>
                        {selectedPlanForDetails.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => setSelectedPlanForDetails(null)}>
                      Fechar
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
          
          {/* Comparação de Planos */}
          {selectedPlan && (
            <div className="mt-12 max-w-4xl mx-auto">
              <Card className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-center">
                    Plano {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Selecionado
                  </CardTitle>
                  <CardDescription className="text-center">
                    Compare com outros planos ou faça sua escolha
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4 justify-center">
                  <Button variant="outline" onClick={() => setSelectedPlan(null)}>
                    Ver Todos os Planos
                  </Button>
                  <Button asChild>
                    <Link to="/criar" state={{ selectedPlan: selectedPlan }}>
                      Começar com Este Plano
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Depoimentos */}
      <section id="depoimentos" className="py-20 bg-muted/50">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              O Que Dizem Nossos Clientes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Igrejas que transformaram sua comunicação conosco
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index}
                className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.church}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-primary text-primary-foreground dark:bg-primary/90">
        <div className="container px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Pronto para Começar?
            </h2>
            <p className="text-lg opacity-90">
              Junte-se a centenas de igrejas que já estão usando o Igreja Connect
              para se conectar com seus membros.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button size="lg" variant="secondary" asChild className="text-lg h-12 px-8">
                <Link to="/criar">
                  Criar Minha Igreja Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="text-lg h-12 px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
              >
                Falar com Consultor
              </Button>
            </div>
            <p className="text-sm opacity-75 mt-4">
              30 dias de teste grátis • Não requer cartão de crédito
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
                <span className="text-xl font-bold">Igreja Connect</span>
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
            <p>Copyright © {new Date().getFullYear()} Igreja Connect. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
