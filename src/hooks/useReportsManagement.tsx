import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ReportCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  pdf_url: string | null;
  category_id: string | null;
  status: 'draft' | 'published';
  created_by: string;
  created_at: string;
  updated_at: string;
  category?: ReportCategory;
}

export function useReportsManagement() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('report_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Error al cargar categorías');
    }
  };

  // Fetch reports (with category info)
  const fetchReports = async (includeAll = false) => {
    try {
      let query = supabase
        .from('reports')
        .select(`
          *,
          category:report_categories(*)
        `)
        .order('created_at', { ascending: false });

      // If not admin, only show published reports
      if (!includeAll) {
        query = query.eq('status', 'published');
      }

      const { data, error } = await query;

      if (error) throw error;
      setReports((data || []) as Report[]);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Error al cargar reportes');
    }
  };

  // Create report
  const createReport = async (reportData: {
    title: string;
    description?: string;
    category_id?: string;
    status?: 'draft' | 'published';
  }) => {
    try {
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('reports')
        .insert({
          ...reportData,
          created_by: user.id
        })
        .select(`
          *,
          category:report_categories(*)
        `)
        .single();

      if (error) throw error;

      setReports(prev => [data as Report, ...prev]);
      toast.success('Reporte creado exitosamente');
      return data;
    } catch (err) {
      console.error('Error creating report:', err);
      toast.error('Error al crear el reporte');
      throw err;
    }
  };

  // Update report
  const updateReport = async (id: string, updates: Partial<Report>) => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          category:report_categories(*)
        `)
        .single();

      if (error) throw error;

      setReports(prev => prev.map(report => 
        report.id === id ? data as Report : report
      ));
      toast.success('Reporte actualizado exitosamente');
      return data;
    } catch (err) {
      console.error('Error updating report:', err);
      toast.error('Error al actualizar el reporte');
      throw err;
    }
  };

  // Delete report
  const deleteReport = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReports(prev => prev.filter(report => report.id !== id));
      toast.success('Reporte eliminado exitosamente');
    } catch (err) {
      console.error('Error deleting report:', err);
      toast.error('Error al eliminar el reporte');
      throw err;
    }
  };

  // Upload image
  const uploadImage = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('report-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('report-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error('Error al subir la imagen');
      throw err;
    }
  };

  // Upload PDF
  const uploadPDF = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('report-pdfs')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('report-pdfs')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      console.error('Error uploading PDF:', err);
      toast.error('Error al subir el archivo PDF');
      throw err;
    }
  };

  // Toggle report status
  const toggleStatus = async (id: string, currentStatus: 'draft' | 'published') => {
    const newStatus = currentStatus === 'draft' ? 'published' : 'draft';
    return updateReport(id, { status: newStatus });
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCategories(),
        fetchReports(true) // Load all reports for admin
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    reports,
    categories,
    loading,
    error,
    fetchReports,
    createReport,
    updateReport,
    deleteReport,
    uploadImage,
    uploadPDF,
    toggleStatus,
    refetch: () => Promise.all([fetchCategories(), fetchReports(true)])
  };
}