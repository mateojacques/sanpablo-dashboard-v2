import { z } from 'zod';

// FAQ Item schema (matches API - no isActive field)
export const faqItemSchema = z.object({
  question: z
    .string()
    .min(1, 'La pregunta es requerida')
    .max(500, 'La pregunta no puede tener más de 500 caracteres'),
  answer: z
    .string()
    .min(1, 'La respuesta es requerida')
    .max(5000, 'La respuesta no puede tener más de 5000 caracteres'),
});

export type FaqItemFormData = z.infer<typeof faqItemSchema>;

// Terms & Conditions schema
export const termsSchema = z.object({
  content: z
    .string()
    .min(1, 'El contenido es requerido')
    .max(100000, 'El contenido es demasiado largo'),
});

export type TermsFormData = z.infer<typeof termsSchema>;

// Legal terms markdown schema (allows empty string)
export const legalTermsSchema = z.object({
  termsMarkdown: z.string().max(100000, 'El contenido es demasiado largo'),
});

export type LegalTermsFormData = z.infer<typeof legalTermsSchema>;
