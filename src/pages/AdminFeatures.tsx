import React from 'react';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Settings, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminFeatures() {
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { 
    featureFlags, 
    loading, 
    error, 
    refetch, 
    updateFeatureFlag 
  } = useFeatureFlags();

  if (roleLoading || loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Acceso Denegado
            </CardTitle>
            <CardDescription>
              No tienes permisos para acceder a esta página.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleToggleFeature = async (id: string, currentState: boolean) => {
    const newState = !currentState;
    const { error } = await updateFeatureFlag(id, newState);
    
    if (error) {
      toast.error(`Error al actualizar feature: ${error}`);
    } else {
      toast.success(`Feature ${newState ? 'habilitado' : 'deshabilitado'} correctamente`);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Gestión de Features
          </h1>
          <p className="text-muted-foreground mt-2">
            Habilita o deshabilita funcionalidades globalmente para todos los usuarios no administradores.
          </p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {featureFlags.map((flag) => (
          <Card key={flag.id} className="transition-all hover:shadow-md">
            <CardContent className="flex items-center justify-between p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">{flag.feature_name}</h3>
                  <Badge variant={flag.is_enabled ? "default" : "secondary"}>
                    {flag.is_enabled ? 'Habilitado' : 'Deshabilitado'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {flag.description || 'Sin descripción disponible'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Clave: <code className="bg-muted px-1 rounded">{flag.feature_key}</code>
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {flag.is_enabled ? 'ON' : 'OFF'}
                </span>
                <Switch
                  checked={flag.is_enabled}
                  onCheckedChange={() => handleToggleFeature(flag.id, flag.is_enabled)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {featureFlags.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No se encontraron feature flags configurados.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}