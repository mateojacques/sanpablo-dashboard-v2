import { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { CategoryTree } from '../components/CategoryTree';
import { CategoryDialog } from '../components/CategoryDialog';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useReorderCategories,
} from '../api/categories.queries';
import { transformCategoryFormData, type CategoryFormData } from '@/lib/validations/category.schema';
import type { Category } from '../types';

type DialogState = {
  open: boolean;
  category?: Category;
  parentId?: string | null;
};

export function CategoriesPage() {
  const { data, isLoading, refetch, isRefetching } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const reorderCategories = useReorderCategories();

  const [dialog, setDialog] = useState<DialogState>({ open: false });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; category: Category | null }>({
    open: false,
    category: null,
  });

  // Open dialog for creating new root category
  const handleCreate = () => {
    setDialog({ open: true, category: undefined, parentId: null });
  };

  // Open dialog for creating subcategory
  const handleAddChild = (parentId: string) => {
    setDialog({ open: true, category: undefined, parentId });
  };

  // Open dialog for editing
  const handleEdit = (category: Category) => {
    setDialog({ open: true, category, parentId: category.parentId });
  };

  // Open delete confirmation
  const handleDeleteClick = (category: Category) => {
    setDeleteDialog({ open: true, category });
  };

  // Toggle active status
  const handleToggleActive = async (category: Category) => {
    try {
      await updateCategory.mutateAsync({
        id: category.id,
        data: { isActive: !category.isActive },
      });
      toast.success(
        category.isActive
          ? 'Categoría desactivada'
          : 'Categoría activada'
      );
    } catch {
      toast.error('Error al cambiar el estado');
    }
  };

  // Handle reorder
  const handleReorder = async (categoryIds: string[]) => {
    try {
      await reorderCategories.mutateAsync(categoryIds);
      toast.success('Orden actualizado');
    } catch {
      toast.error('Error al reordenar');
    }
  };

  // Submit create/update form
  const handleSubmit = async (formData: CategoryFormData) => {
    const data = transformCategoryFormData(formData);

    try {
      if (dialog.category) {
        // Update existing
        await updateCategory.mutateAsync({
          id: dialog.category.id,
          data,
        });
        toast.success('Categoría actualizada');
      } else {
        // Create new
        await createCategory.mutateAsync(data);
        toast.success('Categoría creada');
      }
      setDialog({ open: false });
    } catch {
      toast.error(
        dialog.category
          ? 'Error al actualizar la categoría'
          : 'Error al crear la categoría'
      );
    }
  };

  // Confirm delete
  const handleDelete = async () => {
    if (!deleteDialog.category) return;

    try {
      await deleteCategory.mutateAsync(deleteDialog.category.id);
      toast.success('Categoría eliminada');
      setDeleteDialog({ open: false, category: null });
    } catch {
      toast.error('Error al eliminar la categoría');
    }
  };

  const isSubmitting =
    createCategory.isPending || updateCategory.isPending;

  return (
    <PageContainer
      title="Categorías"
      description="Organiza los productos en categorías y subcategorías"
      action={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isRefetching}
            title="Recargar"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva categoría
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <CategoriesPageSkeleton />
      ) : data?.data && data.data.length > 0 ? (
        <CategoryTree
          categories={data.data}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onAddChild={handleAddChild}
          onToggleActive={handleToggleActive}
          onReorder={handleReorder}
        />
      ) : (
        <EmptyState
          icon="inbox"
          title="No hay categorías"
          description="Crea tu primera categoría para organizar los productos de la tienda."
          action={{
            label: 'Crear categoría',
            onClick: handleCreate,
          }}
        />
      )}

      {/* Create/Edit dialog */}
      <CategoryDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog({ ...dialog, open })}
        category={dialog.category}
        parentId={dialog.parentId}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, category: open ? deleteDialog.category : null })
        }
        title="Eliminar categoría"
        description={`¿Estás seguro de que deseas eliminar "${deleteDialog.category?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        isLoading={deleteCategory.isPending}
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
}

function CategoriesPageSkeleton() {
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-10" />
        </div>
      </div>
      <div className="divide-y">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}
