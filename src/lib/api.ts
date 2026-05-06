/**
 * API Endpoints
 * Centraliza todas as URLs da API para facilitar manutenção
 * Backend: Node.js + Express
 */

import { config } from './config';

export const api = Object.freeze({
  // Igrejas (Church)
  churches: `${config.apiUrl}/church`,
  churchBySlug: (slug: string) => `${config.apiUrl}/church/${slug}`,
  createChurch: `${config.apiUrl}/church`,
  
  // Contato
  contact: `${config.apiUrl}/contact`,
  
  // Autenticação
  login: `${config.apiUrl}/auth/login`,
  register: `${config.apiUrl}/auth/register`,
  
  // Testes
  health: `${config.apiUrl}/health`,
  testDb: `${config.apiUrl}/test-db`,
  
  // URLs externas
  youtube: {
    channel: config.youtubeChannel,
    getEmbedUrl: (videoId?: string) => {
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return `https://www.youtube.com/embed/live_stream?channel=${config.youtubeChannel}`;
    },
  },

  // Redes sociais (serão carregadas dinamicamente por igreja)
  social: {
    facebook: '',
    instagram: '',
    youtube: '',
  },
});

// Tipos
export type ApiEndpoint = keyof typeof api;
