/**
 * Admin: Avaliar Plataforma
 * ============================================
 * Pastor avalia o sistema MinhaIgreja
 * URL: /admin/avaliar
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Star, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useDashboard } from '@/hooks/useDashboard';

export default function AdminReviews() {
  const navigate = useNavigate();
  const { church, loading } = useDashboard();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [pastorName, setPastorName] = useState('');

  useEffect(() => {
    // Verificar no banco de dados se já avaliou
    const checkReviewStatus = async () => {
      try {
        const churchId = localStorage.getItem('churchId');
        const response = await fetch('http://localhost:3000/api/admin/reviews/me', {
          headers: {
            'x-church-id': churchId || '',
          },
        });
        const result = await response.json();
        
        if (result.success && result.hasReviewed) {
          setHasReviewed(true);
          setSent(true);
          localStorage.setItem(`reviewed_${church?.id}`, 'true');
        }
      } catch (error) {
        console.error('Error checking review status:', error);
      }
    };
    
    if (church?.id) {
      checkReviewStatus();
    }
  }, [church]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Selecione uma nota');
      return;
    }
    if (!comment.trim()) {
      toast.error('Escreva um comentário');
      return;
    }

    setSending(true);
    try {
      const churchId = localStorage.getItem('churchId');
      const response = await fetch('http://localhost:3000/api/admin/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-church-id': churchId || '',
        },
        body: JSON.stringify({
          pastor_name: pastorName.trim() || 'Pastor',
          church_name: church?.name || 'Igreja',
          rating,
          comment,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSent(true);
        setHasReviewed(true);
        localStorage.setItem(`reviewed_${church?.id}`, 'true');
        toast.success('Avaliação enviada! Obrigado pelo feedback!');
      } else {
        if (result.error.includes('já enviou')) {
          toast.info('Você já enviou uma avaliação. Obrigado!');
          setSent(true);
          setHasReviewed(true);
          localStorage.setItem(`reviewed_${church?.id}`, 'true');
        } else {
          toast.error(result.error || 'Erro ao enviar');
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Erro ao enviar avaliação');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 max-w-2xl mx-auto">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/admin/dashboard')}
        className="gap-2 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao Dashboard
      </Button>

      <Card className="border-2 border-yellow-200 dark:border-yellow-800/50 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
          <CardTitle className="text-3xl font-bold">Avalie o MinhaIgreja</CardTitle>
          <CardDescription className="text-base mt-2">
            Sua opinião ajuda a melhorar a plataforma para todas as igrejas!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          {hasReviewed ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-green-700 dark:text-green-400">
                Obrigado pela sua avaliação!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Seu feedback é muito importante para nós. Continue usando o MinhaIgreja para transformar a comunicação da sua igreja!
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/admin/dashboard')}
                className="mt-4"
              >
                Voltar ao Dashboard
              </Button>
            </div>
          ) : (
            <>
              {/* Nome do Pastor */}
              <div className="text-center space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Seu Nome (Pastor/Líder)
                </label>
                <Input
                  placeholder="Ex: Pr. João Silva"
                  value={pastorName}
                  onChange={(e) => setPastorName(e.target.value)}
                  className="max-w-xs mx-auto"
                />
              </div>

              {/* Estrelas de Avaliação */}
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Qual sua nota para a plataforma?
                </label>
                <div className="flex justify-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      className="transition-all duration-200 hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-12 h-12 drop-shadow-sm transition-colors ${
                          star <= (hover || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <div className="mt-3">
                    <Badge
                      variant="outline"
                      className={`text-sm px-4 py-1 ${
                        rating >= 4
                          ? 'border-green-500 text-green-600 dark:text-green-400'
                          : rating >= 3
                          ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400'
                          : 'border-red-500 text-red-600 dark:text-red-400'
                      }`}
                    >
                      {rating === 5 ? 'Excelente! 🌟' : rating === 4 ? 'Muito Bom! 👍' : rating === 3 ? 'Bom 😊' : rating === 2 ? 'Regular 😐' : 'Precisa Melhorar 😞'}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Comentário */}
              <div className="space-y-2">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Conte-nos o que achou (opcional mas encorajado)
                </label>
                <Textarea
                  id="comment"
                  placeholder="Ex: O sistema é muito fácil de usar! Gostaria de ver mais recursos de..."
                  rows={5}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="resize-none text-base"
                />
                <p className="text-xs text-muted-foreground">
                  {comment.length}/500 caracteres
                </p>
              </div>

              {/* Botão Enviar */}
              <Button
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-lg"
                size="lg"
                disabled={sending || rating === 0}
                onClick={handleSubmit}
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Star className="w-5 h-5 mr-2" />
                    Enviar Avaliação
                  </>
                )}
              </Button>

              {rating === 0 && (
                <p className="text-center text-sm text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Selecione pelo menos 1 estrela para continuar
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
