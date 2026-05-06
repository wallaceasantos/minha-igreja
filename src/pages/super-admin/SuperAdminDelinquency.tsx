/**
 * Super Admin - Igrejas Inadimplentes
 * ============================================
 * URL: /super-admin/delinquency
 * 
 * Política "Firme mas Justa":
 * - Dia 0  → Email de vencimento
 * - Dia 3  → WhatsApp amigável
 * - Dia 7  → Ligação humana
 * - Dia 14 → Email "Atenção"
 * - Dia 21 → Suspensão PARCIAL
 * - Dia 30 → Ligação formal
 * - Dia 31 → Suspensão TOTAL
 * - Dia 45 → Email "Última chance"
 * - Dia 60 → Notificação cancelamento
 * - Dia 90 → Cancelamento
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertCircle,
  DollarSign,
  TrendingUp,
  Calendar,
  Mail,
  MessageCircle,
  Phone,
  Lock,
  Unlock,
  Trash2,
  Eye,
  History,
  ArrowLeft,
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/config';

interface DelinquentChurch {
  id: number;
  name: string;
  email: string;
  phone: string;
  slug: string;
  plan_type: string;
  billing_status: string;
  days_overdue: number;
  monthly_amount: number;
  partial_suspension_date: string;
  total_suspension_date: string;
  cancellation_notice_date: string;
  action_required: string;
  risk_level: string;
}

interface BillingStats {
  totalDelinquent: number;
  total30Plus: number;
  total60Plus: number;
  total90Plus: number;
  totalAmount: number;
  amount30Plus: number;
  amount60Plus: number;
  amount90Plus: number;
  delinquencyRate: number;
  totalChurches: number;
}

export default function SuperAdminDelinquency() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [churches, setChurches] = useState<DelinquentChurch[]>([]);
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selectedChurch, setSelectedChurch] = useState<DelinquentChurch | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);

  useEffect(() => {
    loadDelinquency();
  }, []);

  const loadDelinquency = async () => {
    try {
      setLoading(true);
      await Promise.all([loadChurches(), loadStats()]);
    } catch (error) {
      console.error('Error loading delinquency:', error);
      toast.error('Erro ao carregar dados de inadimplência');
    } finally {
      setLoading(false);
    }
  };

  const loadChurches = async () => {
    try {
      const response = await fetch(buildApiUrl('/api/admin/billing/delinquent'), {
        headers: { 'x-user-role': 'super_admin' },
      });
      const result = await response.json();

      if (result.success) {
        setChurches(result.data);
      }
    } catch (error) {
      console.error('Error loading churches:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(buildApiUrl('/api/admin/billing/stats'), {
        headers: { 'x-user-role': 'super_admin' },
      });
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDelinquency();
    setRefreshing(false);
    toast.success('Dados atualizados!');
  };

  const handleSendEmail = async (churchId: number, churchName: string, emailType: string) => {
    try {
      const response = await fetch(buildApiUrl('/api/admin/billing/send-email'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify({
          church_id: churchId,
          email_type: emailType,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Email enviado para ${churchName}!`);
      } else {
        toast.error(result.error || 'Erro ao enviar email');
      }
    } catch (error) {
      toast.error('Erro ao enviar email');
    }
  };

  const handleSendWhatsApp = async (churchId: number, churchName: string) => {
    try {
      const response = await fetch(buildApiUrl('/api/admin/billing/send-whatsapp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify({ church_id: churchId }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`WhatsApp enviado para ${churchName}!`);
      } else {
        toast.error(result.error || 'Erro ao enviar WhatsApp');
      }
    } catch (error) {
      toast.error('Erro ao enviar WhatsApp');
    }
  };

  const handleRegisterCall = async (churchId: number, churchName: string) => {
    try {
      const response = await fetch(buildApiUrl('/api/admin/billing/register-call'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify({
          church_id: churchId,
          notes: 'Ligação registrada manualmente',
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Ligação registrada para ${churchName}!`);
      }
    } catch (error) {
      toast.error('Erro ao registrar ligação');
    }
  };

  const handleSuspend = async (churchId: number, churchName: string, type: 'partial' | 'total') => {
    if (!confirm(`Tem certeza que deseja ${type === 'partial' ? 'suspender parcialmente' : 'suspender totalmente'} a igreja ${churchName}?`)) {
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`/api/admin/billing/suspend`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify({
          church_id: churchId,
          suspension_type: type,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`${churchName} ${type === 'partial' ? 'suspensa parcialmente' : 'suspensa totalmente'}!`);
        loadDelinquency();
      } else {
        toast.error(result.error || 'Erro ao suspender');
      }
    } catch (error) {
      toast.error('Erro ao suspender igreja');
    }
  };

  const handleCancel = async (churchId: number, churchName: string) => {
    if (!confirm(`⚠️ ATENÇÃO: Tem certeza que deseja CANCELAR a igreja ${churchName}?\n\nEsta ação é irreversível e todos os dados serão apagados (exceto backup).`)) {
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`/api/admin/billing/cancel`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify({ church_id: churchId }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`${churchName} cancelada com sucesso!`);
        loadDelinquency();
      } else {
        toast.error(result.error || 'Erro ao cancelar');
      }
    } catch (error) {
      toast.error('Erro ao cancelar igreja');
    }
  };

  const handleViewHistory = async (churchId: number) => {
    try {
      const response = await fetch(buildApiUrl(`/api/admin/billing/${churchId}/history`), {
        headers: { 'x-user-role': 'super_admin' },
      });
      const result = await response.json();

      if (result.success) {
        setBillingHistory(result.data);
        setHistoryDialogOpen(true);
      }
    } catch (error) {
      toast.error('Erro ao carregar histórico');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Igreja', 'Email', 'Telefone', 'Plano', 'Status', 'Dias Atraso', 'Valor', 'Ação Requerida'].join(','),
      ...filteredChurches.map(church => [
        church.name,
        church.email,
        church.phone,
        church.plan_type,
        church.billing_status,
        church.days_overdue,
        Number(church.monthly_amount).toFixed(2),
        church.action_required
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inadimplentes-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Exportado com sucesso!');
  };

  const getRiskColor = (riskLevel: string) => {
    const colors: Record<string, string> = {
      '🟢': 'text-green-600 bg-green-50',
      '🟡': 'text-yellow-600 bg-yellow-50',
      '🟠': 'text-orange-600 bg-orange-50',
      '🔴': 'text-red-600 bg-red-50',
    };
    return colors[riskLevel] || 'text-gray-600 bg-gray-50';
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      current: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      partial_suspended: 'bg-orange-100 text-orange-800',
      total_suspended: 'bg-red-100 text-red-800',
      cancellation_pending: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      current: 'Em dia',
      warning: 'Atenção',
      partial_suspended: 'Suspenso Parcial',
      total_suspended: 'Suspenso Total',
      cancellation_pending: 'Cancelamento Pendente',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  const filteredChurches = churches.filter(church => {
    const matchesSearch = church.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         church.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || church.billing_status === statusFilter;
    const matchesRisk = riskFilter === 'all' || 
                       (riskFilter === 'high' && church.days_overdue >= 30) ||
                       (riskFilter === 'medium' && church.days_overdue >= 15 && church.days_overdue < 30) ||
                       (riskFilter === 'low' && church.days_overdue < 15);
    return matchesSearch && matchesStatus && matchesRisk;
  });

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
            <AlertCircle className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">Igrejas Inadimplentes</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inadimplentes</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalDelinquent || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.total30Plus || 0} com 30+ dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {Number(stats?.totalAmount || 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                R$ {Number(stats?.amount30Plus || 0).toFixed(2)} (30+ dias)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">60+ Dias</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total60Plus || 0}</div>
              <p className="text-xs text-muted-foreground">
                R$ {Number(stats?.amount60Plus || 0).toFixed(2)} devido
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">90+ Dias</CardTitle>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total90Plus || 0}</div>
              <p className="text-xs text-muted-foreground">
                R$ {Number(stats?.amount90Plus || 0).toFixed(2)} - Cancelar
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Taxa de Inadimplência */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Saúde Financeira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Inadimplência</p>
                <p className={`text-2xl font-bold ${
                  (stats?.delinquencyRate || 0) > 10 ? 'text-red-600' :
                  (stats?.delinquencyRate || 0) > 5 ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {Number(stats?.delinquencyRate || 0).toFixed(2)}%
                </p>
                <p className="text-xs text-muted-foreground">Meta: &lt;5%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Igrejas Ativas</p>
                <p className="text-2xl font-bold">{stats?.totalChurches || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receita em Risco</p>
                <p className="text-2xl font-bold text-orange-600">
                  R$ {Number(stats?.totalAmount || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="warning">Atenção</SelectItem>
                  <SelectItem value="partial_suspended">Suspenso Parcial</SelectItem>
                  <SelectItem value="total_suspended">Suspenso Total</SelectItem>
                  <SelectItem value="cancellation_pending">Cancelamento Pendente</SelectItem>
                </SelectContent>
              </Select>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Risco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Riscos</SelectItem>
                  <SelectItem value="high">Alto (30+ dias)</SelectItem>
                  <SelectItem value="medium">Médio (15-29 dias)</SelectItem>
                  <SelectItem value="low">Baixo (&lt;15 dias)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Igrejas */}
        <Card>
          <CardHeader>
            <CardTitle>
              Igrejas Inadimplentes ({filteredChurches.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Igreja</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dias Atraso</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Risco</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChurches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhuma igreja inadimplente encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredChurches.map((church) => (
                    <TableRow key={church.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{church.name}</p>
                          <p className="text-sm text-muted-foreground">{church.email}</p>
                          {church.phone && (
                            <p className="text-sm text-muted-foreground">{church.phone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{church.plan_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(church.billing_status)}>
                          {getStatusLabel(church.billing_status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={
                          church.days_overdue >= 90 ? 'text-red-600 font-bold' :
                          church.days_overdue >= 60 ? 'text-red-600' :
                          church.days_overdue >= 30 ? 'text-orange-600' :
                          church.days_overdue >= 15 ? 'text-yellow-600' : 'text-green-600'
                        }>
                          {church.days_overdue} dias
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          R$ {Number(church.monthly_amount).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRiskColor(church.risk_level)}>
                          {church.risk_level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedChurch(church)}
                              >
                                <Mail className="w-3 h-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Enviar Email</DialogTitle>
                                <DialogDescription>
                                  {church.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex flex-col gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    handleSendEmail(church.id, church.name, 'vencimento');
                                  }}
                                >
                                  📧 Email de Vencimento
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    handleSendEmail(church.id, church.name, 'amigavel');
                                  }}
                                >
                                  😊 Email Amigável
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    handleSendEmail(church.id, church.name, 'atencao');
                                  }}
                                >
                                  ⚠️ Email "Atenção"
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    handleSendEmail(church.id, church.name, 'ultima_chance');
                                  }}
                                >
                                  🔴 Última Chance
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendWhatsApp(church.id, church.name)}
                          >
                            <MessageCircle className="w-3 h-3" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRegisterCall(church.id, church.name)}
                          >
                            <Phone className="w-3 h-3" />
                          </Button>

                          {church.days_overdue >= 21 && church.billing_status !== 'partial_suspended' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuspend(church.id, church.name, 'partial')}
                              className="text-orange-600"
                            >
                              <Lock className="w-3 h-3" />
                            </Button>
                          )}

                          {church.days_overdue >= 31 && church.billing_status !== 'total_suspended' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuspend(church.id, church.name, 'total')}
                              className="text-red-600"
                            >
                              <Lock className="w-3 h-3" />
                            </Button>
                          )}

                          {church.days_overdue >= 90 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancel(church.id, church.name)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewHistory(church.id)}
                          >
                            <History className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog de Histórico */}
        <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Histórico de Cobranças</DialogTitle>
              <DialogDescription>
                {selectedChurch?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              {billingHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum histórico registrado
                </p>
              ) : (
                <div className="space-y-2">
                  {billingHistory.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{item.action_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString('pt-BR')}
                        </p>
                        {item.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{item.notes}</p>
                        )}
                      </div>
                      <Badge
                        variant={item.status === 'completed' ? 'default' : 'secondary'}
                        className={
                          item.status === 'completed' ? 'bg-green-100 text-green-800' :
                          item.status === 'failed' ? 'bg-red-100 text-red-800' : ''
                        }
                      >
                        {item.status === 'completed' ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : item.status === 'failed' ? (
                          <XCircle className="w-3 h-3 mr-1" />
                        ) : null}
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
