-- Crear tabla para fotos de canchas
CREATE TABLE public.court_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sport text NOT NULL,
  image_url text NOT NULL,
  title text,
  description text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.court_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for public viewing
CREATE POLICY "Court photos are viewable by everyone" 
ON public.court_photos 
FOR SELECT 
USING (is_active = true);

-- Create policies for admin management (simplificado para demo)
CREATE POLICY "Anyone can manage court photos" 
ON public.court_photos 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_court_photos_updated_at
BEFORE UPDATE ON public.court_photos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some demo photos
INSERT INTO public.court_photos (sport, image_url, title, description, display_order) VALUES
('futbol', '/api/placeholder/600/400', 'Cancha de Fútbol Principal', 'Cancha de césped sintético de última generación', 1),
('futbol', '/api/placeholder/600/400', 'Cancha de Fútbol 2', 'Segunda cancha con iluminación LED', 2),
('paddle', '/api/placeholder/600/400', 'Cancha de Paddle 1', 'Cancha de paddle con vidrios panorámicos', 1),
('paddle', '/api/placeholder/600/400', 'Cancha de Paddle 2', 'Cancha de paddle climatizada', 2),
('tenis', '/api/placeholder/600/400', 'Cancha de Tenis', 'Cancha de tenis con superficie de polvo de ladrillo', 1),
('golf', '/api/placeholder/600/400', 'Campo de Golf', 'Campo de golf de 9 hoyos par 3', 1);