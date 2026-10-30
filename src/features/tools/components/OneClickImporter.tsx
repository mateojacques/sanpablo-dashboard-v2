import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Database,
  Loader2,
  X,
  Check,
  AlertCircle,
  Zap,
  FileSpreadsheet,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getDbfErrorMessage } from '../api/imports.api';
import { useCreateDbfImportJob } from '../api/imports.queries';

type OneClickImporterProps = {
  onImportStarted?: (jobId: string) => void;
};

type ImportPhase = 'idle' | 'uploading' | 'processing' | 'done';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function OneClickImporter({ onImportStarted }: OneClickImporterProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<ImportPhase>('idle');
  const [uploadPercent, setUploadPercent] = useState(0);

  const createImport = useCreateDbfImportJob();
  const isBusy = phase === 'uploading' || phase === 'processing';

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.dbf')) {
        toast.error('Solo se permiten archivos DBF');
        return;
      }
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast.error('El archivo no puede superar los 100MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setPhase('idle');
      setUploadPercent(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/dbase': ['.dbf'],
      'application/x-dbf': ['.dbf'],
      'application/octet-stream': ['.dbf'],
    },
    maxFiles: 1,
    disabled: isBusy,
  });

  const handleClearFile = () => {
    setSelectedFile(null);
    setError(null);
    setPhase('idle');
    setUploadPercent(0);
  };

  const handleStartImport = async () => {
    if (!selectedFile) return;

    setPhase('uploading');
    setUploadPercent(0);
    setError(null);

    try {
      const result = await createImport.mutateAsync({
        file: selectedFile,
        onUploadProgress: (percent) => {
          setUploadPercent(percent);
          // The server converts the DBF once the upload is complete
          if (percent >= 100) setPhase('processing');
        },
      });

      setPhase('done');
      toast.success('Importación iniciada');
      onImportStarted?.(result.data.id);
    } catch (err) {
      const message = getDbfErrorMessage(err, 'Error al iniciar la importación');
      setError(message);
      setPhase('idle');
      toast.error(message);
    }
  };

  const phaseLabel =
    phase === 'uploading' ? 'Subiendo archivo...' : 'Procesando DBF en el servidor...';
  const phaseProgress = phase === 'uploading' ? uploadPercent : 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Importacion en 1 Click
        </CardTitle>
        <CardDescription>
          Sube un archivo DBF de tu sistema de inventario y se importara
          automaticamente. Sin pasos intermedios.
        </CardDescription>
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
              isBusy && 'pointer-events-none opacity-50'
            )}
          >
            <input {...getInputProps()} />
            <Database className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            {isDragActive ? (
              <p className="text-primary font-medium">
                Suelta el archivo aqui...
              </p>
            ) : (
              <>
                <p className="font-medium">
                  Arrastra un archivo DBF aqui o haz clic para seleccionar
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  El archivo sera convertido y los productos importados
                  automaticamente
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {phase === 'done' ? (
                    <FileSpreadsheet className="h-6 w-6 text-primary" />
                  ) : (
                    <Database className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {phase === 'done' && (
                  <Badge variant="outline" className="gap-1 text-green-600">
                    <Check className="h-3 w-3" />
                    Enviado
                  </Badge>
                )}
                {error && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Error
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearFile}
                  disabled={isBusy}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {isBusy && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {phaseLabel}
              </span>
              {phase === 'uploading' && (
                <span className="font-medium">{phaseProgress}%</span>
              )}
            </div>
            <Progress value={phaseProgress} className="h-2" />
          </div>
        )}

        {/* Action button */}
        {selectedFile && phase === 'idle' && (
          <div className="flex justify-end">
            <Button onClick={handleStartImport}>
              <Zap className="mr-2 h-4 w-4" />
              Iniciar Importacion
            </Button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
          <p className="font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            Como funciona:
          </p>
          <ol className="list-decimal list-inside text-muted-foreground space-y-1">
            <li>Selecciona tu archivo DBF (stock.DBF u otro)</li>
            <li>Haz clic en "Iniciar Importacion"</li>
            <li>El servidor convierte el DBF al formato de importación</li>
            <li>Los productos se importan/actualizan segun el SKU</li>
          </ol>
          <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
            Nota: Los productos existentes se actualizaran segun el SKU. Los
            nuevos SKUs crearan productos nuevos.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
