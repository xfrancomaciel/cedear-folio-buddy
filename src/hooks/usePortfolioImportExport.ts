import { useState } from 'react';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { Transaction, TransactionCategory } from '@/types/portfolio';
import { enhanceTransaction } from '@/utils/portfolioCalculations';
import { z } from 'zod';

const ImportTransactionSchema = z.object({
  fecha: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha debe estar en formato YYYY-MM-DD"
  }),
  tipo: z.enum(['compra', 'venta'], {
    message: "Tipo debe ser 'compra' o 'venta'"
  }),
  ticker: z.string().min(1, "Ticker es requerido"),
  precio_ars: z.number().positive("Precio ARS debe ser positivo"),
  cantidad: z.number().int().positive("Cantidad debe ser un número entero positivo"),
  usd_rate_historico: z.number().positive("USD histórico debe ser positivo"),
  categoria: z.enum([
    'Jubilación',
    'Viaje',
    'Ahorro',
    'Emergencias',
    'Educación',
    'Inversión',
    'Casa',
    'Auto'
  ]).optional()
});

export const usePortfolioImportExport = (
  transactions: Transaction[],
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>
) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const workbook = XLSX.utils.book_new();

      // Preparar datos de transacciones para exportar
      const exportData = transactions.map(t => ({
        Fecha: t.fecha,
        Tipo: t.tipo,
        Ticker: t.ticker,
        'Precio ARS': t.precio_ars,
        Cantidad: t.cantidad,
        'USD Histórico': t.usd_rate_historico,
        Categoría: t.categoria || 'Inversión'
      }));

      // Crear hoja de transacciones
      const transactionsSheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transacciones');

      // Crear hoja de instrucciones
      const instructions = [
        ['INSTRUCCIONES PARA IMPORTAR PORTFOLIO'],
        [''],
        ['1. Complete los datos en la hoja "Transacciones"'],
        ['2. Mantenga exactamente el formato de las columnas'],
        ['3. Guarde el archivo y súbalo a la aplicación'],
        [''],
        ['FORMATO DE COLUMNAS:'],
        ['• Fecha: YYYY-MM-DD (ej: 2024-01-15)'],
        ['• Tipo: "compra" o "venta"'],
        ['• Ticker: Símbolo del CEDEAR (ej: AAPL)'],
        ['• Precio ARS: Precio en pesos argentinos'],
        ['• Cantidad: Número entero de CEDEARs'],
        ['• USD Histórico: Cotización del dólar al momento'],
        ['• Categoría: Jubilación, Viaje, Ahorro, Emergencias, Educación, Inversión, Casa, Auto'],
        [''],
        ['EJEMPLOS:'],
        ['2024-01-15 | compra | AAPL | 25000 | 10 | 1000 | Inversión'],
        ['2024-02-20 | venta | MSFT | 18000 | 5 | 1100 | Ahorro']
      ];

      const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions);
      XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instrucciones');

      // Descargar archivo
      const fileName = `portfolio_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Exportación exitosa",
        description: `Plantilla descargada como ${fileName}`,
      });
    } catch (error) {
      console.error('Error al exportar:', error);
      toast({
        title: "Error en exportación",
        description: "No se pudo generar el archivo Excel",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const importFromExcel = async (file: File) => {
    setIsImporting(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      
      // Verificar que existe la hoja de transacciones
      if (!workbook.SheetNames.includes('Transacciones')) {
        throw new Error('El archivo debe contener una hoja llamada "Transacciones"');
      }

      const worksheet = workbook.Sheets['Transacciones'];
      const rawData = XLSX.utils.sheet_to_json(worksheet);

      if (rawData.length === 0) {
        throw new Error('La hoja de transacciones está vacía');
      }

      // Validar y procesar datos
      const validTransactions: Omit<Transaction, 'id' | 'created_at'>[] = [];
      const errors: string[] = [];

      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i] as any;
        try {
          // Mapear columnas del Excel a nuestro formato
          const transactionData = {
            fecha: row['Fecha'],
            tipo: row['Tipo'],
            ticker: row['Ticker'],
            precio_ars: Number(row['Precio ARS']),
            cantidad: Number(row['Cantidad']),
            usd_rate_historico: Number(row['USD Histórico']),
            categoria: row['Categoría'] as TransactionCategory
          };

          // Validar con Zod
          const validatedData = ImportTransactionSchema.parse(transactionData);

          // Calcular totales
          const total_ars = validatedData.precio_ars * validatedData.cantidad;
          const total_usd = total_ars / validatedData.usd_rate_historico;

          // Construir transacción completa para enhanceTransaction
          const completeTransaction = {
            user_id: '', // Se establecerá en el hook usePortfolioData
            fecha: validatedData.fecha,
            tipo: validatedData.tipo,
            ticker: validatedData.ticker,
            precio_ars: validatedData.precio_ars,
            cantidad: validatedData.cantidad,
            usd_rate_historico: validatedData.usd_rate_historico,
            total_ars,
            total_usd,
            categoria: validatedData.categoria || 'Inversión',
            dias_tenencia: 0
          } as const;

          // Enhancear transacción con cálculos adicionales
          const enhancedTransaction = enhanceTransaction(completeTransaction);

          validTransactions.push(enhancedTransaction);
        } catch (error) {
          const errorMsg = error instanceof z.ZodError 
            ? error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
            : String(error);
          errors.push(`Fila ${i + 2}: ${errorMsg}`);
        }
      }

      if (errors.length > 0 && validTransactions.length === 0) {
        throw new Error(`Errores en todas las filas:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}`);
      }

      // Importar transacciones válidas
      for (const transaction of validTransactions) {
        await addTransaction(transaction);
      }

      const successMsg = `${validTransactions.length} transacciones importadas exitosamente`;
      const warningMsg = errors.length > 0 ? `\n${errors.length} filas con errores fueron omitidas` : '';

      toast({
        title: "Importación completa",
        description: successMsg + warningMsg,
        variant: errors.length > 0 ? "default" : "default"
      });

      if (errors.length > 0) {
        console.warn('Errores durante la importación:', errors);
      }

    } catch (error) {
      console.error('Error al importar:', error);
      toast({
        title: "Error en importación",
        description: error instanceof Error ? error.message : "Error desconocido al procesar el archivo",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return {
    exportToExcel,
    importFromExcel,
    isExporting,
    isImporting
  };
};