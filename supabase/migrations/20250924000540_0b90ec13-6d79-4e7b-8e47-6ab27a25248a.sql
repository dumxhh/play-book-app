-- Crear tabla para torneos
CREATE TABLE public.tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  club_name TEXT NOT NULL,
  sport TEXT NOT NULL,
  court_type TEXT,
  tournament_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  participants_count INTEGER NOT NULL DEFAULT 0,
  max_participants INTEGER,
  entry_fee NUMERIC NOT NULL DEFAULT 0,
  total_prize NUMERIC DEFAULT 0,
  description TEXT,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

-- Políticas para torneos
CREATE POLICY "Anyone can view tournaments" 
ON public.tournaments 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create tournaments" 
ON public.tournaments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update tournaments" 
ON public.tournaments 
FOR UPDATE 
USING (true);

-- Agregar columnas adicionales a reservations para funcionalidades del admin
ALTER TABLE public.reservations 
ADD COLUMN IF NOT EXISTS internal_notes TEXT,
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS blocked_reason TEXT,
ADD COLUMN IF NOT EXISTS refund_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_status TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS refund_date TIMESTAMP WITH TIME ZONE;

-- Crear tabla para bloqueos de horarios
CREATE TABLE public.time_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sport TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT NOT NULL,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;

-- Políticas para bloqueos
CREATE POLICY "Anyone can manage time blocks" 
ON public.time_blocks 
FOR ALL 
USING (true);

-- Trigger para actualizar updated_at en tournaments
CREATE TRIGGER update_tournaments_updated_at
BEFORE UPDATE ON public.tournaments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para actualizar updated_at en time_blocks
CREATE TRIGGER update_time_blocks_updated_at
BEFORE UPDATE ON public.time_blocks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();