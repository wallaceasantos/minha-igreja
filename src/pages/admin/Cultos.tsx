/**
 * Admin: Gestão de Cultos Fixos
 * CRUD completo de cultos da igreja
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { buildApiUrl } from '@/lib/config';

interface Service {
  id: number;
  church_id: number;
  day_of_week: string;
  service_name: string;
  service_time: string;
  description: string | null;
  is_active: number;
  created_at: string;
}

export default function Cultos() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    days_of_week: [] as string[],
    service_name: '',
    service_time: '',
    description: '',
    is_active: true
  });

  const diasSemana: Record<string, string> = {
    Sunday: 'Domingo',
    Monday: 'Segunda-feira',
    Tuesday: 'Terça-feira',
    Wednesday: 'Quarta-feira',
    Thursday: 'Quinta-feira',
    Friday: 'Sexta-feira',
    Saturday: 'Sábado'
  };

  const diasSemanaOrdem = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const churchId = localStorage.getItem('churchId');
      const response = await fetch(buildApiUrl(`/api/services?church_id=${churchId}`));
      const result = await response.json();

      if (result.success) {
        setServices(result.data);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Erro ao carregar cultos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData({ 
      days_of_week: [],
      service_name: '',
      service_time: '',
      description: '',
      is_active: true
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      days_of_week: [service.day_of_week],
      service_name: service.service_name,
      service_time: service.service_time,
      description: service.description || '',
      is_active: service.is_active === 1
    });
    setDialogOpen(true);
  };

  const toggleDiaSemana = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day]
    }));
  };

  const getPeriodoLabel = (days: string[]): string => {
    if (days.length === 0) return '';
    
    const firstDayKey = days[0]!;
    if (days.length === 1) return diasSemana[firstDayKey] || firstDayKey;

    const sortedDays = days.sort((a, b) => diasSemanaOrdem.indexOf(a) - diasSemanaOrdem.indexOf(b));
    const firstDay = diasSemana[sortedDays[0]!] || sortedDays[0]!;
    const lastDayIndex = sortedDays.length - 1;
    const lastDay = diasSemana[sortedDays[lastDayIndex]!] || sortedDays[lastDayIndex]!;

    // Verifica se são dias consecutivos
    const firstIndex = diasSemanaOrdem.indexOf(sortedDays[0]!);
    const lastIndex = diasSemanaOrdem.indexOf(sortedDays[lastDayIndex]!);

    if (firstIndex >= 0 && lastIndex >= 0 && lastIndex - firstIndex + 1 === days.length) {
      return `${firstDay} a ${lastDay}`;
    }

    return days.map(d => diasSemana[d] || d).join(', ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação: pelo menos um dia selecionado
    if (formData.days_of_week.length === 0) {
      toast.error('Selecione pelo menos um dia da semana');
      return;
    }
    
    try {
      const churchId = localStorage.getItem('churchId');
      const url = editingService 
        ? buildApiUrl(`/api/services/${editingService.id}`)
        : buildApiUrl(`/api/services`);
      
      const params = new URLSearchParams({ church_id: churchId || '' });
      const method = editingService ? 'PUT' : 'POST';

      // Se for edição, atualiza apenas um culto
      if (editingService) {
        const response = await fetch(`${url}?${params}`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            day_of_week: formData.days_of_week[0],
            service_name: formData.service_name,
            service_time: formData.service_time,
            description: formData.description,
            is_active: formData.is_active
          })
        });

        const result = await response.json();

        if (result.success) {
          toast.success('Culto atualizado!');
          setDialogOpen(false);
          loadServices();
        } else {
          toast.error(result.error || 'Erro ao salvar culto');
        }
      } else {
        // Se for criação, cria um culto para cada dia selecionado
        const promises = formData.days_of_week.map(day => 
          fetch(`${url}?${params}`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              day_of_week: day,
              service_name: formData.service_name,
              service_time: formData.service_time,
              description: formData.description,
              is_active: formData.is_active
            })
          })
        );

        await Promise.all(promises);
        
        toast.success(`${formData.days_of_week.length} culto(s) cadastrado(s)!`);
        setDialogOpen(false);
        loadServices();
      }
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Erro ao salvar culto');
    }
  };

  const handleToggleStatus = async (service: Service) => {
    try {
      const churchId = localStorage.getItem('churchId');
      const response = await fetch(buildApiUrl(`/api/services/${service.id}?church_id=${churchId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day_of_week: service.day_of_week,
          service_name: service.service_name,
          service_time: service.service_time,
          description: service.description,
          is_active: !service.is_active
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(service.is_active ? 'Culto inativado!' : 'Culto reativado!');
        loadServices();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '-';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  // Agrupar cultos por nome e horário
  const agruparCultos = () => {
    const grupos: Record<string, Service[]> = {};
    
    services.forEach(service => {
      const key = `${service.service_name}-${service.service_time}`;
      if (!grupos[key]) {
        grupos[key] = [];
      }
      grupos[key].push(service);
    });
    
    return grupos;
  };

  return (
    <div className="container px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/dashboard')}
            className="gap-2 min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">🙏 Cultos Fixos</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie os horários dos cultos semanais da igreja
            </p>
          </div>
        </div>
        <Button onClick={handleOpenCreate} className="min-h-[44px]">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Adicionar Culto</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cultos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
            <p className="text-xs text-muted-foreground">Cultos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cultos Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {services.filter(s => s.is_active === 1).length}
            </div>
            <p className="text-xs text-muted-foreground">Cultos ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cultos Inativos</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {services.filter(s => s.is_active === 0).length}
            </div>
            <p className="text-xs text-muted-foreground">Cultos inativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Grade de Cultos Semanais</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Carregando cultos...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum culto cadastrado</p>
              <p className="text-sm mt-2">
                Comece cadastrando o primeiro culto da igreja
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Nome do Culto</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(agruparCultos()).map(([key, services]) => {
                  const dias = services.map(s => s.day_of_week);
                  const periodo = getPeriodoLabel(dias);
                  const firstService = services[0];

                  if (!firstService) return null;

                  return (
                    <TableRow key={key}>
                      <TableCell className="font-medium">
                        <Badge variant="outline" className="text-xs">
                          {periodo}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{firstService.service_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {formatTime(firstService.service_time)}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm">
                        {firstService.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={firstService.is_active ? 'default' : 'secondary'}>
                          {firstService.is_active ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Ativo
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Inativo
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => firstService && handleToggleStatus(firstService)}
                            title={firstService?.is_active ? 'Inativar culto' : 'Reativar culto'}
                            className="min-h-[44px] min-w-[44px]"
                          >
                            {firstService?.is_active ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => firstService && handleOpenEdit(firstService)}
                            className="min-h-[44px] min-w-[44px]"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(`Excluir todos os ${services.length} cultos?`)) {
                                Promise.all(
                                  services.map(s =>
                                    fetch(buildApiUrl(`/api/services/${s.id}?church_id=${localStorage.getItem('churchId')}`), {
                                      method: 'DELETE'
                                    })
                                  )
                                ).then(() => {
                                  toast.success(`${services.length} culto(s) excluído(s)!`);
                                  loadServices();
                                });
                              }
                            }}
                            className="min-h-[44px] min-w-[44px]"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
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

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto sm:rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editingService ? 'Editar Culto' : 'Novo Culto'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Dias da Semana *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                {diasSemanaOrdem.map((day) => (
                  <Button
                    key={day}
                    type="button"
                    variant={formData.days_of_week.includes(day) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleDiaSemana(day)}
                    className="justify-start min-h-[44px] text-sm"
                  >
                    {formData.days_of_week.includes(day) && (
                      <CheckCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                    )}
                    <span className="truncate">{diasSemana[day]}</span>
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Selecione um ou mais dias para este culto
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Horário *</label>
                <Input
                  type="time"
                  value={formData.service_time}
                  onChange={(e) => setFormData({ ...formData, service_time: e.target.value })}
                  required
                  className="min-h-[44px] [&::-webkit-calendar-picker-indicator]:opacity-100"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  💡 Formato 24 horas (ex: 06:00, 14:30, 19:00)
                </p>
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  O formato de exibição (AM/PM ou 24h) depende da configuração do seu navegador
                </p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Nome do Culto *</label>
                <Input
                  value={formData.service_name}
                  onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                  placeholder="Ex: Tempo de Oração"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Descrição (opcional)</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: No Templo MIR ou Instagram @oficialmir"
                className="min-h-[80px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4"
              />
              <label htmlFor="is_active" className="text-sm">
                Culto ativo
              </label>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="min-h-[44px]">
                Cancelar
              </Button>
              <Button type="submit" className="min-h-[44px]">
                {editingService ? 'Salvar Alterações' : `Cadastrar ${formData.days_of_week.length > 0 ? `${formData.days_of_week.length} Culto(s)` : 'Culto'}`}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
