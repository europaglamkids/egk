import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/hooks/useCart";
import { AdminAuthProvider } from "@/hooks/useAdminAuth";

import { StoreLayout } from "@/components/layout/StoreLayout";
import { AdminLayout } from "@/components/admin/AdminLayout";

import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminExpenses from "./pages/admin/AdminExpenses";
import AdminSales from "./pages/admin/AdminSales";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AdminAuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Store Routes */}
              <Route element={<StoreLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/catalogo" element={<Catalog />} />
                <Route path="/catalogo/:category" element={<Catalog />} />
                <Route path="/producto/:id" element={<ProductDetail />} />
                <Route path="/carrito" element={<Cart />} />
              </Route>

              {/* Auth */}
              <Route path="/auth" element={<Auth />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="productos" element={<AdminProducts />} />
                <Route path="inventario" element={<AdminInventory />} />
                <Route path="clientes" element={<AdminCustomers />} />
                <Route path="gastos" element={<AdminExpenses />} />
                <Route path="ventas" element={<AdminSales />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AdminAuthProvider>
  </QueryClientProvider>
);

export default App;
