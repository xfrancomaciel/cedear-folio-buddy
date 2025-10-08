import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { ExtendedUserProfile, ExportUserData } from '@/types/admin';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ExportUsersButtonProps {
  users: ExtendedUserProfile[];
  disabled?: boolean;
}

export function ExportUsersButton({ users, disabled }: ExportUsersButtonProps) {
  const [exporting, setExporting] = useState(false);

  const formatCurrency = (value: number | undefined, currency: 'USD' | 'ARS') => {
    if (value === undefined || value === null) return 0;
    return value;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Nunca';
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getUserStatus = (lastSignIn: string | undefined): string => {
    if (!lastSignIn) return 'Inactivo';
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(lastSignIn) > thirtyDaysAgo ? 'Activo' : 'Inactivo';
  };

  const handleExport = async () => {
    try {
      setExporting(true);

      // Preparar datos para exportación
      const exportData: ExportUserData[] = users.map(user => ({
        'Nombre Completo': user.full_name || 'Sin nombre',
        'Email': user.email || 'Sin email',
        'Username': user.username || 'Sin username',
        'Rol': user.role || 'user',
        'Plan': user.plan || 'cliente',
        'Estado Plan': user.plan_status || 'none',
        'Fecha Registro': formatDate(user.created_at),
        'Último Ingreso': formatDate(user.last_sign_in_at),
        'Total Transacciones': user.total_transactions || 0,
        'Portfolio USD': formatCurrency(user.portfolio_value_usd, 'USD'),
        'Portfolio ARS': formatCurrency(user.portfolio_value_ars, 'ARS'),
        'Estado Usuario': getUserStatus(user.last_sign_in_at)
      }));

      // Calcular totales
      const totalPortfolioUSD = users.reduce((sum, u) => sum + (u.portfolio_value_usd || 0), 0);
      const totalPortfolioARS = users.reduce((sum, u) => sum + (u.portfolio_value_ars || 0), 0);
      const totalTransactions = users.reduce((sum, u) => sum + (u.total_transactions || 0), 0);
      const activeUsers = users.filter(u => getUserStatus(u.last_sign_in_at) === 'Activo').length;

      // Crear hoja de resumen
      const summaryData = [
        ['Resumen de Usuarios - BDI Suite'],
        ['Fecha de Exportación:', format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })],
        [''],
        ['Total de Usuarios:', users.length],
        ['Usuarios Activos:', activeUsers],
        ['Usuarios Inactivos:', users.length - activeUsers],
        [''],
        ['Total Portfolio USD:', totalPortfolioUSD],
        ['Total Portfolio ARS:', totalPortfolioARS],
        ['Total Transacciones:', totalTransactions],
        [''],
        ['Distribución por Roles:'],
        ['Administradores:', users.filter(u => u.role === 'admin').length],
        ['Moderadores:', users.filter(u => u.role === 'moderator').length],
        ['Usuarios:', users.filter(u => u.role === 'user').length],
        [''],
        ['Distribución por Planes:'],
        ['Plan Cliente:', users.filter(u => u.plan === 'cliente').length],
        ['Plan Premium:', users.filter(u => u.plan === 'premium').length],
        ['Plan Enterprise:', users.filter(u => u.plan === 'enterprise').length]
      ];

      // Crear libro de Excel
      const workbook = XLSX.utils.book_new();

      // Agregar hoja de resumen
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

      // Agregar hoja de usuarios
      const usersSheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, usersSheet, 'Usuarios');

      // Generar nombre de archivo con fecha
      const fileName = `usuarios_bdi_suite_${format(new Date(), 'yyyy-MM-dd_HHmm')}.xlsx`;

      // Descargar archivo
      XLSX.writeFile(workbook, fileName);

      toast.success(`${users.length} usuarios exportados correctamente`);
    } catch (error) {
      console.error('Error al exportar usuarios:', error);
      toast.error('Error al exportar los datos');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || exporting || users.length === 0}
      variant="outline"
      size="sm"
    >
      <Download className="h-4 w-4 mr-2" />
      {exporting ? 'Exportando...' : 'Exportar Excel'}
    </Button>
  );
}
