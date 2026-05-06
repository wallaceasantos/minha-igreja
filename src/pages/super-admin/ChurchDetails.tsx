/**
 * Super Admin - Ver/Editar Igreja
 * ============================================
 * URL: /super-admin/churches/:id
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
  Building2,
  Users,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Ban,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/config';

export default function SuperAdminChurchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [church, setChurch] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '',
    whatsapp: '',
    address_street: '',
    address_number: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    address_zip: '',
    facebook_url: '',
    instagram_url: '',
    youtube_url: '',
    theme_primary_color: '#1e40af',
    theme_secondary_color: '#f59e0b',
  });

  useEffect(() => {
    loadChurch();
  }, [id]);

  const loadChurch = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl(`/api/admin/churches/${id}`), {
        headers: { 'x-user-role': 'super_admin' },
      });
      const result = await response.json();

      if (result.success) {
        setChurch(result.data);
        setFormData({
          name: result.data.name || '',
          slug: result.data.slug || '',
          email: result.data.email || '',
          phone: result.data.phone || '',
          whatsapp: result.data.whatsapp || '',
          address_street: result.data.address_street || '',
          address_number: result.data.address_number || '',
          address_neighborhood: result.data.address_neighborhood || '',
          address_city: result.data.address_city || '',
          address_state: result.data.address_state || '',
          address_zip: result.data.address_zip || '',
          facebook_url: result.data.facebook_url || '',
          instagram_url: result.data.instagram_url || '',
          youtube_url: result.data.youtube_url || '',
          theme_primary_color: result.data.theme_primary_color || '#1e40af',
          theme_secondary_color: result.data.theme_secondary_color || '#f59e0b',
        });
      }
    } catch (error) {
      toast.error('Erro ao carregar igreja');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(buildApiUrl(`/api/admin/churches/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Igreja atualizada com sucesso!');
        loadChurch();
      }
    } catch (error) {
      toast.error('Erro ao atualizar igreja');
    } finally {
      setSaving(false);
    }
  };

  const handleSuspend = async () => {
    try {
      const action = church.is_active ? 'suspend' : 'reactivate';
      const response = await fetch(buildApiUrl(`/api/admin/churches/${id}/${action}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify({ reason: 'Ação administrativa' }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(church.is_active ? 'Igreja suspensa!' : 'Igreja reativada!');
        loadChurch();
      }
    } catch (error) {
      toast.error('Erro ao atualizar igreja');
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" onClick={() => navigate('/super-admin/churches')} className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">{church?.name}</span>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Rápidos */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Plano</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge className={
                church?.plan_type === 'enterprise' ? 'bg-amber-500' :
                church?.plan_type === 'premium' ? 'bg-purple-500' :
                church?.plan_type === 'essencial' ? 'bg-blue-500' : 'bg-gray-500'
              }>
                {church?.plan_type?.charAt(0).toUpperCase() + church?.plan_type?.slice(1)}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {church?.is_active ? (
                <Badge variant="outline" className="text-green-600 border-green-600">Ativa</Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 border-red-600">Suspensa</Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Membros</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{church?.stats?.members || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Criada em</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {new Date(church?.created_at).toLocaleDateString('pt-BR')}
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
                <Label htmlFor="name">Nome da Igreja</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="slug">Subdomínio</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="igreja"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.slug}.plataforma.minhaigreja.com.br
                </p>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      className="pl-10"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address_street">Rua</Label>
                  <Input
                    id="address_street"
                    value={formData.address_street}
                    onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="address_number">Número</Label>
                  <Input
                    id="address_number"
                    value={formData.address_number}
                    onChange={(e) => setFormData({ ...formData, address_number: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address_neighborhood">Bairro</Label>
                <Input
                  id="address_neighborhood"
                  value={formData.address_neighborhood}
                  onChange={(e) => setFormData({ ...formData, address_neighborhood: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="address_city">Cidade</Label>
                  <Input
                    id="address_city"
                    value={formData.address_city}
                    onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="address_state">Estado</Label>
                  <Input
                    id="address_state"
                    value={formData.address_state}
                    onChange={(e) => setFormData({ ...formData, address_state: e.target.value })}
                    maxLength={2}
                  />
                </div>
                <div>
                  <Label htmlFor="address_zip">CEP</Label>
                  <Input
                    id="address_zip"
                    value={formData.address_zip}
                    onChange={(e) => setFormData({ ...formData, address_zip: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Redes Sociais */}
          <Card>
            <CardHeader>
              <CardTitle>Redes Sociais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="facebook_url">Facebook</Label>
                <Input
                  id="facebook_url"
                  value={formData.facebook_url}
                  onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div>
                <Label htmlFor="instagram_url">Instagram</Label>
                <Input
                  id="instagram_url"
                  value={formData.instagram_url}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div>
                <Label htmlFor="youtube_url">YouTube</Label>
                <Input
                  id="youtube_url"
                  value={formData.youtube_url}
                  onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                  placeholder="https://youtube.com/..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Cores do Tema */}
          <Card>
            <CardHeader>
              <CardTitle>Cores do Tema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme_primary_color">Cor Primária</Label>
                <div className="flex gap-2">
                  <Input
                    id="theme_primary_color"
                    type="color"
                    value={formData.theme_primary_color}
                    onChange={(e) => setFormData({ ...formData, theme_primary_color: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={formData.theme_primary_color}
                    onChange={(e) => setFormData({ ...formData, theme_primary_color: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="theme_secondary_color">Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input
                    id="theme_secondary_color"
                    type="color"
                    value={formData.theme_secondary_color}
                    onChange={(e) => setFormData({ ...formData, theme_secondary_color: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={formData.theme_secondary_color}
                    onChange={(e) => setFormData({ ...formData, theme_secondary_color: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações */}
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            onClick={handleSuspend}
            className={church?.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
          >
            {church?.is_active ? (
              <>
                <Ban className="w-4 h-4 mr-2" />
                Suspender Igreja
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Reativar Igreja
              </>
            )}
          </Button>

          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>
    </div>
  );
}
