/**
 * ChurchBase - Componentes Compartilhados para Sites de Igreja
 * ============================================
 * Contém todos os componentes que são usados tanto no plano Essencial quanto Premium
 */

import React, { useState, useEffect } from 'react';
import { Heart, Calendar, Users, MapPin, Phone, Clock } from 'lucide-react';

// ============================================
// INTERFACES
// ============================================

export interface ChurchData {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  about_content: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address_street: string | null;
  address_number: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  theme_primary_color: string;
  theme_secondary_color: string;
  plan_type: string;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
}

export interface Ministry {
  id: number;
  name: string;
  description: string | null;
  icon: string;
}

export interface Service {
  id: number;
  day_of_week: string;
  service_name: string;
  service_time: string;
  description: string | null;
}

export interface Event {
  id: number;
  title: string;
  description: string | null;
  event_type: string;
  start_datetime: string;
  location: string | null;
}

// ============================================
// COMPONENTES COMPARTILHADOS
// ============================================

/**
 * Header com Menu de Navegação
 */
export const ChurchHeader: React.FC<{
  church: ChurchData;
  adminUrl?: string;
  churchSlug?: string;
}> = ({ church, adminUrl = '/admin/dashboard', churchSlug }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Carregar preferência salva
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b dark:bg-gray-900/95 dark:border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo e Nome */}
          <div className="flex items-center gap-3">
            {church.logo_url ? (
              <img
                src={church.logo_url}
                alt={church.name}
                className="w-12 h-12 object-contain"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {church.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{church.name}</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Bem-vindo à casa de Deus</p>
            </div>
          </div>

          {/* Menu Desktop */}
          <nav className="hidden lg:flex items-center gap-6">
            <a href={churchSlug ? `/church/${churchSlug}#início` : '#início'} className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Início</a>
            <a href={churchSlug ? `/church/${churchSlug}#sobre` : '#sobre'} className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Sobre</a>
            <a href={churchSlug ? `/church/${churchSlug}#ministérios` : '#ministérios'} className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Ministérios</a>
            <a href={churchSlug ? `/church/${churchSlug}#cultos` : '#cultos'} className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Cultos</a>
            <a href={churchSlug ? `/church/${churchSlug}#eventos` : '#eventos'} className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Eventos</a>
            <a href={churchSlug ? `/church/${churchSlug}#contato` : '#contato'} className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Contato</a>
          </nav>

          {/* Botões */}
          <div className="flex items-center gap-3">
            {/* Toggle Dark Mode */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              aria-label="Alternar modo escuro"
            >
              {darkMode ? (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            <a
              href={churchSlug ? `/church/${churchSlug}/pedidos-oracao` : '/pedidos-oracao'}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              <Heart className="w-4 h-4" />
              Pedidos de Oração
            </a>
            <a
              href={adminUrl}
              className="hidden lg:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              Área Admin
            </a>

            {/* Menu Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 py-4 border-t dark:border-gray-800">
            <nav className="flex flex-col gap-4">
              <a href={churchSlug ? `/church/${churchSlug}#início` : '#início'} className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Início</a>
              <a href={churchSlug ? `/church/${churchSlug}#sobre` : '#sobre'} className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Sobre</a>
              <a href={churchSlug ? `/church/${churchSlug}#ministérios` : '#ministérios'} className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Ministérios</a>
              <a href={churchSlug ? `/church/${churchSlug}#cultos` : '#cultos'} className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Cultos</a>
              <a href={churchSlug ? `/church/${churchSlug}#eventos` : '#eventos'} className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Eventos</a>
              <a href={churchSlug ? `/church/${churchSlug}#contato` : '#contato'} className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400">Contato</a>
              <a
                href={churchSlug ? `/church/${churchSlug}/pedidos-oracao` : '/pedidos-oracao'}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                <Heart className="w-4 h-4" />
                Pedidos de Oração
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

/**
 * Footer Padrão
 */
export const ChurchFooter: React.FC<{
  church: ChurchData;
  churchSlug?: string;
}> = ({ church, churchSlug }) => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        {/* Informações de Contato */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Endereço */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Endereço
            </h3>
            <p className="text-gray-400">
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
                  <br />
                </>
              )}
              {church.address_zip && church.address_zip}
            </p>
          </div>

          {/* Telefone e Email */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contato
            </h3>
            {church.phone && (
              <p className="text-gray-400 mb-2">
                <a href={`tel:${church.phone}`} className="hover:text-white">
                  {church.phone}
                </a>
              </p>
            )}
            {church.email && (
              <p className="text-gray-400">
                <a href={`mailto:${church.email}`} className="hover:text-white">
                  {church.email}
                </a>
              </p>
            )}
          </div>

          {/* Redes Sociais */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Redes Sociais</h3>
            <div className="flex gap-3">
              {church.facebook_url && (
                <a href={church.facebook_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  Facebook
                </a>
              )}
              {church.instagram_url && (
                <a href={church.instagram_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  Instagram
                </a>
              )}
              {church.youtube_url && (
                <a href={church.youtube_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  YouTube
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} {church.name}. Todos os direitos reservados.</p>
          <p className="mt-2">
            Site criado com{' '}
            <a href="https://minhaigreja.com.br" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
              MinhaIgreja
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

/**
 * Card de Ministério Premium
 */
export const MinistryCard: React.FC<{
  ministry: Ministry;
  variant?: 'free' | 'premium';
}> = ({ ministry, variant = 'free' }) => {
  const IconComponent = getMinistryIcon(ministry.icon);

  if (variant === 'premium') {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-gray-100 hover:border-blue-200">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
          <IconComponent className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">{ministry.name}</h3>
        {ministry.description && (
          <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">{ministry.description}</p>
        )}
      </div>
    );
  }

  // Versão Free (mais simples)
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
        <IconComponent className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{ministry.name}</h3>
        {ministry.description && (
          <p className="text-sm text-gray-600">{ministry.description}</p>
        )}
      </div>
    </div>
  );
};

/**
 * Card de Culto/Serviço Premium
 */
export const ServiceCard: React.FC<{
  service: Service;
  variant?: 'free' | 'premium';
}> = ({ service, variant = 'premium' }) => {
  if (variant === 'premium') {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-gray-100 hover:border-blue-200 hover:scale-105 h-full flex flex-col">
        <div className="flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">{service.service_name}</h3>
              <div className="flex items-center gap-2 mt-2 text-gray-600 group-hover:text-blue-600 transition-colors duration-300">
                <Clock className="w-4 h-4" />
                <span>{formatDay(service.day_of_week)} às {formatTime(service.service_time)}</span>
              </div>
            </div>
          </div>
          {service.description && (
            <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300 line-clamp-3 flex-1">{service.description}</p>
          )}
        </div>
      </div>
    );
  }

  // Versão Free
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-2">{service.service_name}</h3>
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
        <Clock className="w-4 h-4" />
        <span>{formatDay(service.day_of_week)} - {formatTime(service.service_time)}</span>
      </div>
      {service.description && (
        <p className="text-sm text-gray-600">{service.description}</p>
      )}
    </div>
  );
};

/**
 * Card de Evento Premium
 */
export const EventCard: React.FC<{
  event: Event;
  variant?: 'free' | 'premium';
}> = ({ event, variant = 'premium' }) => {
  if (variant === 'premium') {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-gray-100 hover:border-blue-200 hover:scale-105 h-full flex flex-col">
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full mb-2 group-hover:bg-blue-200 transition-colors duration-300">
                {event.event_type}
              </span>
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">{event.title}</h3>
            </div>
          </div>
          {event.description && (
            <p className="text-gray-600 mb-4 group-hover:text-gray-700 transition-colors duration-300 line-clamp-3 flex-1">{event.description}</p>
          )}
          <div className="flex flex-col gap-2 text-sm text-gray-600 group-hover:text-blue-600 transition-colors duration-300 mt-auto">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDateTime(event.start_datetime)}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Versão Free
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
      {event.description && (
        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
      )}
      <div className="text-sm text-gray-600">
        {formatDateTime(event.start_datetime)}
        {event.location && ` • ${event.location}`}
      </div>
    </div>
  );
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function getMinistryIcon(iconName: string) {
  const icons: Record<string, any> = {
    'Heart': Heart,
    'Users': Users,
    'Calendar': Calendar,
    'Music': () => <span>🎵</span>,
    'Star': () => <span>⭐</span>,
  };
  return icons[iconName] || Heart;
}

function formatDay(day: string): string {
  const days: Record<string, string> = {
    'Sunday': 'Domingo',
    'Monday': 'Segunda-feira',
    'Tuesday': 'Terça-feira',
    'Wednesday': 'Quarta-feira',
    'Thursday': 'Quinta-feira',
    'Friday': 'Sexta-feira',
    'Saturday': 'Sábado',
  };
  return days[day] || day;
}

function formatTime(time: string): string {
  if (!time) return '';
  // Remove segundos se existir
  return time.split(':').slice(0, 2).join(':');
}

function formatDateTime(datetime: string): string {
  if (!datetime) return '';
  const date = new Date(datetime);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
