/**
 * Landing Page: Criar Igreja
 * ===========================
 * Página de cadastro para novas igrejas
 * URL: https://igrejaconnect.com.br/criar
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ModeToggle } from '@/components/mode-toggle';
import { CheckCircle2, Loader2, Church, Mail, Phone, MapPin, User, Lock, Palette, Menu, X } from 'lucide-react';
import { toast } from 'sonner';

interface AddressData {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
}

interface AdminData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormData {
  name: string;
  slug: string;
  cnpj: string;
  description: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: AddressData;
  admin: AdminData;
  theme_primary_color: string;
  theme_secondary_color: string;
}

const initialAddress: AddressData = {
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  zip: '',
};

const initialAdmin: AdminData = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const initialFormData: FormData = {
  name: '',
  slug: '',
  cnpj: '',
  description: '',
  email: '',
  phone: '',
  whatsapp: '',
  address: initialAddress,
  admin: initialAdmin,
  theme_primary_color: '#1e40af',
  theme_secondary_color: '#f59e0b',
};

export default function CreateChurch() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent as string]: {
          ...(prev[parent as keyof FormData] as object),
          [child as string]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Verifica slug quando mudar
    if (name === 'slug' && value.length >= 3) {
      checkSlugAvailability(value);
    }
  };

  const checkSlugAvailability = async (slug: string) => {
    setCheckingSlug(true);
    try {
      const response = await fetch(`/api/church/${slug}.php`);
      const data = await response.json();
      setSlugAvailable(!data.success);
    } catch {
      setSlugAvailable(null);
    } finally {
      setCheckingSlug(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    // Validações
    const newErrors: string[] = [];

    if (!formData.name || formData.name.length < 5) {
      newErrors.push('Nome da igreja deve ter pelo menos 5 caracteres');
    }

    if (!formData.slug || formData.slug.length < 3) {
      newErrors.push('Subdomínio deve ter pelo menos 3 caracteres');
    }

    if (!formData.admin.email || !formData.admin.email.includes('@')) {
      newErrors.push('Email do administrador é obrigatório');
    }

    if (formData.admin.password !== formData.admin.confirmPassword) {
      newErrors.push('Senhas não conferem');
    }

    if (formData.admin.password.length < 6) {
      newErrors.push('Senha deve ter pelo menos 6 caracteres');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/criar-igreja.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || 'Erro ao criar igreja');
      }

      // Sucesso!
      toast.success('Igreja criada com sucesso!', {
        description: `Redirecionando para ${data.data.url}...`,
      });

      // Redireciona para a nova igreja
      setTimeout(() => {
        window.location.href = data.data.url;
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setErrors([errorMessage]);
      toast.error('Erro ao criar igreja', {
        description: errorMessage,
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
            <Button variant="ghost" asChild>
              <Link to="/login">Entrar</Link>
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
              <Button variant="ghost" asChild className="justify-start">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
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

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <Church className="h-20 w-20 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
              Crie o Site da Sua Igreja
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Tenha um site profissional em minutos. Sem precisar de programador.
              Comece grátis e cresça sem limites.
            </p>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-12 bg-background">
        <div className="container px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            <Card>
              <CardHeader>
                <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle>Site Profissional</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Design moderno e responsivo. Sua igreja sempre visível para membros e visitantes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle>Pedidos de Oração</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Receba pedidos de oração online. Pastoreio mais próximo e eficiente.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle>30 Dias Grátis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Teste todos os recursos do plano Premium gratuitamente por 30 dias.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Formulário */}
      <section className="py-20 bg-muted/50">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Dados da Igreja</CardTitle>
                <CardDescription>
                  Preencha as informações abaixo para criar o site da sua igreja
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  {/* Alerta de Erros */}
                  {errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        <ul className="list-disc list-inside space-y-1">
                          {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Dados Básicos */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Church className="h-5 w-5" />
                      Informações da Igreja
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome da Igreja *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Ex: Primeira Igreja Batista"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="slug">Subdomínio (URL do site) *</Label>
                        <div className="flex gap-2">
                          <Input
                            id="slug"
                            name="slug"
                            value={formData.slug}
                            onChange={handleInputChange}
                            placeholder="primeira-batista"
                            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                            title="Apenas letras minúsculas, números e hífens (ex: primeira-batista)"
                            required
                            className="flex-1"
                          />
                          {checkingSlug && (
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          )}
                          {slugAvailable === true && (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          )}
                          {slugAvailable === false && (
                            <span className="text-red-500 text-sm">Indisponível</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Seu site será: https://{formData.slug || '...'}.ccjv.com.br
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição da Igreja</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Conte um pouco sobre a visão e missão da sua igreja..."
                        rows={3}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cnpj">CNPJ</Label>
                        <Input
                          id="cnpj"
                          name="cnpj"
                          value={formData.cnpj}
                          onChange={handleInputChange}
                          placeholder="00.000.000/0000-00"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email da Igreja *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="contato@igreja.com.br"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="(00) 0000-0000"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="whatsapp"
                            name="whatsapp"
                            value={formData.whatsapp}
                            onChange={handleInputChange}
                            placeholder="(00) 00000-0000"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Endereço da Igreja
                    </h3>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="address.street">Rua/Av</Label>
                        <Input
                          id="address.street"
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleInputChange}
                          placeholder="Ex: Rua Principal"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address.number">Número</Label>
                        <Input
                          id="address.number"
                          name="address.number"
                          value={formData.address.number}
                          onChange={handleInputChange}
                          placeholder="1000"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="address.neighborhood">Bairro</Label>
                        <Input
                          id="address.neighborhood"
                          name="address.neighborhood"
                          value={formData.address.neighborhood}
                          onChange={handleInputChange}
                          placeholder="Centro"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address.city">Cidade</Label>
                        <Input
                          id="address.city"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleInputChange}
                          placeholder="São Paulo"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address.state">Estado</Label>
                        <Input
                          id="address.state"
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleInputChange}
                          placeholder="SP"
                          maxLength={2}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="address.zip">CEP</Label>
                        <Input
                          id="address.zip"
                          name="address.zip"
                          value={formData.address.zip}
                          onChange={handleInputChange}
                          placeholder="00000-000"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address.complement">Complemento</Label>
                        <Input
                          id="address.complement"
                          name="address.complement"
                          value={formData.address.complement}
                          onChange={handleInputChange}
                          placeholder="Opcional"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dados do Administrador */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Dados do Administrador
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="admin.name">Nome Completo *</Label>
                      <Input
                        id="admin.name"
                        name="admin.name"
                        value={formData.admin.name}
                        onChange={handleInputChange}
                        placeholder="Ex: Pastor João da Silva"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="admin.email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="admin.email"
                          name="admin.email"
                          type="email"
                          value={formData.admin.email}
                          onChange={handleInputChange}
                          placeholder="pastor@igreja.com.br"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="admin.password">Senha *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="admin.password"
                            name="admin.password"
                            type="password"
                            value={formData.admin.password}
                            onChange={handleInputChange}
                            placeholder="Mínimo 6 caracteres"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="admin.confirmPassword">Confirmar Senha *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="admin.confirmPassword"
                            name="admin.confirmPassword"
                            type="password"
                            value={formData.admin.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Repita a senha"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personalização */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Personalização (Opcional)
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="theme_primary_color">Cor Primária</Label>
                        <div className="flex gap-2">
                          <Input
                            id="theme_primary_color"
                            name="theme_primary_color"
                            type="color"
                            value={formData.theme_primary_color}
                            onChange={handleInputChange}
                            className="w-20 h-10"
                          />
                          <Input
                            type="text"
                            value={formData.theme_primary_color}
                            onChange={(e) => setFormData(prev => ({ ...prev, theme_primary_color: e.target.value }))}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="theme_secondary_color">Cor Secundária</Label>
                        <div className="flex gap-2">
                          <Input
                            id="theme_secondary_color"
                            name="theme_secondary_color"
                            type="color"
                            value={formData.theme_secondary_color}
                            onChange={handleInputChange}
                            className="w-20 h-10"
                          />
                          <Input
                            type="text"
                            value={formData.theme_secondary_color}
                            onChange={(e) => setFormData(prev => ({ ...prev, theme_secondary_color: e.target.value }))}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Termos */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Ao criar sua igreja, você concorda com nossos{' '}
                      <Link to="/termos-de-uso" className="text-primary hover:underline">
                        Termos de Uso
                      </Link>{' '}
                      e{' '}
                      <Link to="/politica-privacidade" className="text-primary hover:underline">
                        Política de Privacidade
                      </Link>
                      .
                    </p>
                  </div>

                  {/* Botão Submit */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Criando sua igreja...
                      </>
                    ) : (
                      <>
                        <Church className="mr-2 h-5 w-5" />
                        Criar Minha Igreja Grátis
                      </>
                    )}
                  </Button>
                </CardContent>
              </form>
            </Card>
          </div>
        </div>
      </section>

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
