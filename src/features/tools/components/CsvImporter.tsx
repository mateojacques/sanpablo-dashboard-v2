import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, X, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useCreateImportJob, useDownloadTemplate } from '../api/imports.queries';

type CsvImporterProps = {
  onImportStarted?: (jobId: string) => void;
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function CsvImporter({ onImportStarted }: CsvImporterProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const createImport = useCreateImportJob();
  const downloadTemplate = useDownloadTemplate();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.csv')) {
        toast.error('Solo se permiten archivos CSV');
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('El archivo no puede superar los 10MB');
        return;
      }
      setSelectedFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    disabled: createImport.isPending,
  });

  const handleClearFile = () => {
    setSelectedFile(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const result = await createImport.mutateAsync(selectedFile);
      toast.success('Importacion iniciada correctamente');
      setSelectedFile(null);
      onImportStarted?.(result.data.id);
    } catch (error) {
      toast.error('Error al iniciar la importacion');
      console.error('Import error:', error);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadTemplate.mutateAsync();
      toast.success('Plantilla descargada');
    } catch {
      toast.error('Error al descargar la plantilla');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Importar Productos
            </CardTitle>
            <CardDescription>
              Sube un archivo CSV con los datos de los productos a importar.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTemplate}
            disabled={downloadTemplate.isPending}
          >
            {downloadTemplate.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Descargar plantilla
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dropzone */}
        {!selectedFile ? (
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50',
              createImport.isPending && 'pointer-events-none opacity-50'
            )}
          >
            <input {...getInputProps()} />
            <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            {isDragActive ? (
              <p className="text-primary font-medium">Suelta el archivo aqui...</p>
            ) : (
              <>
                <p className="font-medium">
                  Arrastra un archivo CSV aqui o haz clic para seleccionar
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Maximo 10MB
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileSpreadsheet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearFile}
                disabled={createImport.isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Upload progress */}
            {createImport.isPending && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subiendo archivo...</span>
                </div>
                <Progress value={undefined} className="h-2" />
              </div>
            )}
          </div>
        )}

        {/* Upload button */}
        {selectedFile && (
          <div className="flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={createImport.isPending}
            >
              {createImport.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Iniciar importacion
                </>
              )}
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
          <p className="font-medium">Instrucciones:</p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Descarga la plantilla CSV para ver el formato requerido</li>
            <li>El campo SKU es obligatorio y debe ser unico</li>
            <li>Los precios deben estar en formato numerico (ej: 19.99)</li>
            <li>Los productos existentes se actualizaran segun el SKU</li>
            <li>Los nuevos SKUs crearan productos nuevos</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
