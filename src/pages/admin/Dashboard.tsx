/**
 * Admin: Dashboard
 * Painel administrativo completo com informações do usuário
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDashboard } from '@/hooks/useDashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Heart,
  Calendar,
  TrendingUp,
  Settings,
  LogOut,
  Crown,
  AlertCircle,
  CheckCircle,
  Check,
  Clock,
  LogIn,
  Globe,
  Copy,
  Ticket,
  Megaphone,
  X,
  MessageCircle,
  Mail,
  Image,
  Video,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import BirthdayCard from '@/components/BirthdayCard';
import { buildApiUrl } from '@/lib/config';

// Limites por plano
const PLAN_LIMITS = {
  free: { members: 50, prayers: 20, admins: 1 },
  essencial: { members: 200, prayers: -1, admins: 3 },
};

export default function Dashboard() {
  const { church, loading, error } = useDashboard();
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState({
    members: 0,
    prayers: 0,
    admins: 1,
    events: 0,
    visitors: 0,
  });
  const [members, setMembers] = useState<any[]>([]);
  const [oldPendingPrayers, setOldPendingPrayers] = useState({
    count: 0,
    oldest: null as any,
  });
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [hasRegisteredRead, setHasRegisteredRead] = useState<Record<number, boolean>>({});
  const [trialInfo, setTrialInfo] = useState<{
    isTrial: boolean;
    daysRemaining: number;
    trialEndDate: string;
  } | null>(null);

  // Obter URL do site público
  const getPublicSiteUrl = () => {
    if (!church?.slug) return '#';
    const isLocalhost = window.location.hostname === 'localhost';
    return isLocalhost
      ? `http://localhost:5173/church/${church.slug}`
      : `https://${church.slug}.plataforma.minhaigreja.com.br`;
  };

  // Abrir site público em nova aba
  const handleOpenPublicSite = () => {
    const url = getPublicSiteUrl();
    window.open(url, '_blank');
  };

  // Copiar link do site público
  const handleCopySiteLink = async () => {
    const url = getPublicSiteUrl();
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link do site copiado!');
    } catch (error) {
      toast.error('Erro ao copiar link');
    }
  };

  // Registrar leitura do comunicado
  const registerAnnouncementRead = useCallback(async (announcementId: number) => {
    // Evitar registrar múltiplas vezes
    if (hasRegisteredRead[announcementId]) {
      console.log(`⚠️ Leitura do comunicado ${announcementId} já foi registrada`);
      return;
    }

    try {
      const churchId = localStorage.getItem('churchId');
      console.log('🔍 registerAnnouncementRead - churchId:', churchId, 'announcementId:', announcementId);
      
      if (!churchId) {
        console.error('❌ churchId não encontrado no localStorage');
        return;
      }

      const response = await fetch(buildApiUrl(`/api/admin/announcements/${announcementId}/read`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          church_id: parseInt(churchId),
        }),
      });

      const data = await response.json();
      console.log('📡 Response status:', response.status, 'Response data:', data);

      if (response.ok) {
        setHasRegisteredRead(prev => ({ ...prev, [announcementId]: true }));
        console.log(`✅ Leitura do comunicado ${announcementId} registrada com sucesso!`);
      } else {
        console.error(`❌ Erro ao registrar leitura: ${response.status}`, data);
      }
    } catch (error) {
      console.error('❌ Erro ao registrar leitura do comunicado:', error);
    }
  }, [hasRegisteredRead]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('churchId');
    navigate('/login');
    toast.success('Logout realizado com sucesso!');
  };

  // Carregar estatísticas do backend
  useEffect(() => {
    const loadStats = async () => {
      try {
        const churchId = localStorage.getItem('churchId') || church?.id;

        if (!churchId) return;

        // Carregar stats de membros, pedidos e admins
        const statsResponse = await fetch(buildApiUrl(`/api/church/${churchId}/stats`));
        const statsResult = await statsResponse.json();

        // Carregar eventos ativos
        const eventsResponse = await fetch(buildApiUrl(`/api/events?church_id=${churchId}`));
        const eventsResult = await eventsResponse.json();

        // Carregar membros para aniversariantes
        const membersResponse = await fetch(buildApiUrl(`/api/members?church_id=${churchId}`));
        const membersResult = await membersResponse.json();

        if (statsResult.success && statsResult.data) {
          setUserStats({
            members: statsResult.data.members || 0,
            prayers: statsResult.data.prayers || 0,
            admins: statsResult.data.admins || 1,
            events: eventsResult.success ? (eventsResult.data?.length || 0) : 0,
            visitors: 0, // Implementar depois
          });
        }

        if (membersResult.success && membersResult.data) {
          setMembers(membersResult.data);
          console.log('📊 Dashboard - Membros carregados para aniversariantes:', membersResult.data.length);
          console.log('📊 Dashboard - Membros:', membersResult.data);
        }

        // Carregar pedidos pendentes antigos (> 7 dias)
        const reminderStatsResponse = await fetch(buildApiUrl(`/api/pedidos/stats/reminders?church_id=${churchId}`));
        const reminderStatsResult = await reminderStatsResponse.json();

        if (reminderStatsResult.success && reminderStatsResult.data) {
          setOldPendingPrayers({
            count: reminderStatsResult.data.oldPendingCount || 0,
            oldest: reminderStatsResult.data.oldestPedido || null,
          });
        }

        // Carregar comunicados ativos
        const announcementsResponse = await fetch(buildApiUrl('/api/admin/announcements/active'));
        const announcementsResult = await announcementsResponse.json();

        if (announcementsResult.success && announcementsResult.data) {
          setAnnouncements(announcementsResult.data);
          console.log('📢 Comunicados carregados:', announcementsResult.data.length);
        }

        // Carregar informações do trial
        const trialResponse = await fetch(buildApiUrl('/api/admin/upgrade/status'), {
          headers: {
            'x-church-id': churchId.toString(),
          },
        });
        const trialResult = await trialResponse.json();

        if (trialResult.success && trialResult.data.is_trial) {
          setTrialInfo({
            isTrial: true,
            daysRemaining: trialResult.data.days_remaining,
            trialEndDate: trialResult.data.trial_end_date,
          });
          console.log('🎉 Trial ativo:', trialResult.data);
          // Salvar no localStorage para outras páginas saberem
          localStorage.setItem('isTrialActive', 'true');
        }
      } catch (error) {
        console.error('Error loading stats:', error);
        // Usa dados simulados se falhar
        setUserStats({
          members: 0,
          prayers: 0,
          admins: 1,
          events: 0,
          visitors: 0,
        });
      }
    };

    loadStats();
  }, [church]);

  // Registrar leitura do comunicado quando ele for exibido
  useEffect(() => {
    if (announcements.length > 0) {
      const firstAnnouncement = announcements[0];
      const churchId = localStorage.getItem('churchId');
      console.log('🔍 useEffect - announcements:', announcements.length, 'firstAnnouncement.id:', firstAnnouncement.id, 'churchId:', churchId);
      console.log('🔍 hasRegisteredRead:', hasRegisteredRead);
      
      if (!hasRegisteredRead[firstAnnouncement.id]) {
        console.log('📡 Chamando registerAnnouncementRead...');
        registerAnnouncementRead(firstAnnouncement.id);
      } else {
        console.log('✅ Leitura já registrada para este comunicado');
      }
    }
  }, [announcements, hasRegisteredRead, registerAnnouncementRead]);

  // Log quando membros mudam
  useEffect(() => {
    console.log('🎂 Dashboard - Members state updated:', members.length);
  }, [members]);

  // Calcular porcentagens e limites
  // Verificar se está em trial OU se o plano é essencial
  const trialEndDate = church?.trial_end_date ? new Date(church.trial_end_date) : null;
  const isTrialActive = trialEndDate && trialEndDate > new Date();
  const planType: string = church?.plan_type || 'free';
  const plan = isTrialActive || planType === 'essencial' || planType === 'premium'
    ? 'essencial'
    : planType;
  const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;

  const memberPercent = Math.min((userStats.members / limits.members) * 100, 100);
  const adminPercent = limits.admins > 0 ? Math.min((userStats.admins / limits.admins) * 100, 100) : 0;
  const prayerPercent = limits.prayers > 0 ? Math.min((userStats.prayers / limits.prayers) * 100, 100) : 0;

  // Prevenir NaN
  const safePrayerPercent = isNaN(prayerPercent) ? 0 : prayerPercent;

  // Função para obter mensagem de alerta baseada no percentual
  const getLimitMessage = (percent: number, limit: number) => {
    if (limit <= 0) return null; // Ilimitado
    
    if (percent >= 100) {
      return {
        message: '❌ Limite atingido!',
        className: 'text-red-600 font-semibold',
        icon: '❌'
      };
    } else if (percent >= 80) {
      return {
        message: '⚠️ Quase no limite!',
        className: 'text-amber-600 font-medium',
        icon: '⚠️'
      };
    }
    return null; // Sem alerta
  };

  // Calcular dias restantes do trial (trialEndDate já declarado acima)
  const daysRemaining = trialEndDate 
    ? Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 30;

  // Plano formatado
  const planNames: Record<string, string> = {
    free: 'Free',
    essencial: 'Essencial',
    premium: 'Premium',
    enterprise: 'Enterprise',
  };

  const planColors: Record<string, string> = {
    free: 'bg-gray-500',
    essencial: 'bg-blue-500',
    premium: 'bg-purple-500',
    enterprise: 'bg-amber-500',
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !church) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Erro ao carregar dashboard</h1>
          <p className="text-muted-foreground mb-4">{error || 'Igreja não encontrada'}</p>
          <Button onClick={() => navigate('/login')}>
            <LogIn className="w-4 h-4 mr-2" />
            Voltar para Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      {/* Header com Informações do Usuário */}
      <div className="bg-card border rounded-lg p-6 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Informações do Usuário */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{church?.name || 'Igreja'}</h1>
                <Badge className={planColors[plan]}>
                  <Crown className="w-3 h-3 mr-1" />
                  {planNames[plan]}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm mb-2">
                {church?.admin_email || church?.email || 'email@igreja.com'}
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                {trialEndDate && daysRemaining > 0 ? (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <Clock className="w-3 h-3 mr-1" />
                    Trial: {daysRemaining} dias restantes
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Plano ativo
                  </Badge>
                )}
                {church?.address_city && (
                  <Badge variant="outline">
                    📍 {church.address_city}/{church.address_state}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" onClick={handleOpenPublicSite}>
              <Globe className="w-4 h-4 mr-2" />
              Ver Site Público
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/configuracoes')}>
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Alerta de Trial */}
        {trialEndDate && daysRemaining > 0 && daysRemaining <= 7 && (
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Seu período de trial está acabando!
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Faltam {daysRemaining} dias para o fim do seu trial de 30 dias. Faça upgrade para não perder suas configurações.
              </p>
            </div>
            <Button size="sm" variant="default" className="bg-amber-600 hover:bg-amber-700">
              Fazer Upgrade
            </Button>
          </div>
        )}
      </div>

      {/* Alerta de Limite Atingido - Upgrade */}
      {(memberPercent >= 100 || safePrayerPercent >= 100 || adminPercent >= 100) && plan === 'free' && (
        <Card className="mb-8 border-2 border-primary bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Crown className="w-6 h-6" />
              🎉 Sua igreja está crescendo!
            </CardTitle>
            <CardDescription className="text-primary/80">
              Você atingiu o limite do plano Free. Faça upgrade para o plano Essencial e desbloqueie recursos ilimitados!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Membros Ilimitados</p>
                  <p className="text-xs text-muted-foreground">De 50 para 200 membros</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Pedidos Ilimitados</p>
                  <p className="text-xs text-muted-foreground">De 20 para ilimitados</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm">3 Administradores</p>
                  <p className="text-xs text-muted-foreground">De 1 para 3 admins</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate('/admin/plans')} className="gap-2 bg-primary hover:bg-primary/90">
                <Crown className="w-4 h-4" />
                Ver Planos Essenciais
              </Button>
              <Button variant="outline" onClick={() => navigate('/admin/plans')} className="gap-2">
                <Settings className="w-4 h-4" />
                Conhecer Recursos
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">
              💰 Apenas R$ 49,90/mês • Cancele quando quiser
            </p>
          </CardContent>
        </Card>
      )}

      {/* Banner de Trial Ativo */}
      {trialInfo?.isTrial && (
        <Card className="mb-8 border-2 border-green-500 bg-gradient-to-r from-green-50 via-green-100 to-green-50 dark:from-green-900/20 dark:via-green-900/10 dark:to-green-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <Crown className="w-6 h-6" />
              🎉 Plano Essencial Ativo - Período de Trial!
            </CardTitle>
            <CardDescription className="text-green-600 dark:text-green-300">
              Sua igreja está aproveitando todos os recursos do plano Essencial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                      {trialInfo.daysRemaining} dias restantes
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      Trial encerra em {new Date(trialInfo.trialEndDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-green-700 dark:text-green-400">Recursos desbloqueados:</p>
                  <ul className="grid md:grid-cols-2 gap-2 text-sm text-green-600 dark:text-green-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4" /> 200 membros
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4" /> Pedidos de oração ilimitados
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4" /> 3 administradores
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4" /> Upload de logo
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4" /> Domínio próprio
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4" /> Suporte prioritário
                    </li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-col justify-center items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  Após o trial:
                </p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                  R$ 49,90<span className="text-sm font-normal">/mês</span>
                </p>
                <Button onClick={() => navigate('/admin/plans')} className="w-full gap-2 bg-green-600 hover:bg-green-700">
                  <Crown className="w-4 h-4" />
                  Manter Plano Essencial
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Pagamento via PIX ou Boleto
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards de Uso do Plano */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Membros */}
        <Card className={getLimitMessage(memberPercent, limits.members)?.message.includes('Limite') ? 'border-red-500' : getLimitMessage(memberPercent, limits.members)?.message.includes('Quase') ? 'border-amber-500' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {userStats.members} / {limits.members === -1 ? '∞' : limits.members}
            </div>
            {limits.members > 0 && (
              <>
                <Progress value={memberPercent} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">
                  {memberPercent.toFixed(0)}% utilizado
                  {getLimitMessage(memberPercent, limits.members) && (
                    <span className={`ml-2 ${getLimitMessage(memberPercent, limits.members)?.className}`}>
                      {getLimitMessage(memberPercent, limits.members)?.message}
                    </span>
                  )}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pedidos de Oração */}
        <Card className={getLimitMessage(safePrayerPercent, limits.prayers)?.message.includes('Limite') ? 'border-red-500' : getLimitMessage(safePrayerPercent, limits.prayers)?.message.includes('Quase') ? 'border-amber-500' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos de Oração</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {userStats.prayers} / {limits.prayers === -1 ? '∞' : limits.prayers}
            </div>
            {limits.prayers > 0 && (
              <>
                <Progress value={prayerPercent} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">
                  {safePrayerPercent.toFixed(0)}% utilizado este mês
                  {getLimitMessage(safePrayerPercent, limits.prayers) && (
                    <span className={`ml-2 ${getLimitMessage(safePrayerPercent, limits.prayers)?.className}`}>
                      {getLimitMessage(safePrayerPercent, limits.prayers)?.message}
                    </span>
                  )}
                </p>
              </>
            )}
            {limits.prayers === -1 && (
              <p className="text-xs text-green-600 font-medium">
                ✅ Ilimitado no seu plano
              </p>
            )}
          </CardContent>
        </Card>

        {/* Administradores */}
        <Card className={getLimitMessage(adminPercent, limits.admins)?.message.includes('Limite') ? 'border-red-500' : getLimitMessage(adminPercent, limits.admins)?.message.includes('Quase') ? 'border-amber-500' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {userStats.admins} / {limits.admins === -1 ? '∞' : limits.admins}
            </div>
            {limits.admins > 0 && (
              <>
                <Progress value={adminPercent} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">
                  {adminPercent.toFixed(0)}% utilizado
                  {getLimitMessage(adminPercent, limits.admins) && (
                    <span className={`ml-2 ${getLimitMessage(adminPercent, limits.admins)?.className}`}>
                      {getLimitMessage(adminPercent, limits.admins)?.message}
                    </span>
                  )}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Rápidos */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.members}</div>
            <p className="text-xs text-muted-foreground">
              Cadastre membros da igreja
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos de Oração</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.prayers}</div>
            <p className="text-xs text-muted-foreground">
              Pedidos recebidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.events}</div>
            <p className="text-xs text-muted-foreground">
              Eventos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitantes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.visitors}</div>
            <p className="text-xs text-muted-foreground">
              Neste mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Aniversariantes do Mês */}
      <BirthdayCard members={members} />

      {/* Card de Comunicados */}
      {announcements.length > 0 && (
        <Card className="mb-8 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-500">
                <Megaphone className="w-5 h-5" />
                📢 Comunicado Importante
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAnnouncements([])}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
            <CardDescription className="text-blue-600 dark:text-blue-400">
              {announcements.length > 1 
                ? `Você tem ${announcements.length} comunicados, mostrando o mais importante`
                : 'Comunicado novo da plataforma'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Mostrar apenas o primeiro comunicado (mais prioritário) */}
              {(() => {
                const announcement = announcements[0];
                const priorityColors = {
                  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
                  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                };

                const priorityLabels = {
                  urgent: 'Urgente',
                  high: 'Alta',
                  medium: 'Média',
                  low: 'Baixa',
                };

                return (
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                          {announcement.title}
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          {announcement.message}
                        </p>
                      </div>
                      <Badge className={priorityColors[announcement.priority as keyof typeof priorityColors]}>
                        {priorityLabels[announcement.priority as keyof typeof priorityLabels]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-blue-600 dark:text-blue-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(announcement.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      {announcement.expires_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expira em {new Date(announcement.expires_at).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card de Lembretes - Pedidos Pendentes Antigos */}
      {oldPendingPrayers.count > 0 && (
        <Card className="mb-8 border-amber-500 bg-amber-50 dark:bg-amber-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-500">
              <AlertCircle className="w-5 h-5" />
              ⏰ Pedidos de Oração Pendentes
            </CardTitle>
            <CardDescription className="text-amber-600 dark:text-amber-400">
              Você tem {oldPendingPrayers.count} pedido(s) de oração pendente(s) há mais de 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-3 bg-amber-100 dark:bg-amber-800 rounded-lg">
                  <Heart className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  {oldPendingPrayers.oldest && (
                    <>
                      <p className="font-semibold text-amber-800 dark:text-amber-300">
                        Pedido mais antigo: "{oldPendingPrayers.oldest.titulo || 'Sem título'}"
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        Pendente há {oldPendingPrayers.oldest.days_pending} dias
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate('/admin/pedidos?filter=old')}
                  variant="default"
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Ver Pendentes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link to="/admin/configuracoes" className="block h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                ⚙️ Configurações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure logo, endereço, redes sociais
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link to="/admin/configuracoes?tab=domain" className="block h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                🌐 Domínio Próprio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure seu domínio personalizado
              </p>
              {church?.plan_type === 'essencial' && (
                <Badge className="mt-2 bg-green-500 text-xs">
                  Incluído no Essencial
                </Badge>
              )}
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link to="/admin/galeria" className="block h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" />
                📸 Galeria de Fotos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gerencie fotos da igreja
              </p>
              {church?.plan_type === 'essencial' && (
                <Badge className="mt-2 bg-green-500 text-xs">
                  Incluído no Essencial
                </Badge>
              )}
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link to="/admin/live-streams" className="block h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                📺 Transmissões Ao Vivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Lives do YouTube
              </p>
              {church?.plan_type === 'essencial' && (
                <Badge className="mt-2 bg-green-500 text-xs">
                  Incluído no Essencial
                </Badge>
              )}
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link to="/admin/cultos" className="block h-full">
            <CardHeader>
              <CardTitle>🙏 Cultos Fixos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gerencie a grade de cultos semanais
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link to="/admin/ministerios" className="block h-full">
            <CardHeader>
              <CardTitle>🙏 Ministérios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Áreas de serviço da igreja
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link to="/admin/pedidos" className="block h-full">
            <CardHeader>
              <CardTitle>📝 Pedidos de Oração</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gerencie os pedidos de oração recebidos
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link to="/admin/membros" className="block h-full">
            <CardHeader>
              <CardTitle>👥 Membros</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Cadastre e gerencie membros da igreja
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link to="/admin/eventos" className="block h-full">
            <CardHeader>
              <CardTitle>📅 Eventos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Crie e gerencie eventos e cultos
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link to="/admin/tickets" className="block h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                🎫 Tickets de Suporte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Solicite ajuda ao suporte
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-yellow-200 dark:border-yellow-800/50 bg-yellow-50/50 dark:bg-yellow-900/10">
          <Link to="/admin/avaliar" className="block h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                ⭐ Avaliar Plataforma
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Dê sua nota e feedback
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Site Público Card */}
      <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            🌐 Site Público da Igreja
          </CardTitle>
          <CardDescription>
            Visualize como os visitantes estão vendo o site da sua igreja
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">{church?.name}</p>
                <p className="text-sm text-muted-foreground font-mono">
                  {getPublicSiteUrl()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleOpenPublicSite} variant="default">
                <Globe className="w-4 h-4 mr-2" />
                Ver Site
              </Button>
              <Button onClick={handleCopySiteLink} variant="outline">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
