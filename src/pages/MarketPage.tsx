import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, ClipboardList, MessageCircle, Store } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const cards = [
  { id: 'store', label: 'المتجر', icon: Store, path: '/store', gradient: 'from-primary to-primary/80' },
  { id: 'sell', label: 'بيع', icon: ShoppingBag, path: '/market/sell', gradient: 'from-success to-success/80' },
  { id: 'buy', label: 'شراء', icon: ShoppingCart, path: '/market/buy', gradient: 'from-info to-info/80' },
  { id: 'my-listings', label: 'إعلاناتي', icon: ClipboardList, path: '/market/my-listings', gradient: 'from-primary/80 to-primary/60' },
  { id: 'conversations', label: 'المحادثات', icon: MessageCircle, path: '/market/conversations', gradient: 'from-accent to-accent/80' },
];

const MarketPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-secondary p-4 sm:p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="السوق" backTo="/" />
        <div className="grid grid-cols-2 gap-4 mt-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => navigate(card.path)}
                className={`relative overflow-hidden rounded-xl p-6 text-center transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-bl ${card.gradient}`}
              >
                <Icon className="w-10 h-10 text-primary-foreground/90 mb-3 mx-auto" />
                <h2 className="text-primary-foreground font-extrabold text-xl">{card.label}</h2>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MarketPage;
