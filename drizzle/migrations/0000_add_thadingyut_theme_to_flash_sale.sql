ALTER TABLE public.flash_sale_settings
ADD COLUMN IF NOT EXISTS is_thadingyut_theme boolean NOT NULL DEFAULT false;