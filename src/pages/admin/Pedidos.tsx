/**
 * Admin: Pedidos de Oração
 * CRUD completo de pedidos de oração com UX profissional
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  AlertCircle,
  MoreHorizontal,
  Trash2,
  RefreshCw,
  X,
  Check,
  CalendarDays,
  User,
  Mail,
  MessageSquare
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { cn } from '@/lib/utils';

interface Pedido {
  id: number;
  church_id: number;
  tipo: 'pedido' | 'agradecimento';
  nome: string | null;
  email: string | null;
  categoria: string | null;
  tema: string | null;
  privacidade: 'public' | 'private';
  titulo: string | null;
  oracao: string;
  pedido_atendido: number;
  status: 'pending' | 'answered' | 'archived';
  created_by: number | null;
  updated_at: string;
  last_reminder_at: string | null;
  created_at: string;
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

type StatusFilter = 'all' | 'pending' | 'answered' | 'archived';

export default function Pedidos() {
  const navigate = useNavigate();
  const { church } = useDashboard();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [stats, setStats] = useState<PedidoStats>({ 
    total: 0, 
    pending: 0, 
    answered: 0, 
    archived: 0, 
    atendidos: 0 
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewingPedido, setViewingPedido] = useState<Pedido | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [answerDialogOpen, setAnswerDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verificar filtro na URL (para link do dashboard)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('filter') === 'old') {
      setStatusFilter('pending');
    }
  }, []);

  // Verificar se está no plano Essencial e calcular limite
  const plan = church?.plan_type || 'essencial';
  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
  const prayerPercent = limits.prayers > 0 ? Math.min((stats.total / limits.prayers) * 100, 100) : 0;
  const isNearLimit = limits.prayers > 0 && (stats.total / limits.prayers) >= 0.8;
  const isLimitReached = limits.prayers > 0 && stats.total >= limits.prayers;

  // Carregar dados quando o filtro mudar
  useEffect(() => {
    loadPedidos();
    loadStats();
  }, [statusFilter]);

  const loadPedidos = async () => {
    try {
      setLoading(true);
      const churchId = localStorage.getItem('churchId');
      
      const params = new URLSearchParams({
        church_id: churchId || ''
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(buildApiUrl(`/api/pedidos?${params}`));
      const result = await response.json();

      if (result.success) {
        setPedidos(result.data);
      } else {
        toast.error('Erro ao carregar pedidos');
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
      setIsSubmitting(true);
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
        toast.success(pedido.pedido_atendido ? 'Pedido desmarcado como atendido!' : 'Pedido marcado como atendido!');
        await Promise.all([loadPedidos(), loadStats()]);
      } else {
        toast.error('Erro ao atualizar pedido');
      }
    } catch (error) {
      console.error('Error toggling atendido:', error);
      toast.error('Erro ao atualizar pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsAnswered = async (pedido: Pedido) => {
    try {
      setIsSubmitting(true);
      const churchId = localStorage.getItem('churchId');
      const response = await fetch(buildApiUrl(`/api/pedidos/${pedido.id}?church_id=${churchId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: pedido.titulo,
          oracao: pedido.oracao,
          status: 'answered',
          pedido_atendido: pedido.pedido_atendido
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Pedido marcado como respondido!');
        setAnswerDialogOpen(false);
        await Promise.all([loadPedidos(), loadStats()]);
      } else {
        toast.error('Erro ao marcar como respondido');
      }
    } catch (error) {
      console.error('Error marking as answered:', error);
      toast.error('Erro ao marcar como respondido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async (pedido: Pedido) => {
    try {
      setIsSubmitting(true);
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
        toast.success('Pedido arquivado com sucesso!');
        await Promise.all([loadPedidos(), loadStats()]);
      } else {
        toast.error('Erro ao arquivar pedido');
      }
    } catch (error) {
      console.error('Error archiving:', error);
      toast.error('Erro ao arquivar pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (pedido: Pedido) => {
    if (!confirm('Tem certeza que deseja excluir este pedido permanentemente? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setIsSubmitting(true);
      const churchId = localStorage.getItem('churchId');
      const response = await fetch(buildApiUrl(`/api/pedidos/${pedido.id}?church_id=${churchId}`), {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Pedido excluído com sucesso!');
        setViewDialogOpen(false);
        await Promise.all([loadPedidos(), loadStats()]);
      } else {
        toast.error('Erro ao excluir pedido');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Erro ao excluir pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewPedido = (pedido: Pedido) => {
    setViewingPedido(pedido);
    setViewDialogOpen(true);
  };

  const openAnswerDialog = (pedido: Pedido) => {
    setViewingPedido(pedido);
    setAnswerDialogOpen(true);
  };

  const submitAnswer = async () => {
    if (!viewingPedido) return;
    await handleMarkAsAnswered(viewingPedido);
  };

  // Abrir WhatsApp para responder pedido
  const handleWhatsAppResponse = (pedido: Pedido) => {
    const phone = prompt('Digite o número de WhatsApp (com DDD):', '5592988551819');
    if (!phone) return;

    const message = `Olá! Recebemos seu pedido de oração: "${pedido.titulo || 'Sem título'}". Vamos orar por você! 🙏`;
    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Função para calcular dias desde a criação
  const getDaysSince = (dateString: string) => {
    const created = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Verificar se pedido é antigo (> 7 dias)
  const isOldPending = (pedido: Pedido) => {
    return pedido.status === 'pending' && getDaysSince(pedido.created_at) > 7;
  };

  // Filtrar pedidos localmente pelo termo de busca
  const filteredPedidos = useMemo(() => {
    if (!searchTerm.trim()) return pedidos;
    const term = searchTerm.toLowerCase();
    return pedidos.filter(p => 
      (p.titulo?.toLowerCase().includes(term)) ||
      (p.oracao?.toLowerCase().includes(term)) ||
      (p.nome?.toLowerCase().includes(term)) ||
      (p.email?.toLowerCase().includes(term))
    );
  }, [pedidos, searchTerm]);

  // Configurações de status
  const statusConfig = {
    pending: { 
      label: 'Pendente', 
      icon: Clock, 
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    answered: { 
      label: 'Respondido', 
      icon: CheckCircle, 
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    archived: { 
      label: 'Arquivado', 
      icon: Archive, 
      color: 'bg-gray-500',
      textColor: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    }
  };

  // Configurações de tipo
  const tipoConfig = {
    pedido: { label: 'Pedido', color: 'bg-blue-100 text-blue-800' },
    agradecimento: { label: 'Agradecimento', color: 'bg-green-100 text-green-800' }
  };

  // Configurações de privacidade
  const privacidadeConfig = {
    public: { label: 'Público', icon: '👁️' },
    private: { label: 'Privado', icon: '🔒' }
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge className={cn(config.color, "text-white font-medium")}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  // Tabs configuration
  const tabs = [
    { value: 'all', label: 'Todos', count: stats.total, icon: Filter },
    { value: 'pending', label: 'Pendentes', count: stats.pending, icon: Clock },
    { value: 'answered', label: 'Respondidos', count: stats.answered, icon: CheckCircle },
    { value: 'archived', label: 'Arquivados', count: stats.archived, icon: Archive },
  ] as const;

  return (
    <div className="container px-4 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
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
          <h1 className="text-3xl font-bold">Pedidos de Oração</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os pedidos de oração da igreja
          </p>
        </div>
        <Button onClick={loadPedidos} variant="outline" className="gap-2">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total</CardTitle>
            <Heart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
            <p className="text-xs text-blue-700">Pedidos cadastrados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-900">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{stats.pending}</div>
            <p className="text-xs text-amber-700">Aguardando resposta</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Respondidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats.answered}</div>
            <p className="text-xs text-green-700">Com resposta</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900">Arquivados</CardTitle>
            <Archive className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-700">{stats.archived}</div>
            <p className="text-xs text-gray-700">Arquivados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Atendidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{stats.atendidos}</div>
            <p className="text-xs text-purple-700">Pedidos atendidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerta de Limite de Pedidos (Plano Essencial) */}
      {limits.prayers > 0 && (
        <Alert className={cn(
          "mb-6",
          isLimitReached ? 'bg-red-50 border-red-200' : 
          isNearLimit ? 'bg-amber-50 border-amber-200' : 
          'bg-blue-50 border-blue-200'
        )}>
          <Crown className={cn(
            "h-4 w-4",
            isLimitReached ? 'text-red-600' : 
            isNearLimit ? 'text-amber-600' : 
            'text-blue-600'
          )} />
          <AlertDescription className={cn(
            isLimitReached ? 'text-red-800' : 
            isNearLimit ? 'text-amber-800' : 
            'text-blue-800'
          )}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <strong>
                  {isLimitReached ? 'Limite de pedidos atingido!' : 
                   isNearLimit ? 'Limite de pedidos se aproximando!' : 
                   'Limite de pedidos'}
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
            <Progress value={prayerPercent} className={cn(
              "h-2",
              isLimitReached ? 'bg-red-200' : 
              isNearLimit ? 'bg-amber-200' : 
              'bg-blue-200'
            )} />
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

      {/* Tabs e Busca */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Tabs de Status */}
            <Tabs 
              value={statusFilter} 
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
              className="w-full md:w-auto"
            >
              <TabsList className="grid grid-cols-4 md:flex md:w-auto">
                {tabs.map((tab) => (
                  <TabsTrigger 
                    key={tab.value} 
                    value={tab.value}
                    className="gap-2 px-3 md:px-4"
                  >
                    <tab.icon className="w-4 h-4 md:hidden" />
                    <span className="hidden md:inline">{tab.label}</span>
                    <span className="md:hidden text-xs">{tab.label.substring(0, 4)}</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {tab.count}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, oração, nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pedidos - Desktop (Tabela) */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Lista de Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Carregando pedidos...</p>
            </div>
          ) : filteredPedidos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum pedido encontrado</p>
              <p className="text-sm mt-1">
                {searchTerm ? 'Tente ajustar sua busca' : 'Não há pedidos nesta categoria'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pedido</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Atendido</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPedidos.map((pedido) => {
                    const isOld = isOldPending(pedido);
                    const config = statusConfig[pedido.status];
                    
                    return (
                      <TableRow 
                        key={pedido.id}
                        className={cn(
                          isOld && "bg-amber-50/50",
                          pedido.status === 'archived' && "opacity-60"
                        )}
                      >
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium line-clamp-1">
                                {pedido.titulo || pedido.tema || 'Sem título'}
                              </p>
                              {isOld && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  {getDaysSince(pedido.created_at)} dias
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {pedido.oracao.substring(0, 60)}...
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              {/* Tipo */}
                              <Badge className={cn("text-xs", tipoConfig[pedido.tipo]?.color || 'bg-gray-100')}>
                                {tipoConfig[pedido.tipo]?.label || pedido.tipo}
                              </Badge>
                              {/* Categoria */}
                              {pedido.categoria && (
                                <Badge variant="outline" className="text-xs">
                                  {pedido.categoria}
                                </Badge>
                              )}
                              {/* Tema */}
                              {pedido.tema && !pedido.titulo?.includes(pedido.tema) && (
                                <span className="text-muted-foreground">• {pedido.tema}</span>
                              )}
                              {/* Privacidade */}
                              <span className="text-muted-foreground">
                                {privacidadeConfig[pedido.privacidade]?.icon}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <User className="w-3 h-3" />
                              {pedido.nome || 'Anônimo'}
                              {pedido.email && (
                                <>
                                  <span className="mx-1">•</span>
                                  <Mail className="w-3 h-3" />
                                  {pedido.email}
                                </>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(pedido.status)}
                        </TableCell>
                        <TableCell>
                          {pedido.pedido_atendido ? (
                            <Badge className="bg-green-500 text-white">
                              <Check className="w-3 h-3 mr-1" />
                              Sim
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <X className="w-3 h-3 mr-1" />
                              Não
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <CalendarDays className="w-4 h-4" />
                            {new Date(pedido.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewPedido(pedido)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver detalhes
                              </DropdownMenuItem>
                              {pedido.status === 'pending' && (
                                <DropdownMenuItem onClick={() => openAnswerDialog(pedido)}>
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  Adicionar resposta
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleToggleAtendido(pedido)}>
                                {pedido.pedido_atendido ? (
                                  <>
                                    <X className="w-4 h-4 mr-2" />
                                    Desmarcar atendido
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-4 h-4 mr-2 text-green-600" />
                                    Marcar atendido
                                  </>
                                )}
                              </DropdownMenuItem>
                              {pedido.status !== 'archived' && (
                                <DropdownMenuItem onClick={() => handleArchive(pedido)}>
                                  <Archive className="w-4 h-4 mr-2" />
                                  Arquivar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleDelete(pedido)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Pedidos - Mobile (Cards) */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando pedidos...</p>
          </div>
        ) : filteredPedidos.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhum pedido encontrado</p>
              <p className="text-sm mt-1">
                {searchTerm ? 'Tente ajustar sua busca' : 'Não há pedidos nesta categoria'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPedidos.map((pedido) => {
            const isOld = isOldPending(pedido);
            const config = statusConfig[pedido.status];
            
            return (
              <Card 
                key={pedido.id}
                className={cn(
                  "overflow-hidden",
                  isOld && "border-amber-300 bg-amber-50/30",
                  pedido.status === 'archived' && "opacity-70"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold line-clamp-1">
                          {pedido.titulo || 'Sem título'}
                        </h3>
                        {isOld && (
                          <Badge variant="destructive" className="text-xs shrink-0">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {getDaysSince(pedido.created_at)}d
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        {pedido.nome || 'Anônimo'}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(pedido.status)}
                      {pedido.pedido_atendido && (
                        <Badge className="bg-green-500 text-white text-xs">
                          <Check className="w-3 h-3 mr-1" />
                          Atendido
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {pedido.oracao}
                  </p>
                  
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {new Date(pedido.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewPedido(pedido)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {pedido.status === 'pending' && !pedido.pedido_atendido && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleToggleAtendido(pedido)}
                          className="text-green-600"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewPedido(pedido)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver detalhes
                          </DropdownMenuItem>
                          {pedido.status === 'pending' && (
                            <DropdownMenuItem onClick={() => openAnswerDialog(pedido)}>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Responder
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleToggleAtendido(pedido)}>
                            {pedido.pedido_atendido ? 'Desmarcar atendido' : 'Marcar atendido'}
                          </DropdownMenuItem>
                          {pedido.status !== 'archived' && (
                            <DropdownMenuItem onClick={() => handleArchive(pedido)}>
                              <Archive className="w-4 h-4 mr-2" />
                              Arquivar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDelete(pedido)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Dialog de Visualização */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {getStatusBadge(viewingPedido.status)}
                {viewingPedido.pedido_atendido && (
                  <Badge className="bg-green-500 text-white">
                    <Check className="w-3 h-3 mr-1" />
                    Pedido Atendido
                  </Badge>
                )}
                {isOldPending(viewingPedido) && (
                  <Badge variant="destructive">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Pendente há {getDaysSince(viewingPedido.created_at)} dias
                  </Badge>
                )}
              </div>

              {/* Informações do solicitante */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Nome
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {viewingPedido.nome || 'Anônimo'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    Email
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {viewingPedido.email || 'Não informado'}
                  </p>
                </div>
              </div>

              {/* Detalhes do Pedido */}
              <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Tipo</p>
                  <Badge className={cn("mt-1", tipoConfig[viewingPedido.tipo]?.color || 'bg-gray-100')}>
                    {tipoConfig[viewingPedido.tipo]?.label || viewingPedido.tipo}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Categoria</p>
                  <p className="text-sm text-muted-foreground">
                    {viewingPedido.categoria || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Tema</p>
                  <p className="text-sm text-muted-foreground">
                    {viewingPedido.tema || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Privacidade</p>
                  <p className="text-sm text-muted-foreground">
                    {privacidadeConfig[viewingPedido.privacidade]?.icon} {privacidadeConfig[viewingPedido.privacidade]?.label}
                  </p>
                </div>
              </div>

              {/* Título */}
              <div>
                <p className="text-sm font-medium mb-1">Título</p>
                <p className="text-base">{viewingPedido.titulo || 'Sem título'}</p>
              </div>

              {/* Oração Completa */}
              <div>
                <p className="text-sm font-medium mb-2">Pedido de Oração</p>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {viewingPedido.oracao}
                  </p>
                </div>
              </div>

              {/* Ações */}
              <div className="flex flex-wrap gap-2 justify-end pt-4 border-t">
                {viewingPedido.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => openAnswerDialog(viewingPedido)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Adicionar Resposta
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleWhatsAppResponse(viewingPedido)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={() => handleToggleAtendido(viewingPedido)}
                  className={viewingPedido.pedido_atendido ? '' : 'text-green-600'}
                >
                  {viewingPedido.pedido_atendido ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Desmarcar Atendido
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Marcar Atendido
                    </>
                  )}
                </Button>
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
                <Button 
                  variant="destructive" 
                  onClick={() => handleDelete(viewingPedido)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Resposta - Simplificado (sem campo answer no banco) */}
      <Dialog open={answerDialogOpen} onOpenChange={setAnswerDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Responder Pedido
            </DialogTitle>
            <DialogDescription>
              Deseja marcar este pedido como respondido?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Pedido</p>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                {viewingPedido?.titulo || viewingPedido?.tema || 'Sem título'}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAnswerDialogOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={submitAnswer}
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Marcar como Respondido
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
