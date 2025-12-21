-- Create configuracion table for exchange rate
CREATE TABLE public.configuracion (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clave text NOT NULL UNIQUE,
  valor numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;

-- Anyone can read the config (for store display)
CREATE POLICY "Cualquiera puede ver configuracion"
ON public.configuracion
FOR SELECT
USING (true);

-- Only admins can update
CREATE POLICY "Admins pueden gestionar configuracion"
ON public.configuracion
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default exchange rate
INSERT INTO public.configuracion (clave, valor) VALUES ('tasa_dolar', 50);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.configuracion;

-- Trigger for updated_at
CREATE TRIGGER update_configuracion_updated_at
BEFORE UPDATE ON public.configuracion
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();