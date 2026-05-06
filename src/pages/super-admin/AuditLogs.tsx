/**
 * Super Admin - Logs de Auditoria
 * ============================================
 * URL: /super-admin/audit-logs
 * 
 * Visualizar logs de auditoria da plataforma.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Shield,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Building2,
  Activity,
  Clock,
  Monitor,
  FileText,
  ChevronLeft,
  ChevronRight,
  Trash2,
  FileCheck,
  Trash,
} from 'lucide-react';
import { toast } from 'sonner';

// Mapeamento de ações para ícones e cores
const actionConfig: Record<string, { icon: string; color: string; label: string }> = {
  // Igrejas
  'church.created': { icon: '🏛️', color: 'bg-green-100 text-green-800', label: 'Igreja Criada' },
  'church.updated': { icon: '✏️', color: 'bg-blue-100 text-blue-800', label: 'Igreja Atualizada' },
  'church.deleted': { icon: '🗑️', color: 'bg-red-100 text-red-800', label: 'Igreja Excluída' },
  'church.suspended': { icon: '⛔', color: 'bg-orange-100 text-orange-800', label: 'Igreja Suspensa' },
  'church.reactivated': { icon: '✅', color: 'bg-green-100 text-green-800', label: 'Igreja Reativada' },
  'church.plan_changed': { icon: '💳', color: 'bg-purple-100 text-purple-800', label: 'Plano Alterado' },
  
  // Usuários
  'user.created': { icon: '👤', color: 'bg-blue-100 text-blue-800', label: 'Usuário Criado' },
  'user.updated': { icon: '✏️', color: 'bg-blue-100 text-blue-800', label: 'Usuário Atualizado' },
  'user.deleted': { icon: '🗑️', color: 'bg-red-100 text-red-800', label: 'Usuário Excluído' },
  'user.banned': { icon: '🚫', color: 'bg-red-100 text-red-800', label: 'Usuário Banido' },
  'user.reactivated': { icon: '✅', color: 'bg-green-100 text-green-800', label: 'Usuário Reativado' },
  'user.password_reset': { icon: '🔑', color: 'bg-yellow-100 text-yellow-800', label: 'Senha Resetada' },
  'user.login': { icon: '🔐', color: 'bg-gray-100 text-gray-800', label: 'Login' },
  'user.logout': { icon: '🔓', color: 'bg-gray-100 text-gray-800', label: 'Logout' },
  
  // Financeiro
  'invoice.created': { icon: '📄', color: 'bg-blue-100 text-blue-800', label: 'Fatura Criada' },
  'invoice.paid': { icon: '💰', color: 'bg-green-100 text-green-800', label: 'Fatura Paga' },
  'invoice.cancelled': { icon: '❌', color: 'bg-red-100 text-red-800', label: 'Fatura Cancelada' },
  'payment.received': { icon: '💵', color: 'bg-green-100 text-green-800', label: 'Pagamento Recebido' },
  
  // Sistema
  'export.data': { icon: '📥', color: 'bg-purple-100 text-purple-800', label: 'Exportação de Dados' },
  'settings.changed': { icon: '⚙️', color: 'bg-gray-100 text-gray-800', label: 'Configurações Alteradas' },
};

export default function SuperAdminAuditLogs() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0, limit: 20 });
  const [filters, setFilters] = useState({
    action: '',
    church_id: '',
    user_id: '',
    date_from: '',
    date_to: '',
    search: '',
  });
  const [selectedLogs, setSelectedLogs] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Carregar logs e stats
  useEffect(() => {
    loadLogs();
    loadStats();
  }, [filters, pagination.page, pagination.limit]);

  const loadLogs = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      // Adicionar apenas filtros com valor
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const response = await fetch(`http://localhost:3000/api/admin/audit-logs?${params}`, {
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        setLogs(result.data.logs);
        setPagination(prev => ({
          ...prev,
          page: result.data.pagination.page,
          total: result.data.pagination.total,
          totalPages: result.data.pagination.totalPages,
        }));
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.error('Erro ao carregar logs de auditoria');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/audit-logs/stats', {
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

  const handleExportCSV = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/audit-logs/export/csv', {
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('CSV exportado com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao exportar CSV');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  const getActionConfig = (action: string) => {
    return actionConfig[action] || {
      icon: '📝',
      color: 'bg-gray-100 text-gray-800',
      label: action,
    };
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      church_id: '',
      user_id: '',
      date_from: '',
      date_to: '',
      search: '',
    });
    setSelectedLogs([]);
  };

  // Selecionar/desmarcar log individual
  const toggleSelectLog = (logId: number) => {
    setSelectedLogs(prev =>
      prev.includes(logId)
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    );
  };

  // Selecionar/desmarcar todos
  const toggleSelectAll = () => {
    if (selectedLogs.length === logs.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(logs.map((log: any) => log.id));
    }
  };

  // Excluir logs selecionados
  const handleDeleteSelected = async () => {
    if (selectedLogs.length === 0) {
      toast.warning('Selecione pelo menos um log para excluir');
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir ${selectedLogs.length} log(s)? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch('http://localhost:3000/api/admin/audit-logs/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify({ logIds: selectedLogs }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`${result.deletedCount || selectedLogs.length} log(s) excluído(s) com sucesso!`);
        setSelectedLogs([]);
        loadLogs();
        loadStats();
      } else {
        toast.error(result.error || 'Erro ao excluir logs');
      }
    } catch (error) {
      console.error('Error deleting logs:', error);
      toast.error('Erro ao excluir logs');
    } finally {
      setIsDeleting(false);
    }
  };

  // Excluir log individual
  const handleDeleteLog = async (logId: number) => {
    if (!confirm('Tem certeza que deseja excluir este log? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/admin/audit-logs/${logId}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Log excluído com sucesso!');
        loadLogs();
        loadStats();
      } else {
        toast.error(result.error || 'Erro ao excluir log');
      }
    } catch (error) {
      console.error('Error deleting log:', error);
      toast.error('Erro ao excluir log');
    }
  };

  // Exportar PDF
  const handleExportPDF = async () => {
    try {
      const params = new URLSearchParams({
        limit: '100',
      });

      // Adicionar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const response = await fetch(`http://localhost:3000/api/admin/audit-logs/export/pdf?${params}`, {
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('PDF exportado com sucesso!');
      } else {
        toast.error('Erro ao exportar PDF');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/super-admin/dashboard')}
          className="gap-2 w-full sm:w-auto"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Logs de Auditoria</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Acompanhe todas as ações realizadas na plataforma</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button onClick={handleExportPDF} variant="outline" className="gap-2 flex-1 sm:flex-none">
            <FileCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar PDF</span>
            <span className="sm:hidden">PDF</span>
          </Button>
          <Button onClick={handleExportCSV} variant="outline" className="gap-2 flex-1 sm:flex-none">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>
          {selectedLogs.length > 0 && (
            <Button
              onClick={handleDeleteSelected}
              variant="destructive"
              className="gap-2 flex-1 sm:flex-none"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Excluir ({selectedLogs.length})</span>
              <span className="sm:hidden">{selectedLogs.length}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="mb-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Logs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.last24h.toLocaleString()} nas últimas 24h
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Últimas 24h</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.last24h.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.last7d.toLocaleString()} nos últimos 7 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ações Únicas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.actions?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Tipos de ações diferentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.topUsers?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Com mais atividades</p>
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
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Ação ou detalhes..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Ação</label>
              <Select
                value={filters.action || "all"}
                onValueChange={(value) => setFilters({ ...filters, action: value === "all" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as ações" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as ações</SelectItem>
                  {Object.entries(actionConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Período</label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                  className="flex-1"
                />
                <span className="flex items-center">até</span>
                <Input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Logs de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-muted-foreground">Carregando logs...</div>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex h-64 items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Shield className="mx-auto mb-2 h-12 w-12 text-muted-foreground/50" />
                <p>Nenhum log encontrado</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedLogs.length === logs.length && logs.length > 0}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-border"
                      />
                    </TableHead>
                    <TableHead className="w-20">ID</TableHead>
                    <TableHead className="w-32">Ação</TableHead>
                    <TableHead>Detalhes</TableHead>
                    <TableHead className="w-48">Usuário</TableHead>
                    <TableHead className="w-48">Igreja</TableHead>
                    <TableHead className="w-32">IP</TableHead>
                    <TableHead className="w-40">Data/Hora</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log: any) => {
                    const config = getActionConfig(log.action);
                    const isSelected = selectedLogs.includes(log.id);
                    return (
                      <TableRow key={log.id} className={`hover:bg-muted/50 ${isSelected ? 'bg-muted/30' : ''}`}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectLog(log.id)}
                            className="h-4 w-4 rounded border-border"
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          #{log.id}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${config.color} gap-1`}>
                            <span>{config.icon}</span>
                            <span className="hidden lg:inline">{config.label}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate text-sm" title={JSON.stringify(log.details)}>
                            {log.details
                              ? Object.entries(log.details)
                                  .slice(0, 2)
                                  .map(([k, v]) => `${k}: ${v}`)
                                  .join(', ')
                              : '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.user ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div className="text-sm">
                                <div className="font-medium">{log.user.name}</div>
                                <div className="text-xs text-muted-foreground">{log.user.email}</div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Sistema</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {log.church ? (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{log.church.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Monitor className="h-3 w-3 text-muted-foreground" />
                            <span className="font-mono text-xs">{log.ipAddress || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(log.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLog(log.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Paginação */}
          {!loading && logs.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Página {pagination.page} de {pagination.totalPages} ({pagination.total.toLocaleString()} logs)
                </div>
                <Select
                  value={pagination.limit.toString()}
                  onValueChange={(value) => setPagination({ ...pagination, limit: parseInt(value), page: 1 })}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="20" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 / pág</SelectItem>
                    <SelectItem value="20">20 / pág</SelectItem>
                    <SelectItem value="50">50 / pág</SelectItem>
                    <SelectItem value="100">100 / pág</SelectItem>
                  </SelectContent>
                </Select>
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
        </CardContent>
      </Card>
    </div>
  );
}
