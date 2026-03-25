/**
 * Página: Home
 * Página inicial genérica para igrejas
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Heart, Users, BookOpen, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useChurch } from '@/hooks/useChurch';
import churchLogo from '@/assets/church-logo.jpg';

const defaultCarouselItems = [
  {
    title: "Bem-vindo à Nossa Igreja",
    description: "Um lugar de fé, esperança e amor. Venha fazer parte da nossa família!",
    image: churchLogo,
  },
  {
    title: "Nossos Cultos",
    description: "Momentos especiais de adoração e ensino da Palavra de Deus.",
    image: churchLogo,
  },
  {
    title: "Comunidade e Serviço",
    description: "Juntos crescemos na fé e servimos ao próximo com amor.",
    image: churchLogo,
  },
];

const defaultServices = [
  {
    day: 'Domingo',
    service: 'Culto de Celebração',
    time: '19:00h',
    icon: Calendar,
  },
  {
    day: 'Quarta-feira',
    service: 'Culto de Ensino',
    time: '19:30h',
    icon: BookOpen,
  },
  {
    day: 'Sexta-feira',
    service: 'Culto de Oração',
    time: '19:00h',
    icon: Heart,
  },
];

export default function Home() {
  const { church, loading } = useChurch();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Dados da igreja ou padrão
  const churchName = church?.name || 'Minha Igreja';
  const churchDescription = church?.description || 'Um lugar de fé, esperança e amor.';

  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % defaultCarouselItems.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isHovered]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % defaultCarouselItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + defaultCarouselItems.length) % defaultCarouselItems.length);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section com Carrossel */}
      <section className="relative h-[600px] overflow-hidden">
        {defaultCarouselItems.map((item, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${item.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-4 max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                  {item.title}
                </h1>
                <p className="text-xl md:text-2xl mb-6 drop-shadow-md">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button size="lg" asChild>
                    <Link to="/pedidos-oracao">
                      <Heart className="h-5 w-5 mr-2" />
                      Fazer Pedido de Oração
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="bg-transparent border-white text-white hover:bg-white/10">
                    <Link to="/contato">
                      Fale Conosco
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Controles */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 text-white hover:bg-primary transition-all opacity-0 hover:opacity-100 backdrop-blur-sm z-10"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 text-white hover:bg-primary transition-all opacity-0 hover:opacity-100 backdrop-blur-sm z-10"
          aria-label="Próximo"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Indicadores */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
          {defaultCarouselItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-primary w-8' : 'bg-white/50 w-2 hover:bg-white'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Boas-vindas */}
      <section className="py-16 bg-background">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
              Bem-vindo à {churchName}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {churchDescription}
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardHeader>
                  <Users className="h-12 w-12 text-primary mx-auto mb-2" />
                  <CardTitle>Comunidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Uma família acolhedora onde você é parte importante.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <BookOpen className="h-12 w-12 text-primary mx-auto mb-2" />
                  <CardTitle>Ensino</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Palavra de Deus ensinada de forma clara e prática.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Heart className="h-12 w-12 text-primary mx-auto mb-2" />
                  <CardTitle>Serviço</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Servindo ao próximo com o amor de Cristo.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Próximos Cultos */}
      <section className="py-16 bg-muted/50">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Nossos Cultos
            </h2>
            <p className="text-lg text-muted-foreground">
              Participe de nossas reuniões semanais
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {defaultServices.map((item, index) => (
              <Card key={index} className="hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <CardHeader>
                  <item.icon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>{item.day}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {item.time}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.service}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Localização */}
      <section className="py-16 bg-background">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                Nossa Localização
              </h2>
              <p className="text-lg text-muted-foreground">
                Venha nos visitar
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <Card>
                <CardHeader>
                  <CardTitle>Endereço</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {church?.address_street ? (
                    <>
                      <p className="font-semibold">
                        {church.address_street}
                        {church.address_number && `, ${church.address_number}`}
                      </p>
                      {church.address_neighborhood && (
                        <p className="text-muted-foreground">
                          {church.address_neighborhood}
                        </p>
                      )}
                      {church.address_city && church.address_state && (
                        <p className="text-muted-foreground">
                          {church.address_city} - {church.address_state}
                        </p>
                      )}
                      {church.address_zip && (
                        <p className="text-muted-foreground">
                          CEP: {church.address_zip}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground">
                      Endereço não informado
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Mapa de localização</p>
                  <p className="text-sm">Em breve</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground dark:bg-primary/90">
        <div className="container px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Venha Nos Visitar
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Será uma alegria receber você e sua família em nossa igreja. 
            Não é necessário aviso prévio, apenas venha!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/contato">
                Fale Conosco
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/pedidos-oracao">
                Pedido de Oração
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
