import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { OneClickImporter } from '../components/OneClickImporter';
import { ImportProgress } from '../components/ImportProgress';
import { setOneClickDebugCsv, clearOneClickDebugCsv } from '../stores/oneClickImportDebug.store';

export function OneClickImportPage() {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [pendingCsv, setPendingCsv] = useState<{ blob: Blob; filename: string; recordCount: number } | null>(null);

  const handleImportStarted = (jobId: string) => {
    setActiveJobId(jobId);

    if (pendingCsv) {
      setOneClickDebugCsv(jobId, pendingCsv);
      setPendingCsv(null);
    }
  };

  const handleReset = () => {
    if (activeJobId) {
      clearOneClickDebugCsv(activeJobId);
    }
    setActiveJobId(null);
    setPendingCsv(null);
  };

  return (
    <PageContainer
      title="Importacion en 1 Click"
      description="Importa productos desde un archivo DBF automaticamente."
    >
      <div className="space-y-6">
        {!activeJobId ? (
          <OneClickImporter
            onImportStarted={handleImportStarted}
            onCsvGenerated={(csv) => setPendingCsv(csv)}
          />
        ) : (
          <div className="space-y-4">
            <ImportProgress jobId={activeJobId} />
            <div className="flex justify-center">
              <button
                onClick={handleReset}
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
