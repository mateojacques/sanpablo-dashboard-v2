import { useState, useCallback, useRef, useEffect } from 'react';
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
import { useCreateImportJob } from '../api/imports.queries';
import type { DbfWorkerResponse, ProcessingState } from '../workers/dbf.types';

// Import worker using Vite's worker syntax
import DbfWorker from '../workers/dbf.worker?worker';

type OneClickImporterProps = {
  onImportStarted?: (jobId: string) => void;
  onCsvGenerated?: (csv: { blob: Blob; filename: string; recordCount: number }) => void;
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-AR').format(num);
}

export function OneClickImporter({ onImportStarted, onCsvGenerated }: OneClickImporterProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordCount, setRecordCount] = useState<number>(0);
  const [generatedCsv, setGeneratedCsv] = useState<{ blob: Blob; filename: string } | null>(null);
  const [csvPreview, setCsvPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    phase: 'idle',
    percent: 0,
  });

  const workerRef = useRef<Worker | null>(null);
  const createImport = useCreateImportJob();

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

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
      setRecordCount(0);
      setGeneratedCsv(null);
      setCsvPreview(null);
      setProcessing({ isProcessing: false, phase: 'idle', percent: 0 });
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
    disabled: processing.isProcessing,
  });

  const handleClearFile = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setSelectedFile(null);
    setError(null);
    setRecordCount(0);
    setGeneratedCsv(null);
    setCsvPreview(null);
    setProcessing({ isProcessing: false, phase: 'idle', percent: 0 });
  };

  const handleDownloadGeneratedCsv = () => {
    if (!generatedCsv) return;

    const url = window.URL.createObjectURL(generatedCsv.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = generatedCsv.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleLoadCsvPreview = async () => {
    if (!generatedCsv) return;
    try {
      // Only read the first ~64KB to avoid loading huge files into memory
      const slice = generatedCsv.blob.slice(0, 64 * 1024);
      const text = await slice.text();
      setCsvPreview(text);
    } catch {
      toast.error('No se pudo generar la vista previa del CSV');
    }
  };

  const handleStartImport = async () => {
    if (!selectedFile) return;

    setProcessing({ isProcessing: true, phase: 'parsing', percent: 0 });
    setError(null);

    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await selectedFile.arrayBuffer();

      // Create worker
      const worker = new DbfWorker();
      workerRef.current = worker;

      // Handle worker messages
      worker.onmessage = async (event: MessageEvent<DbfWorkerResponse>) => {
        const response = event.data;

        switch (response.type) {
          case 'progress':
            setProcessing({
              isProcessing: true,
              phase: response.phase,
              percent: response.percent,
            });
            break;

          case 'api-format-complete':
            {
              // Update record count
              setRecordCount(response.recordCount);

              // Keep the generated CSV for debugging/download
              const generatedFilename = selectedFile.name.replace(/\.dbf$/i, '.csv');
              setGeneratedCsv({ blob: response.csvBlob, filename: generatedFilename });
              setCsvPreview(null);

              onCsvGenerated?.({
                blob: response.csvBlob,
                filename: generatedFilename,
                recordCount: response.recordCount,
              });

              // Cleanup worker
              worker.terminate();
              workerRef.current = null;

              // Now upload the CSV to start the import
              setProcessing({ isProcessing: true, phase: 'uploading', percent: 0 });

              try {
                // Create a File object from the Blob for the API
                const csvFile = new File(
                  [response.csvBlob],
                  generatedFilename,
                  { type: 'text/csv' }
                );

                const result = await createImport.mutateAsync(csvFile);

                setProcessing({ isProcessing: false, phase: 'done', percent: 100 });
                toast.success(
                  `Importacion iniciada: ${formatNumber(response.recordCount)} productos`
                );
                onImportStarted?.(result.data.id);
              } catch (uploadError) {
                const message =
                  uploadError instanceof Error
                    ? uploadError.message
                    : 'Error al iniciar la importacion';
                setError(message);
                setProcessing({ isProcessing: false, phase: 'idle', percent: 0 });
                toast.error(message);
              }
              break;
            }

          case 'error':
            setError(response.message);
            setProcessing({ isProcessing: false, phase: 'idle', percent: 0 });
            toast.error(response.message);

            // Cleanup worker
            worker.terminate();
            workerRef.current = null;
            break;
        }
      };

      worker.onerror = (err) => {
        const message = 'Error en el procesamiento del archivo';
        setError(message);
        setProcessing({ isProcessing: false, phase: 'idle', percent: 0 });
        toast.error(message);
        console.error('Worker error:', err);

        // Cleanup worker
        worker.terminate();
        workerRef.current = null;
      };

      // Send file to worker with API format type
      worker.postMessage({ type: 'parse-api-format', buffer: arrayBuffer });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al leer el archivo';
      setError(message);
      setProcessing({ isProcessing: false, phase: 'idle', percent: 0 });
      toast.error(message);
    }
  };

  const getPhaseLabel = () => {
    switch (processing.phase) {
      case 'parsing':
        return 'Leyendo archivo DBF...';
      case 'mapping':
        return 'Convirtiendo a formato de importacion...';
      case 'uploading':
        return 'Subiendo archivo e iniciando importacion...';
      case 'done':
        return 'Importacion iniciada';
      default:
        return '';
    }
  };

  const getPhaseProgress = () => {
    // Total progress is split across phases
    switch (processing.phase) {
      case 'parsing':
        return Math.round(processing.percent * 0.3); // 0-30%
      case 'mapping':
        return 30 + Math.round(processing.percent * 0.5); // 30-80%
      case 'uploading':
        return 80 + Math.round(processing.percent * 0.2); // 80-100%
      case 'done':
        return 100;
      default:
        return 0;
    }
  };

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
              processing.isProcessing && 'pointer-events-none opacity-50'
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
                  {processing.phase === 'done' ? (
                    <FileSpreadsheet className="h-6 w-6 text-primary" />
                  ) : (
                    <Database className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                    {recordCount > 0 && ` - ${formatNumber(recordCount)} registros`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {processing.phase === 'done' && (
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
                  disabled={processing.isProcessing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {processing.isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {getPhaseLabel()}
              </span>
              <span className="font-medium">{getPhaseProgress()}%</span>
            </div>
            <Progress value={getPhaseProgress()} className="h-2" />
          </div>
        )}

        {/* Debug / download generated CSV */}
        {generatedCsv && (
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-medium text-sm">Debug CSV generado</p>
                <p className="text-xs text-muted-foreground">
                  Si la importacion falla, descarga este CSV para inspeccionarlo.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleLoadCsvPreview}>
                  Ver preview
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadGeneratedCsv}>
                  Descargar CSV
                </Button>
              </div>
            </div>

            {csvPreview && (
              <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap">
{csvPreview}
              </pre>
            )}
          </div>
        )}

        {/* Action button */}
        {selectedFile && processing.phase !== 'done' && !processing.isProcessing && (
          <div className="flex justify-end">
            <Button onClick={handleStartImport} disabled={processing.isProcessing}>
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
            <li>El sistema convierte automaticamente el DBF al formato correcto</li>
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
