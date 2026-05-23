import React from "react";
import { Button } from "./ui/button";
import MyIcon from "./MyIcon";
import { motion } from "motion/react";

interface HeroSectionProps {
  onOpenPrayer: () => void;
  prayersCount: number;
  churchName?: string;
  churchDescription?: string;
  membersCount?: number;
  eventsCount?: number;
}

export default function HeroSection({ onOpenPrayer, prayersCount, churchName, churchDescription, membersCount, eventsCount }: HeroSectionProps) {
  const handleScrollToCultos = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.querySelector("#cultos");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="inicio" className="relative h-full overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-950 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950 border border-indigo-900/30 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl flex flex-col justify-between min-h-[460px]">
      
      {/* BACKGROUND GRADIENTS & PATTERNS */}
      <div className="absolute right-0 top-0 p-8 opacity-10 text-white select-none pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1"><path d="M11 21L3 7l9-4 9 4-8 14z"/><path d="M12 3v18"/><path d="M3 7h18"/></svg>
      </div>
      
      {/* Glowing abstract vectors */}
      <div className="absolute -top-10 -left-10 w-[200px] h-[250px] bg-indigo-500/10 rounded-full blur-[80px]" />
      <div className="absolute -bottom-10 -right-10 w-[200px] h-[200px] bg-amber-500/10 rounded-full blur-[80px]" />

      <div className="relative z-10 flex flex-col h-full justify-between gap-6">
        
        <div className="space-y-4">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-widest"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </span>
            <span>✨ Bem-vindo à casa de Deus</span>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="space-y-3"
          >
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight">
              {churchName || 'Pregando o Evangelho Pleno'} <br />
              <span className="text-amber-400">
                de Jesus Cristo
              </span>
            </h1>
            <p className="max-w-xl text-sm sm:text-base text-indigo-100/90 font-medium font-sans">
              {churchDescription || 'Um lugar de acolhimento, fé e transformação. Venha fazer parte da nossa família e crescer na graça do Senhor.'}
            </p>
          </motion.div>
        </div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 pt-2"
        >
          <Button
            variant="default"
            size="lg"
            onClick={onOpenPrayer}
            className="w-full sm:w-auto h-12 shadow-lg shadow-amber-500/10 font-bold cursor-pointer text-slate-900 bg-amber-500 hover:bg-amber-400 transition-all scale-100 hover:scale-[1.02] flex items-center justify-center gap-2 border-0 rounded-lg shrink-0"
          >
            <MyIcon name="HandsPraying" size={18} />
            Enviar Pedido de Oração
          </Button>

          <a href="#cultos" onClick={handleScrollToCultos} className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-12 border-white/20 dark:border-white/10 bg-white/10 backdrop-blur text-white hover:bg-white/20 cursor-pointer font-semibold transition-all scale-100 hover:scale-[1.02] flex items-center justify-center gap-2 rounded-lg"
            >
              <MyIcon name="Clock" size={18} />
              Ver Horários dos Cultos
            </Button>
          </a>
        </motion.div>

        {/* STATS AREA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="pt-6 border-t border-white/15 max-w-2xl w-full"
        >
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            
            <div className="space-y-0.5">
              <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-white block">
                {membersCount || 0}
              </span>
              <span className="text-[10px] text-indigo-300 uppercase font-medium tracking-wide">
                Membros Ativos
              </span>
            </div>

            <div className="space-y-0.5 border-x border-white/10 px-4">
              <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-white block">
                {eventsCount || 0}
              </span>
              <span className="text-[10px] text-indigo-300 uppercase font-medium tracking-wide">
                Eventos Mensais
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-white block">
                {prayersCount || 0}
              </span>
              <span className="text-[10px] text-indigo-300 uppercase font-medium tracking-wide">
                Pedidos Respondidos
              </span>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
