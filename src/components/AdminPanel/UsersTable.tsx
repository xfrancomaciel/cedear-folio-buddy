import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ArrowUpDown, Mail, Trash2, Crown, Shield, User as UserIcon, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { ExtendedUserProfile, SortField, SortDirection } from '@/types/admin';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface UsersTableProps {
  users: ExtendedUserProfile[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onRoleChange: (userId: string, newRole: 'admin' | 'moderator' | 'user') => Promise<void>;
  onPlanChange: (userId: string, newPlan: 'cliente' | 'premium' | 'enterprise') => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  totalUsers: number;
}

export function UsersTable({
  users,
  sortField,
  sortDirection,
  onSort,
  onRoleChange,
  onPlanChange,
  onDeleteUser,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  totalUsers
}: UsersTableProps) {
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'moderator': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Crown;
      case 'moderator': return Shield;
      default: return UserIcon;
    }
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'default';
      case 'premium': return 'secondary';
      default: return 'outline';
    }
  };

  const getUserInitials = (user: ExtendedUserProfile) => {
    if (user.full_name) {
      return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user.email?.slice(0, 2).toUpperCase() || 'U';
  };

  const formatCurrency = (value: number | undefined, currency: 'USD' | 'ARS') => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Nunca';
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getActivityStatus = (lastSignIn: string | undefined): { color: string; label: string } => {
    if (!lastSignIn) return { color: 'bg-gray-500', label: 'Sin actividad' };
    
    const lastSignInDate = new Date(lastSignIn);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - lastSignInDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 7) return { color: 'bg-green-500', label: 'Activo' };
    if (daysDiff <= 30) return { color: 'bg-yellow-500', label: 'Reciente' };
    return { color: 'bg-red-500', label: 'Inactivo' };
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      setDeletingUserId(userToDelete);
      await onDeleteUser(userToDelete);
      setDeletingUserId(null);
      setUserToDelete(null);
    }
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 lg:px-3"
        onClick={() => onSort(field)}
      >
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </TableHead>
  );

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalUsers);

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[1200px]">
          <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader field="full_name">Usuario</SortableHeader>
              <TableHead>Email</TableHead>
              <SortableHeader field="role">Rol</SortableHeader>
              <SortableHeader field="plan">Plan</SortableHeader>
              <SortableHeader field="last_sign_in_at">Último Ingreso</SortableHeader>
              <SortableHeader field="portfolio_value_usd">Portfolio USD</SortableHeader>
              <SortableHeader field="portfolio_value_ars">Portfolio ARS</SortableHeader>
              <SortableHeader field="total_transactions">Trans.</SortableHeader>
              <SortableHeader field="created_at">Registro</SortableHeader>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  No se encontraron usuarios que coincidan con los filtros
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const RoleIcon = getRoleIcon(user.role || 'user');
                const activityStatus = getActivityStatus(user.last_sign_in_at);

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.full_name || 'Sin nombre'}</div>
                          <div className="text-xs text-muted-foreground">@{user.username || 'sin-username'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{user.email || 'Sin email'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role || 'user'}
                        onValueChange={(value) => onRoleChange(user.id, value as any)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Crown className="h-4 w-4" />
                              Admin
                            </div>
                          </SelectItem>
                          <SelectItem value="moderator">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Moderador
                            </div>
                          </SelectItem>
                          <SelectItem value="user">
                            <div className="flex items-center gap-2">
                              <UserIcon className="h-4 w-4" />
                              Usuario
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.plan || 'cliente'}
                        onValueChange={(value) => onPlanChange(user.id, value as any)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cliente">Cliente</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${activityStatus.color}`} />
                              <span className="text-sm">{formatDate(user.last_sign_in_at)}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{activityStatus.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(user.portfolio_value_usd, 'USD')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(user.portfolio_value_ars, 'ARS')}
                    </TableCell>
                    <TableCell className="text-center">
                      {user.total_transactions || 0}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setUserToDelete(user.id)}
                              disabled={deletingUserId === user.id}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Eliminar usuario</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Mostrando {startItem}-{endItem} de {totalUsers} usuarios
          </span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <span className="text-sm">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el usuario
              y todos sus datos asociados (portfolio, transacciones, etc.).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
