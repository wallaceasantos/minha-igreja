/**
 * TestimonialsSection - Seção de depoimentos na página da igreja
 * Exibe depoimentos aprovados dos membros com visual profissional
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, Heart, Quote, Sparkles } from 'lucide-react';
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

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch(buildApiUrl(`/api/church/${churchId}/testimonials`));
        const data = await response.json();
        if (data.success) {
          setTestimonials(data.data);
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

  if (loading) {
    return null;
  }

  // Estado vazio - incentiva envio
  if (testimonials.length === 0) {
    return (
      <section id="depoimentos" className="py-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full mb-6 border border-amber-500/20">
              <Heart className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-medium">Depoimentos</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              O Que Nossos Membros Dizem
            </h2>
            <p className="text-slate-400 mb-8">
              Ainda não há depoimentos aprovados. Seja o primeiro a compartilhar sua experiência e inspirar outros!
            </p>

            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-lg shadow-amber-500/25"
            >
              <a href={`/igreja/${churchSlug}/depoimento`}>
                <MessageSquare className="w-5 h-5 mr-2" />
                Compartilhar Minha História
              </a>
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="depoimentos" className="py-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full mb-6 border border-amber-500/20">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">Depoimentos Reais</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            O Que Dizem Nossos Membros
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Histórias de fé, transformação e comunidade que acontecem em nossa igreja
          </p>
        </motion.div>

        {/* Grid de Depoimentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group h-full bg-slate-800/30 border-slate-700/30 hover:border-amber-500/30 hover:bg-slate-800/50 transition-all duration-300">
                <CardContent className="p-6 flex flex-col h-full">
                  {/* Aspas decorativas */}
                  <Quote className="w-8 h-8 text-amber-400/40 mb-4" />

                  {/* Texto do depoimento */}
                  <p className="text-slate-300 text-base leading-relaxed flex-grow mb-6 line-clamp-6">
                    "{testimonial.testimonial_text}"
                  </p>

                  {/* Separador */}
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mb-4" />

                  {/* Informação do membro */}
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-amber-500/30">
                      {testimonial.member_avatar ? (
                        <AvatarImage src={testimonial.member_avatar} alt={testimonial.member_name} />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-sm">
                        {testimonial.member_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h4 className="font-semibold text-white text-sm">
                        {testimonial.member_name}
                      </h4>
                      <p className="text-amber-400/80 text-xs">
                        Membro há {testimonial.member_since}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA para enviar depoimento */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-amber-500/20">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-white mb-2">
                Você também faz parte dessa história?
              </h3>
              <p className="text-slate-400 mb-6">
                Compartilhe sua experiência e inspire outros membros da comunidade
              </p>
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-lg shadow-amber-500/25"
              >
                <a href={`/igreja/${churchSlug}/depoimento`}>
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Compartilhar Meu Depoimento
                </a>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
