/**
 * Super Admin - Dashboard de Segurança
 * ============================================
 * URL: /super-admin/security
 * 
 * Visualizar sessões ativas, IPs bloqueados e tentativas de login.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  ChevronLeft,
  Users,
  Ban,
  AlertTriangle,
  Lock,
  Trash2,
  RefreshCw,
  Activity,
  Monitor,
  Globe,
  Clock,
  MoreVertical,
  LogOut,
  UserX,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SuperAdminSecurity() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'blocked'>('overview');
  
  // Filtros e busca para sessões
  const [sessionFilters, setSessionFilters] = useState({
    search: '',
    status: '',
    user_id: '',
  });
  const [selectedSessions, setSelectedSessions] = useState<number[]>([]);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadStats(),
        loadSessions(),
        loadBlockedIPs(),
      ]);
    } catch (error) {
      console.error('Error loading security data:', error);
      toast.error('Erro ao carregar dados de segurança');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/security/stats', {
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

  const loadSessions = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/security/sessions?limit=10', {
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        setSessions(result.data.sessions);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const loadBlockedIPs = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/security/blocked-ips?limit=10', {
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        setBlockedIPs(result.data.blockedIPs);
      }
    } catch (error) {
      console.error('Error loading blocked IPs:', error);
    }
  };

  const handleRevokeSession = async (sessionId: number, userName?: string) => {
    if (!confirm(`Tem certeza que deseja revogar esta sessão${userName ? ` de ${userName}` : ''}? O usuário será desconectado imediatamente.`)) return;

    try {
      const response = await fetch(`http://localhost:3000/api/admin/security/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Sessão revogada!', {
          description: userName ? `Usuário ${userName} foi desconectado.` : 'Usuário foi desconectado.',
        });
        loadSessions();
        loadStats();
      } else {
        toast.error(result.error || 'Erro ao revogar sessão');
      }
    } catch (error) {
      console.error('Error revoking session:', error);
      toast.error('Erro ao revogar sessão');
    }
  };

  const handleRevokeMultipleSessions = async () => {
    if (selectedSessions.length === 0) {
      toast.warning('Selecione pelo menos uma sessão');
      return;
    }

    if (!confirm(`ATENÇÃO: Isso irá desconectar ${selectedSessions.length} usuário(s) selecionado(s) imediatamente!\n\nTem certeza?`)) return;

    try {
      setLoading(true);
      const promises = selectedSessions.map(id =>
        fetch(`http://localhost:3000/api/admin/security/sessions/${id}`, {
          method: 'DELETE',
          headers: {
            'x-user-role': 'super_admin',
          },
        })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.ok).length;

      toast.success(`${successCount}/${selectedSessions.length} sessões revogadas!`, {
        description: 'Os usuários foram desconectados.',
      });
      setSelectedSessions([]);
      loadSessions();
      loadStats();
    } catch (error) {
      console.error('Error revoking sessions:', error);
      toast.error('Erro ao revogar sessões');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!confirm('⚠️ ATENÇÃO CRÍTICA!\n\nIsso irá desconectar TODOS os usuários do sistema imediatamente, incluindo você mesmo!\n\nUse apenas em emergências de segurança.\n\nTem certeza?')) return;

    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/admin/security/sessions/revoke-all', {
        method: 'DELETE',
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Todas as sessões foram revogadas!', {
          description: `${result.revokedCount} usuários foram desconectados.`,
        });
        loadSessions();
        loadStats();
      } else {
        toast.error(result.error || 'Erro ao revogar todas as sessões');
      }
    } catch (error) {
      console.error('Error revoking all sessions:', error);
      toast.error('Erro ao revogar todas as sessões');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeUserSessions = async (userId: number, userName: string) => {
    if (!confirm(`Isso irá desconectar TODAS as sessões de ${userName} (${selectedSessions.filter(id => sessions.find(s => s.id === id && s.user_id === userId)).length || 'todas'} sessões).\n\nTem certeza?`)) return;

    try {
      setLoading(true);
      // Get all sessions for this user
      const userSessionIds = sessions.filter(s => s.user_id === userId).map(s => s.id);
      
      const promises = userSessionIds.map(id =>
        fetch(`http://localhost:3000/api/admin/security/sessions/${id}`, {
          method: 'DELETE',
          headers: {
            'x-user-role': 'super_admin',
          },
        })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.ok).length;

      toast.success(`${successCount} sessão(ões) de ${userName} revogadas!`, {
        description: 'Usuário foi desconectado de todos os dispositivos.',
      });
      setSelectedSessions(prev => prev.filter(id => !userSessionIds.includes(id)));
      loadSessions();
      loadStats();
    } catch (error) {
      console.error('Error revoking user sessions:', error);
      toast.error('Erro ao revogar sessões do usuário');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectSession = (sessionId: number) => {
    setSelectedSessions(prev =>
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const toggleSelectAllSessions = () => {
    if (selectedSessions.length === sessions.length) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(sessions.map(s => s.id));
    }
  };

  const handleUnblockIP = async (ipId: number) => {
    if (!confirm('Tem certeza que deseja desbloquear este IP?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/admin/security/blocked-ips/${ipId}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success('IP desbloqueado!');
        loadBlockedIPs();
        loadStats();
      } else {
        toast.error(result.error || 'Erro ao desbloquear IP');
      }
    } catch (error) {
      console.error('Error unblocking IP:', error);
      toast.error('Erro ao desbloquear IP');
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${diffDays}d atrás`;
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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard de Segurança</h1>
            <p className="text-sm text-muted-foreground">
              Monitore sessões, IPs bloqueados e tentativas de login
            </p>
          </div>
        </div>
        <Button onClick={loadSecurityData} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Tabs de Navegação */}
      <div className="mb-6 flex gap-2 border-b">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('overview')}
          className="gap-2"
        >
          <Shield className="h-4 w-4" />
          Visão Geral
        </Button>
        <Button
          variant={activeTab === 'sessions' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('sessions')}
          className="gap-2"
        >
          <Users className="h-4 w-4" />
          Sessões Ativas
        </Button>
        <Button
          variant={activeTab === 'blocked' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('blocked')}
          className="gap-2"
        >
          <Ban className="h-4 w-4" />
          IPs Bloqueados
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          Carregando dados de segurança...
        </div>
      ) : (
        <>
          {/* Visão Geral */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              {/* Cards de Estatísticas */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
                    <Users className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeSessions}</div>
                    <p className="text-xs text-muted-foreground">Usuários logados agora</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">IPs Bloqueados</CardTitle>
                    <Ban className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.blockedIPs}</div>
                    <p className="text-xs text-muted-foreground">IPs na lista negra</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tentativas Falhas (24h)</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.failedAttempts}</div>
                    <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Contas Bloqueadas</CardTitle>
                    <Lock className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.lockedAccounts}</div>
                    <p className="text-xs text-muted-foreground">Bloqueadas temporariamente</p>
                  </CardContent>
                </Card>
              </div>

              {/* Top IPs com Tentativas */}
              {stats.topIPs && stats.topIPs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Top IPs com Mais Tentativas Falhas (24h)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>IP</TableHead>
                          <TableHead className="text-right">Tentativas</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.topIPs.map((ip: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono">
                              <Globe className="h-3 w-3 inline mr-2 text-muted-foreground" />
                              {ip.ip_address}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="destructive">{ip.attempts}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Sessões Recentes */}
              {sessions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="h-5 w-5" />
                      Sessões Ativas Recentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuário</TableHead>
                          <TableHead>IP</TableHead>
                          <TableHead>Atividade</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sessions.slice(0, 5).map((session: any) => (
                          <TableRow key={session.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{session.user_name || 'N/A'}</div>
                                <div className="text-xs text-muted-foreground">{session.user_email}</div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              <Globe className="h-3 w-3 inline mr-2 text-muted-foreground" />
                              {session.ip_address}
                            </TableCell>
                            <TableCell>
                              <Clock className="h-3 w-3 inline mr-2 text-muted-foreground" />
                              {formatRelativeTime(session.last_activity)}
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                session.status === 'Ativa' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }>
                                {session.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Sessões Ativas */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              {/* Controles de Sessão */}
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Sessões</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                      variant="outline"
                      onClick={handleRevokeMultipleSessions}
                      disabled={selectedSessions.length === 0}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Revogar Selecionadas ({selectedSessions.length})
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleRevokeAllSessions}
                      className="gap-2"
                    >
                      <Ban className="h-4 w-4" />
                      Revogar TODAS as Sessões
                    </Button>
                  </div>

                  {/* Filtros */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label>Buscar por usuário</Label>
                      <Input
                        placeholder="Email ou nome..."
                        value={sessionFilters.search}
                        onChange={(e) => setSessionFilters({ ...sessionFilters, search: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select
                        value={sessionFilters.status || "all"}
                        onValueChange={(value: string) => setSessionFilters({ ...sessionFilters, status: value === "all" ? "" : value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="Ativa">Ativas</SelectItem>
                          <SelectItem value="Expirada">Expiradas</SelectItem>
                          <SelectItem value="Inativa">Inativas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Sessões */}
              <Card>
                <CardHeader>
                  <CardTitle>Sessões Ativas</CardTitle>
                </CardHeader>
                <CardContent>
                  {sessions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <input
                              type="checkbox"
                              checked={selectedSessions.length === sessions.length && sessions.length > 0}
                              onChange={toggleSelectAllSessions}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                          </TableHead>
                          <TableHead>Usuário</TableHead>
                          <TableHead>IP</TableHead>
                          <TableHead>Dispositivo</TableHead>
                          <TableHead>Criada</TableHead>
                          <TableHead>Última Atividade</TableHead>
                          <TableHead>Expira</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-20">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sessions.map((session: any) => (
                          <TableRow key={session.id}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedSessions.includes(session.id)}
                                onChange={() => toggleSelectSession(session.id)}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{session.user_name || 'N/A'}</div>
                                <div className="text-xs text-muted-foreground">{session.user_email}</div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              <Globe className="h-3 w-3 inline mr-2 text-muted-foreground" />
                              {session.ip_address}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                              <Monitor className="h-3 w-3 inline mr-2 text-muted-foreground" />
                              {session.user_agent}
                            </TableCell>
                            <TableCell className="text-sm">
                              <Clock className="h-3 w-3 inline mr-2 text-muted-foreground" />
                              {formatDateTime(session.created_at)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {formatRelativeTime(session.last_activity)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDateTime(session.expires_at)}
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                session.status === 'Ativa' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }>
                                {session.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleRevokeSession(session.id, session.user_name)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Revogar esta sessão
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleRevokeUserSessions(session.user_id, session.user_name)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Revogar todas de {session.user_name?.split(' ')[0] || 'usuário'}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma sessão ativa encontrada</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* IPs Bloqueados */}
          {activeTab === 'blocked' && (
            <Card>
              <CardHeader>
                <CardTitle>IPs Bloqueados</CardTitle>
              </CardHeader>
              <CardContent>
                {blockedIPs.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>IP</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Bloqueado Em</TableHead>
                        <TableHead>Expira Em</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blockedIPs.map((ip: any) => (
                        <TableRow key={ip.id}>
                          <TableCell className="font-mono">
                            <Globe className="h-3 w-3 inline mr-2 text-muted-foreground" />
                            {ip.ip_address}
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-sm">
                            {ip.reason || 'N/A'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDateTime(ip.created_at)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {ip.is_permanent ? 'Nunca' : formatDateTime(ip.blocked_until)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={ip.is_permanent ? 'destructive' : 'secondary'}>
                              {ip.is_permanent ? 'Permanente' : 'Temporário'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              ip.status === 'Ativo' 
                                ? 'bg-red-100 text-red-800'
                                : ip.status === 'Expirado'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }>
                              {ip.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnblockIP(ip.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Ban className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum IP bloqueado encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
