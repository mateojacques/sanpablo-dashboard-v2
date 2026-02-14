import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileJson, X, Loader2, ImageIcon, FolderUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useUploadBulkImages } from '../api/imports.queries';
import defaultImagesJson from '@/product-images/enero-2026.json';

type BulkImageUpdaterProps = {
  onUploadStarted?: (jobId: string) => void;
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function jsonToFile(data: unknown, filename: string): File {
  const jsonString = JSON.stringify(data);
  const blob = new Blob([jsonString], { type: 'application/json' });
  return new File([blob], filename, { type: 'application/json' });
}

export function BulkImageUpdater({ onUploadStarted }: BulkImageUpdaterProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCustomUpload, setShowCustomUpload] = useState(false);
  const uploadBulkImages = useUploadBulkImages();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        toast.error('Solo se permiten archivos JSON');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error('El archivo no puede superar los 50MB');
        return;
      }
      setSelectedFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
    },
    maxFiles: 1,
    disabled: uploadBulkImages.isPending,
  });

  const handleClearFile = () => {
    setSelectedFile(null);
  };

  const handleUploadDefault = async () => {
    try {
      const file = jsonToFile(defaultImagesJson, 'enero-2026.json');
      const result = await uploadBulkImages.mutateAsync(file);
      toast.success('Actualización de imágenes iniciada correctamente');
      onUploadStarted?.(result.data.id);
    } catch (error) {
      toast.error('Error al iniciar la actualización de imágenes');
      console.error('Bulk image upload error:', error);
    }
  };

  const handleUploadCustom = async () => {
    if (!selectedFile) return;

    try {
      const result = await uploadBulkImages.mutateAsync(selectedFile);
      toast.success('Actualización de imágenes iniciada correctamente');
      setSelectedFile(null);
      setShowCustomUpload(false);
      onUploadStarted?.(result.data.id);
    } catch (error) {
      toast.error('Error al iniciar la actualización de imágenes');
      console.error('Bulk image upload error:', error);
    }
  };

  const handleToggleCustomUpload = () => {
    setShowCustomUpload((prev) => !prev);
    setSelectedFile(null);
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Actualizar Imágenes Masivamente
          </CardTitle>
          <CardDescription>
            Actualiza las imágenes de los productos usando el archivo predeterminado del repositorio
            o sube tu propio archivo JSON.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm mt-2"><span className='text-red-600'>IMPORTANTE: </span> Para que la carga de imágenes funcione correctamente, el SKU de los productos cargados debe coincidir con el SKU del producto en Papelera Bariloche.</p>
        {/* Default file upload */}
        <div className="border rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ImageIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">Archivo predeterminado</p>
              <p className="text-sm text-muted-foreground">
                enero-2026.json —{' '}
                {new Intl.NumberFormat().format((defaultImagesJson as any).length)} productos
              </p>
            </div>
          </div>
          <Button
            onClick={handleUploadDefault}
            disabled={uploadBulkImages.isPending}
            className="w-full"
          >
            {uploadBulkImages.isPending && !showCustomUpload ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Actualizar imágenes desde archivo predeterminado
              </>
            )}
          </Button>

          {uploadBulkImages.isPending && !showCustomUpload && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subiendo archivo...</span>
              </div>
              <Progress value={undefined} className="h-2" />
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">o</span>
          </div>
        </div>

        {/* Toggle custom upload */}
        <Button
          variant="outline"
          onClick={handleToggleCustomUpload}
          disabled={uploadBulkImages.isPending}
          className="w-full"
        >
          <FolderUp className="mr-2 h-4 w-4" />
          {showCustomUpload ? 'Cancelar carga personalizada' : 'Subir archivo JSON personalizado'}
        </Button>

        {/* Custom file upload (collapsible) */}
        {showCustomUpload && (
          <div className="space-y-4 animate-in fade-in-0 slide-in-from-top-2 duration-200">
            {/* Dropzone */}
            {!selectedFile ? (
              <div
                {...getRootProps()}
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50',
                  uploadBulkImages.isPending && 'pointer-events-none opacity-50'
                )}
              >
                <input {...getInputProps()} />
                <FileJson className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                {isDragActive ? (
                  <p className="text-primary font-medium">Suelta el archivo aquí...</p>
                ) : (
                  <>
                    <p className="font-medium">
                      Arrastra un archivo JSON aquí o haz clic para seleccionar
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Máximo 50MB</p>
                  </>
                )}
              </div>
            ) : (
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileJson className="h-6 w-6 text-primary" />
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
                    disabled={uploadBulkImages.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {uploadBulkImages.isPending && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Subiendo archivo...</span>
                    </div>
                    <Progress value={undefined} className="h-2" />
                  </div>
                )}
              </div>
            )}

            {/* Upload custom file button */}
            {selectedFile && (
              <div className="flex justify-end">
                <Button onClick={handleUploadCustom} disabled={uploadBulkImages.isPending}>
                  {uploadBulkImages.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Iniciar actualización
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
              <p className="font-medium">Formato del archivo JSON:</p>
              <div className="bg-background rounded p-3 font-mono text-xs overflow-x-auto">
                <pre>{`[
  {
    "sku": "024271",
    "image_urls": [
      "https://ejemplo.com/imagen.jpg"
    ]
  },
  {
    "sku": "125671",
    "image_urls": [
      "https://ejemplo.com/otra-imagen.jpg"
    ]
  }
]`}</pre>
              </div>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-3">
                <li>El campo SKU es obligatorio y se usa para encontrar el producto</li>
                <li>El campo image_urls debe ser un array con al menos una URL válida</li>
                <li>Los SKUs que no coincidan con productos existentes se ignorarán</li>
                <li>Se actualizará la imagen del producto con la primera URL del array</li>
                <li>Los productos existentes se actualizarán según el SKU coincidente</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
