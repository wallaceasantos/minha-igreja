import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '@/lib/config';
import MyIcon from './MyIcon';
import { motion } from 'motion/react';

interface LiveStreamData {
  id: number;
  title: string;
  description: string | null;
  youtube_url: string | null;
  youtube_video_id: string | null;
  scheduled_start: string | null;
  status: string;
  is_active: number;
}

interface LiveSectionProps {
  churchSlug: string;
}

// Helper to get YouTube ID (limpa parâmetros extras como ?feature=share)
const getYoutubeId = (input: string | null | undefined): string | null => {
  if (!input) return null;
  const url = String(input).trim();
  if (!url) return null;

  // Se parece ser apenas um ID (11 caracteres), retorna direto
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  // Tenta extrair o ID de uma URL completa do YouTube
  const regex = /[?&]v=([a-zA-Z0-9_-]{11})|youtu\.be\/([a-zA-Z0-9_-]{11})|youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  
  if (match) {
    // Verifica os grupos de captura explicitamente (usando optional chaining para segurança do TS)
    const id = match[1] ?? match[2] ?? match[3];
    if (id) return id;
  }

  // Fallback: tenta pegar a primeira parte antes de qualquer ? ou &
  const parts = url.split('?')[0].split('&')[0].split('/');
  const lastPart = parts.pop();
  if (lastPart && /^[a-zA-Z0-9_-]{11}$/.test(lastPart)) {
    return lastPart;
  }

  return null;
};

export default function LiveSection({ churchSlug }: LiveSectionProps) {
  const navigate = useNavigate();
  const [stream, setStream] = useState<LiveStreamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    if (!churchSlug) return;

    const loadLive = async () => {
      try {
        // Buscar lives ativas E encerradas (para lista de anteriores)
        const res = await fetch(buildApiUrl(`/api/church/slug/${churchSlug}/live-streams`));
        const data = await res.json();
        
        if (data.success && Array.isArray(data.data)) {
          // Buscar a primeira live ativa ou agendada para mostrar em destaque
          const active = data.data.find((s: LiveStreamData) => 
            s.is_active === 1 && (s.status === 'live' || s.status === 'scheduled')
          );
          setStream(active || null);
        }
      } catch (error) {
        console.error('Erro ao carregar live:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLive();
    // Atualiza a cada 30s para pegar mudança de status
    const interval = setInterval(loadLive, 30000);
    return () => clearInterval(interval);
  }, [churchSlug]);

  // Countdown timer
  useEffect(() => {
    if (!stream?.scheduled_start || stream.status === 'live') {
      setCountdown('');
      return;
    }
    const timer = setInterval(() => {
      const target = new Date(stream.scheduled_start!).getTime();
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setCountdown('');
        return;
      }
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setCountdown(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [stream?.scheduled_start, stream?.status]);

  if (loading || !stream) return null;

  // Limpeza dupla: tenta pela URL primeiro, depois pelo video_id, garantindo que seja apenas o ID puro
  // Usamos optional chaining (?.) para evitar erros de TS caso as propriedades sejam undefined
  const rawId = getYoutubeId(stream.youtube_url) || getYoutubeId(stream.youtube_video_id) || 'fallback';
  const youtubeId = String(rawId).split('?')[0].split('&')[0].trim();
  const isLive = stream.status === 'live';

  // Função para redirecionar para a página privada de live
  const handleWatchLive = () => {
    navigate(`/igreja/${churchSlug}/ao-vivo`);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 mb-12"
    >
      <div className={`rounded-2xl overflow-hidden shadow-2xl border-2 ${isLive ? 'border-red-500/50' : 'border-indigo-500/50'} bg-slate-900 flex flex-col lg:flex-row`}>
        
        {/* Lado Esquerdo: Thumbnail/Preview */}
        <div className="lg:w-1/2 aspect-video lg:aspect-auto relative group">
           {/* Thumbnail da Live (se houver) ou Placeholder */}
           {youtubeId ? (
             <img 
               src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
               alt={stream.title}
               className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
             />
           ) : (
             <div className="w-full h-full bg-slate-800 flex items-center justify-center">
               <MyIcon name="Video" size={48} className="text-slate-600" />
             </div>
           )}
           
           {/* Botão Play Overlay */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${isLive ? 'bg-red-600 text-white' : 'bg-white text-indigo-900'}`}>
               <MyIcon name={isLive ? "Radio" : "Play"} size={32} />
             </div>
           </div>

           {/* Badges */}
           <div className="absolute top-4 left-4 flex gap-2">
             {isLive ? (
               <span className="px-3 py-1 rounded text-xs font-bold bg-red-600 text-white animate-pulse shadow-lg shadow-red-900/50 flex items-center gap-1">
                 <span className="w-2 h-2 bg-white rounded-full"></span> AO VIVO
               </span>
             ) : (
               <span className="px-3 py-1 rounded text-xs font-bold bg-indigo-600 text-white shadow-lg flex items-center gap-1">
                 <MyIcon name="Clock" size={12} /> AGENDADA
               </span>
             )}
           </div>
        </div>

        {/* Lado Direito: Informações e CTA */}
        <div className="lg:w-1/2 p-6 sm:p-8 flex flex-col justify-center items-start bg-gradient-to-br from-slate-800 to-slate-900 text-white">
          
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight">
            {stream.title}
          </h2>

          {stream.description && (
            <p className="text-slate-300 mb-6 line-clamp-2">
              {stream.description}
            </p>
          )}

          {/* Info Box (Data/Hora ou Countdown) */}
          <div className="mb-8 w-full">
            {!isLive && stream.scheduled_start ? (
              <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-700">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Começa em</p>
                {countdown ? (
                  <p className="text-3xl font-mono font-bold text-amber-400">{countdown}</p>
                ) : (
                  <p className="text-lg font-bold text-white">
                    {new Date(stream.scheduled_start).toLocaleString('pt-BR', { 
                      day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' 
                    })}
                  </p>
                )}
              </div>
            ) : isLive ? (
               <div className="bg-red-950/30 rounded-xl p-4 border border-red-900/50">
                 <p className="text-sm text-red-300 flex items-center gap-2">
                   <MyIcon name="Users" size={16} /> Assista agora junto com a comunidade!
                 </p>
               </div>
            ) : null}
          </div>

          {/* Botão de Ação Principal */}
          <button 
            onClick={handleWatchLive}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 shadow-xl ${
              isLive 
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/40' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-900/40'
            }`}
          >
            <MyIcon name={isLive ? "Radio" : "Bell"} size={24} />
            {isLive ? 'Assistir ao Vivo Agora' : 'Ser Notificado / Assistir'}
          </button>

          <p className="mt-4 text-xs text-center w-full text-slate-500">
            {isLive ? 'Clique para entrar na sala exclusiva da transmissão.' : 'Faça seu cadastro gratuito para receber o acesso.'}
          </p>

        </div>
      </div>
    </motion.section>
  );
}
