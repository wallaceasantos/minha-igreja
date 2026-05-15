/**
 * LiveAuthGate - Gate de Autenticação para Transmissões ao Vivo
 * ============================================================
 * Fluxo:
 * 1. Google Sign-In (mais fácil)
 * 2. PIN de acesso
 * 3. Cadastro rápido
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/config';
import { GoogleLogin } from '@react-oauth/google';
console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
import { Church, Lock, MessageCircle, Smartphone, CheckCircle, UserPlus, Mail } from 'lucide-react';

interface LiveAuthGateProps {
  children: React.ReactNode;
  churchSlug: string;
}

export default function LiveAuthGate({ children, churchSlug }: LiveAuthGateProps) {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [churchName, setChurchName] = useState('');
  const [churchId, setChurchId] = useState<number | null>(null);
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regErrors, setRegErrors] = useState<{ phone?: string; email?: string }>({});
  const [isRegistering, setIsRegistering] = useState(false);

  // Helper: Mascara de telefone (92) 99999-9999
  const applyPhoneMask = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  };

  useEffect(() => {
    checkAuth();
    loadChurchInfo();
  }, [slug, churchSlug]);

  const activeSlug = slug || churchSlug;

  const loadChurchInfo = async () => {
    try {
      const res = await fetch(buildApiUrl(`/api/church/slug/${activeSlug}`));
      const data = await res.json();
      if (data.success) {
        setChurchName(data.data.name);
        setChurchId(data.data.id);
      }
    } catch (error) { console.error('Error loading church:', error); }
  };

  const checkAuth = async () => {
    try {
      const memberSession = localStorage.getItem('memberLiveSession');
      if (memberSession) {
        const session = JSON.parse(memberSession);
        if (session.church?.slug === activeSlug && (!session.expires_at || new Date(session.expires_at) > new Date())) {
          setIsAuthenticated(true);
          setIsChecking(false);
          return;
        } else { localStorage.removeItem('memberLiveSession'); }
      }
      setIsAuthenticated(false);
      setShowRegister(false);
      setIsChecking(false);
    } catch (error) {
      setIsAuthenticated(false);
      setShowRegister(false);
      setIsChecking(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      const data = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      setRegName(data.name);
      setRegEmail(data.email);
      await quickRegister(data.sub);
    } catch (error) { toast.error('Erro no login com Google'); }
  };

  const verifyPin = async () => {
    if (!pin || pin.length !== 6) { toast.error('Digite um PIN de 6 dígitos'); return; }
    if (!churchId) { toast.error('Erro ao carregar dados da igreja'); return; }
    try {
      setIsVerifying(true);
      const response = await fetch(buildApiUrl('/api/member/live/verify'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ church_id: churchId, pin }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('memberLiveSession', JSON.stringify(data.data));
        toast.success('Acesso liberado!');
        setIsAuthenticated(true);
        setShowRegister(false);
      } else { toast.error(data.error || 'PIN inválido'); setPin(''); }
    } catch (error) { toast.error('Erro ao verificar PIN'); }
    finally { setIsVerifying(false); }
  };

  const quickRegister = async (googleId?: string) => {
    // Validação de campos
    const newErrors: { phone?: string; email?: string } = {};
    const phoneDigits = regPhone.replace(/\D/g, '');

    // Validação WhatsApp
    if (!googleId) {
      if (!regPhone.trim()) {
        newErrors.phone = 'O WhatsApp é obrigatório';
      } else if (phoneDigits.length < 10) {
        newErrors.phone = 'Número incompleto (mínimo 10 dígitos)';
      }
    }

    // Validação Email
    if (regEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(regEmail.trim())) {
        newErrors.email = 'E-mail inválido';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setRegErrors(newErrors);
      toast.error('Verifique os dados informados');
      return;
    }
    setRegErrors({}); // Limpa erros se estiver tudo certo

    if (!churchId) { toast.error('Erro ao carregar igreja'); return; }
    try {
      setIsRegistering(true);
      const response = await fetch(buildApiUrl('/api/member/live/quick-register'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          church_id: churchId, name: regName, phone: phoneDigits,
          email: regEmail.trim() || null, source: googleId ? 'google' : 'quick_register',
        }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('memberLiveSession', JSON.stringify(data.data));
        toast.success(googleId ? `Bem-vindo(a), ${regName}! Acesso liberado!` : `Bem-vindo(a)! Seu PIN é ${data.data.pin}. Acesso liberado!`);
        setIsAuthenticated(true);
        setShowRegister(false);
      } else { toast.error(data.error || 'Erro ao cadastrar'); }
    } catch (error) { toast.error('Erro ao cadastrar'); }
    finally { setIsRegistering(false); }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-lg">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-gray-800 border-gray-700">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl text-white">Transmissão ao Vivo</CardTitle>
            <CardDescription className="text-gray-400 mt-2">{churchName || 'Igreja'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showRegister ? (
              <>
                {/* Google Sign-In */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-300 text-center">Entrar com Google (mais fácil)</p>
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => toast.error('Erro no login com Google')}
                    text="continue_with"
                    shape="rectangular"
                    theme="outline"
                    width="400"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-700"></div>
                  <span className="text-gray-500 text-sm">ou</span>
                  <div className="flex-1 h-px bg-gray-700"></div>
                </div>

                {/* PIN Input */}
                <div className="space-y-3">
                  <h3 className="text-white font-medium flex items-center gap-2"><Smartphone className="w-4 h-4" /> Já tem seu código?</h3>
                  <Input id="pin" type="text" maxLength={6} placeholder="000000" value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="bg-gray-700 border-gray-600 text-white text-center text-2xl tracking-widest"
                    onKeyDown={(e) => e.key === 'Enter' && verifyPin()} />
                  <Button onClick={verifyPin} disabled={isVerifying || pin.length !== 6} className="w-full gap-2 bg-primary hover:bg-primary/90">
                    {isVerifying ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>Verificando...</> : <><CheckCircle className="w-4 h-4" />Acessar Live</>}
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-700"></div>
                  <span className="text-gray-500 text-sm">ou</span>
                  <div className="flex-1 h-px bg-gray-700"></div>
                </div>

                {/* Cadastro Rápido */}
                <Button onClick={() => setShowRegister(true)} variant="outline" className="w-full gap-2 border-gray-600 text-gray-300 hover:bg-gray-700">
                  <UserPlus className="w-4 h-4" />Cadastre-se Rapidamente
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Precisa do seu código? Peça ao líder da igreja via{' '}
                  <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Olá! Gostaria de receber meu código para assistir a live da ${churchName}.`)}`, '_blank')} className="text-primary hover:underline">
                    WhatsApp
                  </button>
                </p>
              </>
            ) : (
              /* Formulário de Cadastro Rápido */
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowRegister(false)} className="text-gray-400 p-0 h-auto">← Voltar</Button>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-sm text-gray-300 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />Cadastro gratuito • Acesso imediato • Sem senha</p>
                </div>
                <div>
                  <Label className="text-gray-300">Nome Completo *</Label>
                  <Input value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Seu nome completo" className="bg-gray-700 border-gray-600 text-white mt-1" />
                </div>
                <div>
                  <Label className="text-gray-300">WhatsApp *</Label>
                  <Input 
                    value={regPhone} 
                    onChange={(e) => { setRegPhone(applyPhoneMask(e.target.value)); setRegErrors(prev => ({ ...prev, phone: undefined })); }} 
                    placeholder="(92) 99999-9999" 
                    className={`bg-gray-700 text-white mt-1 ${regErrors.phone ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-600'}`} 
                  />
                  {regErrors.phone ? (
                    <p className="text-xs text-red-400 mt-1">{regErrors.phone}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">Para receber atualizações da igreja</p>
                  )}
                </div>
                <div>
                  <Label className="text-gray-300">Email (opcional)</Label>
                  <Input 
                    type="email" 
                    value={regEmail} 
                    onChange={(e) => { setRegEmail(e.target.value); setRegErrors(prev => ({ ...prev, email: undefined })); }} 
                    placeholder="seu@email.com" 
                    className={`bg-gray-700 text-white mt-1 ${regErrors.email ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-600'}`} 
                  />
                  {regErrors.email && <p className="text-xs text-red-400 mt-1">{regErrors.email}</p>}
                </div>
                <Button onClick={() => quickRegister()} disabled={isRegistering} className="w-full gap-2 bg-green-600 hover:bg-green-700">
                  {isRegistering ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>Cadastrando...</> : <><UserPlus className="w-4 h-4" />Cadastrar e Acessar Live</>}
                </Button>
                <p className="text-xs text-gray-500 text-center">Ao cadastrar, você concorda em receber comunicações da igreja.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
