import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ReportCard } from "@/components/Reports/ReportCard";
import { PDFPreview } from "@/components/Reports/PDFPreview";
import { Plus, Search, Filter, Download } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// Mock data for reports
const mockReports = [
  {
    id: 1,
    title: "Análisis Trimestral Q4 2024",
    description: "Reporte completo del rendimiento del mercado en el último trimestre",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    pdfUrl: "/sample-report.pdf",
    date: "2024-12-15",
    category: "Trimestral",
    status: "Publicado"
  },
  {
    id: 2,
    title: "Bonos Argentinos - Diciembre 2024",
    description: "Análisis detallado del comportamiento de los bonos soberanos",
    coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop",
    pdfUrl: "/bonds-report.pdf",
    date: "2024-12-10",
    category: "Bonos",
    status: "Publicado"
  },
  {
    id: 3,
    title: "CEDEARs Outlook 2025",
    description: "Perspectivas y proyecciones para CEDEARs en el próximo año",
    coverImage: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop",
    pdfUrl: "/cedears-outlook.pdf",
    date: "2024-12-08",
    category: "CEDEARs",
    status: "Borrador"
  },
  {
    id: 4,
    title: "Informe Semanal - Semana 50",
    description: "Resumen semanal de los principales movimientos del mercado",
    coverImage: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=400&h=300&fit=crop",
    pdfUrl: "/weekly-report.pdf",
    date: "2024-12-13",
    category: "Semanal",
    status: "Publicado"
  }
];

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedReport, setSelectedReport] = useState(null);

  const categories = ["Todos", "Trimestral", "Bonos", "CEDEARs", "Semanal"];

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
          <p className="text-muted-foreground mt-2">
            Accede a todos los análisis y reportes de mercado
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Reporte
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Buscar reportes..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredReports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onPreview={() => setSelectedReport(report)}
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

      {/* PDF Preview Modal */}
      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <PDFPreview report={selectedReport} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Reports;