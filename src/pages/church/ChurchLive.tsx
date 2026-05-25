/**
 * ChurchLive - Pagina de Transmissao ao Vivo Privada (Versao Profissional - Novo Design)
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/config';
import LiveAuthGate from '@/components/LiveAuthGate';
import LiveChat from '@/components/LiveChat';
import LiveWelcomeGate from '@/components/LiveWelcomeGate';
import LiveConversionBanner from '@/components/LiveConversionBanner';
import Navbar from './NewDesign/Navbar';
import Footer from './NewDesign/Footer';
import PrayerModal from './NewDesign/PrayerModal';
import AdminModal from './NewDesign/AdminModal';
import { ContactMessage, PrayerRequest } from './types';
import {
  Play, Users, MessageCircle, ArrowLeft, Radio, Clock, WifiOff,
  Calendar, Film, BookOpen, DollarSign, Heart, Bell, Mail, Smartphone, Loader2, X, Crown
} from 'lucide-react';
import { io } from 'socket.io-client';

interface LiveStream {
  id: number; title: string; description: string | null;
  youtube_url: string | null; youtube_video_id: string | null;
  scheduled_start: string | null; status: string;
  is_active: number; view_count: number;
}

interface ScheduleItem { dia: string; hora: string; nome: string; descricao: string; }
interface Recording { id: number; title: string; date: string; }

const defaultSchedule: ScheduleItem[] = [
  { dia: 'Domingo', hora: '18:30', nome: 'Culto de Celebracao', descricao: 'Culto principal' },
  { dia: 'Segunda', hora: '19:00', nome: 'Noite de Oracao', descricao: 'Oracao pelos ministerios' },
  { dia: 'Terca', hora: '19:00', nome: 'Escola Biblica', descricao: 'Estudo da Palavra' },
  { dia: 'Quarta', hora: '19:00', nome: 'Noite da Vitoria', descricao: 'Milagres e libertacao' },
  { dia: 'Quinta', hora: '19:00', nome: 'Culto da Familia', descricao: 'Familia e casais' },
  { dia: 'Sexta', hora: '19:00', nome: 'Culto de Jovens', descricao: 'Louvor e adoracao' },
  { dia: 'Sabado', hora: '19:00', nome: 'Evangelismo', descricao: 'Culto festivo' },
];

export default function ChurchLive() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const activeSlug = slug;
  const [church, setChurch] = useState<any>(null);
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [previousStreams, setPreviousStreams] = useState<any[]>([]);
  const [countdown, setCountdown] = useState<string>('');
  const [notifyForm, setNotifyForm] = useState({ name: '', email: '', phone: '' });
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [prayerOpen, setPrayerOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [prayerText, setPrayerText] = useState('');
  const [prayerLoading, setPrayerLoading] = useState(false);
  const [prayerName, setPrayerName] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [versesOpen, setVersesOpen] = useState(false);
  const [churchVerses, setChurchVerses] = useState<{ text: string; reference: string }[]>([]);
  const [recordings] = useState<Recording[]>([
    { id: 1, title: 'Culto de Celebracao', date: 'Dom 18/05' },
    { id: 2, title: 'Culto de Jovens', date: 'Sex 16/05' },
    { id: 3, title: 'Escola Biblica', date: 'Ter 14/05' },
    { id: 4, title: 'Santa Ceia', date: 'Dom 11/05' },
  ]);

  // Estados para conversão (Welcome Gate & Banner)
  const [showWelcomeGate, setShowWelcomeGate] = useState(true);
  const [showConversionBanner, setShowConversionBanner] = useState(false);
  const [timeWatched, setTimeWatched] = useState(0);
  const [memberCount] = useState(53); // Simulado - em produção viria da API

  // Timer para contar tempo assistido
  useEffect(() => {
    if (!showWelcomeGate && activeStream?.status === 'live') {
      const timer = setInterval(() => {
        setTimeWatched(prev => {
          const newTime = prev + 1;
          // Mostrar banner após 2 minutos se não for membro
          if (newTime === 2 && !localStorage.getItem('memberLiveSession')) {
            setShowConversionBanner(true);
          }
          return newTime;
        });
      }, 60000); // Incrementa a cada 1 minuto
      return () => clearInterval(timer);
    }
  }, [showWelcomeGate, activeStream?.status]);

  useEffect(() => {
    loadChurchData();
    loadLiveStreams();
    const interval = setInterval(loadLiveStreams, 30000);
    return () => clearInterval(interval);
  }, [slug]);

  // Carregar versículos da igreja
  useEffect(() => {
    if (church?.id) {
      fetch(buildApiUrl(`/api/church/${church.id}/verses`))
        .then(r => r.json())
        .then(data => {
          if (data.success) setChurchVerses(data.data);
        })
        .catch(console.error);
    }
  }, [church?.id]);

  // Monitor de Conexão
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Conexão restaurada! Atualizando live...');
      loadLiveStreams();
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Sem conexão com a internet. Tentando reconectar...', { duration: 5000 });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!activeStream?.scheduled_start) { setCountdown(''); return; }
    const timer = setInterval(() => {
      const target = new Date(activeStream.scheduled_start!).getTime();
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) { setCountdown(''); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${days}d ${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeStream?.scheduled_start]);

  const loadChurchData = async () => {
    try {
      const res = await fetch(buildApiUrl(`/api/church/slug/${slug}`));
      const data = await res.json();
      if (data.success) setChurch(data.data);
    } catch (error) { console.error(error); }
  };

  const loadLiveStreams = async () => {
    try {
      const res = await fetch(buildApiUrl(`/api/church/slug/${slug}/live-streams`));
      const data = await res.json();
      if (data.success) {
        setLiveStreams(data.data);
        
        // Separa a live ativa das anteriores
        const active = data.data.find((s: LiveStream) => s.is_active === 1 && (s.status === 'live' || s.status === 'scheduled'));
        const previous = data.data.filter((s: LiveStream) => s.status === 'ended');

        if (active) {
          setActiveStream(active);
        } else { 
          setActiveStream(null); 
        }
        // Atualiza a lista de anteriores
        setPreviousStreams(previous);
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  // WebSocket para estatísticas em tempo real
  useEffect(() => {
    if (!activeStream?.id || !church?.id) return;
    const socketUrl = buildApiUrl('').replace('/api', '');
    const statsSocket = io(socketUrl, { transports: ['websocket', 'polling'] });

    statsSocket.on('connect', () => {
      console.log('🔌 Stats connected');
      // Entra na sala para ser contado como espectador
      statsSocket.emit('join_chat', {
        churchId: church.id,
        liveStreamId: activeStream.id,
        userName: 'Espectador',
        userType: 'viewer',
      });
      
      // Solicita contagem após entrar
      setTimeout(() => {
        statsSocket.emit('get_online_count', { churchId: church.id, liveStreamId: activeStream.id });
      }, 500);
    });

    statsSocket.on('online_count', (count: number) => {
      setViewerCount(count);
    });

    const interval = setInterval(() => {
      statsSocket.emit('get_online_count', { churchId: church.id, liveStreamId: activeStream.id });
    }, 10000);

    return () => {
      clearInterval(interval);
      statsSocket.disconnect();
    };
  }, [activeStream?.id, church?.id]);

  const handlePrayerRequest = async () => {
    if (!church?.id) return;
    try {
      setPrayerLoading(true);
      const session = localStorage.getItem('memberLiveSession');
      const memberName = session ? JSON.parse(session).member?.name : prayerName || 'Visitante';
      const prayerMessage = prayerText.trim() || `Estou assistindo a live "${activeStream?.title}" e peço oração.`;

      if (prayerMessage.length < 10) {
        toast.error('A oração deve ter pelo menos 10 caracteres');
        setPrayerLoading(false);
        return;
      }

      const response = await fetch(buildApiUrl('/api/pedidos/public'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          church_slug: activeSlug,
          nome: memberName,
          oracao: prayerMessage,
          lgpd: true,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('🙏 Oração enviada! A equipe pastoral está orando por você.');
        setPrayerOpen(false);
        setPrayerText('');
        setPrayerName('');
      } else {
        toast.error(data.error || 'Erro ao enviar oração');
      }
    } catch (error) {
      console.error('Error sending prayer:', error);
      toast.error('Erro ao enviar oração');
    } finally {
      setPrayerLoading(false);
    }
  };

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyForm.name || !church?.id) return;
    try {
      setNotifyLoading(true);
      const res = await fetch(buildApiUrl('/api/live/notify'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          church_id: church.id,
          live_stream_id: activeStream?.id || null,
          ...notifyForm,
          notification_type: 'both'
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setNotifyOpen(false);
        setNotifyForm({ name: '', email: '', phone: '' });
      } else { toast.error(data.error); }
    } catch (error) { toast.error('Erro ao se inscrever'); }
    finally { setNotifyLoading(false); }
  };

  const handleCopyVerse = (text: string, ref: string) => {
    const fullText = `"${text}" - ${ref}\n\n🙏 Assista conosco: ${window.location.href}`;
    navigator.clipboard.writeText(fullText);
    toast.success('Versículo copiado! Você pode compartilhar agora.');
  };

  const defaultVerses = [
    { text: "Porque sou eu que conheço os planos que tenho para vocês... planos de paz e não de mal.", ref: "Jeremias 29:11" },
    { text: "O Senhor é meu pastor; de nada terei falta.", ref: "Salmos 23:1" },
    { text: "Sejam fortes e corajosos. Não tenham medo!", ref: "Josué 1:9" },
  ];

  const versesList = churchVerses.length > 0
    ? churchVerses.map((v: any) => ({ text: v.text, ref: v.reference }))
    : defaultVerses;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-red-500/30 rounded-full animate-ping"></div>
            <div className="absolute inset-0 border-4 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <Radio className="absolute inset-0 m-auto h-6 w-6 text-red-500" />
          </div>
          <p className="text-lg font-medium">Carregando transmissão...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 ${isDarkMode ? 'dark' : ''}`}>
      {/* Header do Novo Design */}
      <Navbar 
        isDarkMode={isDarkMode}
        toggleTheme={() => setIsDarkMode(!isDarkMode)}
        onOpenPrayer={() => setPrayerOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        churchName={church?.name}
        churchSlug={activeSlug}
        churchLogo={church?.logo_url ? buildApiUrl(church.logo_url) : null}
      />

      {/* Banner de Conexão */}
      {!isOnline && (
        <div className="bg-amber-600 text-white py-2 px-4 text-center text-sm font-medium animate-pulse sticky top-0 z-50">
          ⚠️ Sem conexão com a internet. Tentando reconectar...
        </div>
      )}

      {/* Welcome Gate para conversão */}
      {showWelcomeGate && activeStream && (
        <LiveWelcomeGate
          churchName={church?.name || 'Igreja'}
          churchLogo={church?.logo_url}
          memberCount={memberCount}
          onlineCount={viewerCount}
          liveTitle={activeStream?.title || 'Transmissão Ao Vivo'}
          onEnterAsGuest={() => setShowWelcomeGate(false)}
          onBecomeMember={() => {
            setShowWelcomeGate(false);
            navigate(`/igreja/${slug}/cadastro`);
          }}
        />
      )}

      {/* Banner de conversão contextual */}
      <LiveConversionBanner
        memberCount={memberCount}
        isVisible={showConversionBanner}
        onClose={() => setShowConversionBanner(false)}
        onAction={() => navigate(`/igreja/${slug}/cadastro`)}
        timeWatched={timeWatched}
      />

      {/* Conteúdo Principal (Gate ou Player) */}
      <div className="flex-1">
        <LiveAuthGate churchSlug={activeSlug || ''}>
          <div className="min-h-full bg-slate-950 text-white">
            <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
              <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/igreja/${slug}`)} className="text-slate-400 hover:text-white gap-2">
                    <ArrowLeft className="w-4 h-4" /> Voltar ao Site
                  </Button>
                  <h1 className="text-white font-semibold text-lg hidden md:block">{church?.name || 'Igreja'} - Transmissão ao Vivo</h1>
                </div>
                <div className="flex items-center gap-2">
                  {/* Status de Membro */}
                  {(() => {
                    const session = localStorage.getItem('memberLiveSession');
                    const isMember = session && JSON.parse(session)?.member;
                    return isMember ? (
                      <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 gap-1">
                        <Crown className="w-3 h-3" /> Membro
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-500/30 text-amber-400 gap-1 cursor-pointer hover:bg-amber-500/10" onClick={() => navigate(`/igreja/${slug}/cadastro`)}>
                        <Crown className="w-3 h-3" /> Seja Membro
                      </Badge>
                    );
                  })()}
                  
                  {/* Indicador de Conexão */}
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isOnline ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400 animate-pulse'}`}>
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className="hidden sm:inline">{isOnline ? 'Conectado' : 'Offline'}</span>
                  </div>
                  {activeStream ? (
                    activeStream.status === 'live' ? <Badge className="bg-red-600 animate-pulse gap-1"><Radio className="w-3 h-3" /> AO VIVO</Badge> :
                    activeStream.status === 'scheduled' ? <Badge className="bg-amber-600 gap-1"><Clock className="w-3 h-3" /> Agendada</Badge> :
                    <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" /> Offline</Badge>
                  ) : <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Offline</Badge>}
                </div>
              </div>
            </header>

        <main className="container mx-auto px-4 py-6 space-y-6">
          {activeStream && (
            <div className="space-y-6">
              {/* Player Grande */}
              <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-slate-800">
                {activeStream.youtube_video_id || activeStream.youtube_url ? (
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${activeStream.youtube_video_id?.split('?')[0] || activeStream.youtube_url?.split('/').pop()?.split('?')[0]}?autoplay=1&mute=1&controls=1`}
                    title={activeStream.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400"><WifiOff className="w-16 h-16" /></div>
                )}
              </div>

              {/* Info + Stats */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white">{activeStream.title}</h2>
                  {activeStream.description && <p className="text-slate-400 mt-1 text-sm">{activeStream.description}</p>}
                  {activeStream.status === 'scheduled' && activeStream.scheduled_start && (
                    <div className="mt-2 flex items-center gap-4">
                      <Badge variant="outline" className="border-amber-500 text-amber-400">
                        <Clock className="w-3 h-3 mr-1" /> Começa em: {countdown || '...'}
                      </Badge>
                      <span className="text-slate-400 text-sm">
                        {new Date(activeStream.scheduled_start).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {viewerCount} assistindo</span>
                </div>
              </div>

              {/* Countdown + Notify (quando agendada) */}
              {activeStream.status === 'scheduled' && (
                <Card className="bg-slate-900/50 border-amber-500/30 rounded-xl">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="text-center md:text-left">
                        <h3 className="text-lg font-semibold text-amber-400 flex items-center gap-2">
                          <Bell className="w-5 h-5" /> Não perca esta transmissão!
                        </h3>
                        <p className="text-slate-400 mt-1 text-sm">Inscreva-se para ser notificado quando a live começar.</p>
                      </div>
                      <Button onClick={() => setNotifyOpen(true)} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white gap-2 shadow-lg shadow-amber-500/20">
                        <Bell className="w-4 h-4" /> Me Notificar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Botões de Acao */}
              <div className="flex gap-3 flex-wrap">
                <Button onClick={() => setPrayerOpen(true)} className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white gap-2 shadow-lg shadow-pink-500/20">
                  <Heart className="w-4 h-4" /> Ore por mim
                </Button>
                <Button variant="outline" className="border-emerald-600 text-emerald-400 hover:bg-emerald-900/20 gap-2">
                  <DollarSign className="w-4 h-4" /> Ofertar
                </Button>
                <Button variant="outline" onClick={() => setVersesOpen(true)} className="border-purple-600 text-purple-400 hover:bg-purple-900/20 gap-2">
                  <BookOpen className="w-4 h-4" /> Versículos
                </Button>
                <Button variant="outline" onClick={() => setShowChat(!showChat)} className="border-blue-600 text-blue-400 hover:bg-blue-900/20 gap-2">
                  <MessageCircle className="w-4 h-4" /> Chat {showChat ? 'Fechado' : 'Aberto'}
                </Button>
              </div>

              {showChat && activeStream && (
                <LiveChat
                  churchId={church?.id}
                  liveStreamId={activeStream?.id}
                  memberSession={(() => {
                    try { return JSON.parse(localStorage.getItem('memberLiveSession') || 'null'); } catch { return null; }
                  })()}
                  isOpen={showChat}
                  onClose={() => setShowChat(false)}
                />
              )}
            </div>
          )}

          {/* Offline State */}
          {!activeStream && (
            <Card className="bg-slate-900/50 border-slate-800 max-w-2xl mx-auto text-center rounded-2xl">
              <CardContent className="py-16">
                <Film className="w-10 h-10 mx-auto mb-4 text-slate-500" />
                <h2 className="text-2xl font-bold mb-3 text-white">Nenhuma transmissão agora</h2>
                <p className="text-slate-400 mb-6">Confira nossa programação ou assista a gravações.</p>
                <Button onClick={() => navigate(`/church/${slug}`)} variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800"><ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Site</Button>
              </CardContent>
            </Card>
          )}

          {/* Programacao Semanal */}
          <section>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white"><Calendar className="w-5 h-5" /> Programação Semanal</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {defaultSchedule.map((item, i) => (
                <Card key={i} className="bg-slate-900/50 border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="border-blue-500 text-blue-400 text-xs">{item.dia}</Badge>
                      <span className="text-xs text-slate-400 font-mono"><Clock className="w-3 h-3 inline" /> {item.hora}</span>
                    </div>
                    <h4 className="font-semibold text-sm text-white">{item.nome}</h4>
                    <p className="text-xs text-slate-400 mt-1">{item.descricao}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Gravacoes */}
          <section>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white"><Film className="w-5 h-5" /> Transmissões Anteriores</h3>
            {previousStreams.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {previousStreams.map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden cursor-pointer hover:border-slate-600 transition-all hover:shadow-lg group"
                    onClick={() => window.open(`https://www.youtube.com/watch?v=${rec.youtube_video_id}`, '_blank')}
                  >
                    <div className="aspect-video bg-slate-800 relative">
                      {rec.youtube_video_id ? (
                        <img
                          src={`https://img.youtube.com/vi/${rec.youtube_video_id}/mqdefault.jpg`}
                          alt={rec.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback para thumbnail padrão
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"%3E%3Crect width="320" height="180" fill="%231e293b"/%3E%3Ctext x="160" y="90" font-family="Arial" font-size="14" fill="%2394a3b8" text-anchor="middle"%3ETransmissão Anterior%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                          <Film className="w-12 h-12 text-slate-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm truncate text-white">{rec.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(rec.scheduled_start).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8 text-sm">Nenhuma transmissão anterior encontrada.</p>
            )}
          </section>
        </main>

        {/* Modal de Oracao Rápida */}
        {prayerOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="bg-slate-900 border-slate-800 max-w-md w-full rounded-2xl shadow-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2"><Heart className="w-5 h-5 text-pink-400" /> Ore por mim</CardTitle>
                  <button onClick={() => { setPrayerOpen(false); setPrayerText(''); setPrayerName(''); }} className="text-slate-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-slate-400 text-sm">Envie um pedido de oração para a equipe pastoral da igreja.</p>
              </CardHeader>
              <div className="space-y-4 px-6 pb-6">
                <div>
                  <Label className="text-slate-300">Seu Nome</Label>
                  <Input
                    value={prayerName}
                    onChange={(e) => setPrayerName(e.target.value)}
                    placeholder="Como devemos te chamar?"
                    className="bg-slate-800 border-slate-700 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Pedido de Oração</Label>
                  <textarea
                    value={prayerText}
                    onChange={(e) => setPrayerText(e.target.value)}
                    placeholder="Escreva seu pedido de oração (mínimo 10 caracteres)"
                    className="w-full min-h-[100px] p-3 bg-slate-800 border border-slate-700 text-white rounded-lg mt-1 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="lgpd" checked readOnly className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-pink-600" />
                  <label htmlFor="lgpd" className="text-xs text-slate-400">Concordo com a política de privacidade e envio de orações.</label>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => { setPrayerOpen(false); setPrayerText(''); setPrayerName(''); }} className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800">Cancelar</Button>
                  <Button onClick={handlePrayerRequest} disabled={prayerLoading} className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white gap-2 shadow-lg shadow-pink-500/20">
                    {prayerLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <><Heart className="w-4 h-4" /> Enviar Oração</>}
                  </Button>
                </div>
                <p className="text-xs text-slate-500 text-center">Sua oração será enviada à equipe pastoral com total sigilo.</p>
              </div>
            </Card>
          </div>
        )}

        {/* Modal de Versiculos */}
        {versesOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="bg-slate-900 border-slate-800 max-w-md w-full max-h-[90vh] flex flex-col rounded-2xl shadow-2xl">
              <CardHeader className="shrink-0 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2"><BookOpen className="w-5 h-5 text-purple-400" /> Palavra de Deus</CardTitle>
                  <button onClick={() => setVersesOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>
              <div className="flex-1 overflow-y-auto space-y-6 px-6 py-4">
                {versesList.length > 0 ? (
                  <>
                    {/* Versículo Principal */}
                    <div className="text-center p-4 bg-slate-800/50 rounded-xl">
                      <p className="text-xl text-white font-serif italic mb-4">"{versesList[0]?.text}"</p>
                      <p className="text-purple-400 font-medium">{versesList[0]?.ref}</p>
                    </div>

                    <Button onClick={() => handleCopyVerse(versesList[0]?.text || '', versesList[0]?.ref || '')} className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white gap-2 shadow-lg shadow-purple-500/20">
                      <span>📋</span> Copiar e Compartilhar
                    </Button>

                    {versesList.length > 1 && (
                      <div className="space-y-3">
                        <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Mais leituras</p>
                        {versesList.slice(1).map((v, i) => (
                          <div key={i} className="p-3 bg-slate-800/30 rounded-lg flex justify-between items-center gap-3">
                            <div>
                              <p className="text-slate-300 italic text-sm">"{v.text}"</p>
                              <p className="text-purple-400 text-xs mt-1">{v.ref}</p>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => handleCopyVerse(v.text, v.ref)} className="text-purple-400 hover:text-white shrink-0">
                              Copiar
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-center text-slate-400 py-8 text-sm">Nenhum versículo cadastrado. Peça ao pastor para adicionar no painel.</p>
                )}
              </div>
              <div className="shrink-0 border-t border-slate-800 p-6">
                <Button type="button" variant="outline" onClick={() => setVersesOpen(false)} className="w-full border-slate-700 text-slate-300 hover:bg-slate-800">Fechar</Button>
              </div>
            </Card>
          </div>
        )}

        {/* Modal de Notificacao */}
        {notifyOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="bg-slate-900 border-slate-800 max-w-md w-full rounded-2xl shadow-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2"><Bell className="w-5 h-5 text-amber-400" /> Me Notificar</CardTitle>
                  <button onClick={() => { setNotifyOpen(false); setNotifyForm({ name: '', email: '', phone: '' }); }} className="text-slate-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-slate-400 text-sm">Receba um aviso quando a live começar.</p>
              </CardHeader>
              <form onSubmit={handleNotifySubmit} className="space-y-4 px-6 pb-6">
                <div>
                  <Label className="text-slate-300">Nome *</Label>
                  <Input value={notifyForm.name} onChange={(e) => setNotifyForm({ ...notifyForm, name: e.target.value })} placeholder="Seu nome" className="bg-slate-800 border-slate-700 text-white mt-1" required />
                </div>
                <div>
                  <Label className="text-slate-300 flex items-center gap-2"><Mail className="w-3 h-3" /> Email</Label>
                  <Input type="email" value={notifyForm.email} onChange={(e) => setNotifyForm({ ...notifyForm, email: e.target.value })} placeholder="seu@email.com" className="bg-slate-800 border-slate-700 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-slate-300 flex items-center gap-2"><Smartphone className="w-3 h-3" /> WhatsApp</Label>
                  <Input value={notifyForm.phone} onChange={(e) => setNotifyForm({ ...notifyForm, phone: e.target.value })} placeholder="(92) 99999-9999" className="bg-slate-800 border-slate-700 text-white mt-1" />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => { setNotifyOpen(false); setNotifyForm({ name: '', email: '', phone: '' }); }} className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800">Cancelar</Button>
                  <Button type="submit" disabled={notifyLoading || !notifyForm.name} className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white gap-2 shadow-lg shadow-amber-500/20">
                    {notifyLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <><Bell className="w-4 h-4" /> Inscrever</>}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
        
        {/* Modais e Footer */}
        <PrayerModal
          isOpen={prayerOpen}
          onClose={() => setPrayerOpen(false)}
          onSubmitPrayer={async (prayer) => {
             setPrayerLoading(true);
             try {
               await fetch(buildApiUrl('/api/pedidos/public'), {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                   church_slug: activeSlug,
                   nome: prayer.name,
                   email: prayer.email || '',
                   telefone: prayer.phone || '',
                   oracao: prayer.request,
                   lgpd: true,
                 }),
               });
               toast.success('Pedido de oração enviado!');
               setPrayerOpen(false);
             } catch (e) { toast.error('Erro ao enviar'); }
             finally { setPrayerLoading(false); }
          }}
          churchSlug={activeSlug}
          churchName={church?.name}
          churchId={church?.id}
        />
        
        <AdminModal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          churchSlug={activeSlug}
        />

        <Footer
          churchName={church?.name}
          churchDescription={church?.description || ''}
          churchLogo={church?.logo_url ? buildApiUrl(church.logo_url) : null}
          address={church?.address_street}
          neighborhood={church?.address_neighborhood}
          city={church?.address_city}
          state={church?.address_state}
          zip={church?.address_zip}
          phone={church?.phone}
          email={church?.email}
          facebookUrl={church?.facebook_url}
          instagramUrl={church?.instagram_url}
          youtubeUrl={church?.youtube_url}
        />
      </div>
        </LiveAuthGate>
      </div>
    </div>
  );
}
