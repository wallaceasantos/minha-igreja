/**
 * Landing Page: Criar Igreja
 * ===========================
 * Página de cadastro para novas igrejas
 * URL: https://minhaigreja.app/criar
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ModeToggle } from '@/components/mode-toggle';
import PlanSelection from '@/components/PlanSelection';
import BorderGlow from '@/components/ui/BorderGlow';
import { HoverFooter } from '@/components/ui/hover-footer';
import heroBg from '@/assets/img_bkg.png';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, Church, Mail, Phone, MapPin, User, Lock, Menu, X, Sparkles, Shield, Cloud, Globe, HeartHandshake, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/config';

interface AddressData {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
}

interface AdminData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormData {
  name: string;
  slug: string;
  cnpj: string;
  description: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: AddressData;
  admin: AdminData;
}

const initialAddress: AddressData = {
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  zip: '',
};

const initialAdmin: AdminData = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const initialFormData: FormData = {
  name: '',
  slug: '',
  cnpj: '',
  description: '',
  email: '',
  phone: '',
  whatsapp: '',
  address: initialAddress,
  admin: initialAdmin,
};

export default function CreateChurch() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Pegar plano selecionado (vem da Landing Page)
  const selectedPlanFromLocation = location.state?.selectedPlan;
  
  const [selectedPlan, setSelectedPlan] = useState<'essencial'>(
    'essencial'
  );
  const [showPlanSelection, setShowPlanSelection] = useState(!selectedPlanFromLocation);
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent as string]: {
          ...(prev[parent as keyof FormData] as object),
          [child as string]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Verifica slug quando mudar
    if (name === 'slug' && value.length >= 3) {
      checkSlugAvailability(value);
    }
  };

  // Máscara para CNPJ (00.000.000/0000-00)
  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let digits = e.target.value.replace(/\D/g, '');
    digits = digits.slice(0, 14); // Limita a 14 dígitos
    
    if (digits.length > 12) {
      digits = `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
    } else if (digits.length > 8) {
      digits = `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}-`;
    } else if (digits.length > 5) {
      digits = `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    } else if (digits.length > 2) {
      digits = `${digits.slice(0, 2)}.${digits.slice(2)}`;
    }
    
    setFormData(prev => ({ ...prev, cnpj: digits }));
  };

  // Máscara para Telefone ((00) 0000-0000)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let digits = e.target.value.replace(/\D/g, '');
    digits = digits.slice(0, 10); // Limita a 10 dígitos (telefone fixo)
    
    if (digits.length > 8) {
      digits = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 6) {
      digits = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 2) {
      digits = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length > 0) {
      digits = `(${digits}`;
    }
    
    setFormData(prev => ({ ...prev, phone: digits }));
  };

  // Máscara para WhatsApp ((00) 00000-0000)
  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let digits = e.target.value.replace(/\D/g, '');
    digits = digits.slice(0, 11); // Limita a 11 dígitos (celular)
    
    if (digits.length > 10) {
      digits = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    } else if (digits.length > 6) {
      digits = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    } else if (digits.length > 2) {
      digits = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length > 0) {
      digits = `(${digits}`;
    }
    
    setFormData(prev => ({ ...prev, whatsapp: digits }));
  };

  const checkSlugAvailability = async (slug: string) => {
    setCheckingSlug(true);
    try {
      const response = await fetch(buildApiUrl(`/api/church/check-slug/${slug}`));
      const data = await response.json();
      setSlugAvailable(data.available);
    } catch {
      setSlugAvailable(null);
    } finally {
      setCheckingSlug(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    // Validações
    const newErrors: string[] = [];

    if (!formData.name || formData.name.length < 5) {
      newErrors.push('Nome da igreja deve ter pelo menos 5 caracteres');
    }

    if (!formData.slug || formData.slug.length < 3) {
      newErrors.push('Subdomínio deve ter pelo menos 3 caracteres');
    }

    if (!formData.admin.email || !formData.admin.email.includes('@')) {
      newErrors.push('Email do administrador é obrigatório');
    }

    if (formData.admin.password !== formData.admin.confirmPassword) {
      newErrors.push('Senhas não conferem');
    }

    if (formData.admin.password.length < 6) {
      newErrors.push('Senha deve ter pelo menos 6 caracteres');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      // Adicionar plano selecionado ao formData
      const formDataWithPlan = {
        ...formData,
        plan_type: selectedPlan,
      };

      const response = await fetch(buildApiUrl('/api/church'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataWithPlan),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Erro ao criar igreja');
      }

      // Sucesso! Redirecionar para página de sucesso
      navigate('/sucesso', {
        state: {
          churchData: data.data,
        },
      });

      toast.success('Igreja criada com sucesso!', {
        description: 'Redirecionando...',
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setErrors([errorMessage]);
      toast.error('Erro ao criar igreja', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Fixo - Estilo Landing Page */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
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
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden ml-auto">
            <ModeToggle />
            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
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

      {/* Hero Section - Estilo Landing Page */}
      <section className="relative py-16 md:py-28 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
        {/* Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/70 via-background/40 to-background/70 dark:from-background/80 dark:via-background/50 dark:to-background/80" />

        <div className="container px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-primary/10 rounded-full border border-primary/20 shadow-sm">
              <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-primary" />
              <span className="text-xs md:text-sm font-semibold text-primary">Crie seu site em minutos</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-primary leading-tight tracking-tight">
              Crie o Site da Sua Igreja em <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">Minutos</span>
            </h1>

            <p className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Plataforma completa e segura para igrejas que desejam se <span className="text-primary font-semibold">conectar com membros</span>, <span className="text-primary font-semibold">crescer de verdade</span> e <span className="text-primary font-semibold">transformar vidas</span> de forma profissional.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-6 text-xs md:text-sm text-muted-foreground mt-4 md:mt-6">
              <div className="flex items-center gap-2">
                <Shield className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                <span>Seguro e confiável</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
                <span>Dados protegidos</span>
              </div>
              <div className="flex items-center gap-2">
                <Cloud className="h-3 w-3 md:h-4 md:w-4 text-purple-500" />
                <span>100% na nuvem</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plano Selecionado - BorderGlow */}
      {!showPlanSelection && selectedPlan === 'essencial' && (
        <section className="py-8 md:py-12 bg-background">
          <div className="container px-4">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 md:mb-4">Plano Selecionado</h2>
              <p className="text-sm md:text-base text-muted-foreground">Você está criando sua igreja no plano Essencial</p>
            </div>
            
            <div className="max-w-md mx-auto">
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
                  <div className="relative rounded-[22px] bg-card p-6 md:p-8">
                    <div className="absolute top-0 right-4 md:right-6 -translate-y-1/2">
                      <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-none shadow-md px-2 md:px-3 py-1 text-xs md:text-sm">
                        ⭐ Mais Popular
                      </Badge>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-xl md:text-2xl font-bold text-foreground">Essencial</h3>
                        <p className="text-muted-foreground text-xs md:text-sm">Para igrejas em crescimento acelerado.</p>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs md:text-sm text-muted-foreground">R$</span>
                        <span className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">79,90</span>
                        <span className="text-muted-foreground text-xs md:text-sm self-end mb-1">/mês</span>
                      </div>
                      <div className="pt-4 md:pt-6 border-t border-border space-y-3 md:space-y-4">
                        <p className="text-xs md:text-sm font-medium text-foreground">Todos os recursos incluídos:</p>
                        <ul className="space-y-2 md:space-y-3">
                          {[
                            'Até 200 membros',
                            'Pedidos de oração ILIMITADOS',
                            '3 administradores',
                            'Domínio próprio',
                            'Upload de logo',
                            'Google Maps integrado'
                          ].map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground">
                              <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-green-500 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <p className="text-xs text-center text-primary font-semibold mt-2 md:mt-4">60 dias de teste grátis</p>
                      </div>
                    </div>
                  </div>
                </div>
              </BorderGlow>
            </div>
          </div>
        </section>
      )}

      {/* Benefícios com Cores no Hover */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {[
              { 
                icon: Globe, 
                title: 'Site Profissional', 
                desc: 'Design moderno e responsivo. Sua igreja sempre visível para membros e visitantes.',
                hover: 'hover:bg-blue-50 hover:border-blue-200',
                bgIcon: 'bg-blue-100',
                textIcon: 'text-blue-600'
              },
              { 
                icon: HeartHandshake, 
                title: 'Pedidos de Oração', 
                desc: 'Receba pedidos de oração online. Pastoreio mais próximo e eficiente.',
                hover: 'hover:bg-rose-50 hover:border-rose-200',
                bgIcon: 'bg-rose-100',
                textIcon: 'text-rose-600'
              },
              { 
                icon: Zap, 
                title: '60 Dias Grátis', 
                desc: 'Teste todos os recursos do plano Essencial gratuitamente por 60 dias.',
                hover: 'hover:bg-amber-50 hover:border-amber-200',
                bgIcon: 'bg-amber-100',
                textIcon: 'text-amber-600'
              }
            ].map((item, index) => (
              <Card key={index} className={`group border transition-all duration-300 hover:-translate-y-1 md:hover:-translate-y-2 hover:shadow-lg ${item.hover}`}>
                <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl ${item.bgIcon} flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`h-6 w-6 md:h-7 md:w-7 ${item.textIcon}`} />
                  </div>
                  <CardTitle className="text-lg md:text-xl group-hover:text-primary transition-colors">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-2 md:pt-4">
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Formulário */}
      <section className="py-12 md:py-20 bg-background">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 md:mb-4">Dados da Igreja</h2>
              <p className="text-sm md:text-base text-muted-foreground">Preencha as informações abaixo para criar o site da sua igreja</p>
            </div>
            
            <Card className="border-2 shadow-xl">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-xl md:text-2xl">Dados da Igreja</CardTitle>
                <CardDescription className="text-sm">
                  Preencha as informações abaixo para criar o site da sua igreja
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6 md:space-y-8 p-4 md:p-8">
                  {/* Alerta de Erros */}
                  {errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        <ul className="list-disc list-inside space-y-1">
                          {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Dados Básicos */}
                  <div className="space-y-3 md:space-y-4 p-4 md:p-6 bg-muted/30 rounded-xl border border-border/50">
                    <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
                      <Church className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                      Informações da Igreja
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome da Igreja *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Ex: Primeira Igreja Batista"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="slug">Subdomínio (URL do site) *</Label>
                        <div className="flex gap-2">
                          <Input
                            id="slug"
                            name="slug"
                            value={formData.slug}
                            onChange={handleInputChange}
                            placeholder="primeira-batista"
                            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                            title="Apenas letras minúsculas, números e hífens (ex: primeira-batista)"
                            required
                            className="flex-1"
                          />
                          {checkingSlug && (
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          )}
                          {slugAvailable === true && (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          )}
                          {slugAvailable === false && (
                            <span className="text-red-500 text-sm">Indisponível</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Seu site será: https://{formData.slug || '...'}.plataforma.minhaigreja.com.br
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cnpj">CNPJ</Label>
                        <Input
                          id="cnpj"
                          name="cnpj"
                          value={formData.cnpj}
                          onChange={handleCNPJChange}
                          placeholder="00.000.000/0000-00"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email da Igreja *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="contato@igreja.com.br"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            placeholder="(00) 0000-0000"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="whatsapp"
                            name="whatsapp"
                            value={formData.whatsapp}
                            onChange={handleWhatsAppChange}
                            placeholder="(00) 00000-0000"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="space-y-3 md:space-y-4 p-4 md:p-6 bg-muted/30 rounded-xl border border-border/50">
                    <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                      Endereço da Igreja
                    </h3>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="address.street">Rua/Av</Label>
                        <Input
                          id="address.street"
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleInputChange}
                          placeholder="Ex: Rua Principal (Opcional)"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address.number">Número</Label>
                        <Input
                          id="address.number"
                          name="address.number"
                          value={formData.address.number}
                          onChange={handleInputChange}
                          placeholder="1000 (Opcional)"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="address.neighborhood">Bairro</Label>
                        <Input
                          id="address.neighborhood"
                          name="address.neighborhood"
                          value={formData.address.neighborhood}
                          onChange={handleInputChange}
                          placeholder="Centro (Opcional)"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address.city">Cidade</Label>
                        <Input
                          id="address.city"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleInputChange}
                          placeholder="São Paulo (Opcional)"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address.state">Estado</Label>
                        <Input
                          id="address.state"
                          name="address.state"
                          value={formData.address.state}
                          onChange={(e) => {
                            const value = e.target.value.toUpperCase().slice(0, 2);
                            setFormData(prev => ({
                              ...prev,
                              address: { ...prev.address, state: value }
                            }));
                          }}
                          placeholder="SP"
                          maxLength={2}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="address.zip">CEP (Opcional)</Label>
                        <Input
                          id="address.zip"
                          name="address.zip"
                          value={formData.address.zip}
                          onChange={(e) => {
                            let digits = e.target.value.replace(/\D/g, '');
                            digits = digits.slice(0, 8);
                            if (digits.length > 5) {
                              digits = `${digits.slice(0, 5)}-${digits.slice(5)}`;
                            }
                            setFormData(prev => ({
                              ...prev,
                              address: { ...prev.address, zip: digits }
                            }));
                          }}
                          placeholder="00000-000 - Ajuda na localização do Google Maps"
                        />
                        <p className="text-xs text-muted-foreground">
                          Opcional - Preencha para facilitar a localização no mapa
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address.complement">Complemento</Label>
                        <Input
                          id="address.complement"
                          name="address.complement"
                          value={formData.address.complement}
                          onChange={handleInputChange}
                          placeholder="Apto, Sala, Bloco (Opcional)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dados do Administrador */}
                  <div className="space-y-3 md:space-y-4 p-4 md:p-6 bg-muted/30 rounded-xl border border-border/50">
                    <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
                      <User className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                      Dados do Administrador
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="admin.name">Nome Completo *</Label>
                      <Input
                        id="admin.name"
                        name="admin.name"
                        value={formData.admin.name}
                        onChange={handleInputChange}
                        placeholder="Ex: Pastor João da Silva"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="admin.email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="admin.email"
                          name="admin.email"
                          type="email"
                          value={formData.admin.email}
                          onChange={handleInputChange}
                          placeholder="pastor@igreja.com.br"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="admin.password">Senha *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="admin.password"
                            name="admin.password"
                            type="password"
                            value={formData.admin.password}
                            onChange={handleInputChange}
                            placeholder="Mínimo 6 caracteres"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="admin.confirmPassword">Confirmar Senha *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="admin.confirmPassword"
                            name="admin.confirmPassword"
                            type="password"
                            value={formData.admin.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Repita a senha"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Termos */}
                  <div className="bg-muted/50 p-3 md:p-4 rounded-lg">
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Ao criar sua igreja, você concorda com nossos{' '}
                      <Link to="/termos-de-uso" className="text-primary hover:underline">
                        Termos de Uso
                      </Link>{' '}
                      e{' '}
                      <Link to="/politica-privacidade" className="text-primary hover:underline">
                        Política de Privacidade
                      </Link>
                      .
                    </p>
                  </div>

                  {/* Resumo do Plano Selecionado */}
                  <Card className={`border-2 ${
                    selectedPlan === 'essencial'
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-green-500/50 bg-green-500/5'
                  }`}>
                    <CardContent className="pt-4 md:pt-6">
                      <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                        <CheckCircle2 className={`h-5 w-5 md:h-6 md:w-6 ${
                          selectedPlan === 'essencial' ? 'text-primary' : 'text-green-600'
                        }`} />
                        <div>
                          <h3 className="font-bold text-base md:text-lg">
                            {selectedPlan === 'essencial' ? 'Plano Essencial' : 'Plano Essencial'} Selecionado
                          </h3>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            {selectedPlan === 'essencial'
                              ? '60 dias grátis • Depois R$ 79,90/mês'
                              : 'Grátis ilimitado • Sem cartão de crédito'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm">
                        {selectedPlan === 'essencial' ? (
                          <>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                              <span>Até 200 membros</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                              <span>Pedidos ilimitados</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                              <span>3 administradores</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                              <span>Domínio próprio</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span>Até 50 membros</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span>20 pedidos/mês</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span>1 administrador</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span>Site profissional</span>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Botão Submit */}
                  <Button
                    type="submit"
                    className="w-full h-11 md:h-12 text-base md:text-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
                        Criando sua igreja...
                      </>
                    ) : (
                      <>
                        <Church className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                        Criar Minha Igreja Grátis
                      </>
                    )}
                  </Button>
                </CardContent>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer Premium */}
      <HoverFooter />
    </div>
  );
}
