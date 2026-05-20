/**
 * Pedidos de Oração - Versão Premium (Plano Essencial)
 * =====================================================
 * Página pública de pedidos de oração com design premium
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { GoogleLogin } from '@react-oauth/google';
import { ChurchHeader, ChurchFooter } from './church/ChurchBase';
import emailjs from '@emailjs/browser';
import { buildApiUrl } from '@/lib/config';
import {
  Heart,
  Send,
  Shield,
  CheckCircle,
  BookOpen,
  Users,
  Sparkles
} from 'lucide-react';

export default function PedidosOracaoPremium() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [protocolo, setProtocolo] = useState<string>('');
  const [versiculoSucesso, setVersiculoSucesso] = useState<typeof versiculos[0] | null>(null);
  const [church, setChurch] = useState<any>(null);
  const [prayerCount, setPrayerCount] = useState(0);
  const [googleUser, setGoogleUser] = useState<{ name: string; email: string; picture: string } | null>(null);

  const [formData, setFormData] = useState({
    tipo: 'pedido', // 'pedido', 'agradecimento', 'testemunho'
    nome: '',
    email: '',
    categoria: '',
    tema: '',
    oracao: '',
    lgpd: false,
  });

  // Carregar dados da igreja
  useEffect(() => {
    loadChurchData();
  }, [slug]);

  const loadChurchData = async () => {
    try {
      const res = await fetch(buildApiUrl(`/api/church/slug/${slug}`));
      const data = await res.json();

      if (data.success) {
        setChurch(data.data);
        loadPrayerCount(data.data.id);
      } else {
        toast.error('Igreja não encontrada');
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading church:', error);
      toast.error('Erro ao carregar dados');
    }
  };

  const loadPrayerCount = async (churchId: number) => {
    try {
      const res = await fetch(buildApiUrl(`/api/pedidos?church_id=${churchId}`));
      const data = await res.json();
      if (data.success) {
        setPrayerCount(data.data?.length || 0);
      }
    } catch (error) {
      console.error('Error loading prayers:', error);
    }
  };


  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const data = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      setGoogleUser({ name: data.name, email: data.email, picture: data.picture });
      setFormData(prev => ({ ...prev, nome: data.name, email: data.email }));
      toast.success(`Logado como ${data.name}`);
    } catch (error) {
      toast.error('Erro no login com Google');
    }
  };

  // // Lista de temas disponíveis
  const temasDisponiveis = [
    "Salvação",
    "Saúde/Cura",
    "Finanças/Provisão",
    "Família/Casamento",
    "Libertação",
    "Livramento",
    "Trabalho/Estudos",
    "Direcionamento",
    "Restauração Emocional",
    "Crescimento Espiritual",
    "Nação",
    "Missões",
    "Igreja",
    "Relacionamentos",
    "Outros",
  ];

  // Lista de versículos para exibição aleatória
  const versiculos = [
    { texto: "Lancem sobre ele toda a sua ansiedade, porque ele tem cuidado de vocês.", ref: "1 Pedro 5:7" },
    { texto: "O Senhor é o meu pastor e nada me faltará.", ref: "Salmos 23:1" },
    { texto: "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.", ref: "Jeremias 29:11" },
    { texto: "Tudo posso naquele que me fortalece.", ref: "Filipenses 4:13" },
    { texto: "Mas os que esperam no Senhor renovarão as forças, subirão com asas como águias; correrão, e não se cansarão; caminharão, e não se fatigarão.", ref: "Isaías 40:31" },
    { texto: "O Senhor é a minha luz e a minha salvação; a quem temerei?", ref: "Salmos 27:1" },
    { texto: "Cheguemo-nos, pois, com confiança ao trono da graça, para que possamos alcançar misericórdia e achar graça, a fim de sermos socorridos no tempo oportuno.", ref: "Hebreus 4:16" },
    { texto: "E a paz de Deus, que excede todo o entendimento, guardará os vossos corações e os vossos sentimentos em Cristo Jesus.", ref: "Filipenses 4:7" },
    { texto: "Porque o Senhor é o nosso refúgio e fortaleza, socorro bem presente na angústia.", ref: "Salmos 46:1" },
    { texto: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.", ref: "Mateus 11:28" },
  ];

  const gerarNumeroProtocolo = () => {
    const ano = new Date().getFullYear();
    const mes = String(new Date().getMonth() + 1).padStart(2, '0');
    const dia = String(new Date().getDate()).padStart(2, '0');
    const aleatorio = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `#${ano}-${mes}${dia}-${aleatorio}`;
  };

  // Enviar email de confirmação
  const sendConfirmationEmail = async (data: any, protocolo: string) => {
    try {
      const templateParams = {
        to_email: data.email,
        to_name: data.nome.split(' ')[0], // Primeiro nome
        from_name: church?.name || 'Igreja',
        subject: `${data.tipo === 'agradecimento' ? 'Agradecimento' : data.tipo === 'testemunho' ? 'Testemunho' : 'Pedido de Oração'} Recebido ✅`,
        protocolo: protocolo,
        tipo: data.tipo === 'agradecimento' ? 'Agradecimento' : data.tipo === 'testemunho' ? 'Testemunho' : 'Pedido de Oração',
        tema: data.tema,
        message: `
Olá ${data.nome.split(' ')[0]},

✅ Recebemos seu ${data.tipo === 'agradecimento' ? 'agradecimento' : data.tipo === 'testemunho' ? 'testemunho' : 'pedido de oração'}!

Número de Protocolo: ${protocolo}
Tema: ${data.tema}

Nossa equipe de intercessão já recebeu sua mensagem e está orando por você!

"Porque o Senhor é o nosso refúgio e fortaleza, socorro bem presente na angústia."
📖 Salmos 46:1

Continue firme na fé, pois temos uma grande nuvem de testemunhas intercedendo por você!

Com carinho e orações,
**Equipe de Intercessão**
${church?.name || 'Nossa Igreja'}

---
📧 Este é um email automático, por favor não responda.
        `,
      };

      console.log('📧 Enviando email de confirmação:', templateParams);

      await emailjs.send(
        'service_qf3pbb5',
        'template_v2kjju6',
        templateParams,
        'sJI2ClV8f7kP7qQsZ' // Sua public key do EmailJS
      );

      console.log('✅ Email enviado com sucesso!');
    } catch (error) {
      // Email falhou, mas não falha o submit (é opcional)
      console.log('ℹ️ Email não enviado (configuração pendente):', error instanceof Error ? error.message : error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar LGPD
    if (!formData.lgpd) {
      toast.error('É necessário aceitar a política de privacidade');
      return;
    }
    
    setLoading(true);

    try {
      const churchId = church?.id;
      if (!churchId) {
        throw new Error('Igreja não encontrada');
      }

      const response = await fetch(buildApiUrl('/api/pedidos'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-church-id': String(churchId),
        },
        body: JSON.stringify({
          church_id: churchId,
          tipo: formData.tipo, // 'pedido', 'agradecimento', 'testemunho'
          nome: formData.nome,
          email: formData.email,
          categoria: formData.categoria,
          tema: formData.tema,
          oracao: formData.oracao,
          privacidade: 'private', // Sempre privado
          status: 'pending',
        }),
      });

      const result = await response.json();
      console.log('📤 Resposta do servidor:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar pedido');
      }

      if (result.success) {
        const protocolo = gerarNumeroProtocolo();
        const versiculoAleatorio = versiculos[Math.floor(Math.random() * versiculos.length)];
        
        // Salvar protocolo e versículo para exibição
        setProtocolo(protocolo);
        setVersiculoSucesso(versiculoAleatorio ?? null);
        
        // Enviar email de confirmação
        sendConfirmationEmail(formData, protocolo);
        
        setSuccess(true);
        toast.success('Pedido enviado com sucesso!');
        
        // Reset form após 5 segundos
        setTimeout(() => {
          setSuccess(false);
          setProtocolo('');
          setVersiculoSucesso(null);
          setFormData({
            tipo: 'pedido',
            nome: '',
            email: '',
            categoria: '',
            tema: '',
            oracao: '',
            lgpd: false,
          });
        }, 5000);
      } else {
        toast.error(result.error || 'Erro ao enviar pedido');
      }
    } catch (error) {
      console.error('Error submitting prayer:', error);
      toast.error('Erro ao enviar pedido de oração');
    } finally {
      setLoading(false);
    }
  };

  if (!church) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Padrão */}
      <ChurchHeader church={church} churchSlug={slug} />

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Heart className="w-4 h-4" />
            Ministério de Intercessão
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-4">
            Como Podemos Orar Por Você Hoje?
          </h2>
          <p className="text-base sm:text-xl text-blue-100 leading-relaxed max-w-3xl mx-auto px-4">
            "A oração eficaz de um justo pode muito em seus efeitos."
            <span className="block mt-2 font-semibold">Tiago 5:16</span>
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12 max-w-2xl mx-auto">
            <div className="text-center">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-80" />
              <div className="text-xl sm:text-2xl font-bold">{prayerCount}+</div>
              <div className="text-xs sm:text-sm text-blue-100">Pedidos de Oração</div>
            </div>
            <div className="text-center">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-80" />
              <div className="text-xl sm:text-2xl font-bold">24/7</div>
              <div className="text-xs sm:text-sm text-blue-100">Intercessão</div>
            </div>
            <div className="text-center">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-80" />
              <div className="text-xl sm:text-2xl font-bold">100%</div>
              <div className="text-xs sm:text-sm text-blue-100">Privacidade</div>
            </div>
          </div>
        </div>
      </section>

      {/* Formulário Premium */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {success ? (
              <Card className="border-2 border-green-500 shadow-2xl dark:bg-gray-800 dark:border-green-800">
                <CardContent className="py-12 text-center">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-green-700 dark:text-green-400 mb-2 px-4">
                    {formData.tipo === 'agradecimento' ? 'Agradecimento' : formData.tipo === 'testemunho' ? 'Testemunho' : 'Pedido'} Recebido!
                  </h3>

                  {/* Número de Protocolo */}
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 max-w-md mx-auto mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Número de Protocolo</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{protocolo}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Guarde este número para acompanhamento</p>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-lg mb-6 max-w-2xl mx-auto">
                    Nossa equipe de intercessão já recebeu sua mensagem e está orando por você.
                  </p>

                  {/* Versículo Aleatório */}
                  {versiculoSucesso && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 max-w-2xl mx-auto border-l-4 border-blue-600">
                      <p className="text-gray-800 dark:text-gray-300 font-medium italic mb-3">
                        "{versiculoSucesso.texto}"
                      </p>
                      <p className="text-blue-600 dark:text-blue-400 font-semibold">📖 {versiculoSucesso.ref}</p>
                    </div>
                  )}

                  <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                    <p>📧 Enviamos um email de confirmação para <strong className="dark:text-white">{formData.email}</strong></p>
                    <p className="mt-2">O formulário será resetado em alguns segundos...</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-blue-200 shadow-2xl dark:bg-gray-800 dark:border-blue-800">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Heart className="w-8 h-8" />
                    <CardTitle className="text-2xl">Enviar Pedido de Oração</CardTitle>
                  </div>
                  <CardDescription className="text-blue-100 text-base">
                    Preencha o formulário abaixo e nossa equipe de intercessão orará por você
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 md:p-8 dark:bg-gray-800">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Tipo de Pedido */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 dark:text-white">
                        <Heart className="w-5 h-5 text-blue-600" />
                        Tipo de Mensagem
                      </h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                            formData.tipo === 'pedido'
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                          }`}
                          onClick={() => setFormData({ ...formData, tipo: 'pedido' })}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Heart className={`w-5 h-5 ${formData.tipo === 'pedido' ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500'}`} />
                            <span className="font-semibold dark:text-white">Pedido de Oração</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Solicite oração por uma necessidade</p>
                        </div>
                        <div
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                            formData.tipo === 'agradecimento'
                              ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                          }`}
                          onClick={() => setFormData({ ...formData, tipo: 'agradecimento' })}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className={`w-5 h-5 ${formData.tipo === 'agradecimento' ? 'text-green-600' : 'text-gray-400 dark:text-gray-500'}`} />
                            <span className="font-semibold dark:text-white">Agradecimento</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Agradeça por uma bênção recebida</p>
                        </div>
                        <div
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                            formData.tipo === 'testemunho'
                              ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                          }`}
                          onClick={() => setFormData({ ...formData, tipo: 'testemunho' })}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className={`w-5 h-5 ${formData.tipo === 'testemunho' ? 'text-purple-600' : 'text-gray-400 dark:text-gray-500'}`} />
                            <span className="font-semibold dark:text-white">Testemunho</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Compartilhe como Deus agiu em sua vida</p>
                        </div>
                      </div>
                    </div>

                    {/* Informações Pessoais */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 dark:text-white">
                        <Users className="w-5 h-5 text-blue-600" />
                        Suas Informações
                      </h3>
                      {!googleUser ? (
                      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">Entrar com Google (mais rápido)</p>
                        <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={() => toast.error('Erro no login com Google')}
                          text="signin_with"
                          shape="rectangular"
                          width="100%"
                        />
                        <p className="text-xs text-gray-500 mt-2">Preenche nome e email automaticamente</p>
                      </div>
                    ) : (
                      <div className="mb-4 flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <img src={googleUser.picture} alt="" className="w-8 h-8 rounded-full" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-700 dark:text-green-300">{googleUser.name}</p>
                          <p className="text-xs text-green-600 dark:text-green-400">{googleUser.email}</p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => { setGoogleUser(null); setFormData(prev => ({ ...prev, nome: '', email: '' })); }} className="text-gray-500">
                          Trocar
                        </Button>
                      </div>
                    )}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                            Nome Completo *
                          </label>
                          <Input
                            required
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                            placeholder="Seu nome"
                            className="h-12 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                            Email (opcional)
                          </label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="seu@email.com"
                            className="h-12 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tema do Pedido */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 dark:text-white">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        Tema
                      </h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                          Selecione o Tema *
                        </label>
                        <Select
                          value={formData.tema}
                          onValueChange={(value) => setFormData({ ...formData, tema: value })}
                        >
                          <SelectTrigger className="h-12 dark:bg-gray-700 dark:text-white dark:border-gray-600">
                            <SelectValue placeholder="Selecione um tema" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                            {temasDisponiveis.map((tema) => (
                              <SelectItem key={tema} value={tema} className="dark:text-white dark:focus:bg-gray-700">
                                {tema}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                          Descrição (opcional)
                        </label>
                        <Textarea
                          value={formData.oracao}
                          onChange={(e) => setFormData({ ...formData, oracao: e.target.value })}
                          placeholder="Descreva seu pedido, agradecimento ou testemunho..."
                          rows={6}
                          className="resize-none dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                        <p className="text-xs text-gray-500 mt-2 dark:text-gray-400">
                          {formData.oracao.length} caracteres
                        </p>
                      </div>
                    </div>

                    {/* LGPD */}
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                      <input
                        type="checkbox"
                        id="lgpd"
                        checked={formData.lgpd}
                        onChange={(e) => setFormData({ ...formData, lgpd: e.target.checked })}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
                      />
                      <label htmlFor="lgpd" className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">Concordo com a Política de Privacidade</span>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          Meus dados serão utilizados apenas para fins de oração e contato pela equipe da igreja, 
                          conforme nossa Política de Privacidade.
                        </p>
                      </label>
                    </div>

                    {/* Botão de Envio */}
                    <Button
                      type="submit"
                      disabled={loading || !formData.lgpd}
                      className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed dark:from-blue-700 dark:to-purple-700"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Enviar {formData.tipo === 'pedido' ? 'Pedido de Oração' : formData.tipo === 'agradecimento' ? 'Agradecimento' : 'Testemunho'}
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1 dark:text-gray-400">
                      <Shield className="w-3 h-3" />
                      Seus dados estão seguros e serão usados apenas para oração (100% privado)
                    </p>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Footer Padrão */}
      <ChurchFooter church={church} churchSlug={slug} />
    </div>
  );
}
