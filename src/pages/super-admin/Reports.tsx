/**
 * Super Admin - Relatórios de Atividade
 * ============================================
 * URL: /super-admin/reports
 * 
 * Visualizar páginas mais acessadas e estatísticas de acesso.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Activity,
  ChevronLeft,
  TrendingUp,
  Users,
  Clock,
  Monitor,
  FileSpreadsheet,
  FileText,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Pause,
  Play,
  AlertTriangle,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/config';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function SuperAdminReports() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('24h');
  const [topPages, setTopPages] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [hourlyTraffic, setHourlyTraffic] = useState<any[]>([]);
  const [userActivity, setUserActivity] = useState<any[]>([]);
  
  // Filtros avançados
  const [advancedFilters, setAdvancedFilters] = useState({
    path: '',
    user_id: '',
    status: '',
    method: '',
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [comparePrevious, setComparePrevious] = useState(false);
  const [previousStats, setPreviousStats] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshInterval, setRefreshInterval] = useState(60); // segundos
  const [errorDetails, setErrorDetails] = useState<any[]>([]);

  useEffect(() => {
    loadReports();
  }, [period, advancedFilters, comparePrevious]);

  // Polling para atualização automática
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      loadReports();
      setLastUpdated(new Date());
    }, refreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, period, advancedFilters, comparePrevious]);

  const handleManualRefresh = async () => {
    setLoading(true);
    await loadReports();
    setLastUpdated(new Date());
    toast.success('Relatórios atualizados!');
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadTopPages(),
        loadStats(),
        loadHourlyTraffic(),
        loadUserActivity(),
        loadErrorDetails(),
      ]);
      if (comparePrevious) {
        await loadPreviousStats();
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const loadPreviousStats = async () => {
    try {
      const params = new URLSearchParams({ 
        period,
        compare: 'previous',
        ...advancedFilters,
      });

      const response = await fetch(buildApiUrl(`/api/admin/reports/access-stats?${params}`), {
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        setPreviousStats(result.data);
      }
    } catch (error) {
      console.error('Error loading previous stats:', error);
    }
  };

  const loadTopPages = async () => {
    try {
      const params = new URLSearchParams({ period });
      if (advancedFilters.path) params.append('path', advancedFilters.path);
      if (advancedFilters.user_id) params.append('user_id', advancedFilters.user_id);
      if (advancedFilters.status) params.append('status', advancedFilters.status);
      if (advancedFilters.method) params.append('method', advancedFilters.method);

      const response = await fetch(buildApiUrl(`/api/admin/reports/top-pages?${params}`), {
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        setTopPages(result.data);
      }
    } catch (error) {
      console.error('Error loading top pages:', error);
    }
  };

  const loadStats = async () => {
    try {
      const params = new URLSearchParams({ period });
      if (advancedFilters.path) params.append('path', advancedFilters.path);
      if (advancedFilters.user_id) params.append('user_id', advancedFilters.user_id);
      if (advancedFilters.status) params.append('status', advancedFilters.status);
      if (advancedFilters.method) params.append('method', advancedFilters.method);

      const response = await fetch(buildApiUrl(`/api/admin/reports/access-stats?${params}`), {
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

  const loadHourlyTraffic = async () => {
    try {
      const params = new URLSearchParams({ period });
      if (advancedFilters.path) params.append('path', advancedFilters.path);
      if (advancedFilters.user_id) params.append('user_id', advancedFilters.user_id);
      if (advancedFilters.status) params.append('status', advancedFilters.status);
      if (advancedFilters.method) params.append('method', advancedFilters.method);

      const response = await fetch(buildApiUrl(`/api/admin/reports/hourly-traffic?${params}`), {
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        setHourlyTraffic(result.data);
      }
    } catch (error) {
      console.error('Error loading hourly traffic:', error);
    }
  };

  const loadErrorDetails = async () => {
    try {
      const params = new URLSearchParams({ period });
      if (advancedFilters.path) params.append('path', advancedFilters.path);
      if (advancedFilters.user_id) params.append('user_id', advancedFilters.user_id);
      if (advancedFilters.method) params.append('method', advancedFilters.method);

      const response = await fetch(buildApiUrl(`/api/admin/reports/error-details?${params}`), {
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        setErrorDetails(result.data);
      }
    } catch (error) {
      console.error('Error loading error details:', error);
    }
  };

  const loadUserActivity = async () => {
    try {
      const params = new URLSearchParams({ period });
      if (advancedFilters.path) params.append('path', advancedFilters.path);
      if (advancedFilters.user_id) params.append('user_id', advancedFilters.user_id);
      if (advancedFilters.status) params.append('status', advancedFilters.status);
      if (advancedFilters.method) params.append('method', advancedFilters.method);

      const response = await fetch(buildApiUrl(`/api/admin/reports/user-activity?${params}`), {
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        setUserActivity(result.data);
      }
    } catch (error) {
      console.error('Error loading user activity:', error);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams({ 
        period,
        format: 'csv',
        ...advancedFilters,
      });

      const response = await fetch(buildApiUrl(`/api/admin/reports/export?${params}`), {
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-acessos-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('Relatório CSV exportado!');
      } else {
        toast.error('Erro ao exportar CSV');
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Erro ao exportar CSV');
    }
  };

  const handleExportPDF = async () => {
    try {
      const params = new URLSearchParams({ 
        period,
        format: 'pdf',
        ...advancedFilters,
      });

      const response = await fetch(buildApiUrl(`/api/admin/reports/export?${params}`), {
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-acessos-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('Relatório PDF exportado!');
      } else {
        toast.error('Erro ao exportar PDF');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const calculateVariation = (current: number, previous: number) => {
    if (!previous || previous === 0) return null;
    const variation = ((current - previous) / previous) * 100;
    return {
      value: Math.round(variation),
      isPositive: variation >= 0,
    };
  };

  const VariationBadge = ({ current, previous }: { current: number; previous: number }) => {
    const variation = calculateVariation(current, previous);
    if (!variation) return null;
    
    return (
      <span className={`text-xs font-medium ${
        variation.isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        {variation.isPositive ? '↑' : '↓'} {Math.abs(variation.value)}%
      </span>
    );
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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Relatórios de Atividade</h1>
            <p className="text-sm text-muted-foreground">Páginas mais acessadas e estatísticas</p>
            {autoRefresh && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Atualizado em: {lastUpdated.toLocaleTimeString('pt-BR')}
                {refreshInterval < 60 && ` • Próxima em ${refreshInterval}s`}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Últimas 24 horas</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Controle de Auto-Refresh */}
          <div className="flex items-center gap-2 border rounded-md px-3 py-2 bg-muted/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="h-8 w-8 p-0"
              title={autoRefresh ? 'Pausar atualização' : 'Ativar atualização'}
            >
              {autoRefresh ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Select value={refreshInterval.toString()} onValueChange={(v) => setRefreshInterval(parseInt(v))}>
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30s</SelectItem>
                <SelectItem value="60">1min</SelectItem>
                <SelectItem value="180">3min</SelectItem>
                <SelectItem value="300">5min</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            variant="outline"
            onClick={handleManualRefresh}
            disabled={loading}
            className="gap-2"
            title="Atualizar agora"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="gap-2"
            title="Exportar CSV"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">CSV</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            className="gap-2"
            title="Exportar PDF"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">PDF</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="gap-2"
          >
            <Activity className="h-4 w-4" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Filtros Avançados */}
      {showAdvancedFilters && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Filtros Avançados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <Label>Página (path)</Label>
                <Input
                  placeholder="/super-admin/..."
                  value={advancedFilters.path}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, path: e.target.value })}
                />
              </div>

              <div>
                <Label>Método HTTP</Label>
                <Select
                  value={advancedFilters.method || "all"}
                  onValueChange={(value) => setAdvancedFilters({ ...advancedFilters, method: value === "all" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status HTTP</Label>
                <Select
                  value={advancedFilters.status || "all"}
                  onValueChange={(value) => setAdvancedFilters({ ...advancedFilters, status: value === "all" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="200">200 - OK</SelectItem>
                    <SelectItem value="201">201 - Created</SelectItem>
                    <SelectItem value="304">304 - Not Modified</SelectItem>
                    <SelectItem value="400">400 - Bad Request</SelectItem>
                    <SelectItem value="401">401 - Unauthorized</SelectItem>
                    <SelectItem value="403">403 - Forbidden</SelectItem>
                    <SelectItem value="404">404 - Not Found</SelectItem>
                    <SelectItem value="500">500 - Internal Server Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Usuário ID</Label>
                <Input
                  type="number"
                  placeholder="ID do usuário"
                  value={advancedFilters.user_id}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, user_id: e.target.value })}
                />
              </div>

              <div className="md:col-span-4 flex justify-between gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="comparePrevious"
                    checked={comparePrevious}
                    onChange={(e) => setComparePrevious(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="comparePrevious" className="cursor-pointer">
                    Comparar com período anterior
                  </Label>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setAdvancedFilters({
                    path: '',
                    user_id: '',
                    status: '',
                    method: '',
                  })}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          Carregando relatórios...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Acessos</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      Período: {period === '24h' ? '24h' : period === '7d' ? '7 dias' : '30 dias'}
                    </p>
                    {comparePrevious && previousStats && (
                      <VariationBadge 
                        current={stats.totalRequests} 
                        previous={previousStats.totalRequests} 
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatDuration(stats.avgDuration)}</div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">Tempo de resposta</p>
                    {comparePrevious && previousStats && (
                      <VariationBadge 
                        current={stats.avgDuration} 
                        previous={previousStats.avgDuration} 
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuários Únicos</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">Usuários distintos</p>
                    {comparePrevious && previousStats && (
                      <VariationBadge 
                        current={stats.uniqueUsers} 
                        previous={previousStats.uniqueUsers} 
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">IPs Únicos</CardTitle>
                  <Monitor className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.uniqueIPs}</div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">Endereços IP distintos</p>
                    {comparePrevious && previousStats && (
                      <VariationBadge 
                        current={stats.uniqueIPs} 
                        previous={previousStats.uniqueIPs} 
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Páginas Mais Acessadas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Páginas Mais Acessadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topPages.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">#</TableHead>
                        <TableHead>Página</TableHead>
                        <TableHead className="text-right">Visualizações</TableHead>
                        <TableHead className="text-right">Usuários</TableHead>
                        <TableHead className="text-right">IPs</TableHead>
                        <TableHead className="text-right">Tempo Médio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topPages.map((page, idx) => (
                        <TableRow key={page.path}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {idx === 0 && <span className="text-yellow-600">🥇</span>}
                              {idx === 1 && <span className="text-gray-600">🥈</span>}
                              {idx === 2 && <span className="text-orange-600">🥉</span>}
                              {idx > 2 && idx + 1}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{page.path}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary">{page.views}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{page.unique_users}</TableCell>
                          <TableCell className="text-right">{page.unique_ips}</TableCell>
                          <TableCell className="text-right">
                            {formatDuration(page.avg_duration)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum dado de acesso disponível</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gráficos */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Tráfego por Hora - Gráfico de Linha */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Tráfego por Hora (Últimas 24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hourlyTraffic.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={hourlyTraffic}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tickFormatter={(hour) => `${hour.toString().padStart(2, '0')}:00`} />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(hour) => `${hour.toString().padStart(2, '0')}:00`}
                        formatter={(value: any, name: string) => {
                          if (name === 'requests') return [value, 'Requisições'];
                          if (name === 'unique_users') return [value, 'Usuários'];
                          return [value, name];
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="requests" stroke="#8884d8" strokeWidth={2} name="Requisições" />
                      <Line type="monotone" dataKey="unique_users" stroke="#82ca9d" strokeWidth={2} name="Usuários" />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    <p>Nenhum dado de tráfego disponível</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Distribuição de Status - Gráfico de Pizza */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribuição de Status HTTP
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.statusDistribution && stats.statusDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={stats.statusDistribution.map((s: any) => ({
                          name: `HTTP ${s.status}`,
                          value: s.count,
                          percentage: s.percentage,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.statusDistribution.map((entry: any, index: number) => {
                          const status = parseInt(entry.status);
                          let color = '#8884d8';
                          if (status >= 200 && status < 300) color = '#82ca9d';
                          else if (status >= 300 && status < 400) color = '#8884d8';
                          else if (status >= 400 && status < 500) color = '#ffc658';
                          else if (status >= 500) color = '#ff8042';
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Pie>
                      <Tooltip formatter={(value: any, _: string, props: any) => [`${value} (${props.payload.percentage}%)`, props.payload.name]} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                    <p>Nenhuma distribuição de status disponível</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Páginas - Gráfico de Barras */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top 10 Páginas Mais Acessadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topPages.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsBarChart data={topPages.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="path" 
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any, _: string) => {
                        return [value, 'Visualizações'];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="views" fill="#8884d8" name="Visualizações" />
                    <Bar dataKey="unique_users" fill="#82ca9d" name="Usuários Únicos" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                  <p>Nenhuma página disponível</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detalhes de Erros 4xx/5xx */}
          {errorDetails.length > 0 && (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  Erros HTTP (4xx/5xx) - {errorDetails.length} URLs com erros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Status</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead className="w-32">Erros</TableHead>
                        <TableHead className="w-32">Último Erro</TableHead>
                        <TableHead className="w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {errorDetails.map((error: any, idx: number) => (
                        <TableRow key={idx} className={error.status >= 500 ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                          <TableCell>
                            <Badge className={
                              error.status >= 500 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }>
                              {error.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-md">
                            <div className="flex items-center gap-2">
                              <code className="text-sm">{error.path}</code>
                              {error.path.startsWith('http') && (
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                            {error.count > 1 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                <XCircle className="h-3 w-3 inline mr-1" />
                                {error.count} ocorrências
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-right font-medium">
                              {error.count}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(error.last_occurrence).toLocaleString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {error.status >= 500 ? 'Crítico' : 'Atenção'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-700 dark:text-red-300">
                    <strong>Dica:</strong> Erros 5xx indicam problemas no servidor. Erros 4xx podem ser URLs inválidas ou recursos não encontrados.
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Atividade por Usuário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Atividade por Usuário
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userActivity.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                        <TableHead className="text-right">Páginas</TableHead>
                        <TableHead className="text-right">Tempo Médio</TableHead>
                        <TableHead className="text-right">Última Atividade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userActivity.map((user) => (
                        <TableRow key={user.user_id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.user_name || 'N/A'}</div>
                              <div className="text-xs text-muted-foreground">{user.user_email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge>{user.total_actions}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{user.unique_pages}</TableCell>
                          <TableCell className="text-right">
                            {formatDuration(user.avg_duration)}
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {new Date(user.last_activity).toLocaleString('pt-BR')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma atividade de usuário disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Componente Badge simples
function Badge({ children, variant = 'default', className = '' }: any) {
  const variants = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-muted text-muted-foreground',
  };
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant as keyof typeof variants]} ${className}`}>
      {children}
    </span>
  );
}
