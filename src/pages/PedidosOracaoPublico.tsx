/**
 * Página Pública: Pedidos de Oração
 * Formulário para visitantes enviarem pedidos de oração
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
import { HeartHandshake, Send, ShieldCheck, CheckCircle, Church, Heart, MapPin, Phone, Mail, ExternalLink, Menu, X, Sun, Moon, Facebook, Instagram, Youtube } from 'lucide-react';
import emailjs from '@emailjs/browser';

export default function PedidosOracaoPublico() {
  const params = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [church, setChurch] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    categoria: '',
    tema: '',
    oracao: '',
    lgpd: false,
  });

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Enviar email de confirmação
  const sendConfirmationEmail = async (data: any) => {
    try {
      // Template ID do EmailJS - Template: Contact Us
      const templateId = 'template_v2kjju6'; // ✅ Template ID CORRETO do Dashboard
      
      const templateParams = {
        to_email: data.email,
        from_name: church?.name || 'Igreja',
        to_name: data.nome || 'Irmão(ã)',
        subject: 'Pedido de Oração Recebido ✅',
        message: `
Olá ${data.nome || 'Irmão(ã)'},

✅ **Seu pedido de oração foi recebido!**

Informações do Pedido:
━━━━━━━━━━━━━━━━━━━━━━━
📋 Tema: ${data.tema}
🙏 Oração: ${data.oracao.substring(0, 100)}${data.oracao.length > 100 ? '...' : ''}
📅 Data: ${new Date().toLocaleDateString('pt-BR')}
━━━━━━━━━━━━━━━━━━━━━━━

**Nossa equipe de intercessão já recebeu seu pedido e está orando por você!**

"Porque o Senhor é o nosso refúgio e fortaleza, socorro bem presente na angústia."
📖 Salmos 46:1

Continue firme na fé, pois temos uma grande nuvem de testemunhas intercedendo por você!

Com carinho e orações,
**Equipe de Intercessão**
${church?.name || 'Nossa Igreja'}

---
📧 Este é um email automático, por favor não responda.
        `,
        prayer_topic: data.tema,
        church_name: church?.name || 'Nossa Igreja',
        date: new Date().toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric' 
        }),
      };

      console.log('📧 Enviando email de confirmação:', templateParams);

      const response = await emailjs.send(
        'service_qf3pbb5', // ✅ Service ID configurado
        templateId,
        templateParams
      );

      console.log('✅ Email de confirmação enviado com sucesso!', response);
    } catch (error) {
      console.error('❌ Erro ao enviar email de confirmação:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    }
  };

  // Carregar dados da igreja
  useEffect(() => {
    const loadChurch = async () => {
      try {
        const slug = params.slug || 'demo';
        const response = await fetch(`http://localhost:3000/api/church/slug/${slug}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setChurch(data.data);
        }
      } catch (error) {
        console.error('Error loading church:', error);
      }
    };
    
    loadChurch();
  }, [params.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações
      const errors: string[] = [];

      if (!formData.oracao || formData.oracao.trim().length < 10) {
        errors.push('A oração deve ter pelo menos 10 caracteres');
      }

      if (formData.oracao && formData.oracao.length > 500) {
        errors.push('A oração não pode exceder 500 caracteres');
      }

      if (!formData.lgpd) {
        errors.push('É necessário concordar com a LGPD');
      }

      if (errors.length > 0) {
        toast.error(errors[0]);
        setLoading(false);
        return;
      }

      // Enviar pedido
      const response = await fetch('http://localhost:3000/api/pedidos/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          church_slug: params.slug || 'demo',
          nome: formData.nome || 'Anônimo',
          email: formData.email || '',
          categoria: formData.categoria || 'pedido',
          tema: formData.tema || 'outros',
          oracao: formData.oracao,
          lgpd: formData.lgpd,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        toast.success('Pedido de oração enviado com sucesso! Estaremos orando por você.');
        
        // Enviar email de confirmação se tiver email
        if (formData.email) {
          sendConfirmationEmail(formData);
        }
        
        setFormData({
          nome: '',
          email: '',
          categoria: '',
          tema: '',
          oracao: '',
          lgpd: false,
        });

        // Esconder sucesso após 5 segundos
        setTimeout(() => setSuccess(false), 5000);
      } else {
        toast.error(result.error || 'Erro ao enviar o pedido. Tente novamente.');
      }
    } catch (error) {
      console.error('Error submitting pedido:', error);
      toast.error('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const temas = [
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            {/* Logo e Nome */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                <Church className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {church?.name || 'Igreja'}
                </span>
                <p className="text-xs text-muted-foreground">Bem-vindo à casa de Deus</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center gap-8">
              {[
                { label: 'Início', href: `/church/${params.slug}` },
                { label: 'Sobre', href: `/church/${params.slug}#sobre` },
                { label: 'Ministérios', href: `/church/${params.slug}#ministérios` },
                { label: 'Cultos', href: `/church/${params.slug}#cultos` },
                { label: 'Eventos', href: `/church/${params.slug}#eventos` },
                { label: 'Contato', href: `/church/${params.slug}#contato` },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </a>
              ))}
              
              {/* Botão Pedidos de Oração (Destaque) */}
              <Button
                variant="default"
                size="sm"
                className="gap-2 shadow-md bg-gradient-to-r from-primary to-primary/80"
              >
                <Heart className="w-4 h-4" />
                Pedidos de Oração
              </Button>
              
              {/* Toggle Dark Mode */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="gap-2"
                title={darkMode ? 'Modo claro' : 'Modo escuro'}
              >
                {darkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/dashboard')}
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Área Admin
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-6 border-t animate-in slide-in-from-top-2">
              <nav className="flex flex-col gap-4">
                {[
                  { label: 'Início', href: `/church/${params.slug}` },
                  { label: 'Sobre', href: `/church/${params.slug}#sobre` },
                  { label: 'Ministérios', href: `/church/${params.slug}#ministérios` },
                  { label: 'Cultos', href: `/church/${params.slug}#cultos` },
                  { label: 'Eventos', href: `/church/${params.slug}#eventos` },
                  { label: 'Contato', href: `/church/${params.slug}#contato` },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
                
                {/* Botão Pedidos de Oração - Mobile */}
                <Button
                  variant="default"
                  size="sm"
                  className="gap-2 shadow-md bg-gradient-to-r from-primary to-primary/80 w-full"
                >
                  <Heart className="w-4 h-4" />
                  Pedidos de Oração
                </Button>
                
                <div className="flex items-center gap-2 pt-2 border-t">
                  {/* Toggle Dark Mode - Mobile */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleDarkMode}
                    className="gap-2 flex-1"
                  >
                    {darkMode ? (
                      <>
                        <Sun className="w-4 h-4" />
                        Modo Claro
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4" />
                        Modo Escuro
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/admin/dashboard')}
                    className="gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Admin
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="mx-auto mb-6 p-4 bg-primary/20 rounded-full w-fit">
                <HeartHandshake className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
              Pedidos de Oração
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground italic mb-4">
              "Orai uns pelos outros, para que sareis. A oração feita por um justo pode muito em seus efeitos."
            </p>
            <p className="text-lg text-muted-foreground">
              Tiago 5:16
            </p>
          </div>
        </div>
      </section>

      {/* Formulário */}
      <section className="py-16 -mt-10">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto shadow-xl border-primary/10">
            <CardHeader className="text-center pb-8 border-b bg-muted/20">
              <CardTitle className="text-2xl font-bold text-primary">Envie seu Clamor</CardTitle>
              <CardDescription className="text-base pt-2">
                Preencha o formulário abaixo para que nossa equipe de intercessão possa orar por você.
                <br />
                <span className="text-xs text-muted-foreground mt-1 block">* Campos obrigatórios</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {success ? (
                <div className="p-8 text-center animate-in fade-in slide-in-from-bottom-2">
                  <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-fit">
                    <CheckCircle className="h-16 w-16 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-800 mb-2">
                    Pedido Enviado com Sucesso!
                  </h3>
                  <p className="text-muted-foreground text-lg">
                    Estaremos orando por você.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => setSuccess(false)}
                  >
                    Enviar Outro Pedido
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Dados Pessoais */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground/80">
                      <span className="bg-primary/10 p-1 rounded text-sm">1</span> Seus Dados (Opcional)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Nome Completo
                        </label>
                        <Input
                          value={formData.nome}
                          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                          placeholder="Como deseja ser identificado"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          E-mail (para receber confirmação)
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="seu@email.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border my-6" />

                  {/* Detalhes do Pedido */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground/80">
                      <span className="bg-primary/10 p-1 rounded text-sm">2</span> Detalhes da Oração
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Categoria *
                        </label>
                        <Select
                          value={formData.categoria}
                          onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pedido">Pedido de Oração</SelectItem>
                            <SelectItem value="agradecimento">Agradecimento</SelectItem>
                            <SelectItem value="testemunho">Testemunho</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Tema *
                        </label>
                        <Select
                          value={formData.tema}
                          onValueChange={(value) => setFormData({ ...formData, tema: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tema" />
                          </SelectTrigger>
                          <SelectContent>
                            {temas.map((tema) => (
                              <SelectItem key={tema} value={tema}>
                                {tema}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Sua Oração *
                      </label>
                      <Textarea
                        value={formData.oracao}
                        onChange={(e) => setFormData({ ...formData, oracao: e.target.value })}
                        placeholder="Descreva seu pedido, agradecimento ou testemunho aqui..."
                        className="resize-none min-h-[150px]"
                        maxLength={500}
                        required
                      />
                      <div className="text-xs text-right text-muted-foreground mt-1">
                        {formData.oracao?.length || 0}/500 caracteres
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border my-6" />

                  {/* LGPD */}
                  <div className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 bg-muted/30">
                    <Checkbox
                      id="lgpd"
                      checked={formData.lgpd}
                      onCheckedChange={(checked) => setFormData({ ...formData, lgpd: checked as boolean })}
                    />
                    <div className="space-y-1 leading-none">
                      <label
                        htmlFor="lgpd"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                      >
                        Li e concordo com a COLETA DE DADOS - LGPD. *
                        <ShieldCheck className="h-4 w-4 text-green-600" />
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Autorizo o uso dos meus dados para fins de intercessão pela equipe da igreja.
                      </p>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-lg font-semibold shadow-md hover:shadow-lg transition-all"
                    disabled={loading}
                  >
                    {loading ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" /> Enviar Oração
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Informações da Igreja */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Church className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-lg">{church?.name || 'Igreja'}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {church?.description || 'Levando o Evangelho a toda criatura'}
              </p>
            </div>

            {/* Contato */}
            <div className="space-y-3">
              <h4 className="font-semibold text-base">Contato</h4>
              {church?.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{church.phone}</span>
                </div>
              )}
              {church?.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{church.email}</span>
                </div>
              )}
              {(church?.address_street || church?.address_city) && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span>
                    {church.address_street && `${church.address_street}, ${church.address_number || ''}`}
                    {church.address_city && `${church.address_city}/${church.address_state || ''}`}
                  </span>
                </div>
              )}
            </div>

            {/* Links Rápidos */}
            <div className="space-y-3">
              <h4 className="font-semibold text-base">Links Rápidos</h4>
              <div className="flex flex-col gap-2">
                <a href={`/church/${params.slug}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Início
                </a>
                <a href={`/church/${params.slug}#sobre`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Sobre Nós
                </a>
                <a href={`/church/${params.slug}#ministérios`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Ministérios
                </a>
                <a href={`/church/${params.slug}#contato`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contato
                </a>
              </div>
            </div>

            {/* Redes Sociais */}
            {(church?.facebook_url || church?.instagram_url || church?.youtube_url) && (
              <div className="space-y-3">
                <h4 className="font-semibold text-base">Redes Sociais</h4>
                <div className="flex gap-3">
                  {church?.facebook_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => window.open(church.facebook_url, '_blank')}
                    >
                      <Facebook className="w-4 h-4" />
                      <span className="text-xs">Facebook</span>
                    </Button>
                  )}
                  {church?.instagram_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 hover:bg-pink-50 hover:text-pink-600"
                      onClick={() => window.open(church.instagram_url, '_blank')}
                    >
                      <Instagram className="w-4 h-4" />
                      <span className="text-xs">Instagram</span>
                    </Button>
                  )}
                  {church?.youtube_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 hover:bg-red-50 hover:text-red-600"
                      onClick={() => window.open(church.youtube_url, '_blank')}
                    >
                      <Youtube className="w-4 h-4" />
                      <span className="text-xs">YouTube</span>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {church?.name || 'Igreja'}. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <a href="/lgpd" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                LGPD
              </a>
              <a href="/termos-de-uso" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Termos de Uso
              </a>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Heart className="w-3 h-3" />
                Criado com MinhaIgreja
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
