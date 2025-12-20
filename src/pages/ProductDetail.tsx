import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, MessageCircle, Minus, Plus } from 'lucide-react';
import { useProduct } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { openWhatsAppWithProduct } from '@/lib/whatsapp';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useProduct(id || '');
  const { addItem } = useCart();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const availableSizes = product?.product_sizes.filter(s => s.stock > 0) ?? [];

  const handleAddToCart = () => {
    if (product && selectedSize) {
      for (let i = 0; i < quantity; i++) {
        addItem(product, selectedSize);
      }
      setSelectedSize(null);
      setQuantity(1);
    }
  };

  const handleWhatsApp = () => {
    if (product && selectedSize) {
      openWhatsAppWithProduct(product.name, selectedSize);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-8 text-center">
        <p className="text-muted-foreground">Producto no encontrado</p>
        <Link to="/catalogo">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al catálogo
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Link
        to="/catalogo"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al catálogo
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="aspect-square overflow-hidden rounded-2xl bg-muted card-shadow">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              <ShoppingBag className="h-24 w-24" />
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              {product.name}
            </h1>
            <Badge className={cn(
              "shrink-0",
              product.category === 'nino' ? 'bg-category-boy' : 'bg-category-girl text-white'
            )}>
              {product.category === 'nino' ? 'Niño' : 'Niña'}
            </Badge>
          </div>

          <p className="text-3xl font-bold text-primary mb-6">
            ${Number(product.price).toFixed(2)}
          </p>

          {product.description && (
            <p className="text-muted-foreground mb-6">{product.description}</p>
          )}

          <div className="mb-6">
            <h3 className="font-medium text-foreground mb-3">Selecciona una talla:</h3>
            {availableSizes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size.size)}
                    className={cn(
                      "px-4 py-2 text-sm rounded-lg border transition-all duration-200",
                      selectedSize === size.size
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:border-primary/50"
                    )}
                  >
                    {size.size} años
                    <span className="ml-1 text-xs opacity-70">
                      ({size.stock} disp.)
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Sin stock disponible</p>
            )}
          </div>

          {selectedSize && (
            <div className="mb-6">
              <h3 className="font-medium text-foreground mb-3">Cantidad:</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-medium w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-auto">
            <Button
              onClick={handleAddToCart}
              disabled={!selectedSize}
              size="lg"
              className="flex-1 gap-2"
            >
              <ShoppingBag className="h-5 w-5" />
              Agregar al carrito
            </Button>
            <Button
              onClick={handleWhatsApp}
              disabled={!selectedSize}
              size="lg"
              className="flex-1 gap-2 bg-[#25D366] hover:bg-[#20BD5A]"
            >
              <MessageCircle className="h-5 w-5" />
              Comprar por WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
