import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { UserTableFilters as Filters } from '@/types/admin';

interface UserTableFiltersProps {
  filters: Filters;
  onSearchChange: (search: string) => void;
  onRoleChange: (role: Filters['role']) => void;
  onPlanChange: (plan: Filters['plan']) => void;
  onActiveChange: (isActive: Filters['isActive']) => void;
  onPortfolioMinChange: (min: number | null) => void;
  onPortfolioMaxChange: (max: number | null) => void;
  onClearFilters: () => void;
}

export function UserTableFilters({
  filters,
  onSearchChange,
  onRoleChange,
  onPlanChange,
  onActiveChange,
  onPortfolioMinChange,
  onPortfolioMaxChange,
  onClearFilters
}: UserTableFiltersProps) {
  const hasActiveFilters = 
    filters.search !== '' ||
    filters.role !== 'all' ||
    filters.plan !== 'all' ||
    filters.isActive !== 'all' ||
    filters.portfolioRange.min !== null ||
    filters.portfolioRange.max !== null;

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filtros</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 px-2"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {/* Búsqueda */}
        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="search">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Nombre, email o username..."
              value={filters.search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Filtro por Rol */}
        <div className="space-y-2">
          <Label htmlFor="role">Rol</Label>
          <Select value={filters.role} onValueChange={onRoleChange}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Todos los roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderador</SelectItem>
              <SelectItem value="user">Usuario</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por Plan */}
        <div className="space-y-2">
          <Label htmlFor="plan">Plan</Label>
          <Select value={filters.plan} onValueChange={onPlanChange}>
            <SelectTrigger id="plan">
              <SelectValue placeholder="Todos los planes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="cliente">Cliente</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por Estado */}
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select value={filters.isActive} onValueChange={onActiveChange}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtros de Portfolio */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="portfolioMin">Portfolio mínimo (USD)</Label>
          <Input
            id="portfolioMin"
            type="number"
            placeholder="0"
            value={filters.portfolioRange.min || ''}
            onChange={(e) => onPortfolioMinChange(e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="portfolioMax">Portfolio máximo (USD)</Label>
          <Input
            id="portfolioMax"
            type="number"
            placeholder="Sin límite"
            value={filters.portfolioRange.max || ''}
            onChange={(e) => onPortfolioMaxChange(e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>
      </div>
    </div>
  );
}
