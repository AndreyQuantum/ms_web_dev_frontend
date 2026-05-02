import { createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { MinimalLayout } from '@/layouts/MinimalLayout';
import { RequireAdmin } from '@/components/RequireAdmin';
import { HomePage } from '@/pages/HomePage/HomePage';
import { CatalogPage } from '@/pages/CatalogPage/CatalogPage';
import { ProductPage } from '@/pages/ProductPage/ProductPage';
import { AboutPage } from '@/pages/AboutPage/AboutPage';
import { CartPage } from '@/pages/CartPage/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage/CheckoutPage';
import { OrderSuccessPage } from '@/pages/OrderSuccessPage/OrderSuccessPage';
import { AdminLoginPage } from '@/pages/AdminLoginPage/AdminLoginPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage/AdminDashboardPage';
import { AdminProductsPage } from '@/pages/AdminProductsPage/AdminProductsPage';
import { AdminImportPage } from '@/pages/AdminImportPage/AdminImportPage';
import { AdminDictionariesPage } from '@/pages/AdminDictionariesPage/AdminDictionariesPage';

export const routes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/catalog', element: <CatalogPage /> },
      { path: '/product/:id', element: <ProductPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '/order-success', element: <OrderSuccessPage /> },
    ],
  },
  {
    element: <MinimalLayout />,
    children: [
      { path: '/admin/login', element: <AdminLoginPage /> },
    ],
  },
  {
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      { path: '/admin', element: <AdminDashboardPage /> },
      { path: '/admin/products', element: <AdminProductsPage /> },
      { path: '/admin/import', element: <AdminImportPage /> },
      { path: '/admin/dictionaries', element: <AdminDictionariesPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
