import { useSearchParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Pagination } from '@/components/common/Pagination';
import { OrdersTable } from '../components/OrdersTable';
import { OrderFilters } from '../components/OrderFilters';
import { useOrders } from '../api/orders.queries';
import { PAGINATION } from '@/lib/constants';
import type { OrdersListParams, OrderStatus } from '../types';

export function OrdersListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL
  const filters: OrdersListParams = {
    page: parseInt(searchParams.get('page') ?? '1', 10),
    limit: parseInt(searchParams.get('limit') ?? String(PAGINATION.DEFAULT_LIMIT), 10),
    search: searchParams.get('search') ?? undefined,
    status: (searchParams.get('status') as OrderStatus) ?? undefined,
  };

  const { data, isLoading } = useOrders(filters);

  // Update URL params when filters change
  const handleFiltersChange = (newFilters: OrdersListParams) => {
    const params = new URLSearchParams();

    if (newFilters.page && newFilters.page > 1) {
      params.set('page', String(newFilters.page));
    }
    if (newFilters.limit && newFilters.limit !== PAGINATION.DEFAULT_LIMIT) {
      params.set('limit', String(newFilters.limit));
    }
    if (newFilters.search) {
      params.set('search', newFilters.search);
    }
    if (newFilters.status) {
      params.set('status', newFilters.status);
    }

    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    handleFiltersChange({ ...filters, page });
  };

  const handleLimitChange = (limit: number) => {
    handleFiltersChange({ ...filters, limit, page: 1 });
  };

  return (
    <PageContainer
      title="Ordenes"
      description="Gestiona todas las ordenes de la tienda"
    >
      <div className="space-y-6">
        {/* Filters */}
        <OrderFilters filters={filters} onFiltersChange={handleFiltersChange} />

        {/* Orders table */}
        <OrdersTable orders={data?.data ?? []} isLoading={isLoading} />

        {/* Pagination */}
        {data && data.meta.totalPages > 0 && (
          <Pagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            totalItems={data.meta.total}
            limit={data.meta.limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        )}
      </div>
    </PageContainer>
  );
}
