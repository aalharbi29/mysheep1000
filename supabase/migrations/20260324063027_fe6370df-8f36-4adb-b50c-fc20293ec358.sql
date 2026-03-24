ALTER TABLE public.splash_settings
  ADD COLUMN splash_logo_width integer NOT NULL DEFAULT 192,
  ADD COLUMN splash_logo_height integer NOT NULL DEFAULT 192,
  ADD COLUMN auth_logo_width integer NOT NULL DEFAULT 200,
  ADD COLUMN auth_logo_height integer NOT NULL DEFAULT 128,
  ADD COLUMN dashboard_logo_width integer NOT NULL DEFAULT 64,
  ADD COLUMN dashboard_logo_height integer NOT NULL DEFAULT 64;