import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Minus, Plus, MessageCircle, ArrowLeft } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { openWhatsAppWithCart } from '@/lib/whatsapp';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Cart = () => {
  const { items, removeItem, updateQuantity, clearCart, totalItems } = useCart();

  const total = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  const handleWhatsAppPurchase = () => {
    openWhatsAppWithCart(items);
  };

  if (items.length === 0) {
    return (
      <div className="container py-16 text-center">
        <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          Tu carrito está vacío
        </h1>
        <p className="text-muted-foreground mb-6">
          Explora nuestro catálogo y agrega productos
        </p>
        <Link to="/catalogo">
          <Button className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Ver catálogo
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Carrito de Compras
          </h1>
          <p className="text-muted-foreground">{totalItems} productos</p>
        </div>
        <Button variant="outline" onClick={clearCart} className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Vaciar carrito
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={`${item.product.id}-${item.size}`} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                    {item.product.image_url ? (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Talla: {item.size} años
                    </p>
                    <p className="text-lg font-bold text-primary">
                      ${Number(item.product.price).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.product.id, item.size)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                Resumen del Pedido
              </h2>

              <div className="space-y-2 mb-6">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.size}`}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground truncate max-w-[180px]">
                      {item.product.name} ({item.size}) x{item.quantity}
                    </span>
                    <span className="font-medium">
                      ${(Number(item.product.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleWhatsAppPurchase}
                size="lg"
                className="w-full gap-2 bg-[#25D366] hover:bg-[#20BD5A]"
              >
                <MessageCircle className="h-5 w-5" />
                Comprar por WhatsApp
              </Button>

              <Link to="/catalogo" className="block mt-3">
                <Button variant="outline" size="lg" className="w-full gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Seguir comprando
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
