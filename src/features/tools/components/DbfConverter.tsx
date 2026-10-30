import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
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
import { Label } from '@/components/ui/label';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, downloadBlob } from '@/lib/utils';
import { getDbfErrorMessage, type DbfCsvFormat } from '../api/imports.api';
import { useConvertDbfToCsv } from '../api/imports.queries';

type ConvertedCsv = {
  blob: Blob;
  rowCount: number;
  format: DbfCsvFormat;
  headers: string[];
  preview: string[][];
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

export function DbfConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [format, setFormat] = useState<DbfCsvFormat>('api');
  const [result, setResult] = useState<ConvertedCsv | null>(null);
  const [error, setError] = useState<string | null>(null);

  const convert = useConvertDbfToCsv();
  const isProcessing = convert.isPending;

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
      setResult(null);
      setError(null);
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
    disabled: isProcessing,
  });

  const handleClearFile = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
  };

  const handleFormatChange = (value: string) => {
    setFormat(value as DbfCsvFormat);
    // A result in the other format no longer matches the selection
    setResult(null);
  };

  const handleParse = async () => {
    if (!selectedFile) return;

    setError(null);
    setResult(null);

    try {
      const { blob, rowCount } = await convert.mutateAsync({ file: selectedFile, format });

      // Preview from the first ~64KB: row 0 is the header, then up to 10 rows
      const text = await blob.slice(0, 64 * 1024).text();
      const parsed = Papa.parse<string[]>(text, { preview: 11 });
      const [headers = [], ...preview] = parsed.data;

      setResult({ blob, rowCount, format, headers, preview });
      toast.success(`Archivo procesado: ${formatNumber(rowCount)} registros convertidos`);
    } catch (err) {
      const message = getDbfErrorMessage(err, 'Error al procesar el archivo');
      setError(message);
      toast.error(message);
    }
  };

  const handleDownloadCsv = () => {
    if (!selectedFile || !result) return;

    downloadBlob(
      result.blob,
      selectedFile.name.replace(
        /\.dbf$/i,
        result.format === 'raw' ? '-completo.csv' : '.csv'
      )
    );
    toast.success('Archivo CSV descargado');
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
                isProcessing && 'pointer-events-none opacity-50'
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
                  {result && (
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
                    disabled={isProcessing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Output format */}
          {selectedFile && (
            <div className="space-y-2">
              <Label htmlFor="dbf-format">Formato de salida</Label>
              <Select value={format} onValueChange={handleFormatChange} disabled={isProcessing}>
                <SelectTrigger id="dbf-format" className="w-full sm:w-80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="api">Formato de importación</SelectItem>
                  <SelectItem value="raw">Todas las columnas del DBF</SelectItem>
                </SelectContent>
              </Select>
              {format === 'raw' && (
                <p className="text-sm text-muted-foreground">
                  Útil para revisar si cambió la estructura del archivo
                </p>
              )}
            </div>
          )}

          {/* Action buttons */}
          {selectedFile && (
            <div className="flex justify-end gap-2">
              {!result && (
                <Button onClick={handleParse} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando en el servidor...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Procesar archivo
                    </>
                  )}
                </Button>
              )}
              {result && (
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
      {result && result.headers.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Vista previa
                </CardTitle>
                <CardDescription>
                  Mostrando {result.preview.length} de{' '}
                  {formatNumber(result.rowCount)} registros
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {result.headers.length} columnas
                </Badge>
                <Badge variant="secondary">
                  {formatNumber(result.rowCount)} filas
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
                    {result.headers.map((header, col) => (
                      <TableHead key={col} className="min-w-[120px]">
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.preview.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      {result.headers.map((_, col) => (
                        <TableCell
                          key={col}
                          className="max-w-[200px] truncate"
                        >
                          {row[col] ?? ''}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {result.rowCount > result.preview.length && (
              <p className="text-sm text-muted-foreground mt-4 text-center">
                ... y {formatNumber(result.rowCount - result.preview.length)} registros mas
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
              El archivo se procesa en el servidor con las mismas reglas que la importación
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
