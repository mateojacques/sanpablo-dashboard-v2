import { useState, useEffect } from 'react';
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
import { GripVertical, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn, formatPrice } from '@/lib/utils';
import type { CarouselProduct } from '../types';

type CarouselProductsProps = {
  products: CarouselProduct[];
  onReorder: (productIds: string[]) => void;
  onRemove: (productId: string) => void;
  isReordering?: boolean;
  isRemoving?: boolean;
};

export function CarouselProducts({
  products,
  onReorder,
  onRemove,
  isReordering = false,
  isRemoving = false,
}: CarouselProductsProps) {
  const [items, setItems] = useState(products);

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

  // Sync with props when products change
  useEffect(() => {
    setItems(products);
  }, [products]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex((item) => item.productId === active.id);
        const newIndex = currentItems.findIndex((item) => item.productId === over.id);
        const newItems = arrayMove(currentItems, oldIndex, newIndex);

        // Notify parent about reorder
        onReorder(newItems.map((item) => item.productId));

        return newItems;
      });
    }
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-medium text-lg">Sin productos</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Agrega productos a este carrusel para que se muestren en la tienda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.productId)}
            strategy={verticalListSortingStrategy}
          >
            <div className={cn('divide-y', isReordering && 'opacity-70 pointer-events-none')}>
              {items.map((item, index) => (
                <SortableProductItem
                  key={item.productId}
                  item={item}
                  index={index}
                  onRemove={onRemove}
                  isRemoving={isRemoving}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}

type SortableProductItemProps = {
  item: CarouselProduct;
  index: number;
  onRemove: (productId: string) => void;
  isRemoving?: boolean;
};

function SortableProductItem({
  item,
  index,
  onRemove,
  isRemoving = false,
}: SortableProductItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.productId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { product } = item;

  // Handle case where product data is not yet loaded
  if (!product) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'flex items-center gap-4 p-4 bg-background transition-colors',
          isDragging && 'opacity-50 bg-muted shadow-lg z-10',
          'hover:bg-muted/50'
        )}
      >
        <button
          className="cursor-grab active:cursor-grabbing touch-none p-1 rounded hover:bg-muted"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-muted text-sm font-medium">
          {index + 1}
        </div>
        <div className="w-16 h-16 rounded border overflow-hidden bg-muted shrink-0 animate-pulse" />
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-muted rounded w-32 animate-pulse" />
          <div className="h-3 bg-muted rounded w-20 mt-2 animate-pulse" />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive shrink-0"
                onClick={() => onRemove(item.productId)}
                disabled={isRemoving}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Quitar del carrusel</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  const hasDiscount = product.salePrice && parseFloat(product.salePrice) < parseFloat(product.regularPrice);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-4 p-4 bg-background transition-colors',
        isDragging && 'opacity-50 bg-muted shadow-lg z-10',
        'hover:bg-muted/50'
      )}
    >
      {/* Drag handle */}
      <button
        className="cursor-grab active:cursor-grabbing touch-none p-1 rounded hover:bg-muted"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Position number */}
      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-muted text-sm font-medium">
        {index + 1}
      </div>

      {/* Product image */}
      <div className="w-16 h-16 rounded border overflow-hidden bg-muted shrink-0">
        {product.thumbnailUrl || product.imageUrl ? (
          <img
            src={product.thumbnailUrl || product.imageUrl!}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-6 w-6 text-muted-foreground/50" />
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{product.name}</span>
          {!product.isActive && (
            <Badge variant="secondary" className="shrink-0">
              Inactivo
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
          <span className="font-mono">{product.sku}</span>
          {product.category && (
            <>
              <span className="text-muted-foreground/50">|</span>
              <span>{product.category.name}</span>
            </>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="text-right shrink-0">
        {hasDiscount ? (
          <>
            <div className="font-medium text-green-600">
              {formatPrice(product.salePrice!)}
            </div>
            <div className="text-sm text-muted-foreground line-through">
              {formatPrice(product.regularPrice)}
            </div>
          </>
        ) : (
          <div className="font-medium">{formatPrice(product.regularPrice)}</div>
        )}
      </div>

      {/* Remove button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive shrink-0"
              onClick={() => onRemove(item.productId)}
              disabled={isRemoving}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Quitar del carrusel</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
