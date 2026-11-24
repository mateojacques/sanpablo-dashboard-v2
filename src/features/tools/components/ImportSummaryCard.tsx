import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useImportJob } from '../api/imports.queries';

type Stat = { label: string; value: number };

function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{stat.value.toLocaleString('es-AR')}</p>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

// What the job changed, and the catalogue evaluation that ran after it
export function ImportSummaryCard({ jobId }: { jobId: string }) {
  const { data } = useImportJob(jobId);
  const job = data?.data;
  const summary = job?.summary;
  if (!job || !summary) return null;

  const isImageBank = job.type === 'image_bank';
  const changes: Stat[] = [
    { label: isImageBank ? 'Códigos nuevos' : 'Nuevos', value: summary.created },
    { label: isImageBank ? 'Códigos actualizados' : 'Actualizados', value: summary.updated },
  ];
  if (summary.images) {
    changes.push(
      { label: 'Fotos copiadas', value: summary.images.stored },
      { label: 'Fotos con error', value: summary.images.failed }
    );
  } else {
    changes.push({ label: 'Cambios de precio', value: summary.priceChanged });
  }
  if (summary.missingFromSource !== undefined) {
    changes.push({ label: 'Ya no están en la tabla', value: summary.missingFromSource });
  }

  const evaluation = summary.evaluation;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen</CardTitle>
        <CardDescription>
          Cambios de esta importación y estado del catálogo después de evaluarlo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <StatGrid stats={changes} />
        {evaluation && (
          <StatGrid
            stats={[
              { label: 'Publicados', value: evaluation.published },
              { label: 'Pendientes', value: evaluation.pending },
              { label: 'Nuevos publicados', value: evaluation.newlyPublished },
              { label: 'Pasaron a pendientes', value: evaluation.newlyPending },
            ]}
          />
        )}
      </CardContent>
    </Card>
  );
}
