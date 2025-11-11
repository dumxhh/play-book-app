-- Create push subscriptions table to store user notification subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can create subscriptions" 
ON public.push_subscriptions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view their subscriptions" 
ON public.push_subscriptions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can delete subscriptions" 
ON public.push_subscriptions 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_push_subscriptions_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();