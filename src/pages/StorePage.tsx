import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ShoppingCart, Plus, Search, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  sub_category: string;
  price: number;
  sale_price: number | null;
  stock: number;
  image_urls: string[];
  seller_id: string;
  created_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  medicine: 'أدوية ومستلزمات طبية',
  sheep_tools: 'أدوات أغنام',
  poultry_tools: 'أدوات دواجن',
  horse_tools: 'أدوات خيل',
  general: 'مستلزمات عامة',
  // Legacy support
  sheep_feed: 'أعلاف أغنام',
  sheep_medicine: 'أدوية أغنام',
  poultry_feed: 'أعلاف دواجن',
  poultry_medicine: 'أدوية دواجن',
};

const CATEGORIES = [
  { id: 'all', label: 'الكل' },
  { id: 'medicine', label: 'أدوية وطبية' },
  { id: 'sheep_tools', label: 'أدوات أغنام' },
  { id: 'poultry_tools', label: 'أدوات دواجن' },
  { id: 'horse_tools', label: 'أدوات خيل' },
  { id: 'general', label: 'مستلزمات عامة' },
];

// Map old categories to new ones for filtering
const CATEGORY_GROUPS: Record<string, string[]> = {
  medicine: ['medicine', 'sheep_medicine', 'poultry_medicine'],
  sheep_tools: ['sheep_tools', 'sheep_feed'],
  poultry_tools: ['poultry_tools', 'poultry_feed'],
  horse_tools: ['horse_tools'],
  general: ['general'],
};

const StorePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && CATEGORY_LABELS[cat]) {
      setActiveCategory(cat);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase.from('store_products').select('*')
        .eq('status', 'active')
        .gt('stock', 0)
        .order('created_at', { ascending: false });

      if (activeCategory !== 'all') {
        const group = CATEGORY_GROUPS[activeCategory];
        if (group && group.length > 1) {
          query = query.in('category', group);
        } else if (group) {
          query = query.eq('category', group[0]);
        } else {
          query = query.eq('category', activeCategory);
        }
      }
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data } = await query;
      setProducts((data as any[]) || []);
      setLoading(false);
    };
    fetchProducts();
  }, [activeCategory, search]);

  useEffect(() => {
    if (!user) return;
    const fetchCartCount = async () => {
      const { count } = await supabase.from('cart_items').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      setCartCount(count || 0);
    };
    fetchCartCount();

    const channel = supabase.channel('cart-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cart_items', filter: `user_id=eq.${user.id}` }, () => fetchCartCount())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return (
    <div className="min-h-screen bg-secondary p-4 sm:p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <PageHeader title={CATEGORY_LABELS[activeCategory] || 'المتجر'} backTo="/market" />

        {/* Top actions */}
        <div className="flex gap-2 mt-4">
          <Button variant="outline" className="relative" onClick={() => navigate('/store/cart')}>
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground">{cartCount}</Badge>
            )}
          </Button>
          <Button variant="outline" onClick={() => navigate('/store/orders')}>طلباتي</Button>
          <Button className="mr-auto" onClick={() => navigate('/store/add-product')}>
            <Plus className="w-4 h-4 ml-1" />أضف منتج
          </Button>
        </div>

        {/* Search */}
        <div className="relative mt-3">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pr-10" placeholder="ابحث عن منتج..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Categories */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-3 py-2 rounded-full text-sm font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-bold">لا توجد منتجات</p>
            <p className="text-sm mt-1">كن أول من يضيف منتجاً!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {products.map(product => (
              <button
                key={product.id}
                onClick={() => navigate(`/store/product/${product.id}`)}
                className="bg-card rounded-xl overflow-hidden shadow-md border border-border text-right"
              >
                {(product.image_urls as string[])?.length > 0 ? (
                  <img src={(product.image_urls as string[])[0]} alt={product.name} className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-muted flex items-center justify-center">
                    <Package className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="p-3">
                  <p className="font-bold text-foreground text-sm line-clamp-2">{product.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {product.sale_price ? (
                      <>
                        <span className="font-bold text-destructive text-sm">{product.sale_price.toLocaleString()} ر.س</span>
                        <span className="text-muted-foreground text-xs line-through">{product.price.toLocaleString()}</span>
                      </>
                    ) : (
                      <span className="font-bold text-primary text-sm">{product.price.toLocaleString()} ر.س</span>
                    )}
                  </div>
                  {product.stock <= 5 && (
                    <p className="text-xs text-destructive mt-1">متبقي {product.stock} فقط</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StorePage;
