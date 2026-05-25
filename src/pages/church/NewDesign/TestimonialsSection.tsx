/**
 * TestimonialsSection - Seção de depoimentos na página da igreja
 * Exibe depoimentos aprovados dos membros
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, Heart, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { buildApiUrl } from '@/lib/config';

interface Testimonial {
  id: number;
  member_name: string;
  member_avatar: string;
  member_since: string;
  testimonial_text: string;
}

interface TestimonialsSectionProps {
  churchId: number;
  churchSlug: string;
}

export default function TestimonialsSection({ churchId, churchSlug }: TestimonialsSectionProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        console.log('[TestimonialsSection] Buscando depoimentos para churchId:', churchId);
        const response = await fetch(buildApiUrl(`/api/church/${churchId}/testimonials`));
        const data = await response.json();
        console.log('[TestimonialsSection] Resposta:', data);
        if (data.success) {
          setTestimonials(data.data);
          console.log('[TestimonialsSection] Depoimentos carregados:', data.data.length);
        } else {
          console.error('[TestimonialsSection] Erro na resposta:', data.error);
        }
      } catch (error) {
        console.error('[TestimonialsSection] Erro ao carregar depoimentos:', error);
      } finally {
        setLoading(false);
      }
    };

    if (churchId) {
      fetchTestimonials();
    }
  }, [churchId]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (loading) {
    return null; // Não mostra nada enquanto carrega
  }

  if (testimonials.length === 0) {
    return (
      <section id="depoimentos" className="py-16 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full mb-4">
            <Heart className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">Depoimentos</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            O Que Nossos Membros Dizem
          </h2>
          <p className="text-slate-400 mb-8">
            Ainda não há depoimentos aprovados. Envie o seu e inspire outros!
          </p>
          <Button
            asChild
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold"
          >
            <a href={`/igreja/${churchSlug}/depoimento`}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Compartilhar Minha História
            </a>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section id="depoimentos" className="py-16 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full mb-4">
            <Heart className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">Depoimentos</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            O Que Nossos Membros Dizem
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Histórias reais de transformação e fé que acontecem em nossa comunidade
          </p>
        </motion.div>

        {/* Carousel de Depoimentos */}
        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardContent className="p-8 md:p-12">
                  <div className="flex flex-col items-center text-center">
                    <Quote className="w-12 h-12 text-amber-400/30 mb-6" />
                    
                    <Avatar className="w-20 h-20 border-4 border-amber-500/30 mb-6">
                      <AvatarFallback className="bg-indigo-600 text-white text-2xl font-bold">
                        {testimonials[currentIndex].member_avatar}
                      </AvatarFallback>
                    </Avatar>

                    <blockquote className="text-xl md:text-2xl text-slate-200 italic mb-6 leading-relaxed">
                      "{testimonials[currentIndex].testimonial_text}"
                    </blockquote>

                    <div className="text-center">
                      <h4 className="font-semibold text-white text-lg">
                        {testimonials[currentIndex].member_name}
                      </h4>
                      <p className="text-amber-400 text-sm">
                        Membro há {testimonials[currentIndex].member_since}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navegação */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={prevTestimonial}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-slate-800/80 hover:bg-slate-700 rounded-full flex items-center justify-center text-white border border-slate-600 transition-all hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextTestimonial}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-slate-800/80 hover:bg-slate-700 rounded-full flex items-center justify-center text-white border border-slate-600 transition-all hover:scale-110"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Indicadores */}
          {testimonials.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'w-8 bg-amber-400' 
                      : 'bg-slate-600 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* CTA para enviar depoimento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center mt-12"
        >
          <p className="text-slate-400 mb-4">
            Você também faz parte da nossa história?
          </p>
          <Button
            asChild
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold"
          >
            <a href={`/igreja/${churchSlug}/depoimento`}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Compartilhar Minha História
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
