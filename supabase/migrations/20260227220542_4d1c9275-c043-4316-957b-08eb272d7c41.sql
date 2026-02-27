
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
