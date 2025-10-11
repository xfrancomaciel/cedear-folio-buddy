import { UserProfile } from '@/hooks/useUsersManagement';

export interface ExtendedUserProfile extends UserProfile {
  portfolio_value_usd?: number;
  portfolio_value_ars?: number;
  total_transactions?: number;
  plan?: 'cliente' | 'bdi_inicial' | 'bdi_plus';
  plan_status?: 'active' | 'expired' | 'none';
  is_active?: boolean; // Activo si ingresó en los últimos 30 días
}

export interface UserTableFilters {
  search: string;
  role: 'all' | 'admin' | 'moderator' | 'user';
  plan: 'all' | 'cliente' | 'bdi_inicial' | 'bdi_plus';
  isActive: 'all' | 'active' | 'inactive';
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  portfolioRange: {
    min: number | null;
    max: number | null;
  };
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number; // Usuarios activos en últimos 30 días
  newUsersThisMonth: number;
  byRole: {
    admin: number;
    moderator: number;
    user: number;
  };
  byPlan: {
    cliente: number;
    bdi_inicial: number;
    bdi_plus: number;
  };
}

export interface ExportUserData {
  'Usuario': string;
  'Email': string;
  'Rol': string;
  'Plan': string;
  'Último Ingreso': string;
  'Registro': string;
}

export interface UserInvitation {
  id: string;
  email: string;
  invited_by: string;
  role: 'admin' | 'moderator' | 'user';
  plan: 'cliente' | 'bdi_inicial' | 'bdi_plus';
  status: 'pending' | 'accepted' | 'expired';
  invited_at: string;
  accepted_at?: string;
  expires_at: string;
  custom_message?: string;
}

export type SortField = 
  | 'full_name' 
  | 'email' 
  | 'role' 
  | 'plan' 
  | 'last_sign_in_at' 
  | 'portfolio_value_usd' 
  | 'portfolio_value_ars'
  | 'total_transactions'
  | 'created_at';

export type SortDirection = 'asc' | 'desc';
