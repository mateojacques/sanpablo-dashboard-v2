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
import type { OrdersListParams } from '../types';
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '../types';

type OrderFiltersProps = {
  filters: OrdersListParams;
  onFiltersChange: (filters: OrdersListParams) => void;
};

export function OrderFilters({ filters, onFiltersChange }: OrderFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  const debouncedSearch = useDebounce(searchInput, 300);
  const isFirstRender = useRef(true);

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

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' ? undefined : (value as OrdersListParams['status']),
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

  const hasActiveFilters = filters.search || filters.status;

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por numero de orden, cliente o email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status filter */}
        <Select
          value={filters.status ?? 'all'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {ORDER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {ORDER_STATUS_LABELS[status]}
              </SelectItem>
            ))}
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
              Busqueda: "{filters.search}"
            </span>
          )}
          {filters.status && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
              Estado: {ORDER_STATUS_LABELS[filters.status]}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
