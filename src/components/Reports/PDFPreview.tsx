import React from "react";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, X } from "lucide-react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

interface PDFPreviewProps {
  report: Report;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ report }) => {
  return (
    <div className="flex flex-col h-full">
      <DialogHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="text-lg">{report.title}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">{report.description || "Sin descripción"}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir
            </Button>
          </div>
        </div>
      </DialogHeader>

      <div className="flex-1 bg-muted rounded-lg flex items-center justify-center">
        {/* PDF Viewer Placeholder */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
            <svg 
              className="w-8 h-8 text-primary" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-foreground">Vista previa del PDF</h3>
            <p className="text-sm text-muted-foreground">
              El visor de PDF se cargaría aquí en una implementación completa
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4 text-left max-w-md mx-auto">
            <h4 className="font-medium mb-2">Para implementar el visor PDF:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Usar react-pdf o pdf-js</li>
              <li>• Configurar worker para PDF.js</li>
              <li>• Añadir controles de navegación</li>
              <li>• Implementar zoom y búsqueda</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};