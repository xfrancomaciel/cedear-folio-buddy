import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // First get all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          avatar_url,
          created_at,
          updated_at
        `);

      if (profilesError) throw profilesError;

      // Then get user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Create a map of user roles
      const rolesMap = new Map();
      rolesData?.forEach(roleEntry => {
        rolesMap.set(roleEntry.user_id, roleEntry.role);
      });

      // Get auth users data (requires admin access)
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
      
      let authUsersMap = new Map<string, { email?: string; last_sign_in_at?: string }>();
      if (!authError && authUsers) {
        authUsers.forEach((authUser: any) => {
          authUsersMap.set(authUser.id, {
            email: authUser.email,
            last_sign_in_at: authUser.last_sign_in_at
          });
        });
      }

      // Combine all data
      const combinedUsers = profilesData?.map(profile => ({
        ...profile,
        role: rolesMap.get(profile.id) || 'user',
        email: authUsersMap.get(profile.id)?.email,
        last_sign_in_at: authUsersMap.get(profile.id)?.last_sign_in_at
      })) || [];

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
    deleteUser
  };
}