/**
 * Admin: Tickets de Suporte
 * Sistema completo de tickets para pastor solicitar ajuda
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDashboard } from '@/hooks/useDashboard';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/config';
import {
  Ticket,
  Plus,
  Search,
  Filter,
  ArrowLeft,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Monitor,
  CreditCard,
  HelpCircle,
  Lightbulb,
  MoreVertical,
  X
} from 'lucide-react';

interface TicketData {
  id: number;
  ticket_number: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'feature' | 'other';
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  messages?: TicketMessage[];
}

interface TicketMessage {
  id: number;
  ticket_id: number;
  user_id: number;
  message: string;
  is_internal: number;
  created_at: string;
  user_name?: string;
}

interface TicketStats {
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
  openTickets: number;
}

export default function Tickets() {
  const navigate = useNavigate();
  const { church } = useDashboard();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [viewingTicket, setViewingTicket] = useState<TicketData | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'other',
    priority: 'medium',
  });

  useEffect(() => {
    // Pequeno delay para garantir que church seja carregada
    const timer = setTimeout(() => {
      loadTickets();
      loadStats();
    }, 500);

    return () => clearTimeout(timer);
  }, [filterStatus]);

  const loadTickets = async () => {
    try {
      // Tentar pegar churchId do localStorage se o hook não carregou
      const churchId = church?.id || localStorage.getItem('churchId');
      
      if (!churchId) {
        console.log('Church ID não encontrado, aguardando...');
        console.log('Church atual:', church);
        console.log('LocalStorage churchId:', localStorage.getItem('churchId'));
        return;
      }

      console.log('Carregando tickets para church_id:', churchId);

      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      const response = await fetch(buildApiUrl(`/api/tickets?${params}`), {
        headers: {
          'x-church-id': String(churchId),
        },
      });
      const result = await response.json();

      console.log('Resposta da API:', result);

      if (result.success) {
        setTickets(result.data);
        console.log('Tickets carregados:', result.data.length);
      } else {
        console.error('Erro ao carregar tickets:', result.error);
        toast.error(result.error || 'Erro ao carregar tickets');
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast.error('Erro ao carregar tickets');
    } finally {
      setLoading(false);
    }
  };

  const loadTicketDetails = async (ticketId: number) => {
    try {
      // Tentar pegar churchId do localStorage se o hook não carregou
      const churchId = church?.id || localStorage.getItem('churchId');
      
      console.log('Carregando detalhes do ticket:', ticketId, 'para church_id:', churchId);

      const response = await fetch(buildApiUrl(`/api/tickets/${ticketId}`), {
        headers: {
          'x-church-id': String(churchId),
        },
      });
      const result = await response.json();

      console.log('Detalhes do ticket:', result);

      if (result.success) {
        setViewingTicket(result.data);
        console.log('Mensagens carregadas:', result.data.messages?.length || 0);
      } else {
        console.error('Erro ao carregar detalhes:', result.error);
        toast.error(result.error || 'Erro ao carregar detalhes do ticket');
      }
    } catch (error) {
      console.error('Error loading ticket details:', error);
      toast.error('Erro ao carregar detalhes do ticket');
    }
  };

  const handleSendReply = async () => {
    if (!viewingTicket || !replyMessage.trim()) return;

    setSendingReply(true);

    try {
      const response = await fetch(buildApiUrl(`/api/tickets/${viewingTicket.id}/messages`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-church-id': String(church?.id),
        },
        body: JSON.stringify({
          message: replyMessage.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Mensagem enviada com sucesso!');
        setReplyMessage('');
        // Recarregar detalhes do ticket
        await loadTicketDetails(viewingTicket.id);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSendingReply(false);
    }
  };

  const loadStats = async () => {
    try {
      // Tentar pegar churchId do localStorage se o hook não carregou
      const churchId = church?.id || localStorage.getItem('churchId');
      
      if (!churchId) {
        console.log('Church ID não encontrado para stats, aguardando...');
        return;
      }

      const response = await fetch(buildApiUrl('/api/tickets/stats'), {
        headers: {
          'x-church-id': String(churchId),
        },
      });
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        console.error('Erro ao carregar stats:', result.error);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreateTicket = async () => {
    if (!formData.subject.trim() || !formData.description.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setCreating(true);

    try {
      const response = await fetch(buildApiUrl('/api/tickets'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-church-id': String(church?.id),
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Ticket criado com sucesso!', {
          description: `Número: ${result.data.ticket_number}`,
        });
        setCreateDialogOpen(false);
        setFormData({ subject: '', description: '', category: 'other', priority: 'medium' });
        loadTickets();
        loadStats();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Erro ao criar ticket');
    } finally {
      setCreating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; icon: any; color: string }> = {
      open: { label: 'Aberto', icon: AlertCircle, color: 'bg-blue-500' },
      in_progress: { label: 'Em Andamento', icon: Clock, color: 'bg-yellow-500' },
      waiting_customer: { label: 'Aguardando Cliente', icon: AlertCircle, color: 'bg-orange-500' },
      resolved: { label: 'Resolvido', icon: CheckCircle, color: 'bg-green-500' },
      closed: { label: 'Fechado', icon: CheckCircle, color: 'bg-gray-500' },
    };

    const { label, icon: Icon, color } = config[status] || { label: 'Aberto', icon: AlertCircle, color: 'bg-blue-500' };

    return (
      <Badge className={color}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, { label: string; color: string }> = {
      low: { label: 'Baixa', color: 'bg-gray-500' },
      medium: { label: 'Média', color: 'bg-blue-500' },
      high: { label: 'Alta', color: 'bg-orange-500' },
      urgent: { label: 'Urgente', color: 'bg-red-500' },
    };

    const { label, color } = config[priority] || { label: 'Média', color: 'bg-blue-500' };

    return <Badge variant="outline" className={color}>{label}</Badge>;
  };

  const getCategoryIcon = (category: string) => {
    const config: Record<string, { icon: any; label: string }> = {
      technical: { icon: Monitor, label: 'Suporte Técnico' },
      billing: { icon: CreditCard, label: 'Financeiro' },
      feature: { icon: Lightbulb, label: 'Sugestão' },
      other: { icon: HelpCircle, label: 'Outros' },
    };

    return config[category] || { icon: HelpCircle, label: 'Outros' };
  };

  const filteredTickets = tickets.filter(ticket =>
    // Filtrar apenas tickets que NÃO estão fechados (closed)
    ticket.status !== 'closed' &&
    (ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Abrir Ticket
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Abertos</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.openTickets || 0}</div>
            <p className="text-xs text-muted-foreground">Aguardando atendimento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.byStatus?.in_progress || 0}</div>
            <p className="text-xs text-muted-foreground">Sendo atendidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.byStatus?.resolved || 0}</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24h</div>
            <p className="text-xs text-muted-foreground">Resposta</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número ou assunto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="open">Abertos</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="waiting_customer">Aguardando</SelectItem>
                  <SelectItem value="resolved">Resolvidos</SelectItem>
                  <SelectItem value="closed">Fechados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Meus Tickets
          </CardTitle>
          <CardDescription>
            Acompanhe todas as suas solicitações de suporte
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Carregando tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum ticket encontrado</p>
              <p className="text-sm mt-2">
                Clique em "Abrir Ticket" para criar uma nova solicitação
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => {
                const { icon: CategoryIcon, label: categoryLabel } = getCategoryIcon(ticket.category);
                
                return (
                  <Card
                    key={ticket.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setViewingTicket(ticket)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <CategoryIcon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-mono text-muted-foreground">
                                {ticket.ticket_number}
                              </span>
                              {getStatusBadge(ticket.status)}
                              {getPriorityBadge(ticket.priority)}
                            </div>
                            <h3 className="font-semibold text-lg mb-1 truncate">
                              {ticket.subject}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {ticket.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                              </span>
                              <span>{categoryLabel}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="flex-shrink-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Ticket Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Abrir Novo Ticket
            </DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo para solicitar suporte
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        Suporte Técnico
                      </div>
                    </SelectItem>
                    <SelectItem value="billing">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Financeiro / Pagamentos
                      </div>
                    </SelectItem>
                    <SelectItem value="feature">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Sugestão de Melhoria
                      </div>
                    </SelectItem>
                    <SelectItem value="other">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        Outros
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Assunto *</Label>
              <Input
                id="subject"
                placeholder="Ex: Erro ao enviar pedidos de oração"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                placeholder="Descreva detalhadamente o problema ou solicitação..."
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Nossa equipe responderá em até 24 horas úteis. Para urgências, entre em contato pelo WhatsApp.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateTicket} disabled={creating}>
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Abrir Ticket
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Ticket Dialog */}
      {viewingTicket && (
        <Dialog open={!!viewingTicket} onOpenChange={() => {
          setViewingTicket(null);
          setReplyMessage('');
        }}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  {viewingTicket.ticket_number}
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setViewingTicket(null);
                    setReplyMessage('');
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(viewingTicket.status)}
                {getPriorityBadge(viewingTicket.priority)}
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto py-4 space-y-6">
              {/* Informações do Ticket */}
              <div className="grid md:grid-cols-3 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm font-medium mb-1">Categoria</p>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const { icon: Icon, label } = getCategoryIcon(viewingTicket.category);
                      return (
                        <>
                          <Icon className="w-4 h-4 text-primary" />
                          <span className="text-sm">{label}</span>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Criado em</p>
                  <p className="text-sm">
                    {new Date(viewingTicket.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Atualizado em</p>
                  <p className="text-sm">
                    {new Date(viewingTicket.updated_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* Mensagens */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Conversas
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewingTicket && loadTicketDetails(viewingTicket.id)}
                    className="gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Atualizar Mensagens
                  </Button>
                </div>
                
                {viewingTicket.messages && viewingTicket.messages.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {viewingTicket.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-lg ${
                          msg.is_internal
                            ? 'bg-muted border border-muted-foreground/20'
                            : 'bg-primary/5 border border-primary/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="text-xs font-semibold text-primary">
                                {msg.user_name ? msg.user_name.charAt(0).toUpperCase() : 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {msg.user_name || 'Usuário'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(msg.created_at).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          {msg.is_internal && (
                            <Badge variant="outline" className="text-xs">
                              Interno
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma mensagem ainda</p>
                  </div>
                )}
              </div>

              {/* Área de Resposta */}
              {(viewingTicket.status === 'open' || viewingTicket.status === 'waiting_customer') && (
                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="reply">Responder Ticket</Label>
                  <Textarea
                    id="reply"
                    placeholder="Digite sua resposta..."
                    rows={3}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Pressione Enter para enviar, Shift+Enter para nova linha
                    </p>
                    <Button
                      size="sm"
                      onClick={handleSendReply}
                      disabled={sendingReply || !replyMessage.trim()}
                    >
                      {sendingReply ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Enviar Resposta
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="border-t pt-4">
              {viewingTicket.status === 'resolved' && viewingTicket.resolved_at && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Ticket resolvido em {new Date(viewingTicket.resolved_at).toLocaleDateString('pt-BR')}
                  </AlertDescription>
                </Alert>
              )}
              <Button variant="outline" onClick={() => {
                setViewingTicket(null);
                setReplyMessage('');
              }}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
