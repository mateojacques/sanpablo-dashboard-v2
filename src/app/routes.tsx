import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';

// Layouts
import { MainLayout } from '@/components/layout/MainLayout';

// Auth pages
import { LoginPage } from '@/features/auth/pages/LoginPage';

// Common pages
import { NotFoundPage } from '@/components/common/NotFoundPage';

// Dashboard pages
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';

// Product pages
import { ProductsListPage } from '@/features/products/pages/ProductsListPage';
import { ProductCreatePage } from '@/features/products/pages/ProductCreatePage';
import { ProductEditPage } from '@/features/products/pages/ProductEditPage';
import { ProductDetailPage } from '@/features/products/pages/ProductDetailPage';

// Category pages
import { CategoriesPage } from '@/features/categories/pages/CategoriesPage';

// Carousel pages
import { CarouselsPage } from '@/features/carousels/pages/CarouselsPage';
import { CarouselEditPage } from '@/features/carousels/pages/CarouselEditPage';

// Storefront config pages
import { StorefrontConfigPage } from '@/features/storefront-config/pages/StorefrontConfigPage';

// Content pages
import { FaqPage } from '@/features/content/pages/FaqPage';
import { TermsPage } from '@/features/content/pages/TermsPage';

// Tools pages
import { ToolsPage } from '@/features/tools/pages/ToolsPage';
import { CsvImportPage } from '@/features/tools/pages/CsvImportPage';
import { ImportDetailPage } from '@/features/tools/pages/ImportDetailPage';
import { DbfConvertPage } from '@/features/tools/pages/DbfConvertPage';
import { BulkImagesPage } from '@/features/tools/pages/BulkImagesPage';
import { OneClickImportPage } from '@/features/tools/pages/OneClickImportPage';

// Order pages
import { OrdersListPage } from '@/features/orders/pages/OrdersListPage';
import { OrderDetailPage } from '@/features/orders/pages/OrderDetailPage';

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
}

// Public Route wrapper (redirects to home if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path={ROUTES.LOGIN}
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        
        {/* Products */}
        <Route path="products" element={<ProductsListPage />} />
        <Route path="products/new" element={<ProductCreatePage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="products/:id/edit" element={<ProductEditPage />} />
        
        {/* Categories */}
        <Route path="categories" element={<CategoriesPage />} />
        
        {/* Carousels */}
        <Route path="carousels" element={<CarouselsPage />} />
        <Route path="carousels/:id" element={<CarouselEditPage />} />
        
        {/* Storefront Config */}
        <Route path="storefront" element={<StorefrontConfigPage />} />
        
        {/* Content */}
        <Route path="content/faq" element={<FaqPage />} />
        <Route path="content/terms" element={<TermsPage />} />
        <Route path="content/contact" element={<div className="p-6">Contact Page (Coming Soon)</div>} />
        
        {/* Tools */}
        <Route path="herramientas" element={<ToolsPage />} />
        <Route path="herramientas/importacion-1-click" element={<OneClickImportPage />} />
        <Route path="herramientas/importaciones" element={<CsvImportPage />} />
        <Route path="herramientas/importaciones/nueva" element={<CsvImportPage />} />
        <Route path="herramientas/importaciones/:id" element={<ImportDetailPage />} />
        <Route path="herramientas/convertir-dbf" element={<DbfConvertPage />} />
        <Route path="herramientas/imagenes" element={<BulkImagesPage />} />
        
        {/* Orders */}
        <Route path="orders" element={<OrdersListPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
