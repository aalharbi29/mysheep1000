
-- Add phone to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;

-- Create product comments table
CREATE TABLE IF NOT EXISTS product_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_name text,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE product_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view product comments" ON product_comments FOR SELECT USING (true);
CREATE POLICY "Auth users can insert product comments" ON product_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own product comments" ON product_comments FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for product comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_comments;
