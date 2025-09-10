import { useState } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';

export function PWAInstallBanner() {
  const { isInstallable, install } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || dismissed) return null;

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setDismissed(true);
    }
  };

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 border-primary/20 bg-card/95 backdrop-blur-sm md:left-auto md:right-4 md:w-80">
      <div className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Smartphone className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium">Instalar BDI Suite</p>
          <p className="text-xs text-muted-foreground">
            Accede más rápido desde tu pantalla de inicio
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleInstall}
            className="h-8 px-3 text-xs"
          >
            <Download className="mr-1 h-3 w-3" />
            Instalar
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="h-8 w-8 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}