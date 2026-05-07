/**
 * Super Admin Dashboard
 * ============================================
 * Dashboard do administrador da plataforma
 * Acesso: /super-admin/dashboard
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Building2,
  DollarSign,
  LogOut,
  Settings,
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Shield,
  CreditCard,
  Ticket,
  Megaphone,
  BarChart3,
  Lock,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/config';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [revenue, setRevenue] = useState<any>(null);
  const [recentChurches, setRecentChurches] = useState<any[]>([]);
  const [trialsEnding, setTrialsEnding] = useState<any[]>([]);

  // Carregar dados do dashboard
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar estatísticas
      const statsRes = await fetch(buildApiUrl('/api/admin/stats'), {
        headers: {
          'x-user-role': 'super_admin',
        },
      });
      const statsData = await statsRes.json();
      console.log('Stats:', statsData);
      if (statsData.success) {
        setStats(statsData.data);
      } else {
        console.error('Stats error:', statsData.error);
      }

      // Buscar receita
      const revenueRes = await fetch(buildApiUrl('/api/admin/revenue'), {
        headers: {
          'x-user-role': 'super_admin',
        },
      });
      const revenueData = await revenueRes.json();
      if (revenueData.success) {
        setRevenue(revenueData.data);
      }

      // Buscar igrejas recentes
      const churchesRes = await fetch(buildApiUrl('/api/admin/recent-churches?limit=5'), {
        headers: {
          'x-user-role': 'super_admin',
        },
      });
      const churchesData = await churchesRes.json();
      if (churchesData.success) {
        setRecentChurches(churchesData.data);
      }

      // Buscar trials acabando
      const trialsRes = await fetch(buildApiUrl('/api/admin/trials-ending?days=7'), {
        headers: {
          'x-user-role': 'super_admin',
        },
      });
      const trialsData = await trialsRes.json();
      if (trialsData.success) {
        setTrialsEnding(trialsData.data);
      }
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      setError(error.message || 'Erro ao carregar dados');
      toast.error('Erro ao carregar dados', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/login');
    toast.success('Logout realizado com sucesso!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Erro ao carregar dashboard</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate('/login')}>
            <LogOut className="w-4 h-4 mr-2" />
            Voltar para Login
          </Button>
        </div>
      </div>
    );
  }

  const planColors = {
    free: 'bg-gray-500',
    essencial: 'bg-blue-500',
    premium: 'bg-purple-500',
    enterprise: 'bg-amber-500',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4 py-4">
          {/* Primeira linha - Logo e Título */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">MinhaIgreja</h1>
                <Badge variant="secondary" className="text-xs font-normal hidden sm:inline-flex">
                  Super Admin
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4 sm:hidden" />
                <LogOut className="w-4 h-4 hidden sm:inline" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>

          {/* Segunda linha - Navegação (Scroll horizontal no mobile) */}
          <nav className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible gap-2 scrollbar-hide">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/super-admin/billing')}
              className="gap-2 hover:bg-primary/10 hover:border-primary/50 flex-shrink-0"
            >
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Financeiro</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/super-admin/delinquency')}
              className="gap-2 hover:bg-primary/10 hover:border-primary/50 flex-shrink-0"
            >
              <AlertCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Inadimplência</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/super-admin/domains')}
              className="gap-2 hover:bg-primary/10 hover:border-primary/50 flex-shrink-0"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Domínios</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/super-admin/churches')}
              className="gap-2 hover:bg-primary/10 hover:border-primary/50 flex-shrink-0"
            >
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Igrejas</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/super-admin/users')}
              className="gap-2 hover:bg-primary/10 hover:border-primary/50 flex-shrink-0"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Usuários</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/super-admin/audit-logs')}
              className="gap-2 hover:bg-primary/10 hover:border-primary/50 flex-shrink-0"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Auditoria</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/super-admin/security')}
              className="gap-2 hover:bg-primary/10 hover:border-primary/50 flex-shrink-0"
            >
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Segurança</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/super-admin/tickets')}
              className="gap-2 hover:bg-primary/10 hover:border-primary/50 flex-shrink-0"
            >
              <Ticket className="w-4 h-4" />
              <span className="hidden sm:inline">Tickets</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/super-admin/announcements')}
              className="gap-2 hover:bg-primary/10 hover:border-primary/50 flex-shrink-0"
            >
              <Megaphone className="w-4 h-4" />
              <span className="hidden sm:inline">Comunicados</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/super-admin/reports')}
              className="gap-2 hover:bg-primary/10 hover:border-primary/50 flex-shrink-0"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/super-admin/plans')}
              className="gap-2 hover:bg-primary/10 hover:border-primary/50 flex-shrink-0"
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Planos</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/super-admin/settings')}
              className="gap-2 hover:bg-primary/10 hover:border-primary/50 flex-shrink-0"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Configurações</span>
            </Button>
          </nav>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header do Dashboard */}
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Dashboard da Plataforma</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Visão geral do MinhaIgreja
          </p>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total de Igrejas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Igrejas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.churches.total || 0}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span>{stats?.churches.active || 0} ativas</span>
              </div>
            </CardContent>
          </Card>

          {/* Total de Usuários */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.users.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.members.total || 0} membros em todas igrejas
              </p>
            </CardContent>
          </Card>

          {/* MRR (Monthly Recurring Revenue) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Mensal (MRR)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {revenue ? `R$ ${revenue.mrr.toFixed(2)}` : 'R$ 0,00'}
              </div>
              <p className="text-xs text-muted-foreground">
                {revenue ? `R$ ${revenue.arr.toFixed(2)}` : 'R$ 0,00'} anual
              </p>
            </CardContent>
          </Card>

          {/* Pedidos de Oração */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos de Oração</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.prayers.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total em todas igrejas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Distribuição de Planos */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Distribuição de Planos</CardTitle>
            <CardDescription>
              Igrejas ativas por tipo de plano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {stats?.plans && Object.entries(stats.plans).map(([plan, data]: [string, any]) => (
                <div key={plan} className="text-center p-3 sm:p-4 border rounded-lg">
                  <Badge className={`${planColors[plan as keyof typeof planColors]} mb-2 text-xs`}>
                    {plan.charAt(0).toUpperCase() + plan.slice(1)}
                  </Badge>
                  <div className="text-xl sm:text-2xl font-bold">{(data as any).active}</div>
                  <p className="text-xs text-muted-foreground">
                    {(data as any).total} total
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Grid: Igrejas Recentes e Trials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Últimas Igrejas Criadas */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Últimas Igrejas Criadas</CardTitle>
                  <CardDescription>
                    As 5 igrejas mais recentes na plataforma
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/super-admin/churches')}>
                  Ver Todas
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentChurches.length > 0 ? (
                  recentChurches.map((church) => (
                    <div key={church.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg gap-2">
                      <div>
                        <p className="font-semibold text-sm sm:text-base">{church.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {church.slug}.plataforma.ccjv.com.br
                        </p>
                      </div>
                      <div className="text-right w-full sm:w-auto">
                        <Badge className={planColors[church.plan_type as keyof typeof planColors]} variant="outline">
                          {church.plan_type}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {new Date(church.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhuma igreja encontrada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Trials Acabando */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    Trials Acabando
                  </CardTitle>
                  <CardDescription>
                    Igrejas com trial acabando em 7 dias
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trialsEnding.length > 0 ? (
                  trialsEnding.map((church) => (
                    <div key={church.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-lg bg-amber-50 dark:bg-amber-900/20 gap-2">
                      <div>
                        <p className="font-semibold text-sm sm:text-base">{church.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {church.email}
                        </p>
                      </div>
                      <div className="text-right w-full sm:w-auto">
                        <Badge variant="outline" className="text-amber-600 border-amber-600">
                          <Clock className="w-3 h-3 mr-1" />
                          {church.days_remaining} dias
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(church.trial_end_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum trial acabando nos próximos 7 dias
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
