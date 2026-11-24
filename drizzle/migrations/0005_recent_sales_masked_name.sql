DROP FUNCTION IF EXISTS public.recent_completed_sales();
CREATE FUNCTION public.recent_completed_sales()
RETURNS TABLE(plan_key text, purchased_at timestamptz, buyer_label text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT o.plan_key, o.created_at,
    CASE
      WHEN n.nm IS NULL OR n.nm = '' OR n.nm LIKE 'Telegram (%' OR n.nm = '-' THEN NULL
      WHEN char_length(split_part(n.nm, ' ', 1)) >= 2 AND position(' ' in n.nm) > 0
        THEN split_part(n.nm, ' ', 1) || ' ***'
      ELSE left(n.nm, GREATEST(1, LEAST(3, char_length(n.nm) / 2))) || '***'
    END
  FROM public.orders AS o
  CROSS JOIN LATERAL (SELECT btrim(o.full_name) AS nm) AS n
  WHERE o.status = 'completed'
    AND o.created_at >= now() - interval '7 days' AND o.created_at <= now()
  ORDER BY o.created_at DESC, o.id DESC
  LIMIT 10
$$;
REVOKE ALL ON FUNCTION public.recent_completed_sales() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.recent_completed_sales() TO anon, authenticated, service_role;
COMMENT ON FUNCTION public.recent_completed_sales() IS 'Public completed-purchase feed; returns only plan, time and a server-masked partial buyer name.';