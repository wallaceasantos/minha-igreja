/**
 * Admin: Pedidos de Oração
 * CRUD completo de pedidos de oração
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Heart,
  Search,
  CheckCircle,
  Clock,
  Archive,
  Filter,
  ArrowLeft,
  Eye,
  FileText,
  Calendar,
  Crown,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDashboard } from '@/hooks/useDashboard';
import { buildApiUrl } from '@/lib/config';

interface Pedido {
  id: number;
  nome: string | null;
  email: string | null;
  titulo: string | null;
  oracao: string;
  pedido_atendido: number;
  status: 'pending' | 'answered' | 'archived';
  answer: string | null;
  created_at: string;
  updated_at: string;
}

interface PedidoStats {
  total: number;
  pending: number;
  answered: number;
  archived: number;
  atendidos: number;
}

// Limites por plano
const PLAN_LIMITS = {
  free: { prayers: 20 },
  essencial: { prayers: -1 },
};

export default function Pedidos() {
  const navigate = useNavigate();
  const { church } = useDashboard();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [stats, setStats] = useState<PedidoStats>({ total: 0, pending: 0, answered: 0, archived: 0, atendidos: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'answered' | 'archived'>('all');
  const [viewingPedido, setViewingPedido] = useState<Pedido | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [showOldPendingOnly, setShowOldPendingOnly] = useState(false);

  // Verificar filtro na URL (para link do dashboard)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('filter') === 'old') {
      setShowOldPendingOnly(true);
      setStatusFilter('pending');
    }
  }, []);

  // Verificar se está no plano Essencial e calcular limite
  const plan = church?.plan_type || 'essencial';
  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
  const prayerPercent = limits.prayers > 0 ? Math.min((stats.total / limits.prayers) * 100, 100) : 0;
  const isNearLimit = limits.prayers > 0 && (stats.total / limits.prayers) >= 0.8;
  const isLimitReached = limits.prayers > 0 && stats.total >= limits.prayers;

  useEffect(() => {
    loadPedidos();
    loadStats();
  }, [statusFilter]);

  const loadPedidos = async () => {
    try {
      const churchId = localStorage.getItem('churchId');
      let response;
      let result;

      // Se for para mostrar apenas pedidos antigos (> 7 dias)
      if (showOldPendingOnly) {
        response = await fetch(buildApiUrl(`/api/pedidos/old-pending?church_id=${churchId}`));
        result = await response.json();
        if (result.success) {
          setPedidos(result.data);
        }
      } else {
        const params = new URLSearchParams({
          church_id: churchId || ''
        });

        if (statusFilter !== 'all') {
          params.append('status', statusFilter);
        }

        response = await fetch(buildApiUrl(`/api/pedidos?${params}`));
        result = await response.json();

        if (result.success) {
          setPedidos(result.data);
        }
      }
    } catch (error) {
      console.error('Error loading pedidos:', error);
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const churchId = localStorage.getItem('churchId');
      const response = await fetch(buildApiUrl(`/api/pedidos/stats/overview?church_id=${churchId}`));
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleToggleAtendido = async (pedido: Pedido) => {
    try {
      const churchId = localStorage.getItem('churchId');
      const response = await fetch(buildApiUrl(`/api/pedidos/${pedido.id}?church_id=${churchId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: pedido.titulo,
          oracao: pedido.oracao,
          status: pedido.status,
          pedido_atendido: !pedido.pedido_atendido,
          answer: pedido.answer
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(pedido.pedido_atendido ? 'Pedido desmarcado!' : 'Pedido atendido!');
        loadPedidos();
        loadStats();
      }
    } catch (error) {
      console.error('Error toggling atendido:', error);
      toast.error('Erro ao atualizar');
    }
  };

  const handleMarkAsAnswered = async (pedido: Pedido) => {
    try {
      const churchId = localStorage.getItem('churchId');
      const response = await fetch(buildApiUrl(`/api/pedidos/${pedido.id}?church_id=${churchId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: pedido.titulo,
          oracao: pedido.oracao,
          status: 'answered',
          pedido_atendido: pedido.pedido_atendido,
          answer: pedido.answer
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Pedido marcado como respondido!');
        loadPedidos();
        loadStats();
      }
    } catch (error) {
      console.error('Error marking as answered:', error);
      toast.error('Erro ao marcar como respondido');
    }
  };

  const handleArchive = async (pedido: Pedido) => {
    if (!confirm('Tem certeza que deseja arquivar este pedido?')) return;
    
    try {
      const churchId = localStorage.getItem('churchId');
      const response = await fetch(buildApiUrl(`/api/pedidos/${pedido.id}?church_id=${churchId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: pedido.titulo,
          oracao: pedido.oracao,
          status: 'archived',
          pedido_atendido: pedido.pedido_atendido,
          answer: pedido.answer
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Pedido arquivado!');
        loadPedidos();
        loadStats();
      }
    } catch (error) {
      console.error('Error archiving:', error);
      toast.error('Erro ao arquivar pedido');
    }
  };

  const handleViewPedido = (pedido: Pedido) => {
    setViewingPedido(pedido);
    setViewDialogOpen(true);
  };

  // Abrir WhatsApp para responder pedido
  const handleWhatsAppResponse = (pedido: Pedido) => {
    const phone = prompt('Digite o número de WhatsApp (com DDD):', '5592988551819');
    if (!phone) return;

    const message = `Olá! Recebemos seu pedido de oração: "${pedido.titulo || 'Sem título'}". Vamos orar por você! 🙏`;
    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
      pending: { label: 'Pendente', icon: Clock, color: 'bg-amber-500' },
      answered: { label: 'Respondido', icon: CheckCircle, color: 'bg-green-500' },
      archived: { label: 'Arquivado', icon: Archive, color: 'bg-gray-500' }
    };
    const config = statusConfig[status] || { label: status, icon: Clock, color: 'bg-gray-500' };
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="container px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/eventos')}
            className="gap-2"
          >
            <Calendar className="w-4 h-4" />
            Eventos
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">📝 Pedidos de Oração</h1>
          <p className="text-muted-foreground">
            Gerencie os pedidos de oração da igreja
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Pedidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Aguardando</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Respondidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.answered}</div>
            <p className="text-xs text-muted-foreground">Respondidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Arquivados</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.archived}</div>
            <p className="text-xs text-muted-foreground">Arquivados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atendidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.atendidos}</div>
            <p className="text-xs text-muted-foreground">Pedidos atendidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerta de Limite de Pedidos (Plano Essencial) */}
      {limits.prayers > 0 && (
        <Alert className={`mb-6 ${isLimitReached ? 'bg-red-50 border-red-200' : isNearLimit ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
          <Crown className={`h-4 w-4 ${isLimitReached ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-blue-600'}`} />
          <AlertDescription className={isLimitReached ? 'text-red-800' : isNearLimit ? 'text-amber-800' : 'text-blue-800'}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <strong>
                  {isLimitReached ? 'Limite de pedidos atingido!' : isNearLimit ? 'Limite de pedidos se aproximando!' : 'Limite de pedidos'}
                </strong>
                <p className="mt-1 text-sm">
                  {isLimitReached 
                    ? `Você atingiu o limite de ${limits.prayers} pedidos por mês do plano Essencial.` 
                    : isNearLimit 
                      ? `Você já usou ${stats.total} de ${limits.prayers} pedidos este mês.` 
                      : `Você usou ${stats.total} de ${limits.prayers} pedidos este mês.`}
                </p>
              </div>
              {!isLimitReached && (
                <div className="text-right">
                  <span className="text-2xl font-bold">{stats.total}/{limits.prayers}</span>
                </div>
              )}
            </div>
            <Progress value={prayerPercent} className={`h-2 ${isLimitReached ? 'bg-red-200' : isNearLimit ? 'bg-amber-200' : 'bg-blue-200'}`} />
            {isLimitReached && (
              <div className="mt-3">
                <p className="text-sm mb-2">
                  Para enviar pedidos de oração ilimitados, faça upgrade para o plano <strong>Essencial</strong> ou superior.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin/plans')}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Ver Planos
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          {/* Alerta de Pedidos Antigos */}
          {showOldPendingOnly && (
            <Alert className="mb-4 bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>🕐 Pedidos Pendentes Antigos:</strong> Mostrando apenas pedidos com mais de 7 dias pendentes.
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    setShowOldPendingOnly(false);
                    setStatusFilter('all');
                  }}
                  className="ml-2 text-amber-700 underline"
                >
                  Ver todos os pedidos
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && loadPedidos()}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={loadPedidos}>
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendentes</option>
                <option value="answered">Respondidos</option>
                <option value="archived">Arquivados</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pedidos Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos de Oração</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Carregando pedidos...</p>
            </div>
          ) : pedidos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum pedido de oração</p>
              <p className="text-sm mt-2">
                Comece cadastrando o primeiro pedido
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Oração</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Atendido</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell className="font-medium">
                      {pedido.titulo || 'Sem título'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {pedido.oracao.substring(0, 50)}...
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(pedido.status)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={pedido.pedido_atendido ? 'default' : 'secondary'}>
                        {pedido.pedido_atendido ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Sim
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Não
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(pedido.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPedido(pedido)}
                          title="Ver detalhes completos"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {pedido.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsAnswered(pedido)}
                            title="Marcar como respondido"
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleAtendido(pedido)}
                          title={pedido.pedido_atendido ? 'Desmarcar como atendido' : 'Marcar como atendido'}
                        >
                          {pedido.pedido_atendido ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </Button>
                        {pedido.status !== 'archived' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleArchive(pedido)}
                            title="Arquivar pedido"
                          >
                            <Archive className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Visualização */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Pedido de Oração #{viewingPedido?.id}
            </DialogTitle>
            <DialogDescription>
              {viewingPedido && new Date(viewingPedido.created_at).toLocaleString('pt-BR')}
            </DialogDescription>
          </DialogHeader>
          {viewingPedido && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Nome</p>
                  <p className="text-sm text-muted-foreground">{viewingPedido.nome || 'Anônimo'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{viewingPedido.email || 'Não informado'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Título</p>
                <p className="text-sm">{viewingPedido.titulo || 'Sem título'}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Oração Completa</p>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{viewingPedido.oracao}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <div className="mt-1">{getStatusBadge(viewingPedido.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium">Atendido</p>
                  <div className="mt-1">
                    <Badge variant={viewingPedido.pedido_atendido ? 'default' : 'secondary'}>
                      {viewingPedido.pedido_atendido ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Sim
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Não
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
              {viewingPedido.answer && (
                <div>
                  <p className="text-sm font-medium mb-2">Resposta do Pastor</p>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{viewingPedido.answer}</p>
                  </div>
                </div>
              )}
              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleWhatsAppResponse(viewingPedido)}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Responder no WhatsApp
                </Button>
                {viewingPedido.status === 'pending' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleMarkAsAnswered(viewingPedido);
                      setViewDialogOpen(false);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar como Respondido
                  </Button>
                )}
                {viewingPedido.status !== 'archived' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleArchive(viewingPedido);
                      setViewDialogOpen(false);
                    }}
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Arquivar
                  </Button>
                )}
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
