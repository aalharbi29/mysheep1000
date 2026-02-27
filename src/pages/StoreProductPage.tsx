import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Loader2, ShoppingCart, Plus, Minus, Phone, MessageCircle, Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Product {
  id: string; name: string; description: string; category: string;
  sub_category: string; price: number; sale_price: number | null;
  stock: number; image_urls: string[]; seller_id: string; created_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  sheep_feed: 'أعلاف أغنام', sheep_medicine: 'أدوية أغنام', sheep_tools: 'أدوات أغنام',
  poultry_feed: 'أعلاف دواجن', poultry_medicine: 'أدوية دواجن', poultry_tools: 'أدوات دواجن',
  general: 'مستلزمات عامة',
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
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('store_products').select('*').eq('id', id).single();
      if (data) {
        setProduct(data as any);
        const { data: profile } = await supabase.from('profiles').select('display_name').eq('user_id', (data as any).seller_id).single();
        setSellerName(profile?.display_name || 'بائع');
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const addToCart = async () => {
    if (!user || !product) return;
    setAdding(true);
    // Check if already in cart
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

  return (
    <div className="min-h-screen bg-secondary p-4 sm:p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <PageHeader title={product.name} backTo="/store" />

        {/* Images */}
        {images.length > 0 ? (
          <div className="mt-4">
            <img src={images[selectedImage]} alt={product.name} className="w-full h-64 object-cover rounded-xl" />
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
                <Badge className="bg-destructive/10 text-destructive border-none">
                  خصم {Math.round((1 - product.sale_price / product.price) * 100)}%
                </Badge>
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

        {/* Quantity & Add to cart */}
        {product.stock > 0 && user?.id !== product.seller_id && (
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
      </div>
    </div>
  );
};

// Simple badge for discount
const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-bold ${className}`}>{children}</span>
);

export default StoreProductPage;
