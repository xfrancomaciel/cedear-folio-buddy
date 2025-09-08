import { Transaction } from '@/types/portfolio';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/portfolioCalculations';
import { getCEDEARInfo } from '@/data/cedearsData';
import { History, Trash2 } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

export const TransactionHistory = ({ transactions, onDeleteTransaction }: TransactionHistoryProps) => {
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (transactions.length === 0) {
    return (
      <Card className="card-financial">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Transacciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No hay transacciones registradas
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-financial">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Historial de Transacciones ({transactions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedTransactions.map((transaction) => {
            const cedearsInfo = getCEDEARInfo(transaction.ticker);
            const date = new Date(transaction.fecha).toLocaleDateString('es-AR');
            
            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={transaction.tipo === 'compra' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {transaction.tipo.toUpperCase()}
                      </Badge>
                      <span className="font-semibold">{transaction.ticker}</span>
                      <span className="text-sm text-muted-foreground">
                        {cedearsInfo?.nombre}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {date} • {transaction.cantidad.toLocaleString()} CEDEARs
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(transaction.precio_ars, 'ARS')} c/u
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total: {formatCurrency(transaction.total_ars, 'ARS')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      USD: ${transaction.usd_rate_historico.toFixed(2)}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteTransaction(transaction.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};