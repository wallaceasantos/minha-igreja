/**
 * Google Analytics 4 Service
 * 
 * Serviço para rastreamento de eventos e pageviews no Google Analytics 4
 * 
 * @see https://analytics.google.com/
 * @see https://developers.google.com/analytics/devguides/collection/gtagjs
 */

// Declaração do tipo para gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

/**
 * Tipos de eventos personalizados
 */
export type AnalyticsEvent =
  | 'page_view'
  | 'login'
  | 'logout'
  | 'pedido_oracao'
  | 'contato'
  | 'download'
  | 'video_start'
  | 'video_complete'
  | 'search'
  | 'click_outbound';

/**
 * Interface para eventos customizados
 */
export interface AnalyticsEventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: any;
}

/**
 * Verifica se o Google Analytics está disponível
 */
const isGAAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

/**
 * Envia evento para o Google Analytics
 *
 * @param eventName - Nome do evento
 * @param params - Parâmetros adicionais do evento
 */
export const sendEvent = (
  eventName: AnalyticsEvent | string,
  params?: AnalyticsEventParams
): void => {
  if (!isGAAvailable()) {
    console.warn('Google Analytics não está disponível');
    return;
  }

  // Usa variável de ambiente para o ID do GA
  const gaId = import.meta.env.VITE_GA_ID || '';
  
  if (!gaId) {
    console.warn('Google Analytics ID não configurado');
    return;
  }

  window.gtag?.('event', eventName, {
    send_to: gaId,
    ...params,
  });

  // Log em desenvolvimento
  if (import.meta.env.DEV) {
    console.log('📊 [Analytics] Evento:', eventName, params || '');
  }
};

/**
 * Rastreia visualização de página
 *
 * @param pagePath - Caminho da página (ex: /pedidos-oracao)
 * @param pageTitle - Título da página (opcional)
 */
export const trackPageView = (pagePath: string, pageTitle?: string): void => {
  if (!isGAAvailable()) {
    console.warn('Google Analytics não está disponível');
    return;
  }

  // Usa variável de ambiente para o ID do GA
  const gaId = import.meta.env.VITE_GA_ID || '';
  
  if (!gaId) {
    console.warn('Google Analytics ID não configurado');
    return;
  }

  window.gtag?.('config', gaId, {
    page_path: pagePath,
    page_title: pageTitle || document.title,
    page_location: window.location.href,
  });

  // Log em desenvolvimento
  if (import.meta.env.DEV) {
    console.log('📊 [Analytics] Page View:', pagePath);
  }
};

/**
 * Rastreia login de usuário
 * 
 * @param userId - ID do usuário (opcional, não use dados sensíveis)
 */
export const trackLogin = (userId?: string): void => {
  sendEvent('login', {
    event_category: 'autenticação',
    event_label: userId ? 'Usuário logado' : 'Login realizado',
  });
};

/**
 * Rastreia logout de usuário
 */
export const trackLogout = (): void => {
  sendEvent('logout', {
    event_category: 'autenticação',
    event_label: 'Usuário deslogado',
  });
};

/**
 * Rastreia envio de pedido de oração
 * 
 * @param categoria - Categoria do pedido (pedido, agradecimento, testemunho)
 * @param tema - Tema do pedido
 */
export const trackPedidoOracao = (categoria: string, tema: string): void => {
  sendEvent('pedido_oracao', {
    event_category: 'engajamento',
    event_label: `${categoria} - ${tema}`,
    categoria,
    tema,
  });
};

/**
 * Rastreia envio de formulário de contato
 * 
 * @param assunto - Assunto do contato
 */
export const trackContato = (assunto: string): void => {
  sendEvent('contato', {
    event_category: 'engajamento',
    event_label: assunto,
    assunto,
  });
};

/**
 * Rastreia início de vídeo
 * 
 * @param videoTitle - Título do vídeo
 * @param videoDuration - Duração do vídeo em segundos
 */
export const trackVideoStart = (videoTitle: string, videoDuration?: number): void => {
  sendEvent('video_start', {
    event_category: 'mídia',
    event_label: videoTitle,
    video_title: videoTitle,
    video_duration: videoDuration,
  });
};

/**
 * Rastreia conclusão de vídeo
 * 
 * @param videoTitle - Título do vídeo
 */
export const trackVideoComplete = (videoTitle: string): void => {
  sendEvent('video_complete', {
    event_category: 'mídia',
    event_label: videoTitle,
    video_title: videoTitle,
  });
};

/**
 * Rastreia clique em link externo
 * 
 * @param url - URL do link
 * @param linkText - Texto do link
 */
export const trackClickOutbound = (url: string, linkText?: string): void => {
  sendEvent('click_outbound', {
    event_category: 'navegação',
    event_label: linkText || url,
    url,
    link_text: linkText,
  });
};

/**
 * Rastreia busca interna
 * 
 * @param searchTerm - Termo pesquisado
 */
export const trackSearch = (searchTerm: string): void => {
  sendEvent('search', {
    event_category: 'navegação',
    event_label: searchTerm,
    search_term: searchTerm,
  });
};

/**
 * Rastreia download de arquivo
 * 
 * @param fileName - Nome do arquivo
 * @param fileType - Tipo do arquivo (pdf, doc, etc.)
 */
export const trackDownload = (fileName: string, fileType?: string): void => {
  sendEvent('download', {
    event_category: 'engajamento',
    event_label: fileName,
    file_name: fileName,
    file_type: fileType,
  });
};

/**
 * Hook para tracking automático de pageviews no React Router
 * 
 * @example
 * ```tsx
 * import { useEffect } from 'react';
 * import { useLocation } from 'react-router-dom';
 * import { trackPageView } from '@/lib/analytics';
 * 
 * function App() {
 *   const location = useLocation();
 *   
 *   useEffect(() => {
 *     trackPageView(location.pathname);
 *   }, [location]);
 *   
 *   return <Routes>...</Routes>;
 * }
 * ```
 */
export const usePageTracking = () => {
  // Esta função deve ser usada em conjunto com useEffect do React
  // Implementação no componente App.tsx ou main.tsx
};

// Exporta tudo em um objeto único
export const analytics = {
  sendEvent,
  trackPageView,
  trackLogin,
  trackLogout,
  trackPedidoOracao,
  trackContato,
  trackVideoStart,
  trackVideoComplete,
  trackClickOutbound,
  trackSearch,
  trackDownload,
  isGAAvailable,
};

export default analytics;
