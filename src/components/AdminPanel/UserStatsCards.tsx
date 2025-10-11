import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Calendar, GraduationCap, Zap } from 'lucide-react';
import { UserStats } from '@/types/admin';

interface UserStatsCardsProps {
  stats: UserStats;
  loading?: boolean;
}

export function UserStatsCards({ stats, loading }: UserStatsCardsProps) {
  const formatCurrency = (value: number, currency: 'USD' | 'ARS') => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const statCards = [
    {
      title: 'Total Usuarios',
      value: stats.totalUsers,
      icon: Users,
      description: `${stats.byRole.admin} admins, ${stats.byRole.moderator} moderadores`,
      color: 'text-primary'
    },
    {
      title: 'Usuarios Activos',
      value: stats.activeUsers,
      icon: UserCheck,
      description: 'Últimos 30 días',
      color: 'text-green-600'
    },
    {
      title: 'Nuevos Este Mes',
      value: stats.newUsersThisMonth,
      icon: Calendar,
      description: 'Registros recientes',
      color: 'text-blue-600'
    },
    {
      title: 'Usuarios BDI Inicial',
      value: stats.byPlan.bdi_inicial,
      icon: GraduationCap,
      description: 'Plan de formación inicial',
      color: 'text-blue-600'
    },
    {
      title: 'Usuarios BDI Plus',
      value: stats.byPlan.bdi_plus,
      icon: Zap,
      description: 'Plan avanzado',
      color: 'text-purple-600'
    }
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
