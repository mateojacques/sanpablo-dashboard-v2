import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Loader2, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useUpdateOrdering } from '../api/storefront-config.queries';
import type { OrderingConfig } from '../types';

const DEFAULT_AVAILABILITY = 'La disponibilidad y el plazo de entrega se confirman por WhatsApp.';
const DEFAULT_PRICE =
  'Las imágenes son ilustrativas. Los precios son finales, incluyen IVA y pueden cambiar sin previo aviso.';

const orderingSchema = z.object({
  availabilityNotice: z.string().max(300, 'Máximo 300 caracteres'),
  minimumOrderNotice: z.string().max(300, 'Máximo 300 caracteres'),
  priceNotice: z.string().max(300, 'Máximo 300 caracteres'),
});

type OrderingFormData = z.infer<typeof orderingSchema>;

type OrderingFormProps = {
  /** Missing on configs saved before this section existed. */
  initialData?: OrderingConfig;
};

export function OrderingForm({ initialData }: OrderingFormProps) {
  const updateOrdering = useUpdateOrdering();

  const form = useForm<OrderingFormData>({
    resolver: zodResolver(orderingSchema),
    defaultValues: {
      availabilityNotice: initialData?.availabilityNotice ?? DEFAULT_AVAILABILITY,
      minimumOrderNotice: initialData?.minimumOrderNotice ?? '',
      priceNotice: initialData?.priceNotice ?? DEFAULT_PRICE,
    },
  });

  const onSubmit = async (data: OrderingFormData) => {
    try {
      await updateOrdering.mutateAsync({
        availabilityNotice: data.availabilityNotice.trim(),
        minimumOrderNotice: data.minimumOrderNotice.trim(),
        priceNotice: data.priceNotice.trim(),
      });
      toast.success('Avisos de pedidos actualizados');
    } catch {
      toast.error('Error al actualizar los avisos');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Pedidos
        </CardTitle>
        <CardDescription>
          Avisos que la tienda muestra al armar un pedido. Un aviso vacío no se muestra.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="availabilityNotice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aviso de disponibilidad</FormLabel>
                  <FormControl>
                    <Textarea rows={2} maxLength={300} {...field} />
                  </FormControl>
                  <FormDescription>
                    Se muestra en la página del producto, en el carrito y en la revisión del pedido.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minimumOrderNotice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aviso de pedido mínimo</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      maxLength={300}
                      placeholder="Pedido mínimo: $50.000."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Se muestra en el carrito y en la revisión del pedido. La tienda no lo exige.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priceNotice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aviso de precios e imágenes</FormLabel>
                  <FormControl>
                    <Textarea rows={2} maxLength={300} {...field} />
                  </FormControl>
                  <FormDescription>
                    Se muestra en el pie de página, en la ficha del producto, en el carrito, en la
                    revisión del pedido y en el correo de confirmación. Si queda vacío, no se muestra.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={updateOrdering.isPending}>
                {updateOrdering.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Guardar cambios
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
