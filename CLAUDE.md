# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`AGENTS.md` holds the full coding conventions (component/API/query/form patterns, import order, file naming, commit format), the API endpoint reference and the import tools pipeline. Follow it. If it ever disagrees with the code, the code wins; update AGENTS.md when that happens.

## Commands

```bash
npm run dev         # Vite dev server on :5173 (opens browser)
npm run build       # tsc -b && vite build. Type errors fail the build
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint 9 flat config (eslint.config.js)
npm run lint:fix
npx shadcn@latest add <component>   # adds to src/components/ui/
```

There is no test runner or test suite. To verify a change, run `npm run typecheck` and `npm run lint`. `tsconfig.app.json` turns on `strict`, `noUnusedLocals` and `noUnusedParameters`. Unused vars or args fail unless they are prefixed with `_`.

The backend is a separate REST API (`VITE_API_URL`, default `http://localhost:3000`). Swagger docs are at `/api/docs`. The UI is all in Spanish (labels, toasts, validation messages), and numbers use the `es-AR` locale.

## Architecture

- **Entry flow:** `main.tsx` → `app/App.tsx` → `app/providers.tsx` → `app/routes.tsx`. The providers are QueryClient, BrowserRouter, TooltipProvider and Sonner `Toaster`. QueryClient defaults are a 5-minute `staleTime`, 1 retry, no retry on 401, and no refetch on window focus.
- **Routing:** `routes.tsx` holds every route. `ProtectedRoute` wraps `MainLayout` (and all its nested pages), and `PublicRoute` wraps `/login`. Sidebar entries come from `components/layout/navigation.ts`, not from `Sidebar.tsx`. Tool routes use Spanish paths under `/herramientas/...`. The `ROUTES` constant in `lib/constants.ts` is out of date for the tools paths (`/tools/...`), so check `routes.tsx` for the real paths.
- **Feature modules:** each `src/features/<name>/` has `api/<name>.api.ts` (an object of axios calls), `api/<name>.queries.ts` (a query-key factory plus `useQuery`/`useMutation` hooks that invalidate keys), `components/`, `pages/` and `types.ts`. The Zod schemas live centrally in `src/lib/validations/`, not inside the features. Features: auth, dashboard (metrics), products, categories, carousels, orders, storefront-config, content (FAQ/Terms), tools.
- **Auth:** the token is stored twice, in `localStorage['token']` (read by the axios request interceptor) and in the Zustand persisted store `auth-storage` (`features/auth/store.ts`). Keep them in sync through the store's `login`/`logout`/`setToken`, and never write `localStorage` directly. On a 401, the axios response interceptor (`lib/axios.ts`) calls `useAuthStore.getState().logout()` and then `window.location.replace('/login')`, skipping the redirect if already on `/login`. This guards against a redirect loop that was fixed earlier. Use `hooks/useAuth.ts` in components; it adds `isAdmin`/`isOwner`.
- **API response shapes:** single items come back as `{ data: T }`. Paginated list shapes **differ per endpoint**: products return `{ data: [], total, page, limit, totalPages }`, orders return `{ data: [], meta: {...} }`, and imports return `{ data: { items, ... } }`. Check the feature's `types.ts`. `PaginatedResponse` in `types/api.ts` is unused.
- **Storefront config API:** it strips `null`/`undefined` values before sending (`removeNullValues*` in `storefront-config.api.ts`) because the backend rejects nulls in PATCH bodies. Section updates are `PATCH /api/storefront/config/<section>` (branding, colors, banners, faq, contact, seo, legal). The FAQ and Terms pages in `features/content` also go through this config.
- **Tools / import pipeline:**
  - This repo has no DBF parsing. All DBF knowledge (reader, field mapping, CSV format) lives in `sanpablo-api-v2/src/modules/imports/dbf/`.
  - The 1-click import (`OneClickImporter.tsx`) uploads the dropped `.dbf` (100MB max) as-is to `POST /api/imports/dbf`, which converts it and creates a CSV import job. `useImportJob` then polls every 2s while the job status is `pending`/`processing`.
  - The DBF converter (`DbfConverter.tsx`) calls `POST /api/imports/dbf/csv?format=api|raw` and reads the row count from the `X-Row-Count` header.
  - `GET /api/imports/:id/file` serves the file a job imported; the "Archivo importado" panel fetches it on demand.
  - Bulk image updates upload a JSON file to `POST /api/imports/bulk-images`. The default payload is imported from `src/product-images/*.json`.
- **Tables:** there is no generic `DataTable`. Each feature has its own table component (e.g. `ProductsTable.tsx`) built on `components/ui/table` plus `common/Pagination.tsx`, with filters and pagination kept in the URL via `useSearchParams`.
- **Deploy:** `public/_redirects` sends `/* → /index.html 200` (SPA fallback for Netlify/Cloudflare Pages style hosting).
