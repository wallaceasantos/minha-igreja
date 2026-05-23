/**
 * Hook: useChurch
 * ================
 * Carrega dados dinâmicos da igreja baseado no subdomínio/domínio
 * 
 * USO:
 * const { church, loading, error } = useChurch();
 * 
 * if (loading) return <Loading />;
 * if (error) return <Error message={error} />;
 * 
 * return (
 *   <div>
 *     <h1>{church?.name}</h1>
 *     <img src={church?.logo_url} alt={church?.name} />
 *   </div>
 * );
 */

import { useState, useEffect } from 'react';
import { buildApiUrl } from '@/lib/config';

export interface ChurchData {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  about_content: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  hero_image_url: string | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  latitude: string | null;
  longitude: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  youtube_channel_id: string | null;
  theme_primary_color: string;
  theme_secondary_color: string;
  plan_type: 'free' | 'essential' | 'premium' | 'enterprise';
}

interface UseChurchReturn {
  church: ChurchData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Extrai o slug/subdomínio da URL atual
 */
function extractSlug(): string {
  // Extrair slug da rota /igreja/:slug
  const pathParts = window.location.pathname.split('/');
  const churchIndex = pathParts.indexOf('igreja');
  if (churchIndex !== -1 && pathParts[churchIndex + 1]) {
    return pathParts[churchIndex + 1];
  }

  // Em desenvolvimento (localhost), usa parâmetro da URL como fallback
  if (window.location.hostname === 'localhost') {
    const params = new URLSearchParams(window.location.search);
    const churchParam = params.get('church');
    return churchParam || '';
  }

  // Em produção, usa subdomínio
  const hostname = window.location.hostname;
  const parts = hostname.split('.');

  // Remove www se existir
  if (parts[0] === 'www') {
    parts.shift();
  }

  // Se tiver mais de 2 partes, tem subdomínio
  if (parts.length > 2) {
    return parts[0] || '';
  }

  // Fallback
  return '';
}

/**
 * Aplica as cores do tema no documento
 */
function applyTheme(primary: string | undefined, secondary: string | undefined): void {
  if (!primary || !secondary) return;
  
  const root = document.documentElement;

  // Aplica cores CSS custom properties
  root.style.setProperty('--theme-primary', primary);
  root.style.setProperty('--theme-secondary', secondary);

  // Aplica classe de tema
  root.setAttribute('data-theme-primary', primary);
  root.setAttribute('data-theme-secondary', secondary);
}

/**
 * Hook principal para carregar dados da igreja
 */
export function useChurch(): UseChurchReturn {
  const [church, setChurch] = useState<ChurchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChurch = async () => {
    try {
      const slug = extractSlug();
      console.log('[useChurch] Slug extraído:', slug);

      // Se não tiver slug, é o domínio principal (landing page)
      if (!slug) {
        console.log('[useChurch] Sem slug, definindo church como null');
        setChurch(null);
        setLoading(false);
        return;
      }

      // Busca dados da igreja na API
      const apiUrl = buildApiUrl(`/api/church/slug/${slug}`);
      console.log('[useChurch] Buscando dados em:', apiUrl);
      const response = await fetch(apiUrl);
      console.log('[useChurch] Resposta da API:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Igreja não encontrada');
        }
        throw new Error('Erro ao carregar dados da igreja');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao carregar igreja');
      }
      
      const churchData = result.data;
      setChurch(churchData);
      
      // Aplica cores do tema
      if (churchData.theme_primary_color && churchData.theme_secondary_color) {
        applyTheme(churchData.theme_primary_color, churchData.theme_secondary_color);
      }
      
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('[useChurch] Erro ao carregar igreja:', errorMessage, err);
      setError(errorMessage);
      setChurch(null);
    } finally {
      console.log('[useChurch] Finalizando loading');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChurch();
  }, []);

  return {
    church,
    loading,
    error,
    refetch: loadChurch,
  };
}

/**
 * Hook para verificar se é o domínio principal
 */
export function useIsMainDomain(): boolean {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // Remove www
  const cleanParts = parts[0] === 'www' ? parts.slice(1) : parts;
  
  // Domínio principal tem 2 ou 3 partes (com TLD duplo .com.br)
  return cleanParts.length <= 3;
}

/**
 * Hook para obter URL do subdomínio
 */
export function useSubdomainUrl(slug: string): string {
  const mainDomain = getMainDomain();
  return `https://${slug}.${mainDomain}`;
}

/**
 * Obtém o domínio principal da plataforma
 */
function getMainDomain(): string {
  // Em produção: minhaigreja.app
  // Em desenvolvimento: localhost
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'localhost';
  }
  
  const parts = hostname.split('.');
  
  // Remove www se existir
  if (parts[0] === 'www') {
    parts.shift();
  }
  
  // Retorna as últimas 3 partes para .com.br ou 2 para .com
  if (parts.length >= 3 && (parts[parts.length - 2] === 'com' || parts[parts.length - 2] === 'org')) {
    return parts.slice(parts.length - 3).join('.');
  }
  
  return parts.slice(parts.length - 2).join('.');
}

export default useChurch;
