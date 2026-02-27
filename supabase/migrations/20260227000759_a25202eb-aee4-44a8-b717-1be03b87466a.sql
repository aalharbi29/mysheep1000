
-- Add title, description, details to market_listings
ALTER TABLE public.market_listings 
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS details jsonb DEFAULT '{}'::jsonb;

-- Comments on listings
CREATE TABLE public.listing_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.market_listings(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  user_name text,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.listing_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.listing_comments
FOR SELECT USING (true);

CREATE POLICY "Auth users can insert comments" ON public.listing_comments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.listing_comments
FOR DELETE USING (auth.uid() = user_id);

-- Conversations (private messages)
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.market_listings(id) ON DELETE SET NULL,
  participant1 uuid NOT NULL,
  participant2 uuid NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view conversations" ON public.conversations
FOR SELECT USING (auth.uid() = participant1 OR auth.uid() = participant2);

CREATE POLICY "Auth users can create conversations" ON public.conversations
FOR INSERT WITH CHECK (auth.uid() = participant1 OR auth.uid() = participant2);

CREATE POLICY "Participants can update conversations" ON public.conversations
FOR UPDATE USING (auth.uid() = participant1 OR auth.uid() = participant2);

-- Chat messages
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversation messages" ON public.chat_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id 
    AND (c.participant1 = auth.uid() OR c.participant2 = auth.uid())
  )
);

CREATE POLICY "Users can send messages" ON public.chat_messages
FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update own messages" ON public.chat_messages
FOR UPDATE USING (auth.uid() = sender_id);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.listing_comments;
