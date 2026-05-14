/**
 * PrayerFormIdentity - Identificação Inteligente para Pedidos de Oração
 * =====================================================================
 * 
 * Fluxo:
 * 1. Usuário clica "Fazer Pedido"
 * 2. Tela: Entrar com Google OU preencher email
 * 3. Backend verifica se pessoa existe
 * 4. Mensagem personalizada:
 *    - Membro ativo: "Olá Maria! Que bom ter você aqui!"
 *    - Membro afastado: "Maria, que alegria ter você de volta! ❤️"
 *    - Novo visitante: "Bem-vindo(a)! Fique à vontade."
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, User, Smartphone, CheckCircle, Heart, Sparkles } from 'lucide-react';
import { buildApiUrl } from '@/lib/config';

interface PrayerFormIdentityProps {
  churchId: number;
  churchSlug: string;
  churchName: string;
  onIdentified: (data: {
    memberId: number | null;
    name: string;
    email: string;
    phone: string;
    googleId: string | null;
    message: string;
    messageType: 'active' | 'returning' | 'new';
    pin?: string;
  }) => void;
}

export default function PrayerFormIdentity({ churchId, churchName, onIdentified }: PrayerFormIdentityProps) {
  const [step, setStep] = useState<'choose' | 'manual' | 'loading'>('choose');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isIdentifying, setIsIdentifying] = useState(false);

  const identifyPerson = async (googleId?: string) => {
    if (!email && !name && !googleId) {
      toast.error('Preencha pelo menos seu email ou nome');
      return;
    }
    try {
      setIsIdentifying(true);
      const response = await fetch(buildApiUrl('/api/pedidos/identify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ church_id: churchId, email, name, google_id: googleId }),
      });
      const data = await response.json();
      if (data.success) {
        const d = data.data;
        onIdentified({
          memberId: d.member?.id || null,
          name: d.member?.name || name,
          email: d.member?.email || email,
          phone: d.member?.phone || phone,
          googleId: googleId || null,
          message: d.message,
          messageType: d.messageType,
        });
        toast.success(d.message);
      }
    } catch (error) { toast.error('Erro ao identificar'); }
    finally { setIsIdentifying(false); }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    // Decodificar JWT do Google
    const data = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
    setName(data.name);
    setEmail(data.email);
    await identifyPerson(data.sub); // Google ID
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await identifyPerson();
  };

  if (step === 'loading') {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Verificando...</p>
      </div>
    );
  }

  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
          <Heart className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-lg">Faça seu Pedido de Oração</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          {churchName} está orando por você 🙏
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {step === 'choose' && (
          <>
            {/* Google Sign-In */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">Entrar com Google (mais fácil)</p>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Erro no login com Google')}
                text="signin_with"
                shape="rectangular"
                width="100%"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
              <span className="text-xs text-muted-foreground">ou</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            </div>

            {/* Manual Input */}
            <Button onClick={() => setStep('manual')} variant="outline" className="w-full gap-2">
              <Mail className="w-4 h-4" />Preencher Manualmente
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Seu pedido é confidencial e será orado pela equipe pastoral.
            </p>
          </>
        )}

        {step === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setStep('choose')} className="p-0 h-auto">
              ← Voltar
            </Button>

            <div>
              <Label className="flex items-center gap-2"><User className="w-3 h-3" /> Nome *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" className="mt-1" />
            </div>

            <div>
              <Label className="flex items-center gap-2"><Mail className="w-3 h-3" /> Email (opcional)</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">Para reconhecer você nas próximas vezes</p>
            </div>

            <div>
              <Label className="flex items-center gap-2"><Smartphone className="w-3 h-3" /> WhatsApp (opcional)</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} placeholder="(92) 99999-9999" className="mt-1" />
            </div>

            <Button type="submit" disabled={isIdentifying || !name.trim()} className="w-full gap-2">
              {isIdentifying ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>Verificando...</> : <><CheckCircle className="w-4 h-4" />Continuar</>}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
