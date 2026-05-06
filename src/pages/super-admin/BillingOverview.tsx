/**
 * Super Admin - Visão Geral Financeira
 * ============================================
 * URL: /super-admin/billing
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Download,
  Calendar,
  CreditCard,
  Building2,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

export default function SuperAdminBilling() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState<any>(null);

  useEffect(() => {
    loadBilling();
  }, []);

  const loadBilling = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/admin/billing/overview', {
        headers: { 'x-user-role': 'super_admin' },
      });
      const result = await response.json();

      if (result.success) {
        setBilling(result.data);
      }
    } catch (error) {
      console.error('Error loading billing:', error);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/billing/export?type=${type}`, {
        headers: { 'x-user-role': 'super_admin' },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Exportado com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao exportar');
    }
  };

  const handleExportPdf = async (type: string) => {
    try {
      const url = `http://localhost:3000/api/admin/billing/export-pdf/${type}`;
      
      // Criar link de download com header
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.setAttribute('download', '');
      
      // Usar fetch com headers e depois criar blob
      const response = await fetch(url, {
        headers: {
          'x-user-role': 'super_admin',
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = `${type}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(blobUrl);
        toast.success('PDF gerado com sucesso!');
      } else {
        toast.error('Erro ao gerar PDF');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Erro ao gerar PDF');
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

  const planColors: Record<string, string> = {
    free: 'bg-gray-500',
    essencial: 'bg-blue-500',
    premium: 'bg-purple-500',
    enterprise: 'bg-amber-500',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" onClick={() => navigate('/super-admin/dashboard')} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">Financeiro</span>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <Button variant="outline" size="sm" onClick={() => handleExport('invoices')}>
              <Download className="w-4 h-4 mr-2" />
              Exportar Faturas (CSV)
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('payments')}>
              <Download className="w-4 h-4 mr-2" />
              Exportar Pagamentos (CSV)
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExportPdf('invoices')}>
              <Download className="w-4 h-4 mr-2" />
              Exportar Faturas (PDF)
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExportPdf('payments')}>
              <Download className="w-4 h-4 mr-2" />
              Exportar Pagamentos (PDF)
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-8">
        {/* MRR e ARR */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MRR (Mensal)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">R$ {billing?.mrr?.toFixed(2) || '0,00'}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Receita recorrente mensal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ARR (Anual)</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">R$ {billing?.arr?.toFixed(2) || '0,00'}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Receita recorrente anual
              </p>
            </CardContent>
          </Card>
        </div>

        {/* MRR por Plano */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              MRR por Plano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {billing?.mrrByPlan && Object.entries(billing.mrrByPlan).map(([plan, data]: [string, any]) => (
                <div key={plan} className="text-center p-4 border rounded-lg">
                  <Badge className={`${planColors[plan]} mb-2`}>
                    {plan.charAt(0).toUpperCase() + plan.slice(1)}
                  </Badge>
                  <div className="text-2xl font-bold">R$ {data.mrr?.toFixed(2) || '0,00'}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {data.active} igrejas ativas
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Inadimplência */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Inadimplência
            </CardTitle>
            <CardDescription>
              {billing?.overdue?.churches || 0} igrejas inadimplentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  R$ {billing?.overdue?.total?.toFixed(2) || '0,00'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total devido</p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  R$ {billing?.overdue?.days30?.toFixed(2) || '0,00'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">30+ dias</p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-700">
                  R$ {billing?.overdue?.days60?.toFixed(2) || '0,00'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">60+ dias</p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-700">
                  R$ {billing?.overdue?.days90?.toFixed(2) || '0,00'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">90+ dias (Cancelar)</p>
              </div>
            </div>

            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => navigate('/super-admin/delinquency')}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Ver Inadimplentes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Crescimento */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Crescimento (Últimos 6 Meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {billing?.growth && billing.growth.length > 0 ? (
              <div className="space-y-4">
                {billing.growth.map((month: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-sm font-semibold">{month.month}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(month.month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{month.new_churches}</span>
                        <span className="text-xs text-muted-foreground">igrejas</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{month.paid_churches}</span>
                        <span className="text-xs text-muted-foreground">pagantes</span>
                      </div>

                      {idx > 0 && (
                        <div className="flex items-center gap-1">
                          {month.new_churches > billing.growth[idx - 1]?.new_churches ? (
                            <ArrowUpRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Nenhum dado de crescimento disponível
              </p>
            )}
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/super-admin/churches')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gerenciar Igrejas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Ver todas as igrejas, editar planos, suspender
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/super-admin/users')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gerenciar Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Ver usuários, resetar senhas, banir
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/super-admin/delinquency')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inadimplência</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Cobrar igrejas inadimplentes
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
