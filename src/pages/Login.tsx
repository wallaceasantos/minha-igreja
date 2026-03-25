/**
 * Página: Login
 * Login para administradores da plataforma e igrejas
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ModeToggle } from '@/components/mode-toggle';
import { toast } from 'sonner';
import { Church, Lock, Mail, Loader2, LogIn, Menu, X } from 'lucide-react';
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
      // TODO: Implementar login real com API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulação de login
      toast.success('Login realizado com sucesso!', {
        description: 'Redirecionando para o painel...',
      });

      // Redirecionar para o dashboard apropriado
      if (isMainDomain) {
        // Login na plataforma (super admin)
        navigate('/admin/dashboard');
      } else {
        // Login na igreja (admin local)
        navigate('/admin/pedidos');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login';
      setError(errorMessage);
      toast.error('Erro ao fazer login', {
        description: 'Verifique suas credenciais e tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Fixo */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <Church className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">Igreja Connect</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 ml-auto">
            <a href="/#funcionalidades" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Funcionalidades
            </a>
            <a href="/#planos" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Planos
            </a>
            <a href="/#depoimentos" className="text-sm font-medium text-muted-foreground hover:text-primary">
              Depoimentos
            </a>
            <Button variant="default" asChild>
              <Link to="/login">
                <LogIn className="h-4 w-4 mr-2" />
                Entrar
              </Link>
            </Button>
            <ModeToggle />
            <Button asChild>
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
              <Button asChild>
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
        <section className="py-20 bg-background">
          <div className="container px-4">
            <div className="max-w-md mx-auto">
              {/* Logo */}
              <div className="text-center mb-8">
                {isMainDomain ? (
                  <div className="h-20 w-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Church className="h-10 w-10 text-primary" />
                  </div>
                ) : church?.logo_url ? (
                  <img
                    src={church.logo_url}
                    alt={church.name}
                    className="h-20 w-20 mx-auto rounded-full object-cover mb-4"
                  />
                ) : (
                  <div className="h-20 w-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Church className="h-10 w-10 text-primary" />
                  </div>
                )}
                
                <h1 className="text-2xl font-bold text-primary">
                  {isMainDomain ? 'Igreja Connect' : church?.name || 'Área Administrativa'}
                </h1>
                <p className="text-muted-foreground mt-2">
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
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <LogIn className="h-5 w-5 text-primary" />
                    <CardTitle>Login</CardTitle>
                  </div>
                  <CardDescription>
                    {isMainDomain 
                      ? 'Acesse sua conta da plataforma' 
                      : 'Entre com suas credenciais da igreja'}
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
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
                          placeholder={isMainDomain ? "admin@igrejaconnect.com.br" : "pastor@igreja.com"}
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

                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        <>
                          <LogIn className="h-4 w-4 mr-2" />
                          {isMainDomain ? 'Acessar Plataforma' : 'Acessar Painel'}
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              {/* Links Adicionais */}
              <div className="text-center mt-6 space-y-4">
                {isMainDomain ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      É uma igreja?{' '}
                      <Link to="/criar" className="text-primary hover:underline font-medium">
                        Crie sua igreja grátis
                      </Link>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      30 dias de teste grátis • Sem cartão de crédito
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

      {/* Footer */}
      <footer className="bg-divine-shadow text-white dark:bg-card dark:border-t dark:border-border py-12">
        <div className="container px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Church className="h-6 w-6" />
                <span className="text-xl font-bold">Igreja Connect</span>
              </div>
              <p className="text-sm text-gray-300 dark:text-muted-foreground">
                Plataforma digital para igrejas que desejam se conectar com membros e visitantes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-gray-300 dark:text-muted-foreground">
                <li><a href="/#funcionalidades" className="hover:text-white dark:hover:text-primary">Funcionalidades</a></li>
                <li><a href="/#planos" className="hover:text-white dark:hover:text-primary">Planos</a></li>
                <li><a href="/criar" className="hover:text-white dark:hover:text-primary">Começar Grátis</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-gray-300 dark:text-muted-foreground">
                <li><a href="/sobre-nos" className="hover:text-white dark:hover:text-primary">Sobre Nós</a></li>
                <li><a href="/contato-institucional" className="hover:text-white dark:hover:text-primary">Contato</a></li>
                <li><a href="/blog" className="hover:text-white dark:hover:text-primary">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-300 dark:text-muted-foreground">
                <li><a href="/termos-de-uso" className="hover:text-white dark:hover:text-primary">Termos de Uso</a></li>
                <li><a href="/politica-privacidade" className="hover:text-white dark:hover:text-primary">Privacidade</a></li>
                <li><a href="/lgpd" className="hover:text-white dark:hover:text-primary">LGPD</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-600 dark:border-border mt-8 pt-6 text-center text-sm text-gray-400 dark:text-muted-foreground">
            <p>Copyright © {new Date().getFullYear()} Igreja Connect. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
