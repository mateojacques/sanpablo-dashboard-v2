import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { faqItemSchema, type FaqItemFormData } from '@/lib/validations/content.schema';
import type { FaqItem } from '../types';

type FaqItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faqItem?: FaqItem | null;
  onSave: (data: FaqItemFormData) => void;
  isLoading?: boolean;
};

export function FaqItemDialog({
  open,
  onOpenChange,
  faqItem,
  onSave,
  isLoading,
}: FaqItemDialogProps) {
  const isEditing = !!faqItem;

  const form = useForm<FaqItemFormData>({
    resolver: zodResolver(faqItemSchema),
    defaultValues: {
      question: faqItem?.question ?? '',
      answer: faqItem?.answer ?? '',
    },
  });

  // Reset form when dialog opens with different data
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      form.reset({
        question: faqItem?.question ?? '',
        answer: faqItem?.answer ?? '',
      });
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = (data: FaqItemFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar pregunta' : 'Nueva pregunta'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica la pregunta y respuesta del FAQ.'
              : 'Agrega una nueva pregunta frecuente.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pregunta *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: ¿Cuáles son los métodos de pago aceptados?"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Respuesta *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Escribe la respuesta detallada..."
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Agregar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
