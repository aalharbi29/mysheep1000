import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CartItemWithProduct {
  id: string;
  quantity: number;
  product_id: string;
  product: {
    id: string; name: string; price: number; sale_price: number | null;
    stock: number; image_urls: string[]; seller_id: string;
  };
}

const StoreCartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [shipping, setShipping] = useState({ name: '', phone: '', address: '', city: '', notes: '' });

  const fetchCart = async () => {
    if (!user) return;
    setLoading(true);
    const { data: cartItems } = await supabase.from('cart_items').select('*').eq('user_id', user.id);
    if (!cartItems || cartItems.length === 0) { setItems([]); setLoading(false); return; }

    const productIds = cartItems.map(ci => ci.product_id);
    const { data: products } = await supabase.from('store_products').select('*').in('id', productIds);

    const merged = cartItems.map(ci => ({
      ...ci,
      product: (products as any[])?.find(p => p.id === ci.product_id) || null,
    })).filter(ci => ci.product) as CartItemWithProduct[];

    setItems(merged);
    setLoading(false);
  };

  useEffect(() => { fetchCart(); }, [user]);

  const updateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    await supabase.from('cart_items').update({ quantity: newQty }).eq('id', itemId);
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQty } : i));
  };

  const removeItem = async (itemId: string) => {
    await supabase.from('cart_items').delete().eq('id', itemId);
    setItems(prev => prev.filter(i => i.id !== itemId));
    toast({ title: 'تم الحذف من السلة' });
  };

  const getPrice = (p: CartItemWithProduct['product']) => p.sale_price || p.price;
  const total = items.reduce((sum, i) => sum + getPrice(i.product) * i.quantity, 0);

  const placeOrder = async () => {
    if (!user || !shipping.name || !shipping.phone || !shipping.address || !shipping.city) {
      toast({ title: 'يرجى تعبئة جميع حقول الشحن', variant: 'destructive' }); return;
    }
    setCheckingOut(true);

    // Group items by seller
    const sellerGroups: Record<string, CartItemWithProduct[]> = {};
    items.forEach(item => {
      const sid = item.product.seller_id;
      if (!sellerGroups[sid]) sellerGroups[sid] = [];
      sellerGroups[sid].push(item);
    });

    // Create one order per seller
    for (const [sellerId, sellerItems] of Object.entries(sellerGroups)) {
      const orderItems = sellerItems.map(i => ({
        product_id: i.product.id,
        name: i.product.name,
        price: getPrice(i.product),
        quantity: i.quantity,
        image: (i.product.image_urls as string[])?.[0] || '',
      }));
      const orderTotal = sellerItems.reduce((s, i) => s + getPrice(i.product) * i.quantity, 0);

      const orderData = {
        user_id: user.id,
        seller_id: sellerId,
        items: orderItems as any,
        total: orderTotal,
        shipping_name: shipping.name,
        shipping_phone: shipping.phone,
        shipping_address: shipping.address,
        shipping_city: shipping.city,
        shipping_notes: shipping.notes,
        status: 'pending',
        payment_method: 'cod',
        payment_status: 'pending',
      };

      const { data: insertedOrder } = await supabase.from('store_orders').insert(orderData).select().single();

      // Call edge function for external notifications (WhatsApp/SMS/Email)
      if (insertedOrder) {
        supabase.functions.invoke('notify-seller', {
          body: { record: insertedOrder },
        }).catch(err => console.error('Notify error:', err));
      }
    }

    // Clear cart
    await supabase.from('cart_items').delete().eq('user_id', user.id);
    toast({ title: 'تم إنشاء الطلب بنجاح! 🎉' });
    setCheckingOut(false);
    navigate('/store/orders');
  };

  if (loading) return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary p-4 sm:p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="سلة التسوق" backTo="/store" />

        {items.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-bold">السلة فارغة</p>
            <Button className="mt-4" onClick={() => navigate('/store')}>تصفح المتجر</Button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mt-4">
              {items.map(item => (
                <div key={item.id} className="bg-card rounded-xl p-3 border border-border flex gap-3">
                  {(item.product.image_urls as string[])?.length > 0 ? (
                    <img src={(item.product.image_urls as string[])[0]} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-muted flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm line-clamp-1">{item.product.name}</p>
                    <p className="text-primary font-bold text-sm mt-1">{getPrice(item.product).toLocaleString()} ر.س</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="outline" className="w-7 h-7" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-bold text-sm w-6 text-center">{item.quantity}</span>
                        <Button size="icon" variant="outline" className="w-7 h-7" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button size="icon" variant="ghost" className="text-destructive w-7 h-7" onClick={() => removeItem(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="bg-card rounded-xl p-4 mt-3 border border-border">
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground">الإجمالي</span>
                <span className="text-xl font-extrabold text-primary">{total.toLocaleString()} ر.س</span>
              </div>
            </div>

            {!showCheckout ? (
              <Button className="w-full mt-3" size="lg" onClick={() => setShowCheckout(true)}>
                إتمام الشراء
              </Button>
            ) : (
              <div className="bg-card rounded-xl p-4 mt-3 border border-border space-y-3">
                <h3 className="font-extrabold text-foreground">بيانات الشحن</h3>
                <Input placeholder="الاسم الكامل *" value={shipping.name} onChange={e => setShipping(s => ({ ...s, name: e.target.value }))} />
                <Input placeholder="رقم الجوال *" value={shipping.phone} onChange={e => setShipping(s => ({ ...s, phone: e.target.value }))} />
                <Input placeholder="المدينة *" value={shipping.city} onChange={e => setShipping(s => ({ ...s, city: e.target.value }))} />
                <Input placeholder="العنوان التفصيلي *" value={shipping.address} onChange={e => setShipping(s => ({ ...s, address: e.target.value }))} />
                <Input placeholder="ملاحظات (اختياري)" value={shipping.notes} onChange={e => setShipping(s => ({ ...s, notes: e.target.value }))} />
                <Button className="w-full" size="lg" onClick={placeOrder} disabled={checkingOut}>
                  {checkingOut ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                  تأكيد الطلب
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StoreCartPage;
