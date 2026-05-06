/**
 * Super Admin - Controle de Inadimplência
 * ============================================
 * Gerenciar igrejas inadimplentes
 * Acesso: /super-admin/delinquency
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertCircle,
  DollarSign,
  Calendar,
  Mail,
  Phone,
  Ban,
  XCircle,
  CheckCircle,
  ArrowLeft,
  Filter,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function SuperAdminDelinquency() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [delinquentChurches, setDelinquentChurches] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedChurch, setSelectedChurch] = useState(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState(''); // 'reminder', 'suspend', 'cancel'
  const [message, setMessage] = useState('');

  // Carregar dados
  useEffect(() => {
    loadDelinquencyData();
  }, [filter]);

  const loadDelinquencyData = async () => {
    try {
      setLoading(true);

      // Buscar estatísticas
      const statsRes = await fetch('http://localhost:3000/api/admin/delinquency/stats', {
        headers: { 'x-user-role': 'super_admin' },
      });
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Buscar lista de inadimplentes
      const churchesRes = await fetch(`http://localhost:3000/api/admin/delinquency?status=${filter}`, {
        headers: { 'x-user-role': 'super_admin' },
      });
      const churchesData = await churchesRes.json();
      if (churchesData.success) {
        setDelinquentChurches(churchesData.data.churches);
      }
    } catch (error) {
      console.error('Error loading delinquency data:', error);
      toast.error('Erro ao carregar dados', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/delinquency/${selectedChurch.id}/send-reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify({
          message,
          subscriptionId: selectedChurch.subscription_id,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Lembrete enviado!', {
          description: result.message,
        });
        setShowActionDialog(false);
        setMessage('');
        loadDelinquencyData();
      }
    } catch (error) {
      toast.error('Erro ao enviar lembrete', {
        description: error.message,
      });
    }
  };

  const handleSuspend = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/delinquency/${selectedChurch.id}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify({
          reason: message,
          subscriptionId: selectedChurch.subscription_id,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Igreja suspensa!', {
          description: result.message,
        });
        setShowActionDialog(false);
        setMessage('');
        loadDelinquencyData();
      }
    } catch (error) {
      toast.error('Erro ao suspender igreja', {
        description: error.message,
      });
    }
  };

  const handleCancel = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/delinquency/${selectedChurch.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify({
          reason: 'non_payment',
          subscriptionId: selectedChurch.subscription_id,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Assinatura cancelada!', {
          description: result.message,
        });
        setShowActionDialog(false);
        setMessage('');
        loadDelinquencyData();
      }
    } catch (error) {
      toast.error('Erro ao cancelar assinatura', {
        description: error.message,
      });
    }
  };

  const openActionDialog = (church, type) => {
    setSelectedChurch(church);
    setActionType(type);
    setShowActionDialog(true);
    
    // Mensagem padrão baseada na ação
    if (type === 'reminder') {
      setMessage(`Olá ${church.name}, notamos que seu pagamento está atrasado há ${church.days_overdue} dias. Por favor, regularize sua situação para evitar interrupção no serviço.`);
    } else if (type === 'suspend') {
      setMessage(`Igreja suspensa devido a ${church.days_overdue} dias de atraso no pagamento.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando inadimplência...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/super-admin/dashboard')} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-primary">Controle de Inadimplência</span>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Header da Página */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Igrejas Inadimplentes</h1>
          <p className="text-muted-foreground">
            Gerencie cobranças, suspensões e cancelamentos
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inadimplentes</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.byDays.days30 || 0} com 30+ dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {(stats?.amount.total || 0).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                R$ {(stats?.amount.days30 || 0).toFixed(2)} (30+ dias)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">60+ Dias</CardTitle>
              <Ban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.byDays.days60 || 0}</div>
              <p className="text-xs text-muted-foreground">
                R$ {(stats?.amount.days60 || 0).toFixed(2)} devido
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">90+ Dias</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.byDays.days90 || 0}</div>
              <p className="text-xs text-muted-foreground">
                R$ {(stats?.amount.days90 || 0).toFixed(2)} - Cancelar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Inadimplência</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.rate || 0}%</div>
              <p className="text-xs text-muted-foreground">
                Meta: &lt;5%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Todos
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending')}
              >
                Pendentes
              </Button>
              <Button
                variant={filter === 'overdue' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('overdue')}
              >
                Atrasados
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Igrejas Inadimplentes */}
        <Card>
          <CardHeader>
            <CardTitle>Igrejas Inadimplentes ({delinquentChurches.length})</CardTitle>
            <CardDescription>
              {filter === 'all' ? 'Todas as igrejas' : filter === 'pending' ? 'Pagamentos pendentes' : 'Pagamentos atrasados'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {delinquentChurches.length > 0 ? (
              <div className="space-y-4">
                {delinquentChurches.map((church) => (
                  <div
                    key={church.id}
                    className={`p-4 border rounded-lg ${
                      church.days_overdue >= 90 ? 'bg-red-50 dark:bg-red-900/20 border-red-200' :
                      church.days_overdue >= 60 ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200' :
                      church.days_overdue >= 30 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200' :
                      'bg-background'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{church.name}</h3>
                          <Badge className={
                            church.plan_type === 'enterprise' ? 'bg-amber-500' :
                            church.plan_type === 'premium' ? 'bg-purple-500' :
                            'bg-blue-500'
                          }>
                            {church.plan_type}
                          </Badge>
                          {church.days_overdue >= 90 && (
                            <Badge variant="destructive">90+ dias</Badge>
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span>{church.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{church.phone || 'Não informado'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>Vencimento: {new Date(church.due_date).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold">R$ {parseFloat(church.amount).toFixed(2)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            <strong className="text-red-600">{church.days_overdue} dias</strong> de atraso
                          </span>
                          <span className="text-muted-foreground">
                            Notas de cobrança: <strong>{church.collection_notes_count || 0}</strong>
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openActionDialog(church, 'reminder')}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Cobrar
                        </Button>
                        {church.days_overdue >= 30 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openActionDialog(church, 'suspend')}
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            Suspender
                          </Button>
                        )}
                        {church.days_overdue >= 60 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openActionDialog(church, 'cancel')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <p className="text-lg font-semibold">Nenhuma igreja inadimplente!</p>
                <p className="text-muted-foreground">
                  Todos os pagamentos estão em dia.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Ações */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'reminder' && '📧 Enviar Lembrete de Pagamento'}
              {actionType === 'suspend' && '⚠️ Suspender Igreja'}
              {actionType === 'cancel' && '❌ Cancelar Assinatura'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'reminder' && 'Envie um lembrete de pagamento para a igreja'}
              {actionType === 'suspend' && 'Suspenda o acesso da igreja por inadimplência'}
              {actionType === 'cancel' && 'Cancele a assinatura da igreja permanentemente'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedChurch && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-semibold">{selectedChurch.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedChurch.days_overdue} dias de atraso - R$ {parseFloat(selectedChurch.amount).toFixed(2)}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  placeholder="Digite a mensagem..."
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>
              Cancelar
            </Button>
            {actionType === 'reminder' && (
              <Button onClick={handleSendReminder}>
                <Mail className="w-4 h-4 mr-2" />
                Enviar Lembrete
              </Button>
            )}
            {actionType === 'suspend' && (
              <Button onClick={handleSuspend} variant="destructive">
                <Ban className="w-4 h-4 mr-2" />
                Suspender Igreja
              </Button>
            )}
            {actionType === 'cancel' && (
              <Button onClick={handleCancel} variant="destructive">
                <XCircle className="w-4 h-4 mr-2" />
                Cancelar Assinatura
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
