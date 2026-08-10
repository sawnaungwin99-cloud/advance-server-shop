CREATE OR REPLACE FUNCTION public.plan_sales_counts()
RETURNS TABLE (plan_key text, sold bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.plan_key, count(*)::bigint AS sold
  FROM public.orders o
  WHERE o.status = 'completed'
  GROUP BY o.plan_key
$$;

GRANT EXECUTE ON FUNCTION public.plan_sales_counts() TO anon, authenticated, service_role;