/**
 * LiveAuthGate - Gate de Autenticacao para Transmissoes ao Vivo
 * ============================================================
 * Fluxo OTP por Email:
 * 1. Membro digita email
 * 2. Recebe codigo OTP de 6 digitos
 * 3. Digita codigo -> Acesso liberado (sessao 30 dias)
 *
 * Tambem suporta:
 * - Google Sign-In
 * - Cadastro rapido com PIN
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
import { Church, Lock, Mail, CheckCircle, UserPlus, ArrowLeft, Loader2, KeyRound } from 'lucide-react';

interface LiveAuthGateProps {
  children: React.ReactNode;
  churchSlug: string;
}

type AuthStep = 'email' | 'otp' | 'register';

export default function LiveAuthGate({ children, churchSlug }: LiveAuthGateProps) {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [churchName, setChurchName] = useState('');
  const [churchId, setChurchId] = useState<number | null>(null);

  // OTP Flow
  const [authStep, setAuthStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpError, setOtpError] = useState('');

  // PIN (legacy support)
  const [pin, setPin] = useState('');

  // Register Flow (legacy)
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

  // Countdown timer para OTP
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

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

      // Verificar sessao OTP
      const otpSession = localStorage.getItem('otpLiveSession');
      if (otpSession) {
        const session = JSON.parse(otpSession);
        if (session.church?.slug === activeSlug && new Date(session.expires_at) > new Date()) {
          // Verificar no backend se a sessao ainda e valida
          const res = await fetch(buildApiUrl('/api/live/otp/check-session'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_token: session.session_token, church_id: session.church.id }),
          });
          const data = await res.json();
          if (data.success && data.valid) {
            setIsAuthenticated(true);
            setIsChecking(false);
            return;
          } else {
            localStorage.removeItem('otpLiveSession');
          }
        } else {
          localStorage.removeItem('otpLiveSession');
        }
      }

      setIsAuthenticated(false);
      setIsChecking(false);
    } catch (error) {
      setIsAuthenticated(false);
      setIsChecking(false);
    }
  };

  // Solicitar OTP por email
  const requestOtp = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Digite um email valido');
      return;
    }
    if (!churchId) { toast.error('Erro ao carregar dados da igreja'); return; }

    try {
      setIsSendingOtp(true);
      setOtpError('');
      const response = await fetch(buildApiUrl('/api/live/otp/request'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ church_id: churchId, email }),
      });
      const data = await response.json();
      if (data.success) {
        setAuthStep('otp');
        setOtpCountdown(600); // 10 minutos
        toast.success('Codigo enviado por email!', { description: 'Verifique sua caixa de entrada' });
      } else {
        setOtpError(data.error || 'Erro ao enviar codigo');
        toast.error(data.error || 'Erro ao enviar codigo');
      }
    } catch (error) {
      toast.error('Erro ao solicitar codigo');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verificar codigo OTP
  const verifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Digite o codigo de 6 digitos');
      return;
    }
    if (!churchId) { toast.error('Erro ao carregar dados da igreja'); return; }

    try {
      setIsVerifyingOtp(true);
      setOtpError('');
      const response = await fetch(buildApiUrl('/api/live/otp/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ church_id: churchId, email, otp_code: otpCode }),
      });
      const data = await response.json();
      if (data.success) {
        // Salvar sessao OTP
        const sessionData = {
          session_token: data.data.session_token,
          expires_at: data.data.session_expires_at,
          church: data.data.church,
          member: { email: data.data.member.email },
        };
        localStorage.setItem('otpLiveSession', JSON.stringify(sessionData));
        toast.success('Acesso liberado!');
        setIsAuthenticated(true);
      } else {
        setOtpError(data.error || 'Codigo invalido');
        toast.error(data.error || 'Codigo invalido');
        if (data.expired) {
          setOtpCode('');
        }
      }
    } catch (error) {
      toast.error('Erro ao verificar codigo');
    } finally {
      setIsVerifyingOtp(false);
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
    if (!pin || pin.length !== 6) { toast.error('Digite um PIN de 6 digitos'); return; }
    if (!churchId) { toast.error('Erro ao carregar dados da igreja'); return; }
    try {
      setIsVerifyingOtp(true);
      const response = await fetch(buildApiUrl('/api/member/live/verify'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ church_id: churchId, pin }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('memberLiveSession', JSON.stringify(data.data));
        toast.success('Acesso liberado!');
        setIsAuthenticated(true);
      } else { toast.error(data.error || 'PIN invalido'); setPin(''); }
    } catch (error) { toast.error('Erro ao verificar PIN'); }
    finally { setIsVerifyingOtp(false); }
  };

  const quickRegister = async (googleId?: string) => {
    const newErrors: { phone?: string; email?: string } = {};
    const phoneDigits = regPhone.replace(/\D/g, '');

    if (!googleId) {
      if (!regPhone.trim()) {
        newErrors.phone = 'O WhatsApp e obrigatorio';
      } else if (phoneDigits.length < 10) {
        newErrors.phone = 'Numero incompleto (minimo 10 digitos)';
      }
    }

    if (regEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(regEmail.trim())) {
        newErrors.email = 'E-mail invalido';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setRegErrors(newErrors);
      toast.error('Verifique os dados informados');
      return;
    }
    setRegErrors({});

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
        toast.success(googleId ? `Bem-vindo(a), ${regName}!` : `Bem-vindo(a)!`);
        setIsAuthenticated(true);
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
            <CardTitle className="text-2xl text-white">Transmissao ao Vivo</CardTitle>
            <CardDescription className="text-gray-400 mt-2">{churchName || 'Igreja'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* ===== PASSO 1: Digitar Email ===== */}
            {authStep === 'email' && (
              <div className="space-y-4">
                {/* Google Sign-In */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-300 text-center">Entrar com Google (mais facil)</p>
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

                {/* Email Input para OTP */}
                <div className="space-y-3">
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Acessar com Email
                  </h3>
                  <p className="text-xs text-gray-400">Receba um codigo de 6 digitos no seu email</p>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    onKeyDown={(e) => e.key === 'Enter' && requestOtp()}
                  />
                  {otpError && <p className="text-xs text-red-400">{otpError}</p>}
                  <Button onClick={requestOtp} disabled={isSendingOtp || !email} className="w-full gap-2 bg-primary hover:bg-primary/90">
                    {isSendingOtp ? <><Loader2 className="w-4 h-4 animate-spin" />Enviando...</> : <><Mail className="w-4 h-4" />Receber Codigo</>}
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-700"></div>
                  <span className="text-gray-500 text-sm">ou</span>
                  <div className="flex-1 h-px bg-gray-700"></div>
                </div>

                {/* PIN (legacy) */}
                <div className="space-y-3">
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <KeyRound className="w-4 h-4" /> Ja tem seu codigo?
                  </h3>
                  <Input id="pin" type="text" maxLength={6} placeholder="000000" value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="bg-gray-700 border-gray-600 text-white text-center text-2xl tracking-widest"
                    onKeyDown={(e) => e.key === 'Enter' && verifyPin()} />
                  <Button onClick={verifyPin} disabled={isVerifyingOtp || pin.length !== 6} className="w-full gap-2 bg-gray-600 hover:bg-gray-700">
                    {isVerifyingOtp ? <><Loader2 className="w-4 h-4 animate-spin" />Verificando...</> : <><CheckCircle className="w-4 h-4" />Acessar Live</>}
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-700"></div>
                  <span className="text-gray-500 text-sm">ou</span>
                  <div className="flex-1 h-px bg-gray-700"></div>
                </div>

                {/* Cadastro Rapido */}
                <Button onClick={() => setAuthStep('register')} variant="outline" className="w-full gap-2 border-gray-600 text-gray-300 hover:bg-gray-700">
                  <UserPlus className="w-4 h-4" />Cadastre-se Rapidamente
                </Button>
              </div>
            )}

            {/* ===== PASSO 2: Digitar OTP ===== */}
            {authStep === 'otp' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Button variant="ghost" size="sm" onClick={() => setAuthStep('email')} className="text-gray-400 p-0 h-auto">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                  </Button>
                </div>

                <div className="bg-green-900/30 border border-green-800 rounded-lg p-3">
                  <p className="text-sm text-green-300 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Codigo enviado para <strong>{email}</strong>
                  </p>
                  {otpCountdown > 0 && (
                    <p className="text-xs text-green-400 mt-1">Expira em {Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, '0')}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-300">Codigo de 6 digitos</Label>
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpError(''); }}
                    className="bg-gray-700 border-gray-600 text-white text-center text-3xl tracking-widest"
                    onKeyDown={(e) => e.key === 'Enter' && verifyOtp()}
                  />
                  {otpError && <p className="text-xs text-red-400">{otpError}</p>}
                  <Button onClick={verifyOtp} disabled={isVerifyingOtp || otpCode.length !== 6} className="w-full gap-2 bg-primary hover:bg-primary/90">
                    {isVerifyingOtp ? <><Loader2 className="w-4 h-4 animate-spin" />Verificando...</> : <><CheckCircle className="w-4 h-4" />Acessar Live</>}
                  </Button>
                </div>

                {/* Reenviar codigo */}
                {otpCountdown > 0 && otpCountdown < 540 && (
                  <p className="text-xs text-gray-500 text-center">
                    Nao recebeu o codigo? Tente novamente em {Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, '0')}
                  </p>
                )}
                {otpCountdown <= 0 && (
                  <Button onClick={requestOtp} variant="outline" size="sm" className="w-full text-gray-400 border-gray-600">
                    Reenviar codigo
                  </Button>
                )}
              </div>
            )}

            {/* ===== CADASTRO RAPIDO ===== */}
            {authStep === 'register' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Button variant="ghost" size="sm" onClick={() => setAuthStep('email')} className="text-gray-400 p-0 h-auto">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                  </Button>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-sm text-gray-300 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />Cadastro gratuito • Acesso imediato</p>
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
                    <p className="text-xs text-gray-500 mt-1">Para receber atualizacoes da igreja</p>
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
                  {isRegistering ? <><Loader2 className="w-4 h-4 animate-spin" />Cadastrando...</> : <><UserPlus className="w-4 h-4" />Cadastrar e Acessar Live</>}
                </Button>
                <p className="text-xs text-gray-500 text-center">Ao cadastrar, voce concorda em receber comunicacoes da igreja.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
