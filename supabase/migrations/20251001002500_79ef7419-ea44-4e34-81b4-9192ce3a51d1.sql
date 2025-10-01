-- Tabla de reseñas de usuarios
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  photos TEXT[], -- Array de URLs de fotos
  sport TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Políticas para reviews
CREATE POLICY "Anyone can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view approved reviews"
  ON public.reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Admins can manage all reviews"
  ON public.reviews FOR ALL
  USING (true);

-- Tabla de reservas recurrentes
CREATE TABLE public.recurring_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  sport TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Domingo, 6 = Sábado
  time TEXT NOT NULL,
  duration INTEGER NOT NULL,
  amount NUMERIC NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  payment_method TEXT DEFAULT 'monthly',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.recurring_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view recurring reservations"
  ON public.recurring_reservations FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create recurring reservations"
  ON public.recurring_reservations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage recurring reservations"
  ON public.recurring_reservations FOR ALL
  USING (true);

-- Tabla de novedades del club
CREATE TABLE public.club_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  cover_image TEXT,
  images TEXT[],
  category TEXT NOT NULL DEFAULT 'general', -- general, interview, event, announcement
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.club_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published news"
  ON public.club_news FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage all news"
  ON public.club_news FOR ALL
  USING (true);

-- Tabla de productos de la tienda
CREATE TABLE public.shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL, -- equipment, rental, merchandising
  sport TEXT,
  images TEXT[],
  stock_quantity INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  is_rental BOOLEAN DEFAULT false,
  rental_duration_hours INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available products"
  ON public.shop_products FOR SELECT
  USING (is_available = true);

CREATE POLICY "Admins can manage all products"
  ON public.shop_products FOR ALL
  USING (true);

-- Tabla de órdenes de la tienda
CREATE TABLE public.shop_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  items JSONB NOT NULL, -- Array de {product_id, quantity, price}
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, completed, cancelled
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create orders"
  ON public.shop_orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view their orders"
  ON public.shop_orders FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage all orders"
  ON public.shop_orders FOR ALL
  USING (true);

-- Trigger para updated_at en reviews
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para updated_at en recurring_reservations
CREATE TRIGGER update_recurring_reservations_updated_at
  BEFORE UPDATE ON public.recurring_reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para updated_at en club_news
CREATE TRIGGER update_club_news_updated_at
  BEFORE UPDATE ON public.club_news
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para updated_at en shop_products
CREATE TRIGGER update_shop_products_updated_at
  BEFORE UPDATE ON public.shop_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para updated_at en shop_orders
CREATE TRIGGER update_shop_orders_updated_at
  BEFORE UPDATE ON public.shop_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();