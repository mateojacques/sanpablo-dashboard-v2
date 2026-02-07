import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layout/PageContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CsvImporter } from '../components/CsvImporter';
import { ImportJobsTable } from '../components/ImportJobsTable';
import { useImportJobs, useCancelImportJob } from '../api/imports.queries';

export function CsvImportPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') ?? 'importar';

  const { data, isLoading } = useImportJobs({ limit: 20 });
  const cancelJob = useCancelImportJob();

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const handleImportStarted = (jobId: string) => {
    // Navigate to the job detail page
    navigate(`/herramientas/importaciones/${jobId}`);
  };

  const handleCancelJob = async (id: string) => {
    try {
      await cancelJob.mutateAsync(id);
      toast.success('Importacion cancelada');
    } catch {
      toast.error('Error al cancelar la importacion');
    }
  };

  return (
    <PageContainer
      title="Importacion de Productos"
      description="Importa productos masivamente desde archivos CSV."
    >
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="importar">Nueva Importacion</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="importar" className="mt-6">
          <CsvImporter onImportStarted={handleImportStarted} />
        </TabsContent>

        <TabsContent value="historial" className="mt-6">
          <ImportJobsTable
            jobs={data?.data.items ?? []}
            isLoading={isLoading}
            onCancelJob={handleCancelJob}
            isCancelling={cancelJob.isPending}
          />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
