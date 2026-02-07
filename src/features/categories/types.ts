import type { Timestamps } from '@/types/common';

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  children?: Category[];
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count?: {
    products: number;
    children: number;
  };
} & Timestamps;

export type CategoryTreeItem = Category & {
  children: CategoryTreeItem[];
  level: number;
};

export type CategoriesResponse = {
  data: Category[];
};

export type CategoryResponse = {
  data: Category;
};

export type CreateCategoryInput = {
  name: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  parentId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

// Flatten category tree for select dropdowns
export function flattenCategoryTree(
  categories: Category[],
  level = 0
): { id: string; name: string; level: number }[] {
  const result: { id: string; name: string; level: number }[] = [];

  for (const category of categories) {
    result.push({
      id: category.id,
      name: category.name,
      level,
    });

    if (category.children && category.children.length > 0) {
      result.push(...flattenCategoryTree(category.children, level + 1));
    }
  }

  return result;
}
