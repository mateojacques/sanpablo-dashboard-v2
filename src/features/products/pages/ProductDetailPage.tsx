import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { useProduct, useDeleteProduct } from '../api/products.queries';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

export function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useProduct(id!);
  const deleteProduct = useDeleteProduct();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteProduct.mutateAsync(id);
      toast.success('Producto eliminado correctamente');
      navigate(ROUTES.PRODUCTS);
    } catch {
      toast.error('Error al eliminar el producto');
    }
  };

  if (isLoading) {
    return (
      <PageContainer title="Detalle del producto">
        <ProductDetailSkeleton />
      </PageContainer>
    );
  }

  if (error || !data?.data) {
    return (
      <PageContainer title="Detalle del producto">
        <EmptyState
          title="Producto no encontrado"
          description="El producto que buscas no existe o fue eliminado."
          action={{
            label: 'Volver a productos',
            onClick: () => navigate(ROUTES.PRODUCTS),
          }}
        />
      </PageContainer>
    );
  }

  const product = data.data;

  return (
    <PageContainer
      title={product.name}
      description={`SKU: ${product.sku}`}
      action={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(ROUTES.PRODUCTS)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <Button variant="outline" onClick={() => navigate(`/products/${id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Información general
                <Badge variant={product.isActive ? 'success' : 'secondary'}>
                  {product.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">SKU</dt>
                  <dd className="mt-1 font-mono">{product.sku}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Categoría</dt>
                  <dd className="mt-1">
                    {product.category ? (
                      <Badge variant="outline">{product.category.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">Sin categoría</span>
                    )}
                  </dd>
                </div>
              </div>

              {product.description && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Descripción</dt>
                  <dd className="mt-1 whitespace-pre-wrap">{product.description}</dd>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Precios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Precio regular</dt>
                  <dd className="mt-1 text-2xl font-bold">{formatPrice(product.regularPrice)}</dd>
                </div>
                {product.salePrice && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Precio de oferta</dt>
                    <dd className="mt-1 text-2xl font-bold text-green-600">
                      {formatPrice(product.salePrice)}
                    </dd>
                  </div>
                )}
                {product.specialPrice && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Precio especial</dt>
                    <dd className="mt-1 text-2xl font-bold text-blue-600">
                      {formatPrice(product.specialPrice)}
                    </dd>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dimensions */}
          {(product.weight || product.dimensionLength || product.dimensionWidth || product.dimensionHeight) && (
            <Card>
              <CardHeader>
                <CardTitle>Dimensiones y peso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-4">
                  {product.weight && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Peso</dt>
                      <dd className="mt-1">{product.weight} kg</dd>
                    </div>
                  )}
                  {product.dimensionLength && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Largo</dt>
                      <dd className="mt-1">{product.dimensionLength} cm</dd>
                    </div>
                  )}
                  {product.dimensionWidth && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Ancho</dt>
                      <dd className="mt-1">{product.dimensionWidth} cm</dd>
                    </div>
                  )}
                  {product.dimensionHeight && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Alto</dt>
                      <dd className="mt-1">{product.dimensionHeight} cm</dd>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Historial</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Creado</dt>
                  <dd className="mt-1">{formatDateTime(product.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Última actualización</dt>
                  <dd className="mt-1">{formatDateTime(product.updatedAt)}</dd>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Media */}
        <div className="space-y-6">
          {/* Product image */}
          <Card>
            <CardHeader>
              <CardTitle>Imagen</CardTitle>
            </CardHeader>
            <CardContent>
              {product.imageUrl ? (
                <div className="space-y-2">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full rounded-lg object-cover"
                  />
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href={product.imageUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ver imagen completa
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  Sin imagen
                </div>
              )}
            </CardContent>
          </Card>

          {/* Video */}
          {product.videoUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Video</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={product.videoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ver video
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Eliminar producto"
        description={`¿Estás seguro de que deseas eliminar "${product.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        isLoading={deleteProduct.isPending}
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
