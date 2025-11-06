-- Create helper function for updated_at if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create reservations table if not exists
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  date DATE NOT NULL,
  is_blocked BOOLEAN DEFAULT false,
  refund_amount NUMERIC NULL DEFAULT 0,
  duration INTEGER NOT NULL,
  refund_date TIMESTAMPTZ NULL,
  amount NUMERIC NOT NULL,
  sport TEXT NOT NULL,
  time TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  customer_email TEXT NULL,
  internal_notes TEXT NULL,
  blocked_reason TEXT NULL,
  refund_status TEXT NULL DEFAULT 'none'
);

-- Enable RLS and policies for reservations
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'reservations' AND policyname = 'Anyone can create reservations'
  ) THEN
    CREATE POLICY "Anyone can create reservations"
      ON public.reservations
      FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'reservations' AND policyname = 'Anyone can update reservations'
  ) THEN
    CREATE POLICY "Anyone can update reservations"
      ON public.reservations
      FOR UPDATE
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'reservations' AND policyname = 'Anyone can view reservations'
  ) THEN
    CREATE POLICY "Anyone can view reservations"
      ON public.reservations
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- Trigger for reservations.updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_reservations_updated_at'
  ) THEN
    CREATE TRIGGER trg_reservations_updated_at
    BEFORE UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Create transactions table if not exists
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount NUMERIC NOT NULL,
  reservation_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  mercadopago_payment_id TEXT NULL,
  mercadopago_preference_id TEXT NULL,
  currency TEXT NOT NULL DEFAULT 'ARS',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NULL
);

-- Enable RLS and policies for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'transactions' AND policyname = 'Anyone can create transactions'
  ) THEN
    CREATE POLICY "Anyone can create transactions"
      ON public.transactions
      FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'transactions' AND policyname = 'Anyone can update transactions'
  ) THEN
    CREATE POLICY "Anyone can update transactions"
      ON public.transactions
      FOR UPDATE
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'transactions' AND policyname = 'Anyone can view transactions'
  ) THEN
    CREATE POLICY "Anyone can view transactions"
      ON public.transactions
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- Trigger for transactions.updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_transactions_updated_at'
  ) THEN
    CREATE TRIGGER trg_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;