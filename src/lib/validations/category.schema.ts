import { z } from 'zod';

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
  slug: z
    .string()
    .max(100, 'El slug no puede tener más de 100 caracteres')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido (solo letras minúsculas, números y guiones)')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(500, 'La descripción no puede tener más de 500 caracteres')
    .nullable()
    .optional(),
  imageUrl: z
    .string()
    .url('URL de imagen inválida')
    .nullable()
    .optional()
    .or(z.literal('')),
  parentId: z
    .string()
    .uuid('Categoría padre inválida')
    .nullable()
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().default(true),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// Transform empty strings to null for API submission
export function transformCategoryFormData(data: CategoryFormData) {
  return {
    ...data,
    slug: data.slug || undefined,
    description: data.description || null,
    imageUrl: data.imageUrl || null,
    parentId: data.parentId || null,
  };
}
