import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  title: string;
  category: 'nino' | 'nina';
  imageUrl?: string;
}

export function CategoryCard({ title, category }: CategoryCardProps) {
  return (
    <Link
      to={`/catalogo/${category}`}
      className={cn(
        "group relative block aspect-[4/5] overflow-hidden rounded-2xl",
        "card-shadow card-shadow-hover"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 transition-all duration-500 group-hover:scale-105",
          category === 'nino'
            ? "bg-gradient-to-br from-category-boy/20 to-category-boy/40"
            : "bg-gradient-to-br from-category-girl/20 to-category-girl/40"
        )}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
        <div className={cn(
          "text-7xl mb-4",
          category === 'nino' ? "text-category-boy" : "text-category-girl"
        )}>
          {category === 'nino' ? '👦' : '👧'}
        </div>

        <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
          {title}
        </h3>

        <p className="text-muted-foreground mb-4">
          Ver colección completa
        </p>

        <Button
          variant="outline"
          className={cn(
            "gap-2 group-hover:gap-3 transition-all",
            category === 'nino'
              ? "border-category-boy text-category-boy hover:bg-category-boy hover:text-white"
              : "border-category-girl text-category-girl hover:bg-category-girl hover:text-white"
          )}
        >
          Explorar
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Link>
  );
}

export function CategorySection() {
  return (
    <section className="py-16">
      <div className="container">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
          Nuestras Categorías
        </h2>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          <CategoryCard title="Niño" category="nino" />
          <CategoryCard title="Niña" category="nina" />
        </div>
      </div>
    </section>
  );
}
