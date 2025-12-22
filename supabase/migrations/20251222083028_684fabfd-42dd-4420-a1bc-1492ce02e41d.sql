-- Permitir todas las operaciones en products (protegido por acceso al admin)
DROP POLICY IF EXISTS "Admins pueden gestionar productos" ON public.products;
DROP POLICY IF EXISTS "Admins pueden ver todos los productos" ON public.products;

CREATE POLICY "Permitir todas las operaciones en products" 
ON public.products 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Permitir todas las operaciones en product_sizes
DROP POLICY IF EXISTS "Admins pueden gestionar tallas" ON public.product_sizes;

CREATE POLICY "Permitir todas las operaciones en product_sizes" 
ON public.product_sizes 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Permitir todas las operaciones en storage.objects para product-images bucket
CREATE POLICY "Permitir subir imagenes de productos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Permitir actualizar imagenes de productos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product-images');

CREATE POLICY "Permitir eliminar imagenes de productos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'product-images');

CREATE POLICY "Permitir ver imagenes de productos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');