ALTER TABLE public.splash_settings 
ADD COLUMN IF NOT EXISTS dev_animation_width integer NOT NULL DEFAULT 660,
ADD COLUMN IF NOT EXISTS dev_animation_height integer NOT NULL DEFAULT 450;