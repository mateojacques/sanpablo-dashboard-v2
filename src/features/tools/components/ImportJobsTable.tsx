import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  Ban,
  FileSpreadsheet,
  Eye,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { ImportJob, ImportJobStatus } from '../types';

type ImportJobsTableProps = {
  jobs: ImportJob[];
  isLoading?: boolean;
  onCancelJob?: (id: string) => void;
  isCancelling?: boolean;
};

const statusConfig: Record<ImportJobStatus, {
  label: string;
  icon: React.ElementType;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}> = {
  pending: {
    label: 'Pendiente',
    icon: Clock,
    variant: 'secondary',
  },
  processing: {
    label: 'Procesando',
    icon: Loader2,
    variant: 'default',
    className: 'animate-spin',
  },
  completed: {
    label: 'Completado',
    icon: CheckCircle2,
    variant: 'outline',
    className: 'text-green-600',
  },
  failed: {
    label: 'Fallido',
    icon: XCircle,
    variant: 'destructive',
  },
  cancelled: {
    label: 'Cancelado',
    icon: Ban,
    variant: 'secondary',
  },
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function ImportJobsTable({
  jobs,
  isLoading,
  onCancelJob,
  isCancelling,
}: ImportJobsTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
        <FileSpreadsheet className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="font-medium text-lg">Sin importaciones</h3>
        <p className="text-muted-foreground text-sm mt-1">
          No hay trabajos de importacion registrados.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Archivo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Progreso</TableHead>
            <TableHead className="text-right">Exitosos</TableHead>
            <TableHead className="text-right">Errores</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => {
            const status = statusConfig[job.status];
            const StatusIcon = status.icon;
            const progress = job.totalRows > 0
              ? Math.round((job.processedRows / job.totalRows) * 100)
              : 0;
            const canCancel = job.status === 'pending' || job.status === 'processing';

            return (
              <TableRow key={job.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium truncate max-w-[200px]">
                      {job.filename}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(job.fileSize)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant} className="gap-1">
                    <StatusIcon className={cn('h-3 w-3', status.className)} />
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {job.status === 'processing' ? (
                    <span className="font-mono text-sm">
                      {job.processedRows}/{job.totalRows} ({progress}%)
                    </span>
                  ) : job.status === 'completed' || job.status === 'failed' ? (
                    <span className="font-mono text-sm">
                      {job.totalRows} filas
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-mono text-sm text-green-600">
                    {job.successRows}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className={cn(
                    'font-mono text-sm',
                    job.errorRows > 0 && 'text-destructive'
                  )}>
                    {job.errorRows}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(job.createdAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      title="Ver detalles"
                    >
                      <Link to={`/herramientas/importaciones/${job.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    {canCancel && onCancelJob && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onCancelJob(job.id)}
                        disabled={isCancelling}
                        title="Cancelar"
                        className="text-destructive hover:text-destructive"
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
