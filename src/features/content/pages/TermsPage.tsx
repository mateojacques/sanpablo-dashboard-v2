import { PageContainer } from '@/components/layout/PageContainer';
import { TermsEditor } from '../components/TermsEditor';

export function TermsPage() {
  return (
    <PageContainer
      title="Términos y Condiciones"
      description="Edita los términos y condiciones de la tienda."
    >
      <TermsEditor />
    </PageContainer>
  );
}
