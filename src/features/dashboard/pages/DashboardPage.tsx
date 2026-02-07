import { useState } from 'react';
import { Package, FolderTree, Images, FileUp, ShoppingCart, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useMetricsOverview } from '../api/metrics.queries';
import { MetricCard } from '../components/MetricCard';
import { DateRangeFilter } from '../components/DateRangeFilter';
import type { MetricsParams } from '../types';

const quickLinks = [
  {
    title: 'Productos',
    description: 'Gestionar catalogo de productos',
    href: '/products',
    icon: Package,
  },
  {
    title: 'Categorias',
    description: 'Organizar categorias',
    href: '/categories',
    icon: FolderTree,
  },
  {
    title: 'Carruseles',
    description: 'Configurar carruseles destacados',
    href: '/carousels',
    icon: Images,
  },
  {
    title: 'Importar CSV',
    description: 'Importacion masiva de productos',
    href: '/tools/import-csv',
    icon: FileUp,
  },
];

function formatDate(dateString: string | null): string {
  if (!dateString) return 'Nunca';

  const date = new Date(dateString);
  return date.toLocaleDateString('es-PY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatNumber(num: number): string {
  return num.toLocaleString('es-PY');
}

export function DashboardPage() {
  const { user } = useAuth();
  const [metricsParams, setMetricsParams] = useState<MetricsParams>({});

  const { data: metricsData, isLoading, isError, error } = useMetricsOverview(metricsParams);

  const metrics = metricsData?.data;

  const hasDateFilter = metricsParams.startDate || metricsParams.endDate;

  return (
    <PageContainer
      title={`Bienvenido, ${user?.fullName?.split(' ')[0] ?? 'Usuario'}`}
      description="Panel de administracion de San Pablo"
    >
      <div className="space-y-6">
        {/* Date range filter */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Metricas</h2>
          <DateRangeFilter onChange={setMetricsParams} isLoading={isLoading} />
        </div>

        {/* Error state */}
        {isError && (
          <Alert variant="destructive">
            <AlertDescription>
              Error al cargar las metricas: {error instanceof Error ? error.message : 'Error desconocido'}
            </AlertDescription>
          </Alert>
        )}

        {/* Metrics cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Productos"
            value={metrics ? formatNumber(metrics.totalProducts) : '--'}
            subtitle={hasDateFilter ? 'creados en el periodo' : 'productos en catalogo'}
            icon={Package}
            isLoading={isLoading}
          />
          <MetricCard
            title="Categorias"
            value={metrics ? formatNumber(metrics.totalCategories) : '--'}
            subtitle={hasDateFilter ? 'creadas en el periodo' : 'categorias activas'}
            icon={FolderTree}
            isLoading={isLoading}
          />
          <MetricCard
            title="Ordenes"
            value={metrics ? formatNumber(metrics.totalOrders) : '--'}
            subtitle={hasDateFilter ? 'ordenes en el periodo' : 'ordenes totales'}
            icon={ShoppingCart}
            isLoading={isLoading}
          />
          <MetricCard
            title="Ultima Importacion"
            value={metrics?.lastSuccessfulImportAt ? formatDate(metrics.lastSuccessfulImportAt).split(',')[0] : '--'}
            subtitle={metrics?.lastSuccessfulImportAt ? formatDate(metrics.lastSuccessfulImportAt).split(',')[1]?.trim() || 'importacion exitosa' : 'sin importaciones'}
            icon={Clock}
            isLoading={isLoading}
          />
        </div>

        {/* Quick links */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Accesos Rapidos</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <Card className="transition-colors hover:bg-accent">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <link.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{link.title}</CardTitle>
                        <CardDescription className="text-xs">
                          {link.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
