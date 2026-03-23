DROP POLICY IF EXISTS "Users can view own splash settings" ON public.splash_settings;
CREATE POLICY "Anyone can view splash settings"
ON public.splash_settings FOR SELECT
TO public
USING (true);