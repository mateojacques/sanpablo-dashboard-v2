import { useState, useMemo } from 'react';
import { Search, Plus, Package, Check, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useProducts } from '@/features/products/api/products.queries';
import { useDebounce } from '@/hooks/useDebounce';
import { formatPrice, cn } from '@/lib/utils';
import type { Product } from '@/features/products/types';

type ProductSelectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excludeProductIds?: string[];
  maxProducts?: number;
  currentCount?: number;
  onAdd: (productIds: string[]) => void;
  isLoading?: boolean;
};

export function ProductSelector({
  open,
  onOpenChange,
  excludeProductIds = [],
  maxProducts = 50,
  currentCount = 0,
  onAdd,
  isLoading = false,
}: ProductSelectorProps) {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading: isLoadingProducts } = useProducts({
    search: debouncedSearch || undefined,
    isActive: true,
    limit: 50,
  });

  // Filter out already added products
  const availableProducts = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter((p) => !excludeProductIds.includes(p.id));
  }, [data?.data, excludeProductIds]);

  // Calculate how many more can be added
  const remainingSlots = maxProducts - currentCount;
  const canAddMore = remainingSlots > 0;

  const toggleProduct = (productId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else if (next.size < remainingSlots) {
        next.add(productId);
      }
      return next;
    });
  };

  const handleAdd = () => {
    if (selectedIds.size > 0) {
      onAdd(Array.from(selectedIds));
      setSelectedIds(new Set());
      setSearch('');
    }
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    setSearch('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Agregar productos</DialogTitle>
          <DialogDescription>
            Selecciona los productos que deseas agregar al carrusel.
            {remainingSlots < maxProducts && (
              <span className="ml-1">
                Puedes agregar hasta <strong>{remainingSlots}</strong> productos más.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Selected count */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Badge>{selectedIds.size} seleccionados</Badge>
            <button
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setSelectedIds(new Set())}
            >
              Limpiar selección
            </button>
          </div>
        )}

        {/* Products list */}
        <ScrollArea className="flex-1 -mx-6 px-6 min-h-[300px]">
          {isLoadingProducts ? (
            <ProductSelectorSkeleton />
          ) : availableProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium">No hay productos disponibles</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {search
                  ? 'No se encontraron productos con esa búsqueda.'
                  : 'Todos los productos ya están en el carrusel.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {availableProducts.map((product) => (
                <ProductItem
                  key={product.id}
                  product={product}
                  isSelected={selectedIds.has(product.id)}
                  isDisabled={!canAddMore && !selectedIds.has(product.id)}
                  onToggle={() => toggleProduct(product.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selectedIds.size === 0 || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Agregando...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Agregar {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type ProductItemProps = {
  product: Product;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: () => void;
};

function ProductItem({
  product,
  isSelected,
  isDisabled,
  onToggle,
}: ProductItemProps) {
  const hasDiscount =
    product.salePrice &&
    parseFloat(product.salePrice) < parseFloat(product.regularPrice);

  return (
    <button
      onClick={onToggle}
      disabled={isDisabled}
      className={cn(
        'w-full flex items-center gap-4 p-3 rounded-lg border transition-colors text-left',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:bg-muted/50',
        isDisabled && !isSelected && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* Checkbox indicator */}
      <div
        className={cn(
          'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
          isSelected
            ? 'bg-primary border-primary text-primary-foreground'
            : 'border-muted-foreground/50'
        )}
      >
        {isSelected && <Check className="h-3 w-3" />}
      </div>

      {/* Product image */}
      <div className="w-12 h-12 rounded border overflow-hidden bg-muted shrink-0">
        {product.thumbnailUrl || product.imageUrl ? (
          <img
            src={product.thumbnailUrl || product.imageUrl!}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-5 w-5 text-muted-foreground/50" />
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{product.name}</div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-mono">{product.sku}</span>
          {product.category && (
            <>
              <span className="text-muted-foreground/50">|</span>
              <span className="truncate">{product.category.name}</span>
            </>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="text-right shrink-0">
        {hasDiscount ? (
          <>
            <div className="font-medium text-green-600">
              {formatPrice(product.salePrice!)}
            </div>
            <div className="text-xs text-muted-foreground line-through">
              {formatPrice(product.regularPrice)}
            </div>
          </>
        ) : (
          <div className="font-medium">{formatPrice(product.regularPrice)}</div>
        )}
      </div>
    </button>
  );
}

function ProductSelectorSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="w-12 h-12 rounded" />
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2 mt-2" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
