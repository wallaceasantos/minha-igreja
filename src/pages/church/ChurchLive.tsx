/**
 * ChurchLive - Pagina de Transmissao ao Vivo Privada (Versao Profissional)
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
import { ChurchHeader, ChurchFooter } from './ChurchBase';
import {
  Play, Users, MessageCircle, ArrowLeft, Radio, Clock, WifiOff,
  Calendar, Film, BookOpen, DollarSign, Heart, Bell, Mail, Smartphone, Loader2
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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header da Igreja */}
      {church && <ChurchHeader church={church} churchSlug={activeSlug} />}

      {/* Banner de Conexão */}
      {!isOnline && (
        <div className="bg-amber-600 text-white py-2 px-4 text-center text-sm font-medium animate-pulse sticky top-0 z-50">
          ⚠️ Sem conexão com a internet. Tentando reconectar...
        </div>
      )}

      {/* Conteúdo Principal (Gate ou Player) */}
      <div className="flex-1">
        <LiveAuthGate churchSlug={activeSlug || ''}>
          <div className="min-h-full bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
            <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
              <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/church/${slug}`)} className="text-gray-400 hover:text-white gap-2">
                    <ArrowLeft className="w-4 h-4" /> Voltar ao Site
                  </Button>
                  <h1 className="text-white font-semibold text-lg hidden md:block">{church?.name || 'Igreja'} - Transmissao ao Vivo</h1>
                </div>
                <div className="flex items-center gap-2">
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

        <main className="container mx-auto px-4 py-6 space-y-8">
          {activeStream && (
            <div className="space-y-6">
              {/* Player Grande */}
              <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative">
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
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{activeStream.title}</h2>
                  {activeStream.description && <p className="text-gray-400 mt-1">{activeStream.description}</p>}
                  {activeStream.status === 'scheduled' && activeStream.scheduled_start && (
                    <div className="mt-2 flex items-center gap-4">
                      <Badge variant="outline" className="border-amber-500 text-amber-400">
                        <Clock className="w-3 h-3 mr-1" /> Comeca em: {countdown || '...'}
                      </Badge>
                      <span className="text-gray-400 text-sm">
                        {new Date(activeStream.scheduled_start).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {viewerCount} assistindo</span>
                </div>
              </div>

              {/* Countdown + Notify (quando agendada) */}
              {activeStream.status === 'scheduled' && (
                <Card className="bg-gray-800 border-amber-500/30">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="text-center md:text-left">
                        <h3 className="text-lg font-semibold text-amber-400 flex items-center gap-2">
                          <Bell className="w-5 h-5" /> Nao perca esta transmissao!
                        </h3>
                        <p className="text-gray-400 mt-1">Inscreva-se para ser notificado quando a live comecar.</p>
                      </div>
                      <Button onClick={() => setNotifyOpen(true)} className="bg-amber-600 hover:bg-amber-700 gap-2">
                        <Bell className="w-4 h-4" /> Me Notificar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Botões de Acao */}
              <div className="flex gap-3 flex-wrap">
                <Button onClick={() => setPrayerOpen(true)} className="bg-pink-600 hover:bg-pink-700 gap-2">
                  <Heart className="w-4 h-4" /> Ore por mim
                </Button>
                <Button variant="outline" className="border-green-600 text-green-400 hover:bg-green-900/20 gap-2">
                  <DollarSign className="w-4 h-4" /> Ofertar
                </Button>
                <Button variant="outline" onClick={() => setVersesOpen(true)} className="border-purple-600 text-purple-400 hover:bg-purple-900/20 gap-2">
                  <BookOpen className="w-4 h-4" /> Versiculos
                </Button>
                <Button variant="outline" onClick={() => setShowChat(!showChat)} className="border-blue-600 text-blue-400 hover:bg-blue-900/20 gap-2">
                  <MessageCircle className="w-4 h-4" /> Chat
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
            <Card className="bg-gray-800 border-gray-700 max-w-2xl mx-auto text-center">
              <CardContent className="py-16">
                <Film className="w-10 h-10 mx-auto mb-4 text-gray-500" />
                <h2 className="text-2xl font-bold mb-3">Nenhuma transmissao agora</h2>
                <p className="text-gray-400 mb-6">Confira nossa programacao ou assista a gravacoes.</p>
                <Button onClick={() => navigate(`/church/${slug}`)} variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Voltar</Button>
              </CardContent>
            </Card>
          )}

          {/* Programacao Semanal */}
          <section>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Calendar className="w-5 h-5" /> Programacao Semanal</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {defaultSchedule.map((item, i) => (
                <Card key={i} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="border-blue-500 text-blue-400">{item.dia}</Badge>
                      <span className="text-sm text-gray-400"><Clock className="w-3 h-3 inline" /> {item.hora}</span>
                    </div>
                    <h4 className="font-semibold">{item.nome}</h4>
                    <p className="text-sm text-gray-400 mt-1">{item.descricao}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Gravacoes */}
          <section>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Film className="w-5 h-5" /> Transmissoes Anteriores</h3>
            {previousStreams.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {previousStreams.map((rec) => (
                  <div 
                    key={rec.id} 
                    className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition"
                    onClick={() => window.open(`https://www.youtube.com/watch?v=${rec.youtube_video_id}`, '_blank')}
                  >
                    <div className="aspect-video bg-gray-900 relative">
                      <img 
                        src={`https://img.youtube.com/vi/${rec.youtube_video_id}/hqdefault.jpg`} 
                        alt={rec.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium text-sm truncate text-white">{rec.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(rec.scheduled_start).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Nenhuma transmissão anterior encontrada.</p>
            )}
          </section>
        </main>

        {/* Modal de Oracao Rápida */}
        {prayerOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="bg-gray-800 border-gray-700 max-w-md w-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2"><Heart className="w-5 h-5 text-pink-400" /> Ore por mim</CardTitle>
                <p className="text-gray-400 text-sm">Envie um pedido de oração para a equipe pastoral da igreja.</p>
              </CardHeader>
              <div className="space-y-4 px-6 pb-6">
                <div>
                  <Label className="text-gray-300">Seu Nome</Label>
                  <Input 
                    value={prayerName} 
                    onChange={(e) => setPrayerName(e.target.value)} 
                    placeholder="Como devemos te chamar?" 
                    className="bg-gray-700 border-gray-600 text-white mt-1" 
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Pedido de Oração</Label>
                  <textarea
                    value={prayerText}
                    onChange={(e) => setPrayerText(e.target.value)}
                    placeholder="Escreva seu pedido de oração (mínimo 10 caracteres)"
                    className="w-full min-h-[100px] p-3 bg-gray-700 border border-gray-600 text-white rounded-md mt-1 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="lgpd" checked readOnly className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-pink-600" />
                  <label htmlFor="lgpd" className="text-xs text-gray-400">Concordo com a política de privacidade e envio de orações.</label>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => { setPrayerOpen(false); setPrayerText(''); setPrayerName(''); }} className="flex-1">Cancelar</Button>
                  <Button onClick={handlePrayerRequest} disabled={prayerLoading} className="flex-1 bg-pink-600 hover:bg-pink-700 gap-2">
                    {prayerLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <><Heart className="w-4 h-4" /> Enviar Oração</>}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 text-center">Sua oração será enviada à equipe pastoral com total sigilo.</p>
              </div>
            </Card>
          </div>
        )}

        {/* Modal de Versiculos */}
        {versesOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="bg-gray-800 border-gray-700 max-w-md w-full max-h-[90vh] flex flex-col">
              <CardHeader className="shrink-0 border-b border-gray-700">
                <CardTitle className="text-white flex items-center gap-2"><BookOpen className="w-5 h-5 text-purple-400" /> Palavra de Deus</CardTitle>
              </CardHeader>
              <div className="flex-1 overflow-y-auto space-y-6 px-6 py-4">
                {versesList.length > 0 ? (
                  <>
                    {/* Versículo Principal */}
                    <div className="text-center p-4 bg-gray-700/50 rounded-lg">
                      <p className="text-xl text-white font-serif italic mb-4">"{versesList[0]?.text}"</p>
                      <p className="text-purple-400 font-medium">{versesList[0]?.ref}</p>
                    </div>

                    <Button onClick={() => handleCopyVerse(versesList[0]?.text || '', versesList[0]?.ref || '')} className="w-full bg-purple-600 hover:bg-purple-700 gap-2">
                      <span>📋</span> Copiar e Compartilhar
                    </Button>

                    {versesList.length > 1 && (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Mais leituras</p>
                        {versesList.slice(1).map((v, i) => (
                          <div key={i} className="p-3 bg-gray-700/30 rounded-lg flex justify-between items-center gap-3">
                            <div>
                              <p className="text-gray-300 italic">"{v.text}"</p>
                              <p className="text-purple-400 text-sm mt-1">{v.ref}</p>
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
                  <p className="text-center text-gray-400 py-8">Nenhum versículo cadastrado. Peça ao pastor para adicionar no painel.</p>
                )}
              </div>
              <div className="shrink-0 border-t border-gray-700 p-6">
                <Button type="button" variant="outline" onClick={() => setVersesOpen(false)} className="w-full">Fechar</Button>
              </div>
            </Card>
          </div>
        )}

        {/* Modal de Notificacao */}
        {notifyOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="bg-gray-800 border-gray-700 max-w-md w-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2"><Bell className="w-5 h-5 text-amber-400" /> Me Notificar</CardTitle>
              </CardHeader>
              <form onSubmit={handleNotifySubmit} className="space-y-4 px-6 pb-6">
                <div>
                  <Label className="text-gray-300">Nome *</Label>
                  <Input value={notifyForm.name} onChange={(e) => setNotifyForm({ ...notifyForm, name: e.target.value })} placeholder="Seu nome" className="bg-gray-700 border-gray-600 text-white mt-1" required />
                </div>
                <div>
                  <Label className="text-gray-300 flex items-center gap-2"><Mail className="w-3 h-3" /> Email</Label>
                  <Input type="email" value={notifyForm.email} onChange={(e) => setNotifyForm({ ...notifyForm, email: e.target.value })} placeholder="seu@email.com" className="bg-gray-700 border-gray-600 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-gray-300 flex items-center gap-2"><Smartphone className="w-3 h-3" /> WhatsApp</Label>
                  <Input value={notifyForm.phone} onChange={(e) => setNotifyForm({ ...notifyForm, phone: e.target.value })} placeholder="(92) 99999-9999" className="bg-gray-700 border-gray-600 text-white mt-1" />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => { setNotifyOpen(false); setNotifyForm({ name: '', email: '', phone: '' }); }} className="flex-1">Cancelar</Button>
                  <Button type="submit" disabled={notifyLoading || !notifyForm.name} className="flex-1 bg-amber-600 hover:bg-amber-700 gap-2">
                    {notifyLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <><Bell className="w-4 h-4" /> Inscrever</>}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
        </LiveAuthGate>
      </div>

      {/* Footer da Igreja */}
      {church && <ChurchFooter church={church} />}
    </div>
  );
}
