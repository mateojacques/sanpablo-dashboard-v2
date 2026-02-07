import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layout/PageContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BulkImageUpdater } from '../components/BulkImageUpdater';
import { ImportJobsTable } from '../components/ImportJobsTable';
import { useImportJobs, useCancelImportJob } from '../api/imports.queries';

export function BulkImagesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') ?? 'actualizar';

  const { data, isLoading } = useImportJobs({ limit: 20 });
  const cancelJob = useCancelImportJob();

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const handleUploadStarted = (jobId: string) => {
    // Navigate to the job detail page
    navigate(`/herramientas/importaciones/${jobId}`);
  };

  const handleCancelJob = async (id: string) => {
    try {
      await cancelJob.mutateAsync(id);
      toast.success('Actualizacion cancelada');
    } catch {
      toast.error('Error al cancelar la actualizacion');
    }
  };

  return (
    <PageContainer
      title="Actualización Masiva de Imágenes"
      description="Actualiza imágenes de productos masivamente desde un archivo JSON."
    >
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="actualizar">Nueva Actualización</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="actualizar" className="mt-6">
          <BulkImageUpdater onUploadStarted={handleUploadStarted} />
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
