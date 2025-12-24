import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductWithSizes, ProductSize, ProductCategory, ProductImage } from '@/types/database';
import { toast } from 'sonner';

export function useProducts(category?: ProductCategory) {
  return useQuery({
    queryKey: ['products', category],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          product_sizes (*),
          product_images (*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ProductWithSizes[];
    },
  });
}

export function useAllProducts() {
  return useQuery({
    queryKey: ['products', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_sizes (*),
          product_images (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProductWithSizes[];
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_sizes (*),
          product_images (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ProductWithSizes;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto creado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear producto: ' + error.message);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...product }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto actualizado');
    },
    onError: (error) => {
      toast.error('Error al actualizar: ' + error.message);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto eliminado');
    },
    onError: (error) => {
      toast.error('Error al eliminar: ' + error.message);
    },
  });
}

export function useAddProductSize() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (size: Omit<ProductSize, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('product_sizes')
        .insert(size)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      toast.error('Error al agregar talla: ' + error.message);
    },
  });
}

export function useUpdateProductSize() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      const { data, error } = await supabase
        .from('product_sizes')
        .update({ stock })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProductSize() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_sizes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUploadProductImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      return publicUrl;
    },
    onError: (error) => {
      toast.error('Error al subir imagen: ' + error.message);
    },
  });
}

export function useAddProductImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (images: Omit<ProductImage, 'id' | 'created_at'>[]) => {
      const { data, error } = await supabase
        .from('product_images')
        .insert(images)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useCreateProductWithSizes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      product, 
      sizes, 
      additionalImages 
    }: { 
      product: Omit<Product, 'id' | 'created_at' | 'updated_at'>; 
      sizes: { size: string; stock: number }[];
      additionalImages: string[];
    }) => {
      // Create product
      const { data: createdProduct, error: productError } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (productError) throw productError;

      // Add sizes if any
      if (sizes.length > 0) {
        const sizesData = sizes.map(s => ({
          product_id: createdProduct.id,
          size: s.size,
          stock: s.stock,
        }));

        const { error: sizesError } = await supabase
          .from('product_sizes')
          .insert(sizesData);

        if (sizesError) throw sizesError;
      }

      // Add additional images if any
      if (additionalImages.length > 0) {
        const imagesData = additionalImages.map((url, index) => ({
          product_id: createdProduct.id,
          image_url: url,
          display_order: index + 1,
        }));

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imagesData);

        if (imagesError) throw imagesError;
      }

      return createdProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto creado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear producto: ' + error.message);
    },
  });
}
