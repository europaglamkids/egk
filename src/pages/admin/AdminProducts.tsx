import { useState } from 'react';
import { useAllProducts, useDeleteProduct, useUpdateProduct } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductForm } from '@/components/admin/ProductForm';
import { SizeStockManager } from '@/components/admin/SizeStockManager';
import { ProductWithSizes } from '@/types/database';
import { 
  Plus, Search, Package, Edit, Trash2, Eye, EyeOff, 
  AlertTriangle, Loader2, LayoutGrid
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const AdminProducts = () => {
  const { data: products, isLoading } = useAllProducts();
  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();
  
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithSizes | null>(null);
  const [managingStock, setManagingStock] = useState<ProductWithSizes | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductWithSizes | null>(null);

  const ninaProducts = products?.filter(p => p.category === 'nina') || [];
  const ninoProducts = products?.filter(p => p.category === 'nino') || [];

  const filterProducts = (items: ProductWithSizes[]) => {
    if (!search) return items;
    return items.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  };

  const getTotalStock = (product: ProductWithSizes) => {
    return product.product_sizes?.reduce((sum, s) => sum + s.stock, 0) || 0;
  };

  const handleToggleActive = async (product: ProductWithSizes) => {
    await updateProduct.mutateAsync({
      id: product.id,
      is_active: !product.is_active,
    });
  };

  const handleDelete = async () => {
    if (deletingProduct) {
      await deleteProduct.mutateAsync(deletingProduct.id);
      setDeletingProduct(null);
    }
  };

  const ProductCard = ({ product }: { product: ProductWithSizes }) => {
    const stock = getTotalStock(product);
    const isLowStock = stock > 0 && stock <= 5;
    const isOutOfStock = stock === 0;

    return (
      <Card className={`overflow-hidden ${!product.is_active ? 'opacity-60' : ''}`}>
        <div className="aspect-square relative">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          
          {/* Status badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {!product.is_active && (
              <Badge variant="secondary">Inactivo</Badge>
            )}
            {isOutOfStock && (
              <Badge variant="destructive">Sin stock</Badge>
            )}
            {isLowStock && (
              <Badge className="bg-amber-500">Stock bajo</Badge>
            )}
          </div>
        </div>

        <CardContent className="p-3">
          <h3 className="font-medium truncate">{product.name}</h3>
          <div className="flex justify-between items-center mt-1">
            <span className="text-lg font-bold text-primary">${product.price}</span>
            <span className="text-sm text-muted-foreground">
              {stock} pzs
            </span>
          </div>
          
          <div className="text-xs text-muted-foreground mt-1">
            Costo: ${product.cost} | Ganancia: ${(product.price - product.cost).toFixed(2)}
          </div>

          <div className="flex gap-1 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setManagingStock(product)}
            >
              <LayoutGrid className="h-3 w-3 mr-1" />
              Stock
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setEditingProduct(product);
                setShowForm(true);
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleToggleActive(product)}
            >
              {product.is_active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => setDeletingProduct(product)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ProductGrid = ({ items, emptyMessage }: { items: ProductWithSizes[]; emptyMessage: string }) => {
    const filtered = filterProducts(items);
    
    if (filtered.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  };

  // Stats
  const totalProducts = products?.length || 0;
  const totalStock = products?.reduce((sum, p) => sum + getTotalStock(p), 0) || 0;
  const lowStockProducts = products?.filter(p => {
    const stock = getTotalStock(p);
    return stock > 0 && stock <= 5;
  }).length || 0;
  const outOfStockProducts = products?.filter(p => getTotalStock(p) === 0).length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground">Gestiona el inventario de la tienda</p>
        </div>
        <Button onClick={() => { setEditingProduct(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalProducts}</p>
              <p className="text-xs text-muted-foreground">Productos</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/50 rounded-lg">
              <LayoutGrid className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalStock}</p>
              <p className="text-xs text-muted-foreground">Piezas totales</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{lowStockProducts}</p>
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
              <p className="text-2xl font-bold">{outOfStockProducts}</p>
              <p className="text-xs text-muted-foreground">Sin stock</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products by Category */}
      <Tabs defaultValue="nina" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="nina" className="gap-2">
            👧 Niña
            <Badge variant="secondary">{ninaProducts.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="nino" className="gap-2">
            👦 Niño
            <Badge variant="secondary">{ninoProducts.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nina">
          <ProductGrid items={ninaProducts} emptyMessage="No hay productos para niña" />
        </TabsContent>

        <TabsContent value="nino">
          <ProductGrid items={ninoProducts} emptyMessage="No hay productos para niño" />
        </TabsContent>
      </Tabs>

      {/* Forms and Modals */}
      <ProductForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditingProduct(null); }}
        product={editingProduct}
      />

      {managingStock && (
        <SizeStockManager
          open={!!managingStock}
          onClose={() => setManagingStock(null)}
          productId={managingStock.id}
          productName={managingStock.name}
          sizes={managingStock.product_sizes || []}
        />
      )}

      <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto "{deletingProduct?.name}" será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProducts;
