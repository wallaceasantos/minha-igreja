import MyIcon from "./MyIcon";

interface AboutSectionProps {
  churchName?: string;
  aboutContent?: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

export default function AboutSection({ churchName, aboutContent, address, neighborhood, city, state }: AboutSectionProps) {
  return (
    <section id="sobre" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full relative overflow-hidden min-h-[460px] scroll-mt-24">

      {/* Visual background details */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-50/15 dark:bg-indigo-950/10 rounded-full blur-[40px] pointer-events-none" />
      <div className="absolute -left-10 -top-10 w-40 h-40 bg-amber-50/15 dark:bg-amber-950/5 rounded-full blur-[30px] pointer-events-none" />

      <div className="space-y-4">
        {/* Header styling */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="font-heading font-bold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
              Sobre Nós
            </h2>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Nossa História</span>
          </div>
        </div>

        {/* Story Box */}
        <div className="relative">
          <div className="space-y-3.5 text-slate-650 dark:text-slate-300 text-xs sm:text-sm leading-relaxed relative z-10 max-w-full">
            <p>
              {aboutContent || `Em quase 70 anos de sua fundação, a Igreja do Evangelho Quadrangular possui mais de 17 mil templos e obras abertas e estruturadas em todo o País. Mais de 30 mil obreiros estão levando os ensinamentos de Jesus a mais de dois milhões de pessoas em 22 nações.`}
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed">
              Levamos o Evangelho Pleno: Jesus Salva (Vermelho), Batiza com o Espírito Santo (Ouro), Cura (Azul) e breve Voltará (Púrpura).
            </p>
          </div>
        </div>

        {/* Quadrilateral Pillars represented in compact grid layout */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          
          <div className="p-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-800 flex items-center gap-2 group hover:border-indigo-500/30 transition-all">
            <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 text-sm flex items-center justify-center shrink-0">
              ⚔️
            </div>
            <div className="text-left">
              <p className="font-semibold text-[10px] text-slate-800 dark:text-slate-200">Jesus Salva</p>
            </div>
          </div>

          <div className="p-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-800 flex items-center gap-2 group hover:border-indigo-500/30 transition-all">
            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/30 text-amber-600 text-sm flex items-center justify-center shrink-0">
              🕊️
            </div>
            <div className="text-left">
              <p className="font-semibold text-[10px] text-slate-800 dark:text-slate-200">Jesus Batiza</p>
            </div>
          </div>

          <div className="p-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-800 flex items-center gap-2 group hover:border-indigo-500/30 transition-all">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/30 text-blue-600 text-sm flex items-center justify-center shrink-0">
              🍷
            </div>
            <div className="text-left">
              <p className="font-semibold text-[10px] text-slate-800 dark:text-slate-200">Jesus Cura</p>
            </div>
          </div>

          <div className="p-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-800 flex items-center gap-2 group hover:border-indigo-500/30 transition-all">
            <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/35 text-purple-600 text-sm flex items-center justify-center shrink-0">
              👑
            </div>
            <div className="text-left">
              <p className="font-semibold text-[10px] text-slate-800 dark:text-slate-200">Jesus Voltará</p>
            </div>
          </div>

          {/* Jesus Liberta Item */}
          <div className="p-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-800 flex items-center gap-2 group hover:border-orange-500/30 transition-all">
            <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950/35 text-orange-600 text-sm flex items-center justify-center shrink-0">
              🔓
            </div>
            <div className="text-left">
              <p className="font-semibold text-[10px] text-slate-800 dark:text-slate-200">Jesus Liberta</p>
            </div>
          </div>

        </div>
      </div>

      {/* Map link Location area inside the Bento card */}
      <div className="mt-5">
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800/80">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <MyIcon name="MapPin" size={16} />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-slate-850 dark:text-slate-200">{city || 'Manaus'}, {state || 'AM'}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{address}{neighborhood ? ` - ${neighborhood}` : ''}</p>
          </div>
        </div>
      </div>

    </section>
  );
}
