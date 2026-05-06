/**
 * ChurchPreview - Router para Sites de Igreja
 * ============================================
 * Decide qual versão do site mostrar baseado no plano da igreja
 * - Free: ChurchFree.tsx
 * - Premium: ChurchPremium.tsx
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import ChurchFree from './ChurchFree';
import ChurchPremium from './ChurchPremium';
import { buildApiUrl } from '@/lib/config';

export default function ChurchPreview() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [planType, setPlanType] = useState<string>('free');
  const [isTrial, setIsTrial] = useState<boolean>(false);

  useEffect(() => {
    loadChurchPlan();
  }, [slug]);

  const loadChurchPlan = async () => {
    try {
      setLoading(true);

      const res = await fetch(buildApiUrl(`/api/church/slug/${slug}`));
      const data = await res.json();

      if (data.success) {
        setPlanType(data.data.plan_type);
        // Check if church has active trial (trial_end_date in future)
        const trialEndDate = data.data.trial_end_date ? new Date(data.data.trial_end_date) : null;
        const isTrialActive = trialEndDate && trialEndDate > new Date();
        setIsTrial(!!isTrialActive);
      } else {
        toast.error('Igreja não encontrada');
      }
    } catch (error) {
      console.error('Error loading church plan:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
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

  // Decidir qual versão mostrar baseado no plano OU trial ativo
  if (planType === 'essencial' || planType === 'premium' || planType === 'enterprise' || isTrial) {
    return <ChurchPremium />;
  }

  return <ChurchFree />;
}
