/**
 * Super Admin - Configurações do Sistema
 * ============================================
 * URL: /super-admin/settings
 * 
 * Gerenciar configurações globais da plataforma.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Settings,
  Mail,
  Shield,
  Palette,
  Server,
  Save,
  TestTube,
  Bell,
  ChevronLeft,
  Check,
  RotateCcw,
  Upload,
  History,
  AlertCircle,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SuperAdminSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [originalSettings, setOriginalSettings] = useState<any>({}); // Para detectar mudanças
  const [testEmail, setTestEmail] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [saveCategory, setSaveCategory] = useState<string | undefined>(undefined);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [lastUpdated, setLastUpdated] = useState<any>({});

  useEffect(() => {
    loadSettings();
  }, []);

  // Detectar mudanças não salvas
  const hasUnsavedChanges = (category?: string) => {
    if (!category) {
      return JSON.stringify(settings) !== JSON.stringify(originalSettings);
    }
    return JSON.stringify(settings[category]) !== JSON.stringify(originalSettings[category]);
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/admin/settings', {
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        setSettings(result.data);
        setOriginalSettings(JSON.parse(JSON.stringify(result.data))); // Deep copy
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (category: string, key: string, value: any) => {
    // Atualizar localmente primeiro
    setSettings((prev: any) => ({
      ...prev,
      [category]: prev[category]?.map((s: any) =>
        s.key === key ? { ...s, value } : s
      ),
    }));
  };

  // Validação de configurações
  const validateSettings = (category?: string): boolean => {
    // Validar SMTP
    if (category === 'smtp' || !category) {
      const smtpPort = getSettingValue('smtp', 'smtp_port', 587);
      if (smtpPort < 1 || smtpPort > 65535) {
        toast.error('Porta SMTP inválida. Deve ser entre 1 e 65535');
        return false;
      }

      const smtpEmail = getSettingValue('smtp', 'smtp_from_email', '');
      if (smtpEmail && !/^\S+@\S+\.\S+$/.test(smtpEmail)) {
        toast.error('Email de envio inválido');
        return false;
      }
    }

    // Validar URLs
    if (category === 'branding' || !category) {
      const logoUrl = getSettingValue('branding', 'platform_logo_url', '');
      if (logoUrl && !logoUrl.startsWith('/') && !logoUrl.startsWith('http')) {
        toast.error('URL do logo deve começar com / ou http');
        return false;
      }
    }

    // Validar números
    if (category === 'limits' || !category) {
      const maxUpload = getSettingValue('limits', 'max_upload_size_mb', 10);
      if (maxUpload < 1 || maxUpload > 100) {
        toast.error('Tamanho de upload deve ser entre 1 e 100 MB');
        return false;
      }
    }

    if (category === 'security' || !category) {
      const maxAttempts = getSettingValue('security', 'max_login_attempts', 5);
      if (maxAttempts < 1 || maxAttempts > 20) {
        toast.error('Máx. tentativas deve ser entre 1 e 20');
        return false;
      }

      const lockoutTime = getSettingValue('security', 'login_lockout_minutes', 15);
      if (lockoutTime < 1 || lockoutTime > 1440) {
        toast.error('Tempo de bloqueio deve ser entre 1 e 1440 minutos');
        return false;
      }
    }

    return true;
  };

  // Resetar categoria para padrão
  const handleReset = async (category: string) => {
    const defaults: any = {
      general: {
        platform_name: 'MinhaIgreja',
        platform_url: 'http://localhost:5173',
        platform_description: 'Plataforma de gestão para igrejas',
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
        maintenance_mode: false,
      },
      email: {
        email_welcome_enabled: true,
        email_welcome_subject: 'Bem-vindo ao MinhaIgreja!',
        email_trial_end_enabled: true,
        email_trial_end_days: 5,
        email_invoice_enabled: true,
      },
      smtp: {
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_secure: 'tls',
        smtp_from_email: 'noreply@minhaigreja.app',
        smtp_from_name: 'MinhaIgreja',
      },
      branding: {
        platform_logo_url: '/logo.png',
        platform_favicon_url: '/favicon.ico',
        platform_primary_color: '#1e40af',
        platform_secondary_color: '#f59e0b',
      },
      limits: {
        max_churches_per_admin: 10,
        max_upload_size_mb: 10,
        allowed_file_types: 'jpg,png,pdf,doc,docx',
      },
      security: {
        max_login_attempts: 5,
        login_lockout_minutes: 15,
        session_timeout_minutes: 120,
        feature_multi_church: true,
        feature_custom_domain: false,
        feature_api_access: true,
        feature_analytics: true,
      },
    };

    if (confirm(`Tem certeza que deseja resetar "${category}" para os padrões?`)) {
      defaults[category]?.forEach((value: any, key: string) => {
        updateSetting(category, key, value);
      });
      toast.success(`Configurações de "${category}" resetadas!`);
    }
  };

  // Upload de logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Apenas arquivos de imagem são permitidos');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem deve ter no máximo 5MB');
      return;
    }

    setLogoFile(file);

    // Simular upload (implementar com backend real)
    const imageUrl = URL.createObjectURL(file);
    updateSetting('branding', 'platform_logo_url', imageUrl);
    toast.success('Logo carregada! Não esqueça de salvar.');
  };

  // Upload de favicon
  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Apenas arquivos de imagem são permitidos');
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      toast.error('Favicon deve ter no máximo 1MB');
      return;
    }

    setFaviconFile(file);

    // Simular upload
    const imageUrl = URL.createObjectURL(file);
    updateSetting('branding', 'platform_favicon_url', imageUrl);
    toast.success('Favicon carregado! Não esqueça de salvar.');
  };

  const handleSave = async (category?: string) => {
    // Validar antes de salvar
    if (!validateSettings(category)) {
      return;
    }

    // Mostrar confirmação se for salvar tudo
    if (!category) {
      setSaveCategory(undefined);
      setShowConfirmDialog(true);
      return;
    }

    // Confirmar salvamento da categoria
    setSaveCategory(category);
    setShowConfirmDialog(true);
  };

  const confirmSave = async () => {
    setShowConfirmDialog(false);
    
    try {
      setSaving(true);

      const settingsToSave: any = {};
      
      if (saveCategory) {
        // Salvar apenas categoria específica
        settings[saveCategory]?.forEach((setting: any) => {
          settingsToSave[setting.key] = setting.value;
        });
      } else {
        // Salvar todas
        Object.entries(settings).forEach(([cat, settingsList]: [string, any]) => {
          settingsList.forEach((setting: any) => {
            settingsToSave[setting.key] = setting.value;
          });
        });
      }

      const response = await fetch('http://localhost:3000/api/admin/settings/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify({ settings: settingsToSave }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Configurações salvas com sucesso!');
        // Atualizar original settings para remover indicador de mudanças
        setOriginalSettings(JSON.parse(JSON.stringify(settings)));
        // Atualizar último update
        setLastUpdated({
          time: new Date().toLocaleString('pt-BR'),
          user: 'Super Admin',
        });
      } else {
        toast.error(result.error || 'Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
      setSaveCategory(undefined);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error('Digite um email para teste');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/admin/settings/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'super_admin',
        },
        body: JSON.stringify({ to_email: testEmail }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Email de teste enviado para ${testEmail}!`);
      } else {
        toast.error(result.error || 'Erro ao enviar email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Erro ao enviar email de teste');
    }
  };

  const handleTestSmtp = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/settings/test-smtp', {
        method: 'POST',
        headers: {
          'x-user-role': 'super_admin',
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Conexão SMTP testada com sucesso!');
      } else {
        toast.error(result.error || 'Erro na conexão SMTP');
      }
    } catch (error) {
      console.error('Error testing SMTP:', error);
      toast.error('Erro ao testar SMTP');
    }
  };

  const getSettingValue = (category: string, key: string, defaultValue: any = null) => {
    const setting = settings[category]?.find((s: any) => s.key === key);
    return setting ? setting.value : defaultValue;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/super-admin/dashboard')}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-foreground">Configurações do Sistema</h1>
            {hasUnsavedChanges() && (
              <Badge variant="destructive" className="animate-pulse">
                <AlertCircle className="h-3 w-3 mr-1" />
                Alterações não salvas
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">Gerencie as configurações globais da plataforma</p>
          {lastUpdated.time && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <History className="h-3 w-3" />
              Última atualização: {lastUpdated.time} por {lastUpdated.user}
            </p>
          )}
        </div>
        <Button onClick={() => handleSave()} className="gap-2" disabled={saving || !hasUnsavedChanges()}>
          <Save className="h-4 w-4" />
          Salvar Tudo
          {hasUnsavedChanges() && <Badge variant="secondary" className="ml-1 h-5">!</Badge>}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline">Geral</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden md:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="smtp" className="gap-2">
            <Server className="h-4 w-4" />
            <span className="hidden md:inline">SMTP</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden md:inline">Marca</span>
          </TabsTrigger>
          <TabsTrigger value="limits" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden md:inline">Limites</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden md:inline">Segurança</span>
          </TabsTrigger>
        </TabsList>

        {/* Geral */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>Informações básicas da plataforma</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReset('general')}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Resetar
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="platform_name">Nome da Plataforma</Label>
                <Input
                  id="platform_name"
                  value={getSettingValue('general', 'platform_name', '')}
                  onChange={(e) => updateSetting('general', 'platform_name', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="platform_url">URL da Plataforma</Label>
                <Input
                  id="platform_url"
                  type="url"
                  value={getSettingValue('general', 'platform_url', '')}
                  onChange={(e) => updateSetting('general', 'platform_url', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="platform_description">Descrição</Label>
                <Input
                  id="platform_description"
                  value={getSettingValue('general', 'platform_description', '')}
                  onChange={(e) => updateSetting('general', 'platform_description', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <Select
                    value={getSettingValue('general', 'timezone', 'America/Sao_Paulo')}
                    onValueChange={(value) => updateSetting('general', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">Brasília (UTC-3)</SelectItem>
                      <SelectItem value="America/Manaus">Manaus (UTC-4)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select
                    value={getSettingValue('general', 'language', 'pt-BR')}
                    onValueChange={(value) => updateSetting('general', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (BR)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Modo de Manutenção</Label>
                  <p className="text-sm text-muted-foreground">
                    Desabilita o acesso à plataforma temporariamente
                  </p>
                </div>
                <Switch
                  checked={getSettingValue('general', 'maintenance_mode', false)}
                  onCheckedChange={(checked) => updateSetting('general', 'maintenance_mode', checked)}
                />
              </div>

              <Button onClick={() => handleSave('general')} className="gap-2">
                <Save className="h-4 w-4" />
                Salvar Configurações Gerais
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Configurações de Email
                </CardTitle>
                <CardDescription>Configure os emails automáticos da plataforma</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReset('email')}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Resetar
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email de Boas-vindas</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar email automático para novos usuários
                    </p>
                  </div>
                  <Switch
                    checked={getSettingValue('email', 'email_welcome_enabled', false)}
                    onCheckedChange={(checked) => updateSetting('email', 'email_welcome_enabled', checked)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email_welcome_subject">Assunto do Email de Boas-vindas</Label>
                  <Input
                    id="email_welcome_subject"
                    value={getSettingValue('email', 'email_welcome_subject', '')}
                    onChange={(e) => updateSetting('email', 'email_welcome_subject', e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Alerta de Trial Acabando</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar alerta quando trial estiver para acabar
                    </p>
                  </div>
                  <Switch
                    checked={getSettingValue('email', 'email_trial_end_enabled', false)}
                    onCheckedChange={(checked) => updateSetting('email', 'email_trial_end_enabled', checked)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email_trial_end_days">Dias de Antecedência</Label>
                  <Input
                    id="email_trial_end_days"
                    type="number"
                    value={getSettingValue('email', 'email_trial_end_days', 5)}
                    onChange={(e) => updateSetting('email', 'email_trial_end_days', parseInt(e.target.value))}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enviar Fatura por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar faturas automaticamente
                    </p>
                  </div>
                  <Switch
                    checked={getSettingValue('email', 'email_invoice_enabled', false)}
                    onCheckedChange={(checked) => updateSetting('email', 'email_invoice_enabled', checked)}
                  />
                </div>
              </div>

              <Button onClick={() => handleSave('email')} className="gap-2">
                <Save className="h-4 w-4" />
                Salvar Configurações de Email
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMTP */}
        <TabsContent value="smtp" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Configurações SMTP
                </CardTitle>
                <CardDescription>Configure o servidor de email para envio</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReset('smtp')}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Resetar
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="smtp_host">Servidor SMTP</Label>
                  <Input
                    id="smtp_host"
                    value={getSettingValue('smtp', 'smtp_host', '')}
                    onChange={(e) => updateSetting('smtp', 'smtp_host', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="smtp_port">Porta</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={getSettingValue('smtp', 'smtp_port', 587)}
                    onChange={(e) => updateSetting('smtp', 'smtp_port', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="smtp_secure">Tipo de Segurança</Label>
                <Select
                  value={getSettingValue('smtp', 'smtp_secure', 'tls')}
                  onValueChange={(value) => updateSetting('smtp', 'smtp_secure', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tls">TLS</SelectItem>
                    <SelectItem value="ssl">SSL</SelectItem>
                    <SelectItem value="none">Nenhum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="smtp_username">Usuário</Label>
                <Input
                  id="smtp_username"
                  value={getSettingValue('smtp', 'smtp_username', '')}
                  onChange={(e) => updateSetting('smtp', 'smtp_username', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="smtp_password">Senha</Label>
                <Input
                  id="smtp_password"
                  type="password"
                  value={getSettingValue('smtp', 'smtp_password', '')}
                  onChange={(e) => updateSetting('smtp', 'smtp_password', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="smtp_from_email">Email de Envio</Label>
                <Input
                  id="smtp_from_email"
                  type="email"
                  value={getSettingValue('smtp', 'smtp_from_email', '')}
                  onChange={(e) => updateSetting('smtp', 'smtp_from_email', e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="smtp_from_name">Nome de Envio</Label>
                <Input
                  id="smtp_from_name"
                  value={getSettingValue('smtp', 'smtp_from_name', '')}
                  onChange={(e) => updateSetting('smtp', 'smtp_from_name', e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleTestSmtp} variant="outline" className="gap-2">
                  <TestTube className="h-4 w-4" />
                  Testar Conexão SMTP
                </Button>
                <Button onClick={() => handleSave('smtp')} className="gap-2">
                  <Save className="h-4 w-4" />
                  Salvar SMTP
                </Button>
              </div>

              {/* Teste de Email */}
              <div className="mt-6 rounded-lg border bg-muted p-4">
                <h4 className="mb-2 font-semibold">Testar Envio de Email</h4>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleTestEmail} variant="secondary" className="gap-2">
                    <Mail className="h-4 w-4" />
                    Enviar Teste
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding */}
        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Identidade Visual
                </CardTitle>
                <CardDescription>Personalize a aparência da plataforma</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReset('branding')}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Resetar
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="platform_logo_url">URL do Logo ou Upload</Label>
                <div className="flex gap-2">
                  <Input
                    id="platform_logo_url"
                    value={getSettingValue('branding', 'platform_logo_url', '')}
                    onChange={(e) => updateSetting('branding', 'platform_logo_url', e.target.value)}
                    placeholder="/logo.png"
                    className="flex-1"
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button variant="outline" size="icon" asChild>
                      <span>
                        <Upload className="h-4 w-4" />
                      </span>
                    </Button>
                  </label>
                </div>
                {logoFile && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Check className="h-3 w-3 text-green-600" />
                    Arquivo selecionado: {logoFile.name} ({(logoFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="platform_favicon_url">URL do Favicon ou Upload</Label>
                <div className="flex gap-2">
                  <Input
                    id="platform_favicon_url"
                    value={getSettingValue('branding', 'platform_favicon_url', '')}
                    onChange={(e) => updateSetting('branding', 'platform_favicon_url', e.target.value)}
                    placeholder="/favicon.ico"
                    className="flex-1"
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFaviconUpload}
                      className="hidden"
                    />
                    <Button variant="outline" size="icon" asChild>
                      <span>
                        <Upload className="h-4 w-4" />
                      </span>
                    </Button>
                  </label>
                </div>
                {faviconFile && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Check className="h-3 w-3 text-green-600" />
                    Arquivo selecionado: {faviconFile.name} ({(faviconFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="platform_primary_color">Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="platform_primary_color"
                      type="color"
                      value={getSettingValue('branding', 'platform_primary_color', '#1e40af')}
                      onChange={(e) => updateSetting('branding', 'platform_primary_color', e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={getSettingValue('branding', 'platform_primary_color', '#1e40af')}
                      onChange={(e) => updateSetting('branding', 'platform_primary_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="platform_secondary_color">Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="platform_secondary_color"
                      type="color"
                      value={getSettingValue('branding', 'platform_secondary_color', '#f59e0b')}
                      onChange={(e) => updateSetting('branding', 'platform_secondary_color', e.target.value)}
                      className="w-20 h-10"
                    />
                    <Input
                      value={getSettingValue('branding', 'platform_secondary_color', '#f59e0b')}
                      onChange={(e) => updateSetting('branding', 'platform_secondary_color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium mb-2">Preview das Cores:</p>
                <div className="flex gap-4">
                  <div
                    className="w-24 h-24 rounded-lg"
                    style={{ backgroundColor: getSettingValue('branding', 'platform_primary_color', '#1e40af') }}
                  />
                  <div
                    className="w-24 h-24 rounded-lg"
                    style={{ backgroundColor: getSettingValue('branding', 'platform_secondary_color', '#f59e0b') }}
                  />
                </div>
              </div>

              <Button onClick={() => handleSave('branding')} className="gap-2">
                <Save className="h-4 w-4" />
                Salvar Identidade Visual
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Limites */}
        <TabsContent value="limits" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Limites do Sistema</CardTitle>
                <CardDescription>Configure os limites e restrições da plataforma</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReset('limits')}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Resetar
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="max_churches_per_admin">Máx. Igrejas por Admin</Label>
                  <Input
                    id="max_churches_per_admin"
                    type="number"
                    value={getSettingValue('limits', 'max_churches_per_admin', 10)}
                    onChange={(e) => updateSetting('limits', 'max_churches_per_admin', parseInt(e.target.value))}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="max_upload_size_mb">Tamanho Máx. Upload (MB)</Label>
                  <Input
                    id="max_upload_size_mb"
                    type="number"
                    value={getSettingValue('limits', 'max_upload_size_mb', 10)}
                    onChange={(e) => updateSetting('limits', 'max_upload_size_mb', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="allowed_file_types">Tipos de Arquivo Permitidos</Label>
                <Input
                  id="allowed_file_types"
                  value={getSettingValue('limits', 'allowed_file_types', 'jpg,png,pdf,doc,docx')}
                  onChange={(e) => updateSetting('limits', 'allowed_file_types', e.target.value)}
                  placeholder="jpg,png,pdf,doc,docx"
                />
                <p className="text-xs text-muted-foreground">
                  Separe por vírgulas (ex: jpg,png,pdf)
                </p>
              </div>

              <Button onClick={() => handleSave('limits')} className="gap-2">
                <Save className="h-4 w-4" />
                Salvar Limites
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Configurações de Segurança
                </CardTitle>
                <CardDescription>Proteção e autenticação</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReset('security')}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Resetar
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="max_login_attempts">Máx. Tentativas de Login</Label>
                  <Input
                    id="max_login_attempts"
                    type="number"
                    value={getSettingValue('security', 'max_login_attempts', 5)}
                    onChange={(e) => updateSetting('security', 'max_login_attempts', parseInt(e.target.value))}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="login_lockout_minutes">Tempo de Bloqueio (min)</Label>
                  <Input
                    id="login_lockout_minutes"
                    type="number"
                    value={getSettingValue('security', 'login_lockout_minutes', 15)}
                    onChange={(e) => updateSetting('security', 'login_lockout_minutes', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="session_timeout_minutes">Timeout da Sessão (min)</Label>
                <Input
                  id="session_timeout_minutes"
                  type="number"
                  value={getSettingValue('security', 'session_timeout_minutes', 120)}
                  onChange={(e) => updateSetting('security', 'session_timeout_minutes', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Múltiplas Igrejas por Admin</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir que um admin gerencie várias igrejas
                    </p>
                  </div>
                  <Switch
                    checked={getSettingValue('features', 'feature_multi_church', true)}
                    onCheckedChange={(checked) => updateSetting('features', 'feature_multi_church', checked)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Domínio Personalizado</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir que igrejas usem domínio próprio
                    </p>
                  </div>
                  <Switch
                    checked={getSettingValue('features', 'feature_custom_domain', false)}
                    onCheckedChange={(checked) => updateSetting('features', 'feature_custom_domain', checked)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Acesso à API</Label>
                    <p className="text-sm text-muted-foreground">
                      Habilitar acesso à API para integrações
                    </p>
                  </div>
                  <Switch
                    checked={getSettingValue('features', 'feature_api_access', true)}
                    onCheckedChange={(checked) => updateSetting('features', 'feature_api_access', checked)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Habilitar sistema de analytics
                    </p>
                  </div>
                  <Switch
                    checked={getSettingValue('features', 'feature_analytics', true)}
                    onCheckedChange={(checked) => updateSetting('features', 'feature_analytics', checked)}
                  />
                </div>
              </div>

              <Button onClick={() => handleSave('security')} className="gap-2">
                <Save className="h-4 w-4" />
                Salvar Segurança
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Confirmação */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Salvamento</AlertDialogTitle>
            <AlertDialogDescription>
              {saveCategory ? (
                <>
                  Tem certeza que deseja salvar as alterações em <strong>{saveCategory}</strong>?
                </>
              ) : (
                <>
                  Tem certeza que deseja salvar <strong>todas as configurações</strong>?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave} className="gap-2">
              <Check className="h-4 w-4" />
              Confirmar e Salvar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
