import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/common/Pagination';
import { ProductsTable } from '../components/ProductsTable';
import { ProductFilters } from '../components/ProductFilters';
import { useProducts } from '../api/products.queries';
import { PAGINATION, ROUTES } from '@/lib/constants';
import type { ProductsListParams } from '../types';

export function ProductsListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL
  const filters: ProductsListParams = {
    page: parseInt(searchParams.get('page') ?? '1', 10),
    limit: parseInt(searchParams.get('limit') ?? String(PAGINATION.DEFAULT_LIMIT), 10),
    search: searchParams.get('search') ?? undefined,
    categoryId: searchParams.get('categoryId') ?? undefined,
    isActive:
      searchParams.get('isActive') === null
        ? undefined
        : searchParams.get('isActive') === 'true',
    sortBy: (searchParams.get('sortBy') as ProductsListParams['sortBy']) ?? undefined,
    sortOrder: (searchParams.get('sortOrder') as ProductsListParams['sortOrder']) ?? undefined,
  };

  const { data, isLoading } = useProducts(filters);

  // Update URL params when filters change
  const handleFiltersChange = (newFilters: ProductsListParams) => {
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
    if (newFilters.categoryId) {
      params.set('categoryId', newFilters.categoryId);
    }
    if (newFilters.isActive !== undefined) {
      params.set('isActive', String(newFilters.isActive));
    }
    if (newFilters.sortBy) {
      params.set('sortBy', newFilters.sortBy);
    }
    if (newFilters.sortOrder) {
      params.set('sortOrder', newFilters.sortOrder);
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
      title="Productos"
      description="Gestiona el catálogo de productos de la tienda"
      action={
        <Button onClick={() => navigate(ROUTES.PRODUCT_CREATE)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo producto
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <ProductFilters filters={filters} onFiltersChange={handleFiltersChange} />

        {/* Products table */}
        <ProductsTable products={data?.data ?? []} isLoading={isLoading} />

        {/* Pagination */}
        {data && data.totalPages > 0 && (
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalItems={data.total}
            limit={data.limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        )}
      </div>
    </PageContainer>
  );
}
