import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, UserProfile } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetching with setTimeout
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData?: { username?: string; full_name?: string }) => {
    try {
      console.log('Starting signup process for email:', email);
      const redirectUrl = `${window.location.origin}/auth`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      });

      console.log('Signup response:', { data, error });

      if (error) {
        console.error('Signup error:', error);
        
        let errorMessage = error.message;
        
        // Handle common Supabase auth errors with friendly Spanish messages
        if (error.message.includes('Invalid email')) {
          errorMessage = 'El formato del correo electrónico no es válido. Usa un correo real como ejemplo@gmail.com';
        } else if (error.message.includes('email address is invalid')) {
          errorMessage = 'El correo electrónico no es válido. Usa un correo real (ej: ejemplo@gmail.com)';
        } else if (error.message.includes('Password')) {
          errorMessage = 'La contraseña debe tener al menos 6 caracteres';
        } else if (error.message.includes('User already registered')) {
          errorMessage = 'Este correo ya está registrado. Intenta iniciar sesión.';
        }
        
        toast({
          title: "Error en el registro",
          description: errorMessage,
          variant: "destructive"
        });
        return { error };
      }

      toast({
        title: "¡Registro exitoso!",
        description: "Revisa tu correo para confirmar tu cuenta o inicia sesión directamente."
      });

      return { error: null };
    } catch (error: any) {
      console.error('Unexpected signup error:', error);
      toast({
        title: "Error inesperado",
        description: "Ha ocurrido un error durante el registro.",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Starting signin process for email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('Signin response:', { data, error });

      if (error) {
        console.error('Signin error:', error);
        
        let errorMessage = error.message;
        
        // Handle common Supabase auth errors with friendly Spanish messages
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Credenciales incorrectas. Verifica tu correo y contraseña.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Debes confirmar tu correo antes de iniciar sesión.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'El formato del correo electrónico no es válido.';
        }
        
        toast({
          title: "Error en el inicio de sesión",
          description: errorMessage,
          variant: "destructive"
        });
        return { error };
      }

      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente."
      });

      return { error: null };
    } catch (error: any) {
      console.error('Unexpected signin error:', error);
      toast({
        title: "Error inesperado",
        description: "Ha ocurrido un error durante el inicio de sesión.",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Error al cerrar sesión",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente."
      });
    } catch (error: any) {
      toast({
        title: "Error inesperado",
        description: "Ha ocurrido un error al cerrar sesión.",
        variant: "destructive"
      });
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        toast({
          title: "Error al actualizar perfil",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      // Update local profile state
      setProfile(prev => prev ? { ...prev, ...updates } : null);

      toast({
        title: "Perfil actualizado",
        description: "Los cambios se han guardado correctamente."
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error inesperado",
        description: "Ha ocurrido un error al actualizar el perfil.",
        variant: "destructive"
      });
      return { error };
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        toast({
          title: "Error al subir avatar",
          description: uploadError.message,
          variant: "destructive"
        });
        return { error: uploadError };
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const avatarUrl = data.publicUrl;

      // Update profile with new avatar URL
      const { error: updateError } = await updateProfile({ avatar_url: avatarUrl });
      
      if (updateError) {
        return { error: updateError };
      }

      return { url: avatarUrl, error: null };
    } catch (error: any) {
      toast({
        title: "Error inesperado",
        description: "Ha ocurrido un error al subir el avatar.",
        variant: "destructive"
      });
      return { error };
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    uploadAvatar
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};