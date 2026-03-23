import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { useLivestock } from '@/context/LivestockContext';
import { Fence, TrendingUp, TrendingDown, ShoppingCart, Receipt, Baby } from 'lucide-react';

const SummaryPage = () => {
  const navigate = useNavigate();
  const { animals, expenses, sales, purchases, getTotalExpenses, getTotalSales, getTotalPurchases } = useLivestock();

  const totalExpenses = getTotalExpenses();
  const totalSales = getTotalSales();
  const totalPurchases = getTotalPurchases();
  const net = totalSales - totalExpenses - totalPurchases;

  const confirmedAnimals = animals.filter((a) => a.confirmed);
  const aliveCount = confirmedAnimals.filter((a) => a.status !== 'dead').length;
  const totalBirths = confirmedAnimals.flatMap((a) => a.birthRecords.flatMap((r) => r.offspring)).length;

  const cards = [
  {
    title: 'إحصائيات القطيع',
    icon: <Fence className="w-7 h-7" />,
    value: `${aliveCount} رأس`,
    color: 'bg-primary/10 text-primary',
    iconColor: 'text-primary',
    route: '/summary/flock'
  },
  {
    title: 'المواليد',
    icon: <Baby className="w-7 h-7" />,
    value: `${totalBirths} مولود`,
    color: 'bg-accent/10 text-accent-foreground',
    iconColor: 'text-primary',
    route: '/summary/births'
  },
  {
    title: 'المبيعات',
    icon: <TrendingUp className="w-7 h-7" />,
    value: `${totalSales.toLocaleString()} ر.س`,
    color: 'bg-success/10 text-success',
    iconColor: 'text-success',
    route: '/summary/sales'
  },
  {
    title: 'المشتريات',
    icon: <ShoppingCart className="w-7 h-7" />,
    value: `${totalPurchases.toLocaleString()} ر.س`,
    color: 'bg-info/10 text-info',
    iconColor: 'text-info',
    route: '/summary/purchases'
  },
  {
    title: 'المصروفات',
    icon: <Receipt className="w-7 h-7" />,
    value: `${totalExpenses.toLocaleString()} ر.س`,
    color: 'bg-destructive/10 text-destructive',
    iconColor: 'text-destructive',
    route: '/summary/expenses'
  }];


  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 py-0 mb-0 mt-0 border-4 border-accent border-solid">
      <div className="max-w-2xl mx-auto mt-[100px] my-[70px] pb-0 mb-[25px] rounded-3xl border-4 border-accent text-center">
        <PageHeader title="الملخص" subtitle="تقرير شامل عن القطيع والمالية" backTo="/" />

        {/* Net Profit/Loss Hero */}
        <div className={`rounded-2xl p-5 mb-6 card-shadow text-center ${net >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
          <div className="flex items-center justify-center gap-2 mb-1">
            {net >= 0 ? <TrendingUp className="w-6 h-6 text-success" /> : <TrendingDown className="w-6 h-6 text-destructive" />}
            <span className="text-sm text-muted-foreground">{net >= 0 ? 'صافي الربح' : 'صافي الخسارة'}</span>
          </div>
          <span className={`text-3xl font-extrabold ${net >= 0 ? 'text-success' : 'text-destructive'}`}>
            {Math.abs(net).toLocaleString()} ر.س
          </span>
        </div>

        {/* Category Cards */}
        <div className="space-y-3">
          {cards.map((card) =>
          <button
            key={card.route}
            onClick={() => navigate(card.route)}
            className={`w-full rounded-2xl p-5 card-shadow flex items-center gap-4 transition-transform active:scale-[0.98] ${card.color}`}>

              <div className={`rounded-xl p-3 bg-background/60 ${card.iconColor}`}>
                {card.icon}
              </div>
              <div className="flex-1 text-right">
                <h3 className="text-lg font-bold">{card.title}</h3>
                <p className="text-sm opacity-80">{card.value}</p>
              </div>
              <span className="text-xl opacity-40">←</span>
            </button>
          )}
        </div>
      </div>
    </div>);

};

export default SummaryPage;