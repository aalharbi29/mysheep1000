import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Loader2, Package, FileText, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { generateShippingLabel } from '@/lib/generateShippingLabel';

interface Order {
  id: string; user_id: string; seller_id: string; items: any[];
  total: number; status: string; shipping_name: string; shipping_phone: string;
  shipping_address: string; shipping_city: string; shipping_notes: string;
  payment_method: string; payment_status: string; tracking_number: string;
  created_at: string;
}

const STATUS_MAP: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: 'قيد المراجعة', icon: Clock, color: 'text-warning' },
  confirmed: { label: 'تم التأكيد', icon: CheckCircle, color: 'text-primary' },
  shipped: { label: 'تم الشحن', icon: Truck, color: 'text-info' },
  delivered: { label: 'تم التوصيل', icon: CheckCircle, color: 'text-success' },
  cancelled: { label: 'ملغي', icon: XCircle, color: 'text-destructive' },
};

const StoreOrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'my' | 'seller'>('my');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      setLoading(true);
      const { data: myOrders } = await supabase.from('store_orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      const { data: sOrders } = await supabase.from('store_orders').select('*').eq('seller_id', user.id).order('created_at', { ascending: false });
      setOrders((myOrders as any[]) || []);
      setSellerOrders((sOrders as any[]) || []);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    await supabase.from('store_orders').update({ status }).eq('id', orderId);
    setSellerOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    if (selectedOrder?.id === orderId) setSelectedOrder(o => o ? { ...o, status } : null);
  };

  const displayOrders = tab === 'my' ? orders : sellerOrders;

  if (loading) return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary p-4 sm:p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="الطلبات" backTo="/store" />

        <div className="flex gap-2 mt-4">
          <button onClick={() => setTab('my')} className={`flex-1 py-3 rounded-xl font-bold text-sm ${tab === 'my' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground'}`}>
            مشترياتي ({orders.length})
          </button>
          <button onClick={() => setTab('seller')} className={`flex-1 py-3 rounded-xl font-bold text-sm ${tab === 'seller' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground'}`}>
            طلبات واردة ({sellerOrders.length})
          </button>
        </div>

        {displayOrders.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-bold">لا توجد طلبات</p>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {displayOrders.map(order => {
              const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending;
              const StatusIcon = statusInfo.icon;
              return (
                <button key={order.id} onClick={() => setSelectedOrder(order)}
                  className="w-full bg-card rounded-xl p-4 border border-border text-right">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">#{order.id.slice(0, 8)}</span>
                    <span className={`flex items-center gap-1 text-xs font-bold ${statusInfo.color}`}>
                      <StatusIcon className="w-3 h-3" />{statusInfo.label}
                    </span>
                  </div>
                  <div className="mt-2">
                    {(order.items as any[]).map((item: any, i: number) => (
                      <p key={i} className="text-sm text-foreground">{item.name} × {item.quantity}</p>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('ar-SA')}</span>
                    <span className="font-bold text-primary text-sm">{order.total.toLocaleString()} ر.س</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Order Detail Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent dir="rtl" className="max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>تفاصيل الطلب</DialogTitle></DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="text-sm space-y-1">
                  <p><strong>رقم الطلب:</strong> {selectedOrder.id.slice(0, 8)}</p>
                  <p><strong>الحالة:</strong> {STATUS_MAP[selectedOrder.status]?.label}</p>
                  <p><strong>التاريخ:</strong> {new Date(selectedOrder.created_at).toLocaleDateString('ar-SA')}</p>
                </div>

                <div>
                  <h4 className="font-bold mb-2">المنتجات</h4>
                  {(selectedOrder.items as any[]).map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm py-1 border-b border-border last:border-0">
                      <span>{item.name} × {item.quantity}</span>
                      <span className="font-bold">{(item.price * item.quantity).toLocaleString()} ر.س</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-extrabold mt-2 pt-2">
                    <span>الإجمالي</span>
                    <span className="text-primary">{selectedOrder.total.toLocaleString()} ر.س</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-2">بيانات الشحن</h4>
                  <div className="text-sm space-y-1">
                    <p>{selectedOrder.shipping_name}</p>
                    <p>{selectedOrder.shipping_phone}</p>
                    <p>{selectedOrder.shipping_city} - {selectedOrder.shipping_address}</p>
                    {selectedOrder.shipping_notes && <p className="text-muted-foreground">{selectedOrder.shipping_notes}</p>}
                  </div>
                </div>

                {/* Seller actions */}
                {tab === 'seller' && (
                  <div className="space-y-2">
                    {selectedOrder.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button className="flex-1" onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed')}>تأكيد الطلب</Button>
                        <Button variant="destructive" onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}>إلغاء</Button>
                      </div>
                    )}
                    {selectedOrder.status === 'confirmed' && (
                      <Button className="w-full" onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}>
                        <Truck className="w-4 h-4 ml-2" />تم الشحن
                      </Button>
                    )}
                    {selectedOrder.status === 'shipped' && (
                      <Button className="w-full" onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}>
                        <CheckCircle className="w-4 h-4 ml-2" />تم التوصيل
                      </Button>
                    )}
                    <Button variant="outline" className="w-full" onClick={() => generateShippingLabel(selectedOrder)}>
                      <FileText className="w-4 h-4 ml-2" />طباعة بوليصة الشحن
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default StoreOrdersPage;
