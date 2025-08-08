-- Add customer_email column to reservations table
ALTER TABLE public.reservations 
ADD COLUMN customer_email text;