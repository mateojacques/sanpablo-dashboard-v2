import { z } from 'zod';

// URL validation helper
const urlSchema = z
  .string()
  .url('URL inválida')
  .nullable()
  .optional()
  .or(z.literal(''));

// Hex color validation
const hexColorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color hexadecimal inválido');

// Branding schema (matches API)
export const brandingSchema = z.object({
  storeName: z
    .string()
    .min(1, 'El nombre de la tienda es requerido')
    .max(100, 'El nombre no puede tener más de 100 caracteres'),
  tagline: z.string().max(200).nullable().optional().or(z.literal('')),
  headerLogoUrl: urlSchema,
  footerLogoUrl: urlSchema,
  faviconUrl: urlSchema,
});

export type BrandingFormData = z.infer<typeof brandingSchema>;

// Colors schema (matches API - using simplified names)
export const colorsSchema = z.object({
  primary: hexColorSchema,
  secondary: hexColorSchema,
  accent: hexColorSchema,
  background: hexColorSchema,
  text: hexColorSchema,
  textMuted: hexColorSchema,
});

export type ColorsFormData = z.infer<typeof colorsSchema>;

// Single banner schema (for slim banners)
export const bannerItemSchema = z.object({
  imageUrl: z.string().url('URL de imagen inválida'),
  altText: z.string().max(200).optional().or(z.literal('')),
  linkUrl: urlSchema,
  isActive: z.boolean().default(true),
  sortOrder: z.number().min(0).optional(),
});

// Hero banner schema (extended with mobile image and CTA fields)
export const heroBannerItemSchema = z.object({
  imageUrl: z.string().url('URL de imagen desktop inválida'),
  mobileImageUrl: z
    .string()
    .url('URL de imagen mobile inválida')
    .optional()
    .or(z.literal('')),
  title: z.string().max(100, 'El título no puede tener más de 100 caracteres').optional().or(z.literal('')),
  subtitle: z.string().max(200, 'El subtítulo no puede tener más de 200 caracteres').optional().or(z.literal('')),
  ctaText: z.string().max(50, 'El texto del botón no puede tener más de 50 caracteres').optional().or(z.literal('')),
  ctaLink: z.string().max(500, 'El enlace del botón es demasiado largo').optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  sortOrder: z.number().min(0).optional(),
});

// Banners config schema (hero and slim banners)
export const bannersSchema = z.object({
  hero: z.array(heroBannerItemSchema),
  slim: z.array(bannerItemSchema),
});

export type BannersFormData = z.infer<typeof bannersSchema>;
export type BannerItemFormData = z.infer<typeof bannerItemSchema>;
export type HeroBannerItemFormData = z.infer<typeof heroBannerItemSchema>;

// Social links schema
export const socialLinksSchema = z.object({
  facebook: urlSchema,
  instagram: urlSchema,
  twitter: urlSchema,
  whatsapp: urlSchema,
  youtube: urlSchema,
  tiktok: urlSchema,
});

// Contact schema (matches API)
export const contactSchema = z.object({
  email: z.string().email('Email inválido').nullable().optional().or(z.literal('')),
  phone: z.string().max(30).nullable().optional().or(z.literal('')),
  whatsappNumber: z.string().max(30).nullable().optional().or(z.literal('')),
  address: z.string().max(500).nullable().optional().or(z.literal('')),
  socialLinks: socialLinksSchema.nullable().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;

// SEO schema (matches API - simplified)
export const seoSchema = z.object({
  metaTitle: z.string().max(70, 'El título no puede tener más de 70 caracteres').nullable().optional().or(z.literal('')),
  metaDescription: z.string().max(160, 'La descripción no puede tener más de 160 caracteres').nullable().optional().or(z.literal('')),
  ogImage: urlSchema,
});

export type SeoFormData = z.infer<typeof seoSchema>;

// Transform helpers for API submission
export function transformBrandingData(data: BrandingFormData) {
  return {
    storeName: data.storeName,
    tagline: data.tagline || null,
    headerLogoUrl: data.headerLogoUrl || null,
    footerLogoUrl: data.footerLogoUrl || null,
    faviconUrl: data.faviconUrl || null,
  };
}

export function transformContactData(data: ContactFormData) {
  return {
    email: data.email || null,
    phone: data.phone || null,
    whatsappNumber: data.whatsappNumber || null,
    address: data.address || null,
    socialLinks: data.socialLinks ? {
      facebook: data.socialLinks.facebook || undefined,
      instagram: data.socialLinks.instagram || undefined,
      twitter: data.socialLinks.twitter || undefined,
      whatsapp: data.socialLinks.whatsapp || undefined,
      youtube: data.socialLinks.youtube || undefined,
      tiktok: data.socialLinks.tiktok || undefined,
    } : null,
  };
}

export function transformSeoData(data: SeoFormData) {
  return {
    metaTitle: data.metaTitle || null,
    metaDescription: data.metaDescription || null,
    ogImage: data.ogImage || null,
  };
}
