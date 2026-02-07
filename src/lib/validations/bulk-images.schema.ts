import { z } from 'zod';

// Schema for a single product image entry
export const bulkImageEntrySchema = z.object({
  sku: z.string().min(1, 'El SKU es requerido'),
  image_urls: z
    .array(z.string().url('Las URLs deben ser válidas'))
    .min(1, 'Al menos una URL de imagen es requerida'),
});

// Schema for the entire JSON file (array of entries)
export const bulkImagesJsonSchema = z
  .array(bulkImageEntrySchema)
  .min(1, 'El archivo debe contener al menos un producto');

export type BulkImageEntry = z.infer<typeof bulkImageEntrySchema>;
export type BulkImagesJson = z.infer<typeof bulkImagesJsonSchema>;
