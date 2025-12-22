-- Corregir políticas de customers (cambiar de RESTRICTIVE a PERMISSIVE)
DROP POLICY IF EXISTS "Admins pueden gestionar clientes" ON public.customers;
DROP POLICY IF EXISTS "Admins pueden ver clientes" ON public.customers;

CREATE POLICY "Admins pueden gestionar clientes" 
ON public.customers 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Corregir políticas de configuracion (cambiar de RESTRICTIVE a PERMISSIVE)
DROP POLICY IF EXISTS "Admins pueden gestionar configuracion" ON public.configuracion;
DROP POLICY IF EXISTS "Cualquiera puede ver configuracion" ON public.configuracion;

CREATE POLICY "Cualquiera puede ver configuracion" 
ON public.configuracion 
FOR SELECT 
USING (true);

CREATE POLICY "Admins pueden gestionar configuracion" 
ON public.configuracion 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));