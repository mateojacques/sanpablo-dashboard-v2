import { useState, useEffect, useRef } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';
import { useCategories } from '@/features/categories/api/categories.queries';
import { flattenCategoryTree } from '@/features/categories/types';
import type { ProductsListParams } from '../types';

type ProductFiltersProps = {
  filters: ProductsListParams;
  onFiltersChange: (filters: ProductsListParams) => void;
};

export function ProductFilters({ filters, onFiltersChange }: ProductFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  const debouncedSearch = useDebounce(searchInput, 300);
  const { data: categoriesData } = useCategories();
  const isFirstRender = useRef(true);

  // Flatten categories for dropdown
  const flatCategories = categoriesData?.data
    ? flattenCategoryTree(categoriesData.data)
    : [];

  // Update filters when debounced search changes
  useEffect(() => {
    // Skip on first render to avoid unnecessary filter update
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onFiltersChange({ ...filters, search: debouncedSearch || undefined, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleCategoryChange = (value: string) => {
    onFiltersChange({
      ...filters,
      categoryId: value === 'all' ? undefined : value,
      page: 1,
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      isActive: value === 'all' ? undefined : value === 'active',
      page: 1,
    });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    onFiltersChange({
      page: 1,
      limit: filters.limit,
    });
  };

  const hasActiveFilters = filters.search || filters.categoryId || filters.isActive !== undefined;

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre o SKU..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category filter */}
        <Select value={filters.categoryId ?? 'all'} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {flatCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {'  '.repeat(category.level)}
                {category.level > 0 ? '└ ' : ''}
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status filter */}
        <Select
          value={filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filtros activos:</span>
          {filters.search && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
              Búsqueda: "{filters.search}"
            </span>
          )}
          {filters.categoryId && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
              Categoría: {flatCategories.find((c) => c.id === filters.categoryId)?.name}
            </span>
          )}
          {filters.isActive !== undefined && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
              {filters.isActive ? 'Activos' : 'Inactivos'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
