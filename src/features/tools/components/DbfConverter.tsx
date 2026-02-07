import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  FileSpreadsheet,
  Upload,
  Download,
  Loader2,
  X,
  Database,
  Check,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type {
  DbfWorkerResponse,
  ParsedDbfData,
  ProcessingState,
} from '../workers/dbf.types';

// Import worker using Vite's worker syntax
import DbfWorker from '../workers/dbf.worker?worker';

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

export function DbfConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedDbfData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    phase: 'idle',
    percent: 0,
  });

  const workerRef = useRef<Worker | null>(null);

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
      // Validate file size (max 100MB for DBF - increased from 50MB)
      if (file.size > 100 * 1024 * 1024) {
        toast.error('El archivo no puede superar los 100MB');
        return;
      }
      setSelectedFile(file);
      setParsedData(null);
      setError(null);
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
    // Terminate any running worker
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setSelectedFile(null);
    setParsedData(null);
    setError(null);
    setProcessing({ isProcessing: false, phase: 'idle', percent: 0 });
  };

  const handleParse = async () => {
    if (!selectedFile) return;

    setProcessing({ isProcessing: true, phase: 'parsing', percent: 0 });
    setError(null);
    setParsedData(null);

    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await selectedFile.arrayBuffer();

      // Create worker
      const worker = new DbfWorker();
      workerRef.current = worker;

      // Handle worker messages
      worker.onmessage = (event: MessageEvent<DbfWorkerResponse>) => {
        const response = event.data;

        switch (response.type) {
          case 'progress':
            setProcessing({
              isProcessing: true,
              phase: response.phase,
              percent: response.percent,
            });
            break;

          case 'preview':
            // Update with preview data immediately
            setParsedData((prev) => ({
              filename: selectedFile.name,
              fields: response.fields,
              preview: response.preview,
              recordCount: response.recordCount,
              csvBlob: prev?.csvBlob ?? null,
            }));
            break;

          case 'complete':
            setParsedData({
              filename: selectedFile.name,
              fields: response.fields,
              preview: parsedData?.preview ?? [],
              recordCount: response.recordCount,
              csvBlob: response.csvBlob,
            });
            setProcessing({ isProcessing: false, phase: 'done', percent: 100 });
            toast.success(
              `Archivo procesado: ${formatNumber(response.recordCount)} registros convertidos`
            );

            // Cleanup worker
            worker.terminate();
            workerRef.current = null;
            break;

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

      // Send file to worker
      worker.postMessage({ type: 'parse', buffer: arrayBuffer });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al leer el archivo';
      setError(message);
      setProcessing({ isProcessing: false, phase: 'idle', percent: 0 });
      toast.error(message);
    }
  };

  const handleDownloadCsv = () => {
    if (!parsedData?.csvBlob) return;

    const url = window.URL.createObjectURL(parsedData.csvBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = parsedData.filename.replace(/\.dbf$/i, '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Archivo CSV descargado');
  };

  const getPhaseLabel = () => {
    switch (processing.phase) {
      case 'parsing':
        return 'Leyendo archivo DBF...';
      case 'converting':
        return 'Convirtiendo a CSV...';
      case 'done':
        return 'Completado';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Convertir DBF a CSV
          </CardTitle>
          <CardDescription>
            Sube un archivo DBF (dBase) para convertirlo a formato CSV compatible
            con la importacion. Soporta archivos de hasta 100,000+ registros.
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
                    Formatos soportados: dBase III, IV, 5, Visual FoxPro (max
                    100MB)
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {processing.phase === 'done' && (
                    <Badge variant="outline" className="gap-1 text-green-600">
                      <Check className="h-3 w-3" />
                      Procesado
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
                <span className="text-muted-foreground">{getPhaseLabel()}</span>
                <span className="font-medium">{processing.percent}%</span>
              </div>
              <Progress value={processing.percent} className="h-2" />
            </div>
          )}

          {/* Action buttons */}
          {selectedFile && (
            <div className="flex justify-end gap-2">
              {processing.phase !== 'done' && (
                <Button
                  onClick={handleParse}
                  disabled={processing.isProcessing}
                >
                  {processing.isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Procesar archivo
                    </>
                  )}
                </Button>
              )}
              {processing.phase === 'done' && parsedData?.csvBlob && (
                <Button onClick={handleDownloadCsv}>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar CSV
                </Button>
              )}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm">
              <p className="font-medium">Error al procesar el archivo:</p>
              <p>{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Card */}
      {parsedData && parsedData.preview.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Vista previa
                </CardTitle>
                <CardDescription>
                  Mostrando {parsedData.preview.length} de{' '}
                  {formatNumber(parsedData.recordCount)} registros
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {parsedData.fields.length} columnas
                </Badge>
                <Badge variant="secondary">
                  {formatNumber(parsedData.recordCount)} filas
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full whitespace-nowrap rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">#</TableHead>
                    {parsedData.fields.map((field) => (
                      <TableHead key={field} className="min-w-[120px]">
                        {field}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.preview.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      {parsedData.fields.map((field) => (
                        <TableCell
                          key={field}
                          className="max-w-[200px] truncate"
                        >
                          {String(record[field] ?? '')}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {parsedData.recordCount > 10 && (
              <p className="text-sm text-muted-foreground mt-4 text-center">
                ... y {formatNumber(parsedData.recordCount - 10)} registros mas
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Instrucciones</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Sube un archivo DBF exportado desde tu sistema de inventario</li>
            <li>
              El archivo sera procesado localmente (no se sube a ningun servidor)
            </li>
            <li>
              Archivos grandes (10,000+ registros) se procesan en segundo plano
              sin bloquear la pantalla
            </li>
            <li>
              Revisa la vista previa para verificar que los datos se leen
              correctamente
            </li>
            <li>Descarga el archivo CSV resultante</li>
            <li>
              Usa el CSV descargado en la herramienta de importacion de productos
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
