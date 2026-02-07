import { useState, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { CarouselCard } from '../components/CarouselCard';
import { CarouselDialog } from '../components/CarouselDialog';
import {
  useCarousels,
  useCreateCarousel,
  useUpdateCarousel,
  useDeleteCarousel,
  useReorderCarousels,
} from '../api/carousels.queries';
import {
  transformCarouselFormData,
  type CarouselFormData,
} from '@/lib/validations/carousel.schema';
import type { Carousel } from '../types';

type DialogState = {
  open: boolean;
  carousel?: Carousel;
};

export function CarouselsPage() {
  const { data, isLoading, refetch, isRefetching } = useCarousels();
  const createCarousel = useCreateCarousel();
  const updateCarousel = useUpdateCarousel();
  const deleteCarousel = useDeleteCarousel();
  const reorderCarousels = useReorderCarousels();

  const [items, setItems] = useState<Carousel[]>([]);
  const [dialog, setDialog] = useState<DialogState>({ open: false });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; carousel: Carousel | null }>({
    open: false,
    carousel: null,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync items with data
  useEffect(() => {
    if (data?.data) {
      setItems(data.data);
    }
  }, [data?.data]);

  // Open dialog for creating new carousel
  const handleCreate = () => {
    setDialog({ open: true, carousel: undefined });
  };

  // Open dialog for editing
  const handleEdit = (carousel: Carousel) => {
    setDialog({ open: true, carousel });
  };

  // Open delete confirmation
  const handleDeleteClick = (carousel: Carousel) => {
    setDeleteDialog({ open: true, carousel });
  };

  // Toggle active status
  const handleToggleActive = async (carousel: Carousel) => {
    try {
      await updateCarousel.mutateAsync({
        id: carousel.id,
        data: { isActive: !carousel.isActive },
      });
      toast.success(
        carousel.isActive ? 'Carrusel desactivado' : 'Carrusel activado'
      );
    } catch {
      toast.error('Error al cambiar el estado');
    }
  };

  // Handle drag end for reordering
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);

      // Optimistic update
      setItems(newItems);

      try {
        await reorderCarousels.mutateAsync(newItems.map((item) => item.id));
        toast.success('Orden actualizado');
      } catch {
        // Revert on error
        setItems(items);
        toast.error('Error al reordenar');
      }
    }
  };

  // Submit create/update form
  const handleSubmit = async (formData: CarouselFormData) => {
    const data = transformCarouselFormData(formData);

    try {
      if (dialog.carousel) {
        // Update existing
        await updateCarousel.mutateAsync({
          id: dialog.carousel.id,
          data,
        });
        toast.success('Carrusel actualizado');
      } else {
        // Create new
        await createCarousel.mutateAsync(data);
        toast.success('Carrusel creado');
      }
      setDialog({ open: false });
    } catch {
      toast.error(
        dialog.carousel
          ? 'Error al actualizar el carrusel'
          : 'Error al crear el carrusel'
      );
    }
  };

  // Confirm delete
  const handleDelete = async () => {
    if (!deleteDialog.carousel) return;

    try {
      await deleteCarousel.mutateAsync(deleteDialog.carousel.id);
      toast.success('Carrusel eliminado');
      setDeleteDialog({ open: false, carousel: null });
    } catch {
      toast.error('Error al eliminar el carrusel');
    }
  };

  const isSubmitting = createCarousel.isPending || updateCarousel.isPending;

  return (
    <PageContainer
      title="Carruseles"
      description="Gestiona los carruseles de productos de la tienda"
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
            Nuevo carrusel
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <CarouselsPageSkeleton />
      ) : items.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {items.map((carousel) => (
                <SortableCarouselCard
                  key={carousel.id}
                  carousel={carousel}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <EmptyState
          icon="inbox"
          title="No hay carruseles"
          description="Crea tu primer carrusel para mostrar productos destacados en la tienda."
          action={{
            label: 'Crear carrusel',
            onClick: handleCreate,
          }}
        />
      )}

      {/* Create/Edit dialog */}
      <CarouselDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog({ ...dialog, open })}
        carousel={dialog.carousel}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, carousel: open ? deleteDialog.carousel : null })
        }
        title="Eliminar carrusel"
        description={`¿Estás seguro de que deseas eliminar "${deleteDialog.carousel?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="destructive"
        isLoading={deleteCarousel.isPending}
        onConfirm={handleDelete}
      />
    </PageContainer>
  );
}

// Sortable wrapper for CarouselCard
type SortableCarouselCardProps = {
  carousel: Carousel;
  onEdit: (carousel: Carousel) => void;
  onDelete: (carousel: Carousel) => void;
  onToggleActive: (carousel: Carousel) => void;
};

function SortableCarouselCard({
  carousel,
  onEdit,
  onDelete,
  onToggleActive,
}: SortableCarouselCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: carousel.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <CarouselCard
        carousel={carousel}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

function CarouselsPageSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-6 w-6" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-64 mt-2" />
              <div className="flex gap-4 mt-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex gap-1">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
