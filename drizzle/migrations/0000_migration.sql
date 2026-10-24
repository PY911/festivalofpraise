CREATE TABLE public.merch_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  customer_name text NOT NULL CHECK (char_length(customer_name) BETWEEN 2 AND 100),
  phone text NOT NULL CHECK (char_length(phone) BETWEEN 7 AND 20),
  notes text CHECK (notes IS NULL OR char_length(notes) <= 500),
  items jsonb NOT NULL,
  total_ghs numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'new'
);
GRANT INSERT ON public.merch_orders TO anon, authenticated;
GRANT ALL ON public.merch_orders TO service_role;
ALTER TABLE public.merch_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can place an order" ON public.merch_orders FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'new' AND jsonb_typeof(items) = 'array' AND jsonb_array_length(items) BETWEEN 1 AND 50);