/**
 * Admin: Configurações da Igreja
 * ============================================
 * Gerenciar configurações da igreja
 * - Upload de logo
 * - Endereço com Google Maps
 * - Redes sociais
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useDashboard } from '@/hooks/useDashboard';
import DomainValidator from '@/components/DomainValidator';
import { toast } from 'sonner';
import {
import { buildApiUrl } from '@/lib/config';
  Church,
  Upload,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Save,
  Image as ImageIcon,
  Link as LinkIcon,
  Trash2,
  Crown,
  Globe,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Play,
  MessageCircle,
  Mail,
  Search
} from 'lucide-react';

export default function AdminConfiguracoes() {
  const { church, loading } = useDashboard();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [domain, setDomain] = useState('');
  const [domainValidated, setDomainValidated] = useState(false);

  // Verificar se está no plano Free ou trial
  const isTrialActive = localStorage.getItem('isTrialActive') === 'true';
  const planType: string = church?.plan_type || 'free';
  const isFreePlan = planType === 'free' && !isTrialActive;
  const isEssentialOrHigher = ['essencial', 'premium', 'enterprise'].includes(planType) || isTrialActive;

  // Estado para configurações
  const [formData, setFormData] = useState({
    // Informações básicas
    name: '',
    description: '',
    about_content: '',
    email: '',
    phone: '',
    whatsapp: '',

    // Endereço
    address_street: '',
    address_number: '',
    address_complement: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    address_zip: '',

    // Redes sociais
    facebook_url: '',
    instagram_url: '',
    youtube_url: '',
    youtube_channel_id: '',
  });

  // Estado para logo (URL)
  const [logoUrl, setLogoUrl] = useState('');

  // Carregar dados da igreja
  useEffect(() => {
    if (church) {
      setFormData({
        name: church.name || '',
        description: church.description || '',
        about_content: church.about_content || '',
        email: church.email || '',
        phone: church.phone || '',
        whatsapp: church.whatsapp || '',
        address_street: church.address_street || '',
        address_number: church.address_number || '',
        address_complement: church.address_complement || '',
        address_neighborhood: church.address_neighborhood || '',
        address_city: church.address_city || '',
        address_state: church.address_state || '',
        address_zip: church.address_zip || '',
        facebook_url: church.facebook_url || '',
        instagram_url: church.instagram_url || '',
        youtube_url: church.youtube_url || '',
        youtube_channel_id: church.youtube_channel_id || '',
      });

      if (church.logo_url) {
        setLogoUrl(church.logo_url);
      }
    }
  }, [church]);

  // Se não estiver autenticado, redireciona
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdminAuthenticated') === 'true';
    if (!isAdmin) {
      navigate('/login');
    }
  }, [navigate]);

  // Se estiver carregando, mostra loading
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handler para buscar CEP (ViaCEP - gratuito)
  const searchCep = async (cep: string) => {
    // Remove caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      toast.error('CEP inválido', { description: 'Digite um CEP válido com 8 dígitos' });
      return;
    }

    try {
      toast.loading('Buscando endereço...', { id: 'cep-search' });
      
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error('CEP não encontrado', { id: 'cep-search' });
        return;
      }

      // Atualiza o formulário com os dados retornados
      setFormData(prev => ({
        ...prev,
        address_street: data.logradouro || prev.address_street,
        address_neighborhood: data.bairro || prev.address_neighborhood,
        address_city: data.localidade || prev.address_city,
        address_state: data.uf || prev.address_state,
        address_zip: cleanCep.replace(/(\d{5})(\d{3})/, '$1-$2'),
      }));

      toast.success('Endereço encontrado!', { id: 'cep-search' });
    } catch (error) {
      console.error('Error fetching CEP:', error);
      toast.error('Erro ao buscar CEP', { 
        id: 'cep-search',
        description: 'Verifique sua conexão ou digite o endereço manualmente' 
      });
    }
  };

  // Máscara para CEP
  const formatCep = (value: string) => {
    const clean = value.replace(/\D/g, '');
    if (clean.length <= 5) return clean;
    return clean.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  // Handler para salvar configurações
  const handleSave = async () => {
    setSaving(true);

    try {
      // Pegar church_id do localStorage ou da URL
      const churchId = localStorage.getItem('churchId') || church?.id;

      if (!churchId) {
        throw new Error('Igreja não identificada');
      }

      // Limpar dados antes de enviar (converter strings vazias para null)
      // NOTA: logo_url é salvo separadamente via endpoint /api/church/:id/logo
      const cleanFormData = {
        ...formData,
      };

      // Salvar configurações básicas
      const configResponse = await fetch(buildApiUrl(`/api/church/${churchId}/config`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-church-id': String(churchId),
        },
        body: JSON.stringify(cleanFormData),
      });

      const configResult = await configResponse.json();

      if (!configResult.success) {
        throw new Error(configResult.error || 'Erro ao salvar configurações');
      }

      toast.success('Configurações salvas com sucesso!', {
        description: 'Todas as alterações foram aplicadas.',
      });
      
      // Redirecionar para o dashboard após 1.5 segundos
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Erro ao salvar configurações', {
        description: error instanceof Error ? error.message : 'Tente novamente.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Handler para solicitação de domínio
  const handleRequestDomain = async () => {
    if (!domainValidated || !church) return;

    setSaving(true);

    try {
      const response = await fetch(buildApiUrl('/api/admin/domain/request'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          church_id: church.id,
          domain: domain.replace(/^https?:\/\//, '').replace(/^www\./, ''),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('✅ Solicitação enviada!', {
          description: 'Você receberá instruções de configuração por e-mail em breve.',
        });
        setDomain('');
        setDomainValidated(false);
      } else {
        toast.error('Erro ao solicitar', {
          description: result.error || 'Tente novamente.',
        });
      }
    } catch (error) {
      console.error('Error requesting domain:', error);
      toast.error('Erro ao solicitar domínio', {
        description: 'Tente novamente mais tarde.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Handler para upload de logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Bloquear upload no plano Free
    if (isFreePlan) {
      toast.error('Recurso não disponível', {
        description: 'O upload de logo está disponível apenas nos planos Essencial, Premium e Enterprise.',
      });
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo (aceita todos os tipos de imagem)
    if (!file.type.startsWith('image/')) {
      toast.error('Arquivo inválido', {
        description: 'Por favor, selecione uma imagem (JPG, JPEG, PNG, WebP, GIF, BMP)',
      });
      return;
    }

    // Validar tamanho (max 2MB - limite do servidor)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Arquivo muito grande', {
        description: 'A imagem deve ter no máximo 2MB',
      });
      return;
    }

    // Upload do arquivo para o servidor
    try {
      const churchId = localStorage.getItem('churchId') || church?.id;
      if (!churchId) {
        toast.error('Igreja não identificada');
        return;
      }

      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch(buildApiUrl(`/api/church/${churchId}/logo`), {
        method: 'POST',
        headers: {
          'x-church-id': String(churchId),
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setLogoUrl(result.data.logo_url);
        toast.success('Logo enviada com sucesso!', {
          description: 'A logo foi salva e já está disponível.',
        });
      } else {
        toast.error('Erro ao enviar logo', {
          description: result.error || 'Tente novamente.',
        });
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Erro ao enviar logo', {
        description: 'Tente novamente.',
      });
    }
  };

  return (
    <div className="container px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Church className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Configurações da Igreja</h1>
        </div>
        <p className="text-muted-foreground">
          Gerencie as informações da sua igreja, endereço, redes sociais e horários de culto.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="address">Endereço</TabsTrigger>
          <TabsTrigger value="social">Redes Sociais</TabsTrigger>
          <TabsTrigger value="domain">Domínio</TabsTrigger>
        </TabsList>

        {/* Tab: Informações Gerais */}
        <TabsContent value="general" className="space-y-6">
          {/* Aviso para plano Free */}
          {isFreePlan && (
            <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-900">
              <Crown className="h-4 w-4 text-amber-600" />
              <AlertDescription>
                <strong className="font-semibold">⚠️ Recurso indisponível no plano Free</strong>
                <p className="mt-2 text-sm">
                  O upload de logo da igreja está disponível apenas no plano <strong>Essencial</strong>.
                </p>
                <p className="text-sm mt-1">
                  No plano Free, você pode usar uma URL externa para a logo, mas o upload direto está bloqueado.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate('/admin/plans')}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Ver Planos e Fazer Upgrade
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Logo da Igreja
              </CardTitle>
              <CardDescription>
                Faça upload da logo da sua igreja. Formatos aceitos: JPG, JPEG, PNG, WebP, GIF, BMP. Tamanho máximo: 2MB.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo da igreja"
                    className="w-32 h-32 object-contain border rounded-lg p-2"
                  />
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/50">
                    <Church className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="logo-url">URL da Logo</Label>
                  <Input
                    id="logo-url"
                    placeholder="https://exemplo.com/logo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="max-w-md"
                    disabled={isFreePlan}
                  />
                  <p className="text-xs text-muted-foreground">
                    Dica: Use um serviço como Cloudinary ou Uploadcare para hospedar a imagem.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => document.getElementById('logo-file-input')?.click()}
                      disabled={isFreePlan}
                    >
                      <Upload className="w-4 h-4" />
                      Fazer Upload
                    </Button>
                    <input
                      id="logo-file-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                      disabled={isFreePlan}
                    />
                    {logoUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLogoUrl('')}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>
                Dados principais da sua igreja.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome da Igreja</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Primeira Igreja Batista"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição Curta (Hero)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Restaurando Vidas, Edificando Famílias."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Esta descrição aparecerá em destaque no topo do site.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="about-content">Quem Somos (Conteúdo Completo)</Label>
                  <Textarea
                    id="about-content"
                    value={formData.about_content}
                    onChange={(e) => setFormData({ ...formData, about_content: e.target.value })}
                    placeholder="Conte a história, visão, missão e valores da sua igreja..."
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Este conteúdo completo aparecerá na seção "Sobre" do site público.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contato@igreja.com"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(00) 0000-0000"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Endereço */}
        <TabsContent value="address" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Endereço da Igreja
              </CardTitle>
              <CardDescription>
                Onde sua igreja está localizada. Essas informações aparecerão no Google Maps.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="street">Rua</Label>
                  <Input
                    id="street"
                    value={formData.address_street}
                    onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                    placeholder="Ex: Avenida Ipixuna"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={formData.address_number}
                    onChange={(e) => setFormData({ ...formData, address_number: e.target.value })}
                    placeholder="1000"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={formData.address_complement}
                    onChange={(e) => setFormData({ ...formData, address_complement: e.target.value })}
                    placeholder="Ex: Ao lado da praça"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={formData.address_neighborhood}
                    onChange={(e) => setFormData({ ...formData, address_neighborhood: e.target.value })}
                    placeholder="Cachoeirinha"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.address_city}
                    onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                    placeholder="Manaus"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="state">Estado</Label>
                  <select
                    id="state"
                    value={formData.address_state}
                    onChange={(e) => setFormData({ ...formData, address_state: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Selecione...</option>
                    {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>

                {/* CEP com busca automática */}
                <div className="grid gap-2">
                  <Label htmlFor="zip">CEP</Label>
                  <div className="flex gap-2">
                    <Input
                      id="zip"
                      value={formData.address_zip}
                      onChange={(e) => {
                        const formatted = formatCep(e.target.value);
                        setFormData({ ...formData, address_zip: formatted });
                      }}
                      onBlur={(e) => {
                        // Busca automática ao sair do campo
                        if (e.target.value.replace(/\D/g, '').length === 8) {
                          searchCep(e.target.value);
                        }
                      }}
                      placeholder="69065-010"
                      maxLength={9}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => searchCep(formData.address_zip)}
                      disabled={formData.address_zip.replace(/\D/g, '').length !== 8}
                      title="Buscar endereço pelo CEP"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Digite o CEP e clique na lupa ou pressione Tab para buscar automaticamente
                  </p>
                </div>
              </div>

              {/* Preview do Endereço */}
              {formData.address_street && formData.address_city && (
                <div className="mt-6">
                  <Label>Preview do Endereço</Label>
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-gray-700">
                        <p className="font-medium">{formData.address_street}, {formData.address_number}</p>
                        {formData.address_neighborhood && <p>{formData.address_neighborhood}</p>}
                        <p>{formData.address_city} - {formData.address_state} {formData.address_zip && `• ${formData.address_zip}`}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${formData.address_street} ${formData.address_number}, ${formData.address_city}, ${formData.address_state}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                    >
                      Ver no Google Maps →
                    </a>
                    <span className="text-gray-400">|</span>
                    <a
                      href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(
                        `${formData.address_street} ${formData.address_number}, ${formData.address_city}, ${formData.address_state}, Brasil`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800"
                    >
                      Ver no OpenStreetMap →
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Redes Sociais */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Redes Sociais
              </CardTitle>
              <CardDescription>
                Links para as redes sociais da sua igreja.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="facebook" className="flex items-center gap-2">
                      <Facebook className="w-4 h-4" />
                      Facebook
                    </Label>
                    <Input
                      id="facebook"
                      value={formData.facebook_url}
                      onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                      placeholder="https://facebook.com/suaigreja"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="instagram" className="flex items-center gap-2">
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </Label>
                    <Input
                      id="instagram"
                      value={formData.instagram_url}
                      onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                      placeholder="https://instagram.com/suaigreja"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="youtube" className="flex items-center gap-2">
                      <Youtube className="w-4 h-4" />
                      YouTube URL
                    </Label>
                    <Input
                      id="youtube"
                      value={formData.youtube_url}
                      onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                      placeholder="https://youtube.com/@suaigreja"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="youtube-channel">YouTube Channel ID</Label>
                    <Input
                      id="youtube-channel"
                      value={formData.youtube_channel_id}
                      onChange={(e) => setFormData({ ...formData, youtube_channel_id: e.target.value })}
                      placeholder="UCxxxxxxxxxxxxxxxxxxx"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Domínio Próprio */}
        <TabsContent value="domain" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle>🌐 Domínio Próprio</CardTitle>
                    <CardDescription>
                      Configure um domínio personalizado para seu site
                    </CardDescription>
                  </div>
                </div>
                {isEssentialOrHigher && (
                  <Badge className="bg-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {isTrialActive ? 'Trial Ativo' : 'Incluído'}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isEssentialOrHigher ? (
                <Alert className="bg-amber-50 border-amber-200">
                  <Crown className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>Domínio próprio disponível apenas no plano Essencial!</strong>
                    <p className="mt-2 text-sm">
                      Faça upgrade para ter domínio próprio, upload de logo e muito mais.
                    </p>
                    <Button 
                      size="sm" 
                      className="mt-3"
                      onClick={() => navigate('/admin/plans')}
                    >
                      Ver Planos e Fazer Upgrade
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  {/* Status do Domínio */}
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        Não configurado
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Seu site atual: <strong className="font-mono">{church?.slug}.plataforma.minhaigreja.com.br</strong>
                    </p>
                  </div>

                  {/* Onde Registrar */}
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong className="text-blue-900">📋 Onde registrar seu domínio?</strong>
                      <p className="text-sm text-blue-700 mt-2">
                        Você pode registrar em qualquer provedor de confiança. Nossas recomendações:
                      </p>
                      <div className="grid md:grid-cols-2 gap-3 mt-3">
                        <div className="bg-white p-3 rounded-lg border">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <strong className="text-sm">Registro.br</strong>
                          </div>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            <li>• Domínio .com.br</li>
                            <li>• R$ 40,00/ano</li>
                            <li>• Mais confiável no Brasil</li>
                          </ul>
                          <a 
                            href="https://registro.br" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                          >
                            Acessar →
                          </a>
                        </div>
                        <div className="bg-white p-3 rounded-lg border">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <strong className="text-sm">Hostinger</strong>
                          </div>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            <li>• Vários tipos de domínio</li>
                            <li>• Grátis no 1º ano*</li>
                            <li>• Fácil de configurar</li>
                          </ul>
                          <a 
                            href="https://hostinger.com.br" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                          >
                            Acessar →
                          </a>
                        </div>
                      </div>
                      <p className="text-xs text-blue-600 mt-3">
                        * Consulte planos da Hostinger para domínio grátis
                      </p>
                    </AlertDescription>
                  </Alert>

                  {/* Formulário de Solicitação */}
                  <div className="space-y-4">
                    {/* Passo 1: Verificar onde registrou */}
                    <div>
                      <Label>Onde você registrou (ou vai registrar) seu domínio?</Label>
                      <div className="grid md:grid-cols-3 gap-3 mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="h-24 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-300"
                          onClick={() => {
                            window.open('https://registro.br', '_blank');
                            toast.info('Registro.br aberto! Após registrar, volte aqui.', { duration: 5000 });
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <Globe className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="font-semibold text-sm">Registro.br</span>
                          </div>
                          <span className="text-xs text-muted-foreground">R$ 40/ano • .com.br</span>
                          <span className="text-xs text-blue-600 font-medium">🔗 Abrir em nova aba →</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-24 flex flex-col gap-2 hover:bg-purple-50 hover:border-purple-300"
                          onClick={() => {
                            window.open('https://hostinger.com.br', '_blank');
                            toast.info('Hostinger aberta! Após registrar, volte aqui.', { duration: 5000 });
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                              <Globe className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="font-semibold text-sm">Hostinger</span>
                          </div>
                          <span className="text-xs text-muted-foreground">Grátis 1º ano*</span>
                          <span className="text-xs text-purple-600 font-medium">🔗 Abrir em nova aba →</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-24 flex flex-col gap-2 hover:bg-green-50 hover:border-green-300"
                          onClick={() => {
                            window.open('https://godaddy.com', '_blank');
                            toast.info('GoDaddy aberto! Após registrar, volte aqui.', { duration: 5000 });
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                              <Globe className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="font-semibold text-sm">GoDaddy</span>
                          </div>
                          <span className="text-xs text-muted-foreground">Em promoção</span>
                          <span className="text-xs text-green-600 font-medium">🔗 Abrir em nova aba →</span>
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        💡 Clique para abrir em nova aba. Após registrar, volte aqui e continue.
                      </p>
                    </div>

                    {/* Passo 2: Vídeo Tutorial */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Play className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm">
                            📺 Vídeo Tutorial: Como Configurar Domínio
                          </h4>
                          <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                            Tutorial de 3 minutos mostrando o passo-a-passo completo
                          </p>
                        </div>
                      </div>
                      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
                        <iframe 
                          className="w-full h-full"
                          src="https://www.youtube.com/embed/SEU_VIDEO_AQUI" 
                          title="Tutorial de Configuração de Domínio"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            toast.info('📺 Vídeo iniciado! Assista até o final para entender todo o processo.', { duration: 4000 });
                          }}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Assistir Tutorial
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            window.open('https://youtube.com', '_blank');
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Abrir no YouTube
                        </Button>
                      </div>
                    </div>

                    {/* Passo 3: Digitar domínio */}
                    <div>
                      <Label htmlFor="domain">Digite seu domínio registrado</Label>
                      <Input
                        id="domain"
                        placeholder="www.suaigreja.com.br"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Ex: www.igrejaquadrangular.com.br
                      </p>
                      
                      {/* Componente de Validação */}
                      <DomainValidator 
                        domain={domain}
                        onValidated={setDomainValidated}
                      />
                    </div>

                    {/* Passo 3: Declaração de propriedade */}
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
                            ⚠️ Importante sobre o domínio
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-xs text-amber-700 dark:text-amber-400 mt-2">
                            <li>O domínio deve ser registrado <strong>EM SEU NOME</strong> (CPF/CNPJ da igreja)</li>
                            <li>Você é o <strong>proprietário</strong> do domínio</li>
                            <li>O registro é pago <strong>diretamente ao provedor</strong> (Registro.br, Hostinger, etc.)</li>
                            <li>Custo médio: R$ 35-40/ano (pago uma vez por ano)</li>
                            <li>A plataforma fornece apenas a <strong>configuração técnica</strong> do DNS</li>
                            <li>Em caso de cancelamento, o domínio <strong>continua sendo seu</strong></li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Passo 4: Instruções de DNS */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
                        🔧 Após registrar: Configure o DNS
                      </h4>
                      <div className="space-y-3">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border">
                          <p className="text-sm font-semibold mb-2">📋 Passo-a-passo:</p>
                          <ol className="list-decimal list-inside space-y-2 text-xs text-muted-foreground">
                            <li>Acesse onde registrou o domínio (Registro.br, Hostinger, etc.)</li>
                            <li>Vá até a seção <strong>DNS</strong> ou <strong>Gerenciar DNS</strong></li>
                            <li>Adicione um registro <strong>CNAME</strong>:</li>
                          </ol>
                          <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-900 rounded-lg font-mono text-xs">
                            <div className="grid grid-cols-3 gap-2 mb-2 font-semibold">
                              <div>Tipo</div>
                              <div>Host/Name</div>
                              <div>Valor/Destino</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="text-blue-600">CNAME</div>
                              <div className="text-green-600">www</div>
                              <div className="text-purple-600">plataforma.minhaigreja.com.br</div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => {
                              navigator.clipboard.writeText('CNAME | www | plataforma.minhaigreja.com.br');
                              toast.success('DNS copiado!');
                            }}
                          >
                            📋 Copiar informações DNS
                          </Button>
                          <ol className="list-decimal list-inside space-y-2 text-xs text-muted-foreground mt-3" start={4}>
                            <li>Salve as configurações de DNS</li>
                            <li>Aguarde a propagação (<strong>2-24 horas</strong>)</li>
                            <li>Após propagar, seu site estará acessível no domínio próprio!</li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    {/* Passo 5: Botão de Solicitar + Ajuda */}
                    <div className="space-y-3">
                      <Button 
                        className="w-full"
                        size="lg"
                        disabled={!domainValidated || !domain}
                        onClick={handleRequestDomain}
                      >
                        <Globe className="w-5 h-5 mr-2" />
                        {domainValidated 
                          ? '✅ Solicitar Configuração de Domínio' 
                          : '⏳ Valide o domínio primeiro'}
                      </Button>

                      {!domainValidated && domain && (
                        <p className="text-xs text-amber-600 text-center font-medium">
                          ⚠️ Aguarde a validação do domínio antes de solicitar
                        </p>
                      )}

                      {/* Botão de Ajuda */}
                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageCircle className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-800">Precisa de Ajuda?</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="justify-start"
                            onClick={() => {
                              window.open('https://wa.me/5592984213885?text=Olá! Preciso de ajuda para configurar meu domínio próprio.', '_blank');
                              toast.info('WhatsApp aberto! Envie sua dúvida que vamos te ajudar.', { duration: 5000 });
                            }}
                          >
                            <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
                            WhatsApp
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="justify-start"
                            onClick={() => {
                              window.location.href = 'mailto:suporte@minhaigreja.com.br?subject=Ajuda com Domínio Próprio&body=Olá! Preciso de ajuda para configurar meu domínio próprio.%0D%0A%0D%0AMeu domínio é: %0D%0AOnde registrei: %0D%0AMinha dúvida: ';
                              toast.info('Email aberto! Descreva sua dúvida que vamos responder em até 24h.', { duration: 5000 });
                            }}
                          >
                            <Mail className="w-4 h-4 mr-2 text-blue-600" />
                            Enviar Email
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          ⏱️ Tempo de resposta: WhatsApp (até 1h) • Email (até 24h)
                        </p>
                      </div>

                      <p className="text-xs text-muted-foreground text-center">
                        ⏱️ Tempo estimado de configuração: 5-10 minutos (excluindo propagação)
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Botão Salvar */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </Tabs>
    </div>
  );
}
