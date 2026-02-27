
-- Update trigger to also call the edge function
CREATE OR REPLACE FUNCTION public.notify_seller_on_new_order()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  item_names TEXT;
  supabase_url TEXT;
  service_key TEXT;
BEGIN
  SELECT string_agg(item->>'name', '، ')
  INTO item_names
  FROM jsonb_array_elements(NEW.items) AS item;

  -- Insert in-app notification
  INSERT INTO public.notifications (user_id, title, body, type, reference_id)
  VALUES (
    NEW.seller_id,
    '🔔 طلب جديد!',
    COALESCE(NEW.shipping_name, 'عميل') || ' طلب: ' || COALESCE(item_names, 'منتجات') || ' - المجموع: ' || NEW.total || ' ر.س',
    'order',
    NEW.id::text
  );

  -- Call edge function for external notifications (SMS/WhatsApp/Email)
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_key := current_setting('app.settings.service_role_key', true);

  IF supabase_url IS NOT NULL AND service_key IS NOT NULL THEN
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/notify-seller',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_key
      ),
      body := jsonb_build_object('record', row_to_json(NEW))
    );
  END IF;

  RETURN NEW;
END;
$$;
