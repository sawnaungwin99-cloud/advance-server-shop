CREATE TABLE public.stock_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key text NOT NULL,
  username text NOT NULL,
  password text NOT NULL,
  status text NOT NULL DEFAULT 'available',
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  sold_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_accounts TO authenticated;
GRANT ALL ON public.stock_accounts TO service_role;

ALTER TABLE public.stock_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin stock select" ON public.stock_accounts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin stock insert" ON public.stock_accounts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin stock update" ON public.stock_accounts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin stock delete" ON public.stock_accounts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivered_username text,
  ADD COLUMN IF NOT EXISTS delivered_password text;