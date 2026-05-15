import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Auth bypass temporal: la app está abierta sin login mientras se resuelve
// el problema de cuota de Supabase. Para reactivar la protección, restaurar
// la versión previa que verificaba `user` con useAuth y redirigía a /auth.
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  return <>{children}</>;
};
