import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sale } from '@/types/database';
import { toast } from 'sonner';

export function useSales(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['sales', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('sales')
        .select('*')
        .order('sale_date', { ascending: false });

      if (startDate) {
        query = query.gte('sale_date', startDate);
      }
      if (endDate) {
        query = query.lte('sale_date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Sale[];
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
    mutationFn: async (sale: Omit<Sale, 'id' | 'created_at'>) => {
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
