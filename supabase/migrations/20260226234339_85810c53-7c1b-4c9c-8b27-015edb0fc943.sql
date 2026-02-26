
-- Create market_listings table
CREATE TABLE public.market_listings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  listing_type text NOT NULL DEFAULT 'sell',
  category text NOT NULL DEFAULT 'livestock',
  animal_type text,
  breed text,
  gender text,
  quantity integer DEFAULT 1,
  condition text,
  kids_count integer,
  kids_age text,
  rams_count integer,
  teeth text,
  location text,
  contact_number text,
  price numeric,
  media_urls jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.market_listings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view all active listings" ON public.market_listings
  FOR SELECT USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Users can insert own listings" ON public.market_listings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings" ON public.market_listings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings" ON public.market_listings
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for market media
INSERT INTO storage.buckets (id, name, public) VALUES ('market-media', 'market-media', true);

-- Storage RLS policies
CREATE POLICY "Anyone can view market media" ON storage.objects
  FOR SELECT USING (bucket_id = 'market-media');

CREATE POLICY "Authenticated users can upload market media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'market-media' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own market media" ON storage.objects
  FOR DELETE USING (bucket_id = 'market-media' AND auth.uid()::text = (storage.foldername(name))[1]);
