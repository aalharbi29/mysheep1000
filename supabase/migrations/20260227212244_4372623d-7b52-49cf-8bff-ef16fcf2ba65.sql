
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'order',
  reference_id TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger function to auto-create notification on new order
CREATE OR REPLACE FUNCTION public.notify_seller_on_new_order()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  item_names TEXT;
BEGIN
  SELECT string_agg(item->>'name', '، ')
  INTO item_names
  FROM jsonb_array_elements(NEW.items) AS item;

  INSERT INTO public.notifications (user_id, title, body, type, reference_id)
  VALUES (
    NEW.seller_id,
    '🔔 طلب جديد!',
    COALESCE(NEW.shipping_name, 'عميل') || ' طلب: ' || COALESCE(item_names, 'منتجات') || ' - المجموع: ' || NEW.total || ' ر.س',
    'order',
    NEW.id::text
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_store_order
  AFTER INSERT ON public.store_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_seller_on_new_order();
