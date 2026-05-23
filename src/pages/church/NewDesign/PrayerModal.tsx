import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import MyIcon from "./MyIcon";
import { motion, AnimatePresence } from "motion/react";
import { PrayerRequest } from "../types";
import { toast } from "sonner";
import { buildApiUrl } from "@/lib/config";
import { GoogleLogin } from '@react-oauth/google';
import { Lock, Mail, CheckCircle, UserPlus, ArrowLeft, Loader2, KeyRound, Heart } from "lucide-react";

interface PrayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPrayer: (prayer: Omit<PrayerRequest, "id" | "createdAt" | "status">) => void;
  churchSlug?: string;
  churchName?: string;
  churchId?: number;
}

// Temas disponíveis para oração
const temas = [
  "Salvação", "Saúde/Cura", "Finanças/Provisão", "Família/Casamento",
  "Libertação", "Livramento", "Trabalho/Estudos", "Direcionamento",
  "Restauração Emocional", "Crescimento Espiritual", "Nação",
  "Missões", "Igreja", "Relacionamentos", "Outros",
];

type AuthStep = 'login' | 'otp' | 'register';

export default function PrayerModal({ isOpen, onClose, onSubmitPrayer, churchName, churchSlug, churchId }: PrayerModalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStep, setAuthStep] = useState<AuthStep>('login');

  // Auth states
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpError, setOtpError] = useState("");
  const [pin, setPin] = useState("");

  // Register states
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regErrors, setRegErrors] = useState<{ phone?: string; email?: string }>({});
  const [isRegistering, setIsRegistering] = useState(false);

  // Prayer form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [categoria, setCategoria] = useState("pedido");
  const [tema, setTema] = useState("");
  const [request, setRequest] = useState("");
  const [lgpd, setLgpd] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeSlug = churchSlug || "";

  // Check auth on open
  useEffect(() => {
    if (isOpen) {
      checkAuth();
    }
  }, [isOpen]);

  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  const checkAuth = () => {
    try {
      const memberSession = localStorage.getItem('memberLiveSession');
      if (memberSession) {
        const session = JSON.parse(memberSession);
        if (session.church?.slug === activeSlug && (!session.expires_at || new Date(session.expires_at) > new Date())) {
          setIsAuthenticated(true);
          const member = session.member;
          if (member) {
            setName(member.name || "");
            setPhone(member.phone || "");
            if (member.email) setEmail(member.email);
          }
          return;
        }
      }

      const otpSession = localStorage.getItem('otpLiveSession');
      if (otpSession) {
        const session = JSON.parse(otpSession);
        if (session.church?.slug === activeSlug && new Date(session.expires_at) > new Date()) {
          setIsAuthenticated(true);
          if (session.member?.email) setEmail(session.member.email);
          return;
        }
      }
    } catch (e) {}
    setIsAuthenticated(false);
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
        setEmail(data.data.member.email || "");
      } else {
        setOtpError(data.error || 'Codigo invalido');
        toast.error(data.error || 'Codigo invalido');
        if (data.expired) setOtpCode('');
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
      await quickRegister(data.sub, data.name, data.email);
    } catch (error) {
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
      if (!regPhone.trim()) newErrors.phone = 'O WhatsApp e obrigatorio';
      else if (phoneDigits.length < 10) newErrors.phone = 'Numero incompleto (minimo 10 digitos)';
    }

    if (finalEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalEmail.trim())) {
      newErrors.email = 'E-mail invalido';
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
        setName(finalName);
        setPhone(phoneDigits);
        if (finalEmail) setEmail(finalEmail);
      } else { toast.error(data.error || 'Erro ao cadastrar'); }
    } catch (error) { toast.error('Erro ao cadastrar'); }
    finally { setIsRegistering(false); }
  };

  const handlePrayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!request.trim() || request.trim().length < 10) {
      setError("A oração deve ter pelo menos 10 caracteres");
      return;
    }
    if (request.length > 500) {
      setError("A oração não pode exceder 500 caracteres");
      return;
    }
    if (!lgpd) {
      setError("É necessário concordar com a política de privacidade");
      return;
    }

    setIsSubmitting(true);
    onSubmitPrayer({
      name: name.trim() || "Anônimo",
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      request: `${categoria === 'pedido' ? '[Pedido]' : categoria === 'agradecimento' ? '[Agradecimento]' : '[Testemunho]'} ${tema ? `| ${tema}` : ''}\n${request}`,
    });

    setSubmitted(true);
    setTimeout(() => {
      setName("");
      setPhone("");
      setCategoria("pedido");
      setTema("");
      setRequest("");
      setLgpd(false);
      setSubmitted(false);
      setError("");
      setIsSubmitting(false);
      onClose();
    }, 3500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-10"
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-purple-500 to-amber-500 rounded-t-2xl" />

            <div className="p-6 md:p-8">
              <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer p-1">
                <MyIcon name="X" size={20} />
              </button>

              {!isAuthenticated ? (
                /* Auth Flow */
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400">
                      <Lock size={28} />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                        Identifique-se
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Faça login ou cadastre-se para enviar seu pedido de oração
                      </p>
                    </div>
                  </div>

                  {/* LOGIN */}
                  {authStep === 'login' && (
                    <div className="space-y-4">
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

                      <div className="space-y-3">
                        <h3 className="text-white font-medium flex items-center gap-2">
                          <Mail className="w-4 h-4 text-red-400" /> Acessar com Email
                        </h3>
                        <p className="text-xs text-slate-400">Receba um código de 6 dígitos no seu email</p>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                          onKeyDown={(e) => e.key === 'Enter' && requestOtp()}
                        />
                        {otpError && <p className="text-xs text-red-400">{otpError}</p>}
                        <Button onClick={requestOtp} disabled={isSendingOtp || !email} className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white">
                          {isSendingOtp ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</> : <><Mail className="w-4 h-4 mr-2" />Receber Código</>}
                        </Button>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-700"></div>
                        <span className="text-slate-500 text-sm">ou</span>
                        <div className="flex-1 h-px bg-slate-700"></div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-white font-medium flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-blue-400" /> Já tem seu código?
                        </h3>
                        <Input type="text" maxLength={6} placeholder="000000" value={pin}
                          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="bg-slate-700/50 border-slate-600 text-white text-center text-2xl tracking-widest"
                          onKeyDown={(e) => e.key === 'Enter' && verifyPin()} />
                        <Button onClick={verifyPin} disabled={isVerifyingOtp || pin.length !== 6} className="w-full bg-slate-700 hover:bg-slate-600 text-white">
                          {isVerifyingOtp ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verificando...</> : <><CheckCircle className="w-4 h-4 mr-2" />Acessar</>}
                        </Button>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-700"></div>
                        <span className="text-slate-500 text-sm">ou</span>
                        <div className="flex-1 h-px bg-slate-700"></div>
                      </div>

                      <Button onClick={() => setAuthStep('register')} variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                        <UserPlus className="w-4 h-4 mr-2" /> Cadastre-se Rapidamente
                      </Button>
                    </div>
                  )}

                  {/* OTP */}
                  {authStep === 'otp' && (
                    <div className="space-y-4">
                      <Button variant="ghost" size="sm" onClick={() => setAuthStep('login')} className="text-slate-400 p-0 h-auto hover:text-white">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                      </Button>
                      <div className="bg-green-900/30 border border-green-800 rounded-lg p-3">
                        <p className="text-sm text-green-300 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Código enviado para <strong>{email}</strong>
                        </p>
                        {otpCountdown > 0 && (
                          <p className="text-xs text-green-400 mt-1">Expira em {Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, '0')}</p>
                        )}
                      </div>
                      <Input type="text" maxLength={6} placeholder="000000" value={otpCode}
                        onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setOtpError(''); }}
                        className="bg-slate-700/50 border-slate-600 text-white text-center text-3xl tracking-widest"
                        onKeyDown={(e) => e.key === 'Enter' && verifyOtp()} />
                      {otpError && <p className="text-xs text-red-400">{otpError}</p>}
                      <Button onClick={verifyOtp} disabled={isVerifyingOtp || otpCode.length !== 6} className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white">
                        {isVerifyingOtp ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verificando...</> : <><CheckCircle className="w-4 h-4 mr-2" />Acessar</>}
                      </Button>
                    </div>
                  )}

                  {/* REGISTER */}
                  {authStep === 'register' && (
                    <div className="space-y-4">
                      <Button variant="ghost" size="sm" onClick={() => setAuthStep('login')} className="text-slate-400 p-0 h-auto hover:text-white">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                      </Button>
                      <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-3">
                        <p className="text-sm text-blue-300 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-400" /> Cadastro gratuito • Acesso imediato
                        </p>
                      </div>
                      <div>
                        <label className="text-slate-300 text-xs">Nome Completo *</label>
                        <Input value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Seu nome completo" className="bg-slate-700/50 border-slate-600 text-white mt-1" />
                      </div>
                      <div>
                        <label className="text-slate-300 text-xs">WhatsApp *</label>
                        <Input value={regPhone} onChange={(e) => { setRegPhone(applyPhoneMask(e.target.value)); setRegErrors(p => ({ ...p, phone: undefined })); }}
                          placeholder="(92) 99999-9999"
                          className={`bg-slate-700/50 border-slate-600 text-white mt-1 ${regErrors.phone ? 'border-red-500' : ''}`} />
                        {regErrors.phone && <p className="text-xs text-red-400 mt-1">{regErrors.phone}</p>}
                      </div>
                      <div>
                        <label className="text-slate-300 text-xs">Email (opcional)</label>
                        <Input type="email" value={regEmail} onChange={(e) => { setRegEmail(e.target.value); setRegErrors(p => ({ ...p, email: undefined })); }}
                          placeholder="seu@email.com" className={`bg-slate-700/50 border-slate-600 text-white mt-1 ${regErrors.email ? 'border-red-500' : ''}`} />
                        {regErrors.email && <p className="text-xs text-red-400 mt-1">{regErrors.email}</p>}
                      </div>
                      <Button onClick={() => quickRegister()} disabled={isRegistering} className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                        {isRegistering ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Cadastrando...</> : <><UserPlus className="w-4 h-4 mr-2" />Cadastrar e Acessar</>}
                      </Button>
                    </div>
                  )}
                </div>
              ) : submitted ? (
                /* Success State */
                <div className="text-center py-10 space-y-5">
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 bg-green-50 dark:bg-green-950/50 text-green-500 rounded-full flex items-center justify-center mx-auto">
                    <MyIcon name="CheckCircle" size={44} />
                  </motion.div>
                  <h4 className="font-heading text-xl font-bold text-slate-900 dark:text-white mb-2">Pedido Enviado!</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Deus abençoe sua vida. Nossa equipe de intercessão já recebeu seu pedido e está orando por você.
                  </p>
                  <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-lg p-3 max-w-xs mx-auto">
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 italic">"Porque o Senhor é o nosso refúgio e fortaleza, socorro bem presente na angústia."</p>
                    <p className="text-[10px] text-indigo-500 mt-1 font-semibold">📖 Salmos 46:1</p>
                  </div>
                  <p className="text-xs text-slate-400">Fechando automaticamente...</p>
                </div>
              ) : (
                /* Prayer Form */
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                      <Heart size={28} />
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                        Pedido de Oração
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {churchName || 'Nossa'} equipe está orando por você
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handlePrayerSubmit} className="space-y-5">
                    {/* Dados Pessoais */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">1</span>
                        Seus Dados
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Nome</label>
                          <Input placeholder="Como deseja ser chamado" value={name} onChange={(e) => setName(e.target.value)} className="w-full" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">E-mail</label>
                          <Input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full" />
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-800" />

                    {/* Detalhes do Pedido */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">2</span>
                        Detalhes da Oração
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Categoria</label>
                          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
                            className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="pedido">Pedido de Oração</option>
                            <option value="agradecimento">Agradecimento</option>
                            <option value="testemunho">Testemunho</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Tema</label>
                          <select value={tema} onChange={(e) => setTema(e.target.value)}
                            className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">Selecione o tema</option>
                            {temas.map((t) => (<option key={t} value={t}>{t}</option>))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Sua Oração *</label>
                        <Textarea required rows={4} placeholder="Descreva seu pedido, agradecimento ou testemunho aqui..."
                          value={request} onChange={(e) => setRequest(e.target.value.slice(0, 500))} className="w-full resize-none" />
                        <p className={`text-[10px] text-right mt-1 ${request.length > 450 ? 'text-amber-500' : 'text-slate-400'}`}>{request.length}/500</p>
                      </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-800" />

                    {/* LGPD */}
                    <div className="flex items-start gap-3 p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                      <input type="checkbox" id="lgpd-prayer" checked={lgpd} onChange={(e) => setLgpd(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                      <label htmlFor="lgpd-prayer" className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                        <span className="font-semibold">Li e concordo com a política de privacidade.</span>{" "}
                        Autorizo o uso dos meus dados para fins de intercessão pela equipe da igreja. *
                      </label>
                    </div>

                    {error && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <MyIcon name="AlertCircle" size={14} /> {error}
                      </p>
                    )}

                    <div className="flex gap-3 pt-2">
                      <Button type="button" variant="ghost" onClick={onClose} className="flex-1 cursor-pointer">Cancelar</Button>
                      <Button type="submit" variant="accent" disabled={isSubmitting} className="flex-[2] cursor-pointer gap-2">
                        {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</> : <><MyIcon name="Send" size={16} /> Enviar Oração 🙏</>}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
