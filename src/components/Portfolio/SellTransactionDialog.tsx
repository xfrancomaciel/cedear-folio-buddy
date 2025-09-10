import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Position, TransactionCategory } from '@/types/portfolio';
import { TrendingDown, AlertTriangle } from 'lucide-react';
import { getCEDEARInfo } from '@/data/cedearsData';

interface SellTransactionDialogProps {
  position: Position | null;
  isOpen: boolean;
  onClose: () => void;
  onSell: (transaction: {
    fecha: string;
    tipo: 'venta';
    ticker: string;
    precio_ars: number;
    cantidad: number;
    usd_rate_historico: number;
    categoria?: TransactionCategory;
  }) => void;
  currentPrice?: number;
}

export const SellTransactionDialog = ({ 
  position, 
  isOpen, 
  onClose, 
  onSell, 
  currentPrice 
}: SellTransactionDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    cantidad: '',
    precio_ars: currentPrice?.toString() || '',
    usd_rate_historico: '1000',
    categoria: 'Inversión' as TransactionCategory
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!position) return;

    const cantidad = parseInt(formData.cantidad);
    
    if (cantidad > position.cantidad) {
      toast({
        title: "Error",
        description: `No puedes vender más de ${position.cantidad} ${position.ticker} que posees.`,
        variant: "destructive"
      });
      return;
    }

    onSell({
      fecha: formData.fecha,
      tipo: 'venta',
      ticker: position.ticker,
      precio_ars: parseFloat(formData.precio_ars),
      cantidad: cantidad,
      usd_rate_historico: parseFloat(formData.usd_rate_historico),
      categoria: formData.categoria
    });

    toast({
      title: "Venta registrada",
      description: `Venta de ${cantidad} ${position.ticker} registrada exitosamente.`,
    });

    // Reset form and close
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      cantidad: '',
      precio_ars: currentPrice?.toString() || '',
      usd_rate_historico: '1000',
      categoria: 'Inversión'
    });
    onClose();
  };

  if (!position) return null;

  const cedearsInfo = getCEDEARInfo(position.ticker);
  const maxQuantity = position.cantidad;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-destructive" />
            Vender {position.ticker}
          </DialogTitle>
          <DialogDescription>
            Registra la venta de {cedearsInfo?.nombre || position.ticker}. 
            Actualmente posees {maxQuantity} unidades.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="sell-fecha">Fecha</Label>
              <Input
                id="sell-fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="sell-cantidad">Cantidad a vender</Label>
              <Input
                id="sell-cantidad"
                type="number"
                placeholder="0"
                max={maxQuantity}
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                required
              />
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <AlertTriangle className="w-3 h-3" />
                <span>Máximo: {maxQuantity} unidades disponibles</span>
              </div>
            </div>

            <div>
              <Label htmlFor="sell-precio">Precio de venta (ARS)</Label>
              <Input
                id="sell-precio"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.precio_ars}
                onChange={(e) => setFormData({ ...formData, precio_ars: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="sell-categoria">Categoría</Label>
              <Select 
                value={formData.categoria} 
                onValueChange={(value: TransactionCategory) => setFormData({ ...formData, categoria: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inversión">Inversión</SelectItem>
                  <SelectItem value="Jubilación">Jubilación</SelectItem>
                  <SelectItem value="Viaje">Viaje</SelectItem>
                  <SelectItem value="Ahorro">Ahorro</SelectItem>
                  <SelectItem value="Emergencias">Emergencias</SelectItem>
                  <SelectItem value="Educación">Educación</SelectItem>
                  <SelectItem value="Casa">Casa</SelectItem>
                  <SelectItem value="Auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sell-usd-rate">Tipo de Cambio USD</Label>
              <Input
                id="sell-usd-rate"
                type="number"
                step="0.01"
                placeholder="1000.00"
                value={formData.usd_rate_historico}
                onChange={(e) => setFormData({ ...formData, usd_rate_historico: e.target.value })}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="destructive">
              <TrendingDown className="w-4 h-4 mr-2" />
              Confirmar Venta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};