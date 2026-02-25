import { useNavigate } from 'react-router-dom';
import { useLivestock } from '@/context/LivestockContext';
import { useAuth } from '@/context/AuthContext';
import { Fence, Receipt, ShoppingCart, TrendingUp, FileText, Archive, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const cards = [
  { id: 'flock', label: 'القطيع', icon: Fence, path: '/flock', gradient: 'from-primary to-primary/80' },
  { id: 'expenses', label: 'المصروفات', icon: Receipt, path: '/expenses', gradient: 'from-destructive/80 to-destructive/60' },
  { id: 'sales', label: 'المبيعات', icon: TrendingUp, path: '/sales', gradient: 'from-success to-success/80' },
  { id: 'purchases', label: 'المشتريات', icon: ShoppingCart, path: '/purchases', gradient: 'from-info to-info/80' },
  { id: 'summary', label: 'الملخص', icon: FileText, path: '/summary', gradient: 'from-accent to-accent/80' },
  { id: 'reports', label: 'التقارير', icon: Archive, path: '/reports', gradient: 'from-muted-foreground/60 to-muted-foreground/40' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { animals, getTotalExpenses, getTotalSales, getTotalPurchases, getAliveAnimalsCount, getDeadAnimalsCount, loading } = useLivestock();
  const { signOut } = useAuth();

  const deadCount = getDeadAnimalsCount();
  const aliveCount = getAliveAnimalsCount();
  
  const stats: Record<string, string> = {
    flock: `${aliveCount} رأس${deadCount > 0 ? ` (${deadCount} نافق)` : ''}`,
    expenses: `${getTotalExpenses().toLocaleString()} ر.س`,
    sales: `${getTotalSales().toLocaleString()} ر.س`,
    purchases: `${getTotalPurchases().toLocaleString()} ر.س`,
    summary: 'عرض التقرير',
    reports: 'التقارير المحفوظة',
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8 pt-6 relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="absolute left-0 top-6"
            title="تسجيل الخروج"
          >
            <LogOut className="w-5 h-5" />
          </Button>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Fence className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">ماشية</h1>
          <p className="text-muted-foreground mt-1">إدارة ومتابعة القطيع</p>
        </header>

        <div className="grid grid-cols-2 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => navigate(card.path)}
                className={`relative overflow-hidden rounded-xl p-5 text-right transition-all duration-200 card-shadow hover:card-shadow-hover hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-bl ${card.gradient} ${card.id === 'flock' ? 'col-span-2' : ''}`}
              >
                <Icon className="w-7 h-7 text-primary-foreground/90 mb-3" />
                <h2 className="text-lg font-bold text-primary-foreground">{card.label}</h2>
                <p className="text-sm text-primary-foreground/75 mt-1">{stats[card.id]}</p>
              </button>
            );
          })}
        </div>
      </div>
      <div className="fixed bottom-2 left-2 text-[10px] text-muted-foreground/40 select-none pointer-events-none font-light">
        إدارة وتطوير الهرساني لتطوير المحتوى
      </div>
    </div>
  );
};

export default Dashboard;
