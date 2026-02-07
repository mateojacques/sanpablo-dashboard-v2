import { Link } from 'react-router-dom';
import { GripVertical, Pencil, Trash2, Eye, EyeOff, ExternalLink, LayoutGrid, FolderTree } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ROUTES } from '@/lib/constants';
import type { Carousel } from '../types';

type CarouselCardProps = {
  carousel: Carousel;
  onEdit: (carousel: Carousel) => void;
  onDelete: (carousel: Carousel) => void;
  onToggleActive: (carousel: Carousel) => void;
  isDragging?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
};

export function CarouselCard({
  carousel,
  onEdit,
  onDelete,
  onToggleActive,
  isDragging = false,
  dragHandleProps,
}: CarouselCardProps) {
  const productCount = carousel._count?.products ?? carousel.products?.length ?? 0;

  return (
    <Card className={`transition-shadow ${isDragging ? 'shadow-lg ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Drag handle */}
          <div
            {...dragHandleProps}
            className="mt-1 cursor-grab rounded p-1 hover:bg-muted active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base truncate">{carousel.name}</CardTitle>
              
              {/* Type badge */}
              <Badge variant="outline" className="shrink-0">
                {carousel.type === 'manual' ? (
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

              {/* Active status */}
              <Badge
                variant={carousel.isActive ? 'default' : 'secondary'}
                className="shrink-0"
              >
                {carousel.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>

            <CardDescription className="mt-1">
              {carousel.description || (
                <span className="italic text-muted-foreground/70">Sin descripción</span>
              )}
            </CardDescription>

            {/* Meta info */}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span>
                <strong>{productCount}</strong> {productCount === 1 ? 'producto' : 'productos'}
              </span>
              <span>Máximo: {carousel.maxProducts}</span>
              {carousel.type === 'category' && carousel.category && (
                <span>Categoría: {carousel.category.name}</span>
              )}
              <span className="font-mono text-xs">/{carousel.slug}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleActive(carousel)}
                  >
                    {carousel.isActive ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {carousel.isActive ? 'Desactivar' : 'Activar'}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(carousel)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={ROUTES.CAROUSEL_EDIT.replace(':id', carousel.id)}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Gestionar productos</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(carousel)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Eliminar</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
