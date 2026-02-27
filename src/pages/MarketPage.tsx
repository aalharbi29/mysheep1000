import { useNavigate } from 'react-router-dom';
import { Pill, Fence, Bird, CircleDot, Package, ShoppingBag, ShoppingCart, ClipboardList, MessageCircle, Plus, ShoppingBasket, Receipt } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const categories = [
  { id: 'medicine', label: 'أدوية ومستلزمات طبية', icon: Pill, gradient: 'from-red-500 to-red-400' },
  { id: 'sheep_tools', label: 'أدوات أغنام', icon: Fence, gradient: 'from-amber-600 to-amber-500' },
  { id: 'poultry_tools', label: 'أدوات دواجن', icon: Bird, gradient: 'from-sky-500 to-sky-400' },
  { id: 'horse_tools', label: 'أدوات خيل', icon: CircleDot, gradient: 'from-emerald-600 to-emerald-500' },
  { id: 'general', label: 'مستلزمات عامة', icon: Package, gradient: 'from-violet-500 to-violet-400' },
];

const quickLinks = [
  { id: 'sell', label: 'بيع', icon: ShoppingBag, path: '/market/sell' },
  { id: 'buy', label: 'شراء', icon: ShoppingCart, path: '/market/buy' },
  { id: 'my-listings', label: 'إعلاناتي', icon: ClipboardList, path: '/market/my-listings' },
  { id: 'conversations', label: 'المحادثات', icon: MessageCircle, path: '/market/conversations' },
  { id: 'add-product', label: 'أضف منتج', icon: Plus, path: '/store/add-product' },
  { id: 'cart', label: 'السلة', icon: ShoppingBasket, path: '/store/cart' },
  { id: 'orders', label: 'طلباتي', icon: Receipt, path: '/store/orders' },
];

const MarketPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-secondary p-4 sm:p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="المتجر" backTo="/" />

        {/* Category Cards */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => navigate(`/store?category=${cat.id}`)}
                className={`relative overflow-hidden rounded-xl p-6 text-center transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-bl ${cat.gradient}`}
              >
                <Icon className="w-10 h-10 text-primary-foreground/90 mb-3 mx-auto" />
                <h2 className="text-primary-foreground font-extrabold text-lg leading-tight">{cat.label}</h2>
              </button>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="mt-6">
          <h3 className="text-sm font-bold text-muted-foreground mb-3">روابط سريعة</h3>
          <div className="flex gap-2 flex-wrap">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => navigate(link.path)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-foreground font-bold text-sm hover:bg-accent transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketPage;
