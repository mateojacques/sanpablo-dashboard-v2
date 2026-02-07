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
import { CarouselForm } from './CarouselForm';
import type { Carousel } from '../types';
import type { CarouselFormData } from '@/lib/validations/carousel.schema';

type CarouselDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carousel?: Carousel;
  onSubmit: (data: CarouselFormData) => void;
  isLoading?: boolean;
};

export function CarouselDialog({
  open,
  onOpenChange,
  carousel,
  onSubmit,
  isLoading = false,
}: CarouselDialogProps) {
  const isEditing = !!carousel;
  const formId = 'carousel-form';

  const handleSubmit = (data: CarouselFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar carrusel' : 'Nuevo carrusel'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos del carrusel.'
              : 'Crea un nuevo carrusel de productos para la tienda.'}
          </DialogDescription>
        </DialogHeader>

        <CarouselForm
          carousel={carousel}
          onSubmit={handleSubmit}
          formId={formId}
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
            {isEditing ? 'Guardar cambios' : 'Crear carrusel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
