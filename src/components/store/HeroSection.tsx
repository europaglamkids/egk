import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden brand-gradient">
      <div className="container py-16 md:py-24">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <img
            src={logo}
            alt="Europa Glam Kids"
            className="h-32 md:h-40 w-auto mb-8 animate-float"
          />

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Moda Infantil con{' '}
            <span className="text-primary">Estilo Europeo</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
            Descubre nuestra colección exclusiva de ropa para niños y niñas.
            Calidad, estilo y comodidad en cada prenda.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/catalogo/nino">
              <Button size="lg" className="gap-2 bg-category-boy hover:bg-category-boy/90">
                Ver Niño
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/catalogo/nina">
              <Button size="lg" className="gap-2 bg-category-girl hover:bg-category-girl/90">
                Ver Niña
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2" />
    </section>
  );
}
