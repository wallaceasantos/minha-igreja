/**
 * LiveConversionBanner - Banner de conversão contextual
 * Aparece após o usuário assistir alguns minutos da live
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { X, Crown, Gift, Clock, ArrowRight } from 'lucide-react';

interface LiveConversionBannerProps {
  memberCount: number;
  isVisible: boolean;
  onClose: () => void;
  onAction: () => void;
  timeWatched: number; // em minutos
}

export default function LiveConversionBanner({
  memberCount,
  isVisible,
  onClose,
  onAction,
  timeWatched,
}: LiveConversionBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isVisible || isDismissed) return null;

  // Mensagens contextuais baseadas no tempo assistido
  const getMessage = () => {
    if (timeWatched < 2) {
      return {
        title: '🎁 Bem-vindo à nossa live!',
        subtitle: 'Junte-se a ' + memberCount + ' membros ativos',
        cta: 'Quero Participar',
      };
    } else if (timeWatched < 5) {
      return {
        title: '🌟 Gostando da live?',
        subtitle: 'Membros têm acesso a conteúdo exclusivo',
        cta: 'Tornar-se Membro',
      };
    } else {
      return {
        title: '🎉 Você está engajado!',
        subtitle: 'Que tal fazer parte oficialmente?',
        cta: 'Ser Membro Agora',
      };
    }
  };

  const message = getMessage();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 z-40"
      >
        <div className="max-w-2xl mx-auto bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 rounded-2xl p-4 shadow-2xl border border-indigo-500/30">
          <div className="flex items-start gap-4">
            {/* Ícone/Avatar */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Gift className="w-6 h-6 text-amber-400" />
              </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-white text-sm sm:text-base">
                  {message.title}
                </h4>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                  <Crown className="w-3 h-3 mr-1" /> Grátis
                </Badge>
              </div>
              
              <p className="text-indigo-200 text-xs sm:text-sm mb-3">
                {message.subtitle}
              </p>

              {/* Avatares de membros */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex -space-x-2">
                  {['A', 'B', 'C'].map((letter, i) => (
                    <Avatar key={i} className="w-6 h-6 border-2 border-indigo-900">
                      <AvatarFallback className="bg-indigo-600 text-white text-[10px]">
                        {letter}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-xs text-indigo-300">
                  +{memberCount} pessoas já participam
                </span>
              </div>

              {/* Botões */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={onAction}
                  className="bg-white text-indigo-900 hover:bg-indigo-50 font-semibold text-xs"
                >
                  {message.cta}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsDismissed(true);
                    onClose();
                  }}
                  className="text-indigo-300 hover:text-white hover:bg-indigo-800/50 text-xs"
                >
                  Agora não
                </Button>
              </div>
            </div>

            {/* Timer e Fechar */}
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => {
                  setIsDismissed(true);
                  onClose();
                }}
                className="text-indigo-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1 text-xs text-indigo-400">
                <Clock className="w-3 h-3" />
                <span>{timeWatched}m assistido</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
