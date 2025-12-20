import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center md:items-start">
            <img src={logo} alt="Europa Glam Kids" className="h-16 w-auto mb-4" />
            <p className="text-sm text-muted-foreground text-center md:text-left">
              Moda infantil con estilo europeo para los más pequeños de la casa.
            </p>
          </div>

          <div className="text-center md:text-left">
            <h4 className="font-display font-semibold text-foreground mb-4">Navegación</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Inicio
              </Link>
              <Link to="/catalogo/nino" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Niño
              </Link>
              <Link to="/catalogo/nina" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Niña
              </Link>
            </nav>
          </div>

          <div className="text-center md:text-left">
            <h4 className="font-display font-semibold text-foreground mb-4">Contacto</h4>
            <p className="text-sm text-muted-foreground">
              WhatsApp: +58 414 025 7059
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Europa Glam Kids. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
