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
import { useCategories } from '../api/categories.queries';
import { flattenCategoryTree, type Category } from '../types';
import {
  categorySchema,
  type CategoryFormData,
} from '@/lib/validations/category.schema';
import { slugify } from '@/lib/utils';

type CategoryFormProps = {
  category?: Category;
  parentId?: string | null;
  onSubmit: (data: CategoryFormData) => void;
  formId: string;
  excludeCategoryId?: string; // To exclude self from parent selection when editing
};

export function CategoryForm({
  category,
  parentId,
  onSubmit,
  formId,
  excludeCategoryId,
}: CategoryFormProps) {
  const { data: categoriesData } = useCategories();

  // Flatten categories for parent dropdown, excluding current category and its children
  const flatCategories = categoriesData?.data
    ? flattenCategoryTree(categoriesData.data).filter((c) => c.id !== excludeCategoryId)
    : [];

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? '',
      slug: category?.slug ?? '',
      description: category?.description ?? '',
      imageUrl: category?.imageUrl ?? '',
      parentId: category?.parentId ?? parentId ?? '',
      isActive: category?.isActive ?? true,
    },
  });

  const nameValue = form.watch('name');
  const slugValue = form.watch('slug');

  // Auto-generate slug from name if slug is empty
  useEffect(() => {
    if (nameValue && !slugValue && !category) {
      form.setValue('slug', slugify(nameValue));
    }
  }, [nameValue, slugValue, category, form]);

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
                <Input placeholder="Nombre de la categoría" {...field} />
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
                <Input placeholder="nombre-de-categoria" {...field} />
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
                  placeholder="Descripción opcional..."
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
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría padre</FormLabel>
              <Select
                value={field.value || '__none__'}
                onValueChange={(value) => field.onChange(value === '__none__' ? '' : value)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Ninguna (categoría raíz)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="__none__">Ninguna (categoría raíz)</SelectItem>
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
                Deja vacío para crear una categoría de nivel superior.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de imagen</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://..."
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
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Categoría activa</FormLabel>
                <FormDescription>
                  Las categorías inactivas no se muestran en la tienda
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
