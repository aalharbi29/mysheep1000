import { useNavigate } from 'react-router-dom';
import { useLivestock } from '@/context/LivestockContext';
import { useAuth } from '@/context/AuthContext';
import { Fence, Receipt, ShoppingCart, TrendingUp, FileText, Archive, LogOut, Store, UserCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationBell from '@/components/NotificationBell';

const cards = [
{ id: 'flock', label: 'القطيع', icon: Fence, path: '/flock', gradient: 'from-primary to-primary/80' },
{ id: 'expenses', label: 'المصروفات', icon: Receipt, path: '/expenses', gradient: 'from-destructive/80 to-destructive/60' },
{ id: 'sales', label: 'المبيعات', icon: TrendingUp, path: '/sales', gradient: 'from-success to-success/80' },
{ id: 'purchases', label: 'المشتريات', icon: ShoppingCart, path: '/purchases', gradient: 'from-info to-info/80' },
{ id: 'summary', label: 'الملخص', icon: FileText, path: '/summary', gradient: 'from-accent to-accent/80' },
{ id: 'reports', label: 'التقارير', icon: Archive, path: '/reports', gradient: 'from-muted-foreground/60 to-muted-foreground/40' },
{ id: 'market', label: 'المتجر', icon: Store, path: '/market', gradient: 'from-orange-500 to-orange-400' }];


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
    market: 'مستلزمات وأدوات'
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 text-red-400 bg-[sidebar-accent-foreground] bg-slate-950">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8 pt-6 relative">
          <button
            onClick={signOut}
            className="absolute left-0 top-6 flex items-center gap-2 px-4 py-2 text-destructive hover:opacity-80 transition-colors font-bold text-base rounded-lg border bg-inherit border-accent pl-[12px] pr-[12px] pb-[2px] pt-[2px]"
            title="تسجيل الخروج">
            <LogOut className="w-7 h-7" />
            خروج
          </button>
          <div className="absolute right-0 top-6 flex items-center gap-[2px] border border-solid border-accent bg-inherit rounded-2xl">
            <button onClick={() => navigate('/settings')} className="p-2" title="الإعدادات">
              <Settings className="text-muted-foreground h-[20px] w-[20px]" />
            </button>
            <button onClick={() => navigate('/profile')} className="p-2" title="الملف الشخصي">
              <UserCircle className="text-primary h-[20px] w-[20px]" />
            </button>
            <NotificationBell />
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 mx-0 shadow-2xl text-xs mr-[15px] mb-[16px] pt-0 rounded-2xl">
            <Fence className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-extrabold mx-[25px] text-[#6075af] text-2xl pt-0">الحظيرة النموذجية
          </h1>
          <p className="mt-1 text-xl font-bold mx-[3px] text-[#755e1f]/[0.97]">إدارة ومتابعة القطيع</p>
        </header>

        <div className="grid grid-cols-2 gap-4 mx-0 my-0 opacity-100 pb-[15px] pr-[5px] pl-[5px] pt-[5px] border-2 border-muted-foreground rounded-3xl shadow-2xl">
          {cards.map((card) => {const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => navigate(card.path)}
                className={`relative overflow-hidden rounded-xl p-5 text-right transition-all duration-200 card-shadow hover:card-shadow-hover hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-bl ${card.gradient} ${card.id === 'flock' ? 'col-span-2' : ''}`}>

                <Icon className="w-7 h-7 mb-3 mr-[50px] border-inherit text-accent-foreground" />
                <h2 className="text-primary-foreground text-center font-extrabold text-xl">{card.label}</h2>
                <p className="text-sm text-primary-foreground/75 mt-1 text-center font-extrabold">{stats[card.id]}</p>
              </button>);

          })}
        </div>
      </div>
      <div className="fixed bottom-2 left-2 text-[10px] text-muted-foreground/40 select-none pointer-events-none font-light">
        إدارة وتطوير الهرساني لتطوير المحتوى
      </div>
    </div>);

};

export default Dashboard;