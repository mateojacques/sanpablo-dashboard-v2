import { PageContainer } from '@/components/layout/PageContainer';
import { FaqEditor } from '../components/FaqEditor';

export function FaqPage() {
  return (
    <PageContainer
      title="Preguntas Frecuentes"
      description="Gestiona las preguntas frecuentes que se muestran en la tienda."
    >
      <FaqEditor />
    </PageContainer>
  );
}
