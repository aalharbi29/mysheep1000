
CREATE TABLE public.vaccinations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  animal_id text NOT NULL,
  animal_number integer NOT NULL,
  vaccination_type text NOT NULL,
  first_dose_date text NOT NULL,
  second_dose_date text,
  second_dose_confirmed boolean NOT NULL DEFAULT false,
  is_deworming boolean NOT NULL DEFAULT false,
  repeat_date text,
  repeat_confirmed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vaccinations" ON public.vaccinations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vaccinations" ON public.vaccinations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vaccinations" ON public.vaccinations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vaccinations" ON public.vaccinations FOR DELETE USING (auth.uid() = user_id);
