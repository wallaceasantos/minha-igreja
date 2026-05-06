/**
 * Super Admin - Sistema de Suporte/Tickets
 * Versão Simplificada e Funcional
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Ticket,
  ChevronLeft,
  Search,
  Filter,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Send,
  User,
  Building2,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/config';

const statusConfig: any = {
  open: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'Aberto' },
  in_progress: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: 'Em Andamento' },
  waiting_customer: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', label: 'Aguardando Cliente' },
  resolved: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Resolvido' },
  closed: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', label: 'Fechado' },
};

const priorityConfig: any = {
  low: { color: 'bg-gray-100 text-gray-800', label: 'Baixa' },
  medium: { color: 'bg-blue-100 text-blue-800', label: 'Média' },
  high: { color: 'bg-orange-100 text-orange-800', label: 'Alta' },
  urgent: { color: 'bg-red-100 text-red-800', label: 'Urgente' },
};

const categoryConfig: any = {
  technical: 'Técnico',
  billing: 'Financeiro',
  feature: 'Funcionalidade',
  other: 'Outro',
};

export default function SuperAdminTickets() {
  const navigate = useNavigate();
  const params = useParams();
  const ticketId = params.id;

  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    search: '',
    date_range: '90days', // all, 7days, 30days, 90days, 6months, 12months
    archived: '0', // 0=active, 1=archived, all=both
  });
  const [replyMessage, setReplyMessage] = useState('');
  const [assignDialog, setAssignDialog] = useState(false);
  const [createDialog, setCreateDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [admins, setAdmins] = useState<any[]>([]);
  const [newTicket, setNewTicket] = useState({
    church_id: '',
    subject: '',
    description: '',
    priority: 'medium',
    category: 'other',
  });
  const [churches, setChurches] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (ticketId) {
      loadTicketDetails(ticketId);
    } else {
      loadTickets();
      loadStats();
    }
    loadAdmins();
    loadChurches();
  }, [ticketId, filters, pagination.page]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '20',
        ...filters,
      });

      const response = await fetch(buildApiUrl(`/api/admin/tickets?${queryParams}`), {
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        setTickets(result.data.tickets);
        setPagination(result.data.pagination);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast.error('Erro ao carregar tickets');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(buildApiUrl('/api/admin/tickets/stats'), {
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadAdmins = async () => {
    try {
      const response = await fetch(buildApiUrl('/api/admin/tickets/admins'), {
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        setAdmins(result.data);
      }
    } catch (error) {
      console.error('Error loading admins:', error);
    }
  };

  const loadChurches = async () => {
    try {
      const response = await fetch(buildApiUrl('/api/admin/churches?limit=1000'), {
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        setChurches(result.data.churches);
      }
    } catch (error) {
      console.error('Error loading churches:', error);
    }
  };

  const loadTicketDetails = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl(`/api/admin/tickets/${id}`), {
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        setSelectedTicket(result.data);
      }
    } catch (error) {
      console.error('Error loading ticket details:', error);
      toast.error('Erro ao carregar detalhes do ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicket.church_id) {
      toast.error('Selecione uma igreja');
      return;
    }
    if (!newTicket.subject || newTicket.subject.trim().length < 5) {
      toast.error('Assunto deve ter pelo menos 5 caracteres');
      return;
    }
    if (!newTicket.description || newTicket.description.trim().length < 10) {
      toast.error('Descrição deve ter pelo menos 10 caracteres');
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch(buildApiUrl('/api/admin/tickets'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify({
          church_id: parseInt(newTicket.church_id),
          subject: newTicket.subject.trim(),
          description: newTicket.description.trim(),
          priority: newTicket.priority,
          category: newTicket.category,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Ticket ${result.ticket_number} criado com sucesso!`);
        setCreateDialog(false);
        setNewTicket({
          church_id: '',
          subject: '',
          description: '',
          priority: 'medium',
          category: 'other',
        });
        loadTickets();
        loadStats();
      } else {
        toast.error(result.error || 'Erro ao criar ticket');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Erro ao criar ticket');
    } finally {
      setIsCreating(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedTicket) return;

    try {
      const response = await fetch(buildApiUrl(`/api/admin/tickets/${selectedTicket.id}/assign`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify({
          assigned_to: selectedAdmin && selectedAdmin !== 'none' ? parseInt(selectedAdmin) : null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setAssignDialog(false);
        setSelectedAdmin('');
        loadTicketDetails(selectedTicket.id);
        loadTickets();
        loadStats();
      } else {
        toast.error(result.error || 'Erro ao atribuir ticket');
      }
    } catch (error) {
      console.error('Error assigning ticket:', error);
      toast.error('Erro ao atribuir ticket');
    }
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    try {
      const response = await fetch(buildApiUrl(`/api/admin/tickets/${selectedTicket.id}/reply`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify({
          message: replyMessage,
          user_id: 1,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Resposta enviada!');
        setReplyMessage('');
        loadTicketDetails(selectedTicket.id);
      }
    } catch (error) {
      console.error('Error replying:', error);
      toast.error('Erro ao enviar resposta');
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;

    if (!confirm('Tem certeza que deseja encerrar este ticket?')) {
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`/api/admin/tickets/${selectedTicket.id}/close`), {
        method: 'POST',
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Ticket encerrado!');
        loadTicketDetails(selectedTicket.id);
        loadTickets();
        loadStats();
      } else {
        toast.error(result.error || 'Erro ao encerrar ticket');
      }
    } catch (error) {
      console.error('Error closing ticket:', error);
      toast.error('Erro ao encerrar ticket');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTicket) return;

    try {
      const response = await fetch(buildApiUrl(`/api/admin/tickets/${selectedTicket.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Status atualizado!');
        loadTicketDetails(selectedTicket.id);
        loadTickets();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return formatDate(dateString);
  };

  // Vista de lista de tickets
  if (!ticketId) {
    return (
      <div className="min-h-screen bg-background p-6">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/super-admin/dashboard')}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Tickets de Suporte</h1>
              <p className="text-sm text-muted-foreground">Gerencie os tickets de suporte das igrejas</p>
            </div>
          </div>
          <Button onClick={(e) => { e.stopPropagation(); setCreateDialog(true); }} className="gap-2">
            <Ticket className="h-4 w-4" />
            Novo Ticket
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="mb-6 grid gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.byStatus?.reduce((acc: number, s: any) => acc + s.count, 0) || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Abertos</CardTitle>
                <AlertCircle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.byStatus?.find((s: any) => s.status === 'open')?.count || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.byStatus?.find((s: any) => s.status === 'in_progress')?.count || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Não Atribuídos</CardTitle>
                <Users className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.unassigned || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Últimos 7 Dias</CardTitle>
                <Calendar className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.last7days || 0}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Ticket, assunto..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={filters.status || "all"}
                  onValueChange={(value) => setFilters({ ...filters, status: value === "all" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="waiting_customer">Aguardando</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Prioridade</Label>
                <Select
                  value={filters.priority || "all"}
                  onValueChange={(value) => setFilters({ ...filters, priority: value === "all" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Categoria</Label>
                <Select
                  value={filters.category || "all"}
                  onValueChange={(value) => setFilters({ ...filters, category: value === "all" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="technical">Técnico</SelectItem>
                    <SelectItem value="billing">Financeiro</SelectItem>
                    <SelectItem value="feature">Funcionalidade</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Período</Label>
                <Select
                  value={filters.date_range || "90days"}
                  onValueChange={(value) => setFilters({ ...filters, date_range: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="7days">Últimos 7 dias</SelectItem>
                    <SelectItem value="30days">Últimos 30 dias</SelectItem>
                    <SelectItem value="90days">Últimos 90 dias</SelectItem>
                    <SelectItem value="6months">Últimos 6 meses</SelectItem>
                    <SelectItem value="12months">Últimos 12 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status do Arquivo</Label>
                <Select
                  value={filters.archived || "0"}
                  onValueChange={(value) => setFilters({ ...filters, archived: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Ativos</SelectItem>
                    <SelectItem value="1">Arquivados</SelectItem>
                    <SelectItem value="all">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                Carregando tickets...
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticket</TableHead>
                        <TableHead>Assunto</TableHead>
                        <TableHead>Igreja</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Prioridade</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Responsável</TableHead>
                        <TableHead>Mensagens</TableHead>
                        <TableHead>Criado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tickets.map((ticket) => (
                        <TableRow
                          key={ticket.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/super-admin/tickets/${ticket.id}`)}
                        >
                          <TableCell className="font-mono font-medium">
                            #{ticket.ticket_number}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {ticket.subject}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{ticket.church_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusConfig[ticket.status]?.color}>
                              {statusConfig[ticket.status]?.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={priorityConfig[ticket.priority]?.color}>
                              {priorityConfig[ticket.priority]?.label}
                            </Badge>
                          </TableCell>
                          <TableCell>{categoryConfig[ticket.category]}</TableCell>
                          <TableCell>
                            {ticket.assigned_to_name ? (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{ticket.assigned_to_name}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Não atribuído</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{ticket.message_count}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(ticket.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação */}
                {pagination.totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Página {pagination.page} de {pagination.totalPages} ({pagination.total} tickets)
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                        disabled={pagination.page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                        disabled={pagination.page >= pagination.totalPages}
                      >
                        Próxima
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Criar Ticket */}
        <Dialog open={createDialog} onOpenChange={setCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Ticket</DialogTitle>
              <DialogDescription>
                Abra um ticket de suporte para uma igreja
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Igreja *</Label>
                <Select
                  value={newTicket.church_id}
                  onValueChange={(value) => setNewTicket({ ...newTicket, church_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma igreja..." />
                  </SelectTrigger>
                  <SelectContent>
                    {churches.map((church: any) => (
                      <SelectItem key={church.id} value={church.id.toString()}>
                        {church.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Assunto *</Label>
                <Input
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="Ex: Erro ao exportar relatórios"
                />
              </div>

              <div className="grid gap-2">
                <Label>Descrição *</Label>
                <Textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Descreva o problema em detalhes..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Prioridade</Label>
                  <Select
                    value={newTicket.priority}
                    onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Categoria</Label>
                  <Select
                    value={newTicket.category}
                    onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Técnico</SelectItem>
                      <SelectItem value="billing">Financeiro</SelectItem>
                      <SelectItem value="feature">Funcionalidade</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialog(false)} disabled={isCreating}>
                Cancelar
              </Button>
              <Button onClick={handleCreateTicket} className="gap-2" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Ticket className="h-4 w-4" />
                    Criar Ticket
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Vista de detalhes do ticket
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando ticket...</p>
        </div>
      </div>
    );
  }

  if (!selectedTicket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Ticket não encontrado</h1>
          <Button onClick={() => navigate('/super-admin/tickets')}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar para lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/super-admin/tickets')} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">#{selectedTicket.ticket_number}</h1>
              <Badge className={statusConfig[selectedTicket.status]?.color}>
                {statusConfig[selectedTicket.status]?.label}
              </Badge>
              <Badge className={priorityConfig[selectedTicket.priority]?.color}>
                {priorityConfig[selectedTicket.priority]?.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{selectedTicket.subject}</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Aberto há {formatTimeAgo(selectedTicket.created_at)}
              {selectedTicket.assigned_to_name && (
                <>
                  {' • '}
                  <User className="h-3 w-3" />
                  Resp: {selectedTicket.assigned_to_name}
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setAssignDialog(true)}
            className="gap-2"
          >
            <User className="h-4 w-4" />
            {selectedTicket.assigned_to_name ? 'Transferir' : 'Atribuir'}
          </Button>
          {selectedTicket.status !== 'closed' && (
            <Button
              variant="outline"
              onClick={handleCloseTicket}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <CheckCircle className="h-4 w-4" />
              Encerrar
            </Button>
          )}
          <Select
            value={selectedTicket.status}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Aberto</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="waiting_customer">Aguardando</SelectItem>
              <SelectItem value="resolved">Resolvido</SelectItem>
              <SelectItem value="closed">Fechado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Detalhes do Ticket */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{selectedTicket.description}</p>

            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Mensagens ({selectedTicket.messages?.length || 0})
              </h3>

              <div className="space-y-4">
                {selectedTicket.messages?.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={`rounded-lg border p-4 ${
                      msg.is_internal ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{msg.user_name || 'Sistema'}</span>
                        {msg.is_internal && (
                          <Badge variant="secondary" className="text-xs">
                            Interno
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(msg.created_at)}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Responder */}
            <div className="mt-6 border-t pt-4">
              <h3 className="font-semibold mb-4">Responder Ticket</h3>
              <Textarea
                placeholder="Digite sua resposta..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="mb-2 min-h-[100px]"
              />
              <div className="flex items-center gap-2">
                <Button onClick={handleReply} className="gap-2">
                  <Send className="h-4 w-4" />
                  Enviar Resposta
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações Laterais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Igreja</Label>
              <div className="flex items-center gap-2 mt-1">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{selectedTicket.church_name}</span>
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground">Solicitante</Label>
              <div className="flex items-center gap-2 mt-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{selectedTicket.user_name}</div>
                  <div className="text-xs text-muted-foreground">{selectedTicket.user_email}</div>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground">Responsável</Label>
              <div className="flex items-center gap-2 mt-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>
                  {selectedTicket.assigned_to_name || 'Não atribuído'}
                </span>
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground">Categoria</Label>
              <div className="mt-1">{categoryConfig[selectedTicket.category]}</div>
            </div>

            <div>
              <Label className="text-muted-foreground">Criado em</Label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formatDate(selectedTicket.created_at)}</span>
              </div>
            </div>

            {selectedTicket.resolved_at && (
              <div>
                <Label className="text-muted-foreground">Resolvido em</Label>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{formatDate(selectedTicket.resolved_at)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Atribuição/Transferência */}
      <Dialog open={assignDialog} onOpenChange={setAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTicket?.assigned_to_name ? 'Transferir Ticket' : 'Atribuir Responsável'}</DialogTitle>
            <DialogDescription>
              Selecione um administrador para responder este ticket
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label>Responsável</Label>
              <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um responsável..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não atribuído</SelectItem>
                  {admins.map((admin: any) => (
                    <SelectItem key={admin.id} value={admin.id.toString()}>
                      {admin.name} ({admin.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssign} className="gap-2">
              <User className="h-4 w-4" />
              {selectedTicket?.assigned_to_name ? 'Transferir' : 'Atribuir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
