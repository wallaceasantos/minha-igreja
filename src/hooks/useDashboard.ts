/**
 * Hook: useDashboard
 * ===================
 * Carrega dados da igreja do localStorage para o dashboard
 *
 * USO:
 * const { church, loading, error } = useDashboard();
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
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  plan_type: 'free' | 'essencial';
  trial_end_date: string | null;
  admin_email?: string | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  latitude: string | null;
  longitude: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  youtube_channel_id: string | null;
  theme_primary_color: string;
  theme_secondary_color: string;
}

interface UseDashboardReturn {
  church: ChurchData | null;
  loading: boolean;
  error: string | null;
}

export function useDashboard(): UseDashboardReturn {
  const [church, setChurch] = useState<ChurchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChurch = async () => {
      try {
        // Pegar churchId e adminEmail do localStorage
        const churchId = localStorage.getItem('churchId');
        const adminEmail = localStorage.getItem('adminEmail');

        if (!churchId) {
          setError('Igreja não encontrada. Faça login novamente.');
          setLoading(false);
          return;
        }

        // Buscar dados da igreja do backend
        const response = await fetch(buildApiUrl(`/api/church/${churchId}`));
        const result = await response.json();

        if (result.success && result.data) {
          setChurch({
            id: result.data.id,
            name: result.data.name,
            slug: result.data.slug,
            description: result.data.description || null,
            about_content: result.data.about_content || null,
            logo_url: result.data.logo_url || null,
            favicon_url: result.data.favicon_url || null,
            hero_image_url: result.data.hero_image_url || null,
            email: result.data.email || null,
            phone: result.data.phone || null,
            whatsapp: result.data.whatsapp || null,
            plan_type: result.data.plan_type,
            trial_end_date: result.data.trial_end_date,
            admin_email: adminEmail,
            address_street: result.data.address_street || null,
            address_number: result.data.address_number || null,
            address_complement: result.data.address_complement || null,
            address_neighborhood: result.data.address_neighborhood || null,
            address_city: result.data.address_city || null,
            address_state: result.data.address_state || null,
            address_zip: result.data.address_zip || null,
            latitude: result.data.latitude || null,
            longitude: result.data.longitude || null,
            facebook_url: result.data.facebook_url || null,
            instagram_url: result.data.instagram_url || null,
            youtube_url: result.data.youtube_url || null,
            youtube_channel_id: result.data.youtube_channel_id || null,
            theme_primary_color: result.data.theme_primary_color || '#1e40af',
            theme_secondary_color: result.data.theme_secondary_color || '#f59e0b',
          });
        } else {
          setError('Erro ao carregar dados da igreja.');
        }
      } catch (err) {
        console.error('Error loading church:', err);
        setError('Erro de conexão com o servidor.');
      } finally {
        setLoading(false);
      }
    };

    loadChurch();
  }, []);

  return { church, loading, error };
}
