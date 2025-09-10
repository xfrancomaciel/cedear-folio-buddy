import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  username?: string;
  avatar_url?: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: { username?: string; full_name?: string }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
  uploadAvatar: (file: File) => Promise<{ url?: string; error: any }>;
}