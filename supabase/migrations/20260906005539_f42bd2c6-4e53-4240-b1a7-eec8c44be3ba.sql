CREATE TABLE public.flash_sale_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active boolean NOT NULL DEFAULT false,
  start_at timestamptz,
  ends_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.flash_sale_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.flash_sale_settings TO authenticated;
GRANT ALL ON public.flash_sale_settings TO service_role;

ALTER TABLE public.flash_sale_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flash sale public read" ON public.flash_sale_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "flash sale admin insert" ON public.flash_sale_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "flash sale admin update" ON public.flash_sale_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER flash_sale_settings_updated_at BEFORE UPDATE ON public.flash_sale_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.flash_sale_settings (is_active) VALUES (false);