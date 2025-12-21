import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductWithSizes } from '@/types/database';
import { useCart } from '@/hooks/useCart';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { openWhatsAppWithProduct } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: ProductWithSizes;
}

export function ProductCard({ product }: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addItem } = useCart();
  const { convertToBolivares } = useExchangeRate();

  const availableSizes = product.product_sizes.filter(s => s.stock > 0);
  const hasStock = availableSizes.length > 0;
  const priceInBs = convertToBolivares(Number(product.price));

  const handleAddToCart = () => {
    if (selectedSize) {
      addItem(product, selectedSize);
      setSelectedSize(null);
    }
  };

  const handleWhatsApp = () => {
    if (selectedSize) {
      openWhatsAppWithProduct(product.name, selectedSize);
    }
  };

  return (
    <Card className="group overflow-hidden card-shadow card-shadow-hover animate-fade-in">
      <Link to={`/producto/${product.id}`}>
        <div className="aspect-[3/4] overflow-hidden bg-muted">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              <ShoppingBag className="h-16 w-16" />
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-medium text-foreground line-clamp-2">{product.name}</h3>
          <Badge variant={product.category === 'nino' ? 'default' : 'secondary'} className={cn(
            "shrink-0",
            product.category === 'nino' ? 'bg-category-boy' : 'bg-category-girl text-white'
          )}>
            {product.category === 'nino' ? 'Niño' : 'Niña'}
          </Badge>
        </div>

        <div className="mb-3">
          <p className="text-xl font-bold text-primary">
            ${Number(product.price).toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">
            Bs. {priceInBs.toFixed(2)}
          </p>
        </div>

        {hasStock ? (
          <div className="flex flex-wrap gap-1.5">
            {availableSizes.map((size) => (
              <button
                key={size.id}
                onClick={() => setSelectedSize(selectedSize === size.size ? null : size.size)}
                className={cn(
                  "px-2.5 py-1 text-xs rounded-md border transition-all duration-200",
                  selectedSize === size.size
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:border-primary/50"
                )}
              >
                {size.size}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Sin stock</p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          onClick={handleAddToCart}
          disabled={!selectedSize}
          size="sm"
          className="flex-1"
        >
          <ShoppingBag className="h-4 w-4 mr-1" />
          Agregar
        </Button>
        <Button
          onClick={handleWhatsApp}
          disabled={!selectedSize}
          size="sm"
          variant="outline"
          className="bg-[#25D366] hover:bg-[#20BD5A] text-white border-[#25D366] hover:border-[#20BD5A]"
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
