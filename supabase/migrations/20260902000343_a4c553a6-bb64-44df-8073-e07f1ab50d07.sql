-- 1. Promo codes on profiles
CREATE SEQUENCE IF NOT EXISTS public.referral_code_seq START WITH 101 INCREMENT BY 1;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS promo_code text UNIQUE
  DEFAULT ('SNW-USER-' || nextval('public.referral_code_seq')::text);

UPDATE public.profiles
SET promo_code = 'SNW-USER-' || nextval('public.referral_code_seq')::text
WHERE promo_code IS NULL;

ALTER TABLE public.profiles ALTER COLUMN promo_code SET NOT NULL;

-- 2. Referral fields on orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS referral_code text,
  ADD COLUMN IF NOT EXISTS referrer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS discount_mmk integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS orders_referrer_id_idx ON public.orders (referrer_id);

-- 3. Lookup a promo code owner (public, returns only the owner id)
CREATE OR REPLACE FUNCTION public.referral_lookup(_code text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE upper(promo_code) = upper(trim(_code)) LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION public.referral_lookup(text) TO anon, authenticated, service_role;

-- 4. Verified referral points = completed orders referred by the user
CREATE OR REPLACE FUNCTION public.referral_points(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::int FROM public.orders
  WHERE referrer_id = _user_id AND status = 'completed'
$$;

GRANT EXECUTE ON FUNCTION public.referral_points(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.my_referral_points()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::int FROM public.orders
  WHERE referrer_id = auth.uid() AND status = 'completed'
$$;

GRANT EXECUTE ON FUNCTION public.my_referral_points() TO authenticated, service_role;

-- Admin view of the underlying referred orders
CREATE OR REPLACE FUNCTION public.referred_orders(_user_id uuid)
RETURNS TABLE(id uuid, plan_key text, full_name text, status text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.id, o.plan_key, o.full_name, o.status, o.created_at
  FROM public.orders o
  WHERE o.referrer_id = _user_id
    AND public.has_role(auth.uid(), 'admin'::app_role)
  ORDER BY o.created_at DESC
$$;

GRANT EXECUTE ON FUNCTION public.referred_orders(uuid) TO authenticated, service_role;

-- 5. Referral claims
CREATE TABLE IF NOT EXISTS public.referral_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  promo_code text NOT NULL,
  points_at_claim integer NOT NULL DEFAULT 0,
  full_name text,
  telegram_username text,
  contact_email text,
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.referral_claims TO authenticated;
GRANT UPDATE ON public.referral_claims TO authenticated;
GRANT ALL ON public.referral_claims TO service_role;

ALTER TABLE public.referral_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own claims select" ON public.referral_claims
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "own claims insert" ON public.referral_claims
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "admin claims update" ON public.referral_claims
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER referral_claims_updated_at
  BEFORE UPDATE ON public.referral_claims
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();