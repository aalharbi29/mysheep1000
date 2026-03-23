CREATE TABLE public.splash_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  phase1_title text NOT NULL DEFAULT 'الحظيرة النموذجية',
  phase1_show_logo boolean NOT NULL DEFAULT true,
  phase1_duration integer NOT NULL DEFAULT 2000,
  phase2_line1 text NOT NULL DEFAULT 'برمجة وتطوير',
  phase2_line2 text NOT NULL DEFAULT 'Al-Hrsani Labs',
  phase2_line3 text NOT NULL DEFAULT 'لتطوير المحتوى',
  phase2_duration integer NOT NULL DEFAULT 2500,
  bg_color text NOT NULL DEFAULT '#928472',
  text_color text NOT NULL DEFAULT '#ffffff',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.splash_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own splash settings" ON public.splash_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own splash settings" ON public.splash_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own splash settings" ON public.splash_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id);