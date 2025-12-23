import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAllProducts } from '@/hooks/useProducts';
import { useCustomers, useCreateCustomer } from '@/hooks/useCustomers';
import { useCreateSaleWithStock } from '@/hooks/useSales';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { ProductWithSizes, Customer } from '@/types/database';
import { Loader2, Plus, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const saleSchema = z.object({
  customerName: z.string().min(1, 'Nombre del cliente requerido'),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  productId: z.string().min(1, 'Seleccione un producto'),
  size: z.string().min(1, 'Seleccione una talla'),
  quantity: z.coerce.number().min(1, 'Cantidad mínima: 1'),
});

type SaleFormData = z.infer<typeof saleSchema>;

interface SaleFormProps {
  open: boolean;
  onClose: () => void;
}

export function SaleForm({ open, onClose }: SaleFormProps) {
  const { data: products, isLoading: loadingProducts } = useAllProducts();
  const { data: customers, isLoading: loadingCustomers } = useCustomers();
  const createCustomer = useCreateCustomer();
  const createSale = useCreateSaleWithStock();
  const { rate } = useExchangeRate();

  const [selectedProduct, setSelectedProduct] = useState<ProductWithSizes | null>(null);
  const [availableSizes, setAvailableSizes] = useState<{ size: string; stock: number }[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      productId: '',
      size: '',
      quantity: 1,
    },
  });

  const watchProductId = form.watch('productId');
  const watchSize = form.watch('size');
  const watchQuantity = form.watch('quantity');

  useEffect(() => {
    if (watchProductId && products) {
      const product = products.find(p => p.id === watchProductId);
      setSelectedProduct(product || null);
      setAvailableSizes(product?.product_sizes.filter(s => s.stock > 0) || []);
      form.setValue('size', '');
    }
  }, [watchProductId, products, form]);

  const selectedSizeStock = availableSizes.find(s => s.size === watchSize)?.stock || 0;
  const unitPrice = selectedProduct?.price || 0;
  const totalAmount = unitPrice * (watchQuantity || 0);
  const totalBs = totalAmount * rate;

  const handleCustomerSelect = (customerId: string) => {
    if (customerId === 'new') {
      setIsNewCustomer(true);
      setSelectedCustomer(null);
      form.setValue('customerName', '');
      form.setValue('customerPhone', '');
      form.setValue('customerEmail', '');
    } else {
      const customer = customers?.find(c => c.id === customerId);
      if (customer) {
        setIsNewCustomer(false);
        setSelectedCustomer(customer);
        form.setValue('customerName', customer.name);
        form.setValue('customerPhone', customer.phone || '');
        form.setValue('customerEmail', customer.email || '');
      }
    }
  };

  const onSubmit = async (data: SaleFormData) => {
    if (!selectedProduct) return;

    try {
      let customerId = selectedCustomer?.id;

      // Si es un cliente nuevo, crearlo primero
      if (isNewCustomer || !customerId) {
        const existingCustomer = customers?.find(
          c => c.name.toLowerCase() === data.customerName.toLowerCase()
        );

        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          const newCustomer = await createCustomer.mutateAsync({
            name: data.customerName,
            phone: data.customerPhone || null,
            email: data.customerEmail || null,
            address: null,
            notes: null,
          });
          customerId = newCustomer.id;
        }
      }

      // Crear la venta y actualizar stock
      await createSale.mutateAsync({
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        size: data.size,
        quantity: data.quantity,
        unit_price: unitPrice,
        total_amount: totalAmount,
        customer_id: customerId,
      });

      form.reset();
      setSelectedProduct(null);
      setSelectedCustomer(null);
      setIsNewCustomer(false);
      onClose();
    } catch (error) {
      console.error('Error al procesar venta:', error);
    }
  };

  const isSubmitting = createCustomer.isPending || createSale.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Nueva Venta / Recibo</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Sección Cliente */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Datos del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Seleccionar Cliente</Label>
                  <Select onValueChange={handleCustomerSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Buscar cliente existente o crear nuevo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">
                        <span className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Nuevo Cliente
                        </span>
                      </SelectItem>
                      {customers?.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} {customer.phone && `- ${customer.phone}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nombre del cliente" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="0414-1234567" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="correo@ejemplo.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sección Producto */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Producto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seleccionar Producto *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Buscar producto..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products?.filter(p => p.product_sizes.some(s => s.stock > 0)).map(product => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - ${product.price.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedProduct && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Talla *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar talla" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableSizes.map(size => (
                                <SelectItem key={size.size} value={size.size}>
                                  {size.size} (Stock: {size.stock})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cantidad * (Máx: {selectedSizeStock})</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min={1}
                              max={selectedSizeStock}
                              onChange={e => {
                                const val = parseInt(e.target.value);
                                if (val <= selectedSizeStock) {
                                  field.onChange(val);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumen */}
            {selectedProduct && watchSize && watchQuantity > 0 && (
              <Card className="bg-muted/50">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Resumen de Venta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Producto:</span>
                      <span className="font-medium">{selectedProduct.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Talla:</span>
                      <span className="font-medium">{watchSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cantidad:</span>
                      <span className="font-medium">{watchQuantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Precio unitario:</span>
                      <span className="font-medium">${unitPrice.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <div className="text-right">
                        <div className="text-primary">${totalAmount.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">Bs. {totalBs.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrar Venta
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
