
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Seed first user as admin (owner)
INSERT INTO public.user_roles (user_id, role)
VALUES ('850e93bd-c179-4a89-a124-fef705bbabe3', 'admin')
ON CONFLICT DO NOTHING;

-- Restrict splash_settings to admin only for writes; allow everyone authenticated to read (shared visual)
DROP POLICY IF EXISTS "Users can view their splash settings" ON public.splash_settings;
DROP POLICY IF EXISTS "Users can insert their splash settings" ON public.splash_settings;
DROP POLICY IF EXISTS "Users can update their splash settings" ON public.splash_settings;
DROP POLICY IF EXISTS "Users can delete their splash settings" ON public.splash_settings;
DROP POLICY IF EXISTS "Anyone can view splash settings" ON public.splash_settings;
DROP POLICY IF EXISTS "Admins can manage splash settings" ON public.splash_settings;

CREATE POLICY "Anyone can view splash settings" ON public.splash_settings
FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can insert splash settings" ON public.splash_settings
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update splash settings" ON public.splash_settings
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete splash settings" ON public.splash_settings
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.splash_settings TO anon;
