-- Add delivery_address and estimated_delivery columns to orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivery_address text,
ADD COLUMN IF NOT EXISTS estimated_delivery timestamp with time zone;

-- Enable realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;