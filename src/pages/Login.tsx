/**
 * Página: Login
 * Login para administradores da plataforma e igrejas
 */

import { useState } from 'react';
import { buildApiUrl } from '@/lib/config';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ModeToggle } from '@/components/mode-toggle';
import { HoverFooter } from '@/components/ui/hover-footer';
import heroBg from '@/assets/img_bkg.png';
import { toast } from 'sonner';
import { Church, Lock, Mail, Loader2, LogIn, Menu, X, Sparkles } from 'lucide-react';
import { useChurch } from '@/hooks/useChurch';
import { useIsMainDomain } from '@/hooks/useChurch';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { church } = useChurch();
  const isMainDomain = useIsMainDomain();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar se veio do cadastro
  const selectedPlan = location.state?.selectedPlan;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Chamar API de login
      const response = await fetch(buildApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Credenciais inválidas');
      }

      // Login bem-sucedido - salvar dados
      localStorage.setItem('isAdminAuthenticated', 'true');
      localStorage.setItem('adminEmail', formData.email);
      localStorage.setItem('userRole', result.data.user.role);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      localStorage.setItem('token', result.data.token);
      
      // Salvar churchId se existir (para pastores)
      if (result.data.user.church_id) {
        localStorage.setItem('churchId', String(result.data.user.church_id));
      }

      // Detectar se é super admin
      if (formData.email === 'admin@igreja-connect.com') {
        localStorage.setItem('userRole', 'super_admin');
      }

      // Login realizado
      toast.success('Login realizado com sucesso!', {
        description: 'Redirecionando para o painel...',
      });

      // Verificar se havia uma página salva para redirecionamento
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      localStorage.removeItem('redirectAfterLogin');

      // Redirecionar para o dashboard apropriado
      const userRole = localStorage.getItem('userRole');
      
      if (userRole === 'super_admin') {
        // Super admin sempre vai para o dashboard da plataforma
        navigate(redirectPath || '/super-admin/dashboard');
      } else if (isMainDomain) {
        // Login na plataforma (admin normal)
        navigate(redirectPath || '/admin/dashboard');
      } else {
        // Login na igreja (admin local) - vai para dashboard
        navigate(redirectPath || '/admin/dashboard');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login';
      setError(errorMessage);
      toast.error('Erro ao fazer login', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Fixo - Estilo Landing Page */}
      <header className="border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Church className="h-7 w-7 text-primary" />
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-amber-500 animate-pulse" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">MinhaIgreja</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 ml-auto">
            <a href="/#funcionalidades" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Funcionalidades
            </a>
            <a href="/#planos" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Planos
            </a>
            <a href="/#depoimentos" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Depoimentos
            </a>
            <Button variant="ghost" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <ModeToggle />
            <Button asChild className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-600/20">
              <Link to="/criar">Criar Minha Igreja</Link>
            </Button>
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden ml-auto">
            <ModeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-3">
              <a
                href="/#funcionalidades"
                className="text-sm font-medium py-2 px-3 rounded-md transition-colors hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                Funcionalidades
              </a>
              <a
                href="/#planos"
                className="text-sm font-medium py-2 px-3 rounded-md transition-colors hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                Planos
              </a>
              <a
                href="/#depoimentos"
                className="text-sm font-medium py-2 px-3 rounded-md transition-colors hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                Depoimentos
              </a>
              <Button variant="default" asChild className="justify-start">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Entrar
                </Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                <Link to="/criar" onClick={() => setMobileMenuOpen(false)}>
                  Criar Minha Igreja
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1">
        <section className="relative py-16 md:py-24 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
          {/* Overlay */}
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/70 via-background/40 to-background/70 dark:from-background/80 dark:via-background/50 dark:to-background/80" />

          <div className="container px-4 relative z-10">
            <div className="max-w-md mx-auto">
              {/* Logo */}
              <div className="text-center mb-6 md:mb-8">
                {isMainDomain ? (
                  <div className="h-16 w-16 md:h-20 md:w-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3 md:mb-4">
                    <Church className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                  </div>
                ) : church?.logo_url ? (
                  <img
                    src={church.logo_url}
                    alt={church.name}
                    className="h-16 w-16 md:h-20 md:w-20 mx-auto rounded-full object-cover mb-3 md:mb-4"
                  />
                ) : (
                  <div className="h-16 w-16 md:h-20 md:w-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3 md:mb-4">
                    <Church className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                  </div>
                )}

                <h1 className="text-2xl md:text-3xl font-bold text-primary">
                  {isMainDomain ? 'MinhaIgreja' : church?.name || 'Área Administrativa'}
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-2">
                  {isMainDomain
                    ? 'Plataforma de Gestão para Igrejas'
                    : 'Acesse o painel administrativo'}
                </p>
              </div>

              {/* Alerta de Erro */}
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Seleção de Plano (se veio do cadastro) */}
              {selectedPlan && (
                <Alert className="mb-6 bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">
                    ✅ Plano <strong>{selectedPlan}</strong> selecionado! Complete seu cadastro.
                  </AlertDescription>
                </Alert>
              )}

              {/* Formulário de Login */}
              <Card className="border-2 shadow-xl">
                <CardHeader className="p-4 md:p-6">
                  <div className="flex items-center gap-2">
                    <LogIn className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl md:text-2xl">Login</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    {isMainDomain
                      ? 'Acesse sua conta da plataforma'
                      : 'Entre com suas credenciais da igreja'}
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4 p-4 md:p-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder={isMainDomain ? "pastor@minhaigreja.app" : "pastor@igreja.com"}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Senha</Label>
                        <Link
                          to="/recuperar-senha"
                          className="text-sm text-primary hover:underline"
                        >
                          Esqueceu a senha?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          autoComplete="current-password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="••••••••"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 md:p-6 pt-0">
                    <Button type="submit" className="w-full h-11 md:h-12 text-base md:text-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-600/20" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 md:h-5 md:w-5 mr-2 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        <>
                          <LogIn className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                          {isMainDomain ? 'Acessar Plataforma' : 'Acessar Painel'}
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              {/* Links Adicionais */}
              <div className="text-center mt-6 md:mt-8 space-y-3 md:space-y-4">
                {isMainDomain ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      É uma igreja?{' '}
                      <Link to="/criar" className="text-primary hover:underline font-medium">
                        Crie sua igreja grátis
                      </Link>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      60 dias de teste grátis • Sem cartão de crédito
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Não tem uma conta?{' '}
                      <Link to="/criar" className="text-primary hover:underline font-medium">
                        Crie uma igreja grátis
                      </Link>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <Link to="/" className="text-primary hover:underline">
                        Voltar ao site da igreja
                      </Link>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Premium */}
      <HoverFooter />
    </div>
  );
}
