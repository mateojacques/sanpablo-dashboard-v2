import type { Timestamps } from '@/types/common';

// FAQ Item (matches API schema from storefront config)
export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
};

// FAQ Response
export type FaqResponse = {
  data: FaqItem[];
};

// Terms & Conditions
export type TermsContent = {
  id: string;
  content: string;
  lastUpdatedBy: string | null;
} & Timestamps;

export type TermsResponse = {
  data: TermsContent;
};

// Input types
export type CreateFaqInput = {
  question: string;
  answer: string;
  sortOrder?: number;
};

export type UpdateFaqInput = Partial<CreateFaqInput>;

export type UpdateTermsInput = {
  content: string;
};
