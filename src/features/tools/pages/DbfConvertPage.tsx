import { PageContainer } from '@/components/layout/PageContainer';
import { DbfConverter } from '../components/DbfConverter';

export function DbfConvertPage() {
  return (
    <PageContainer
      title="Convertir DBF a CSV"
      description="Convierte archivos DBF de tu sistema de inventario a formato CSV para importar."
    >
      <DbfConverter />
    </PageContainer>
  );
}
