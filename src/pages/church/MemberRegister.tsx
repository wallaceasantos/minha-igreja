/**
 * MemberRegister - Página de Cadastro de Membro
 * Permite que visitantes se cadastrem como membros da igreja
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/config';
import { GoogleLogin } from '@react-oauth/google';
import { 
  Church, UserPlus, ArrowLeft, CheckCircle, Loader2, 
  Heart, MessageCircle, Bell, Crown, Users 
} from 'lucide-react';

interface ChurchData {
  id: number;
  name: string;
  slug: string;
  logo_url?: string;
}

export default function MemberRegister() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [church, setChurch] = useState<ChurchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ phone?: string; email?: string }>({});

  useEffect(() => {
    loadChurchData();
  }, [slug]);

  const loadChurchData = async () => {
    try {
      const response = await fetch(buildApiUrl(`/api/church/slug/${slug}`));
      const data = await response.json();
      if (data.success) {
        setChurch(data.data);
      } else {
        toast.error('Igreja não encontrada');
      }
    } catch (error) {
      console.error('Erro ao carregar igreja:', error);
      toast.error('Erro ao carregar dados da igreja');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: { phone?: string; email?: string } = {};
    
    if (phone && !/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Telefone inválido. Use: (92) 99999-9999';
    }
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (googleId?: string, googleName?: string, googleEmail?: string) => {
    if (!church?.id) return;
    
    const finalName = googleName || name.trim();
    const finalEmail = googleEmail || email.trim();
    const finalPhone = phone.trim();

    if (!finalName) {
      toast.error('Por favor, informe seu nome');
      return;
    }

    if (!validateForm()) return;

    try {
      setIsRegistering(true);
      const response = await fetch(buildApiUrl('/api/member/live/quick-register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          church_id: church.id,
          church_slug: slug,
          name: finalName,
          phone: finalPhone || null,
          email: finalEmail || null,
          source: googleId ? 'google' : 'quick_register',
          google_id: googleId || null,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Salvar sessão
        localStorage.setItem('memberLiveSession', JSON.stringify({
          member: data.data.member,
          token: data.data.token,
          timestamp: Date.now(),
        }));
        
        toast.success('🎉 Cadastro realizado com sucesso!');
        
        // Redirecionar para a live
        setTimeout(() => {
          navigate(`/igreja/${slug}/ao-vivo`);
        }, 1500);
      } else {
        toast.error(data.error || 'Erro ao realizar cadastro');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast.error('Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse?.credential) {
      toast.error('Erro na autenticação com Google');
      return;
    }

    try {
      // Decodificar token JWT do Google
      const base64Url = credentialResponse.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const data = JSON.parse(jsonPayload);

      await handleRegister(data.sub, data.name, data.email);
    } catch (error) {
      console.error('Erro ao processar Google:', error);
      toast.error('Erro ao processar login do Google');
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
    setErrors(prev => ({ ...prev, phone: undefined }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(`/igreja/${slug}`)}
            className="text-slate-400 hover:text-white gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          
          {church?.logo_url ? (
            <img 
              src={buildApiUrl(church.logo_url)} 
              alt={church.name}
              className="h-8 object-contain"
            />
          ) : (
            <div className="flex items-center gap-2">
              <Church className="w-5 h-5 text-amber-400" />
              <span className="text-white font-medium">{church?.name || 'Igreja'}</span>
            </div>
          )}
          
          <div className="w-20" /> {/* Spacer */}
        </div>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-sm overflow-hidden">
            {/* Header do Card */}
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-6 text-center border-b border-slate-700/50">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-4 shadow-lg shadow-amber-500/30"
              >
                <UserPlus className="w-8 h-8 text-white" />
              </motion.div>
              
              <h1 className="text-2xl font-bold text-white mb-2">
                Torne-se um Membro
              </h1>
              <p className="text-slate-300 text-sm">
                Faça parte da comunidade <span className="text-amber-400 font-medium">{church?.name}</span>
              </p>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Benefícios */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <MessageCircle className="w-4 h-4 text-blue-400" />
                  <span>Chat ao vivo</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Heart className="w-4 h-4 text-pink-400" />
                  <span>Orações prioritárias</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span>Notificações</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Crown className="w-4 h-4 text-purple-400" />
                  <span>Conteúdo exclusivo</span>
                </div>
              </div>

              {/* Separador */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-slate-900 text-slate-500">Cadastro rápido</span>
                </div>
              </div>

              {/* Google Login */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Erro no login com Google')}
                  useOneTap={false}
                  theme="filled_black"
                  size="large"
                  text="signup_with"
                  shape="pill"
                />
              </div>

              {/* Separador */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-slate-900 text-slate-500">ou</span>
                </div>
              </div>

              {/* Formulário */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-slate-300">
                    Nome Completo <span className="text-amber-400">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    disabled={isRegistering}
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-slate-300">
                    WhatsApp
                  </Label>
                  <Input
                    id="phone"
                    placeholder="(92) 99999-9999"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="mt-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    disabled={isRegistering}
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-slate-300">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors(prev => ({ ...prev, email: undefined }));
                    }}
                    className="mt-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    disabled={isRegistering}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Botão de Cadastro */}
              <Button
                onClick={() => handleRegister()}
                disabled={isRegistering || !name.trim()}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold h-12"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Cadastrar Gratuitamente
                  </>
                )}
              </Button>

              {/* Info */}
              <p className="text-center text-xs text-slate-500">
                Ao se cadastrar, você concorda com nossos{' '}
                <a href="/termos-de-uso" target="_blank" className="text-amber-400 hover:underline">
                  Termos de Uso
                </a>
                {' '}e{' '}
                <a href="/politica-privacidade" target="_blank" className="text-amber-400 hover:underline">
                  Política de Privacidade
                </a>
              </p>

              {/* Já tem cadastro? */}
              <div className="text-center pt-4 border-t border-slate-800">
                <p className="text-slate-400 text-sm mb-2">Já é membro?</p>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/igreja/${slug}/ao-vivo`)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Entrar na Transmissão
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
