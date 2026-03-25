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

export interface ChurchData {
  id: number;
  name: string;
  slug: string;
  description: string | null;
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
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // Remove www se existir
  if (parts[0] === 'www') {
    parts.shift();
  }
  
  // Se tiver mais de 2 partes, tem subdomínio
  // Ex: igreja1.igrejaconnect.com.br → 4 partes
  if (parts.length > 2) {
    return parts[0];
  }
  
  // Se tiver exatamente 2 partes, é domínio principal
  // Ex: igrejaconnect.com.br → 3 partes (ou 2 sem www)
  // Retorna slug padrão ou vazio para landing page
  if (parts.length === 2 || parts.length === 3) {
    return ''; // Domínio principal
  }
  
  // Fallback
  return parts[0] || '';
}

/**
 * Aplica as cores do tema no documento
 */
function applyTheme(primary: string, secondary: string): void {
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
      
      // Se não tiver slug, é o domínio principal (landing page)
      if (!slug) {
        setChurch(null);
        setLoading(false);
        return;
      }
      
      // Busca dados da igreja na API
      const response = await fetch(`/api/church/${slug}.php`);
      
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
      setError(errorMessage);
      setChurch(null);
    } finally {
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
  // Em produção: igrejaconnect.com.br
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
