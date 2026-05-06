/**
 * Super Admin - Comunicados/Notificações em Massa
 * ============================================
 * URL: /super-admin/announcements
 * 
 * Gerenciar comunicados enviados às igrejas.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Switch } from '@/components/ui/switch';
import {
  Megaphone,
  ChevronLeft,
  Plus,
  Send,
  Eye,
  Trash2,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Info,
  ChevronRight,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';

const typeConfig: any = {
  info: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Info, label: 'Informativo' },
  warning: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: AlertCircle, label: 'Aviso' },
  success: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle, label: 'Sucesso' },
  error: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: AlertCircle, label: 'Erro' },
  maintenance: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: Clock, label: 'Manutenção' },
};

const priorityConfig: any = {
  low: { color: 'bg-gray-100 text-gray-800', label: 'Baixa' },
  medium: { color: 'bg-blue-100 text-blue-800', label: 'Média' },
  high: { color: 'bg-orange-100 text-orange-800', label: 'Alta' },
  urgent: { color: 'bg-red-100 text-red-800', label: 'Urgente' },
};

const statusConfig: any = {
  draft: { color: 'bg-gray-100 text-gray-800', label: 'Rascunho' },
  scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Agendado' },
  sending: { color: 'bg-yellow-100 text-yellow-800', label: 'Enviando' },
  sent: { color: 'bg-green-100 text-green-800', label: 'Enviado' },
  cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelado' },
};

export default function SuperAdminAnnouncements() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    priority: '',
  });
  const [createDialog, setCreateDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [templatesDialog, setTemplatesDialog] = useState(false);
  const [readersDialog, setReadersDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [liveStats, setLiveStats] = useState<any>(null);
  const [readers, setReaders] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    type: 'info',
    priority: 'medium',
    send_method: 'platform',
    target_audience: 'all',
    show_on_dashboard: true,
    show_on_login: false,
    require_acknowledgment: false,
    scheduled_send: false,
    scheduled_at: '',
  });

  useEffect(() => {
    loadAnnouncements();
    loadStats();
  }, [filters, pagination.page]);

  const loadTemplates = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/templates?active_only=true', {
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        setTemplates(result.data);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadLiveStats = async (announcementId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/announcements/${announcementId}/live-stats`, {
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        setLiveStats(result.data);
      }
    } catch (error) {
      console.error('Error loading live stats:', error);
    }
  };

  const loadReaders = async (announcementId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/announcements/${announcementId}/readers`, {
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        setReaders(result.data);
      }
    } catch (error) {
      console.error('Error loading readers:', error);
    }
  };

  // Polling para atualizar stats em tempo real (a cada 30 segundos)
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (selectedAnnouncement && viewDialog) {
      loadLiveStats(selectedAnnouncement.id);
      interval = setInterval(() => {
        loadLiveStats(selectedAnnouncement.id);
      }, 30000); // 30 segundos
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedAnnouncement, viewDialog]);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '20',
        ...filters,
      });

      const response = await fetch(`http://localhost:3000/api/admin/announcements?${queryParams}`, {
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        setAnnouncements(result.data.announcements);
        setPagination(result.data.pagination);
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
      toast.error('Erro ao carregar comunicados');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/announcements/stats', {
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

  const handleCreate = async () => {
    if (!newAnnouncement.title || !newAnnouncement.message) {
      toast.error('Título e mensagem são obrigatórios');
      return;
    }

    if (newAnnouncement.scheduled_send && !newAnnouncement.scheduled_at) {
      toast.error('Selecione uma data/hora para agendamento');
      return;
    }

    // Verificar se data é futura
    if (newAnnouncement.scheduled_send && newAnnouncement.scheduled_at) {
      const scheduledDate = new Date(newAnnouncement.scheduled_at);
      const now = new Date();
      if (scheduledDate <= now) {
        toast.error('A data de agendamento deve ser futura');
        return;
      }
    }

    try {
      const response = await fetch('http://localhost:3000/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify({
          ...newAnnouncement,
          scheduled_at: newAnnouncement.scheduled_send ? newAnnouncement.scheduled_at : null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        if (newAnnouncement.scheduled_send) {
          toast.success(`Comunicado agendado para ${formatDate(newAnnouncement.scheduled_at)}!`);
        } else {
          toast.success('Comunicado criado! Agora envie para as igrejas.');
        }
        setCreateDialog(false);
        loadAnnouncements();
        loadStats();
        // Abrir dialog de envio apenas se não for agendado
        if (!newAnnouncement.scheduled_send) {
          setSelectedAnnouncement({ id: result.announcement_id, ...newAnnouncement });
          handleSend(result.announcement_id);
        }
        // Resetar formulário
        setNewAnnouncement({
          title: '',
          message: '',
          type: 'info',
          priority: 'medium',
          send_method: 'platform',
          target_audience: 'all',
          show_on_dashboard: true,
          show_on_login: false,
          require_acknowledgment: false,
          scheduled_send: false,
          scheduled_at: '',
        });
      } else {
        toast.error(result.error || 'Erro ao criar comunicado');
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Erro ao criar comunicado');
    }
  };

  const handleSend = async (announcementId: number) => {
    if (!announcementId) return;

    setIsSending(true);

    try {
      const response = await fetch(`http://localhost:3000/api/admin/announcements/${announcementId}/send`, {
        method: 'POST',
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || 'Comunicado enviado!');
        setCreateDialog(false);
        setSelectedAnnouncement(null);
        loadAnnouncements();
        loadStats();
      } else {
        toast.error(result.error || 'Erro ao enviar comunicado');
      }
    } catch (error) {
      console.error('Error sending announcement:', error);
      toast.error('Erro ao enviar comunicado');
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este comunicado?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/admin/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Comunicado excluído!');
        loadAnnouncements();
        loadStats();
      } else {
        toast.error(result.error || 'Erro ao excluir comunicado');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Erro ao excluir comunicado');
    }
  };

  const handleView = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/announcements/${id}`, {
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        setSelectedAnnouncement(result.data);
        setLiveStats(null); // Reset stats
        setReaders([]); // Reset readers
        loadLiveStats(id);
        loadReaders(id);
        setViewDialog(true);
      }
    } catch (error) {
      console.error('Error loading announcement:', error);
      toast.error('Erro ao carregar comunicado');
    }
  };

  const handlePreview = () => {
    if (!newAnnouncement.title || !newAnnouncement.message) {
      toast.error('Preencha título e mensagem para visualizar');
      return;
    }
    setPreviewDialog(true);
  };

  const handleUseTemplate = (template: any) => {
    setNewAnnouncement({
      ...newAnnouncement,
      title: template.title,
      message: template.message,
      type: template.type,
      priority: template.priority,
      send_method: template.send_method,
      target_audience: template.target_audience,
      show_on_dashboard: !!template.show_on_dashboard,
      show_on_login: !!template.show_on_login,
      require_acknowledgment: !!template.require_acknowledgment,
    });
    setTemplatesDialog(false);
    toast.success(`Template "${template.name}" carregado!`);
    
    // Registrar uso do template
    fetch(`http://localhost:3000/api/admin/templates/${template.id}/use`, {
      method: 'POST',
      headers: {
        'x-user-role': 'super_admin',
      },
    }).catch(() => {});
  };

  const handleDuplicate = (announcement: any) => {
    setNewAnnouncement({
      title: `${announcement.title} (Cópia)`,
      message: announcement.message,
      type: announcement.type,
      priority: announcement.priority,
      send_method: announcement.send_method,
      target_audience: announcement.target_audience,
      show_on_dashboard: !!announcement.show_on_dashboard,
      show_on_login: !!announcement.show_on_login,
      require_acknowledgment: !!announcement.require_acknowledgment,
      scheduled_send: false,
      scheduled_at: '',
    });
    setCreateDialog(true);
    toast.success('Comunicado duplicado! Edite e envie.');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Comunicados</h1>
            <p className="text-sm text-muted-foreground">Envie notificações em massa para as igrejas</p>
          </div>
        </div>
        <Button onClick={() => setCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Comunicado
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.byStatus?.reduce((acc: number, s: any) => acc + s.count, 0) || 0}
              </div>
              <p className="text-xs text-muted-foreground">Comunicados criados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active || 0}</div>
              <p className="text-xs text-muted-foreground">Visíveis no dashboard</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
              <Eye className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.views7days || 0}</div>
              <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Leitura</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgReadRate?.toFixed(1) || 0}%</div>
              <p className="text-xs text-muted-foreground">Média de leitura</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <div>
              <Label>Tipo</Label>
              <Select
                value={filters.type || "all"}
                onValueChange={(value) => setFilters({ ...filters, type: value === "all" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="info">Informativo</SelectItem>
                  <SelectItem value="warning">Aviso</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="scheduled">Agendado</SelectItem>
                  <SelectItem value="sent">Enviado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
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
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Comunicados */}
      <Card>
        <CardHeader>
          <CardTitle>Comunicados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              Carregando comunicados...
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Destino</TableHead>
                      <TableHead>Envio</TableHead>
                      <TableHead>Leituras</TableHead>
                      <TableHead>Criado</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcements.map((announcement) => {
                      const TypeIcon = typeConfig[announcement.type]?.icon || Info;
                      return (
                        <TableRow key={announcement.id}>
                          <TableCell className="font-medium max-w-xs truncate">
                            {announcement.title}
                          </TableCell>
                          <TableCell>
                            <Badge className={typeConfig[announcement.type]?.color}>
                              <TypeIcon className="h-3 w-3 mr-1" />
                              {typeConfig[announcement.type]?.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={priorityConfig[announcement.priority]?.color}>
                              {priorityConfig[announcement.priority]?.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusConfig[announcement.status]?.color}>
                              {statusConfig[announcement.status]?.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {announcement.target_audience === 'all' ? 'Todas' : announcement.target_audience}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {announcement.sent_at ? formatDate(announcement.sent_at) : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Eye className="h-3 w-3 text-muted-foreground" />
                              {announcement.read_count || 0}/{announcement.total_recipients || 0}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(announcement.created_at)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(announcement.id)}
                                title="Ver detalhes e estatísticas"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {announcement.status === 'sent' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAnnouncement(announcement);
                                    loadLiveStats(announcement.id);
                                    loadReaders(announcement.id);
                                    setReadersDialog(true);
                                  }}
                                  title="Ver quem já leu em tempo real"
                                >
                                  <Users className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDuplicate(announcement)}
                                title="Duplicar comunicado"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              {announcement.status === 'draft' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSend(announcement.id)}
                                  disabled={isSending}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              )}
                              {announcement.status === 'draft' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(announcement.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Paginação */}
              {pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Página {pagination.page} de {pagination.totalPages} ({pagination.total} comunicados)
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

      {/* Dialog de Criar Comunicado */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Comunicado</DialogTitle>
            <DialogDescription>
              Crie um comunicado para enviar às igrejas
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Botão de Templates */}
            <div className="flex items-center justify-between gap-2 p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Usar Template</p>
                  <p className="text-xs text-muted-foreground">Economize tempo com modelos prontos</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { loadTemplates(); setTemplatesDialog(true); }}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                Ver Templates
              </Button>
            </div>

            <div className="grid gap-2">
              <Label>Título *</Label>
              <Input
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                placeholder="Ex: Manutenção Programada"
              />
            </div>

            <div className="grid gap-2">
              <Label>Mensagem *</Label>
              <Textarea
                value={newAnnouncement.message}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                placeholder="Descreva o comunicado em detalhes..."
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tipo</Label>
                <Select
                  value={newAnnouncement.type}
                  onValueChange={(value) => setNewAnnouncement({ ...newAnnouncement, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Informativo</SelectItem>
                    <SelectItem value="warning">Aviso</SelectItem>
                    <SelectItem value="success">Sucesso</SelectItem>
                    <SelectItem value="error">Erro</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Prioridade</Label>
                <Select
                  value={newAnnouncement.priority}
                  onValueChange={(value) => setNewAnnouncement({ ...newAnnouncement, priority: value })}
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

            <div className="grid gap-2">
              <Label>Público Alvo</Label>
              <Select
                value={newAnnouncement.target_audience}
                onValueChange={(value) => setNewAnnouncement({ ...newAnnouncement, target_audience: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Igrejas</SelectItem>
                  <SelectItem value="free">Plano Free</SelectItem>
                  <SelectItem value="essencial">Plano Essencial</SelectItem>
                  <SelectItem value="premium">Plano Premium</SelectItem>
                  <SelectItem value="enterprise">Plano Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Método de Envio</Label>
              <Select
                value={newAnnouncement.send_method}
                onValueChange={(value) => setNewAnnouncement({ ...newAnnouncement, send_method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="platform">Apenas Plataforma</SelectItem>
                  <SelectItem value="email">Apenas Email</SelectItem>
                  <SelectItem value="both">Plataforma + Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <Label>Agendar Envio</Label>
                <Switch
                  checked={newAnnouncement.scheduled_send}
                  onCheckedChange={(checked) => setNewAnnouncement({ ...newAnnouncement, scheduled_send: checked })}
                />
              </div>
              
              {newAnnouncement.scheduled_send && (
                <div className="grid gap-2">
                  <Label>Data/Hora do Envio</Label>
                  <Input
                    type="datetime-local"
                    value={newAnnouncement.scheduled_at}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, scheduled_at: e.target.value })}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <p className="text-xs text-muted-foreground">
                    O comunicado será enviado automaticamente na data/hora selecionada
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4 border rounded-lg p-4">
              <Label>Opções de Exibição</Label>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mostrar no Dashboard</Label>
                  <p className="text-xs text-muted-foreground">Exibir comunicado no dashboard das igrejas</p>
                </div>
                <Switch
                  checked={newAnnouncement.show_on_dashboard}
                  onCheckedChange={(checked) => setNewAnnouncement({ ...newAnnouncement, show_on_dashboard: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mostrar no Login</Label>
                  <p className="text-xs text-muted-foreground">Exibir na tela de login</p>
                </div>
                <Switch
                  checked={newAnnouncement.show_on_login}
                  onCheckedChange={(checked) => setNewAnnouncement({ ...newAnnouncement, show_on_login: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Requer Confirmação</Label>
                  <p className="text-xs text-muted-foreground">Usuário deve confirmar leitura</p>
                </div>
                <Switch
                  checked={newAnnouncement.require_acknowledgment}
                  onCheckedChange={(checked) => setNewAnnouncement({ ...newAnnouncement, require_acknowledgment: checked })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>
              Cancelar
            </Button>
            <Button variant="outline" onClick={handlePreview} className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button onClick={handleCreate} className="gap-2">
              <Send className="h-4 w-4" />
              Criar e Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Visualização */}
      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAnnouncement?.title}</DialogTitle>
            <DialogDescription>
              Detalhes do comunicado
            </DialogDescription>
          </DialogHeader>

          {selectedAnnouncement && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge className={typeConfig[selectedAnnouncement.type]?.color}>
                  {typeConfig[selectedAnnouncement.type]?.label}
                </Badge>
                <Badge className={priorityConfig[selectedAnnouncement.priority]?.color}>
                  {priorityConfig[selectedAnnouncement.priority]?.label}
                </Badge>
                <Badge className={statusConfig[selectedAnnouncement.status]?.color}>
                  {statusConfig[selectedAnnouncement.status]?.label}
                </Badge>
              </div>

              <div>
                <Label>Mensagem</Label>
                <p className="whitespace-pre-wrap mt-2 p-4 bg-muted rounded-lg">
                  {selectedAnnouncement.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Criado em</Label>
                  <p className="text-sm">{formatDate(selectedAnnouncement.created_at)}</p>
                </div>
                {selectedAnnouncement.sent_at && (
                  <div>
                    <Label>Enviado em</Label>
                    <p className="text-sm">{formatDate(selectedAnnouncement.sent_at)}</p>
                  </div>
                )}
                {selectedAnnouncement.expires_at && (
                  <div>
                    <Label>Expira em</Label>
                    <p className="text-sm">{formatDate(selectedAnnouncement.expires_at)}</p>
                  </div>
                )}
              </div>

              <div>
                <Label>Estatísticas de Envio</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  {selectedAnnouncement.recipients?.map((recipient: any) => (
                    <Card key={recipient.status}>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold">{recipient.count}</div>
                        <div className="text-xs text-muted-foreground">{recipient.status}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Preview */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Preview do Comunicado</DialogTitle>
            <DialogDescription>
              Como o comunicado aparecerá no dashboard da igreja
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Preview do Card de Comunicado */}
            <Card className={`border-l-4 ${
              newAnnouncement.type === 'warning' ? 'border-l-yellow-500' :
              newAnnouncement.type === 'error' ? 'border-l-red-500' :
              newAnnouncement.type === 'success' ? 'border-l-green-500' :
              newAnnouncement.type === 'maintenance' ? 'border-l-orange-500' :
              'border-l-blue-500'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const TypeIcon = typeConfig[newAnnouncement.type]?.icon || Info;
                      return <TypeIcon className="h-5 w-5" />;
                    })()}
                    <CardTitle className="text-lg">{newAnnouncement.title}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Badge className={priorityConfig[newAnnouncement.priority]?.color}>
                      {priorityConfig[newAnnouncement.priority]?.label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {newAnnouncement.message}
                </p>
                
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Enviado por Super Admin</span>
                  <span>{new Date().toLocaleDateString('pt-BR')}</span>
                </div>

                {newAnnouncement.require_acknowledgment && (
                  <Button className="w-full mt-4" size="sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar Leitura
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Informações de Envio */}
            <div className="rounded-lg border bg-muted p-4 space-y-2">
              <h4 className="font-semibold text-sm">Informações de Envio</h4>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Tipo:</span>
                  <div className="font-medium">{typeConfig[newAnnouncement.type]?.label}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Prioridade:</span>
                  <div className="font-medium">{priorityConfig[newAnnouncement.priority]?.label}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Público:</span>
                  <div className="font-medium">
                    {newAnnouncement.target_audience === 'all' ? 'Todas as igrejas' : 
                     newAnnouncement.target_audience}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Envio:</span>
                  <div className="font-medium">
                    {newAnnouncement.send_method === 'platform' ? 'Apenas Plataforma' :
                     newAnnouncement.send_method === 'email' ? 'Apenas Email' :
                     'Plataforma + Email'}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className={`h-3 w-3 ${newAnnouncement.show_on_dashboard ? 'text-green-600' : 'text-muted-foreground'}`} />
                  <span className={newAnnouncement.show_on_dashboard ? 'font-medium' : 'text-muted-foreground'}>
                    Mostrar no Dashboard
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className={`h-3 w-3 ${newAnnouncement.show_on_login ? 'text-green-600' : 'text-muted-foreground'}`} />
                  <span className={newAnnouncement.show_on_login ? 'font-medium' : 'text-muted-foreground'}>
                    Mostrar no Login
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className={`h-3 w-3 ${newAnnouncement.require_acknowledgment ? 'text-green-600' : 'text-muted-foreground'}`} />
                  <span className={newAnnouncement.require_acknowledgment ? 'font-medium' : 'text-muted-foreground'}>
                    Requer Confirmação
                  </span>
                </div>
                {newAnnouncement.scheduled_send && newAnnouncement.scheduled_at && (
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="h-3 w-3 text-blue-600" />
                    <span className="font-medium text-blue-700 dark:text-blue-300">
                      Agendado para: {formatDate(newAnnouncement.scheduled_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Alerta de Exemplo */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Nota:</strong> Este é apenas um preview. O comunicado será enviado após confirmação.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialog(false)}>
              Voltar
            </Button>
            <Button onClick={() => { setPreviewDialog(false); handleCreate(); }} className="gap-2">
              <Send className="h-4 w-4" />
              Confirmar e Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Templates */}
      <Dialog open={templatesDialog} onOpenChange={setTemplatesDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Templates de Comunicados</DialogTitle>
            <DialogDescription>
              Selecione um template pronto para usar
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum template encontrado</p>
              </div>
            ) : (
              templates.map((template) => {
                const TypeIcon = typeConfig[template.type]?.icon || Info;
                return (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleUseTemplate(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            template.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                            template.type === 'error' ? 'bg-red-100 text-red-600' :
                            template.type === 'success' ? 'bg-green-100 text-green-600' :
                            template.type === 'maintenance' ? 'bg-orange-100 text-orange-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            <TypeIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <CardDescription className="text-sm">
                              {template.title}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={priorityConfig[template.priority]?.color}>
                            {priorityConfig[template.priority]?.label}
                          </Badge>
                          {template.usage_count > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              {template.usage_count}x
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.message}
                      </p>
                      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {template.target_audience === 'all' ? 'Todas igrejas' : template.target_audience}
                        </span>
                        {template.show_on_dashboard && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Dashboard
                          </span>
                        )}
                        {template.require_acknowledgment && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Requer confirmação
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplatesDialog(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Leitores em Tempo Real */}
      <Dialog open={readersDialog} onOpenChange={setReadersDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Leitores em Tempo Real
            </DialogTitle>
            <DialogDescription>
              {selectedAnnouncement?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Stats em Tempo Real */}
            {liveStats && (
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{liveStats.total}</div>
                    <p className="text-xs text-muted-foreground">Igrejas alcançadas</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lidos</CardTitle>
                    <Eye className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{liveStats.read}</div>
                    <p className="text-xs text-muted-foreground">
                      {liveStats.readRate}% de leitura
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{liveStats.acknowledged}</div>
                    <p className="text-xs text-muted-foreground">Requerem confirmação</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Não Lidos</CardTitle>
                    <Clock className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{liveStats.unread}</div>
                    <p className="text-xs text-muted-foreground">Aguardando leitura</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Últimas Leituras */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Últimas Leituras
              </h3>
              {liveStats?.recentReads && liveStats.recentReads.length > 0 ? (
                <div className="space-y-2">
                  {liveStats.recentReads.map((reader: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{reader.church_name}</p>
                          {reader.user_name && (
                            <p className="text-xs text-muted-foreground">
                              Por: {reader.user_name}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(reader.read_at)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma leitura registrada ainda</p>
                </div>
              )}
            </div>

            {/* Lista Completa de Leitores */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Todas as Igrejas ({readers.length})
              </h3>
              {readers.length > 0 ? (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {readers.map((reader: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          reader.status === 'read' || reader.status === 'acknowledged'
                            ? 'bg-green-100 dark:bg-green-900/20'
                            : 'bg-gray-100 dark:bg-gray-900/20'
                        }`}>
                          {reader.status === 'read' || reader.status === 'acknowledged' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{reader.church_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {reader.user_name || 'Não atribuído'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={
                          reader.status === 'acknowledged' ? 'bg-blue-100 text-blue-800' :
                          reader.status === 'read' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {reader.status === 'acknowledged' ? 'Confirmado' :
                           reader.status === 'read' ? 'Lido' :
                           'Enviado'}
                        </Badge>
                        {reader.read_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(reader.read_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum destinatário registrado</p>
                </div>
              )}
            </div>

            {/* Nota de Atualização */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 p-3">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Atualização Automática:</strong> Os dados são atualizados automaticamente a cada 30 segundos.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReadersDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
