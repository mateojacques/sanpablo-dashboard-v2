import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCategories } from '@/features/categories/api/categories.queries';
import { flattenCategoryTree } from '@/features/categories/types';
import {
  carouselSchema,
  type CarouselFormData,
} from '@/lib/validations/carousel.schema';
import { slugify } from '@/lib/utils';
import { CAROUSEL_TYPE } from '@/lib/constants';
import type { Carousel } from '../types';

type CarouselFormProps = {
  carousel?: Carousel;
  onSubmit: (data: CarouselFormData) => void;
  formId: string;
};

export function CarouselForm({
  carousel,
  onSubmit,
  formId,
}: CarouselFormProps) {
  const { data: categoriesData } = useCategories();

  // Flatten categories for dropdown
  const flatCategories = categoriesData?.data
    ? flattenCategoryTree(categoriesData.data)
    : [];

  const form = useForm<CarouselFormData>({
    resolver: zodResolver(carouselSchema),
    defaultValues: {
      name: carousel?.name ?? '',
      slug: carousel?.slug ?? '',
      description: carousel?.description ?? '',
      type: carousel?.type ?? 'manual',
      categoryId: carousel?.categoryId ?? '',
      maxProducts: carousel?.maxProducts ?? 10,
      isActive: carousel?.isActive ?? true,
    },
  });

  const nameValue = form.watch('name');
  const slugValue = form.watch('slug');
  const typeValue = form.watch('type');

  // Auto-generate slug from name if slug is empty
  useEffect(() => {
    if (nameValue && !slugValue && !carousel) {
      form.setValue('slug', slugify(nameValue));
    }
  }, [nameValue, slugValue, carousel, form]);

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre *</FormLabel>
              <FormControl>
                <Input placeholder="Nombre del carrusel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="nombre-del-carrusel" {...field} />
              </FormControl>
              <FormDescription>
                URL amigable. Se genera automáticamente del nombre.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descripción opcional del carrusel..."
                  rows={3}
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de carrusel</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={CAROUSEL_TYPE.MANUAL}>
                    Manual - Selecciona productos manualmente
                  </SelectItem>
                  <SelectItem value={CAROUSEL_TYPE.CATEGORY}>
                    Categoría - Productos de una categoría
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {typeValue === 'manual'
                  ? 'Selecciona manualmente qué productos mostrar.'
                  : 'Muestra automáticamente productos de una categoría.'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {typeValue === 'category' && (
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría *</FormLabel>
                <Select
                  value={field.value || '__none__'}
                  onValueChange={(value) => field.onChange(value === '__none__' ? '' : value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none__">Selecciona una categoría</SelectItem>
                    {flatCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {'  '.repeat(cat.level)}
                        {cat.level > 0 ? '└ ' : ''}
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Los productos de esta categoría se mostrarán automáticamente.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="maxProducts"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Máximo de productos</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                />
              </FormControl>
              <FormDescription>
                Cantidad máxima de productos a mostrar (1-50).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Carrusel activo</FormLabel>
                <FormDescription>
                  Los carruseles inactivos no se muestran en la tienda
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
