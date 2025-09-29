import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, FileSpreadsheet, Loader2 } from 'lucide-react';
import { usePortfolioImportExport } from '@/hooks/usePortfolioImportExport';
import { Transaction } from '@/types/portfolio';

interface ImportExportButtonsProps {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>;
}

export const ImportExportButtons = ({ transactions, addTransaction }: ImportExportButtonsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { exportToExcel, importFromExcel, isExporting, isImporting } = usePortfolioImportExport(
    transactions,
    addTransaction
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        alert('Por favor seleccione un archivo Excel (.xlsx o .xls)');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 5MB permitido.');
        return;
      }

      importFromExcel(file);
    }
    
    // Limpiar input para permitir seleccionar el mismo archivo nuevamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Importar/Exportar Portfolio
        </CardTitle>
        <CardDescription>
          Exporta tu portfolio actual como plantilla Excel o importa transacciones desde un archivo Excel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Exportar */}
          <div className="space-y-2">
            <h4 className="font-medium">Exportar Portfolio</h4>
            <p className="text-sm text-muted-foreground">
              Descarga una plantilla Excel con tus transacciones actuales
            </p>
            <Button 
              onClick={exportToExcel}
              disabled={isExporting}
              className="w-full"
              variant="outline"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar a Excel
                </>
              )}
            </Button>
          </div>

          {/* Importar */}
          <div className="space-y-2">
            <h4 className="font-medium">Importar Transacciones</h4>
            <p className="text-sm text-muted-foreground">
              Sube un archivo Excel con tus transacciones
            </p>
            <Button 
              onClick={handleImportClick}
              disabled={isImporting}
              className="w-full"
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Importar desde Excel
                </>
              )}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Instrucciones */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Instrucciones de uso:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Exportar:</strong> Descarga una plantilla con tus datos actuales</li>
            <li>• <strong>Completar:</strong> Agrega nuevas transacciones en la hoja "Transacciones"</li>
            <li>• <strong>Importar:</strong> Sube el archivo completado para cargar las transacciones</li>
            <li>• <strong>Formato:</strong> Mantén exactamente el formato de las columnas</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};