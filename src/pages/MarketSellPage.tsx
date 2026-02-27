import { useNavigate } from 'react-router-dom';
import { Fence, Car, Package } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const cards = [
  { id: 'livestock', label: 'بيع غنم', icon: Fence, path: '/market/sell/livestock', gradient: 'from-primary to-primary/80' },
  { id: 'car', label: 'بيع سيارة', icon: Car, path: '/market/sell/car', gradient: 'from-accent to-accent/80' },
  { id: 'goods', label: 'بيع منقولات', icon: Package, path: '/market/sell/goods', gradient: 'from-muted-foreground/60 to-muted-foreground/40' },
];

const MarketSellPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-secondary p-4 sm:p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="بيع" backTo="/market" />
        <div className="grid grid-cols-1 gap-4 mt-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => navigate(card.path)}
                className={`relative overflow-hidden rounded-xl p-5 text-center transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-bl ${card.gradient}`}
              >
                <Icon className="w-8 h-8 text-primary-foreground/90 mb-2 mx-auto" />
                <h2 className="text-primary-foreground font-extrabold text-lg">{card.label}</h2>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MarketSellPage;
