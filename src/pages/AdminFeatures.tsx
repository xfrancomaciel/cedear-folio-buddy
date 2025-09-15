import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function AdminFeatures() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Gestión de Features
        </h1>
        <p className="text-muted-foreground mt-2">
          Habilita o deshabilita funcionalidades globalmente para todos los usuarios no administradores.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Funcionalidad de feature flags cargando...</p>
        </CardContent>
      </Card>
    </div>
  );
}