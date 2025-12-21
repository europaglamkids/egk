import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AdminSidebar } from './AdminSidebar';

export function AdminLayout() {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 bg-muted/30">
        <Outlet />
      </main>
    </div>
  );
}
