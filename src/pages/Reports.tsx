import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ReportCard } from "@/components/Reports/ReportCard";

import { Plus, Search, Filter, Download, Menu } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMobileOptimizations } from "@/hooks/useMobileOptimizations";
import { useReportsManagement, Report } from "@/hooks/useReportsManagement";
import { useUserRole } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";

const Reports = () => {
  const { reports, categories, loading, fetchReports } = useReportsManagement();
  const { isAdmin } = useUserRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  

  // Load reports based on user role
  React.useEffect(() => {
    fetchReports(isAdmin); // Admin sees all, users see only published
  }, [isAdmin]);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "Todos" || report.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const availableCategories = ["Todos", ...categories.map(cat => cat.name)];

  const { isMobile, touchTargetSize, cardSpacing } = useMobileOptimizations();

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-4 md:p-6", cardSpacing)}>
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <h1 className={cn("font-bold text-foreground", isMobile ? "text-2xl" : "text-3xl")}>
              Reportes
            </h1>
            <p className={cn("text-muted-foreground mt-2", isMobile ? "text-base" : "text-sm")}>
              Análisis y reportes de mercado
            </p>
          </div>
          {isAdmin && (
            <Button 
              className={cn("flex items-center gap-2", touchTargetSize)}
              onClick={() => window.location.href = '/admin/reports'}
            >
              <Plus className="h-4 w-4" />
              {isMobile ? "Nuevo" : "Nuevo Reporte"}
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder={isMobile ? "Buscar..." : "Buscar reportes..."} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn("pl-10", touchTargetSize)}
            />
          </div>
            <div className="flex gap-2 flex-wrap">
              {availableCategories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className={cn(
        "grid gap-4",
        isMobile 
          ? "grid-cols-1" 
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      )}>
        {filteredReports.map((report) => (
          <ReportCard
            key={report.id}
            report={{
              ...report,
              coverImage: report.cover_image_url || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
              pdfUrl: report.pdf_url || "",
              date: new Date(report.created_at).toISOString().split('T')[0],
              category: report.category?.name || "Sin categoría"
            }}
            
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-muted-foreground">
              <Filter className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron reportes</h3>
              <p>Intenta con otros términos de búsqueda o categorías</p>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default Reports;