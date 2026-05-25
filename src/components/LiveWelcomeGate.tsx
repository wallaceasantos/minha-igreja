/**
 * LiveWelcomeGate - Tela de Boas-Vindas para Live
 * Converte visitantes em membros mostrando valor e social proof
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, Check, Crown, MessageCircle, Bell, Heart, Shield, 
  ChevronRight, Play, X
} from 'lucide-react';
import { buildApiUrl } from '@/lib/config';

interface LiveWelcomeGateProps {
  churchName: string;
  churchLogo?: string | null;
  memberCount: number;
  onlineCount: number;
  liveTitle: string;
  onEnterAsGuest: () => void;
  onBecomeMember: () => void;
}

// Benefícios de ser membro
const memberBenefits = [
  { icon: MessageCircle, text: 'Chat exclusivo ao vivo', color: 'text-blue-400' },
  { icon: Heart, text: 'Pedidos de oração prioritários', color: 'text-pink-400' },
  { icon: Bell, text: 'Notificações de lives', color: 'text-amber-400' },
  { icon: Crown, text: 'Conteúdo exclusivo', color: 'text-purple-400' },
];

// Depoimentos de membros
const testimonials = [
  { name: 'Maria S.', time: '2 meses', text: 'Fazer parte mudou minha vida! O apoio da comunidade é incrível.', avatar: 'M' },
  { name: 'João P.', time: '6 meses', text: 'Sinto-me em casa. Aqui encontrei minha família espiritual.', avatar: 'J' },
  { name: 'Ana L.', time: '1 ano', text: 'As lives são uma bênção! Participo de todas.', avatar: 'A' },
];

export default function LiveWelcomeGate({
  churchName,
  churchLogo,
  memberCount,
  onlineCount,
  liveTitle,
  onEnterAsGuest,
  onBecomeMember,
}: LiveWelcomeGateProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showTestimonials, setShowTestimonials] = useState(false);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-sm overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl"
      >
        <Card className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 border-indigo-700/50 overflow-hidden max-h-[90vh] my-4">
          {/* Header com Logo */}
          <div className="relative p-6 text-center border-b border-indigo-800/50">
            <button
              onClick={onEnterAsGuest}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            {churchLogo && (
              <motion.img
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                src={buildApiUrl(churchLogo)}
                alt={churchName}
                className="w-20 h-20 mx-auto mb-4 rounded-full border-4 border-indigo-500/30 shadow-xl"
              />
            )}
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 mb-3">
                <Play className="w-3 h-3 mr-1" /> Transmissão Ao Vivo
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Bem-vindo à {churchName}
              </h1>
              <p className="text-indigo-200 text-sm sm:text-base">
                {liveTitle}
              </p>
            </motion.div>
          </div>

          <CardContent className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Social Proof - Contadores */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-6"
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                  <Crown className="w-5 h-5" />
                  <span className="text-2xl font-bold">{memberCount}</span>
                </div>
                <p className="text-xs text-slate-400">Membros</p>
              </div>
              <div className="h-10 w-px bg-indigo-800" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                  <Users className="w-5 h-5" />
                  <span className="text-2xl font-bold">{onlineCount}</span>
                </div>
                <p className="text-xs text-slate-400">Assistindo agora</p>
              </div>
            </motion.div>

            {/* Avatares dos membros */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center"
            >
              <div className="flex -space-x-3">
                {testimonials.map((t, i) => (
                  <Avatar
                    key={i}
                    className="w-10 h-10 border-2 border-indigo-600"
                  >
                    <AvatarFallback className="bg-indigo-500 text-white text-sm">
                      {t.avatar}
                    </AvatarFallback>
                  </Avatar>
                ))}
                <div className="w-10 h-10 rounded-full bg-indigo-600 border-2 border-indigo-800 flex items-center justify-center text-white text-xs font-bold">
                  +{Math.max(0, memberCount - 3)}
                </div>
              </div>
              <p className="ml-3 text-sm text-slate-300">
                já fazem parte desta comunidade
              </p>
            </motion.div>

            {/* Benefícios */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 gap-3"
            >
              {memberBenefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-indigo-950/50 border border-indigo-800/30"
                >
                  <div className={`${benefit.color}`}>
                    <benefit.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-slate-200">{benefit.text}</span>
                  <Check className="w-4 h-4 text-green-400 ml-auto flex-shrink-0" />
                </motion.div>
              ))}
            </motion.div>

            {/* Depoimentos (opcional) */}
            {showTestimonials && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <p className="text-sm text-slate-400 text-center">O que dizem nossos membros:</p>
                {testimonials.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/30"
                  >
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-indigo-600 text-white text-xs">
                        {t.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-white">{t.name}</span>
                        <Badge variant="outline" className="text-[10px] border-indigo-500/30 text-indigo-300">
                          <Shield className="w-3 h-3 mr-0.5" /> Membro
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{t.time}</p>
                      <p className="text-sm text-slate-300 mt-1 italic">"{t.text}"</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Botões de Ação */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <Button
                size="lg"
                onClick={onBecomeMember}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-lg shadow-amber-500/20 group"
              >
                <Crown className="w-5 h-5 mr-2" />
                Tornar-se Membro Gratuitamente
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onEnterAsGuest}
                  className="flex-1 border-indigo-500/30 text-indigo-200 hover:bg-indigo-950/50 hover:text-white"
                >
                  Entrar como Visitante
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowTestimonials(!showTestimonials)}
                  className="text-slate-400 hover:text-white"
                >
                  {showTestimonials ? 'Ocultar' : 'Ver Depoimentos'}
                </Button>
              </div>
            </motion.div>

            {/* Texto de segurança */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center text-xs text-slate-500"
            >
              <Shield className="w-3 h-3 inline mr-1" />
              Ambiente seguro e acolhedor • Dados protegidos
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
