import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { ProductForm } from '../components/ProductForm';
import { useCreateProduct } from '../api/products.queries';
import { ROUTES } from '@/lib/constants';
import type { ProductFormData } from '@/lib/validations/product.schema';

export function ProductCreatePage() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();

  const handleSubmit = async (data: ProductFormData) => {
    try {
      await createProduct.mutateAsync(data);
      toast.success('Producto creado correctamente');
      navigate(ROUTES.PRODUCTS);
    } catch (error) {
      toast.error('Error al crear el producto');
      console.error('Error creating product:', error);
    }
  };

  return (
    <PageContainer
      title="Nuevo producto"
      description="Crea un nuevo producto para el catálogo"
      action={
        <Button variant="outline" onClick={() => navigate(ROUTES.PRODUCTS)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      }
    >
      <ProductForm
        onSubmit={handleSubmit}
        isLoading={createProduct.isPending}
        submitLabel="Crear producto"
      />
    </PageContainer>
  );
}
