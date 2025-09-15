import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FeatureFlag {
  id: string;
  feature_key: string;
  feature_name: string;
  description?: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export function useFeatureFlags() {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatureFlags = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('feature_name');

      if (error) throw error;

      setFeatureFlags(data || []);
    } catch (err) {
      console.error('Error fetching feature flags:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const updateFeatureFlag = async (id: string, isEnabled: boolean) => {
    try {
      const { error } = await supabase
        .from('feature_flags')
        .update({ is_enabled: isEnabled })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setFeatureFlags(prev => 
        prev.map(flag => 
          flag.id === id ? { ...flag, is_enabled: isEnabled } : flag
        )
      );

      return { error: null };
    } catch (err) {
      console.error('Error updating feature flag:', err);
      return { error: err instanceof Error ? err.message : 'Error desconocido' };
    }
  };

  const isFeatureEnabled = (featureKey: string): boolean => {
    const flag = featureFlags.find(f => f.feature_key === featureKey);
    return flag?.is_enabled ?? true; // Default to enabled if not found
  };

  useEffect(() => {
    fetchFeatureFlags();
  }, []);

  return {
    featureFlags,
    loading,
    error,
    refetch: fetchFeatureFlags,
    updateFeatureFlag,
    isFeatureEnabled
  };
}