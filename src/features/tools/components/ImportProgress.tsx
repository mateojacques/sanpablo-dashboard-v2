import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  Ban,
  FileSpreadsheet,
  ArrowLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useImportJob, useCancelImportJob } from '../api/imports.queries';
import type { ImportJobStatus } from '../types';

type ImportProgressProps = {
  jobId: string;
};

const statusConfig: Record<ImportJobStatus, {
  label: string;
  icon: React.ElementType;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
  description: string;
}> = {
  pending: {
    label: 'Pendiente',
    icon: Clock,
    variant: 'secondary',
    description: 'El trabajo esta en cola esperando ser procesado.',
  },
  processing: {
    label: 'Procesando',
    icon: Loader2,
    variant: 'default',
    className: 'animate-spin',
    description: 'El archivo esta siendo procesado.',
  },
  completed: {
    label: 'Completado',
    icon: CheckCircle2,
    variant: 'outline',
    className: 'text-green-600',
    description: 'La importacion ha finalizado exitosamente.',
  },
  failed: {
    label: 'Fallido',
    icon: XCircle,
    variant: 'destructive',
    description: 'La importacion fallo. Revisa los errores para mas detalles.',
  },
  cancelled: {
    label: 'Cancelado',
    icon: Ban,
    variant: 'secondary',
    description: 'La importacion fue cancelada.',
  },
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function ImportProgress({ jobId }: ImportProgressProps) {
  // Polling is handled automatically by the hook - stops when job completes
  const { data, isLoading, error } = useImportJob(jobId);
  const cancelJob = useCancelImportJob();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <XCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="font-medium text-lg">Error al cargar</h3>
          <p className="text-muted-foreground text-sm mt-1">
            No se pudo obtener la informacion del trabajo de importacion.
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/herramientas/importaciones">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a importaciones
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const job = data.data;
  const status = statusConfig[job.status];
  const StatusIcon = status.icon;
  const progress = job.totalRows > 0
    ? Math.round((job.processedRows / job.totalRows) * 100)
    : 0;
  const canCancel = job.status === 'pending' || job.status === 'processing';

  const handleCancel = async () => {
    try {
      await cancelJob.mutateAsync(job.id);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild>
        <Link to="/herramientas/importaciones">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a importaciones
        </Link>
      </Button>

      {/* Main card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileSpreadsheet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>{job.filename}</CardTitle>
                <CardDescription>
                  {formatFileSize(job.fileSize)} - Creado{' '}
                  {formatDistanceToNow(new Date(job.createdAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </CardDescription>
              </div>
            </div>
            <Badge variant={status.variant} className="gap-1">
              <StatusIcon className={cn('h-3 w-3', status.className)} />
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status description */}
          <p className="text-muted-foreground">{status.description}</p>

          {/* Progress bar (for processing) */}
          {(job.status === 'processing' || job.status === 'completed') && job.totalRows > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progreso</span>
                <span className="font-mono">
                  {job.processedRows} / {job.totalRows} filas ({progress}%)
                </span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">{job.totalRows}</p>
              <p className="text-sm text-muted-foreground">Total filas</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">{job.processedRows}</p>
              <p className="text-sm text-muted-foreground">Procesadas</p>
            </div>
            <div className="bg-green-500/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{job.successRows}</p>
              <p className="text-sm text-muted-foreground">Exitosas</p>
            </div>
            <div className="bg-destructive/10 rounded-lg p-4 text-center">
              <p className={cn(
                'text-2xl font-bold',
                job.errorRows > 0 ? 'text-destructive' : 'text-muted-foreground'
              )}>
                {job.errorRows}
              </p>
              <p className="text-sm text-muted-foreground">Errores</p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {job.startedAt && (
              <div>
                <span className="text-muted-foreground">Iniciado:</span>{' '}
                <span>{new Date(job.startedAt).toLocaleString('es')}</span>
              </div>
            )}
            {job.completedAt && (
              <div>
                <span className="text-muted-foreground">Finalizado:</span>{' '}
                <span>{new Date(job.completedAt).toLocaleString('es')}</span>
              </div>
            )}
          </div>

          {/* Cancel button */}
          {canCancel && (
            <div className="flex justify-end pt-4 border-t">
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={cancelJob.isPending}
              >
                {cancelJob.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  <>
                    <Ban className="mr-2 h-4 w-4" />
                    Cancelar importacion
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
