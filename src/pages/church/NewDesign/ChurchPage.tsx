import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import LiveSection from './LiveSection';
import AboutSection from './AboutSection';
import MinistriesSection from './MinistriesSection';
import CultsSection from './CultsSection';
import EventsSection from './EventsSection';
import ContactSection from './ContactSection';
import Footer from './Footer';
import PrayerModal from './PrayerModal';
import AdminModal from './AdminModal';
import { useChurch } from '@/hooks/useChurch';
import { buildApiUrl } from '@/lib/config';
import { ContactMessage, PrayerRequest } from '../types';
import { toast } from 'sonner';

export default function ChurchPage() {
  // Estados para controlar os Modais e Tema
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPrayerOpen, setIsPrayerOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Dados reais do backend
  const { church, loading: churchLoading, error: churchError } = useChurch();
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [prayersCount, setPrayersCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);

  // Dados dinâmicos do backend
  const [ministries, setMinistries] = useState<any[]>([]);
  const [cults, setCults] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [membersCount, setMembersCount] = useState(0);
  const [loadingData, setLoadingData] = useState(true);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  // Se não houver igreja (erro ou slug inválido), desativa loadingData
  useEffect(() => {
    if (!church && !churchLoading) {
      console.log('[ChurchPage] Sem igreja e churchLoading=false, desativando loadingData');
      setLoadingData(false);
    }
  }, [church, churchLoading]);

  // Carregar dados reais da API quando a igreja estiver disponível
  useEffect(() => {
    if (!church?.id || !church?.slug) {
      console.log('[ChurchPage] church não disponível ainda:', { id: church?.id, slug: church?.slug });
      return;
    }

    const loadData = async () => {
      setLoadingData(true);
      try {
        // Aplicar cores do tema da igreja no documento
        if (church.theme_primary_color) {
          document.documentElement.style.setProperty('--primary', church.theme_primary_color);
        }
        if (church.theme_secondary_color) {
          document.documentElement.style.setProperty('--secondary', church.theme_secondary_color);
        }

        // Carregar pedidos de oração
        const prayersRes = await fetch(buildApiUrl(`/api/pedidos?church_id=${church.id}`));
        const prayersData = await prayersRes.json();
        if (prayersData.success) {
          const mappedPrayers: PrayerRequest[] = prayersData.data.map((p: any) => ({
            id: String(p.id),
            name: p.nome || 'Anônimo',
            email: p.email || undefined,
            phone: p.telefone || undefined,
            request: p.oracao || p.mensagem || '',
            createdAt: p.created_at || new Date().toISOString(),
            status: p.status || 'pending',
          }));
          setPrayers(mappedPrayers);
          setPrayersCount(mappedPrayers.length);
        }

        // Carregar ministérios (endpoint público por slug)
        try {
          console.log('🔄 Buscando ministérios para:', church.slug);
          const ministriesRes = await fetch(buildApiUrl(`/api/ministries/public/${church.slug}`));
          const ministriesData = await ministriesRes.json();
          
          if (ministriesData.success) {
            console.log('✅ Ministérios recebidos:', ministriesData.data.length);
            setMinistries(ministriesData.data || []);
          } else {
            console.warn('⚠️ API retornou sucesso: false para ministérios');
          }
        } catch (e) {
          console.error('❌ Erro ao carregar ministérios:', e);
        }

        // Carregar cultos fixos (endpoint público por slug)
        try {
          const cultsRes = await fetch(buildApiUrl(`/api/services/public/${church.slug}`));
          const cultsData = await cultsRes.json();
          if (cultsData.success) {
            setCults(cultsData.data || []);
          }
        } catch (e) {
          console.error('Erro ao carregar cultos:', e);
        }

        // Carregar eventos (endpoint público por slug)
        try {
          console.log('🔄 Buscando eventos para:', church.slug);
          const eventsRes = await fetch(buildApiUrl(`/api/events/public/${church.slug}`));
          const eventsData = await eventsRes.json();
          
          if (eventsData.success) {
            console.log('✅ Eventos recebidos:', eventsData.data.length, eventsData.data);
            setEvents(eventsData.data || []);
          } else {
            console.warn('⚠️ API retornou sucesso: false para eventos');
          }
        } catch (e) {
          console.error('❌ Erro ao carregar eventos:', e);
        }

        // Carregar estatísticas (membros)
        try {
          // Usar endpoint por ID (o endpoint por slug não existe)
          let statsRes = await fetch(buildApiUrl(`/api/church/${church.id}/stats`));
          
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            if (statsData.success) {
              setMembersCount(statsData.data?.members || 0);
              setPrayersCount(statsData.data?.prayers?.answered || 0);
              setEventsCount(statsData.data?.events || 0);
            }
          }
        } catch (e) {
          console.log('Stats endpoint não disponível, usando fallback');
        }

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [church?.id, church?.slug]);

  // Handler: Envio de Oração para API (usando endpoint público como PedidosOracaoPublico.tsx)
  const handlePrayerSubmit = async (prayer: Omit<PrayerRequest, 'id' | 'createdAt' | 'status'>) => {
    if (!church?.slug) {
      toast.error('Igreja não encontrada');
      return;
    }

    try {
      const response = await fetch(buildApiUrl('/api/pedidos/public'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          church_slug: church.slug,
          nome: prayer.name || 'Anônimo',
          email: prayer.email || '',
          categoria: 'pedido',
          tema: 'outros',
          oracao: prayer.request,
          lgpd: true,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Erro ao enviar');

      const newPrayer: PrayerRequest = {
        ...prayer,
        id: result.data?.id || Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: 'pending',
      };
      setPrayers(prev => [...prev, newPrayer]);
      setPrayersCount(prev => prev + 1);

      toast.success('Pedido de oração enviado! 🙏');
    } catch (error) {
      console.error('Erro ao enviar oração:', error);
      toast.error('Erro ao enviar pedido de oração');
    }
  };

  // Handler: Atualizar Status de Oração
  const handleUpdatePrayerStatus = async (id: string, status: 'pending' | 'prayed' | 'answered') => {
    try {
      const response = await fetch(buildApiUrl(`/api/pedidos/${id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Erro ao atualizar');

      setPrayers(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      toast.success('Status atualizado!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  // Handler: Deletar Oração
  const handleDeletePrayer = async (id: string) => {
    try {
      const response = await fetch(buildApiUrl(`/api/pedidos/${id}`), {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao deletar');

      setPrayers(prev => prev.filter(p => p.id !== id));
      toast.success('Pedido removido');
    } catch (error) {
      console.error('Erro ao deletar oração:', error);
      toast.error('Erro ao remover pedido');
    }
  };

  // Handler: Envio de Mensagem de Contato para API
  const handleContactSubmit = async (msg: Omit<ContactMessage, 'id' | 'createdAt'>) => {
    if (!church?.id) {
      toast.error('Igreja não encontrada');
      return;
    }

    try {
      const response = await fetch(buildApiUrl('/api/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          church_id: church.id,
          name: msg.name,
          email: msg.email,
          phone: msg.phone,
          message: msg.message,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Erro ao enviar');

      const newMessage: ContactMessage = {
        ...msg,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setContactMessages(prev => [...prev, newMessage]);

      toast.success('Mensagem enviada com sucesso! 📧');
    } catch (error) {
      console.error('Erro ao enviar contato:', error);
      toast.error('Erro ao enviar mensagem');
    }
  };

  // Handler: Deletar Mensagem
  const handleDeleteMessage = async (id: string) => {
    setContactMessages(prev => prev.filter(m => m.id !== id));
    toast.success('Mensagem removida');
  };

  // Loading state
  if (churchLoading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400">Carregando site da igreja...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (churchError || !church) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">⛪</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Igreja não encontrada</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {churchError || 'O site desta igreja não está disponível no momento.'}
          </p>
          <a href="/" className="text-indigo-600 hover:underline">← Voltar para MinhaIgreja</a>
        </div>
      </div>
    );
  }

  return (
    // Envelope para controle do tema Dark/Light
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300 font-sans">

        {/* 1. Navbar Fixa com dados reais */}
        <Navbar
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onOpenPrayer={() => setIsPrayerOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
          churchName={church.name}
          churchSlug={church.slug}
          churchLogo={church.logo_url ? buildApiUrl(church.logo_url) : null}
        />

        {/* 2. Conteúdo Principal */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 relative">

          {/* Hero Section com dados reais */}
          <div className="relative z-10">
            <HeroSection
              onOpenPrayer={() => setIsPrayerOpen(true)}
              prayersCount={prayersCount}
              churchName={church.name}
              churchDescription={church.description || 'Um lugar de fé, esperança e amor.'}
              membersCount={membersCount}
              eventsCount={eventsCount}
            />
          </div>

          {/* Seção de Live ao Vivo (Se houver) */}
          <LiveSection churchSlug={church.slug} />

          {/* Grid Layout (Estilo Bento) */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Coluna Esquerda (Sobre e Ministérios) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="relative z-10">
                <AboutSection
                  churchName={church.name}
                  aboutContent={church.about_content || ''}
                  address={church.address_street || ''}
                  neighborhood={church.address_neighborhood || ''}
                  city={church.address_city || ''}
                  state={church.address_state || ''}
                />
              </div>
              <div className="relative z-10">
                <MinistriesSection
                  ministries={ministries}
                />
              </div>
            </div>

            {/* Coluna Direita (Cultos e Eventos) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative z-10">
                  <CultsSection
                    cults={cults}
                  />
                </div>
                <div className="relative z-10">
                  <EventsSection
                    events={events}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Contato com dados reais */}
          <div className="relative z-10">
            <ContactSection
              onSubmitMessage={handleContactSubmit}
              churchName={church.name}
              address={church.address_street || ''}
              neighborhood={church.address_neighborhood || ''}
              city={church.address_city || ''}
              state={church.address_state || ''}
              zip={church.address_zip || ''}
              phone={church.phone || church.whatsapp || ''}
              email={church.email || ''}
              facebookUrl={church.facebook_url || ''}
              instagramUrl={church.instagram_url || ''}
              youtubeUrl={church.youtube_url || ''}
            />
          </div>
        </main>

        {/* 3. Footer com dados reais */}
        <Footer
          churchName={church.name}
          churchDescription={church.description || ''}
          churchLogo={church.logo_url ? buildApiUrl(church.logo_url) : null}
          phone={church.phone || church.whatsapp || ''}
          email={church.email || ''}
          facebookUrl={church.facebook_url || ''}
          instagramUrl={church.instagram_url || ''}
          youtubeUrl={church.youtube_url || ''}
        />

        {/* 4. Modais */}
        <PrayerModal
          isOpen={isPrayerOpen}
          onClose={() => setIsPrayerOpen(false)}
          onSubmitPrayer={handlePrayerSubmit}
          churchSlug={church.slug}
          churchName={church.name}
          churchId={church.id}
        />
        <AdminModal 
          isOpen={isAdminOpen} 
          onClose={() => setIsAdminOpen(false)} 
          churchSlug={church.slug}
        />
        
      </div>
    </div>
  );
}
