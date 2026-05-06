/**
 * Super Admin - Gestão de Planos
 * ============================================
 * URL: /super-admin/plans
 * 
 * Gerenciar planos da plataforma (Free e Essencial).
 * Permite editar preços, limites e features dinamicamente.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CreditCard,
  DollarSign,
  ChevronLeft,
  Check,
  X,
  Building2,
  TrendingUp,
  Edit,
  Percent,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

interface PlanConfig {
  plan_slug: string;
  plan_name: string;
  price_monthly: number;
  price_yearly: number;
  price_monthly_original: number;
  price_yearly_original: number;
  price_monthly_final: number;
  price_yearly_final: number;
  discount_percentage: number;
  max_members: number;
  max_admins: number;
  max_events: number;
  max_prayers: number;
  has_email_support: boolean;
  has_priority_support: boolean;
  has_custom_domain: boolean;
  has_analytics: boolean;
  is_active: boolean;
  is_featured: boolean;
  churches_count: number;
}

export default function SuperAdminPlans() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [planConfigs, setPlanConfigs] = useState<PlanConfig[]>([]);
  const [editingPlan, setEditingPlan] = useState<PlanConfig | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    plan_name: '',
    price_monthly: 0,
    price_yearly: 0,
    discount_percentage: 0,
    max_members: 0,
    max_admins: 0,
    max_events: 0,
    max_prayers: 0,
    has_email_support: false,
    has_priority_support: false,
    has_custom_domain: false,
    has_analytics: false,
    is_featured: false,
  });

  useEffect(() => {
    loadPlanConfigs();
  }, []);

  const loadPlanConfigs = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/admin/plan-settings', {
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        setPlanConfigs(result.data);
      }
    } catch (error) {
      console.error('Error loading plan configs:', error);
      toast.error('Erro ao carregar configurações dos planos');
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (plan: PlanConfig) => {
    setEditingPlan(plan);
    setFormData({
      plan_name: plan.plan_name,
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      discount_percentage: plan.discount_percentage || 0,
      max_members: plan.max_members,
      max_admins: plan.max_admins,
      max_events: plan.max_events,
      max_prayers: plan.max_prayers,
      has_email_support: !!plan.has_email_support,
      has_priority_support: !!plan.has_priority_support,
      has_custom_domain: !!plan.has_custom_domain,
      has_analytics: !!plan.has_analytics,
      is_featured: !!plan.is_featured,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!editingPlan) return;

    try {
      const response = await fetch(`http://localhost:3000/api/admin/plan-settings/${editingPlan.plan_slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Configurações atualizadas com sucesso!');
        setIsDialogOpen(false);
        loadPlanConfigs();
      } else {
        toast.error(result.error || 'Erro ao atualizar configurações');
      }
    } catch (error) {
      console.error('Error saving plan settings:', error);
      toast.error('Erro ao salvar configurações');
    }
  };

  const applyQuickDiscount = async (planSlug: string, discount: number) => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/plan-settings/apply-discount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify({
          plan_slug: planSlug,
          discount_percentage: discount,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Desconto de ${discount}% aplicado!`);
        loadPlanConfigs();
      } else {
        toast.error(result.error || 'Erro ao aplicar desconto');
      }
    } catch (error) {
      console.error('Error applying discount:', error);
      toast.error('Erro ao aplicar desconto');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDiscountedPrice = (original: number, discount: number) => {
    if (discount <= 0) return formatCurrency(original);
    const discounted = original * (1 - discount / 100);
    return formatCurrency(discounted);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/super-admin/dashboard')}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Gestão de Planos</h1>
          <p className="text-muted-foreground">Configure preços, limites e recursos de cada plano</p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <CreditCard className="h-10 w-10 text-blue-600 dark:text-blue-400 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Painel de Configuração de Planos
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Aqui você pode <strong>editar preços, limites e recursos</strong> de cada plano dinamicamente.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => applyQuickDiscount('essencial', 10)}>
                  <Percent className="h-3 w-3 mr-1" />
                  10% OFF Essencial
                </Button>
                <Button size="sm" variant="outline" onClick={() => applyQuickDiscount('essencial', 20)}>
                  <Percent className="h-3 w-3 mr-1" />
                  20% OFF Essencial
                </Button>
                <Button size="sm" variant="outline" onClick={() => applyQuickDiscount('essencial', 0)}>
                  <X className="h-3 w-3 mr-1" />
                  Remover Desconto
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Igrejas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {planConfigs.reduce((acc, plan) => acc + plan.churches_count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Em todos os planos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(planConfigs.reduce((acc, plan) => 
                acc + (plan.price_monthly_final * plan.churches_count), 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              MRR (Monthly Recurring Revenue)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planos Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {planConfigs.filter(p => p.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Planos disponíveis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Planos */}
      <Card>
        <CardHeader>
          <CardTitle>Planos Configurados</CardTitle>
          <CardDescription>
            Clique em editar para modificar preços, limites e recursos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              Carregando configurações...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Plano</TableHead>
                  <TableHead className="w-48">Preço Mensal</TableHead>
                  <TableHead className="w-48">Preço Anual</TableHead>
                  <TableHead className="w-24">Desconto</TableHead>
                  <TableHead className="w-24">Membros</TableHead>
                  <TableHead className="w-24">Igrejas</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planConfigs.map((plan) => (
                  <TableRow key={plan.plan_slug}>
                    <TableCell>
                      <div className="font-semibold">{plan.plan_name}</div>
                      <div className="text-xs text-muted-foreground">{plan.plan_slug}</div>
                    </TableCell>
                    <TableCell>
                      {plan.price_monthly > 0 ? (
                        <div>
                          {plan.discount_percentage > 0 && (
                            <div className="text-xs line-through text-muted-foreground">
                              {formatCurrency(plan.price_monthly)}
                            </div>
                          )}
                          <div className="font-medium text-green-600">
                            {formatDiscountedPrice(plan.price_monthly, plan.discount_percentage)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-green-600 font-medium">Grátis</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {plan.price_yearly > 0 ? (
                        <div>
                          {plan.discount_percentage > 0 && (
                            <div className="text-xs line-through text-muted-foreground">
                              {formatCurrency(plan.price_yearly)}
                            </div>
                          )}
                          <div className="font-medium text-green-600">
                            {formatDiscountedPrice(plan.price_yearly, plan.discount_percentage)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {plan.discount_percentage > 0 ? (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          {plan.discount_percentage}% OFF
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{plan.max_members}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <Building2 className="h-3 w-3" />
                        {plan.churches_count}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {plan.is_active ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(plan)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Editar Plano - {editingPlan?.plan_name}
            </DialogTitle>
            <DialogDescription>
              Modifique preços, limites e recursos do plano
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Preços */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                <h4 className="font-semibold">Preços</h4>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price_monthly">Preço Mensal (R$)</Label>
                  <Input
                    id="price_monthly"
                    type="number"
                    step="0.01"
                    value={formData.price_monthly}
                    onChange={(e) => setFormData({ ...formData, price_monthly: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="price_yearly">Preço Anual (R$)</Label>
                  <Input
                    id="price_yearly"
                    type="number"
                    step="0.01"
                    value={formData.price_yearly}
                    onChange={(e) => setFormData({ ...formData, price_yearly: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="discount_percentage">Desconto (%)</Label>
                  <Input
                    id="discount_percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData({ ...formData, discount_percentage: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {formData.discount_percentage > 0 && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-sm font-medium text-green-900 dark:text-green-100">
                    Preço com desconto aplicado:
                  </div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    Mensal: {formatDiscountedPrice(formData.price_monthly, formData.discount_percentage)} |
                    Anual: {formatDiscountedPrice(formData.price_yearly, formData.discount_percentage)}
                  </div>
                </div>
              )}
            </div>

            {/* Limites */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <h4 className="font-semibold">Limites</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="max_members">Máx. Membros</Label>
                  <Input
                    id="max_members"
                    type="number"
                    value={formData.max_members}
                    onChange={(e) => setFormData({ ...formData, max_members: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="max_admins">Máx. Admins</Label>
                  <Input
                    id="max_admins"
                    type="number"
                    value={formData.max_admins}
                    onChange={(e) => setFormData({ ...formData, max_admins: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="max_events">Máx. Eventos</Label>
                  <Input
                    id="max_events"
                    type="number"
                    value={formData.max_events}
                    onChange={(e) => setFormData({ ...formData, max_events: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="max_prayers">Máx. Pedidos de Oração</Label>
                  <Input
                    id="max_prayers"
                    type="number"
                    value={formData.max_prayers}
                    onChange={(e) => setFormData({ ...formData, max_prayers: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            {/* Recursos */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                <h4 className="font-semibold">Recursos Inclusos</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="has_email_support" className="flex-1 cursor-pointer">
                    <div className="font-medium">Suporte por Email</div>
                    <div className="text-xs text-muted-foreground">Atendimento via email</div>
                  </Label>
                  <Switch
                    id="has_email_support"
                    checked={formData.has_email_support}
                    onCheckedChange={(checked) => setFormData({ ...formData, has_email_support: checked })}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="has_priority_support" className="flex-1 cursor-pointer">
                    <div className="font-medium">Suporte Prioritário</div>
                    <div className="text-xs text-muted-foreground">Atendimento prioritário</div>
                  </Label>
                  <Switch
                    id="has_priority_support"
                    checked={formData.has_priority_support}
                    onCheckedChange={(checked) => setFormData({ ...formData, has_priority_support: checked })}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="has_custom_domain" className="flex-1 cursor-pointer">
                    <div className="font-medium">Domínio Personalizado</div>
                    <div className="text-xs text-muted-foreground">Usar domínio próprio</div>
                  </Label>
                  <Switch
                    id="has_custom_domain"
                    checked={formData.has_custom_domain}
                    onCheckedChange={(checked) => setFormData({ ...formData, has_custom_domain: checked })}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                  <Label htmlFor="has_analytics" className="flex-1 cursor-pointer">
                    <div className="font-medium">Analytics Avançado</div>
                    <div className="text-xs text-muted-foreground">Estatísticas detalhadas</div>
                  </Label>
                  <Switch
                    id="has_analytics"
                    checked={formData.has_analytics}
                    onCheckedChange={(checked) => setFormData({ ...formData, has_analytics: checked })}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="gap-2">
              <Save className="h-4 w-4" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
