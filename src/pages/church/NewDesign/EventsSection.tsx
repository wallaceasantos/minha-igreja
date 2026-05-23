import MyIcon from "./MyIcon";

interface EventData {
  id: number | string;
  // Campos exatos do backend (events.js: church_events)
  title?: string;
  description?: string;
  start_datetime?: string; // '2026-07-09 09:00:00'
  end_datetime?: string;
  location?: string;
  address?: string;
  event_type?: string;
  status?: string;
  
  // Fallbacks genéricos
  titulo?: string;
  descricao?: string;
  local?: string;
}

interface EventsSectionProps {
  events?: EventData[];
}

// Função para formatar "2026-07-09 09:00:00" para "09 DE JUL • 09:00"
const formatEventDate = (dateStr: string): string => {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(date.getTime())) return dateStr;

    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day} DE ${month} • ${hours}:${minutes}`;
  } catch (e) {
    return dateStr;
  }
};

export default function EventsSection({ events = [] }: EventsSectionProps) {
  console.log('📦 EventsSection recebeu:', events.length, 'eventos', events);
  
  return (
    <section id="eventos" className="bg-slate-950 text-white border border-slate-900 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between h-full relative overflow-hidden min-h-[460px] scroll-mt-24">

      <div className="space-y-5">
        <div className="shrink-0 flex items-center justify-between">
          <div>
            <h2 className="text-white text-lg font-bold font-heading">Próximos Eventos</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1">Programe-se Conosco</p>
          </div>
          <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 border border-indigo-500/30">
             <MyIcon name="CalendarDays" size={16} />
          </div>
        </div>

        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          {events.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
              Nenhum evento cadastrado ainda.
            </div>
          ) : (
            events.map((event, index) => {
              // Mapeamento correto dos campos do backend
              const title = event.title || event.titulo || 'Sem título';
              const description = event.description || event.descricao || '';
              const rawDate = event.start_datetime || '';
              const location = event.location || event.local || '';
              
              // Formatação da data e hora
              const formattedDate = formatEventDate(rawDate);

              // Cores cíclicas para os indicadores
              const colors = [
                { border: "border-l-2 border-indigo-500", badge: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" },
                { border: "border-l-2 border-amber-500", badge: "bg-amber-500/20 text-amber-300 border border-amber-500/30" },
                { border: "border-l-2 border-emerald-500", badge: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" }
              ];
              const currentStyle = colors[index % colors.length] ?? colors[0];

              return (
                <div key={event.id} className={`${currentStyle?.border ?? 'border-l-2 border-gray-500'} pl-3 py-2 space-y-2 text-left group`}>
                  
                  {/* Badge de Data e Hora */}
                  {formattedDate && (
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold font-mono tracking-wide ${currentStyle?.badge ?? 'bg-gray-500/20 text-gray-300 border border-gray-500/30'}`}>
                      <MyIcon name="Clock" size={10} />
                      <span>{formattedDate}</span>
                    </div>
                  )}

                  {/* Título */}
                  <p className="text-white text-sm font-bold leading-tight group-hover:text-indigo-200 transition-colors">
                    {title}
                  </p>

                  {/* Descrição */}
                  {description && (
                    <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">
                      {description}
                    </p>
                  )}

                  {/* Local */}
                  {location && (
                    <p className="text-slate-500 text-[10px] font-medium flex items-center gap-1 pt-1">
                      <MyIcon name="MapPin" size={10} /> {location}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 shrink-0">
        <button
          onClick={() => {
            const el = document.querySelector("#contato");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
          className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <MyIcon name="Calendar" size={14} />
          Ver Agenda Completa
        </button>
      </div>

    </section>
  );
}
