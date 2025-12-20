import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from './ProductGrid';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function FeaturedProducts() {
  const { data: products, isLoading } = useProducts();

  const featuredProducts = products?.slice(0, 8) ?? [];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Productos Destacados
          </h2>
          <Link to="/catalogo">
            <Button variant="outline" className="gap-2">
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <ProductGrid products={featuredProducts} isLoading={isLoading} />
      </div>
    </section>
  );
}
