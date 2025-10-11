import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserInvitation } from '@/types/admin';

export function useUserInvitations() {
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);

  const inviteUser = async (
    email: string,
    role: 'admin' | 'moderator' | 'user',
    plan: 'cliente' | 'bdi_inicial' | 'bdi_plus',
    customMessage?: string
  ) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: {
          email,
          role,
          plan,
          customMessage
        }
      });

      if (error) {
        throw error;
      }

      toast.success('Invitación enviada exitosamente', {
        description: `Se ha enviado una invitación a ${email}`
      });

      return { success: true, data };
    } catch (error: any) {
      console.error('Error inviting user:', error);
      toast.error('Error al enviar la invitación', {
        description: error.message || 'No se pudo enviar la invitación'
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .order('invited_at', { ascending: false });

      if (error) {
        throw error;
      }

      setInvitations(data as UserInvitation[] || []);
      return { success: true, data };
    } catch (error: any) {
      console.error('Error fetching invitations:', error);
      toast.error('Error al cargar las invitaciones');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const resendInvitation = async (invitationId: string) => {
    try {
      setLoading(true);

      // Get invitation details
      const { data: invitation, error: fetchError } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (fetchError || !invitation) {
        throw new Error('Invitation not found');
      }

      // Send new invitation
      const result = await inviteUser(
        invitation.email,
        invitation.role,
        invitation.plan,
        invitation.custom_message
      );

      if (result.success) {
        // Update the invitation record
        await supabase
          .from('user_invitations')
          .update({
            invited_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          })
          .eq('id', invitationId);
      }

      return result;
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      toast.error('Error al reenviar la invitación');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('user_invitations')
        .update({ status: 'expired' })
        .eq('id', invitationId);

      if (error) {
        throw error;
      }

      toast.success('Invitación cancelada');
      await fetchInvitations();
      return { success: true };
    } catch (error: any) {
      console.error('Error canceling invitation:', error);
      toast.error('Error al cancelar la invitación');
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    invitations,
    inviteUser,
    fetchInvitations,
    resendInvitation,
    cancelInvitation
  };
}
