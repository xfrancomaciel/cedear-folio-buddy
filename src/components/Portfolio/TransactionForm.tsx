import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getAllTickers, isValidTicker, getCEDEARInfo, validateTransaction } from '@/data/cedearsData';
import { Plus, DollarSign } from 'lucide-react';

interface TransactionFormProps {
  onAddTransaction: (transaction: {
    fecha: string;
    tipo: 'compra' | 'venta';
    ticker: string;
    precio_ars: number;
    cantidad: number;
    usd_rate_historico: number;
  }) => void;
  onUpdatePrice: (ticker: string, precio_ars: number, usd_rate: number) => void;
}

export const TransactionForm = ({ onAddTransaction, onUpdatePrice }: TransactionFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    tipo: 'compra' as 'compra' | 'venta',
    ticker: '',
    precio_ars: '',
    cantidad: '',
    usd_rate_historico: '1000'
  });

  const [priceUpdateData, setPriceUpdateData] = useState({
    ticker: '',
    precio_ars: '',
    usd_rate: '1000'
  });

  const [showPriceUpdate, setShowPriceUpdate] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transactionData = {
      fecha: formData.fecha,
      tipo: formData.tipo,
      ticker: formData.ticker.toUpperCase(),
      precio_ars: parseFloat(formData.precio_ars),
      cantidad: parseInt(formData.cantidad),
      usd_rate_historico: parseFloat(formData.usd_rate_historico)
    };

    const validationErrors = validateTransaction(transactionData);
    
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => {
        toast({
          title: "Error de validación",
          description: error,
          variant: "destructive"
        });
      });
      return;
    }

    const transaction = {
      fecha: formData.fecha,
      tipo: formData.tipo,
      ticker: formData.ticker.toUpperCase(),
      precio_ars: parseFloat(formData.precio_ars),
      cantidad: parseInt(formData.cantidad),
      usd_rate_historico: parseFloat(formData.usd_rate_historico)
    };

    onAddTransaction(transaction);
    
    toast({
      title: "Transacción agregada",
      description: `${formData.tipo} de ${formData.cantidad} ${formData.ticker} registrada exitosamente.`,
    });

    // Reset form
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      tipo: 'compra',
      ticker: '',
      precio_ars: '',
      cantidad: '',
      usd_rate_historico: '1000'
    });
  };

  const handlePriceUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidTicker(priceUpdateData.ticker)) {
      toast({
        title: "Error",
        description: "Ticker CEDEAR no válido.",
        variant: "destructive"
      });
      return;
    }

    onUpdatePrice(
      priceUpdateData.ticker.toUpperCase(),
      parseFloat(priceUpdateData.precio_ars),
      parseFloat(priceUpdateData.usd_rate)
    );

    toast({
      title: "Precio actualizado",
      description: `Precio de ${priceUpdateData.ticker} actualizado exitosamente.`,
    });

    setPriceUpdateData({
      ticker: '',
      precio_ars: '',
      usd_rate: '1000'
    });
  };

  const tickers = getAllTickers();

  return (
    <div className="space-y-6">
      {/* Transaction Form */}
      <Card className="card-financial">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nueva Transacción
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={formData.tipo} onValueChange={(value: 'compra' | 'venta') => setFormData({ ...formData, tipo: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compra">Compra</SelectItem>
                    <SelectItem value="venta">Venta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ticker">CEDEAR</Label>
                <Select value={formData.ticker} onValueChange={(value) => setFormData({ ...formData, ticker: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar CEDEAR" />
                  </SelectTrigger>
                  <SelectContent>
                    {tickers.map((ticker) => {
                      const info = getCEDEARInfo(ticker);
                      return (
                        <SelectItem key={ticker} value={ticker}>
                          {ticker} - {info?.nombre}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="precio">Precio (ARS)</Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.precio_ars}
                  onChange={(e) => setFormData({ ...formData, precio_ars: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="cantidad">Cantidad</Label>
                <Input
                  id="cantidad"
                  type="number"
                  placeholder="0"
                  value={formData.cantidad}
                  onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="usd_rate">Tipo de Cambio USD</Label>
                <Input
                  id="usd_rate"
                  type="number"
                  step="0.01"
                  placeholder="1000.00"
                  value={formData.usd_rate_historico}
                  onChange={(e) => setFormData({ ...formData, usd_rate_historico: e.target.value })}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Transacción
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Price Update Form */}
      <Card className="card-financial">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Actualizar Precios
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPriceUpdate(!showPriceUpdate)}
            >
              {showPriceUpdate ? 'Ocultar' : 'Mostrar'}
            </Button>
          </CardTitle>
        </CardHeader>
        {showPriceUpdate && (
          <CardContent>
            <form onSubmit={handlePriceUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price-ticker">CEDEAR</Label>
                  <Select value={priceUpdateData.ticker} onValueChange={(value) => setPriceUpdateData({ ...priceUpdateData, ticker: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar CEDEAR" />
                    </SelectTrigger>
                    <SelectContent>
                      {tickers.map((ticker) => {
                        const info = getCEDEARInfo(ticker);
                        return (
                          <SelectItem key={ticker} value={ticker}>
                            {ticker} - {info?.nombre}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="new-price">Precio Actual (ARS)</Label>
                  <Input
                    id="new-price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={priceUpdateData.precio_ars}
                    onChange={(e) => setPriceUpdateData({ ...priceUpdateData, precio_ars: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="current-usd">Tipo de Cambio USD</Label>
                  <Input
                    id="current-usd"
                    type="number"
                    step="0.01"
                    placeholder="1000.00"
                    value={priceUpdateData.usd_rate}
                    onChange={(e) => setPriceUpdateData({ ...priceUpdateData, usd_rate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <Button type="submit" variant="outline" className="w-full">
                <DollarSign className="w-4 h-4 mr-2" />
                Actualizar Precio
              </Button>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
};