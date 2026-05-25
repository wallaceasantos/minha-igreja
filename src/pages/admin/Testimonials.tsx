/**
 * Admin Testimonials - Gerenciamento de Depoimentos
 * Pastor pode aprovar, rejeitar e gerenciar depoimentos dos membros
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, XCircle, Clock, MessageSquare, 
  Users, Trash2, RefreshCw, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/config';

interface Testimonial {
  id: number;
  member_name: string;
  member_email?: string;
  member_avatar: string;
  member_since: string;
  testimonial_text: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_at?: string;
  approved_by_name?: string;
}

interface Stats {
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  total_count: number;
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [churchSlug, setChurchSlug] = useState<string>('');
  const [tokenError, setTokenError] = useState(false);

  // Buscar slug da igreja do usuário logado
  useEffect(() => {
    // Tentar obter do localStorage (armazenado no login)
    const storedSlug = localStorage.getItem('church_slug');
    if (storedSlug) {
      setChurchSlug(storedSlug);
    }
    
    // Verificar se existe token
    const token = localStorage.getItem('token');
    if (!token) {
      setTokenError(true);
    }
  }, []);

  // Buscar depoimentos
  const fetchTestimonials = async (status?: string) => {
    try {
      setLoading(true);
      const url = status 
        ? buildApiUrl(`/api/testimonials?status=${status}`)
        : buildApiUrl('/api/testimonials');
      
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setTestimonials(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar depoimentos:', error);
      toast.error('Erro ao carregar depoimentos');
    } finally {
      setLoading(false);
    }
  };

  // Buscar estatísticas
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('/api/testimonials/stats'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  useEffect(() => {
    fetchTestimonials();
    fetchStats();
  }, []);

  // Filtrar por aba
  useEffect(() => {
    if (activeTab !== 'all') {
      fetchTestimonials(activeTab);
    } else {
      fetchTestimonials();
    }
  }, [activeTab]);

  const handleApprove = async (id: number) => {
    setProcessingId(id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/api/testimonials/${id}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'approved' })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Depoimento aprovado!');
        fetchTestimonials(activeTab !== 'all' ? activeTab : undefined);
        fetchStats();
      } else {
        toast.error(data.error || 'Erro ao aprovar');
      }
    } catch (error) {
      toast.error('Erro ao aprovar depoimento');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    setProcessingId(id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/api/testimonials/${id}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'rejected' })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Depoimento rejeitado');
        fetchTestimonials(activeTab !== 'all' ? activeTab : undefined);
        fetchStats();
      } else {
        toast.error(data.error || 'Erro ao rejeitar');
      }
    } catch (error) {
      toast.error('Erro ao rejeitar depoimento');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este depoimento?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl(`/api/testimonials/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Depoimento excluído');
        fetchTestimonials(activeTab !== 'all' ? activeTab : undefined);
        fetchStats();
      }
    } catch (error) {
      toast.error('Erro ao excluir depoimento');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Clock className="w-3 h-3 mr-1" /> Pendente</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" /> Aprovado</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" /> Rejeitado</Badge>;
      default:
        return null;
    }
  };

  const filteredTestimonials = activeTab === 'all' 
    ? testimonials 
    : testimonials.filter(t => t.status === activeTab);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-amber-400" />
          Depoimentos dos Membros
        </h1>
        <p className="text-slate-400">
          Gerencie os depoimentos que aparecem na tela de boas-vindas da live
        </p>
      </div>

      {/* Erro de Token */}
      {tokenError && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/30 rounded-lg">
          <p className="text-red-300 text-sm mb-2">
            <strong>Erro de autenticação:</strong> Sua sessão expirou ou o token é inválido.
          </p>
          <Button
            size="sm"
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Fazer Login Novamente
          </Button>
        </div>
      )}

      {/* Alerta informativo */}
      <div className="mb-6 p-4 bg-indigo-900/30 border border-indigo-500/30 rounded-lg">
        <p className="text-indigo-300 text-sm">
          <strong>Nota:</strong> Você só vê os depoimentos da igreja em que está logado. 
          Depoimentos enviados por membros de outras igrejas não aparecem aqui. 
          Certifique-se de que os membros estejam enviando pelo link correto da sua igreja.
        </p>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.pending_count}</p>
                  <p className="text-sm text-slate-400">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.approved_count}</p>
                  <p className="text-sm text-slate-400">Aprovados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.rejected_count}</p>
                  <p className="text-sm text-slate-400">Rejeitados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stats.total_count}</p>
                  <p className="text-sm text-slate-400">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger value="pending" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            Pendentes {stats?.pending_count > 0 && `(${stats.pending_count})`}
          </TabsTrigger>
          <TabsTrigger value="approved" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            Aprovados
          </TabsTrigger>
          <TabsTrigger value="rejected" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
            Rejeitados
          </TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-slate-500 mx-auto" />
              <p className="text-slate-400 mt-2">Carregando...</p>
            </div>
          ) : filteredTestimonials.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800">
              <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">
                {activeTab === 'pending' 
                  ? 'Nenhum depoimento pendente de aprovação'
                  : activeTab === 'approved'
                  ? 'Nenhum depoimento aprovado ainda'
                  : 'Nenhum depoimento encontrado'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredTestimonials.map((testimonial) => (
                  <motion.div
                    key={testimonial.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12 border-2 border-indigo-500/30">
                            <AvatarFallback className="bg-indigo-600 text-white text-lg">
                              {testimonial.member_avatar}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-white">
                                {testimonial.member_name}
                              </h3>
                              {getStatusBadge(testimonial.status)}
                            </div>
                            
                            <p className="text-sm text-slate-400 mb-1">
                              Membro há: {testimonial.member_since}
                            </p>
                            
                            {testimonial.member_email && (
                              <p className="text-xs text-slate-500 mb-2">
                                Email: {testimonial.member_email}
                              </p>
                            )}
                            
                            <blockquote className="text-slate-300 italic border-l-2 border-indigo-500/30 pl-3 my-3">
                              "{testimonial.testimonial_text}"
                            </blockquote>
                            
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span>Enviado em: {new Date(testimonial.created_at).toLocaleDateString('pt-BR')}</span>
                              {testimonial.approved_at && (
                                <span>Aprovado em: {new Date(testimonial.approved_at).toLocaleDateString('pt-BR')}</span>
                              )}
                            </div>
                          </div>

                          {/* Ações */}
                          <div className="flex flex-col gap-2">
                            {testimonial.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(testimonial.id)}
                                  disabled={processingId === testimonial.id}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Aprovar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReject(testimonial.id)}
                                  disabled={processingId === testimonial.id}
                                  className="border-red-600 text-red-400 hover:bg-red-900/20"
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Rejeitar
                                </Button>
                              </>
                            )}
                            
                            {testimonial.status === 'approved' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(testimonial.id)}
                                disabled={processingId === testimonial.id}
                                className="border-amber-600 text-amber-400 hover:bg-amber-900/20"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Desaprovar
                              </Button>
                            )}
                            
                            {testimonial.status === 'rejected' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApprove(testimonial.id)}
                                disabled={processingId === testimonial.id}
                                className="border-green-600 text-green-400 hover:bg-green-900/20"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Aprovar
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(testimonial.id)}
                              className="text-slate-500 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Link público */}
      <div className="mt-8 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-lg">
        <div className="flex items-center gap-2 text-indigo-300 mb-2">
          <ExternalLink className="w-4 h-4" />
          <span className="text-sm">
            Link para membros enviarem depoimentos:
          </span>
        </div>
        {churchSlug ? (
          <div className="flex items-center gap-3">
            <code className="bg-slate-800 px-3 py-2 rounded text-white text-sm">
              /igreja/{churchSlug}/depoimento
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(`/igreja/${churchSlug}/depoimento`, '_blank')}
              className="text-xs border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/30"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Abrir
            </Button>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">
            Carregando informações da igreja...
          </p>
        )}
      </div>
    </div>
  );
}
