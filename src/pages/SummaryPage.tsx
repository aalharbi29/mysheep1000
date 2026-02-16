import PageHeader from '@/components/PageHeader';
import { useLivestock } from '@/context/LivestockContext';

const SummaryPage = () => {
  const { animals, getTotalExpenses, getTotalSales, getTotalPurchases } = useLivestock();

  const totalExpenses = getTotalExpenses();
  const totalSales = getTotalSales();
  const totalPurchases = getTotalPurchases();
  const net = totalSales - totalExpenses - totalPurchases;

  const sheepCount = animals.filter(a => a.category === 'sheep').length;
  const goatCount = animals.filter(a => a.category === 'goat').length;
  const maleCount = animals.filter(a => a.gender === 'male').length;
  const femaleCount = animals.filter(a => a.gender === 'female').length;

  const rows = [
    { label: 'إجمالي القطيع', value: `${animals.length} رأس`, color: 'text-foreground' },
    { label: 'الضأن', value: `${sheepCount} رأس`, color: 'text-foreground' },
    { label: 'الماعز', value: `${goatCount} رأس`, color: 'text-foreground' },
    { label: 'الذكور', value: `${maleCount}`, color: 'text-foreground' },
    { label: 'الإناث', value: `${femaleCount}`, color: 'text-foreground' },
    { label: 'إجمالي المبيعات', value: `${totalSales.toLocaleString()} ر.س`, color: 'text-success' },
    { label: 'إجمالي المصروفات', value: `${totalExpenses.toLocaleString()} ر.س`, color: 'text-destructive' },
    { label: 'إجمالي المشتريات', value: `${totalPurchases.toLocaleString()} ر.س`, color: 'text-info' },
    { label: 'صافي الربح/الخسارة', value: `${net.toLocaleString()} ر.س`, color: net >= 0 ? 'text-success' : 'text-destructive' },
  ];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="الملخص" subtitle="تقرير شامل عن القطيع والمالية" backTo="/" />

        <div className="space-y-3">
          {rows.map((row, i) => (
            <div key={i} className="rounded-xl bg-card p-4 card-shadow flex justify-between items-center">
              <span className="text-card-foreground font-medium">{row.label}</span>
              <span className={`font-bold ${row.color}`}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;
