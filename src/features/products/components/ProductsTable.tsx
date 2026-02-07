import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Pencil, Trash2, Eye, Power, PowerOff } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { formatPrice, truncate } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { useDeleteProduct, useToggleProductActive } from '../api/products.queries';
import type { Product } from '../types';

type ProductsTableProps = {
  products: Product[];
  isLoading?: boolean;
};

export function ProductsTable({ products, isLoading }: ProductsTableProps) {
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null,
  });

  const deleteProduct = useDeleteProduct();
  const toggleActive = useToggleProductActive();

  const handleDelete = async () => {
    if (!deleteDialog.product) return;

    try {
      await deleteProduct.mutateAsync(deleteDialog.product.id);
      toast.success('Producto eliminado correctamente');
      setDeleteDialog({ open: false, product: null });
    } catch {
      toast.error('Error al eliminar el producto');
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await toggleActive.mutateAsync({ id: product.id, isActive: !product.isActive });
      toast.success(
        product.isActive ? 'Producto desactivado' : 'Producto activado'
      );
    } catch {
      toast.error('Error al cambiar el estado del producto');
    }
  };

  if (isLoading) {
    return <ProductsTableSkeleton />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="No hay productos"
        description="No se encontraron productos con los filtros seleccionados."
        action={{
          label: 'Crear producto',
          onClick: () => navigate(ROUTES.PRODUCT_CREATE),
        }}
      />
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Imagen</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Precio</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                {/* Image */}
                <TableCell>
                  {product.thumbnailUrl || product.imageUrl ? (
                    <img
                      src={product.thumbnailUrl || product.imageUrl || ''}
                      alt={product.name}
                      className="h-12 w-12 rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                      Sin img
                    </div>
                  )}
                </TableCell>

                {/* SKU */}
                <TableCell className="font-mono text-sm">{product.sku}</TableCell>

                {/* Name */}
                <TableCell>
                  <div className="font-medium">{truncate(product.name, 40)}</div>
                  {product.description && (
                    <div className="text-sm text-muted-foreground">
                      {truncate(product.description, 50)}
                    </div>
                  )}
                </TableCell>

                {/* Category */}
                <TableCell>
                  {product.category ? (
                    <Badge variant="outline">{product.category.name}</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>

                {/* Price */}
                <TableCell className="text-right">
                  <div className="font-medium">{formatPrice(product.regularPrice)}</div>
                  {product.salePrice && (
                    <div className="text-sm text-green-600">
                      Oferta: {formatPrice(product.salePrice)}
                    </div>
                  )}
                </TableCell>

                {/* Status */}
                <TableCell className="text-center">
                  <Badge variant={product.isActive ? 'success' : 'secondary'}>
                    {product.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Acciones</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalle
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate(`/products/${product.id}/edit`)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleActive(product)}>
                        {product.isActive ? (
                          <>
                            <PowerOff className="mr-2 h-4 w-4" />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <Power className="mr-2 h-4 w-4" />
                            Activar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteDialog({ open: true, product })}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, product: open ? deleteDialog.product : null })}
        title="Eliminar producto"
        description={`¿Estás seguro de que deseas eliminar "${deleteDialog.product?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        isLoading={deleteProduct.isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}

function ProductsTableSkeleton() {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Imagen</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-12 w-12 rounded-md" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="mb-1 h-4 w-40" />
                <Skeleton className="h-3 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="ml-auto h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="mx-auto h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
