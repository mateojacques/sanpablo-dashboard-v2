# AGENTS.md - San Pablo Dashboard v2

## Project Overview

Administrative dashboard for an art store/bookstore (San Pablo). This SPA provides management capabilities for:
- **Brand customization**: logos, colors, banners, favicon
- **Content management**: Terms & Conditions, FAQ
- **Product carousels**: Featured product displays with ordering
- **Bulk import tools**: CSV import, DBF conversion, bulk image updates
- **Product management**: CRUD, search, filtering, manual editing

The dashboard consumes a REST API documented at `http://localhost:3000/api/docs`.

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Bundler | Vite | 5.4+ |
| Framework | React | 18.3+ |
| Language | TypeScript | 5.6+ |
| Routing | React Router | 7.x |
| UI Components | shadcn/ui | latest |
| Styling | Tailwind CSS | 3.4+ |
| Server State | TanStack Query | 5.x |
| Client State | Zustand | 4.5+ |
| Forms | React Hook Form | 7.x |
| Validation | Zod | 3.23+ |
| HTTP Client | Axios | 1.7+ |
| Icons | Lucide React | 0.454+ |
| Drag & Drop | @dnd-kit | 6.x |
| Notifications | Sonner | 1.5+ |
| CSV Parsing | PapaParse | 5.4+ |

---

## Project Structure

```
sanpablo-dashboard-v2/
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── App.tsx                 # Root component
│   │   ├── providers.tsx           # All providers (Query, Router)
│   │   └── routes.tsx              # Route definitions
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── MainLayout.tsx      # Main app layout
│   │   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   │   ├── Header.tsx          # Top header bar
│   │   │   └── PageContainer.tsx   # Page wrapper with title
│   │   └── common/
│   │       ├── DataTable.tsx       # Reusable data table
│   │       ├── ConfirmDialog.tsx   # Confirmation modal
│   │       ├── FileUpload.tsx      # File upload component
│   │       ├── ColorPicker.tsx     # Color selection
│   │       ├── EmptyState.tsx      # Empty data state
│   │       └── LoadingSpinner.tsx  # Loading indicator
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api/
│   │   │   │   ├── auth.api.ts     # API functions
│   │   │   │   └── auth.queries.ts # TanStack Query hooks
│   │   │   ├── components/
│   │   │   │   └── LoginForm.tsx
│   │   │   ├── pages/
│   │   │   │   └── LoginPage.tsx
│   │   │   ├── store.ts            # Zustand auth store
│   │   │   └── types.ts
│   │   │
│   │   ├── products/
│   │   │   ├── api/
│   │   │   │   ├── products.api.ts
│   │   │   │   └── products.queries.ts
│   │   │   ├── components/
│   │   │   │   ├── ProductsTable.tsx
│   │   │   │   ├── ProductForm.tsx
│   │   │   │   ├── ProductFilters.tsx
│   │   │   │   └── ProductCard.tsx
│   │   │   ├── pages/
│   │   │   │   ├── ProductsListPage.tsx
│   │   │   │   ├── ProductDetailPage.tsx
│   │   │   │   ├── ProductCreatePage.tsx
│   │   │   │   └── ProductEditPage.tsx
│   │   │   └── types.ts
│   │   │
│   │   ├── categories/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   │   ├── CategoryTree.tsx
│   │   │   │   └── CategoryForm.tsx
│   │   │   ├── pages/
│   │   │   │   └── CategoriesPage.tsx
│   │   │   └── types.ts
│   │   │
│   │   ├── carousels/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   │   ├── CarouselList.tsx
│   │   │   │   ├── CarouselForm.tsx
│   │   │   │   ├── CarouselProducts.tsx
│   │   │   │   └── ProductSelector.tsx
│   │   │   ├── pages/
│   │   │   │   ├── CarouselsPage.tsx
│   │   │   │   └── CarouselEditPage.tsx
│   │   │   └── types.ts
│   │   │
│   │   ├── storefront-config/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   │   ├── BrandingForm.tsx
│   │   │   │   ├── ColorPalette.tsx
│   │   │   │   ├── BannerManager.tsx
│   │   │   │   ├── LogoUploader.tsx
│   │   │   │   └── SeoSettings.tsx
│   │   │   ├── pages/
│   │   │   │   └── StorefrontConfigPage.tsx
│   │   │   └── types.ts
│   │   │
│   │   ├── content/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   │   ├── FaqEditor.tsx
│   │   │   │   ├── FaqItem.tsx
│   │   │   │   ├── TermsEditor.tsx
│   │   │   │   └── ContactForm.tsx
│   │   │   ├── pages/
│   │   │   │   ├── FaqPage.tsx
│   │   │   │   ├── TermsPage.tsx
│   │   │   │   └── ContactPage.tsx
│   │   │   └── types.ts
│   │   │
│   │   └── tools/
│   │       ├── api/
│   │       │   ├── import.api.ts
│   │       │   └── import.queries.ts
│   │       ├── components/
│   │       │   ├── CsvImporter.tsx
│   │       │   ├── DbfConverter.tsx
│   │       │   ├── BulkImageUpdater.tsx
│   │       │   ├── ImportProgress.tsx
│   │       │   ├── ColumnMapper.tsx
│   │       │   └── ImportHistory.tsx
│   │       ├── pages/
│   │       │   ├── ToolsPage.tsx
│   │       │   ├── CsvImportPage.tsx
│   │       │   ├── DbfConvertPage.tsx
│   │       │   └── BulkImagesPage.tsx
│   │       └── types.ts
│   │
│   ├── lib/
│   │   ├── axios.ts                # Axios instance with interceptors
│   │   ├── utils.ts                # cn() and other utilities
│   │   ├── constants.ts            # App constants
│   │   └── validations/
│   │       ├── auth.schema.ts
│   │       ├── product.schema.ts
│   │       ├── category.schema.ts
│   │       ├── carousel.schema.ts
│   │       └── storefront.schema.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts              # Auth hook wrapping store
│   │   ├── useDebounce.ts          # Debounce hook for search
│   │   └── useMediaQuery.ts        # Responsive breakpoints
│   │
│   ├── types/
│   │   ├── api.ts                  # API response types
│   │   └── common.ts               # Shared types
│   │
│   ├── styles/
│   │   └── globals.css             # Tailwind directives + custom styles
│   │
│   └── main.tsx                    # Entry point
│
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── components.json                  # shadcn/ui config
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── AGENTS.md
```

---

## Coding Conventions

### TypeScript

```typescript
// Use type for object shapes, interface for extendable contracts
type Product = {
  id: string;
  name: string;
  sku: string;
  regularPrice: string;
  salePrice: string | null;
  isActive: boolean;
};

// Use const assertions for constants
const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

// Always type function parameters and return types
function formatPrice(price: string): string {
  return `$${parseFloat(price).toFixed(2)}`;
}
```

### React Components

```tsx
// Use function declarations for components
// Props type defined inline or separately for complex props
// Use named exports

type ProductCardProps = {
  product: Product;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">{product.name}</h3>
      <p className="text-muted-foreground">{product.sku}</p>
    </div>
  );
}
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `ProductCard.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useAuth.ts`)
- Utils/API: `camelCase.ts` (e.g., `products.api.ts`)
- Types: `camelCase.ts` (e.g., `types.ts`)
- Pages: `PascalCase.tsx` with `Page` suffix (e.g., `ProductsListPage.tsx`)

### Import Order

```tsx
// 1. React
import { useState, useEffect } from 'react';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

// 3. Internal components/hooks
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

// 4. Feature-specific imports
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../api/products.queries';

// 5. Types
import type { Product } from '../types';
```

---

## API Integration Patterns

### Axios Instance (`src/lib/axios.ts`)

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### API Functions (`src/features/products/api/products.api.ts`)

```typescript
import { api } from '@/lib/axios';
import type { Product, ProductsResponse, CreateProductInput } from '../types';

export const productsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    isActive?: boolean;
  }): Promise<ProductsResponse> => {
    const { data } = await api.get('/api/products', { params });
    return data;
  },

  getById: async (id: string): Promise<{ data: Product }> => {
    const { data } = await api.get(`/api/products/${id}`);
    return data;
  },

  create: async (input: CreateProductInput): Promise<{ data: Product }> => {
    const { data } = await api.post('/api/products', input);
    return data;
  },

  update: async (id: string, input: Partial<CreateProductInput>): Promise<{ data: Product }> => {
    const { data } = await api.put(`/api/products/${id}`, input);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/products/${id}`);
  },
};
```

### TanStack Query Hooks (`src/features/products/api/products.queries.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from './products.api';
import type { CreateProductInput } from '../types';

// Query keys as const for type safety
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// List query with filters
export function useProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
}) {
  return useQuery({
    queryKey: productKeys.list(params ?? {}),
    queryFn: () => productsApi.getAll(params),
  });
}

// Single item query
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
  });
}

// Create mutation
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductInput) => productsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

// Update mutation
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProductInput> }) =>
      productsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
    },
  });
}

// Delete mutation
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
```

---

## Zustand Store Pattern

### Auth Store (`src/features/auth/store.ts`)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = {
  id: string;
  email: string;
  fullName: string;
  role: 'owner' | 'admin';
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
};

type AuthActions = {
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
```

---

## Form Pattern with React Hook Form + Zod

### Validation Schema (`src/lib/validations/product.schema.ts`)

```typescript
import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(255),
  sku: z.string().min(1, 'El SKU es requerido').max(50),
  description: z.string().optional(),
  regularPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Precio invalido'),
  salePrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Precio invalido').nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().default(true),
});

export type ProductFormData = z.infer<typeof productSchema>;
```

### Form Component (`src/features/products/components/ProductForm.tsx`)

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { productSchema, type ProductFormData } from '@/lib/validations/product.schema';

type ProductFormProps = {
  defaultValues?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  isLoading?: boolean;
};

export function ProductForm({ defaultValues, onSubmit, isLoading }: ProductFormProps) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      sku: '',
      description: '',
      regularPrice: '',
      salePrice: null,
      categoryId: null,
      isActive: true,
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Nombre del producto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU</FormLabel>
              <FormControl>
                <Input placeholder="SKU-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* More fields... */}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar'}
        </Button>
      </form>
    </Form>
  );
}
```

---

## API Endpoints Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/me` | Update profile |
| PUT | `/api/auth/password` | Change password |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (paginated, filterable) |
| GET | `/api/products/:id` | Get product by ID |
| GET | `/api/products/sku/:sku` | Get product by SKU |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product (soft) |

**Query params for list:**
- `page` (number): Page number
- `limit` (number): Items per page (default 20)
- `search` (string): Search in name/SKU
- `categoryId` (uuid): Filter by category
- `isActive` (boolean): Filter by active status
- `minPrice` / `maxPrice` (number): Price range

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get category tree |
| GET | `/api/categories/:id` | Get category by ID |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |
| PUT | `/api/categories/reorder` | Reorder categories |

### Carousels
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/carousels` | List all carousels |
| GET | `/api/carousels/:id` | Get carousel with products |
| GET | `/api/carousels/slug/:slug` | Get by slug |
| GET | `/api/carousels/storefront` | Get active for storefront |
| POST | `/api/carousels` | Create carousel |
| PUT | `/api/carousels/:id` | Update carousel |
| DELETE | `/api/carousels/:id` | Delete carousel |
| PUT | `/api/carousels/reorder` | Reorder carousels |
| POST | `/api/carousels/:id/products` | Add products to carousel |
| DELETE | `/api/carousels/:id/products` | Remove products |
| PUT | `/api/carousels/:id/products/reorder` | Reorder products |

### Storefront Config
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/storefront-config` | Get all config |
| PUT | `/api/storefront-config` | Update config |
| PUT | `/api/storefront-config/branding` | Update branding |
| PUT | `/api/storefront-config/colors` | Update colors |
| PUT | `/api/storefront-config/banners` | Update banners |
| PUT | `/api/storefront-config/faq` | Update FAQ |
| PUT | `/api/storefront-config/contact` | Update contact |
| PUT | `/api/storefront-config/seo` | Update SEO |

### Import Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/import-jobs` | List import jobs |
| GET | `/api/import-jobs/:id` | Get job details |
| POST | `/api/import-jobs` | Create import job |
| DELETE | `/api/import-jobs/:id` | Cancel job |

### Orders (for reference)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List orders (admin) |
| GET | `/api/orders/:id` | Get order by ID |
| PUT | `/api/orders/:id/status` | Update order status |

---

## Common Workflows

### Adding a New Feature

1. Create feature folder in `src/features/`
2. Define types in `types.ts`
3. Create API functions in `api/feature.api.ts`
4. Create TanStack Query hooks in `api/feature.queries.ts`
5. Create Zod schema in `src/lib/validations/`
6. Build components in `components/`
7. Create pages in `pages/`
8. Add routes to `src/app/routes.tsx`
9. Add navigation item to Sidebar

### Adding a shadcn/ui Component

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add dialog
# etc.
```

### Creating a Data Table

Use the reusable `DataTable` component with TanStack Table:

```tsx
import { DataTable } from '@/components/common/DataTable';
import { columns } from './columns'; // Define columns separately

function ProductsTable() {
  const { data, isLoading } = useProducts();

  return (
    <DataTable
      columns={columns}
      data={data?.data.items ?? []}
      isLoading={isLoading}
      pagination={{
        page: data?.data.page ?? 1,
        totalPages: data?.data.totalPages ?? 1,
        onPageChange: (page) => setSearchParams({ page: String(page) }),
      }}
    />
  );
}
```

---

## Environment Variables

```env
# .env.example
VITE_API_URL=http://localhost:3000
VITE_APP_NAME="San Pablo Dashboard"
```

---

## Development Checklist

When implementing a feature, ensure:

- [ ] Types are defined
- [ ] API functions handle errors properly
- [ ] Query hooks use proper query keys
- [ ] Mutations invalidate relevant queries
- [ ] Forms have proper validation
- [ ] Loading states are handled
- [ ] Error states are handled
- [ ] Empty states are handled
- [ ] Toast notifications for user feedback
- [ ] Responsive design works
- [ ] Protected routes are used for admin pages

---

## Git Workflow

- `main` - Production branch
- `develop` - Development branch
- Feature branches: `feature/feature-name`
- Bug fixes: `fix/bug-description`

Commit message format:
```
type(scope): description

feat(products): add product filtering by category
fix(auth): handle token expiration properly
chore(deps): update TanStack Query to v5.60
```

---

## Useful Commands

```bash
# Development
npm run dev           # Start dev server

# Build
npm run build         # Production build
npm run preview       # Preview production build

# Linting
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues

# Type checking
npm run typecheck     # Run TypeScript compiler

# shadcn/ui
npx shadcn@latest add [component]
```

---

## Notes for AI Agents

1. **Always use the established patterns** - Follow the API, query, and component patterns shown above
2. **Prefer composition** - Build complex UI from smaller, reusable components
3. **Type everything** - Leverage TypeScript for type safety
4. **Handle all states** - Loading, error, empty, and success states
5. **Use existing components** - Check `src/components/ui/` before creating new ones
6. **Validate inputs** - Use Zod schemas for form validation
7. **Invalidate queries** - After mutations, invalidate relevant queries
8. **Follow file naming** - Use established naming conventions
9. **Keep components focused** - Single responsibility principle
10. **Document complex logic** - Add comments for non-obvious code

When in doubt about API structure, reference the Swagger documentation at `http://localhost:3000/api/docs`.
