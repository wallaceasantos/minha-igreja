/**
 * Super Admin - Mudar Plano da Igreja
 * ============================================
 * URL: /super-admin/churches/:id/plans
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  CreditCard,
  CheckCircle,
  Crown,
  Building2,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/config';

export default function SuperAdminChurchPlans() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [church, setChurch] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadChurch();
  }, [id]);

  const loadChurch = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl(`/api/admin/churches/${id}`), {
        headers: { 'x-user-role': 'super_admin' },
      });
      const result = await response.json();

      if (result.success) {
        setChurch(result.data);
        setSelectedPlan(result.data.plan_type);
      }
    } catch (error) {
      toast.error('Erro ao carregar igreja');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async () => {
    try {
      setSaving(true);
      const response = await fetch(buildApiUrl(`/api/admin/churches/${id}/plans`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify({ plan_type: selectedPlan, reason }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Plano alterado para ${selectedPlan} com sucesso!`);
        navigate(`/super-admin/churches/${id}`);
      }
    } catch (error) {
      toast.error('Erro ao mudar plano');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 'Grátis',
      description: 'Para igrejas iniciantes',
      features: ['50 membros', '20 pedidos/mês', '1 admin', 'Subdomínio'],
      color: 'bg-gray-500',
    },
    {
      id: 'essencial',
      name: 'Essencial',
      price: 'R$ 149,90/mês',
      description: 'Para igrejas em crescimento',
      features: ['200 membros', 'Pedidos ILIMITADOS', '3 admins', 'Domínio próprio', 'Logo', 'Analytics'],
      color: 'bg-blue-500',
      popular: true,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'R$ 99,90/mês',
      description: 'Para igrejas estabelecidas',
      features: ['1000 membros', 'Admins ILIMITADOS', 'Dízimos PIX', 'PWA', 'Priority support'],
      color: 'bg-purple-500',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'R$ 299,90/mês',
      description: 'Para grandes organizações',
      features: ['Tudo ILIMITADO', 'Multi-unidades', 'API', 'Gerente dedicado', 'White-label'],
      color: 'bg-amber-500',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" onClick={() => navigate(`/super-admin/churches/${id}`)} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">Mudar Plano</span>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-8">
        {/* Info da Igreja */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {church?.name}
            </CardTitle>
            <CardDescription>
              Plano atual: <Badge className={
                church?.plan_type === 'enterprise' ? 'bg-amber-500' :
                church?.plan_type === 'premium' ? 'bg-purple-500' :
                church?.plan_type === 'essencial' ? 'bg-blue-500' : 'bg-gray-500'
              }>{church?.plan_type?.charAt(0).toUpperCase() + church?.plan_type?.slice(1)}</Badge>
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Planos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedPlan === plan.id ? 'ring-2 ring-primary ring-offset-2' : ''
              } ${plan.popular ? 'border-2 border-primary' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <CardHeader>
                {plan.popular && (
                  <Badge className="absolute top-2 right-2">
                    <Crown className="w-3 h-3 mr-1" />
                    Mais Popular
                  </Badge>
                )}
                <div className={`w-12 h-12 rounded-full ${plan.color} flex items-center justify-center mb-4`}>
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-4">{plan.price}</div>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Motivo */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Motivo da Mudança</CardTitle>
            <CardDescription>
              Opcional: Adicione um motivo para esta mudança de plano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Ex: Upgrade solicitado pelo cliente, Promoção, Correção de plano..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate(`/super-admin/churches/${id}`)}>
            Cancelar
          </Button>

          <Button onClick={handleChangePlan} disabled={saving || selectedPlan === church?.plan_type}>
            {saving ? 'Salvando...' : 'Confirmar Mudança de Plano'}
          </Button>
        </div>
      </div>
    </div>
  );
}
