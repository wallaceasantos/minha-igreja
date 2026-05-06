/**
 * Super Admin - Listar Usuários
 * ============================================
 * URL: /super-admin/users
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Search,
  Filter,
  Eye,
  Key,
  Ban,
  CheckCircle,
  XCircle,
  Trash2,
  Mail,
  Building2,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';

export default function SuperAdminUsers() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
  });

  // Carregar usuários
  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '20',
        ...filters,
      });

      const response = await fetch(`http://localhost:3000/api/admin/users?${params}`, {
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        setUsers(result.data.users);
        setPagination(result.data.pagination);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (userId: number, is_active: number) => {
    try {
      const action = is_active ? 'ban' : 'reactivate';
      const response = await fetch(`http://localhost:3000/api/admin/users/${userId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify({ reason: 'Ação administrativa' }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(is_active ? 'Usuário banido!' : 'Usuário reativado!');
        loadUsers();
      }
    } catch (error) {
      toast.error('Erro ao atualizar usuário');
    }
  };

  const handleResetPassword = async (userId: number) => {
    const tempPassword = 'temp123456';
    
    try {
      const response = await fetch(`http://localhost:3000/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify({ temporary_password: tempPassword }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Senha resetada!', {
          description: `Senha temporária: ${tempPassword}`,
        });
      }
    } catch (error) {
      toast.error('Erro ao resetar senha');
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Usuário excluído!');
        loadUsers();
      }
    } catch (error) {
      toast.error('Erro ao excluir usuário');
    }
  };

  const roleColors = {
    super_admin: 'bg-red-500',
    admin: 'bg-blue-500',
    pastor: 'bg-green-500',
    secretary: 'bg-purple-500',
    leader: 'bg-orange-500',
  };

  const roleNames = {
    super_admin: 'Super Admin',
    admin: 'Church Admin',
    pastor: 'Pastor',
    secretary: 'Secretário',
    leader: 'Líder',
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
            <Users className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">Gerenciar Usuários</span>
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
                    placeholder="Buscar por nome ou email..."
                    className="pl-10"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                >
                  <option value="">Todas Roles</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="admin">Church Admin</option>
                  <option value="pastor">Pastor</option>
                  <option value="secretary">Secretário</option>
                  <option value="leader">Líder</option>
                </select>
              </div>
              <div>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">Todos Status</option>
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Rápidos */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter((u: any) => u.is_active).length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inativos</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter((u: any) => !u.is_active).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Usuários */}
        <Card>
          <CardHeader>
            <CardTitle>
              Usuários ({pagination.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum usuário encontrado
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left text-sm text-muted-foreground">
                      <th className="py-3 px-4">Usuário</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Igreja</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Criado em</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user: any) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={roleColors[user.role as keyof typeof roleColors]}>
                            {roleNames[user.role as keyof typeof roleNames]}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {user.church_name ? (
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <span>{user.church_name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {user.is_active ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600 border-red-600">
                              <XCircle className="w-3 h-3 mr-1" />
                              Inativo
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/super-admin/users/${user.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResetPassword(user.id)}
                            >
                              <Key className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleBan(user.id, user.is_active)}
                            >
                              {user.is_active ? (
                                <Ban className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </Button>
                            {user.role !== 'super_admin' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(user.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            )}
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
