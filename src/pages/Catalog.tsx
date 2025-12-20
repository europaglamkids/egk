import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/store/ProductGrid';
import { SizeFilter } from '@/components/store/SizeFilter';
import { ProductCategory } from '@/types/database';
import { cn } from '@/lib/utils';

const Catalog = () => {
  const { category } = useParams<{ category?: string }>();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const categoryValue = category === 'nino' || category === 'nina'
    ? category as ProductCategory
    : undefined;

  const { data: products, isLoading } = useProducts(categoryValue);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!selectedSize) return products;

    return products.filter(product =>
      product.product_sizes.some(size =>
        size.size === selectedSize && size.stock > 0
      )
    );
  }, [products, selectedSize]);

  const pageTitle = category === 'nino'
    ? 'Ropa para Niño'
    : category === 'nina'
      ? 'Ropa para Niña'
      : 'Catálogo Completo';

  return (
    <div className="py-8">
      <div className="container">
        <header className="mb-8">
          <h1 className={cn(
            "font-display text-3xl md:text-4xl font-bold mb-2",
            category === 'nino' && 'text-category-boy',
            category === 'nina' && 'text-category-girl',
            !category && 'text-foreground'
          )}>
            {pageTitle}
          </h1>
          <p className="text-muted-foreground">
            {filteredProducts.length} productos disponibles
          </p>
        </header>

        <div className="mb-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Filtrar por talla:</h3>
          <SizeFilter selectedSize={selectedSize} onSelectSize={setSelectedSize} />
        </div>

        <ProductGrid products={filteredProducts} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Catalog;
