import React from "react";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PDFViewer } from "./PDFViewer";
import { toast } from "sonner";

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
  const pdfUrl = report.pdf_url || report.pdfUrl;

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${report.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('PDF descargado');
    } else {
      toast.error('URL del PDF no disponible');
    }
  };

  const handleOpenInNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else {
      toast.error('URL del PDF no disponible');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <DialogHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="text-lg">{report.title}</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">{report.description || "Sin descripción"}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
            <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir
            </Button>
          </div>
        </div>
      </DialogHeader>

      <div className="flex-1">
        {pdfUrl ? (
          <PDFViewer pdfUrl={pdfUrl} className="h-full" />
        ) : (
          <div className="flex-1 bg-muted rounded-lg flex items-center justify-center h-full">
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
                <h3 className="font-medium text-foreground">PDF no disponible</h3>
                <p className="text-sm text-muted-foreground">
                  No se ha subido un archivo PDF para este reporte
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};