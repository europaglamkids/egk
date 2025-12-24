import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUpdateProduct, useUploadProductImage, useCreateProductWithSizes, useAddProductImages, useDeleteProductImage } from '@/hooks/useProducts';
import { ProductWithSizes, ProductCategory } from '@/types/database';
import { Upload, Loader2, X, Plus, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  price: z.number().min(0, 'El precio debe ser positivo'),
  cost: z.number().min(0, 'El costo debe ser positivo'),
  category: z.enum(['nino', 'nina']),
});

type ProductFormData = z.infer<typeof productSchema>;

interface SizeEntry {
  size: string;
  stock: number;
}

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  product?: ProductWithSizes | null;
}

const AVAILABLE_SIZES = ['2', '4', '6', '8', '10', '12', '14', '16', 'XS', 'S', 'M', 'L', 'XL'];

export function ProductForm({ open, onClose, product }: ProductFormProps) {
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sizes, setSizes] = useState<SizeEntry[]>([]);
  const [newSize, setNewSize] = useState('');
  const [newStock, setNewStock] = useState(0);
  
  const createProductWithSizes = useCreateProductWithSizes();
  const updateProduct = useUpdateProduct();
  const uploadImage = useUploadProductImage();
  const addProductImages = useAddProductImages();
  const deleteProductImage = useDeleteProductImage();

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      cost: 0,
      category: 'nina',
    },
  });

  const category = watch('category');

  // Reset form when dialog opens/closes or product changes
  useEffect(() => {
    if (open) {
      if (product) {
        reset({
          name: product.name,
          description: product.description || '',
          price: product.price,
          cost: product.cost,
          category: product.category,
        });
        setMainImageUrl(product.image_url);
        setAdditionalImages(product.product_images?.map(img => img.image_url) || []);
        setSizes(product.product_sizes?.map(ps => ({ size: ps.size, stock: ps.stock })) || []);
      } else {
        reset({
          name: '',
          description: '',
          price: 0,
          cost: 0,
          category: 'nina',
        });
        setMainImageUrl(null);
        setAdditionalImages([]);
        setSizes([]);
      }
    }
  }, [open, product, reset]);

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage.mutateAsync(file);
      setMainImageUrl(url);
    } finally {
      setUploading(false);
    }
  };

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadImage.mutateAsync(file));
      const urls = await Promise.all(uploadPromises);
      setAdditionalImages(prev => [...prev, ...urls]);
    } finally {
      setUploading(false);
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const addSize = () => {
    if (!newSize) return;
    if (sizes.some(s => s.size === newSize)) {
      return; // Size already exists
    }
    setSizes(prev => [...prev, { size: newSize, stock: newStock }]);
    setNewSize('');
    setNewStock(0);
  };

  const removeSize = (index: number) => {
    setSizes(prev => prev.filter((_, i) => i !== index));
  };

  const updateSizeStock = (index: number, stock: number) => {
    setSizes(prev => prev.map((s, i) => i === index ? { ...s, stock } : s));
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (product) {
        // Update existing product
        await updateProduct.mutateAsync({
          id: product.id,
          ...data,
          image_url: mainImageUrl,
        });

        // Handle additional images for existing product
        const existingImageUrls = product.product_images?.map(img => img.image_url) || [];
        const newImages = additionalImages.filter(url => !existingImageUrls.includes(url));
        
        if (newImages.length > 0) {
          await addProductImages.mutateAsync(
            newImages.map((url, index) => ({
              product_id: product.id,
              image_url: url,
              display_order: existingImageUrls.length + index + 1,
            }))
          );
        }

        // Delete removed images
        const removedImages = product.product_images?.filter(
          img => !additionalImages.includes(img.image_url)
        ) || [];
        
        for (const img of removedImages) {
          await deleteProductImage.mutateAsync(img.id);
        }
      } else {
        // Create new product with sizes and images
        await createProductWithSizes.mutateAsync({
          product: {
            name: data.name,
            description: data.description || null,
            price: data.price,
            cost: data.cost,
            category: data.category,
            image_url: mainImageUrl,
            is_active: true,
          },
          sizes,
          additionalImages,
        });
      }
      
      handleClose();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleClose = () => {
    reset();
    setMainImageUrl(null);
    setAdditionalImages([]);
    setSizes([]);
    setNewSize('');
    setNewStock(0);
    onClose();
  };

  const isLoading = createProductWithSizes.isPending || updateProduct.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-display">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" {...register('description')} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Precio ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register('price', { valueAsNumber: true })}
                  />
                  {errors.price && <p className="text-destructive text-sm">{errors.price.message}</p>}
                </div>

                <div>
                  <Label htmlFor="cost">Costo ($)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    {...register('cost', { valueAsNumber: true })}
                  />
                  {errors.cost && <p className="text-destructive text-sm">{errors.cost.message}</p>}
                </div>
              </div>

              <div>
                <Label>Categoría</Label>
                <Select value={category} onValueChange={(val: ProductCategory) => setValue('category', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nina">Niña</SelectItem>
                    <SelectItem value="nino">Niño</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Main Image */}
            <div>
              <Label>Imagen Principal</Label>
              <div className="mt-2">
                {mainImageUrl ? (
                  <div className="relative">
                    <img src={mainImageUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setMainImageUrl(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    {uploading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="mt-2 text-sm text-muted-foreground">Subir imagen principal</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Additional Images */}
            <div>
              <Label>Imágenes Adicionales</Label>
              <div className="mt-2 space-y-3">
                {additionalImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {additionalImages.map((url, index) => (
                      <div key={index} className="relative">
                        <img src={url} alt={`Additional ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removeAdditionalImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  {uploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Plus className="h-6 w-6 text-muted-foreground" />
                      <span className="mt-1 text-xs text-muted-foreground">Agregar más imágenes</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <Label>Tallas y Stock</Label>
              <div className="mt-2 space-y-3">
                {/* Existing sizes */}
                {sizes.length > 0 && (
                  <div className="space-y-2">
                    {sizes.map((size, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                        <span className="font-medium min-w-[60px]">Talla {size.size}</span>
                        <Input
                          type="number"
                          min="0"
                          value={size.stock}
                          onChange={(e) => updateSizeStock(index, parseInt(e.target.value) || 0)}
                          className="w-24"
                          placeholder="Stock"
                        />
                        <span className="text-sm text-muted-foreground">unidades</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeSize(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new size */}
                <div className="flex items-end gap-2 p-3 border border-dashed border-border rounded-lg">
                  <div className="flex-1">
                    <Label className="text-xs">Talla</Label>
                    <Select value={newSize} onValueChange={setNewSize}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_SIZES.filter(s => !sizes.some(existing => existing.size === s)).map(size => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Label className="text-xs">Stock</Label>
                    <Input
                      type="number"
                      min="0"
                      value={newStock}
                      onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={addSize}
                    disabled={!newSize}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 sticky bottom-0 bg-background">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : product ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
