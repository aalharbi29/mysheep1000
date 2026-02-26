import { useState, useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import { useLivestock } from '@/context/LivestockContext';
import { CATEGORY_LABELS, SUB_CATEGORY_LABELS } from '@/types/animals';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateSalesReport } from '@/lib/generateSectionReport';
import { toast } from '@/hooks/use-toast';

type FilterMode = 'all' | 'monthly' | 'yearly';

const SummarySalesPage = () => {
  const { sales } = useLivestock();
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const filteredSales = useMemo(() => {
    if (filterMode === 'yearly') return sales.filter(s => s.date?.startsWith(`${selectedYear}`));
    if (filterMode === 'monthly') return sales.filter(s => s.date?.startsWith(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`));
    return sales;
  }, [sales, filterMode, selectedYear, selectedMonth]);

  const totalSales = filteredSales.reduce((s, x) => s + x.amount, 0);
  const totalPaid = filteredSales.reduce((s, x) => s + x.amountPaid, 0);
  const totalRemaining = filteredSales.reduce((s, x) => s + x.remaining, 0);
  const totalQty = filteredSales.reduce((s, x) => s + x.quantity, 0);
  const avgPrice = totalQty > 0 ? Math.round(totalSales / totalQty) : 0;

  const salesByBreed = useMemo(() => {
    const map: Record<string, { total: number; qty: number; bySubCat: Record<string, { total: number; qty: number }> }> = {};
    filteredSales.forEach(s => {
      const breed = s.animalBreed || 'غير محدد';
      if (!map[breed]) map[breed] = { total: 0, qty: 0, bySubCat: {} };
      map[breed].total += s.amount;
      map[breed].qty += s.quantity;
      const sub = s.animalSubCategory || 'غير محدد';
      if (!map[breed].bySubCat[sub]) map[breed].bySubCat[sub] = { total: 0, qty: 0 };
      map[breed].bySubCat[sub].total += s.amount;
      map[breed].bySubCat[sub].qty += s.quantity;
    });
    return map;
  }, [filteredSales]);

  const handleExport = async () => {
    await generateSalesReport(filteredSales);
    toast({ title: 'تم التصدير', description: 'تم تحميل تقرير المبيعات بنجاح' });
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="إحصائيات المبيعات" subtitle="تفاصيل المبيعات" backTo="/summary" />

        <div className="flex gap-2 mb-4 flex-wrap">
          <FilterButtons filterMode={filterMode} setFilterMode={setFilterMode} />
          {(filterMode === 'yearly' || filterMode === 'monthly') && (
            <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="rounded-lg bg-card border border-border px-3 py-2 text-sm text-foreground">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          )}
          {filterMode === 'monthly' && (
            <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="rounded-lg bg-card border border-border px-3 py-2 text-sm text-foreground">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('ar-SA', { month: 'long' })}</option>
              ))}
            </select>
          )}
          <Button variant="outline" className="gap-2 mr-auto" onClick={handleExport}>
            <Download className="w-4 h-4" /> تصدير
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard label="إجمالي المبيعات" value={totalSales.toLocaleString()} unit="ر.س" className="text-success" />
          <StatCard label="المقبوض" value={totalPaid.toLocaleString()} unit="ر.س" className="text-primary" />
          <StatCard label="المتبقي (ديون)" value={totalRemaining.toLocaleString()} unit="ر.س" className="text-destructive" />
          <StatCard label="عدد الرؤوس" value={`${totalQty}`} unit="رأس" />
          <StatCard label="عدد العمليات" value={`${filteredSales.length}`} />
          <StatCard label="متوسط سعر الرأس" value={avgPrice.toLocaleString()} unit="ر.س" />
        </div>

        <h3 className="text-lg font-bold text-foreground mb-3">تفصيل حسب السلالة</h3>
        <div className="space-y-2 mb-6">
          {Object.entries(salesByBreed).map(([breed, data]) => (
            <div key={breed} className="rounded-xl bg-card p-4 card-shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-card-foreground">{CATEGORY_LABELS[breed] || breed}</span>
                <span className="text-sm font-bold text-success">{data.total.toLocaleString()} ر.س ({data.qty} رأس)</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {Object.entries(data.bySubCat).map(([sub, subData]) => (
                  <span key={sub} className="bg-muted px-2 py-1 rounded-full text-muted-foreground">
                    {SUB_CATEGORY_LABELS[sub as keyof typeof SUB_CATEGORY_LABELS] || sub}: {subData.qty} رأس • {subData.total.toLocaleString()} ر.س
                  </span>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(salesByBreed).length === 0 && (
            <p className="text-center text-muted-foreground py-8">لا توجد مبيعات</p>
          )}
        </div>
      </div>
    </div>
  );
};

const FilterButtons = ({ filterMode, setFilterMode }: { filterMode: string; setFilterMode: (m: any) => void }) => (
  <div className="flex rounded-lg border border-border overflow-hidden">
    {[{ key: 'all', label: 'الكل' }, { key: 'monthly', label: 'شهري' }, { key: 'yearly', label: 'سنوي' }].map(f => (
      <button key={f.key} onClick={() => setFilterMode(f.key)}
        className={`px-3 py-2 text-sm font-medium transition-colors ${filterMode === f.key ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'}`}>
        {f.label}
      </button>
    ))}
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

export default SummarySalesPage;
