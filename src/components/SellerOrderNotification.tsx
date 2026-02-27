import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

const SellerOrderNotification = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('seller-new-orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'store_orders',
          filter: `seller_id=eq.${user.id}`,
        },
        (payload) => {
          const order = payload.new as any;
          const items = (order.items as any[]) || [];
          const itemNames = items.map((i: any) => i.name).join('، ');
          toast({
            title: '🔔 طلب جديد!',
            description: `${order.shipping_name || 'عميل'} طلب: ${itemNames} - المجموع: ${order.total?.toLocaleString()} ر.س`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return null;
};

export default SellerOrderNotification;
