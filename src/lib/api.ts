/**
 * API Endpoints
 * Centraliza todas as URLs da API para facilitar manutenção
 */

import { config } from './config';

export const api = Object.freeze({
  // Endpoints da API
  pedidos: `${config.apiUrl}/pedidos.php`,
  login: `${config.apiUrl}/login.php`,
  telegram: `${config.apiUrl}/enviar_telegram.php`,
  relatorio: `${config.apiUrl}/enviar_relatorio.php`,
  liveStatus: `${config.apiUrl}/live_status.php`,

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
