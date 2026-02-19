import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { useLivestock } from '@/context/LivestockContext';
import { CATEGORY_LABELS, FATE_LABELS, type OffspringFate } from '@/types/animals';
import { SavedReport, ReportData } from '@/types/reports';
import { Fence, TrendingUp, TrendingDown, Receipt, ShoppingCart, Baby, Download, Save, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { generatePdfReport } from '@/lib/generatePdfReport';

const SummaryPage = () => {
  const { animals, expenses, sales, purchases, getTotalExpenses, getTotalSales, getTotalPurchases } = useLivestock();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const totalExpenses = getTotalExpenses();
  const totalSales = getTotalSales();
  const totalPurchases = getTotalPurchases();
  const net = totalSales - totalExpenses - totalPurchases;

  // Flock stats
  const sheepCount = animals.filter(a => a.category === 'sheep').length;
  const goatCount = animals.filter(a => a.category === 'goat').length;
  const maleCount = animals.filter(a => a.gender === 'male').length;
  const femaleCount = animals.filter(a => a.gender === 'female').length;

  // By breed
  const harriCount = animals.filter(a => a.breed === 'harri').length;
  const najdiCount = animals.filter(a => a.breed === 'najdi').length;

  // By subCategory
  const mothersCount = animals.filter(a => a.subCategory === 'mothers').length;
  const youngCount = animals.filter(a => a.subCategory === 'young').length;
  const ramsCount = animals.filter(a => a.subCategory === 'rams').length;

  // Birth stats from all birth records
  const allOffspring = animals.flatMap(a => a.birthRecords.flatMap(r => r.offspring));
  const totalBirths = allOffspring.length;
  const birthsByFate: Record<string, number> = {};
  allOffspring.forEach(o => {
    birthsByFate[o.fate] = (birthsByFate[o.fate] || 0) + 1;
  });

  // Expenses by category
  const expensesByCategory: Record<string, number> = {};
  expenses.forEach(e => {
    expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
  });

  // Sales count & avg
  const salesCount = sales.length;
  const salesQuantity = sales.reduce((s, x) => s + x.quantity, 0);
  const avgSalePrice = salesCount > 0 ? totalSales / salesQuantity : 0;

  // Purchases count & avg
  const purchasesCount = purchases.length;
  const purchasesQuantity = purchases.reduce((s, x) => s + x.quantity, 0);
  const avgPurchasePrice = purchasesCount > 0 ? totalPurchases / purchasesQuantity : 0;

  const buildReportData = (): ReportData => ({
    totalAnimals: animals.length, sheepCount, goatCount, harriCount, najdiCount,
    mothersCount, youngCount, ramsCount, maleCount, femaleCount,
    totalBirths, birthsByFate,
    totalSales, salesCount, salesQuantity, avgSalePrice,
    totalPurchases, purchasesCount, purchasesQuantity, avgPurchasePrice,
    totalExpenses, expensesCount: expenses.length, expensesByCategory,
    netProfit: net,
  });

  const handleSaveReport = () => {
    const report: SavedReport = {
      id: Date.now().toString(),
      title: `تقرير سنة ${selectedYear}`,
      year: selectedYear,
      createdAt: new Date().toISOString(),
      data: buildReportData(),
    };
    const existing = JSON.parse(localStorage.getItem('livestock_reports') || '[]');
    existing.unshift(report);
    localStorage.setItem('livestock_reports', JSON.stringify(existing));
    toast({ title: 'تم حفظ التقرير', description: `تقرير سنة ${selectedYear} محفوظ في صفحة التقارير` });
  };

  const handleExport = async () => {
    const report: SavedReport = {
      id: 'export-' + Date.now(),
      title: `تقرير سنة ${selectedYear}`,
      year: selectedYear,
      createdAt: new Date().toISOString(),
      data: buildReportData(),
    };
    await generatePdfReport(report);
    toast({ title: 'تم التصدير', description: 'تم تحميل ملف PDF بنجاح' });
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="الملخص" subtitle="تقرير شامل عن القطيع والمالية" backTo="/" />

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="rounded-lg bg-card border border-border px-3 py-2 text-sm text-foreground"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <Button variant="outline" className="flex-1 gap-2" onClick={handleSaveReport}>
            <Save className="w-4 h-4" /> حفظ التقرير
          </Button>
          <Button variant="outline" className="flex-1 gap-2" onClick={handleExport}>
            <Download className="w-4 h-4" /> تصدير
          </Button>
        </div>

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

        {/* القطيع */}
        <SectionTitle icon={<Fence className="w-5 h-5 text-primary" />} title="إحصائيات القطيع" />
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard label="إجمالي القطيع" value={`${animals.length}`} unit="رأس" />
          <StatCard label="الضأن" value={`${sheepCount}`} unit="رأس" />
          <StatCard label="الماعز" value={`${goatCount}`} unit="رأس" />
          <StatCard label="حري" value={`${harriCount}`} unit="رأس" />
          <StatCard label="نجدي" value={`${najdiCount}`} unit="رأس" />
          <StatCard label="الأمهات" value={`${mothersCount}`} />
          <StatCard label="البهم" value={`${youngCount}`} />
          <StatCard label="الفحول" value={`${ramsCount}`} />
          <StatCard label="الذكور" value={`${maleCount}`} />
          <StatCard label="الإناث" value={`${femaleCount}`} />
        </div>

        {/* المواليد */}
        <SectionTitle icon={<Baby className="w-5 h-5 text-primary" />} title="إحصائيات المواليد" />
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard label="إجمالي المواليد" value={`${totalBirths}`} />
          {(['flock', 'sold', 'died', 'infant'] as OffspringFate[]).map(fate => (
            <StatCard key={fate} label={FATE_LABELS[fate]} value={`${birthsByFate[fate] || 0}`} />
          ))}
        </div>

        {/* المبيعات */}
        <SectionTitle icon={<TrendingUp className="w-5 h-5 text-success" />} title="المبيعات" />
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard label="إجمالي المبيعات" value={totalSales.toLocaleString()} unit="ر.س" className="text-success" />
          <StatCard label="عدد عمليات البيع" value={`${salesCount}`} />
          <StatCard label="عدد الرؤوس المباعة" value={`${salesQuantity}`} unit="رأس" />
          <StatCard label="متوسط سعر البيع" value={avgSalePrice > 0 ? avgSalePrice.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'} unit="ر.س" />
        </div>

        {/* المشتريات */}
        <SectionTitle icon={<ShoppingCart className="w-5 h-5 text-info" />} title="المشتريات" />
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard label="إجمالي المشتريات" value={totalPurchases.toLocaleString()} unit="ر.س" className="text-info" />
          <StatCard label="عدد عمليات الشراء" value={`${purchasesCount}`} />
          <StatCard label="عدد الرؤوس المشتراة" value={`${purchasesQuantity}`} unit="رأس" />
          <StatCard label="متوسط سعر الشراء" value={avgPurchasePrice > 0 ? avgPurchasePrice.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'} unit="ر.س" />
        </div>

        {/* المصروفات */}
        <SectionTitle icon={<Receipt className="w-5 h-5 text-destructive" />} title="المصروفات" />
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard label="إجمالي المصروفات" value={totalExpenses.toLocaleString()} unit="ر.س" className="text-destructive" />
          <StatCard label="عدد المصروفات" value={`${expenses.length}`} />
        </div>
        {Object.keys(expensesByCategory).length > 0 && (
          <div className="space-y-2 mb-6">
            {Object.entries(expensesByCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, amount]) => (
                <div key={cat} className="rounded-xl bg-card p-3 card-shadow flex justify-between items-center">
                  <span className="text-sm text-card-foreground">{cat}</span>
                  <span className="text-sm font-bold text-destructive">{amount.toLocaleString()} ر.س</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SectionTitle = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="flex items-center gap-2 mb-3">
    {icon}
    <h2 className="text-lg font-bold text-foreground">{title}</h2>
  </div>
);

const StatCard = ({ label, value, unit, className }: { label: string; value: string; unit?: string; className?: string }) => (
  <div className="rounded-xl bg-card p-4 card-shadow">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className={`text-xl font-extrabold ${className || 'text-foreground'}`}>
      {value}
      {unit && <span className="text-xs font-normal text-muted-foreground mr-1">{unit}</span>}
    </p>
  </div>
);

export default SummaryPage;
