import { useState } from 'react';
import { Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getOneClickDebugCsv } from '../stores/oneClickImportDebug.store';

type OneClickImportDebugPanelProps = {
  jobId: string;
};

export function OneClickImportDebugPanel({ jobId }: OneClickImportDebugPanelProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const debug = getOneClickDebugCsv(jobId);

  if (!debug) return null;

  const handleDownload = () => {
    const url = window.URL.createObjectURL(debug.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = debug.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handlePreview = async () => {
    // Read only the first ~64KB
    const text = await debug.blob.slice(0, 64 * 1024).text();
    setPreview(text);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debug CSV generado</CardTitle>
        <CardDescription>
          Descarga o revisa el CSV exacto que se envio a la importacion.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" />
            Ver preview
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
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
