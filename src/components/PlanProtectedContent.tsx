import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Sparkles, Loader2 } from 'lucide-react';
import { useUserPlan, type PlanType } from '@/hooks/useUserPlan';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PLAN_NAMES } from '@/lib/planAuthorization';

interface PlanProtectedContentProps {
  children: React.ReactNode;
  requiredPlans: PlanType[];
  fallback?: React.ReactNode;
  title?: string;
  description?: string;
}

export function PlanProtectedContent({
  children,
  requiredPlans,
  fallback,
  title = "Contenido Premium",
  description = "Este contenido está disponible solo para usuarios con plan BDI Inicial o BDI Plus"
}: PlanProtectedContentProps) {
  const { plan, loading, hasAccessTo } = useUserPlan();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAccessTo(requiredPlans)) {
    return fallback || (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Lock className="h-8 w-8 text-muted-foreground" />
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tu plan actual: <Badge variant="outline">{plan ? PLAN_NAMES[plan] : 'Sin plan'}</Badge>
            </p>
            <p className="text-sm">
              Para acceder a este contenido, necesitás uno de los siguientes planes:
            </p>
            <div className="flex gap-2 flex-wrap">
              {requiredPlans.map(p => (
                <Badge key={p} variant="secondary">
                  {PLAN_NAMES[p]}
                </Badge>
              ))}
            </div>
            <Button asChild className="w-full mt-4">
              <Link to="/configuracion">
                <Sparkles className="mr-2 h-4 w-4" />
                Actualizar Plan
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
