import { useState, useMemo, useCallback } from 'react';
import { ExtendedUserProfile, UserTableFilters, SortField, SortDirection } from '@/types/admin';

export function useUsersTableFilters(users: ExtendedUserProfile[]) {
  const [filters, setFilters] = useState<UserTableFilters>({
    search: '',
    role: 'all',
    plan: 'all',
    isActive: 'all',
    dateRange: { from: null, to: null },
    portfolioRange: { min: null, max: null }
  });

  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Función para determinar si un usuario está activo (ingresó en últimos 30 días)
  const isUserActive = useCallback((lastSignIn: string | undefined): boolean => {
    if (!lastSignIn) return false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(lastSignIn) > thirtyDaysAgo;
  }, []);

  // Aplicar filtros
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Filtro de búsqueda (nombre o email)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const fullName = user.full_name?.toLowerCase() || '';
        const email = user.email?.toLowerCase() || '';
        const username = user.username?.toLowerCase() || '';
        
        if (!fullName.includes(searchLower) && 
            !email.includes(searchLower) && 
            !username.includes(searchLower)) {
          return false;
        }
      }

      // Filtro de rol
      if (filters.role !== 'all' && user.role !== filters.role) {
        return false;
      }

      // Filtro de plan
      if (filters.plan !== 'all' && user.plan !== filters.plan) {
        return false;
      }

      // Filtro de estado activo
      if (filters.isActive !== 'all') {
        const active = isUserActive(user.last_sign_in_at);
        if (filters.isActive === 'active' && !active) return false;
        if (filters.isActive === 'inactive' && active) return false;
      }

      // Filtro de rango de fechas
      if (filters.dateRange.from || filters.dateRange.to) {
        const userDate = new Date(user.created_at);
        if (filters.dateRange.from && userDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && userDate > filters.dateRange.to) return false;
      }

      // Filtro de rango de portfolio
      if (filters.portfolioRange.min !== null || filters.portfolioRange.max !== null) {
        const portfolioValue = user.portfolio_value_usd || 0;
        if (filters.portfolioRange.min !== null && portfolioValue < filters.portfolioRange.min) return false;
        if (filters.portfolioRange.max !== null && portfolioValue > filters.portfolioRange.max) return false;
      }

      return true;
    });
  }, [users, filters, isUserActive]);

  // Aplicar ordenamiento
  const sortedUsers = useMemo(() => {
    const sorted = [...filteredUsers].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Manejar valores undefined o null
      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';

      // Convertir a string para comparación si es necesario
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredUsers, sortField, sortDirection]);

  // Paginación
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedUsers, currentPage, itemsPerPage]);

  // Funciones de utilidad
  const setSearchTerm = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
    setCurrentPage(1); // Reset a primera página al filtrar
  }, []);

  const setRoleFilter = useCallback((role: UserTableFilters['role']) => {
    setFilters(prev => ({ ...prev, role }));
    setCurrentPage(1);
  }, []);

  const setPlanFilter = useCallback((plan: UserTableFilters['plan']) => {
    setFilters(prev => ({ ...prev, plan }));
    setCurrentPage(1);
  }, []);

  const setActiveFilter = useCallback((isActive: UserTableFilters['isActive']) => {
    setFilters(prev => ({ ...prev, isActive }));
    setCurrentPage(1);
  }, []);

  const setDateRangeFilter = useCallback((dateRange: UserTableFilters['dateRange']) => {
    setFilters(prev => ({ ...prev, dateRange }));
    setCurrentPage(1);
  }, []);

  const setPortfolioRangeFilter = useCallback((portfolioRange: UserTableFilters['portfolioRange']) => {
    setFilters(prev => ({ ...prev, portfolioRange }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      role: 'all',
      plan: 'all',
      isActive: 'all',
      dateRange: { from: null, to: null },
      portfolioRange: { min: null, max: null }
    });
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((field: SortField) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  return {
    filters,
    setSearchTerm,
    setRoleFilter,
    setPlanFilter,
    setActiveFilter,
    setDateRangeFilter,
    setPortfolioRangeFilter,
    clearFilters,
    filteredUsers,
    sortedUsers,
    paginatedUsers,
    sortField,
    sortDirection,
    handleSort,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    totalFilteredUsers: filteredUsers.length
  };
}
