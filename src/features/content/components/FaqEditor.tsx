import { useState } from 'react';
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
import {
  GripVertical,
  Plus,
  Trash2,
  Pencil,
  HelpCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { FaqItemDialog } from './FaqItemDialog';
import { useFaq, useUpdateFaq } from '../api/content.queries';
import type { FaqItemFormData } from '@/lib/validations/content.schema';

// Local FAQ item with temporary ID for new items
type LocalFaqItem = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isNew?: boolean;
};

export function FaqEditor() {
  const { data, isLoading } = useFaq();
  const updateFaq = useUpdateFaq();

  const [localFaqItems, setLocalFaqItems] = useState<LocalFaqItem[]>([]);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Initialize local state from server data
  const faqItems = hasLocalChanges ? localFaqItems : (data?.data ?? []).map((item, index) => ({
    ...item,
    sortOrder: item.sortOrder ?? index,
  }));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = faqItems.findIndex((item) => item.id === active.id);
      const newIndex = faqItems.findIndex((item) => item.id === over.id);
      const reordered = arrayMove(faqItems, oldIndex, newIndex).map((item, index) => ({
        ...item,
        sortOrder: index,
      }));
      setLocalFaqItems(reordered);
      setHasLocalChanges(true);
    }
  };

  const handleOpenAddDialog = () => {
    setEditingIndex(null);
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (index: number) => {
    setEditingIndex(index);
    setDialogOpen(true);
  };

  const handleSaveItem = (formData: FaqItemFormData) => {
    if (editingIndex !== null) {
      // Edit existing
      const updated = faqItems.map((item, index) =>
        index === editingIndex
          ? { ...item, question: formData.question, answer: formData.answer }
          : item
      );
      setLocalFaqItems(updated);
    } else {
      // Add new
      const newItem: LocalFaqItem = {
        id: `temp-${Date.now()}`,
        question: formData.question,
        answer: formData.answer,
        sortOrder: faqItems.length,
        isNew: true,
      };
      setLocalFaqItems([...faqItems, newItem]);
    }
    setHasLocalChanges(true);
    setDialogOpen(false);
    setEditingIndex(null);
    toast.success(editingIndex !== null ? 'Pregunta actualizada' : 'Pregunta agregada');
  };

  const handleDeleteClick = (index: number) => {
    setDeleteIndex(index);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteIndex === null) return;
    
    const updated = faqItems
      .filter((_, index) => index !== deleteIndex)
      .map((item, index) => ({ ...item, sortOrder: index }));
    setLocalFaqItems(updated);
    setHasLocalChanges(true);
    setDeleteDialogOpen(false);
    setDeleteIndex(null);
    toast.success('Pregunta eliminada');
  };

  const handleSaveAll = async () => {
    try {
      const faqToSave = faqItems.map(({ question, answer, sortOrder }) => ({
        question,
        answer,
        sortOrder,
      }));
      await updateFaq.mutateAsync(faqToSave);
      setHasLocalChanges(false);
      setLocalFaqItems([]);
      toast.success('Preguntas frecuentes actualizadas');
    } catch {
      toast.error('Error al guardar las preguntas frecuentes');
    }
  };

  const handleDiscardChanges = () => {
    setLocalFaqItems([]);
    setHasLocalChanges(false);
    toast.info('Cambios descartados');
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const editingItem = editingIndex !== null ? faqItems[editingIndex] : null;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Preguntas Frecuentes
              </CardTitle>
              <CardDescription>
                Gestiona las preguntas frecuentes de la tienda. Arrastra para reordenar.
              </CardDescription>
            </div>
            <Button onClick={handleOpenAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar pregunta
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
              <HelpCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-lg">Sin preguntas frecuentes</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Agrega preguntas frecuentes para ayudar a tus clientes.
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={faqItems.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {faqItems.map((item, index) => (
                    <SortableFaqItem
                      key={item.id}
                      item={item}
                      isExpanded={expandedId === item.id}
                      onToggleExpand={() => toggleExpand(item.id)}
                      onEdit={() => handleOpenEditDialog(index)}
                      onDelete={() => handleDeleteClick(index)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* Save/Discard buttons */}
          {hasLocalChanges && (
            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <p className="text-sm text-muted-foreground mr-auto">
                Tienes cambios sin guardar
              </p>
              <Button variant="outline" onClick={handleDiscardChanges}>
                Descartar
              </Button>
              <Button onClick={handleSaveAll} disabled={updateFaq.isPending}>
                {updateFaq.isPending ? (
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
          )}
        </CardContent>
      </Card>

      {/* Add/Edit dialog */}
      <FaqItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        faqItem={editingItem}
        onSave={handleSaveItem}
        isLoading={false}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar pregunta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la pregunta. Recuerda guardar los cambios para aplicarlos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

type SortableFaqItemProps = {
  item: LocalFaqItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function SortableFaqItem({
  item,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
}: SortableFaqItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border bg-background',
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-3 p-3">
        {/* Drag handle */}
        <button
          className="cursor-grab active:cursor-grabbing touch-none p-1"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Question text */}
        <button
          className="flex-1 text-left font-medium truncate"
          onClick={onToggleExpand}
        >
          {item.question}
        </button>

        {/* Expand/collapse */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleExpand}
          className="shrink-0"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="text-destructive hover:text-destructive"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Answer (expandable) */}
      {isExpanded && (
        <div className="px-12 pb-4 text-sm text-muted-foreground whitespace-pre-wrap">
          {item.answer}
        </div>
      )}
    </div>
  );
}
