import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sale, SaleWithCustomer } from '@/types/database';
import { toast } from 'sonner';

export function useSales(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['sales', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('sales')
        .select(`
          *,
          customer:customers(*)
        `)
        .order('sale_date', { ascending: false });

      if (startDate) {
        query = query.gte('sale_date', startDate);
      }
      if (endDate) {
        query = query.lte('sale_date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as SaleWithCustomer[];
    },
  });
}

export function useTotalSales() {
  return useQuery({
    queryKey: ['sales', 'total'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('total_amount');

      if (error) throw error;
      return (data as { total_amount: number }[]).reduce(
        (sum, sale) => sum + Number(sale.total_amount),
        0
      );
    },
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sale: Omit<Sale, 'id' | 'created_at' | 'sale_date'>) => {
      const { data, error } = await supabase
        .from('sales')
        .insert(sale)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast.success('Venta registrada exitosamente');
    },
    onError: (error) => {
      toast.error('Error al registrar venta: ' + error.message);
    },
  });
}

// Hook para crear venta y actualizar stock automáticamente
export function useCreateSaleWithStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sale: {
      product_id: string;
      product_name: string;
      size: string;
      quantity: number;
      unit_price: number;
      total_amount: number;
      customer_id?: string;
    }) => {
      // 1. Obtener el product_size actual
      const { data: productSize, error: sizeError } = await supabase
        .from('product_sizes')
        .select('*')
        .eq('product_id', sale.product_id)
        .eq('size', sale.size)
        .single();

      if (sizeError) throw new Error('Error al obtener stock del producto');
      if (!productSize) throw new Error('Talla no encontrada');
      if (productSize.stock < sale.quantity) throw new Error('Stock insuficiente');

      // 2. Actualizar el stock
      const newStock = productSize.stock - sale.quantity;
      const { error: updateError } = await supabase
        .from('product_sizes')
        .update({ stock: newStock })
        .eq('id', productSize.id);

      if (updateError) throw new Error('Error al actualizar stock');

      // 3. Crear la venta
      const { data, error } = await supabase
        .from('sales')
        .insert({
          product_id: sale.product_id,
          product_name: sale.product_name,
          size: sale.size,
          quantity: sale.quantity,
          unit_price: sale.unit_price,
          total_amount: sale.total_amount,
          customer_id: sale.customer_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Venta registrada y stock actualizado');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });
}

export function useDeleteSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast.success('Venta eliminada');
    },
    onError: (error) => {
      toast.error('Error al eliminar: ' + error.message);
    },
  });
}
