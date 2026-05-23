import React, { useState } from "react";
import MyIcon from "./MyIcon";
import { motion, AnimatePresence } from "motion/react";

interface MinistryData {
  id: number | string;
  name: string;
  description: string;
}

interface MinistriesSectionProps {
  ministries?: MinistryData[];
}

// Mapeamento inteligente de ícones baseado no nome do ministério
const getMinistryIcon = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('louvor') || n.includes('música') || n.includes('musica')) return 'Music';
  if (n.includes('crian') || n.includes('kids') || n.includes('ebd')) return 'Baby';
  if (n.includes('jovem') || n.includes('adolescente') || n.includes('juventude')) return 'Zap';
  if (n.includes('mulher')) return 'Heart';
  if (n.includes('homem')) return 'Shield';
  if (n.includes('familia') || n.includes('casais')) return 'Users';
  if (n.includes('miss')) return 'Globe';
  if (n.includes('mídia') || n.includes('midia') || n.includes('tec')) return 'Tv';
  if (n.includes('intercess') || n.includes('ora') || n.includes('pray')) return 'HandsPraying';
  if (n.includes('acolh')) return 'Smile';
  if (n.includes('ação social') || n.includes('acao social') || n.includes('social')) return 'Gift';
  return 'Star'; // Ícone padrão
};

export default function MinistriesSection({ ministries = [] }: MinistriesSectionProps) {
  const [selectedId, setSelectedId] = useState<string | number | null>(ministries[0]?.id || null);
  const [showAll, setShowAll] = useState<boolean>(false);

  console.log('📦 MinistriesSection recebeu:', ministries.length, 'ministérios');

  // Atualizar seleção quando os dados mudam
  React.useEffect(() => {
    if (ministries.length > 0 && !ministries.some(m => m.id === selectedId)) {
      setSelectedId(ministries[0].id);
    }
  }, [ministries]);

  // Split into core (first 6) and other
  const displayedMinistries = showAll ? ministries : ministries.slice(0, 6);
  const selectedMinistry = ministries.find((m) => m.id === selectedId) || ministries[0];

  return (
    <section id="ministerios" className="relative z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full min-h-[460px] scroll-mt-24">

      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white">Ministérios</h2>
            <p className="text-[11px] text-slate-500 uppercase tracking-wide font-semibold">Sirva com Seus Dons</p>
          </div>
          {ministries.length > 6 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase hover:underline cursor-pointer transition-colors"
            >
              {showAll ? "Ver Menos" : "Ver Todos"}
            </button>
          )}
        </div>

        {/* Ministries Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {ministries.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-slate-400 text-sm">
              Nenhum ministério cadastrado ainda.
            </div>
          ) : (
            displayedMinistries.map((ministry) => {
              const isSelected = selectedId === ministry.id;
              const iconName = getMinistryIcon(ministry.name);

              return (
                <button
                  key={ministry.id}
                  onClick={() => setSelectedId(ministry.id)}
                  className={`p-2.5 rounded-xl flex flex-col items-center text-center gap-1.5 border transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-550/15"
                      : "bg-indigo-50/40 dark:bg-slate-950/40 border-transparent hover:border-indigo-200 dark:hover:border-slate-800 text-slate-800 dark:text-slate-200"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-white/20 text-white" : "bg-indigo-150/40 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                  }`}>
                    <MyIcon name={iconName} size={18} />
                  </div>
                  <span className="text-[10px] font-bold line-clamp-1 break-all leading-tight">
                    {ministry.name}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Selected Details Block */}
      <div className="mt-4 shrink-0">
        <AnimatePresence mode="wait">
          {selectedMinistry && (
            <motion.div
              key={selectedMinistry.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 flex gap-3 text-left items-start"
            >
              <div className="p-2 bg-indigo-100 dark:bg-indigo-950/60 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0">
                <MyIcon name={getMinistryIcon(selectedMinistry.name)} size={16} />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-slate-850 dark:text-slate-100">
                  {selectedMinistry.name}
                </h4>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                  {selectedMinistry.description || "Descrição não disponível."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </section>
  );
}
