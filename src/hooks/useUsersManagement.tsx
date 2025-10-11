import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ExtendedUserProfile } from '@/types/admin';

export interface UserProfile {
  id: string;
  email?: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  role?: string;
  last_sign_in_at?: string;
}

export function useUsersManagement() {
  const [users, setUsers] = useState<ExtendedUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // First get all profiles with email
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          avatar_url,
          email,
          created_at,
          updated_at
        `);

      if (profilesError) throw profilesError;

      // Then get user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Get user plans
      const { data: plansData, error: plansError } = await supabase
        .from('user_plans')
        .select('user_id, plan, is_active');

      if (plansError) throw plansError;

      // Get portfolio data (aggregated transactions)
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('transactions')
        .select('user_id, total_usd, total_ars, ticker, tipo')
        .eq('tipo', 'Compra');

      if (portfolioError) console.error('Error fetching portfolio data:', portfolioError);

      // Create maps for efficient lookups
      const rolesMap = new Map();
      rolesData?.forEach(roleEntry => {
        rolesMap.set(roleEntry.user_id, roleEntry.role);
      });

      const plansMap = new Map();
      plansData?.forEach(planEntry => {
        plansMap.set(planEntry.user_id, {
          plan: planEntry.plan,
          is_active: planEntry.is_active
        });
      });

      // Calculate portfolio values per user
      const portfolioMap = new Map<string, { usd: number; ars: number; transactions: number }>();
      portfolioData?.forEach(transaction => {
        const current = portfolioMap.get(transaction.user_id) || { usd: 0, ars: 0, transactions: 0 };
        portfolioMap.set(transaction.user_id, {
          usd: current.usd + (transaction.total_usd || 0),
          ars: current.ars + (transaction.total_ars || 0),
          transactions: current.transactions + 1
        });
      });

      // Combine all data
      const combinedUsers: ExtendedUserProfile[] = profilesData?.map(profile => {
        const portfolio = portfolioMap.get(profile.id);
        const plan = plansMap.get(profile.id);

        // Calculate if user is active (has activity in last 30 days)
        // Using updated_at as a proxy for last activity since we can't access auth.users
        const isActive = profile.updated_at ? 
          (new Date().getTime() - new Date(profile.updated_at).getTime()) < (30 * 24 * 60 * 60 * 1000) : 
          false;

        return {
          ...profile,
          role: rolesMap.get(profile.id) || 'user',
          plan: plan?.plan || 'cliente',
          plan_status: plan?.is_active ? 'active' : 'none',
          portfolio_value_usd: portfolio?.usd || 0,
          portfolio_value_ars: portfolio?.ars || 0,
          total_transactions: portfolio?.transactions || 0,
          is_active: isActive
        };
      }) || [];

      setUsers(combinedUsers);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: newRole });

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast.success('Rol actualizado correctamente');
      return { error: null };
    } catch (err: any) {
      console.error('Error updating user role:', err);
      toast.error('Error al actualizar el rol');
      return { error: err.message };
    }
  };

  const updateUserPlan = async (userId: string, newPlan: 'cliente' | 'premium' | 'enterprise') => {
    try {
      const { error } = await supabase
        .from('user_plans')
        .upsert({ 
          user_id: userId, 
          plan: newPlan,
          is_active: true,
          start_date: new Date().toISOString()
        });

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, plan: newPlan, plan_status: 'active' } : user
      ));

      toast.success('Plan actualizado correctamente');
      return { error: null };
    } catch (err: any) {
      console.error('Error updating user plan:', err);
      toast.error('Error al actualizar el plan');
      return { error: err.message };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Delete from auth.users (this will cascade to profiles and user_roles)
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.filter(user => user.id !== userId));

      toast.success('Usuario eliminado correctamente');
      return { error: null };
    } catch (err: any) {
      console.error('Error deleting user:', err);
      toast.error('Error al eliminar el usuario');
      return { error: err.message };
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    updateUserRole,
    updateUserPlan,
    deleteUser
  };
}