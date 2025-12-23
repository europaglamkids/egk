-- Drop existing restrictive policies on sales
DROP POLICY IF EXISTS "Admins pueden gestionar ventas" ON public.sales;
DROP POLICY IF EXISTS "Admins pueden ver ventas" ON public.sales;

-- Create permissive policy for all operations
CREATE POLICY "Permitir todas las operaciones en sales" 
ON public.sales 
FOR ALL 
USING (true) 
WITH CHECK (true);