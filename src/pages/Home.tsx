/**
 * Página: Home - Versão Profissional
 * Página inicial moderna para igrejas
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Heart, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  BookOpen,
  Menu,
  X,
  Facebook,
  Instagram,
  Youtube,
  ChevronRight,
  Clock3,
  HandHeart
} from 'lucide-react';
import { useChurch } from '@/hooks/useChurch';

export default function Home() {
  const { church, loading } = useChurch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Dados da igreja ou defaults profissionais
  const churchName = church?.name || 'Minha Igreja';
  const churchDescription = church?.description || 'Um lugar de fé, esperança e amor.';
  const churchAddress = church?.address_street 
    ? `${church.address_street}, ${church.address_number || ''} - ${church.address_neighborhood || ''} - ${church.address_city || ''}/${church.address_state || ''}`
    : 'Endereço não informado';
  const churchPhone = church?.phone || church?.whatsapp || '(00) 0000-0000';
  const churchEmail = church?.email || 'contato@igreja.com';
  const primaryColor = church?.theme_primary_color || '#1e40af';
  const secondaryColor = church?.theme_secondary_color || '#f59e0b';

  // Detectar scroll para navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Horários de culto (dados de exemplo)
  const serviceTimes = [
    {
      day: 'Domingo',
      service: 'Culto de Celebração',
      time: '19:00h',
      icon: Users,
      description: 'Celebração da Palavra e Ceia do Senhor',
    },
    {
      day: 'Quarta-feira',
      service: 'Culto de Ensino',
      time: '19:30h',
      icon: BookOpen,
      description: 'Estudo bíblico para crescimento na fé',
    },
    {
      day: 'Sexta-feira',
      service: 'Culto de Oração',
      time: '19:00h',
      icon: Heart,
      description: 'Momento especial de intercessão',
    },
  ];

  // Versículos do dia (rotativo)
  const verses = [
    { text: "Porque Deus tanto amou o mundo que deu o seu Filho Unigênito, para que todo o que nele crer não pereça, mas tenha a vida eterna.", reference: "João 3:16" },
    { text: "Eu sou o caminho, a verdade e a vida. Ninguém vem ao Pai, a não ser por mim.", reference: "João 14:6" },
    { text: "Portanto, vão e façam discípulos de todas as nações, batizando-os em nome do Pai e do Filho e do Espírito Santo.", reference: "Mateus 28:19" },
  ];
  const [currentVerse, setCurrentVerse] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentVerse((prev) => (prev + 1) % verses.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar Fixa */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: scrolled ? primaryColor : 'white' }}>
                  {churchName}
                </h1>
                <p className="text-xs" style={{ color: scrolled ? secondaryColor : 'white' }}>
                  
                </p>
              </div>
            </div>

            {/* Menu Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <Link 
                to="#" 
                className="font-medium transition-colors hover:text-primary"
                style={{ color: scrolled ? '#666' : 'white' }}
              >
                Início
              </Link>
              <Link 
                to="/pedidos-oracao" 
                className="font-medium transition-colors hover:text-primary"
                style={{ color: scrolled ? '#666' : 'white' }}
              >
                Pedidos de Oração
              </Link>
              <Link 
                to="/contato" 
                className="font-medium transition-colors hover:text-primary"
                style={{ color: scrolled ? '#666' : 'white' }}
              >
                Contato
              </Link>
              <Button asChild style={{ backgroundColor: primaryColor }}>
                <Link to="/login">Login</Link>
              </Button>
            </div>

            {/* Menu Mobile Button */}
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" style={{ color: scrolled ? primaryColor : 'white' }} />
              ) : (
                <Menu className="w-6 h-6" style={{ color: scrolled ? primaryColor : 'white' }} />
              )}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link to="#" className="font-medium py-2">Início</Link>
              <Link to="/pedidos-oracao" className="font-medium py-2">Pedidos de Oração</Link>
              <Link to="/contato" className="font-medium py-2">Contato</Link>
              <Button asChild className="w-full" style={{ backgroundColor: primaryColor }}>
                <Link to="/login">Login</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section 
        className="relative h-[700px] flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}dd 0%, ${primaryColor}88 100%)`,
        }}
      >
        {/* Pattern de fundo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <HandHeart className="w-5 h-5" />
            <span className="text-sm font-medium">Bem-vindo à nossa comunidade</span>
          </div>

          {/* Título Principal */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            {churchName}
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white/90">
            {churchDescription}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 rounded-full font-semibold shadow-2xl"
              style={{ backgroundColor: secondaryColor }}
              asChild
            >
              <Link to="/pedidos-oracao">
                Fazer Pedido de Oração
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 rounded-full font-semibold border-2 bg-transparent hover:bg-white/10"
              style={{ borderColor: 'white', color: 'white' }}
              asChild
            >
              <Link to="/contato">
                Fale Conosco
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-sm text-white/80">Membros</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">3x</div>
              <div className="text-sm text-white/80">Cultos Semanais</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-sm text-white/80">Oração</div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L60 10C120 20 240 40 360 53.3C480 67 600 73 720 73.3C840 73 960 67 1080 53.3C1200 40 1320 20 1380 10L1440 0V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Versículo do Dia */}
      <section className="py-16 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: secondaryColor }} />
            <blockquote className="text-2xl md:text-3xl font-serif italic mb-4 text-gray-700">
              "{verses[currentVerse]?.text}"
            </blockquote>
            <cite className="text-lg font-semibold" style={{ color: primaryColor }}>
              {verses[currentVerse]?.reference}
            </cite>
          </div>
        </div>
      </section>

      {/* Horários de Culto */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: primaryColor }}>
              Nossos Cultos
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Venha nos visitar e participar de nossos momentos de adoração
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {serviceTimes.map((item, index) => (
              <Card 
                key={index}
                className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <CardContent className="p-8 text-center">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    <item.icon className="w-8 h-8" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>
                    {item.day}
                  </h3>
                  <p className="text-lg font-semibold mb-2">{item.service}</p>
                  <div className="inline-flex items-center gap-2 text-muted-foreground mb-4">
                    <Clock3 className="w-5 h-5" />
                    <span>{item.time}</span>
                  </div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Localização e Contato */}
      <section className="py-20" style={{ backgroundColor: '#f8fafc' }}>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Informações */}
            <div>
              <h2 className="text-4xl font-bold mb-6" style={{ color: primaryColor }}>
                Nossa Localização
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Venha nos visitar! Estamos esperando por você.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${primaryColor}20` }}>
                    <MapPin className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Endereço</h3>
                    <p className="text-gray-600">{churchAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${secondaryColor}20` }}>
                    <Phone className="w-6 h-6" style={{ color: secondaryColor }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Telefone</h3>
                    <p className="text-gray-600">{churchPhone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${primaryColor}20` }}>
                    <Mail className="w-6 h-6" style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Email</h3>
                    <p className="text-gray-600">{churchEmail}</p>
                  </div>
                </div>
              </div>

              {/* Redes Sociais */}
              <div className="mt-8 flex gap-4">
                <Button variant="outline" size="icon" className="rounded-full">
                  <Facebook className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Instagram className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Youtube className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Mapa (placeholder) */}
            <div className="rounded-2xl overflow-hidden shadow-2xl h-[400px] bg-gray-200 flex items-center justify-center">
              <div className="text-center p-8">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 font-medium">Mapa do Google</p>
                <p className="text-sm text-gray-400 mt-2">{churchAddress}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-white" style={{ backgroundColor: primaryColor }}>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Igreja */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">{churchName}</h3>
              </div>
              <p className="text-white/80 text-sm">
                Levando o evangelho a todas as nações.
              </p>
            </div>

            {/* Links Rápidos */}
            <div>
              <h4 className="font-semibold mb-4">Links Rápidos</h4>
              <div className="space-y-2 text-sm text-white/80">
                <Link to="#" className="block hover:text-white transition-colors">Início</Link>
                <Link to="/pedidos-oracao" className="block hover:text-white transition-colors">Pedidos de Oração</Link>
                <Link to="/contato" className="block hover:text-white transition-colors">Contato</Link>
                <Link to="/login" className="block hover:text-white transition-colors">Login</Link>
              </div>
            </div>

            {/* Contato */}
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <div className="space-y-2 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{churchPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{churchEmail}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/20 pt-8 text-center text-sm text-white/60">
            <p>Copyright © {new Date().getFullYear()} {churchName}. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
