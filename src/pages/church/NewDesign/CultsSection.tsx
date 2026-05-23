import React from "react";
import MyIcon from "./MyIcon";
import { motion } from "motion/react";

interface CultData {
  id: number | string;
  // Campos do banco de dados (services.js)
  day_of_week?: string; // Sunday, Monday, etc.
  service_name?: string;
  service_time?: string; // HH:MM:SS
  description?: string;

  // Fallbacks genéricos
  dia_semana?: string;
  day?: string;
  horario?: string;
  time?: string;
  nome?: string;
  title?: string;
  descricao?: string;
}

interface CultsSectionProps {
  cults?: CultData[];
}

const dayMap: Record<string, string> = {
  'Sunday': 'Domingo',
  'Monday': 'Segunda',
  'Tuesday': 'Terça',
  'Wednesday': 'Quarta',
  'Thursday': 'Quinta',
  'Friday': 'Sexta',
  'Saturday': 'Sábado',
  // Fallbacks em português
  'domingo': 'Domingo',
  'segunda': 'Segunda',
  'terca': 'Terça',
  'terça': 'Terça',
  'quarta': 'Quarta',
  'quinta': 'Quinta',
  'sexta': 'Sexta',
  'sabado': 'Sábado',
  'sábado': 'Sábado',
};

// Map para converter dia da semana em índice 0-6 (Domingo=0)
const dayIndexMap: Record<string, number> = {
  'Sunday': 0, 'Domingo': 0, 'domingo': 0,
  'Monday': 1, 'Segunda': 1, 'segunda': 1,
  'Tuesday': 2, 'Terça': 2, 'terça': 2, 'terca': 2,
  'Wednesday': 3, 'Quarta': 3, 'quarta': 3,
  'Thursday': 4, 'Quinta': 4, 'quinta': 4,
  'Friday': 5, 'Sexta': 5, 'sexta': 5,
  'Saturday': 6, 'Sábado': 6, 'sabado': 6, 'sábado': 6,
};

export default function CultsSection({ cults = [] }: CultsSectionProps) {
  // Obter o dia atual (0 = Domingo, 1 = Segunda, etc.)
  const currentDayIndex = new Date().getDay();

  return (
    <section id="cultos" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full min-h-[460px] scroll-mt-24 relative z-10">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white">Cultos Semanais</h2>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mt-1">Participe Conosco</p>
          </div>
          <div className="w-10 h-10 bg-indigo-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-100 dark:border-slate-700">
            <MyIcon name="Clock" size={20} />
          </div>
        </div>

        <div className="space-y-4">
          {cults.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <MyIcon name="Calendar" size={32} className="mx-auto mb-2 opacity-50" />
              Nenhum culto cadastrado ainda.
            </div>
          ) : (
            cults.map((cult) => {
              // Mapeamento inteligente dos campos do banco de dados
              const rawDay = cult.day_of_week || cult.dia_semana || cult.day || '';
              
              // Verificar se é "Hoje"
              const serviceDayIndex = dayIndexMap[rawDay] ?? -1;
              const isToday = serviceDayIndex === currentDayIndex;

              // Nome do dia traduzido
              const dayName = dayMap[rawDay] || dayMap[rawDay.toLowerCase()] || rawDay;

              // Horário: formata HH:MM:SS para HH:MM
              let time = cult.service_time || cult.horario || cult.time || '';
              if (time && time.includes(':')) {
                const parts = time.split(':');
                time = `${parts[0]}:${parts[1]}`;
              }

              const title = cult.service_name || cult.nome || cult.title || '';
              const description = cult.description || cult.descricao || '';

              return (
                <div
                  key={cult.id}
                  className={`group flex flex-col p-3.5 rounded-xl transition-all duration-300 border ${
                    isToday
                      ? "bg-indigo-50/80 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50 shadow-md ring-1 ring-indigo-500/20"
                      : "bg-slate-50/50 dark:bg-slate-950/30 border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 hover:shadow-sm"
                  }`}
                >
                  {/* Header: Dia e Hora */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-indigo-600' : 'bg-slate-400'}`} />
                      <span className={`text-sm font-bold ${isToday ? 'text-indigo-800 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                        {dayName}
                      </span>
                    </div>
                    <div className={`px-2.5 py-0.5 rounded-md text-xs font-bold font-mono tracking-wide ${
                      isToday
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm'
                    }`}>
                      {time}
                    </div>
                  </div>

                  {/* Título e Descrição */}
                  <div>
                    <h3 className={`font-semibold text-sm mb-1 flex items-center ${isToday ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-900 dark:text-slate-100'}`}>
                      {title}
                      {isToday && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-600 text-white animate-pulse tracking-wider">
                          HOJE
                        </span>
                      )}
                    </h3>
                    <p className={`text-xs leading-relaxed line-clamp-2 ${isToday ? 'text-indigo-700/80 dark:text-slate-300' : 'text-slate-600 dark:text-slate-400'}`}>
                      {description}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <MyIcon name="DoorOpen" size={16} />
          <span>Entrada Franca • Venha nos visitar!</span>
        </div>
      </div>
    </section>
  );
}
