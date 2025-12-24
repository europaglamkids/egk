-- Create table for additional product images
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Cualquiera puede ver imagenes de productos" 
ON public.product_images 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir todas las operaciones en product_images" 
ON public.product_images 
FOR ALL 
USING (true) 
WITH CHECK (true);