import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAddProductSize, useUpdateProductSize, useDeleteProductSize } from '@/hooks/useProducts';
import { ProductSize } from '@/types/database';
import { Plus, Trash2, Loader2 } from 'lucide-react';

const AVAILABLE_SIZES = ['1-2 años', '3-4 años', '5-6 años', '7-8 años', '9-10 años', '11-12 años', '13-14 años'];

interface SizeStockManagerProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  sizes: ProductSize[];
}

export function SizeStockManager({ open, onClose, productId, productName, sizes }: SizeStockManagerProps) {
  const [newSize, setNewSize] = useState('');
  const [newStock, setNewStock] = useState(0);
  
  const addSize = useAddProductSize();
  const updateSize = useUpdateProductSize();
  const deleteSize = useDeleteProductSize();

  const usedSizes = sizes.map(s => s.size);
  const availableSizes = AVAILABLE_SIZES.filter(s => !usedSizes.includes(s));

  const handleAddSize = async () => {
    if (!newSize) return;
    await addSize.mutateAsync({
      product_id: productId,
      size: newSize,
      stock: newStock,
    });
    setNewSize('');
    setNewStock(0);
  };

  const handleUpdateStock = async (sizeId: string, stock: number) => {
    await updateSize.mutateAsync({ id: sizeId, stock });
  };

  const handleDeleteSize = async (sizeId: string) => {
    await deleteSize.mutateAsync(sizeId);
  };

  const totalStock = sizes.reduce((sum, s) => sum + s.stock, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            Inventario: {productName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Total Stock */}
          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Total en inventario</p>
            <p className="text-3xl font-bold text-primary">{totalStock} piezas</p>
          </div>

          {/* Current Sizes */}
          <div className="space-y-2">
            <h4 className="font-medium">Tallas actuales</h4>
            {sizes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay tallas registradas</p>
            ) : (
              <div className="space-y-2">
                {sizes.map((size) => (
                  <div key={size.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                    <span className="flex-1 font-medium">{size.size}</span>
                    <Input
                      type="number"
                      min="0"
                      value={size.stock}
                      onChange={(e) => handleUpdateStock(size.id, parseInt(e.target.value) || 0)}
                      className="w-20 text-center"
                    />
                    <span className="text-sm text-muted-foreground">pzs</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSize(size.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Size */}
          {availableSizes.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Agregar talla</h4>
              <div className="flex gap-2">
                <select
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">Seleccionar talla</option>
                  {availableSizes.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <Input
                  type="number"
                  min="0"
                  value={newStock}
                  onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                  placeholder="Cant."
                  className="w-20"
                />
                <Button
                  onClick={handleAddSize}
                  disabled={!newSize || addSize.isPending}
                >
                  {addSize.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          <Button variant="outline" onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
