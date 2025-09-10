import { useState } from 'react';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { PortfolioSummaryCard } from '@/components/Portfolio/PortfolioSummary';
import { PositionsTable } from '@/components/Portfolio/PositionsTable';
import { TransactionForm } from '@/components/Portfolio/TransactionForm';
import { TransactionHistory } from '@/components/Portfolio/TransactionHistory';
import { RealizedGainsTable } from '@/components/Portfolio/RealizedGainsTable';
import { PriceUpdateStatus } from '@/components/Portfolio/PriceUpdateStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PieChart, Plus, History, Settings, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const {
    transactions,
    currentPrices,
    portfolioSummary,
    addTransaction,
    updateCurrentPrice,
    deleteTransaction,
    clearAllData,
    pricesLoading,
    pricesError,
    pricesLastUpdated,
    refreshPrices
  } = usePortfolioData();

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearData = () => {
    if (showClearConfirm) {
      clearAllData();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        {/* Price Update Status */}
        <div className="mb-6">
          <PriceUpdateStatus
            loading={pricesLoading}
            error={pricesError}
            lastUpdated={pricesLastUpdated}
            onRefresh={refreshPrices}
          />
        </div>

        {/* Portfolio Summary */}
        {portfolioSummary && (
          <div className="mb-8 animate-fade-in">
            <PortfolioSummaryCard summary={portfolioSummary} />
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-card/50">
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Agregar
            </TabsTrigger>
            <TabsTrigger value="gains" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Ganancias
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Historial
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Config
            </TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-6 animate-slide-up">
            {portfolioSummary ? (
              <PositionsTable positions={portfolioSummary.posiciones} />
            ) : (
              <Card className="card-financial">
                <CardContent className="text-center py-12">
                  <PieChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Portfolio Vacío</h3>
                  <p className="text-muted-foreground mb-6">
                    Comienza agregando tu primera transacción para ver tu portfolio
                  </p>
                  <Button className="gradient-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Primera Transacción
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="add" className="animate-slide-up">
            <TransactionForm
              onAddTransaction={addTransaction}
              onUpdatePrice={updateCurrentPrice}
            />
          </TabsContent>

          <TabsContent value="gains" className="animate-slide-up">
            {portfolioSummary && portfolioSummary.operaciones_cerradas.length > 0 ? (
              <RealizedGainsTable operacionesCerradas={portfolioSummary.operaciones_cerradas} />
            ) : (
              <Card className="card-financial">
                <CardContent className="text-center py-12">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Sin Ganancias Realizadas</h3>
                  <p className="text-muted-foreground">
                    Realiza operaciones de venta para ver tus ganancias aquí
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="animate-slide-up">
            <TransactionHistory
              transactions={transactions}
              onDeleteTransaction={deleteTransaction}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 animate-slide-up">
            <Card className="card-financial">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuración
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Datos del Portfolio</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Toda la información se almacena localmente en tu navegador.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <div className="font-semibold">Transacciones</div>
                      <div className="text-muted-foreground">{transactions.length}</div>
                    </div>
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <div className="font-semibold">Precios Actualizados</div>
                      <div className="text-muted-foreground">{Object.keys(currentPrices).length}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-6">
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    Zona de Peligro
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Esta acción eliminará permanentemente todos tus datos.
                  </p>
                  <Button
                    variant={showClearConfirm ? "destructive" : "outline"}
                    onClick={handleClearData}
                    className="w-full"
                  >
                    {showClearConfirm ? "¿Confirmar eliminación?" : "Limpiar Todos los Datos"}
                  </Button>
                  {showClearConfirm && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Haz clic nuevamente para confirmar (se cancela automáticamente en 3s)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <Card className="card-financial border-warning/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <h4 className="font-semibold mb-2">Disclaimer Financiero</h4>
                    <p className="text-muted-foreground">
                      Esta herramienta es solo para fines informativos y de tracking personal. 
                      No constituye asesoramiento financiero. Los precios y cálculos pueden no estar actualizados 
                      o ser inexactos. Siempre consulta fuentes oficiales y profesionales para decisiones de inversión.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
