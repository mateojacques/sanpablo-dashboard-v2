// Branding configuration (matches API schema)
export type BrandingConfig = {
  storeName: string;
  tagline: string | null;
  headerLogoUrl: string | null;
  footerLogoUrl: string | null;
  faviconUrl: string | null;
};

// Color palette configuration (matches API schema)
export type ColorsConfig = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textMuted: string;
};

// Banner item (for slim banners)
export type BannerItem = {
  id?: string;
  imageUrl: string;
  altText?: string;
  linkUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
};

// Hero banner item (extended with mobile image and CTA fields)
export type HeroBannerItem = {
  id?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  isActive?: boolean;
  sortOrder?: number;
};

// Banners configuration (matches API schema)
export type BannersConfig = {
  hero: HeroBannerItem[];
  slim: BannerItem[];
};

// Social links object
export type SocialLinks = {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
};

// Contact configuration (matches API schema)
export type ContactConfig = {
  whatsappNumber: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  socialLinks: SocialLinks | null;
};

// FAQ item
export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
};

// SEO configuration (matches API schema)
export type SeoConfig = {
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
};

// Legal configuration
export type LegalConfig = {
  termsMarkdown: string;
  lastUpdated?: string;
};

// Complete storefront configuration (matches API schema)
export type StorefrontConfig = {
  version: string;
  lastUpdated: string;
  branding: BrandingConfig;
  colors: ColorsConfig;
  banners: BannersConfig;
  faq: FaqItem[];
  contact: ContactConfig;
  seo: SeoConfig;
  legal: LegalConfig;
};

// API Response type
export type StorefrontConfigResponse = {
  data: StorefrontConfig;
};

// Update input types (for PATCH requests)
export type UpdateBrandingInput = Partial<BrandingConfig>;
export type UpdateColorsInput = Partial<ColorsConfig>;
export type UpdateBannersInput = Partial<BannersConfig>;
export type UpdateContactInput = Partial<ContactConfig>;
export type UpdateSeoInput = Partial<SeoConfig>;
export type UpdateFaqInput = {
  faq: Omit<FaqItem, 'id'>[];
};
