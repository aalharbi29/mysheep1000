
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Animals table
CREATE TABLE public.animals (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  category TEXT NOT NULL,
  breed TEXT NOT NULL,
  gender TEXT NOT NULL,
  sub_category TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '',
  birth_date TEXT DEFAULT '',
  mother_number INTEGER,
  mother_breed TEXT,
  father_number INTEGER,
  birth_records JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  status TEXT DEFAULT 'alive',
  death_date TEXT,
  confirmed BOOLEAN DEFAULT false,
  age_category TEXT,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id, user_id)
);
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own animals" ON public.animals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own animals" ON public.animals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own animals" ON public.animals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own animals" ON public.animals FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_animals_updated_at BEFORE UPDATE ON public.animals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Expenses table
CREATE TABLE public.expenses (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  sub_category TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own expenses" ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON public.expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- Sales table
CREATE TABLE public.sales (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  animal_id TEXT,
  animal_number INTEGER,
  animal_breed TEXT,
  animal_sub_category TEXT,
  animal_gender TEXT,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  buyer TEXT,
  payment_type TEXT NOT NULL DEFAULT 'cash',
  amount_paid NUMERIC NOT NULL DEFAULT 0,
  remaining NUMERIC NOT NULL DEFAULT 0,
  last_reminder_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sales" ON public.sales FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sales" ON public.sales FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sales" ON public.sales FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sales" ON public.sales FOR DELETE USING (auth.uid() = user_id);

-- Purchases table
CREATE TABLE public.purchases (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own purchases" ON public.purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own purchases" ON public.purchases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own purchases" ON public.purchases FOR DELETE USING (auth.uid() = user_id);
