/**
 * Admin: Planos e Upgrade
 * ============================================
 * Página para pastor solicitar upgrade de plano
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDashboard } from '@/hooks/useDashboard';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/config';
import {
  Crown,
  Check,
  ArrowLeft,
  Mail,
  Phone,
  DollarSign,
  LayoutDashboard,
  Sparkles,
  MessageCircle,
  Clock
} from 'lucide-react';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  recommended?: boolean;
}

export default function Plans() {
  const { church, loading } = useDashboard();
  const navigate = useNavigate();
  const [sendingRequest, setSendingRequest] = useState(false);

  // Planos disponíveis
  const plans: Plan[] = [
    
    {
      name: 'Essencial',
      price: 'R$ 79,90',
      period: '/mês',
      description: 'Para igrejas em crescimento que precisam de mais recursos',
      features: [
        { text: 'Até 200 membros', included: true },
        { text: 'Pedidos de oração ilimitados', included: true },
        { text: 'Até 3 administradores', included: true },
        { text: 'Site público completo', included: true },
        { text: 'Google Maps', included: true },
        { text: 'Modo claro/escuro', included: true },
        { text: 'Upload de logo', included: true },
        { text: 'Suporte prioritário', included: true },
        { text: 'Membros ilimitados', included: false },
        { text: 'Múltiplos administradores (10+)', included: false },
      ],
      recommended: true,
    },
  ];

  // Handler para solicitar upgrade com trial de 30 dias
  const handleRequestUpgrade = async (planName: string) => {
    if (!church) return;

    // Confirmar solicitação
    const confirm = window.confirm(
      `Deseja ativar os 30 dias grátis do plano Essencial?\n\n` +
      `✅ 30 dias de teste grátis\n` +
      `✅ Acesso a todos os recursos do Essencial\n` +
      `✅ Sem compromisso - cancele quando quiser\n\n` +
      `Após 30 dias: R$ 79,90/mês`
    );

    if (!confirm) return;

    setSendingRequest(true);

    try {
      // Solicitar upgrade com trial
      const response = await fetch(buildApiUrl('/api/admin/upgrade/request'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-church-id': church.id.toString(),
        },
        body: JSON.stringify({
          church_id: church.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('🎉 Upgrade ativado com sucesso!', {
          description: `30 dias grátis ativados! Trial encerra em ${result.data.days_remaining} dias.`,
        });

        // Redirecionar para dashboard
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 2000);
      } else {
        throw new Error(result.error || 'Erro ao solicitar upgrade');
      }
    } catch (error) {
      console.error('Error requesting upgrade:', error);

      // Fallback: mostrar dados de contato
      toast.error('Erro ao ativar upgrade', {
        description: 'Entre em contato conosco para ativar manualmente:\n\n📧 Email: wallace.a.santos.wa@gmail.com\n📱 WhatsApp: (92) 98421-3885',
        duration: 15000,
      });
    } finally {
      setSendingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/dashboard')}
          className="gap-2 mb-4 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Voltar ao Dashboard</span>
          <span className="sm:hidden">Voltar</span>
        </Button>

        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          <h1 className="text-2xl sm:text-4xl font-bold">Planos e Preços</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Escolha o plano ideal para sua igreja e tenha acesso a mais recursos
        </p>
      </div>

      {/* Plano Atual */}
      {church && (
        <Alert className="mb-8 bg-blue-50 border-blue-200">
          <Crown className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Plano Atual: {church.plan_type === 'free' ? 'Free' : 'Essencial'}</strong>
            {church.plan_type === 'free' && (
              <p className="mt-1 text-sm">
                Faça upgrade para o plano <strong>Essencial</strong> e desbloqueie todos os recursos!
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Cards de Planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative ${
              plan.recommended
                ? 'border-primary shadow-lg scale-100 sm:scale-105'
                : 'border-border'
            }`}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  <Sparkles className="w-3 h-3 mr-1" />
                  
                </Badge>
              </div>
            )}
            
            {/* Badge de Trial */}
            {plan.name === 'Essencial' && (
              <div className="absolute -top-3 right-1/2 transform translate-x-1/2">
                <Badge className="bg-green-500 text-white">
                  30 dias grátis
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                {plan.name === 'Essencial' ? (
                  <Crown className="w-6 h-6 text-primary" />
                ) : (
                  <LayoutDashboard className="w-6 h-6" />
                )}
                {plan.name}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {plan.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Preço */}
              <div className="text-center">
                <div className="text-4xl font-bold">{plan.price}</div>
                <div className="text-muted-foreground text-sm">{plan.period}</div>
              </div>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className={`flex items-start gap-2 text-sm ${
                      feature.included ? 'text-foreground' : 'text-muted-foreground line-through'
                    }`}
                  >
                    {feature.included ? (
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <span className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0">✕</span>
                    )}
                    {feature.text}
                  </li>
                ))}
              </ul>

              {/* Botão de Ação */}
              {plan.name === 'Free' ? (
                <Button
                  variant="outline"
                  className="w-full"
                  disabled
                  onClick={() => navigate('/admin/dashboard')}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Plano Atual
                </Button>
              ) : (
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={() => handleRequestUpgrade(plan.name)}
                  disabled={sendingRequest || church?.plan_type === 'essencial'}
                >
                  {church?.plan_type === 'essencial' ? (
                    <>
                      <Check className="w-4 h-4" />
                      Plano Atual
                    </>
                  ) : sendingRequest ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enviando Solicitação...
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4" />
                      Solicitar Upgrade
                    </>
                  )}
                </Button>
              )}

              {/* Informações de Pagamento */}
              {plan.name === 'Essencial' && (
                <div className="text-center text-xs text-muted-foreground space-y-1 pt-4 border-t">
                  <div className="flex items-center justify-center gap-2">
                    <DollarSign className="w-3 h-3" />
                    <span>Pagamento via PIX ou Boleto</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="w-3 h-3" />
                    <span>Enviamos a fatura por e-mail</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dúvidas - Contato Inteligente */}
      <Card className="mt-12 max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Precisa de Ajuda?</CardTitle>
          <CardDescription className="text-center">
            Entre em contato conosco para tirar dúvidas sobre os planos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
            <Button
              variant="outline"
              className="h-auto py-4 gap-3 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 border-green-200 min-h-[44px]"
              onClick={() => {
                const message = encodeURIComponent(
                  `Olá! Gostaria de saber mais sobre o plano Essencial.\n\n` +
                  `Igreja: ${church?.name || ''}\n` +
                  `Email: ${church?.email || ''}\n` +
                  `Plano atual: ${church?.plan_type === 'free' ? 'Free' : 'Essencial'}\n` +
                  `Tenho dúvidas sobre upgrade e valores!\n\n` +
                  `Aguardo retorno!`
                );
                window.open(`https://wa.me/5592984213885?message=${message}`, '_blank');
              }}
            >
              <MessageCircle className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <div className="font-semibold text-green-700 dark:text-green-400">WhatsApp</div>
                <div className="text-xs text-green-600 dark:text-green-500">(92) 98421-3885</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 gap-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border-blue-200"
              onClick={() => {
                const subject = encodeURIComponent(`Dúvida sobre planos - ${church?.name || 'Igreja'}`);
                const body = encodeURIComponent(
                  `Olá! Gostaria de tirar dúvidas sobre os planos.\n\n` +
                  `Dados da minha igreja:\n` +
                  `- Nome: ${church?.name || ''}\n` +
                  `- Email: ${church?.email || ''}\n` +
                  `- Plano atual: ${church?.plan_type === 'free' ? 'Free' : 'Essencial'}\n\n` +
                  `Minha dúvida:\n` +
                  `(Escreva sua dúvida aqui)\n\n` +
                  `Aguardo retorno!\n\n` +
                  `Obrigado(a)!`
                );
                window.open(`mailto:wallace.a.santos.wa@gmail.com?subject=${subject}&body=${body}`);
              }}
            >
              <Mail className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <div className="font-semibold text-blue-700 dark:text-blue-400">Email</div>
                <div className="text-xs text-blue-600 dark:text-blue-500">wallace.a.santos.wa@gmail.com</div>
              </div>
            </Button>
          </div>
          
          <div className="text-center text-xs text-muted-foreground p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              <span>⚡ Resposta em até 24 horas úteis</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
