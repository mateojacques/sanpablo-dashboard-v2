import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ProductForm } from '../components/ProductForm';
import { useProduct, useUpdateProduct } from '../api/products.queries';
import { ROUTES } from '@/lib/constants';
import type { ProductFormData } from '@/lib/validations/product.schema';

export function ProductEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useProduct(id!);
  const updateProduct = useUpdateProduct();

  const handleSubmit = async (formData: ProductFormData) => {
    if (!id) return;

    try {
      await updateProduct.mutateAsync({ id, data: formData });
      toast.success('Producto actualizado correctamente');
      navigate(ROUTES.PRODUCTS);
    } catch (err) {
      toast.error('Error al actualizar el producto');
      console.error('Error updating product:', err);
    }
  };

  if (isLoading) {
    return (
      <PageContainer title="Editar producto">
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  if (error || !data?.data) {
    return (
      <PageContainer title="Editar producto">
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
      title={`Editar: ${product.name}`}
      description={`SKU: ${product.sku}`}
      action={
        <Button variant="outline" onClick={() => navigate(ROUTES.PRODUCTS)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      }
    >
      <ProductForm
        product={product}
        onSubmit={handleSubmit}
        isLoading={updateProduct.isPending}
        submitLabel="Guardar cambios"
      />
    </PageContainer>
  );
}
