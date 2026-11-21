CREATE OR REPLACE FUNCTION public.recent_completed_sales()
RETURNS TABLE(plan_key text, purchased_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.plan_key, o.created_at AS purchased_at
  FROM public.orders AS o
  WHERE o.status = 'completed'
    AND o.created_at >= now() - interval '7 days'
    AND o.created_at <= now()
  ORDER BY o.created_at DESC, o.id DESC
  LIMIT 10
$$;
REVOKE ALL ON FUNCTION public.recent_completed_sales() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.recent_completed_sales() TO anon, authenticated, service_role;
COMMENT ON FUNCTION public.recent_completed_sales() IS 'Public anonymous completed-purchase feed; never returns buyer identities, order IDs or credentials.';