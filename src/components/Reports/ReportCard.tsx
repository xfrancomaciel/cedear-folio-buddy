import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Edit3, Calendar, Save, X } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Report {
  id: string;
  title: string;
  description: string | null;
  coverImage?: string;
  cover_image_url?: string | null;
  pdfUrl?: string;
  pdf_url?: string | null;
  date?: string;
  created_at?: string;
  category?: string;
  status: string;
}

interface ReportCardProps {
  report: Report;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(report.title);
  const [editedDescription, setEditedDescription] = useState(report.description || "");
  const [editedCoverUrl, setEditedCoverUrl] = useState(report.coverImage || report.cover_image_url || "");

  const coverImageUrl = report.coverImage || report.cover_image_url || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop";
  const reportDate = report.date || (report.created_at ? new Date(report.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);

  const handleSave = () => {
    // Here you would typically save to backend
    console.log("Saving report:", { editedTitle, editedDescription, editedCoverUrl });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(report.title);
    setEditedDescription(report.description || "");
    setEditedCoverUrl(report.coverImage || report.cover_image_url || "");
    setIsEditing(false);
  };

  const statusColor = report.status === "published" || report.status === "Publicado" ? "default" : "secondary";

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative">
        <div 
          className="h-64 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundImage: `url(${coverImageUrl})` }}
        >
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm line-clamp-2 leading-tight">
              {report.title}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {format(new Date(reportDate), "dd MMM yyyy", { locale: es })}
            </div>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit3 className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Editar Portada</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Título</label>
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Descripción</label>
                  <Input
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">URL de la imagen</label>
                  <Input
                    value={editedCoverUrl}
                    onChange={(e) => setEditedCoverUrl(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-3 w-3 mr-1" />
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-3 w-3 mr-1" />
                    Guardar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {report.description || "Sin descripción"}
        </p>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1 text-xs h-8"
            onClick={() => {
              const pdfUrl = report.pdf_url || report.pdfUrl;
              if (pdfUrl) {
                const link = document.createElement('a');
                link.href = pdfUrl;
                link.download = `${report.title}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            }}
          >
            <Download className="h-3 w-3 mr-1" />
            Descargar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};