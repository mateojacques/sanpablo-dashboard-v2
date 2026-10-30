# AGENTS.md - San Pablo Dashboard v2

## Project Overview

Administrative dashboard for an art store/bookstore (San Pablo). This SPA provides management capabilities for:
- **Dashboard metrics**: sales/order overview with date range filtering
- **Product management**: CRUD, search, filtering, manual editing
- **Categories**: category tree with ordering
- **Product carousels**: Featured product displays with ordering
- **Orders**: order list, detail and status updates
- **Brand customization**: logos, colors, banners (including hero banner), contact & social links, SEO
- **Content management**: Terms & Conditions, FAQ
- **Bulk import tools**: 1-click DBF import, CSV import, DBF conversion, bulk image updates

The UI is in Spanish (labels, toasts, validation messages); numbers are formatted with the `es-AR` locale.

The dashboard consumes a REST API documented at `http://localhost:3000/api/docs`.

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Bundler | Vite | 6.x |
| Framework | React | 18.3+ |
| Language | TypeScript | 5.6 |
| Routing | React Router (`react-router-dom`) | 7.x |
| UI Components | shadcn/ui (Radix) | latest |
| Styling | Tailwind CSS | 3.4+ |
| Server State | TanStack Query | 5.x |
| Client State | Zustand | 5.x |
| Forms | React Hook Form | 7.x |
| Validation | Zod | 3.x |
| HTTP Client | Axios | 1.7+ |
| Icons | Lucide React | 0.469+ |
| Drag & Drop | @dnd-kit | core 6.x / sortable 10.x |
| Notifications | Sonner | 1.7+ |
| File Drop | react-dropzone | 14.x |
| CSV Parsing | PapaParse | 5.4+ |
| Dates | date-fns | 4.x |
| Linting | ESLint (flat config) + typescript-eslint | 9.x |

There is no test runner configured.

---

## Project Structure

```
sanpablo-dashboard-v2/
├── public/
│   ├── favicon.svg
│   └── _redirects                  # SPA fallback: /* -> /index.html 200
├── src/
│   ├── app/
│   │   ├── App.tsx                 # Root component
│   │   ├── providers.tsx           # QueryClient, Router, Tooltip, Toaster
│   │   └── routes.tsx              # Route definitions + Protected/Public route guards
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components (auto-generated)
│   │   ├── layout/
│   │   │   ├── MainLayout.tsx      # Main app layout
│   │   │   ├── Sidebar.tsx         # Navigation sidebar (renders navigation.ts)
│   │   │   ├── navigation.ts       # Sidebar sections and items
│   │   │   ├── Header.tsx          # Top header bar
│   │   │   └── PageContainer.tsx   # Page wrapper with title/description/action
│   │   └── common/
│   │       ├── Breadcrumbs.tsx
│   │       ├── ConfirmDialog.tsx   # Confirmation modal
│   │       ├── EmptyState.tsx      # Empty data state
│   │       ├── LoadingSpinner.tsx  # Loading indicator
│   │       ├── NotFoundPage.tsx    # 404 page
│   │       └── Pagination.tsx      # Page + page-size controls
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api/                # auth.api.ts, auth.queries.ts
│   │   │   ├── pages/LoginPage.tsx
│   │   │   ├── store.ts            # Zustand auth store (persisted)
│   │   │   └── types.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── api/                # metrics.api.ts, metrics.queries.ts
│   │   │   ├── components/         # MetricCard, DateRangeFilter
│   │   │   ├── pages/DashboardPage.tsx
│   │   │   └── types.ts
│   │   │
│   │   ├── products/
│   │   │   ├── api/                # products.api.ts, products.queries.ts
│   │   │   ├── components/         # ProductsTable, ProductForm, ProductFilters
│   │   │   ├── pages/              # ProductsList, ProductDetail, ProductCreate, ProductEdit
│   │   │   └── types.ts
│   │   │
│   │   ├── categories/
│   │   │   ├── api/
│   │   │   ├── components/         # CategoryTree, CategoryForm, CategoryDialog
│   │   │   ├── pages/CategoriesPage.tsx
│   │   │   └── types.ts
│   │   │
│   │   ├── carousels/
│   │   │   ├── api/
│   │   │   ├── components/         # CarouselCard, CarouselDialog, CarouselForm,
│   │   │   │                       # CarouselProducts, ProductSelector
│   │   │   ├── pages/              # CarouselsPage, CarouselEditPage
│   │   │   └── types.ts
│   │   │
│   │   ├── orders/
│   │   │   ├── api/
│   │   │   ├── components/         # OrdersTable, OrderFilters
│   │   │   ├── pages/              # OrdersListPage, OrderDetailPage
│   │   │   └── types.ts
│   │   │
│   │   ├── storefront-config/
│   │   │   ├── api/
│   │   │   ├── components/         # BrandingForm, ColorPalette, BannerManager,
│   │   │   │                       # ContactForm, SeoSettings
│   │   │   ├── pages/StorefrontConfigPage.tsx
│   │   │   └── types.ts
│   │   │
│   │   ├── content/                # FAQ & Terms (stored in storefront config)
│   │   │   ├── api/
│   │   │   ├── components/         # FaqEditor, FaqItemDialog, TermsEditor
│   │   │   ├── pages/              # FaqPage, TermsPage
│   │   │   └── types.ts
│   │   │
│   │   └── tools/
│   │       ├── api/                # imports.api.ts, imports.queries.ts
│   │       ├── components/         # OneClickImporter, OneClickImportDebugPanel,
│   │       │                       # CsvImporter, DbfConverter, BulkImageUpdater,
│   │       │                       # ImportProgress, ImportJobsTable
│   │       ├── pages/              # ToolsPage, OneClickImportPage, CsvImportPage,
│   │       │                       # ImportDetailPage, DbfConvertPage, BulkImagesPage
│   │       └── types.ts
│   │
│   ├── lib/
│   │   ├── axios.ts                # Axios instance with interceptors
│   │   ├── utils.ts                # cn() and other utilities
│   │   ├── constants.ts            # App constants (API_URL, ROUTES, PAGINATION, statuses)
│   │   └── validations/            # Zod schemas: auth, product, category, carousel,
│   │                               # storefront, content, bulk-images
│   │
│   ├── hooks/
│   │   ├── useAuth.ts              # Auth hook wrapping store (+ isAdmin / isOwner)
│   │   ├── useDebounce.ts          # Debounce hook for search
│   │   └── useMediaQuery.ts        # Responsive breakpoints
│   │
│   ├── product-images/             # JSON payloads for bulk image updates
│   │
│   ├── types/
│   │   ├── api.ts                  # Generic API response types
│   │   ├── common.ts               # Shared types (Timestamps, ...)
│   │   └── parsedbf.d.ts
│   │
│   ├── styles/
│   │   └── globals.css             # Tailwind directives + custom styles
│   │
│   └── main.tsx                    # Entry point
│
├── .env.example
├── eslint.config.js                 # ESLint 9 flat config
├── .prettierrc
├── components.json                  # shadcn/ui config
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json                    # References tsconfig.app.json / tsconfig.node.json
├── vite.config.ts                   # `@` alias -> src, dev server on 5173
├── AGENTS.md
└── CLAUDE.md
```

---

## Coding Conventions

### TypeScript

`tsconfig.app.json` enables `strict`, `noUnusedLocals` and `noUnusedParameters`. ESLint errors on unused vars; prefix intentionally unused ones with `_`.

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

- Components: `PascalCase.tsx` (e.g., `ProductForm.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useAuth.ts`)
- Utils/API: `camelCase.ts` (e.g., `products.api.ts`)
- Types: `camelCase.ts` (e.g., `types.ts`)
- Pages: `PascalCase.tsx` with `Page` suffix (e.g., `ProductsListPage.tsx`)
- Zod schemas: `kebab-case.schema.ts` (e.g., `bulk-images.schema.ts`)

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
import { ProductsTable } from '../components/ProductsTable';
import { useProducts } from '../api/products.queries';

// 5. Types
import type { Product } from '../types';
```

---

## Routing

All routes live in `src/app/routes.tsx`. Everything except `/login` is nested under `ProtectedRoute` → `MainLayout`; `/login` is wrapped in `PublicRoute` (redirects home when already authenticated).

Tool routes use Spanish paths under `/herramientas/...` (e.g. `/herramientas/importacion-1-click`, `/herramientas/imagenes`, `/herramientas/importaciones/:id`). Note that the `ROUTES` constant in `src/lib/constants.ts` still lists outdated `/tools/...` paths for most tool entries — check `routes.tsx` for the real paths.

Sidebar entries are declared in `src/components/layout/navigation.ts`.

---

## API Integration Patterns

### Axios Instance (`src/lib/axios.ts`)

```typescript
import axios from 'axios';
import { API_URL } from './constants';
import { useAuthStore } from '@/features/auth/store';

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
      // Clear both localStorage token AND Zustand persisted auth state
      // to prevent rehydration from restoring stale credentials
      useAuthStore.getState().logout();

      // Only redirect if not already on login page (avoids redirect loops)
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);
```

The QueryClient (`src/app/providers.tsx`) never retries on 401 and otherwise retries once; `staleTime` is 5 minutes and `refetchOnWindowFocus` is off.

### API Functions (`src/features/products/api/products.api.ts`)

```typescript
import { api } from '@/lib/axios';
import type {
  Product,
  ProductsResponse,
  ProductsListParams,
  CreateProductInput,
  UpdateProductInput,
} from '../types';

export const productsApi = {
  getAll: async (params?: ProductsListParams): Promise<ProductsResponse> => {
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

  update: async (id: string, input: UpdateProductInput): Promise<{ data: Product }> => {
    const { data } = await api.put(`/api/products/${id}`, input);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/products/${id}`);
  },
};
```

Multipart uploads (imports) build a `FormData` and pass `headers: { 'Content-Type': 'multipart/form-data' }`.

### Response Shapes

Single items are `{ data: T }`. **Paginated list shapes differ per endpoint**, so type each one in the feature's `types.ts`:

| Endpoint | Shape |
|----------|-------|
| `GET /api/products` | `{ data: Product[], total, page, limit, totalPages }` |
| `GET /api/orders` | `{ data: Order[], meta: { total, page, limit, totalPages } }` |
| `GET /api/imports` | `{ data: { items: ImportJob[], total, page, limit, totalPages } }` |

`PaginatedResponse<T>` in `src/types/api.ts` matches only the imports shape and is currently unused.

### Null Stripping for Storefront Config

The backend rejects `null` values in storefront config PATCH bodies. `storefront-config.api.ts` runs inputs through `removeNullValues` / `removeNullValuesDeep` (deep is used for nested objects like `socialLinks`) before sending. Do the same for any new storefront config endpoint.

### TanStack Query Hooks (`src/features/products/api/products.queries.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from './products.api';
import type { ProductsListParams, CreateProductInput, UpdateProductInput } from '../types';

// Query keys factory
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductsListParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// List products with filters and pagination
export function useProducts(params?: ProductsListParams) {
  return useQuery({
    queryKey: productKeys.list(params ?? {}),
    queryFn: () => productsApi.getAll(params),
  });
}

// Get single product by ID
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
  });
}

// Create product mutation
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProductInput) => productsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

// Update product mutation
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductInput }) =>
      productsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
    },
  });
}

// Delete product mutation
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

### Polling Long-Running Jobs

`useImportJob` (`src/features/tools/api/imports.queries.ts`) uses a function `refetchInterval` that polls every 2s only while the job status is `pending` or `processing`, then stops. Use the same approach for any other async job.

---

## Zustand Store Pattern

### Auth Store (`src/features/auth/store.ts`)

The token lives in two places: `localStorage['token']` (read by the axios request interceptor) and the persisted `auth-storage` store. Always change it through the store actions so both stay in sync; never write `localStorage['token']` directly. In components use `useAuth()` from `src/hooks/useAuth.ts`.

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from './types';

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
};

type AuthActions = {
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setToken: (token: string) => void;
};

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...initialState,

      login: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('token');
        set(initialState);
      },

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      setToken: (token) => {
        localStorage.setItem('token', token);
        set({ token });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Sync token to localStorage on rehydration
        if (state?.token) {
          localStorage.setItem('token', state.token);
        }
      },
    }
  )
);
```

---

## Form Pattern with React Hook Form + Zod

### Validation Schema (`src/lib/validations/product.schema.ts`)

Optional string fields that come from inputs accept `''` via `.or(z.literal(''))`.

```typescript
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
  imageUrl: z.string().url('URL de imagen inválida').nullable().optional().or(z.literal('')),
  categoryId: z.string().uuid('Categoría inválida').nullable().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  // ...more fields
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

These are the endpoints the dashboard calls (see `src/features/*/api/*.api.ts`).

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/me` | Update profile |
| PUT | `/api/auth/password` | Change password |

### Metrics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/metrics/overview` | Dashboard overview (date range params) |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (paginated, filterable) |
| GET | `/api/products/:id` | Get product by ID |
| GET | `/api/products/sku/:sku` | Get product by SKU |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product (also used to toggle `isActive`) |
| DELETE | `/api/products/:id` | Delete product (soft) |

**Query params for list** (`ProductsListParams`):
- `page` (number): Page number
- `limit` (number): Items per page (default 20)
- `search` (string): Search in name/SKU
- `categoryId` (uuid): Filter by category
- `isActive` (boolean): Filter by active status
- `minPrice` / `maxPrice` (number): Price range
- `sortBy` (`name` | `sku` | `regularPrice` | `createdAt` | `updatedAt`) / `sortOrder` (`asc` | `desc`)

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Get category tree |
| GET | `/api/categories/:id` | Get category by ID |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |
| PUT | `/api/categories/reorder` | Reorder categories (`{ categoryIds }`) |

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
| PUT | `/api/carousels/reorder` | Reorder carousels (`{ carouselIds }`) |
| POST | `/api/carousels/:id/products` | Add products to carousel |
| DELETE | `/api/carousels/:id/products` | Remove products |
| PUT | `/api/carousels/:id/products/reorder` | Reorder products |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List orders (paginated, filterable) |
| GET | `/api/orders/:id` | Get order by ID |
| GET | `/api/orders/number/:orderNumber` | Get order by order number |
| PUT | `/api/orders/:id/status` | Update order status |
| DELETE | `/api/orders/:id` | Delete order |

### Storefront Config
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/storefront/config` | Get all config (public) |
| PUT | `/api/storefront/config` | Update full config |
| PATCH | `/api/storefront/config/branding` | Update branding |
| PATCH | `/api/storefront/config/colors` | Update colors |
| PATCH | `/api/storefront/config/banners` | Update banners |
| PATCH | `/api/storefront/config/faq` | Update FAQ |
| PATCH | `/api/storefront/config/contact` | Update contact & social links |
| PATCH | `/api/storefront/config/seo` | Update SEO |
| PATCH | `/api/storefront/config/legal` | Update Terms & Conditions |

The `content` feature (FAQ / Terms pages) reads and writes through these same endpoints.

### Imports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/imports` | List import jobs (`page`, `limit`, `status`) |
| GET | `/api/imports/:id` | Get job details |
| POST | `/api/imports` | Create import job (multipart CSV `file`) |
| POST | `/api/imports/:id/cancel` | Cancel job |
| GET | `/api/imports/template` | Download CSV template (blob) |
| POST | `/api/imports/bulk-images` | Bulk image update (multipart JSON `file`) |
| POST | `/api/imports/dbf` | Create import job from a DBF (multipart `file`, max 100MB) → `{ data: ImportJob }` |
| POST | `/api/imports/dbf/csv?format=api\|raw` | Convert a DBF to CSV without importing (blob; row count in `X-Row-Count`) |
| GET | `/api/imports/:id/file` | Download the file a job imported (blob) |

---

## Import Tools

- **This repo does no DBF parsing.** All DBF knowledge (reader, field mapping, CSV format) lives in `sanpablo-api-v2/src/modules/imports/dbf/`.
- **1-click import** (`OneClickImporter.tsx`): the user drops a Visual FoxPro `.dbf` (max 100MB, extension checked case-insensitively) and it is uploaded as-is to `POST /api/imports/dbf`, which converts it and creates a CSV import job. Progress is shown by polling the job.
- **DBF converter** (`DbfConverter.tsx`): calls `POST /api/imports/dbf/csv?format=api|raw` (`api` = import columns, `raw` = every DBF column) and previews the first rows with PapaParse.
- **Imported file**: `GET /api/imports/:id/file` serves the exact file a job imported; `OneClickImportDebugPanel` ("Archivo importado", shown by `ImportProgress`) fetches it on demand.
- DBF errors come back as `{ error: { code } }` (`INVALID_DBF`, `DBF_MISSING_FIELDS`, …); show them with `getDbfErrorMessage` from `api/imports.api.ts`.
- **Bulk images** (`BulkImageUpdater.tsx`): uploads a JSON file to `POST /api/imports/bulk-images`; the default payload is imported from `src/product-images/*.json` and validated with `bulk-images.schema.ts`.

---

## Common Workflows

### Adding a New Feature

1. Create feature folder in `src/features/`
2. Define types in `types.ts` (including the exact response shape of each endpoint)
3. Create API functions in `api/<feature>.api.ts`
4. Create TanStack Query hooks in `api/<feature>.queries.ts`
5. Create Zod schema in `src/lib/validations/`
6. Build components in `components/`
7. Create pages in `pages/`
8. Add routes to `src/app/routes.tsx`
9. Add navigation item to `src/components/layout/navigation.ts`

### Adding a shadcn/ui Component

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add dialog
# etc.
```

### Building a List Page with Pagination

There is no generic `DataTable`. Each feature has its own table component (e.g. `ProductsTable.tsx`, `OrdersTable.tsx`) built on `@/components/ui/table`, combined with the shared `Pagination` component. Filters and pagination are kept in the URL with `useSearchParams`:

```tsx
import { useSearchParams } from 'react-router-dom';
import { Pagination } from '@/components/common/Pagination';
import { PageContainer } from '@/components/layout/PageContainer';
import { ProductsTable } from '../components/ProductsTable';
import { useProducts } from '../api/products.queries';

export function ProductsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  // ...derive `filters` from searchParams; handleFiltersChange writes them back
  const { data, isLoading } = useProducts(filters);

  return (
    <PageContainer title="Productos" description="Gestiona el catálogo de productos de la tienda">
      <ProductsTable products={data?.data ?? []} isLoading={isLoading} />
      {data && data.totalPages > 0 && (
        <Pagination
          page={data.page}
          totalPages={data.totalPages}
          totalItems={data.total}
          limit={data.limit}
          onPageChange={(page) => handleFiltersChange({ ...filters, page })}
          onLimitChange={(limit) => handleFiltersChange({ ...filters, limit, page: 1 })}
        />
      )}
    </PageContainer>
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
- [ ] `npm run typecheck` and `npm run lint` pass

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
npm run dev           # Start dev server (http://localhost:5173)

# Build
npm run build         # Type-check (tsc -b) + production build
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
5. **Use existing components** - Check `src/components/ui/` and `src/components/common/` before creating new ones
6. **Validate inputs** - Use Zod schemas for form validation
7. **Invalidate queries** - After mutations, invalidate relevant queries
8. **Follow file naming** - Use established naming conventions
9. **Keep components focused** - Single responsibility principle
10. **Document complex logic** - Add comments for non-obvious code
11. **Verify response shapes** - Paginated shapes differ per endpoint; check the existing feature types or Swagger before assuming one

When in doubt about API structure, reference the Swagger documentation at `http://localhost:3000/api/docs`.
