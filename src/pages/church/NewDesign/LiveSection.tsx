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
  scheduled_start: string | Date | null;
  status: string;
  is_active: number;
}

interface LiveSectionProps {
  churchSlug: string;
}

// Helper para fazer parse de data de vários formatos possíveis
const parseDate = (input: string | Date | null | undefined): Date | null => {
  if (!input) return null;

  // Se já é um objeto Date
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }

  // Se é string
  const str = String(input).trim();
  if (!str) return null;

  // Tenta vários formatos:

  // 1. Formato ISO 8609 completo: 2026-05-24T18:30:00.000Z
  let date = new Date(str);
  if (!isNaN(date.getTime())) return date;

  // 2. Formato MySQL: 2026-05-24 18:30:00
  const mysqlMatch = str.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
  if (mysqlMatch) {
    // MySQL armazena em UTC, então adicionamos Z
    const isoString = `${mysqlMatch[1]}-${mysqlMatch[2]}-${mysqlMatch[3]}T${mysqlMatch[4]}:${mysqlMatch[5]}:${mysqlMatch[6]}Z`;
    date = new Date(isoString);
    if (!isNaN(date.getTime())) return date;
  }

  // 3. Formato ISO sem timezone: 2026-05-24T18:30:00
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/);
  if (isoMatch) {
    const isoString = `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}T${isoMatch[4]}:${isoMatch[5]}:${isoMatch[6]}Z`;
    date = new Date(isoString);
    if (!isNaN(date.getTime())) return date;
  }

  // 4. Formato de data apenas: 2026-05-24
  const dateMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateMatch) {
    date = new Date(`${str}T00:00:00Z`);
    if (!isNaN(date.getTime())) return date;
  }

  console.warn('Não foi possível fazer parse da data:', str);
  return null;
};

// Helper to get YouTube ID (limpa parâmetros extras como ?feature=share)
const getYoutubeId = (input: string | null | undefined): string | null => {
  if (!input) return null;
  const url = String(input).trim();
  if (!url) return null;

  // Se parece ser apenas um ID (11 caracteres), retorna direto
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  // Remove parâmetros de query primeiro (?feature=share, etc)
  const cleanUrl = url.split('?')[0].split('&')[0];

  // Tenta extrair o ID de vários formatos de URL do YouTube
  const patterns = [
    // youtube.com/watch?v=VIDEO_ID
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    // youtu.be/VIDEO_ID
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    // youtube.com/embed/VIDEO_ID
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    // youtube.com/live/VIDEO_ID
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
    // youtube.com/shorts/VIDEO_ID
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Fallback: tenta pegar o último segmento da URL limpa
  const parts = cleanUrl.split('/').filter(p => p.length > 0);
  const lastPart = parts[parts.length - 1];
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

  // Helper para converter data do MySQL (assumindo UTC) para timestamp
  const getScheduledTimestamp = (dateInput: string | Date): number => {
    const parsed = parseDate(dateInput);
    if (!parsed) {
      console.warn('Erro ao fazer parse da data para timestamp:', dateInput);
      return 0;
    }
    return parsed.getTime();
  };

  // Helper para formatar data no timezone de Manaus
  const formatDateManaus = (dateInput: string | Date): string => {
    console.log('[formatDateManaus] Input:', dateInput, 'Tipo:', typeof dateInput);

    const parsed = parseDate(dateInput);
    console.log('[formatDateManaus] Parsed:', parsed);

    if (!parsed || isNaN(parsed.getTime())) {
      console.warn('[formatDateManaus] Erro ao fazer parse da data:', dateInput);
      return 'Data inválida';
    }

    try {
      const formatted = parsed.toLocaleString('pt-BR', {
        day: '2-digit',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Manaus'
      });
      console.log('[formatDateManaus] Formatted:', formatted);
      return formatted;
    } catch (e) {
      console.error('[formatDateManaus] Erro ao formatar:', e);
      return 'Erro na data';
    }
  };

  // Debug: logar a data recebida
  useEffect(() => {
    if (stream?.scheduled_start) {
      console.log('[Live Debug] scheduled_start:', stream.scheduled_start);
      console.log('[Live Debug] Tipo:', typeof stream.scheduled_start);
      console.log('[Live Debug] Parsed:', parseDate(stream.scheduled_start));
    }
  }, [stream?.scheduled_start]);

  // Countdown timer - usando timezone de Manaus (UTC-4)
  useEffect(() => {
    if (!stream?.scheduled_start || stream.status === 'live') {
      setCountdown('');
      return;
    }
    const timer = setInterval(() => {
      try {
        const target = getScheduledTimestamp(stream.scheduled_start!);
        const now = Date.now();
        const diff = target - now;

        if (diff <= 0 || isNaN(target)) {
          setCountdown('');
          return;
        }

        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);
        setCountdown(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      } catch (e) {
        setCountdown('');
      }
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
                {(() => {
                  // Parse seguro da data
                  const rawDate = stream.scheduled_start;
                  let dateObj: Date | null = null;

                  if (rawDate instanceof Date) {
                    dateObj = rawDate;
                  } else if (typeof rawDate === 'string') {
                    // Tenta parsear como ISO (vindo do backend)
                    dateObj = new Date(rawDate);
                  }

                  // Verifica se é válida
                  if (!dateObj || isNaN(dateObj.getTime())) {
                    return <p className="text-lg font-bold text-white">Data não disponível</p>;
                  }

                  // Formata no horário de Manaus
                  try {
                    const formatted = dateObj.toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'America/Manaus'
                    });

                    return (
                      <>
                        {countdown ? (
                          <p className="text-3xl font-mono font-bold text-amber-400">{countdown}</p>
                        ) : (
                          <p className="text-lg font-bold text-white">{formatted}</p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">(Horário de Manaus - AM)</p>
                      </>
                    );
                  } catch (e) {
                    return <p className="text-lg font-bold text-white">Erro ao formatar data</p>;
                  }
                })()}
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
