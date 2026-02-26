import { useState, useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import { useLivestock } from '@/context/LivestockContext';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateExpensesReport } from '@/lib/generateSectionReport';
import { toast } from '@/hooks/use-toast';

type FilterMode = 'all' | 'monthly' | 'yearly';

const SummaryExpensesPage = () => {
  const { expenses } = useLivestock();
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const filtered = useMemo(() => {
    if (filterMode === 'yearly') return expenses.filter(e => e.date?.startsWith(`${selectedYear}`));
    if (filterMode === 'monthly') return expenses.filter(e => e.date?.startsWith(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`));
    return expenses;
  }, [expenses, filterMode, selectedYear, selectedMonth]);

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).sort(([, a], [, b]) => b - a);
  }, [filtered]);

  const handleExport = async () => {
    await generateExpensesReport(filtered);
    toast({ title: 'تم التصدير', description: 'تم تحميل تقرير المصروفات بنجاح' });
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="إحصائيات المصروفات" subtitle="تفاصيل المصروفات" backTo="/summary" />

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
          <StatCard label="إجمالي المصروفات" value={total.toLocaleString()} unit="ر.س" className="text-destructive" />
          <StatCard label="عدد العمليات" value={`${filtered.length}`} />
        </div>

        <h3 className="text-lg font-bold text-foreground mb-3">حسب التصنيف</h3>
        <div className="space-y-2 mb-6">
          {byCategory.map(([cat, amount]) => (
            <div key={cat} className="rounded-xl bg-card p-4 card-shadow flex justify-between items-center">
              <span className="text-sm font-bold text-card-foreground">{cat}</span>
              <span className="text-sm font-bold text-destructive">{amount.toLocaleString()} ر.س</span>
            </div>
          ))}
        </div>

        <h3 className="text-lg font-bold text-foreground mb-3">تفاصيل العمليات</h3>
        <div className="space-y-2 mb-6">
          {filtered.slice().reverse().map(e => (
            <div key={e.id} className="rounded-xl bg-card p-4 card-shadow">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-card-foreground">{e.description}</p>
                  <p className="text-xs text-muted-foreground">{e.date} • {e.category}</p>
                </div>
                <span className="text-sm font-bold text-destructive">{e.amount.toLocaleString()} ر.س</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">لا توجد مصروفات</p>
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

export default SummaryExpensesPage;
