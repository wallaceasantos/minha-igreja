/**
 * ChurchFree - Site Público para Plano Essencial
 * ============================================
 * Layout simples e básico para igrejas no plano gratuito
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChurchHeader, ChurchFooter, MinistryCard, ServiceCard, EventCard } from './ChurchBase';
import type { ChurchData, Ministry, Service, Event } from './ChurchBase';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/config';

export default function ChurchFree() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [church, setChurch] = useState<ChurchData | null>(null);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    loadChurchData();
  }, [slug]);

  const loadChurchData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados da igreja
      const churchRes = await fetch(buildApiUrl(`/api/church/slug/${slug}`));
      const churchData = await churchRes.json();
      
      if (churchData.success) {
        setChurch(churchData.data);
        
        // Carregar ministérios, cultos e eventos
        await Promise.all([
          loadMinistries(churchData.data.id),
          loadServices(churchData.data.id),
          loadEvents(churchData.data.id),
          loadStats(churchData.data.id),
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
    if (data.success) setEvents(data.data);
  };

  const loadStats = async (churchId: number) => {
    try {
      const res = await fetch(buildApiUrl(`/api/church/${churchId}/stats`));
      const data = await res.json();
      if (data.success) setMemberCount(data.data.member_count || 0);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

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
      {/* Header */}
      <ChurchHeader church={church} churchSlug={slug} />

      {/* Hero Section */}
      <section id="início" className="py-20 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {church.name}
          </h1>
          {church.description && (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {church.description}
            </p>
          )}
          
          {/* Stats Simples */}
          <div className="mt-12">
            <div className="inline-block bg-white rounded-lg shadow-md px-8 py-4">
              <p className="text-3xl font-bold text-blue-600">{memberCount > 0 ? `${memberCount}+` : '0'}</p>
              <p className="text-gray-600">Membros</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section id="sobre" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Sobre a Igreja</h2>
          {church.about_content && (
            <div className="max-w-3xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed">{church.about_content}</p>
            </div>
          )}
        </div>
      </section>

      {/* Ministérios */}
      <section id="ministérios" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Ministérios</h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {ministries.map((ministry) => (
              <MinistryCard key={ministry.id} ministry={ministry} variant="free" />
            ))}
          </div>
        </div>
      </section>

      {/* Cultos */}
      <section id="cultos" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Cultos</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} variant="free" />
            ))}
          </div>
        </div>
      </section>

      {/* Eventos */}
      <section id="eventos" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Próximos Eventos</h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {events.slice(0, 4).map((event) => (
              <EventCard key={event.id} event={event} variant="free" />
            ))}
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Contato</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Endereço */}
            <div className="text-center">
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
                  </>
                )}
              </p>
            </div>

            {/* Telefone */}
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Telefone</h3>
              {church.phone && (
                <p className="text-gray-600">
                  <a href={`tel:${church.phone}`} className="hover:text-blue-600">
                    {church.phone}
                  </a>
                </p>
              )}
            </div>

            {/* Email */}
            <div className="text-center">
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
        </div>
      </section>

      {/* Footer */}
      <ChurchFooter church={church} churchSlug={slug} />
    </div>
  );
}
