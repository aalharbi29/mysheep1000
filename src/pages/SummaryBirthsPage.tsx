import { useState, useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import { useLivestock } from '@/context/LivestockContext';
import { FATE_LABELS, CATEGORY_LABELS, type OffspringFate } from '@/types/animals';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

type FilterMode = 'all' | 'monthly' | 'yearly';

const SummaryBirthsPage = () => {
  const { animals } = useLivestock();
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const confirmed = useMemo(() => animals.filter(a => a.confirmed), [animals]);

  const filteredOffspring = useMemo(() => {
    const all = confirmed.flatMap(a => a.birthRecords.flatMap(r => r.offspring.map(o => ({ ...o, breed: a.breed, parentBirthDate: r.date }))));
    if (filterMode === 'yearly') return all.filter(o => o.parentBirthDate?.startsWith(`${selectedYear}`));
    if (filterMode === 'monthly') return all.filter(o => o.parentBirthDate?.startsWith(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`));
    return all;
  }, [confirmed, filterMode, selectedYear, selectedMonth]);

  const totalBirths = filteredOffspring.length;
  const birthsByFate: Record<string, number> = {};
  filteredOffspring.forEach(o => { birthsByFate[o.fate] = (birthsByFate[o.fate] || 0) + 1; });

  const birthsByBreed = useMemo(() => {
    const map: Record<string, number> = {};
    filteredOffspring.forEach(o => { map[o.breed] = (map[o.breed] || 0) + 1; });
    return map;
  }, [filteredOffspring]);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="إحصائيات المواليد" subtitle="تفاصيل مواليد القطيع" backTo="/summary" />

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
          <Button variant="outline" className="gap-2 mr-auto" onClick={() => toast({ title: 'قريباً', description: 'سيتم إضافة تصدير تقرير المواليد' })}>
            <Download className="w-4 h-4" /> تصدير
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard label="إجمالي المواليد" value={`${totalBirths}`} />
          {(['flock', 'sold', 'died', 'infant', 'stillborn'] as OffspringFate[]).map(fate => (
            <StatCard key={fate} label={FATE_LABELS[fate]} value={`${birthsByFate[fate] || 0}`} />
          ))}
        </div>

        <h3 className="text-lg font-bold text-foreground mb-3">المواليد حسب السلالة</h3>
        <div className="space-y-2 mb-6">
          {Object.entries(birthsByBreed).map(([breed, count]) => (
            <div key={breed} className="rounded-xl bg-card p-4 card-shadow flex justify-between items-center">
              <span className="font-bold text-card-foreground">{CATEGORY_LABELS[breed] || breed}</span>
              <span className="text-sm font-bold text-primary">{count} مولود</span>
            </div>
          ))}
          {Object.keys(birthsByBreed).length === 0 && (
            <p className="text-center text-muted-foreground py-8">لا توجد مواليد</p>
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

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-card p-4 card-shadow">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className="text-xl font-extrabold text-foreground">{value}</p>
  </div>
);

export default SummaryBirthsPage;
