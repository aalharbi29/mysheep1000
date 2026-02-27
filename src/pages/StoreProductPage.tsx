import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ShoppingCart, Plus, Minus, Phone, MessageCircle, Package, Send, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface Product {
  id: string; name: string; description: string; category: string;
  sub_category: string; price: number; sale_price: number | null;
  stock: number; image_urls: string[]; seller_id: string; created_at: string;
}

interface Comment {
  id: string; user_id: string; user_name: string; content: string; created_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  medicine: 'أدوية ومستلزمات طبية', sheep_tools: 'أدوات أغنام', poultry_tools: 'أدوات دواجن',
  horse_tools: 'أدوات خيل', general: 'مستلزمات عامة',
  sheep_feed: 'أعلاف أغنام', sheep_medicine: 'أدوية أغنام',
  poultry_feed: 'أعلاف دواجن', poultry_medicine: 'أدوية دواجن',
};

const StoreProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('store_products').select('*').eq('id', id).single();
      if (data) {
        setProduct(data as any);
        const { data: profile } = await supabase.from('profiles').select('display_name, phone').eq('user_id', (data as any).seller_id).single();
        setSellerName(profile?.display_name || 'بائع');
        setSellerPhone((profile as any)?.phone || '');
      }
      // Fetch comments
      const { data: commentsData } = await supabase
        .from('product_comments')
        .select('*')
        .eq('product_id', id)
        .order('created_at', { ascending: true });
      setComments((commentsData as any[]) || []);
      setLoading(false);
    };
    fetchData();

    // Realtime comments
    const channel = supabase
      .channel(`product-comments-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'product_comments', filter: `product_id=eq.${id}` },
        (payload) => setComments(prev => [...prev, payload.new as Comment])
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const addToCart = async () => {
    if (!user || !product) return;
    setAdding(true);
    const { data: existing } = await supabase.from('cart_items')
      .select('id, quantity').eq('user_id', user.id).eq('product_id', product.id).single();

    if (existing) {
      await supabase.from('cart_items').update({ quantity: (existing.quantity as number) + quantity }).eq('id', existing.id);
    } else {
      await supabase.from('cart_items').insert({ user_id: user.id, product_id: product.id, quantity });
    }
    toast({ title: 'تمت الإضافة للسلة', description: `${product.name} × ${quantity}` });
    setAdding(false);
  };

  const handleSendComment = async () => {
    if (!user || !newComment.trim() || !id) return;
    setSendingComment(true);
    const { data: profile } = await supabase.from('profiles').select('display_name').eq('user_id', user.id).single();
    await supabase.from('product_comments').insert({
      product_id: id, user_id: user.id, user_name: profile?.display_name || 'مستخدم', content: newComment.trim(),
    } as any);
    setNewComment('');
    setSendingComment(false);
  };

  const startPrivateChat = async () => {
    if (!user || !product) return;
    if (user.id === product.seller_id) return;
    // Check existing conversation (no listing_id, use null)
    const { data: existing } = await supabase.from('conversations').select('id')
      .or(`and(participant1.eq.${user.id},participant2.eq.${product.seller_id}),and(participant1.eq.${product.seller_id},participant2.eq.${user.id})`)
      .is('listing_id', null).maybeSingle();
    if (existing) { navigate(`/market/chat/${existing.id}`); return; }
    const { data: conv, error } = await supabase.from('conversations').insert({
      participant1: user.id, participant2: product.seller_id,
    } as any).select().single();
    if (error) { toast({ title: 'خطأ', description: error.message, variant: 'destructive' }); return; }
    navigate(`/market/chat/${(conv as any).id}`);
  };

  if (loading) return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-secondary p-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="المنتج غير موجود" backTo="/store" />
      </div>
    </div>
  );

  const images = (product.image_urls as string[]) || [];
  const finalPrice = product.sale_price || product.price;
  const isOwner = user?.id === product.seller_id;
  const whatsappUrl = sellerPhone ? `https://wa.me/966${sellerPhone.replace(/^0/, '')}?text=${encodeURIComponent(`استفسار عن: ${product.name}`)}` : '';

  return (
    <div className="min-h-screen bg-secondary p-4 sm:p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <PageHeader title={product.name} backTo="/store" />

        {/* Images */}
        {images.length > 0 ? (
          <div className="mt-4">
            <button onClick={() => setSelectedMedia(images[selectedImage])} className="w-full">
              <img src={images[selectedImage]} alt={product.name} className="w-full h-64 object-cover rounded-xl" />
            </button>
            {images.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto">
                {images.map((url, i) => (
                  <img key={i} src={url} alt="" onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-lg object-cover cursor-pointer border-2 ${i === selectedImage ? 'border-primary' : 'border-transparent'}`} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-48 bg-muted rounded-xl flex items-center justify-center mt-4">
            <Package className="w-12 h-12 text-muted-foreground" />
          </div>
        )}

        {/* Details */}
        <div className="bg-card rounded-xl p-4 mt-4 border border-border">
          <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[product.category] || product.category}</p>
          <h2 className="text-xl font-extrabold text-foreground mt-1">{product.name}</h2>
          
          <div className="flex items-center gap-3 mt-3">
            {product.sale_price ? (
              <>
                <span className="text-2xl font-extrabold text-destructive">{product.sale_price.toLocaleString()} ر.س</span>
                <span className="text-lg text-muted-foreground line-through">{product.price.toLocaleString()}</span>
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-destructive/10 text-destructive">
                  خصم {Math.round((1 - product.sale_price / product.price) * 100)}%
                </span>
              </>
            ) : (
              <span className="text-2xl font-extrabold text-primary">{product.price.toLocaleString()} ر.س</span>
            )}
          </div>

          {product.description && (
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{product.description}</p>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground">البائع: <strong className="text-foreground">{sellerName}</strong></span>
            <span className="text-sm text-muted-foreground">المخزون: <strong className="text-foreground">{product.stock}</strong></span>
          </div>
        </div>

        {/* Contact buttons */}
        {!isOwner && (
          <div className="flex gap-2 mt-3">
            {sellerPhone && (
              <>
                <a href={`tel:${sellerPhone}`} className="flex-1">
                  <Button className="w-full" variant="outline"><Phone className="w-4 h-4 ml-2" />اتصال</Button>
                </a>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">واتساب</Button>
                </a>
              </>
            )}
            <Button variant="outline" onClick={startPrivateChat}>
              <MessageCircle className="w-4 h-4 ml-1" />محادثة خاصة
            </Button>
          </div>
        )}

        {/* Quantity & Add to cart */}
        {product.stock > 0 && !isOwner && (
          <div className="bg-card rounded-xl p-4 mt-3 border border-border">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">الكمية</span>
              <div className="flex items-center gap-3">
                <Button size="icon" variant="outline" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="font-bold text-lg w-8 text-center">{quantity}</span>
                <Button size="icon" variant="outline" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="text-muted-foreground">الإجمالي</span>
              <span className="text-xl font-extrabold text-primary">{(finalPrice * quantity).toLocaleString()} ر.س</span>
            </div>
            <Button className="w-full mt-3" size="lg" onClick={addToCart} disabled={adding}>
              {adding ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <ShoppingCart className="w-4 h-4 ml-2" />}
              أضف للسلة
            </Button>
          </div>
        )}

        {product.stock === 0 && (
          <div className="bg-destructive/10 text-destructive rounded-xl p-4 mt-3 text-center font-bold">
            نفذت الكمية
          </div>
        )}

        {/* Comments */}
        <div className="bg-card rounded-xl p-4 mt-4 border border-border">
          <h3 className="font-bold text-foreground mb-3">التعليقات ({comments.length})</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {comments.map(c => (
              <div key={c.id} className={`p-3 rounded-lg text-sm ${c.user_id === user?.id ? 'bg-primary/10' : 'bg-muted'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-foreground text-xs">{c.user_name}</span>
                  <span className="text-muted-foreground text-xs">{new Date(c.created_at).toLocaleDateString('ar-SA')}</span>
                </div>
                <p className="text-foreground">{c.content}</p>
              </div>
            ))}
            {comments.length === 0 && <p className="text-center text-muted-foreground text-sm">لا توجد تعليقات</p>}
          </div>
          {user && (
            <div className="flex gap-2 mt-3">
              <Input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="أضف تعليق أو استفسار..."
                onKeyDown={e => e.key === 'Enter' && handleSendComment()} />
              <Button size="icon" onClick={handleSendComment} disabled={sendingComment || !newComment.trim()}>
                {sendingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Media fullscreen dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-2">
          <button onClick={() => setSelectedMedia(null)} className="absolute top-2 left-2 z-10 bg-background/80 rounded-full p-1">
            <X className="w-5 h-5" />
          </button>
          <img src={selectedMedia || ''} alt="" className="w-full max-h-[85vh] object-contain rounded-lg" />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoreProductPage;
