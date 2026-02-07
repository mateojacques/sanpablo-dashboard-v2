import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Loader2, Settings, LayoutGrid, FolderTree, Info } from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CarouselForm } from '../components/CarouselForm';
import { CarouselProducts } from '../components/CarouselProducts';
import { ProductSelector } from '../components/ProductSelector';
import {
  useCarousel,
  useUpdateCarousel,
  useAddProductsToCarousel,
  useRemoveProductsFromCarousel,
  useReorderCarouselProducts,
} from '../api/carousels.queries';
import {
  transformCarouselFormData,
  type CarouselFormData,
} from '@/lib/validations/carousel.schema';
import { ROUTES } from '@/lib/constants';

export function CarouselEditPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useCarousel(id!);
  const updateCarousel = useUpdateCarousel();
  const addProducts = useAddProductsToCarousel();
  const removeProducts = useRemoveProductsFromCarousel();
  const reorderProducts = useReorderCarouselProducts();

  const [showProductSelector, setShowProductSelector] = useState(false);

  const carousel = data?.data;

  // Handle form submit
  const handleSubmit = async (formData: CarouselFormData) => {
    if (!carousel) return;

    const data = transformCarouselFormData(formData);

    try {
      await updateCarousel.mutateAsync({
        id: carousel.id,
        data,
      });
      toast.success('Carrusel actualizado');
    } catch {
      toast.error('Error al actualizar el carrusel');
    }
  };

  // Handle add products
  const handleAddProducts = async (productIds: string[]) => {
    if (!carousel) return;

    try {
      await addProducts.mutateAsync({
        carouselId: carousel.id,
        productIds,
      });
      toast.success(`${productIds.length} producto(s) agregado(s)`);
      setShowProductSelector(false);
    } catch {
      toast.error('Error al agregar productos');
    }
  };

  // Handle remove product
  const handleRemoveProduct = async (productId: string) => {
    if (!carousel) return;

    try {
      await removeProducts.mutateAsync({
        carouselId: carousel.id,
        productIds: [productId],
      });
      toast.success('Producto eliminado del carrusel');
    } catch {
      toast.error('Error al eliminar el producto');
    }
  };

  // Handle reorder products
  const handleReorderProducts = async (productIds: string[]) => {
    if (!carousel) return;

    try {
      await reorderProducts.mutateAsync({
        carouselId: carousel.id,
        productIds,
      });
      toast.success('Orden actualizado');
    } catch {
      toast.error('Error al reordenar los productos');
    }
  };

  if (isLoading) {
    return <CarouselEditPageSkeleton />;
  }

  if (isError || !carousel) {
    return (
      <PageContainer title="Error">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="font-medium text-lg">Carrusel no encontrado</h3>
            <p className="text-muted-foreground mt-1">
              El carrusel que buscas no existe o fue eliminado.
            </p>
            <Button asChild className="mt-4">
              <Link to={ROUTES.CAROUSELS}>Volver a carruseles</Link>
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const currentProductIds = carousel.products?.map((p) => p.productId) ?? [];
  const currentProductCount = currentProductIds.length;
  const isManualType = carousel.type === 'manual';

  return (
    <PageContainer
      title={carousel.name}
      description={
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {isManualType ? (
              <>
                <LayoutGrid className="mr-1 h-3 w-3" />
                Manual
              </>
            ) : (
              <>
                <FolderTree className="mr-1 h-3 w-3" />
                Categoría
              </>
            )}
          </Badge>
          <Badge variant={carousel.isActive ? 'default' : 'secondary'}>
            {carousel.isActive ? 'Activo' : 'Inactivo'}
          </Badge>
          <span className="text-muted-foreground">
            {currentProductCount} / {carousel.maxProducts} productos
          </span>
        </div>
      }
      action={
        <Button variant="outline" asChild>
          <Link to={ROUTES.CAROUSELS}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
      }
    >
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">
            <LayoutGrid className="mr-2 h-4 w-4" />
            Productos ({currentProductCount})
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Configuración
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          {!isManualType && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Carrusel automático</AlertTitle>
              <AlertDescription>
                Este carrusel muestra productos de la categoría "{carousel.category?.name || 'Sin categoría'}" 
                automáticamente. No puedes agregar o eliminar productos manualmente.
              </AlertDescription>
            </Alert>
          )}

          {isManualType && (
            <div className="flex justify-end">
              <Button
                onClick={() => setShowProductSelector(true)}
                disabled={currentProductCount >= carousel.maxProducts}
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar productos
              </Button>
            </div>
          )}

          <CarouselProducts
            products={carousel.products ?? []}
            onReorder={handleReorderProducts}
            onRemove={handleRemoveProduct}
            isReordering={reorderProducts.isPending}
            isRemoving={removeProducts.isPending}
          />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del carrusel</CardTitle>
              <CardDescription>
                Modifica los ajustes generales del carrusel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CarouselForm
                carousel={carousel}
                onSubmit={handleSubmit}
                formId="carousel-edit-form"
              />

              <div className="mt-6 flex justify-end">
                <Button
                  type="submit"
                  form="carousel-edit-form"
                  disabled={updateCarousel.isPending}
                >
                  {updateCarousel.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar cambios
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Selector Dialog */}
      <ProductSelector
        open={showProductSelector}
        onOpenChange={setShowProductSelector}
        excludeProductIds={currentProductIds}
        maxProducts={carousel.maxProducts}
        currentCount={currentProductCount}
        onAdd={handleAddProducts}
        isLoading={addProducts.isPending}
      />
    </PageContainer>
  );
}

function CarouselEditPageSkeleton() {
  return (
    <PageContainer
      title={<Skeleton className="h-7 w-48" />}
      description={
        <div className="flex items-center gap-2 mt-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-32" />
        </div>
      }
      action={<Skeleton className="h-9 w-24" />}
    >
      <div className="space-y-6">
        <Skeleton className="h-10 w-80" />
        
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-16 w-16" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32 mt-2" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
