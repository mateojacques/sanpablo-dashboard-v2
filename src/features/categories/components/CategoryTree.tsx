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
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  Power,
  PowerOff,
  GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Category } from '../types';

type CategoryTreeProps = {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onAddChild: (parentId: string) => void;
  onToggleActive: (category: Category) => void;
  onReorder?: (categoryIds: string[]) => void;
  isLoading?: boolean;
};

export function CategoryTree({
  categories,
  onEdit,
  onDelete,
  onAddChild,
  onToggleActive,
  onReorder,
}: CategoryTreeProps) {
  const [items, setItems] = useState(categories);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(categories.map((c) => c.id))
  );

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

  // Sync with props when categories change
  if (JSON.stringify(categories.map((c) => c.id)) !== JSON.stringify(items.map((c) => c.id))) {
    setItems(categories);
  }

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex((item) => item.id === active.id);
        const newIndex = currentItems.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(currentItems, oldIndex, newIndex);

        // Notify parent about reorder
        if (onReorder) {
          onReorder(newItems.map((item) => item.id));
        }

        return newItems;
      });
    }
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
          <span className="w-6"></span>
          <span className="w-6"></span>
          <span className="w-5"></span>
          <span className="flex-1">Nombre</span>
          <span className="w-24 text-center">Productos</span>
          <span className="w-20 text-center">Estado</span>
          <span className="w-10"></span>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="divide-y">
            {items.map((category) => (
              <SortableCategoryItem
                key={category.id}
                category={category}
                level={0}
                isExpanded={expandedIds.has(category.id)}
                expandedIds={expandedIds}
                onToggleExpand={toggleExpand}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={onAddChild}
                onToggleActive={onToggleActive}
              />
            ))}
            {items.length === 0 && (
              <div className="px-4 py-8 text-center text-muted-foreground">
                No hay categorías. Crea una para comenzar.
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

type SortableCategoryItemProps = {
  category: Category;
  level: number;
  isExpanded: boolean;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onAddChild: (parentId: string) => void;
  onToggleActive: (category: Category) => void;
};

function SortableCategoryItem({
  category,
  level,
  isExpanded,
  expandedIds,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddChild,
  onToggleActive,
}: SortableCategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const hasChildren = category.children && category.children.length > 0;
  const productCount = category._count?.products ?? 0;

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-3 hover:bg-muted/50 transition-colors',
          level > 0 && 'border-l-2 border-muted ml-6',
          isDragging && 'opacity-50 bg-muted'
        )}
        style={{ paddingLeft: `${16 + level * 24}px` }}
      >
        {/* Drag handle */}
        <button
          className="cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground/50 hover:text-muted-foreground" />
        </button>

        {/* Expand/collapse button */}
        <button
          onClick={() => onToggleExpand(category.id)}
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded hover:bg-muted',
            !hasChildren && 'invisible'
          )}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* Folder icon */}
        {isExpanded && hasChildren ? (
          <FolderOpen className="h-5 w-5 text-amber-500" />
        ) : (
          <Folder className="h-5 w-5 text-amber-500" />
        )}

        {/* Category name and slug */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{category.name}</span>
            <span className="text-xs text-muted-foreground font-mono">/{category.slug}</span>
          </div>
          {category.description && (
            <p className="text-sm text-muted-foreground truncate">{category.description}</p>
          )}
        </div>

        {/* Product count */}
        <div className="w-24 text-center">
          <Badge variant="outline" className="font-mono">
            {productCount}
          </Badge>
        </div>

        {/* Status badge */}
        <div className="w-20 text-center">
          <Badge variant={category.isActive ? 'success' : 'secondary'}>
            {category.isActive ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>

        {/* Actions dropdown */}
        <div className="w-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Acciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(category)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddChild(category.id)}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar subcategoría
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleActive(category)}>
                {category.isActive ? (
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
                onClick={() => onDelete(category)}
                disabled={hasChildren || productCount > 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
                {(hasChildren || productCount > 0) && (
                  <span className="ml-2 text-xs">(tiene contenido)</span>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Children - rendered recursively but not sortable (only root level is sortable) */}
      {hasChildren && isExpanded && (
        <div>
          {category.children!.map((child) => (
            <CategoryTreeChild
              key={child.id}
              category={child}
              level={level + 1}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onToggleActive={onToggleActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Non-sortable child component for nested categories
function CategoryTreeChild({
  category,
  level,
  expandedIds,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddChild,
  onToggleActive,
}: Omit<SortableCategoryItemProps, 'isExpanded'>) {
  const isExpanded = expandedIds.has(category.id);
  const hasChildren = category.children && category.children.length > 0;
  const productCount = category._count?.products ?? 0;

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-3 hover:bg-muted/50 transition-colors',
          'border-l-2 border-muted ml-6'
        )}
        style={{ paddingLeft: `${16 + level * 24}px` }}
      >
        {/* Drag handle placeholder for alignment */}
        <div className="w-4" />

        {/* Expand/collapse button */}
        <button
          onClick={() => onToggleExpand(category.id)}
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded hover:bg-muted',
            !hasChildren && 'invisible'
          )}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* Folder icon */}
        {isExpanded && hasChildren ? (
          <FolderOpen className="h-5 w-5 text-amber-500" />
        ) : (
          <Folder className="h-5 w-5 text-amber-500" />
        )}

        {/* Category name and slug */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{category.name}</span>
            <span className="text-xs text-muted-foreground font-mono">/{category.slug}</span>
          </div>
          {category.description && (
            <p className="text-sm text-muted-foreground truncate">{category.description}</p>
          )}
        </div>

        {/* Product count */}
        <div className="w-24 text-center">
          <Badge variant="outline" className="font-mono">
            {productCount}
          </Badge>
        </div>

        {/* Status badge */}
        <div className="w-20 text-center">
          <Badge variant={category.isActive ? 'success' : 'secondary'}>
            {category.isActive ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>

        {/* Actions dropdown */}
        <div className="w-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Acciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(category)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddChild(category.id)}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar subcategoría
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleActive(category)}>
                {category.isActive ? (
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
                onClick={() => onDelete(category)}
                disabled={hasChildren || productCount > 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
                {(hasChildren || productCount > 0) && (
                  <span className="ml-2 text-xs">(tiene contenido)</span>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Nested children */}
      {hasChildren && isExpanded && (
        <div>
          {category.children!.map((child) => (
            <CategoryTreeChild
              key={child.id}
              category={child}
              level={level + 1}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onToggleActive={onToggleActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
