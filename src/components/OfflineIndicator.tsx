import { WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePWA } from '@/hooks/usePWA';

export function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <Alert className="fixed top-4 left-4 right-4 z-50 border-warning/20 bg-warning/10 md:left-auto md:right-4 md:w-80">
      <WifiOff className="h-4 w-4" />
      <AlertDescription className="text-sm">
        Sin conexión a internet. Algunos datos pueden estar desactualizados.
      </AlertDescription>
    </Alert>
  );
}