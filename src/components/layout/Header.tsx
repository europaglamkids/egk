import { Link } from 'react-router-dom';
import { ShoppingBag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import logo from '@/assets/logo.png';

export function Header() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Europa Glam Kids" className="h-12 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/catalogo/nino" 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Niño
          </Link>
          <Link 
            to="/catalogo/nina" 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Niña
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/carrito">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
          <Link to="/admin">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
