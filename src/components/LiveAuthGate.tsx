/**
 * LiveAuthGate - Gate de Autenticação para Transmissões ao Vivo
 * ============================================================
 * Design Moderno e Responsivo
 * Fluxo OTP por Email, Google Sign-In e Cadastro Rápido
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
import { Church, Lock, Mail, CheckCircle, UserPlus, ArrowLeft, Loader2, KeyRound, Radio, Users, MapPin, Phone, MailIcon, Facebook, Instagram, Youtube } from 'lucide-react';

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
  const [churchInfo, setChurchInfo] = useState<any>(null);

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

  // Register Flow
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regErrors, setRegErrors] = useState<{ phone?: string; email?: string }>({});
  const [isRegistering, setIsRegistering] = useState(false);

  const activeSlug = slug || churchSlug;

  useEffect(() => {
    checkAuth();
    loadChurchInfo();
  }, [slug, churchSlug]);

  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  const loadChurchInfo = async () => {
    try {
      const res = await fetch(buildApiUrl(`/api/church/slug/${activeSlug}`));
      const data = await res.json();
      if (data.success) {
        setChurchName(data.data.name);
        setChurchId(data.data.id);
        setChurchInfo(data.data);
      }
    } catch (error) {
      console.error('Error loading church:', error);
    }
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
        } else {
          localStorage.removeItem('memberLiveSession');
        }
      }

      const otpSession = localStorage.getItem('otpLiveSession');
      if (otpSession) {
        const session = JSON.parse(otpSession);
        if (session.church?.slug === activeSlug && new Date(session.expires_at) > new Date()) {
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
        setOtpCountdown(600);
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
      const googleName = data.name;
      const googleEmail = data.email;
      const googleId = data.sub;

      if (!googleName) {
        toast.error('Não foi possível obter seu nome do Google');
        return;
      }

      setRegName(googleName);
      setRegEmail(googleEmail);
      await quickRegister(googleId, googleName, googleEmail);
    } catch (error) {
      console.error(error);
      toast.error('Erro no login com Google');
    }
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

  const applyPhoneMask = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  };

  const quickRegister = async (googleId?: string, overrideName?: string, overrideEmail?: string) => {
    const finalName = overrideName || regName;
    const finalEmail = overrideEmail || regEmail;
    const newErrors: { phone?: string; email?: string } = {};
    const phoneDigits = regPhone.replace(/\D/g, '');

    if (!googleId) {
      if (!regPhone.trim()) {
        newErrors.phone = 'O WhatsApp e obrigatorio';
      } else if (phoneDigits.length < 10) {
        newErrors.phone = 'Numero incompleto (minimo 10 digitos)';
      }
    }

    if (finalEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(finalEmail.trim())) {
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
          church_id: churchId, name: finalName, phone: phoneDigits,
          email: finalEmail.trim() || null, source: googleId ? 'google' : 'quick_register',
        }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('memberLiveSession', JSON.stringify(data.data));
        toast.success(googleId ? `Bem-vindo(a), ${finalName}!` : `Bem-vindo(a)!`);
        setIsAuthenticated(true);
      } else { toast.error(data.error || 'Erro ao cadastrar'); }
    } catch (error) { toast.error('Erro ao cadastrar'); }
    finally { setIsRegistering(false); }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-red-500/30 rounded-full animate-ping"></div>
            <div className="absolute inset-0 border-4 border-t-red-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <Radio className="absolute inset-0 m-auto h-6 w-6 text-red-500" />
          </div>
          <p className="text-lg font-medium">Verificando acesso...</p>
          <p className="text-sm text-slate-400 mt-1">Conectando à transmissão</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          
          {/* Card de Login */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-500/20">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Transmissão ao Vivo</CardTitle>
              <CardDescription className="text-slate-400 mt-2">
                Faça login para assistir à transmissão
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 px-6 pb-6">

                {/* PASSO 1: Email */}
                {authStep === 'email' && (
                  <div className="space-y-4">
                    {/* Google Sign-In */}
                    <div className="space-y-2">
                      <p className="text-sm text-slate-300 text-center">Entrar com Google (mais fácil)</p>
                      <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={() => toast.error('Erro no login com Google')}
                        text="continue_with"
                        shape="rectangular"
                        theme="outline"
                        width="100%"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-slate-700"></div>
                      <span className="text-slate-500 text-sm">ou</span>
                      <div className="flex-1 h-px bg-slate-700"></div>
                    </div>

                    {/* Email Input para OTP */}
                    <div className="space-y-3">
                      <h3 className="text-white font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4 text-red-400" /> Acessar com Email
                      </h3>
                      <p className="text-xs text-slate-400">Receba um código de 6 dígitos no seu email</p>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-red-500 focus:border-red-500"
                        onKeyDown={(e) => e.key === 'Enter' && requestOtp()}
                      />
                      {otpError && <p className="text-xs text-red-400">{otpError}</p>}
                      <Button 
                        onClick={requestOtp} 
                        disabled={isSendingOtp || !email} 
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/20"
                      >
                        {isSendingOtp ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</>
                        ) : (
                          <><Mail className="w-4 h-4 mr-2" />Receber Código</>
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-slate-700"></div>
                      <span className="text-slate-500 text-sm">ou</span>
                      <div className="flex-1 h-px bg-slate-700"></div>
                    </div>

                    {/* PIN */}
                    <div className="space-y-3">
                      <h3 className="text-white font-medium flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-blue-400" /> Já tem seu código?
                      </h3>
                      <Input 
                        id="pin" 
                        type="text" 
                        maxLength={6} 
                        placeholder="000000" 
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="bg-slate-700/50 border-slate-600 text-white text-center text-2xl tracking-widest placeholder:text-slate-500 focus:ring-blue-500 focus:border-blue-500"
                        onKeyDown={(e) => e.key === 'Enter' && verifyPin()} 
                      />
                      <Button 
                        onClick={verifyPin} 
                        disabled={isVerifyingOtp || pin.length !== 6} 
                        className="w-full bg-slate-700 hover:bg-slate-600 text-white"
                      >
                        {isVerifyingOtp ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verificando...</>
                        ) : (
                          <><CheckCircle className="w-4 h-4 mr-2" />Acessar Live</>
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-slate-700"></div>
                      <span className="text-slate-500 text-sm">ou</span>
                      <div className="flex-1 h-px bg-slate-700"></div>
                    </div>

                    {/* Cadastro Rápido */}
                    <Button 
                      onClick={() => setAuthStep('register')} 
                      variant="outline" 
                      className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                      <UserPlus className="w-4 h-4 mr-2" /> Cadastre-se Rapidamente
                    </Button>
                  </div>
                )}

                {/* PASSO 2: OTP */}
                {authStep === 'otp' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Button variant="ghost" size="sm" onClick={() => setAuthStep('email')} className="text-slate-400 p-0 h-auto hover:text-white">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                      </Button>
                    </div>

                    <div className="bg-green-900/30 border border-green-800 rounded-lg p-3">
                      <p className="text-sm text-green-300 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Código enviado para <strong>{email}</strong>
                      </p>
                      {otpCountdown > 0 && (
                        <p className="text-xs text-green-400 mt-1">Expira em {Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, '0')}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label className="text-slate-300">Código de 6 dígitos</Label>
                      <Input
                        id="otp"
                        type="text"
                        maxLength={6}
                        placeholder="000000"
                        value={otpCode}
                        onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpError(''); }}
                        className="bg-slate-700/50 border-slate-600 text-white text-center text-3xl tracking-widest placeholder:text-slate-500 focus:ring-red-500 focus:border-red-500"
                        onKeyDown={(e) => e.key === 'Enter' && verifyOtp()}
                      />
                      {otpError && <p className="text-xs text-red-400">{otpError}</p>}
                      <Button 
                        onClick={verifyOtp} 
                        disabled={isVerifyingOtp || otpCode.length !== 6} 
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/20"
                      >
                        {isVerifyingOtp ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verificando...</>
                        ) : (
                          <><CheckCircle className="w-4 h-4 mr-2" />Acessar Live</>
                        )}
                      </Button>
                    </div>

                    {otpCountdown > 0 && otpCountdown < 540 && (
                      <p className="text-xs text-slate-500 text-center">
                        Não recebeu o código? Tente novamente em {Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, '0')}
                      </p>
                    )}
                    {otpCountdown <= 0 && (
                      <Button onClick={requestOtp} variant="outline" size="sm" className="w-full text-slate-400 border-slate-600 hover:bg-slate-700 hover:text-white">
                        Reenviar código
                      </Button>
                    )}
                  </div>
                )}

                {/* CADASTRO RÁPIDO */}
                {authStep === 'register' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Button variant="ghost" size="sm" onClick={() => setAuthStep('email')} className="text-slate-400 p-0 h-auto hover:text-white">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                      </Button>
                    </div>
                    <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-3">
                      <p className="text-sm text-blue-300 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-400" /> Cadastro gratuito • Acesso imediato
                      </p>
                    </div>
                    <div>
                      <Label className="text-slate-300">Nome Completo *</Label>
                      <Input 
                        value={regName} 
                        onChange={(e) => setRegName(e.target.value)} 
                        placeholder="Seu nome completo" 
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-green-500 focus:border-green-500 mt-1" 
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">WhatsApp *</Label>
                      <Input
                        value={regPhone}
                        onChange={(e) => { setRegPhone(applyPhoneMask(e.target.value)); setRegErrors(prev => ({ ...prev, phone: undefined })); }}
                        placeholder="(92) 99999-9999"
                        className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-green-500 focus:border-green-500 mt-1 ${regErrors.phone ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                      />
                      {regErrors.phone ? (
                        <p className="text-xs text-red-400 mt-1">{regErrors.phone}</p>
                      ) : (
                        <p className="text-xs text-slate-500 mt-1">Para receber atualizações da igreja</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-slate-300">Email (opcional)</Label>
                      <Input
                        type="email"
                        value={regEmail}
                        onChange={(e) => { setRegEmail(e.target.value); setRegErrors(prev => ({ ...prev, email: undefined })); }}
                        placeholder="seu@email.com"
                        className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-green-500 focus:border-green-500 mt-1 ${regErrors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                      />
                      {regErrors.email && <p className="text-xs text-red-400 mt-1">{regErrors.email}</p>}
                    </div>
                    <Button 
                      onClick={() => quickRegister()} 
                      disabled={isRegistering} 
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/20"
                    >
                      {isRegistering ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Cadastrando...</>
                      ) : (
                        <><UserPlus className="w-4 h-4 mr-2" />Cadastrar e Acessar Live</>
                      )}
                    </Button>
                    <p className="text-xs text-slate-500 text-center">Ao cadastrar, você concorda em receber comunicações da igreja.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

  return <>{children}</>;
}
