import { useState, useMemo } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useUsersManagement } from '@/hooks/useUsersManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserStatsCards } from '@/components/AdminPanel/UserStatsCards';
import { UsersTable } from '@/components/AdminPanel/UsersTable';
import { ExportUsersButton } from '@/components/AdminPanel/ExportUsersButton';
import { InviteUserDialog } from '@/components/AdminPanel/InviteUserDialog';
import { RefreshCw, AlertCircle, Shield, Crown, Zap, GraduationCap, Users } from 'lucide-react';
import { UserStats, ExtendedUserProfile } from '@/types/admin';

export default function AdminUsers() {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { users, loading, error, refetch, updateUserRole, updateUserPlan, deleteUser } = useUsersManagement();
  const [refreshing, setRefreshing] = useState(false);

  // Separate users by category
  const userCategories = useMemo(() => {
    const admins = users.filter(u => u.role === 'admin');
    const bdiPlus = users.filter(u => u.role !== 'admin' && u.plan === 'bdi_plus');
    const bdiInicial = users.filter(u => u.role !== 'admin' && u.plan === 'bdi_inicial');
    const cliente = users.filter(u => u.role !== 'admin' && u.plan === 'cliente');
    
    return { admins, bdiPlus, bdiInicial, cliente };
  }, [users]);

  // Calculate statistics
  const stats: UserStats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.is_active).length,
      newUsersThisMonth: users.filter(u => new Date(u.created_at) >= startOfMonth).length,
      byRole: {
        admin: users.filter(u => u.role === 'admin').length,
        moderator: users.filter(u => u.role === 'moderator').length,
        user: users.filter(u => u.role === 'user').length
      },
      byPlan: {
        cliente: users.filter(u => u.plan === 'cliente').length,
        bdi_inicial: users.filter(u => u.plan === 'bdi_inicial').length,
        bdi_plus: users.filter(u => u.plan === 'bdi_plus').length
      }
    };
  }, [users]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'moderator' | 'user') => {
    await updateUserRole(userId, newRole);
  };

  const handlePlanChange = async (userId: string, newPlan: 'cliente' | 'bdi_inicial' | 'bdi_plus') => {
    await updateUserPlan(userId, newPlan);
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Acceso Denegado</h2>
              <p className="text-muted-foreground">
                No tienes permisos para acceder al panel de administración.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Administración de Usuarios</h1>
          <p className="text-muted-foreground">
            Gestiona usuarios, roles, planes y portfolios
          </p>
        </div>
        <div className="flex items-center gap-2">
          <InviteUserDialog onInviteSent={handleRefresh} />
          <ExportUsersButton users={users} disabled={loading} />
          <Button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <UserStatsCards stats={stats} loading={loading} />

      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex items-center space-x-4 p-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Administrators */}
          {userCategories.admins.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  <CardTitle>Administradores</CardTitle>
                  <span className="text-sm text-muted-foreground">({userCategories.admins.length})</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <UsersTable
                  users={userCategories.admins}
                  sortField="full_name"
                  sortDirection="asc"
                  onSort={() => {}}
                  onRoleChange={handleRoleChange}
                  onPlanChange={handlePlanChange}
                  onDeleteUser={handleDeleteUser}
                  currentPage={1}
                  totalPages={1}
                  itemsPerPage={userCategories.admins.length}
                  onPageChange={() => {}}
                  onItemsPerPageChange={() => {}}
                  totalUsers={userCategories.admins.length}
                />
              </CardContent>
            </Card>
          )}

          {/* BDI Plus Users */}
          {userCategories.bdiPlus.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-500" />
                  <CardTitle>BDI Plus</CardTitle>
                  <span className="text-sm text-muted-foreground">({userCategories.bdiPlus.length})</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <UsersTable
                  users={userCategories.bdiPlus}
                  sortField="full_name"
                  sortDirection="asc"
                  onSort={() => {}}
                  onRoleChange={handleRoleChange}
                  onPlanChange={handlePlanChange}
                  onDeleteUser={handleDeleteUser}
                  currentPage={1}
                  totalPages={1}
                  itemsPerPage={userCategories.bdiPlus.length}
                  onPageChange={() => {}}
                  onItemsPerPageChange={() => {}}
                  totalUsers={userCategories.bdiPlus.length}
                />
              </CardContent>
            </Card>
          )}

          {/* BDI Inicial Users */}
          {userCategories.bdiInicial.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-500" />
                  <CardTitle>BDI Inicial</CardTitle>
                  <span className="text-sm text-muted-foreground">({userCategories.bdiInicial.length})</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <UsersTable
                  users={userCategories.bdiInicial}
                  sortField="full_name"
                  sortDirection="asc"
                  onSort={() => {}}
                  onRoleChange={handleRoleChange}
                  onPlanChange={handlePlanChange}
                  onDeleteUser={handleDeleteUser}
                  currentPage={1}
                  totalPages={1}
                  itemsPerPage={userCategories.bdiInicial.length}
                  onPageChange={() => {}}
                  onItemsPerPageChange={() => {}}
                  totalUsers={userCategories.bdiInicial.length}
                />
              </CardContent>
            </Card>
          )}

          {/* Cliente Users */}
          {userCategories.cliente.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <CardTitle>Clientes</CardTitle>
                  <span className="text-sm text-muted-foreground">({userCategories.cliente.length})</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <UsersTable
                  users={userCategories.cliente}
                  sortField="full_name"
                  sortDirection="asc"
                  onSort={() => {}}
                  onRoleChange={handleRoleChange}
                  onPlanChange={handlePlanChange}
                  onDeleteUser={handleDeleteUser}
                  currentPage={1}
                  totalPages={1}
                  itemsPerPage={userCategories.cliente.length}
                  onPageChange={() => {}}
                  onItemsPerPageChange={() => {}}
                  totalUsers={userCategories.cliente.length}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
