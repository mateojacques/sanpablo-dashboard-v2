import { useState } from 'react';
import { Download, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { downloadBlob } from '@/lib/utils';
import { importsApi } from '../api/imports.api';
import { useImportJob } from '../api/imports.queries';

type OneClickImportDebugPanelProps = {
  jobId: string;
};

export function OneClickImportDebugPanel({ jobId }: OneClickImportDebugPanelProps) {
  const [file, setFile] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<'preview' | 'download' | null>(null);
  const { data } = useImportJob(jobId);

  // Fetch the stored file once, on first use
  const getFile = async () => {
    if (file) return file;
    const blob = await importsApi.getFile(jobId);
    setFile(blob);
    return blob;
  };

  const handleDownload = async () => {
    setLoading('download');
    try {
      const blob = await getFile();
      downloadBlob(blob, data?.data.filename ?? `importacion-${jobId}.csv`);
    } catch {
      toast.error('No se pudo descargar el archivo importado');
    } finally {
      setLoading(null);
    }
  };

  const handlePreview = async () => {
    setLoading('preview');
    try {
      const blob = await getFile();
      // Read only the first ~64KB
      setPreview(await blob.slice(0, 64 * 1024).text());
    } catch {
      toast.error('No se pudo cargar la vista previa');
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Archivo importado</CardTitle>
        <CardDescription>
          Descargá o revisá el CSV que el servidor generó y procesó.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handlePreview} disabled={!!loading}>
            {loading === 'preview' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Eye className="mr-2 h-4 w-4" />
            )}
            Ver preview
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} disabled={!!loading}>
            {loading === 'download' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Descargar CSV
          </Button>
        </div>

        {preview && (
          <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap">
{preview}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}
