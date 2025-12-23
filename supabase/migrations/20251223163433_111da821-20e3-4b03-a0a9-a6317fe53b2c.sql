-- Agregar customer_id a la tabla sales
ALTER TABLE public.sales 
ADD COLUMN customer_id uuid REFERENCES public.customers(id);

-- Crear índice para mejorar consultas
CREATE INDEX idx_sales_customer_id ON public.sales(customer_id);