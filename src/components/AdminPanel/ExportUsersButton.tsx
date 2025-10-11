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

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Nunca';
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);

      // Preparar datos para exportación
      const exportData: ExportUserData[] = users.map(user => ({
        'Usuario': user.full_name || 'Sin nombre',
        'Email': user.email || 'Sin email',
        'Rol': user.role || 'user',
        'Plan': user.plan || 'cliente',
        'Último Ingreso': formatDate(user.last_sign_in_at),
        'Registro': formatDate(user.created_at)
      }));

      // Crear libro de Excel
      const workbook = XLSX.utils.book_new();

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
