/**
 * Super Admin - Listar Igrejas
 * ============================================
 * URL: /super-admin/churches
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Building2,
  Search,
  Filter,
  Ban,
  CheckCircle,
  XCircle,
  Eye,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/config';

export default function SuperAdminChurches() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [churches, setChurches] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({
    search: '',
    plan: '',
    status: '',
  });

  // Carregar igrejas
  useEffect(() => {
    loadChurches();
  }, [filters]);

  const loadChurches = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '20',
        ...filters,
      });

      const response = await fetch(buildApiUrl(`/api/admin/churches?${params}`), {
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        setChurches(result.data.churches);
        setPagination(result.data.pagination);
      }
    } catch (error) {
      console.error('Error loading churches:', error);
      toast.error('Erro ao carregar igrejas');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (churchId: number, is_active: number) => {
    try {
      const action = is_active ? 'suspend' : 'reactivate';
      const response = await fetch(buildApiUrl(`/api/admin/churches/${churchId}/${action}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify({ reason: 'Ação administrativa' }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(is_active ? 'Igreja suspensa!' : 'Igreja reativada!');
        loadChurches();
      }
    } catch (error) {
      toast.error('Erro ao atualizar igreja');
    }
  };

  const planColors = {
    free: 'bg-gray-500',
    essencial: 'bg-blue-500',
    premium: 'bg-purple-500',
    enterprise: 'bg-amber-500',
  };

  const planNames = {
    free: 'Free',
    essencial: 'Essencial',
    premium: 'Premium',
    enterprise: 'Enterprise',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" onClick={() => navigate('/super-admin/dashboard')} className="mr-4">
            ← Voltar
          </Button>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">Gerenciar Igrejas</span>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, email ou slug..."
                    className="pl-10"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={filters.plan}
                  onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
                >
                  <option value="">Todos Planos</option>
                  <option value="free">Free</option>
                  <option value="essencial">Essencial</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">Todos Status</option>
                  <option value="active">Ativas</option>
                  <option value="inactive">Inativas</option>
                  <option value="trial">Em Trial</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Igrejas */}
        <Card>
          <CardHeader>
            <CardTitle>
              Igrejas ({pagination.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            ) : churches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma igreja encontrada
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left text-sm text-muted-foreground">
                      <th className="py-3 px-4">Igreja</th>
                      <th className="py-3 px-4">Plano</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Membros</th>
                      <th className="py-3 px-4">Admins</th>
                      <th className="py-3 px-4">Criada em</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {churches.map((church: any) => (
                      <tr key={church.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold">{church.name}</p>
                            <p className="text-xs text-muted-foreground">{church.email}</p>
                            <p className="text-xs text-muted-foreground">{church.slug}.plataforma.minhaigreja.com.br</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={planColors[church.plan_type as keyof typeof planColors]}>
                            {planNames[church.plan_type as keyof typeof planNames]}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {church.is_active ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Ativa
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600 border-red-600">
                              <XCircle className="w-3 h-3 mr-1" />
                              Suspensa
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{church.member_count || 0}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            <span>{church.admin_count || 0}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(church.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/super-admin/churches/${church.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSuspend(church.id, church.is_active)}
                            >
                              {church.is_active ? (
                                <Ban className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/super-admin/churches/${church.id}/plans`)}
                            >
                              <CreditCard className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paginação */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.totalPages}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
