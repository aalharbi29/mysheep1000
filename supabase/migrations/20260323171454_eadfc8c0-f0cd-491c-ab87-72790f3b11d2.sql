
ALTER TABLE public.splash_settings
  ADD COLUMN IF NOT EXISTS dev_logo_visible boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS dev_logo_size integer NOT NULL DEFAULT 112,
  ADD COLUMN IF NOT EXISTS dev_logo_brightness integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS dev_logo_glow boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS dev_logo_glow_color text NOT NULL DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS dev_logo_glow_intensity integer NOT NULL DEFAULT 30;
