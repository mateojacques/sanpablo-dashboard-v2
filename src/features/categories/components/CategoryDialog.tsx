import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CategoryForm } from './CategoryForm';
import type { Category } from '../types';
import type { CategoryFormData } from '@/lib/validations/category.schema';

type CategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
  parentId?: string | null;
  onSubmit: (data: CategoryFormData) => void;
  isLoading?: boolean;
};

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  parentId,
  onSubmit,
  isLoading = false,
}: CategoryDialogProps) {
  const isEditing = !!category;
  const formId = 'category-form';

  const handleSubmit = (data: CategoryFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar categoría' : 'Nueva categoría'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos de la categoría.'
              : parentId
                ? 'Crea una nueva subcategoría.'
                : 'Crea una nueva categoría de nivel superior.'}
          </DialogDescription>
        </DialogHeader>

        <CategoryForm
          category={category}
          parentId={parentId}
          onSubmit={handleSubmit}
          formId={formId}
          excludeCategoryId={category?.id}
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" form={formId} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Guardar cambios' : 'Crear categoría'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
