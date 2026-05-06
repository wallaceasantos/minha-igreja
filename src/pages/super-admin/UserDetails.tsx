/**
 * Super Admin - Ver/Editar Usuário
 * ============================================
 * URL: /super-admin/users/:id
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Shield,
  Building2,
  Calendar,
  Key,
  Ban,
  CheckCircle,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/config';

export default function SuperAdminUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    church_id: '',
  });

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl(`/api/admin/users/${id}`), {
        headers: { 'x-user-role': 'super_admin' },
      });
      const result = await response.json();

      if (result.success) {
        setUser(result.data);
        setFormData({
          name: result.data.name || '',
          email: result.data.email || '',
          role: result.data.role || '',
          church_id: result.data.church_id || '',
        });
      }
    } catch (error) {
      toast.error('Erro ao carregar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(buildApiUrl(`/api/admin/users/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Usuário atualizado com sucesso!');
        loadUser();
      }
    } catch (error) {
      toast.error('Erro ao atualizar usuário');
    } finally {
      setSaving(false);
    }
  };

  const handleBan = async () => {
    try {
      const action = user.is_active ? 'ban' : 'reactivate';
      const response = await fetch(buildApiUrl(`/api/admin/users/${id}/${action}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify({ reason: 'Ação administrativa' }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(user.is_active ? 'Usuário banido!' : 'Usuário reativado!');
        loadUser();
      }
    } catch (error) {
      toast.error('Erro ao atualizar usuário');
    }
  };

  const handleResetPassword = async () => {
    const tempPassword = 'temp123456';
    
    try {
      const response = await fetch(buildApiUrl(`/api/admin/users/${id}/reset-password`), {
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

  const roleColors = {
    super_admin: 'bg-red-500',
    admin: 'bg-blue-500',
    pastor: 'bg-green-500',
    secretary: 'bg-purple-500',
    leader: 'bg-orange-500',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" onClick={() => navigate('/super-admin/users')} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">{user?.name}</span>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Rápidos */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Role</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge className={roleColors[user?.role as keyof typeof roleColors]}>
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {user?.is_active ? (
                <Badge variant="outline" className="text-green-600 border-green-600">Ativo</Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 border-red-600">Inativo</Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Igreja</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-semibold">{user?.church_name || 'Sem igreja'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Criado em</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {new Date(user?.created_at).toLocaleDateString('pt-BR')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulário de Edição */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Dados Básicos */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Básicos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    className="pl-10"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="admin">Church Admin</option>
                  <option value="pastor">Pastor</option>
                  <option value="secretary">Secretário</option>
                  <option value="leader">Líder</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Igreja Atual</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span>{user?.church_name || 'Sem igreja'}</span>
                </div>
              </div>

              <div>
                <Label>Último Login</Label>
                <div className="flex items-center gap-2 mt-2">
                  <LogOut className="w-4 h-4 text-muted-foreground" />
                  <span>{user?.last_login_at ? new Date(user.last_login_at).toLocaleDateString('pt-BR') : 'Nunca'}</span>
                </div>
              </div>

              <div>
                <Label>Total de Logins</Label>
                <div className="text-2xl font-bold mt-2">{user?.stats?.logins || 0}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações */}
        <div className="flex justify-between items-center mt-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleResetPassword}
              className="text-blue-600 hover:text-blue-700"
            >
              <Key className="w-4 h-4 mr-2" />
              Resetar Senha
            </Button>

            <Button
              variant="outline"
              onClick={handleBan}
              className={user?.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
            >
              {user?.is_active ? (
                <>
                  <Ban className="w-4 h-4 mr-2" />
                  Banir Usuário
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Reativar Usuário
                </>
              )}
            </Button>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>
    </div>
  );
}
