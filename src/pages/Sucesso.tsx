/**
 * Página: Sucesso - Igreja Criada
 * ============================================
 * Mostrada após criar uma nova igreja
 */

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Copy,
  ExternalLink,
  LogIn,
  Globe,
  Mail,
  Calendar,
  CreditCard,
  ArrowRight,
  Shield,
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

  useEffect(() => {
    // Pegar dados do state (vem do CreateChurch)
    const data = location.state?.churchData;

    if (!data) {
      // Se não tem dados, redireciona para home
      toast.error('Nenhuma igreja encontrada', {
        description: 'Redirecionando para a página inicial...',
      });
      setTimeout(() => navigate('/'), 2000);
      return;
    }

    setChurchData(data);

    // Fazer login automático
    localStorage.setItem('isAdminAuthenticated', 'true');
    localStorage.setItem('churchId', String(data.church_id));
    
    // Verificar se admin existe antes de acessar email
    if (data.admin && data.admin.email) {
      localStorage.setItem('adminEmail', data.admin.email);
    } else if (data.email) {
      // Fallback para email da igreja
      localStorage.setItem('adminEmail', data.email);
    }

    toast.success('Login realizado automaticamente!', {
      description: 'Bem-vindo ao MinhaIgreja!',
    });
  }, [location, navigate]);

  if (!churchData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Calcular dias de trial
  let daysRemaining = 30; // Valor padrão
  
  if (churchData.trial_end_date) {
    const trialEndDate = new Date(churchData.trial_end_date);
    if (!isNaN(trialEndDate.getTime())) {
      daysRemaining = Math.ceil(
        (trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
    }
  } else if (churchData.trial_days) {
    daysRemaining = churchData.trial_days;
  }
  
  // Garantir que não seja negativo
  if (daysRemaining < 0) daysRemaining = 0;

  // Plano formatado
  const planNames: Record<string, string> = {
    free: 'Free',
    essencial: 'Essencial',
    premium: 'Premium',
    enterprise: 'Enterprise',
  };

  const planColors: Record<string, string> = {
    free: 'bg-gray-500',
    essencial: 'bg-blue-500',
    premium: 'bg-purple-500',
    enterprise: 'bg-amber-500',
  };

  // Copiar URL
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(churchData.url);
    toast.success('Link copiado!', {
      description: 'URL do seu site copiada para a área de transferência.',
    });
  };

  // Abrir site em nova aba
  const handleOpenSite = () => {
    // Em localhost, usa a página de preview
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      navigate(`/church/${churchData.slug}`);
    } else {
      // Em produção, abre o subdomínio real
      window.open(churchData.url, '_blank');
    }
  };

  // Ir para dashboard
  const handleGoToDashboard = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">MinhaIgreja</span>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Card de Sucesso */}
          <Card className="mb-8 border-2 border-green-500 shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-500" />
              </div>
              <CardTitle className="text-3xl">🎉 Parabéns! Sua Igreja Está no Ar!</CardTitle>
              <CardDescription className="text-lg mt-2">
                {churchData.name} foi criada com sucesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informações da Igreja */}
              <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Nome da Igreja</p>
                  <p className="font-semibold text-lg">{churchData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Subdomínio</p>
                  <p className="font-semibold text-lg">{churchData.slug}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Plano</p>
                  <Badge className={planColors[churchData.plan_type]}>
                    {planNames[churchData.plan_type]}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Período de Trial</p>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <Calendar className="w-3 h-3 mr-1" />
                    {daysRemaining} dias grátis
                  </Badge>
                </div>
              </div>

              {/* URL do Site */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Seu Site Está Acessível Em:</h3>
                </div>
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-lg font-mono text-primary mb-3 break-all">
                    {churchData.url}
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={handleCopyUrl} variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Link
                    </Button>
                    <Button onClick={handleOpenSite} variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Abrir Site
                    </Button>
                  </div>
                </div>
              </div>

              {/* Dados do Administrador */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">🔐 Credenciais de Acesso:</h3>
                </div>
                <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <Mail className="w-3 h-3 inline mr-1" />
                        Email
                      </p>
                      <p className="font-semibold text-base">{churchData.admin.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <CheckCircle className="w-3 h-3 inline mr-1" />
                        Senha
                      </p>
                      <p className="font-semibold text-base">•••••••• (a que você cadastrou)</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-primary/20">
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>Importante:</strong> Anote sua senha! Você vai precisar dela para acessar o dashboard.
                    </p>
                  </div>
                </div>
              </div>

              {/* Próximos Passos */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Próximos Passos:</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { icon: LogIn, text: 'Fazer login no dashboard', done: false },
                    { icon: CheckCircle, text: 'Configurar sua igreja (logo, cores, etc.)', done: false },
                    { icon: CheckCircle, text: 'Adicionar membros', done: false },
                    { icon: CheckCircle, text: 'Criar primeiros cultos', done: false },
                    { icon: CreditCard, text: 'Ativar pagamento (após 30 dias)', done: false },
                  ].map((step, index) => (
                    <Card key={index} className={step.done ? 'bg-green-50 dark:bg-green-900/10' : ''}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          step.done ? 'bg-green-500' : 'bg-primary/20'
                        }`}>
                          {step.done ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <step.icon className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <p className={`text-sm ${step.done ? 'text-green-700 dark:text-green-300 line-through' : ''}`}>
                          {step.text}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button
                  onClick={handleGoToDashboard}
                  size="lg"
                  className="flex-1 text-lg h-14 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Ir para Dashboard
                </Button>
                <Button
                  onClick={handleOpenSite}
                  size="lg"
                  variant="outline"
                  className="flex-1 text-lg h-14"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Ver Meu Site
                </Button>
              </div>

              {/* Email de Confirmação */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
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
            </CardContent>
          </Card>

          {/* Dica */}
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground text-center">
                💡 <strong>Dica:</strong> Você pode acessar seu dashboard a qualquer momento em{' '}
                <strong>{churchData.admin_url}</strong> usando seu email e senha.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
