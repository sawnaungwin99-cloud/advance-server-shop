CREATE TABLE public.order_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  changed_by uuid,
  changed_by_email text,
  previous_status text,
  new_status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.order_audit_logs TO authenticated;
GRANT ALL ON public.order_audit_logs TO service_role;

ALTER TABLE public.order_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin audit select" ON public.order_audit_logs
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX order_audit_logs_order_id_idx ON public.order_audit_logs(order_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.order_audit_logs (order_id, changed_by, changed_by_email, previous_status, new_status)
    VALUES (NEW.id, auth.uid(), NULLIF(auth.jwt() ->> 'email', ''), OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER orders_status_audit
AFTER UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.log_order_status_change();

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;