import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { OneClickImporter } from '../components/OneClickImporter';
import { ImportProgress } from '../components/ImportProgress';

export function OneClickImportPage() {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  return (
    <PageContainer
      title="Importacion en 1 Click"
      description="Importa productos desde un archivo DBF automaticamente."
    >
      <div className="space-y-6">
        {!activeJobId ? (
          <OneClickImporter onImportStarted={setActiveJobId} />
        ) : (
          <div className="space-y-4">
            <ImportProgress jobId={activeJobId} />
            <div className="flex justify-center">
              <button
                onClick={() => setActiveJobId(null)}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                Realizar otra importacion
              </button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
