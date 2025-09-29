import React from 'react';
import { Smartphone, Monitor, Code, Wifi } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMobileOptimizations } from '@/hooks/useMobileOptimizations';

export const MobileInDevelopment: React.FC = () => {
  const { isMobile } = useMobileOptimizations();

  if (!isMobile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-6">
      <Card className="max-w-md w-full card-financial border-primary/20 shadow-lg">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          {/* Icon */}
          <div className="relative">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Badge variant="secondary" className="text-xs px-2 py-1">
                <Code className="h-3 w-3 mr-1" />
                Beta
              </Badge>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Versión Móvil en Desarrollo
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Estamos trabajando en una experiencia móvil optimizada para BDI Suite
            </p>
          </div>

          {/* Desktop recommendation */}
          <div className="bg-accent/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-center gap-2 text-accent-foreground">
              <Monitor className="h-5 w-5" />
              <span className="font-medium">Mejor experiencia</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Para acceder a todas las funcionalidades de análisis financiero, 
              portfolio tracking y herramientas de inversión, te recomendamos 
              usar BDI Suite desde una <strong>computadora de escritorio</strong>.
            </p>
          </div>

          {/* Features coming soon */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              Próximamente en móvil:
            </h3>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <span>Portfolio tracking optimizado</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <span>CEDEARs en tiempo real</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <span>Gráficos interactivos</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <span>Notificaciones de mercado</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              <strong>BDI Suite</strong> - Tu plataforma de análisis financiero
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};