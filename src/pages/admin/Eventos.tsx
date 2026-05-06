/**
 * Admin: Gestão de Eventos
 * CRUD completo de eventos da igreja
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
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
import { useNavigate } from 'react-router-dom';

interface Event {
  id: number;
  title: string;
  description: string | null;
  start_datetime: string;
  end_datetime: string | null;
  location: string | null;
  address: string | null;
  event_type: string;
  status: string;
  created_at: string;
}

interface EventStats {
  total: number;
  upcoming: number;
  past: number;
}

export default function Eventos() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<EventStats>({ total: 0, upcoming: 0, past: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_datetime: '',
    end_datetime: '',
    location: '',
    address: '',
    event_type: 'evento',
    status: 'scheduled'
  });

  useEffect(() => {
    loadEvents();
    loadStats();
  }, []);

  const loadEvents = async () => {
    try {
      const churchId = localStorage.getItem('churchId');
      const params = new URLSearchParams({
        church_id: churchId || ''
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`http://localhost:3000/api/events?${params}`);
      const result = await response.json();

      if (result.success) {
        setEvents(result.data);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const churchId = localStorage.getItem('churchId');
      const response = await fetch(`http://localhost:3000/api/events/stats/overview?church_id=${churchId}`);
      const result = await response.json();

      if (result.success) {
        setStats({
          total: result.data.total || 0,
          upcoming: result.data.upcoming || 0,
          past: result.data.past || 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSearch = () => {
    loadEvents();
  };

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormData({ 
      title: '', 
      description: '', 
      start_datetime: '', 
      end_datetime: '',
      location: '',
      address: '',
      event_type: 'evento',
      status: 'scheduled'
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      start_datetime: event.start_datetime ? event.start_datetime.substring(0, 16) : '',
      end_datetime: event.end_datetime ? event.end_datetime.substring(0, 16) : '',
      location: event.location || '',
      address: event.address || '',
      event_type: event.event_type || 'evento',
      status: event.status || 'scheduled'
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const churchId = localStorage.getItem('churchId');
      const url = editingEvent 
        ? `http://localhost:3000/api/events/${editingEvent.id}`
        : `http://localhost:3000/api/events`;
      
      const params = new URLSearchParams({ church_id: churchId || '' });
      const method = editingEvent ? 'PUT' : 'POST';

      const response = await fetch(`${url}?${params}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editingEvent ? 'Evento atualizado!' : 'Evento cadastrado!');
        setDialogOpen(false);
        loadEvents();
        loadStats();
      } else {
        toast.error(result.error || 'Erro ao salvar evento');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Erro ao salvar evento');
    }
  };

  const handleDelete = async (eventId: number) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;

    try {
      const churchId = localStorage.getItem('churchId');
      const response = await fetch(`http://localhost:3000/api/events/${eventId}?church_id=${churchId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Evento excluído!');
        loadEvents();
        loadStats();
      } else {
        toast.error(result.error || 'Erro ao excluir evento');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Erro ao excluir evento');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string }> = {
      scheduled: { label: 'Agendado', color: 'bg-blue-500' },
      active: { label: 'Ativo', color: 'bg-green-500' },
      completed: { label: 'Completo', color: 'bg-gray-500' },
      cancelled: { label: 'Cancelado', color: 'bg-red-500' }
    };
    const config = statusConfig[status] || { label: status, color: 'bg-gray-500' };
    return (
      <Badge className={config.color}>
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
          <div>
            <h1 className="text-3xl font-bold mb-2">📅 Eventos</h1>
            <p className="text-muted-foreground">
              Crie e gerencie eventos e cultos
            </p>
          </div>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Eventos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Eventos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
            <p className="text-xs text-muted-foreground">
              Eventos futuros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Passados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.past}</div>
            <p className="text-xs text-muted-foreground">
              Eventos realizados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Carregando eventos...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum evento cadastrado</p>
              <p className="text-sm mt-2">
                Comece criando o primeiro evento da igreja
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{formatDate(event.start_datetime)}</TableCell>
                    <TableCell>{event.location || '-'}</TableCell>
                    <TableCell>
                      {getStatusBadge(event.status)}
                    </TableCell>
                    <TableCell>
                      {new Date(event.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(event)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(event.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? 'Editar Evento' : 'Novo Evento'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Título *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Culto de Celebração"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do evento"
                className="w-full min-h-[80px] border rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Data de Início *</label>
                <Input
                  type="datetime-local"
                  value={formData.start_datetime}
                  onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Formato: MM-DD-AAAA HH:MM (ex: 05-01-2026 19:00)
                </p>
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Horário: AM/PM (ex: 07:00 PM = 19:00, 09:00 AM = 09:00)
                </p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Data de Término</label>
                <Input
                  type="datetime-local"
                  value={formData.end_datetime}
                  onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Opcional - Preencha se houver horário de término definido
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Evento</label>
              <select
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="culto">Culto</option>
                <option value="evento">Evento</option>
                <option value="reuniao">Reunião</option>
                <option value="retiro">Retiro</option>
                <option value="congresso">Congresso</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Local</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Templo Principal"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Endereço</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ex: Rua das Flores, 123"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="scheduled">Agendado</option>
                <option value="active">Ativo</option>
                <option value="completed">Completo</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingEvent ? 'Salvar Alterações' : 'Cadastrar Evento'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
