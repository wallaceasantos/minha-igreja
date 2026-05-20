/**
 * ChurchPremium - Site Público para Plano Essencial/Premium
 * ============================================
 * Layout completo e avançado para igrejas nos planos pagos
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChurchHeader, ChurchFooter, MinistryCard, ServiceCard, EventCard } from './ChurchBase';
import type { ChurchData, Ministry, Service, Event } from './ChurchBase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { buildApiUrl } from '@/lib/config';
import {
  Heart,
  Users,
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Youtube,
  Play,
  Mail as MailIcon,
  MessageCircle,
  Globe,
  CalendarCheck
} from 'lucide-react';

// Componente para Contagem Regressiva
const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-2 sm:gap-3 text-white flex-wrap justify-center">
      {timeLeft.days > 0 && (
        <div className="flex flex-col items-center">
          <span className="text-2xl sm:text-3xl font-bold bg-white/20 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 backdrop-blur-sm">
            {timeLeft.days}
          </span>
          <span className="text-[10px] sm:text-xs font-medium mt-1">Dias</span>
        </div>
      )}
      <div className="flex flex-col items-center">
        <span className="text-2xl sm:text-3xl font-bold bg-white/20 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 backdrop-blur-sm">
          {timeLeft.hours.toString().padStart(2, '0')}
        </span>
        <span className="text-[10px] sm:text-xs font-medium mt-1">Horas</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-2xl sm:text-3xl font-bold bg-white/20 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 backdrop-blur-sm">
          {timeLeft.minutes.toString().padStart(2, '0')}
        </span>
        <span className="text-[10px] sm:text-xs font-medium mt-1">Min</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-2xl sm:text-3xl font-bold bg-white/20 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 backdrop-blur-sm text-orange-300">
          {timeLeft.seconds.toString().padStart(2, '0')}
        </span>
        <span className="text-[10px] sm:text-xs font-medium mt-1 text-orange-300">Seg</span>
      </div>
    </div>
  );
};

export default function ChurchPremium() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [church, setChurch] = useState<ChurchData | null>(null);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [prayerCount, setPrayerCount] = useState(0);
  const [gallery, setGallery] = useState<{id: number; image_url: string; title: string}[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [liveStreams, setLiveStreams] = useState<any[]>([]);

  useEffect(() => {
    loadChurchData();
  }, [slug]);

  const loadChurchData = async () => {
    try {
      setLoading(true);
      
      const churchRes = await fetch(buildApiUrl(`/api/church/slug/${slug}`));
      const churchData = await churchRes.json();
      
      if (churchData.success) {
        setChurch(churchData.data);

        await Promise.all([
          loadMinistries(churchData.data.id),
          loadServices(churchData.data.id),
          loadEvents(churchData.data.id),
          loadStats(churchData.data.id),
          loadGallery(churchData.data.id),
          loadLiveStreams(churchData.data.id),
        ]);
      } else {
        toast.error('Igreja não encontrada');
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading church:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadMinistries = async (churchId: number) => {
    const res = await fetch(buildApiUrl(`/api/ministries?church_id=${churchId}`));
    const data = await res.json();
    if (data.success) setMinistries(data.data);
  };

  const loadServices = async (churchId: number) => {
    const res = await fetch(buildApiUrl(`/api/services?church_id=${churchId}`));
    const data = await res.json();
    if (data.success) setServices(data.data);
  };

  const loadEvents = async (churchId: number) => {
    const res = await fetch(buildApiUrl(`/api/events?church_id=${churchId}`));
    const data = await res.json();
    if (data.success) {
      setEvents(data.data);
      setEventCount(data.data.length);
    }
  };

  const loadStats = async (churchId: number) => {
    // Carregar estatísticas
    const membersRes = await fetch(buildApiUrl(`/api/members?church_id=${churchId}`));
    const membersData = await membersRes.json();
    if (membersData.success) setMemberCount(membersData.data?.length || 0);

    const prayersRes = await fetch(buildApiUrl(`/api/pedidos?church_id=${churchId}`));
    const prayersData = await prayersRes.json();
    if (prayersData.success) setPrayerCount(prayersData.data?.length || 0);
  };

  const loadGallery = async (churchId: number) => {
    try {
      const res = await fetch(buildApiUrl(`/api/gallery/church/${churchId}/gallery`));
      const data = await res.json();
      if (data.success) {
        setGallery(data.data);
      }
    } catch (error) {
      console.error('Error loading gallery:', error);
    }
  };

  const loadLiveStreams = async (churchId: number) => {
    try {
      const res = await fetch(buildApiUrl(`/api/church/${churchId}/live-streams`));
      const data = await res.json();
      if (data.success) {
        // Filtrar apenas lives ativas e não encerradas
        const activeStreams = data.data.filter((s: any) => 
          s.is_active === 1 && s.status !== 'ended'
        );
        setLiveStreams(activeStreams);
      }
    } catch (error) {
      console.error('Error loading live streams:', error);
    }
  };

  // Abrir lightbox
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Auto-rotate carousel
  useEffect(() => {
    if (gallery.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % gallery.length);
      }, 5000); // 5 seconds per slide
      return () => clearInterval(timer);
    }
  }, [gallery.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!church) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Premium com Logo Personalizada */}
      <ChurchHeader church={church} churchSlug={slug} />

      {/* Hero Section Premium com Imagem de Fundo */}
      <section id="início" className="relative py-32 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden dark:from-blue-900 dark:via-gray-900 dark:to-gray-900">
        {/* Imagem de Fundo (se tiver) */}
        {church.hero_image_url && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${church.hero_image_url})` }}
          />
        )}
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Badge de Boas-vindas */}
          <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
            <p className="text-white font-medium">✨ Bem-vindo à casa de Deus</p>
          </div>

          {/* Nome e Descrição */}
          <div className="max-w-4xl mx-auto text-center">
            {church.logo_url && (
              <img
                src={buildApiUrl(church.logo_url)}
                alt={church.name}
                className="w-32 h-32 mx-auto mb-6 object-contain bg-white rounded-full p-4 shadow-lg"
              />
            )}
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              {church.name}
            </h1>
            
            {church.description && (
              <p className="text-xl md:text-2xl text-blue-100 mb-8">
                {church.description}
              </p>
            )}

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`/church/${slug}/pedidos-oracao`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold text-blue-600 bg-white rounded-full hover:bg-blue-50 transition-colors shadow-lg"
              >
                <Heart className="w-6 h-6" />
                Enviar Pedido de Oração
              </a>
              <a
                href="#cultos"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold text-white border-2 border-white rounded-full hover:bg-white/10 transition-colors"
              >
                <Clock className="w-6 h-6" />
                Ver Horários dos Cultos
              </a>
            </div>
          </div>

          {/* Stats Premium */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 pt-8 sm:pt-12 md:pt-16 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">
                {memberCount}+
              </div>
              <div className="text-sm sm:text-base text-blue-200">Membros</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">
                {eventCount}+
              </div>
              <div className="text-sm sm:text-base text-blue-200">Eventos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">
                {prayerCount}+
              </div>
              <div className="text-sm sm:text-base text-blue-200">Pedidos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Transmissões Ao Vivo e Agendadas */}
      {liveStreams.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium mb-4 dark:bg-red-900 dark:text-red-300">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                TRANSMISSÕES
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 dark:text-white">
                Cultos e Eventos
              </h2>
              <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400">
                Assista aos cultos ao vivo ou acompanhe a agenda
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              {liveStreams.map((stream) => {
                const isLive = stream.status === 'live';
                const isScheduled = stream.status === 'scheduled';

                return (
                  <Card key={stream.id} className={`border-2 shadow-2xl overflow-hidden transition-all ${
                    isLive 
                      ? 'border-red-200 dark:border-red-800 dark:bg-gray-800' 
                      : 'border-blue-200 dark:border-blue-800 dark:bg-gray-800'
                  }`}>
                    <div className="aspect-video bg-gray-900 relative flex items-center justify-center overflow-hidden">
                      {/* Overlay de Bloqueio */}
                      <div className={`absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center z-10 ${
                        isLive ? 'bg-black/90' : 'bg-gradient-to-br from-blue-900/90 to-purple-900/90'
                      }`}>
                        {isLive ? (
                          <>
                            <Youtube className="w-16 h-16 text-red-600 mb-4 animate-pulse" />
                            <h3 className="text-2xl font-bold mb-2">Transmissão Exclusiva</h3>
                            <p className="text-gray-300 mb-6 max-w-sm">
                              Para assistir, faça login ou cadastre-se gratuitamente na nossa plataforma.
                            </p>
                          </>
                        ) : (
                          <>
                            <CalendarCheck className="w-16 h-16 text-blue-400 mb-4" />
                            <h3 className="text-2xl font-bold mb-4">Em Breve</h3>
                            <p className="text-gray-300 mb-6 max-w-sm">
                              Esta transmissão está agendada para:
                            </p>
                            {/* Contagem Regressiva */}
                            <CountdownTimer targetDate={stream.scheduled_start} />
                          </>
                        )}
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stream.title}</h3>
                        
                        {isLive ? (
                          <Badge className="bg-red-600 animate-pulse text-white">
                            <Play className="w-3 h-3 mr-1 fill-white" />
                            AO VIVO
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-600 text-white">
                            <Clock className="w-3 h-3 mr-1" />
                            AGENDADO
                          </Badge>
                        )}
                      </div>

                      {stream.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-6">{stream.description}</p>
                      )}

                      {isLive ? (
                        <>
                          {/* Botão Principal - Assistir na Igreja */}
                          <Link
                            to={`/church/${slug}/ao-vivo`}
                            className="inline-flex items-center gap-3 w-full justify-center px-6 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl text-lg font-bold mb-4"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Assistir na Igreja
                          </Link>
                        </>
                      ) : (
                        <div className="w-full p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl mb-4 text-center">
                          <p className="text-blue-800 dark:text-blue-200 font-medium flex items-center justify-center gap-2">
                            <CalendarCheck className="w-5 h-5" />
                            Início previsto: {new Date(stream.scheduled_start).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}
                          </p>
                        </div>
                      )}

                      {/* Botões para Outras Plataformas */}
                      {(stream.facebook_url || stream.instagram_url || stream.twitch_url) && (
                        <div className="flex flex-wrap gap-3">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Assistir também em:</span>
                          {stream.facebook_url && (
                            <a
                              href={stream.facebook_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                              Facebook
                            </a>
                          )}
                          {stream.instagram_url && (
                            <a
                              href={stream.instagram_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                              Instagram
                            </a>
                          )}
                          {stream.twitch_url && (
                            <a
                              href={stream.twitch_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>
                              Twitch
                            </a>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Carrossel de Imagens */}
      {gallery.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              {/* Slides */}
              <div className="relative h-96 md:h-[500px]">
                {gallery.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                    onClick={() => openLightbox(index)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={slide.image_url}
                      alt={slide.title || 'Igreja'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {slide.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 sm:p-6 md:p-8">
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{slide.title}</h3>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Navigation Dots */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {gallery.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? 'bg-white w-8'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Previous Button */}
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + gallery.length) % gallery.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-2 rounded-full transition-all"
                aria-label="Previous slide"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Next Button */}
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % gallery.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-2 rounded-full transition-all"
                aria-label="Next slide"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Sobre com Layout Premium */}
      <section id="sobre" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-full mb-4">
                Sobre Nós
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Nossa História
              </h2>
            </div>
            
            {church.about_content && (
              <div className="prose prose-lg mx-auto">
                <p className="text-gray-700 text-lg leading-relaxed">{church.about_content}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Ministérios Premium */}
      <section id="ministérios" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-full mb-4 animate-fade-in">
              Sirva com Seus Dons
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Ministérios & Atividades
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Encontre seu lugar e use seus talentos para servir a Deus e ao próximo
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {ministries.map((ministry, index) => (
              <div
                key={ministry.id}
                className="transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <MinistryCard ministry={ministry} variant="premium" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cultos Premium */}
      <section id="cultos" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-full mb-4 animate-fade-in">
              Horários
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Nossos Cultos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Participe de nossos cultos e seja edificado pela Palavra de Deus
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <div
                key={service.id}
                className="transform transition-all duration-300 hover:scale-105 hover:shadow-2xl h-full"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ServiceCard service={service} variant="premium" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eventos Premium */}
      <section id="eventos" className="py-24 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-full mb-4 animate-fade-in">
              Programação
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Próximos Eventos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Eventos especiais para edificar sua vida e sua família
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {events.slice(0, 6).map((event, index) => (
              <div
                key={event.id}
                className="transform transition-all duration-300 hover:scale-105 hover:shadow-2xl h-full"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <EventCard event={event} variant="premium" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contato Premium com Mapa */}
      <section id="contato" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded-full mb-4">
              Fale Conosco
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Entre em Contato
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Estamos aqui para ouvir você e sua família
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {/* Informações de Contato */}
            <div className="space-y-8">
              {/* Endereço */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Endereço</h3>
                  <p className="text-gray-600">
                    {church.address_street && (
                      <>
                        {church.address_street}
                        {church.address_number && `, ${church.address_number}`}
                        <br />
                      </>
                    )}
                    {church.address_city && (
                      <>
                        {church.address_city} - {church.address_state}
                        {church.address_zip && ` • ${church.address_zip}`}
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Telefone */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Telefone</h3>
                  {church.phone && (
                    <p className="text-gray-600">
                      <a href={`tel:${church.phone}`} className="hover:text-blue-600">
                        {church.phone}
                      </a>
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                  {church.email && (
                    <p className="text-gray-600">
                      <a href={`mailto:${church.email}`} className="hover:text-blue-600">
                        {church.email}
                      </a>
                    </p>
                  )}
                </div>
              </div>

              {/* Redes Sociais */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Redes Sociais</h3>
                <div className="flex gap-4">
                  {church.facebook_url && (
                    <a 
                      href={church.facebook_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                    >
                      <Facebook className="w-6 h-6" />
                    </a>
                  )}
                  {church.instagram_url && (
                    <a 
                      href={church.instagram_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                    >
                      <Instagram className="w-6 h-6" />
                    </a>
                  )}
                  {church.youtube_url && (
                    <a 
                      href={church.youtube_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white hover:bg-red-700 transition-colors"
                    >
                      <Youtube className="w-6 h-6" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Card do Endereço com Links para Mapas */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Endereço</h3>
                  <address className="text-gray-600 not-italic">
                    {church.address_street && (
                      <>
                        {church.address_street}, {church.address_number}
                        <br />
                      </>
                    )}
                    {church.address_neighborhood && (
                      <>{church.address_neighborhood}<br /></>
                    )}
                    {church.address_city && (
                      <>
                        {church.address_city} - {church.address_state}
                        {church.address_zip && ` • ${church.address_zip}`}
                      </>
                    )}
                  </address>
                  
                  {/* Links para Mapas */}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${church.address_street} ${church.address_number}, ${church.address_city}, ${church.address_state}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                      Ver no Google Maps
                    </a>
                    <a
                      href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(
                        `${church.address_street} ${church.address_number}, ${church.address_city}, ${church.address_state}, Brasil`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      Ver no OpenStreetMap
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Botão WhatsApp Flutuante */}
      {church.whatsapp && (
        <a
          href={`https://wa.me/${church.whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-6 py-4 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="hidden sm:inline font-medium">WhatsApp</span>
        </a>
      )}

      {/* Lightbox - Galeria em Tela Cheia */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={gallery.map(img => ({ src: img.image_url, title: img.title || '' }))}
        on={{
          view: ({ index }) => setLightboxIndex(index),
        }}
      />

      {/* Footer Premium */}
      <ChurchFooter church={church} churchSlug={slug} />
    </div>
  );
}
