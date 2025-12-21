import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, DollarSign, TrendingUp, LogOut, Store, Users, Warehouse } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/productos', icon: Package, label: 'Productos' },
  { href: '/admin/inventario', icon: Warehouse, label: 'Inventario' },
  { href: '/admin/clientes', icon: Users, label: 'Clientes' },
  { href: '/admin/gastos', icon: DollarSign, label: 'Gastos' },
  { href: '/admin/ventas', icon: TrendingUp, label: 'Ventas' },
];

export function AdminSidebar() {
  const location = useLocation();
  const { logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <img src={logo} alt="Europa Glam Kids" className="h-12 mx-auto" />
        <p className="text-xs text-center text-muted-foreground mt-2">Panel Admin</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              location.pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <Link to="/">
          <Button variant="outline" className="w-full gap-2">
            <Store className="h-4 w-4" />
            Ver Tienda
          </Button>
        </Link>
        <Button variant="ghost" onClick={handleLogout} className="w-full gap-2 text-muted-foreground">
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  );
}
