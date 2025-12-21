import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Configuracion {
  id: string;
  clave: string;
  valor: number;
  created_at: string;
  updated_at: string;
}

export function useExchangeRate() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['exchange-rate'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('configuracion')
        .select('*')
        .eq('clave', 'tasa_dolar')
        .maybeSingle();

      if (error) throw error;
      return data as Configuracion | null;
    },
  });

  // Setup realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('exchange-rate-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'configuracion',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['exchange-rate'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const rate = query.data?.valor ?? 50;

  const convertToBolivares = (usdPrice: number) => {
    return usdPrice * rate;
  };

  return {
    ...query,
    rate,
    convertToBolivares,
  };
}

export function useUpdateExchangeRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newRate: number) => {
      const { data, error } = await supabase
        .from('configuracion')
        .update({ valor: newRate })
        .eq('clave', 'tasa_dolar')
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchange-rate'] });
      toast.success('Tasa de cambio actualizada');
    },
    onError: (error) => {
      toast.error('Error al actualizar tasa: ' + error.message);
    },
  });
}
