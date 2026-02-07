import { useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { ImportProgress } from '../components/ImportProgress';

export function ImportDetailPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return null;
  }

  return (
    <PageContainer
      title="Detalle de Importacion"
      description="Revisa el progreso y estado de la importacion."
    >
      <ImportProgress jobId={id} />
    </PageContainer>
  );
}
