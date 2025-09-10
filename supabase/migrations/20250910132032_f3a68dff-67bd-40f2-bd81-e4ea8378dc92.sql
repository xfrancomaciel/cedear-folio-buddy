-- Hacer público el bucket de PDFs para que los reportes sean accesibles
UPDATE storage.buckets 
SET public = true 
WHERE id = 'report-pdfs';