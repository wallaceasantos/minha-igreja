/**
 * Super Admin - Gerenciamento de Domínios Próprios
 * ============================================
 * URL: /super-admin/domains
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Globe,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  ArrowLeft,
  Eye,
  Mail,
  RefreshCw
} from 'lucide-react';

interface DomainRequest {
  id: number;
  church_id: number;
  church_name: string;
  church_email: string;
  requested_domain: string;
  status: 'pending' | 'configured' | 'active' | 'rejected';
  dns_verified: number;
  created_at: string;
  configured_at: string | null;
  activated_at: string | null;
}

export default function SuperAdminDomains() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<DomainRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDomainRequests();
  }, []);

  const loadDomainRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/super-admin/domains', {
        headers: { 'x-user-role': 'super_admin' },
      });
      const result = await response.json();

      if (result.success) {
        setRequests(result.data);
      } else {
        toast.error('Erro ao carregar solicitações');
      }
    } catch (error) {
      console.error('Error loading domain requests:', error);
      toast.error('Erro ao carregar solicitações');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigure = async (requestId: number, churchId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/super-admin/domains/${requestId}/configure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify({
          notes: 'Configurado manualmente via Super Admin',
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Domínio configurado! DNS propagará em 2-24 horas.');
        loadDomainRequests();
      } else {
        toast.error(result.error || 'Erro ao configurar');
      }
    } catch (error) {
      toast.error('Erro ao configurar domínio');
    }
  };

  const handleActivate = async (requestId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/super-admin/domains/${requestId}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Domínio ativado com sucesso!');
        loadDomainRequests();
      } else {
        toast.error(result.error || 'Erro ao ativar');
      }
    } catch (error) {
      toast.error('Erro ao ativar domínio');
    }
  };

  const handleReject = async (requestId: number) => {
    const reason = prompt('Motivo da rejeição:');
    if (!reason) return;

    try {
      const response = await fetch(`http://localhost:3000/api/super-admin/domains/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify({ reason }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Solicitação rejeitada');
        loadDomainRequests();
      } else {
        toast.error(result.error || 'Erro ao rejeitar');
      }
    } catch (error) {
      toast.error('Erro ao rejeitar');
    }
  };

  const handleSendEmail = async (request: DomainRequest) => {
    const subject = encodeURIComponent(`Status do seu domínio: ${request.requested_domain}`);
    const body = encodeURIComponent(
      `Olá, ${request.church_name}!\n\n` +
      `Seu domínio ${request.requested_domain} está com status: ${request.status}.\n\n` +
      `Em breve entraremos em contato com mais informações.\n\n` +
      `Equipe MinhaIgreja`
    );

    window.open(`mailto:${request.church_email}?subject=${subject}&body=${body}`);
  };

  const filteredRequests = requests.filter((req) => {
    const matchesFilter = filterStatus === 'all' || req.status === filterStatus;
    const matchesSearch = 
      req.church_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requested_domain.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string; icon: any }> = {
      pending: { 
        label: 'Pendente', 
        className: 'bg-yellow-100 text-yellow-800',
        icon: Clock
      },
      configured: { 
        label: 'Configurado', 
        className: 'bg-blue-100 text-blue-800',
        icon: RefreshCw
      },
      active: { 
        label: 'Ativo', 
        className: 'bg-green-100 text-green-800',
        icon: CheckCircle
      },
      rejected: { 
        label: 'Rejeitado', 
        className: 'bg-red-100 text-red-800',
        icon: XCircle
      },
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <Badge className={badge.className}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" onClick={() => navigate('/super-admin/dashboard')} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">Domínios Próprios</span>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{requests.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {requests.filter(r => r.status === 'pending').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Configurados</CardTitle>
              <RefreshCw className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {requests.filter(r => r.status === 'configured').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {requests.filter(r => r.status === 'active').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Filtre as solicitações por status ou busque por igreja/domínio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por igreja ou domínio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="configured">Configurados</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="rejected">Rejeitados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Solicitações de Domínio</CardTitle>
            <CardDescription>
              Gerencie as solicitações de domínio próprio das igrejas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Igreja</TableHead>
                  <TableHead>Domínio</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Solicitado Em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nenhuma solicitação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{request.church_name}</p>
                          <p className="text-xs text-muted-foreground">{request.church_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono text-sm">{request.requested_domain}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        {new Date(request.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendEmail(request)}
                            title="Enviar Email"
                          >
                            <Mail className="w-4 h-4" />
                          </Button>

                          {request.status === 'pending' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleConfigure(request.id, request.church_id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Configurar
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleReject(request.id)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}

                          {request.status === 'configured' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleActivate(request.id)}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Ativar
                            </Button>
                          )}

                          {request.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Ativo
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
