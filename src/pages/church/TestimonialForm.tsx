/**
 * TestimonialForm - Página pública para membros enviarem depoimentos
 * Depoimentos ficam em "pending" até o pastor aprovar
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, Send, CheckCircle, Clock, Church } from 'lucide-react';
import { buildApiUrl } from '@/lib/config';
import { toast } from 'sonner';

interface Church {
  id: number;
  name: string;
  logo_url?: string;
}

export default function TestimonialForm() {
  const { slug } = useParams<{ slug: string }>();
  const [church, setChurch] = useState<Church | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    member_name: '',
    member_email: '',
    member_since: '',
    testimonial_text: ''
  });

  // Buscar dados da igreja
  useEffect(() => {
    const loadChurch = async () => {
      try {
        const res = await fetch(buildApiUrl(`/api/church/slug/${slug}`));
        const data = await res.json();
        if (data.success) {
          setChurch(data.data);
        }
      } catch (error) {
        console.error('Erro ao carregar igreja:', error);
      } finally {
        setLoading(false);
      }
    };
    loadChurch();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!church?.id) {
      toast.error('Igreja não encontrada');
      return;
    }
    
    if (formData.testimonial_text.length < 20) {
      toast.error('O depoimento deve ter pelo menos 20 caracteres');
      return;
    }
    
    if (formData.member_name.length < 2) {
      toast.error('Nome deve ter pelo menos 2 caracteres');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch(buildApiUrl('/api/testimonials/public'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          church_id: church.id,
          ...formData
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSubmitted(true);
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Erro ao enviar depoimento');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao enviar depoimento. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="bg-slate-900/80 border-indigo-500/30">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Depoimento Enviado!
              </h1>
              <p className="text-slate-400 mb-6">
                Obrigado por compartilhar sua experiência. 
                Seu depoimento será analisado pelo pastor e poderá aparecer em nossa página.
              </p>
              <div className="flex items-center justify-center gap-2 text-amber-400 text-sm">
                <Clock className="w-4 h-4" />
                <span>Status: Aguardando aprovação</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Compartilhe Sua Experiência
          </h1>
          <p className="text-slate-400">
            Sua história pode inspirar outros a fazer parte da nossa comunidade
          </p>
          {church && (
            <div className="flex items-center justify-center gap-2 mt-4 text-indigo-300">
              <Church className="w-5 h-5" />
              <span>{church.name}</span>
            </div>
          )}
        </div>

        {/* Formulário */}
        <Card className="bg-slate-900/80 border-indigo-500/30">
          <CardHeader>
            <CardTitle className="text-white text-center">
              Enviar Depoimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">
                  Seu Nome *
                </Label>
                <Input
                  id="name"
                  value={formData.member_name}
                  onChange={(e) => setFormData({ ...formData, member_name: e.target.value })}
                  placeholder="Ex: Maria Silva"
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email (opcional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.member_email}
                  onChange={(e) => setFormData({ ...formData, member_email: e.target.value })}
                  placeholder="maria@email.com"
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <p className="text-xs text-slate-500">
                  Apenas para contato, não será exibido publicamente
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="since" className="text-slate-300">
                  Membro há quanto tempo? *
                </Label>
                <Input
                  id="since"
                  value={formData.member_since}
                  onChange={(e) => setFormData({ ...formData, member_since: e.target.value })}
                  placeholder="Ex: 3 meses, 1 ano"
                  required
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="testimonial" className="text-slate-300">
                  Seu Depoimento *
                </Label>
                <Textarea
                  id="testimonial"
                  value={formData.testimonial_text}
                  onChange={(e) => setFormData({ ...formData, testimonial_text: e.target.value })}
                  placeholder="Conte como sua vida mudou desde que faz parte da nossa igreja..."
                  required
                  rows={5}
                  className="bg-slate-800 border-slate-700 text-white resize-none"
                />
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">
                    Mínimo 20 caracteres
                  </span>
                  <span className={formData.testimonial_text.length >= 20 ? 'text-green-400' : 'text-slate-500'}>
                    {formData.testimonial_text.length} caracteres
                  </span>
                </div>
              </div>

              <div className="bg-indigo-950/50 border border-indigo-500/20 rounded-lg p-3">
                <p className="text-xs text-slate-400 flex items-start gap-2">
                  <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400 shrink-0">
                    Importante
                  </Badge>
                  Seu depoimento será analisado pelo pastor antes de ser publicado. 
                  Isso garante a qualidade e relevância do conteúdo.
                </p>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold"
              >
                {submitting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Depoimento
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-8">
          Ao enviar, você concorda que seu depoimento possa ser exibido 
          publicamente após aprovação.
        </p>
      </motion.div>
    </div>
  );
}
