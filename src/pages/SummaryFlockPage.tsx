import { useState, useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import { useLivestock } from '@/context/LivestockContext';
import { CATEGORY_LABELS, SUB_CATEGORY_LABELS } from '@/types/animals';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateFlockReport } from '@/lib/generateSectionReport';
import { toast } from '@/hooks/use-toast';

type FilterMode = 'all' | 'monthly' | 'yearly';

const SummaryFlockPage = () => {
  const { animals } = useLivestock();
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const confirmed = useMemo(() => animals.filter(a => a.confirmed), [animals]);
  const alive = useMemo(() => confirmed.filter(a => a.status !== 'dead'), [confirmed]);

  const sheepCount = alive.filter(a => a.category === 'sheep').length;
  const goatCount = alive.filter(a => a.category === 'goat').length;
  const mothersCount = alive.filter(a => a.subCategory === 'mothers').length;
  const youngCount = alive.filter(a => a.subCategory === 'young').length;
  const ramsCount = alive.filter(a => a.subCategory === 'rams').length;
  const maleCount = alive.filter(a => a.gender === 'male').length;
  const femaleCount = alive.filter(a => a.gender === 'female').length;

  const breeds = useMemo(() => {
    const map: Record<string, { total: number; mothers: number; young: number; rams: number; males: number; females: number }> = {};
    alive.forEach(a => {
      const breed = a.breed;
      if (!map[breed]) map[breed] = { total: 0, mothers: 0, young: 0, rams: 0, males: 0, females: 0 };
      map[breed].total++;
      map[breed][a.subCategory]++;
      if (a.gender === 'male') map[breed].males++;
      else map[breed].females++;
    });
    return map;
  }, [alive]);

  const handleExport = async () => {
    await generateFlockReport(animals);
    toast({ title: 'تم التصدير', description: 'تم تحميل تقرير القطيع بنجاح' });
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="إحصائيات القطيع" subtitle="تفاصيل القطيع الحالي" backTo="/summary" />

        <div className="flex gap-2 mb-4 flex-wrap">
          <FilterButtons filterMode={filterMode} setFilterMode={setFilterMode} />
          {filterMode === 'yearly' && (
            <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="rounded-lg bg-card border border-border px-3 py-2 text-sm text-foreground">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          )}
          {filterMode === 'monthly' && (
            <>
              <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="rounded-lg bg-card border border-border px-3 py-2 text-sm text-foreground">
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="rounded-lg bg-card border border-border px-3 py-2 text-sm text-foreground">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('ar-SA', { month: 'long' })}</option>
                ))}
              </select>
            </>
          )}
          <Button variant="outline" className="gap-2 mr-auto" onClick={handleExport}>
            <Download className="w-4 h-4" /> تصدير
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard label="إجمالي القطيع" value={`${alive.length}`} unit="رأس" />
          <StatCard label="الضأن" value={`${sheepCount}`} unit="رأس" />
          <StatCard label="الماعز" value={`${goatCount}`} unit="رأس" />
          <StatCard label="الأمهات" value={`${mothersCount}`} />
          <StatCard label="البهم" value={`${youngCount}`} />
          <StatCard label="الفحول" value={`${ramsCount}`} />
          <StatCard label="الذكور" value={`${maleCount}`} />
          <StatCard label="الإناث" value={`${femaleCount}`} />
        </div>

        <h3 className="text-lg font-bold text-foreground mb-3">تفاصيل السلالات</h3>
        <div className="space-y-2 mb-6">
          {Object.entries(breeds).map(([breed, data]) => (
            <div key={breed} className="rounded-xl bg-card p-4 card-shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-card-foreground">{CATEGORY_LABELS[breed] || breed}</span>
                <span className="text-sm font-bold text-primary">{data.total} رأس</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-muted px-2 py-1 rounded-full text-muted-foreground">{SUB_CATEGORY_LABELS.mothers}: {data.mothers}</span>
                <span className="bg-muted px-2 py-1 rounded-full text-muted-foreground">{SUB_CATEGORY_LABELS.young}: {data.young}</span>
                <span className="bg-muted px-2 py-1 rounded-full text-muted-foreground">{SUB_CATEGORY_LABELS.rams}: {data.rams}</span>
                <span className="bg-muted px-2 py-1 rounded-full text-muted-foreground">ذكور: {data.males}</span>
                <span className="bg-muted px-2 py-1 rounded-full text-muted-foreground">إناث: {data.females}</span>
              </div>
            </div>
          ))}
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

export default SummaryFlockPage;
