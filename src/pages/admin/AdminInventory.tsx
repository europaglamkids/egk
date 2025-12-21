import { useAllProducts } from '@/hooks/useProducts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductWithSizes } from '@/types/database';
import { Package, AlertTriangle, TrendingDown, Loader2 } from 'lucide-react';

const AdminInventory = () => {
  const { data: products, isLoading } = useAllProducts();

  const getTotalStock = (product: ProductWithSizes) => {
    return product.product_sizes?.reduce((sum, s) => sum + s.stock, 0) || 0;
  };

  const ninaProducts = products?.filter(p => p.category === 'nina') || [];
  const ninoProducts = products?.filter(p => p.category === 'nino') || [];

  const calculateCategoryStats = (items: ProductWithSizes[]) => {
    const totalProducts = items.length;
    const totalPieces = items.reduce((sum, p) => sum + getTotalStock(p), 0);
    const outOfStock = items.filter(p => getTotalStock(p) === 0).length;
    const lowStock = items.filter(p => {
      const stock = getTotalStock(p);
      return stock > 0 && stock <= 5;
    }).length;
    const totalValue = items.reduce((sum, p) => sum + (p.price * getTotalStock(p)), 0);
    const totalCost = items.reduce((sum, p) => sum + (p.cost * getTotalStock(p)), 0);

    return { totalProducts, totalPieces, outOfStock, lowStock, totalValue, totalCost };
  };

  const ninaStats = calculateCategoryStats(ninaProducts);
  const ninoStats = calculateCategoryStats(ninoProducts);
  const totalStats = calculateCategoryStats(products || []);

  const InventoryTable = ({ items, title }: { items: ProductWithSizes[]; title: string }) => {
    const sortedItems = [...items].sort((a, b) => getTotalStock(a) - getTotalStock(b));

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No hay productos</p>
          ) : (
            <div className="space-y-3">
              {sortedItems.map(product => {
                const stock = getTotalStock(product);
                const isLow = stock > 0 && stock <= 5;
                const isOut = stock === 0;
                const maxStock = 50; // Reference for progress bar

                return (
                  <div key={product.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{product.name}</span>
                        {isOut && <Badge variant="destructive" className="text-xs">Agotado</Badge>}
                        {isLow && <Badge className="bg-amber-500 text-xs">Bajo</Badge>}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress 
                          value={Math.min((stock / maxStock) * 100, 100)} 
                          className="h-2 flex-1"
                        />
                        <span className="text-sm font-bold w-16 text-right">{stock} pzs</span>
                      </div>
                      
                      {/* Size breakdown */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {product.product_sizes?.map(size => (
                          <span 
                            key={size.id} 
                            className={`text-xs px-2 py-0.5 rounded ${
                              size.stock === 0 ? 'bg-destructive/20 text-destructive' :
                              size.stock <= 2 ? 'bg-amber-100 text-amber-700' :
                              'bg-muted text-muted-foreground'
                            }`}
                          >
                            {size.size}: {size.stock}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold">${(product.price * stock).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Valor</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Inventario</h1>
        <p className="text-muted-foreground">Control de stock y existencias</p>
      </div>

      {/* General Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalStats.totalPieces}</p>
              <p className="text-xs text-muted-foreground">Piezas totales</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingDown className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">${totalStats.totalValue.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Valor en stock</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalStats.lowStock}</p>
              <p className="text-xs text-muted-foreground">Stock bajo</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <Package className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalStats.outOfStock}</p>
              <p className="text-xs text-muted-foreground">Agotados</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Category Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">👧 Niña</h3>
            <Badge variant="secondary">{ninaStats.totalProducts} productos</Badge>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-primary">{ninaStats.totalPieces}</p>
              <p className="text-xs text-muted-foreground">Piezas</p>
            </div>
            <div>
              <p className="text-xl font-bold text-amber-600">{ninaStats.lowStock}</p>
              <p className="text-xs text-muted-foreground">Stock bajo</p>
            </div>
            <div>
              <p className="text-xl font-bold text-destructive">{ninaStats.outOfStock}</p>
              <p className="text-xs text-muted-foreground">Agotados</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">👦 Niño</h3>
            <Badge variant="secondary">{ninoStats.totalProducts} productos</Badge>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-primary">{ninoStats.totalPieces}</p>
              <p className="text-xs text-muted-foreground">Piezas</p>
            </div>
            <div>
              <p className="text-xl font-bold text-amber-600">{ninoStats.lowStock}</p>
              <p className="text-xs text-muted-foreground">Stock bajo</p>
            </div>
            <div>
              <p className="text-xl font-bold text-destructive">{ninoStats.outOfStock}</p>
              <p className="text-xs text-muted-foreground">Agotados</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Inventory */}
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todo</TabsTrigger>
          <TabsTrigger value="nina">👧 Niña</TabsTrigger>
          <TabsTrigger value="nino">👦 Niño</TabsTrigger>
          <TabsTrigger value="low">⚠️ Stock Bajo</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <InventoryTable items={products || []} title="Todos los productos" />
        </TabsContent>
        <TabsContent value="nina">
          <InventoryTable items={ninaProducts} title="Productos para Niña" />
        </TabsContent>
        <TabsContent value="nino">
          <InventoryTable items={ninoProducts} title="Productos para Niño" />
        </TabsContent>
        <TabsContent value="low">
          <InventoryTable 
            items={(products || []).filter(p => {
              const stock = getTotalStock(p);
              return stock <= 5;
            })} 
            title="Productos con stock bajo o agotados" 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminInventory;
