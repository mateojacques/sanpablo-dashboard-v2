import { z } from 'zod';

export const productSchema = z.object({
  sku: z
    .string()
    .min(1, 'El SKU es requerido')
    .max(50, 'El SKU no puede tener más de 50 caracteres'),
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(255, 'El nombre no puede tener más de 255 caracteres'),
  description: z.string().nullable().optional(),
  regularPrice: z
    .string()
    .min(1, 'El precio es requerido')
    .regex(/^\d+(\.\d{1,2})?$/, 'Precio inválido (ej: 1000 o 1000.50)'),
  salePrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Precio de oferta inválido')
    .nullable()
    .optional()
    .or(z.literal('')),
  specialPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Precio especial inválido')
    .nullable()
    .optional()
    .or(z.literal('')),
  imageUrl: z.string().url('URL de imagen inválida').nullable().optional().or(z.literal('')),
  thumbnailUrl: z.string().url('URL de thumbnail inválida').nullable().optional().or(z.literal('')),
  videoUrl: z.string().url('URL de video inválida').nullable().optional().or(z.literal('')),
  weight: z.string().nullable().optional(),
  dimensionLength: z.string().nullable().optional(),
  dimensionWidth: z.string().nullable().optional(),
  dimensionHeight: z.string().nullable().optional(),
  categoryId: z.string().uuid('Categoría inválida').nullable().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export type ProductFormData = z.infer<typeof productSchema>;

// Transform empty strings to null for API submission
export function transformProductFormData(data: ProductFormData) {
  return {
    ...data,
    salePrice: data.salePrice || null,
    specialPrice: data.specialPrice || null,
    imageUrl: data.imageUrl || null,
    thumbnailUrl: data.thumbnailUrl || null,
    videoUrl: data.videoUrl || null,
    categoryId: data.categoryId || null,
    description: data.description || null,
  };
}
