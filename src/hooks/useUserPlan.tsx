import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type PlanType = 'cliente' | 'bdi_inicial' | 'bdi_plus';

export function useUserPlan() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlanType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!user) {
      setPlan(null);
      setLoading(false);
      return;
    }

    const fetchUserPlan = async () => {
      try {
        const { data, error } = await supabase
          .from('user_plans')
          .select('plan, is_active')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user plan:', error);
          setPlan('cliente');
        } else {
          setPlan((data?.plan as PlanType) || 'cliente');
          setIsActive(data?.is_active || false);
        }
      } catch (error) {
        console.error('Error fetching user plan:', error);
        setPlan('cliente');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPlan();
  }, [user]);

  const hasAccessTo = (requiredPlans: PlanType[]) => {
    if (!plan || !isActive) return false;
    return requiredPlans.includes(plan);
  };

  return {
    plan,
    loading,
    isActive,
    hasAccessTo,
    isPremium: plan === 'bdi_inicial' || plan === 'bdi_plus',
    isBasic: plan === 'cliente',
    isPlusUser: plan === 'bdi_plus',
  };
}
