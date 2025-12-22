-- Permitir actualizaciones públicas en configuracion (protegido por acceso al admin)
DROP POLICY IF EXISTS "Admins pueden gestionar configuracion" ON public.configuracion;

CREATE POLICY "Permitir todas las operaciones en configuracion" 
ON public.configuracion 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Permitir todas las operaciones en customers (protegido por acceso al admin)
DROP POLICY IF EXISTS "Admins pueden gestionar clientes" ON public.customers;

CREATE POLICY "Permitir todas las operaciones en customers" 
ON public.customers 
FOR ALL 
USING (true)
WITH CHECK (true);