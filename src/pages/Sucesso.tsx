/**
 * Página: Sucesso - Igreja Criada (Estilo SaaS Moderno)
 * ============================================
 * Mostrada após criar uma nova igreja
 */

import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HoverFooter } from '@/components/ui/hover-footer';
import { ModeToggle } from '@/components/mode-toggle';
import {
  CheckCircle,
  Copy,
  ExternalLink,
  LogIn,
  Globe,
  Mail,
  Calendar,
  ArrowRight,
  Shield,
  Church,
  Menu,
  X,
  Sparkles,
  Zap,
  Rocket,
} from 'lucide-react';
import { toast } from 'sonner';

interface ChurchData {
  church_id: number;
  slug: string;
  name: string;
  url: string;
  admin_url: string;
  trial_end_date?: string;
  trial_days?: number;
  plan_type: string;
  admin: {
    email: string;
    name: string;
  };
}

export default function Sucesso() {
  const navigate = useNavigate();
  const location = useLocation();
  const [churchData, setChurchData] = useState<ChurchData | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const data = location.state?.churchData;

    if (!data) {
      toast.error('Nenhuma igreja encontrada', {
        description: 'Redirecionando para a página inicial...',
      });
      setTimeout(() => navigate('/'), 2000);
      return;
    }

    setChurchData(data);

    localStorage.setItem('isAdminAuthenticated', 'true');
    localStorage.setItem('churchId', String(data.church_id));

    if (data.admin && data.admin.email) {
      localStorage.setItem('adminEmail', data.admin.email);
    } else if (data.email) {
      localStorage.setItem('adminEmail', data.email);
    }

    toast.success('Login realizado automaticamente!', {
      description: 'Bem-vindo ao MinhaIgreja!',
    });
  }, [location, navigate]);

  if (!churchData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-primary/30 rounded-full animate-ping"></div>
            <div className="absolute inset-0 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <Church className="absolute inset-0 m-auto h-6 w-6 text-primary" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">Configurando sua igreja...</p>
        </div>
      </div>
    );
  }

  let daysRemaining = 60;
  if (churchData.trial_end_date) {
    const trialEndDate = new Date(churchData.trial_end_date);
    if (!isNaN(trialEndDate.getTime())) {
      daysRemaining = Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    }
  } else if (churchData.trial_days) {
    daysRemaining = churchData.trial_days;
  }
  if (daysRemaining < 0) daysRemaining = 0;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(churchData.url);
    toast.success('Link copiado!', {
      description: 'URL do seu site copiada para a área de transferência.',
    });
  };

  const handleOpenSite = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      navigate(`/igreja/${churchData.slug}`);
    } else {
      window.open(churchData.url, '_blank');
    }
  };

  const handleGoToDashboard = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
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
            <a href="/#funcionalidades" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Funcionalidades
            </a>
            <a href="/#planos" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Plano
            </a>
            <a href="/#depoimentos" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Depoimentos
            </a>
            <ModeToggle />
            <Button asChild className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20">
              <Link to="/login">Entrar</Link>
            </Button>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <ModeToggle />
            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background px-4 py-4 space-y-3">
            <a href="/#funcionalidades" className="block py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>Funcionalidades</a>
            <a href="/#planos" className="block py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>Plano</a>
            <a href="/#depoimentos" className="block py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>Depoimentos</a>
            <Link to="/login" className="block py-2" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">Entrar</Button>
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background Orbs */}
        <div className="hero-bg-orb absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
        <div className="hero-bg-orb absolute bottom-0 right-0 w-[400px] h-[300px] bg-green-500/10 rounded-full blur-3xl" />

        <div className="container px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20 shadow-sm animate">
              <Zap className="h-4 w-4 text-green-500" />
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                Igreja Criada com Sucesso!
              </span>
            </div>

            <h1 className="hero-title text-4xl md:text-6xl lg:text-7xl font-bold text-primary leading-tight tracking-tight animate">
              🎉 Parabéns! <span className="bg-gradient-to-r from-primary to-green-500 bg-clip-text text-transparent">{churchData.name}</span> Está no Ar!
            </h1>

            <p className="hero-subtitle text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate">
              Sua igreja foi criada com sucesso. Agora é hora de <span className="text-primary font-semibold">personalizar</span>, <span className="text-primary font-semibold">conectar membros</span> e <span className="text-primary font-semibold">transformar vidas</span>.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-card/50 border-y backdrop-blur-sm">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
            {[
              { value: churchData.name, label: 'Nome da Igreja', icon: Church },
              { value: churchData.slug, label: 'Subdomínio', icon: Globe },
              { value: `${daysRemaining} dias`, label: 'Trial Grátis', icon: Calendar },
              { value: 'Essencial', label: 'Plano Ativo', icon: Shield },
            ].map((stat, index) => (
              <div key={index} className="hero-stat text-center group animate">
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-lg md:text-xl font-bold text-primary mb-1 truncate">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Card Principal - URL e Acessos */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* URL do Site */}
            <div className="group border-2 hover:border-primary/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden relative rounded-xl bg-card">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  <Globe className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Seu Site Está No Ar</h3>
                <p className="text-sm text-muted-foreground mb-4">Acesse seu site público agora mesmo</p>
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg mb-4">
                  <p className="text-sm font-mono text-primary break-all">{churchData.url}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCopyUrl} variant="outline" size="sm" className="flex-1">
                    <Copy className="w-4 h-4 mr-2" /> Copiar
                  </Button>
                  <Button onClick={handleOpenSite} size="sm" className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                    <ExternalLink className="w-4 h-4 mr-2" /> Abrir
                  </Button>
                </div>
              </div>
            </div>

            {/* Credenciais */}
            <div className="group border-2 hover:border-primary/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden relative rounded-xl bg-card">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  <Shield className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Credenciais de Acesso</h3>
                <p className="text-sm text-muted-foreground mb-4">Guarde estas informações com segurança</p>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="font-medium">{churchData.admin.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="font-medium">•••••••• (sua senha)</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    💡 <strong>Importante:</strong> Anote sua senha! Você vai precisar dela para acessar o dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Próximos Passos */}
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm font-medium">
              🚀 Próximos Passos
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3">
              Comece a Configurar Sua Igreja
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Em poucos minutos sua igreja estará totalmente configurada
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { step: 1, title: 'Acesse o Dashboard', desc: 'Faça login no painel administrativo', icon: LogIn, color: 'from-blue-500 to-cyan-500' },
              { step: 2, title: 'Personalize', desc: 'Adicione logo, cores e informações', icon: Rocket, color: 'from-purple-500 to-pink-500' },
              { step: 3, title: 'Conecte Membros', desc: 'Cadastre membros e crie cultos', icon: Church, color: 'from-emerald-500 to-green-500' },
            ].map((item, index) => (
              <div key={index} className="relative text-center group">
                <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-primary/10 absolute -top-2 -right-2">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2 text-primary">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 border-t">
            <Button
              onClick={handleGoToDashboard}
              size="lg"
              className="text-lg h-14 px-8 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-xl shadow-blue-600/20 text-white"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Ir para Dashboard
            </Button>
            <Button
              onClick={handleOpenSite}
              size="lg"
              variant="outline"
              className="text-lg h-14 px-8 border-2 hover:bg-primary/5"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Ver Meu Site
            </Button>
          </div>

          {/* Email de Confirmação */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Email de confirmação enviado!
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Enviamos todos os detalhes para <strong>{churchData.admin.email}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <HoverFooter />
    </div>
  );
}
