import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ARABIC_MONTHS = [
'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];


interface MonthlyGroupProps {
  monthKey: string; // "2025-01"
  total: number;
  paid?: number;
  remaining?: number;
  count: number;
  children: React.ReactNode;
  variant?: 'sales' | 'purchases' | 'expenses';
}

const MonthlyGroup = ({ monthKey, total, paid, remaining, count, children, variant = 'sales' }: MonthlyGroupProps) => {
  const [open, setOpen] = useState(false);

  const [year, monthNum] = monthKey.split('-');
  const monthName = ARABIC_MONTHS[parseInt(monthNum, 10) - 1] || monthKey;

  const colorClass = variant === 'sales' ? 'text-success' : variant === 'purchases' ? 'text-info' : 'text-destructive';
  const bgClass = variant === 'sales' ? 'bg-success/5 border-success/20' : variant === 'purchases' ? 'bg-info/5 border-info/20' : 'bg-destructive/5 border-destructive/20';

  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full rounded-xl ${bgClass} border p-4 text-right transition-colors hover:opacity-90`}>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            <span className="text-xs text-muted-foreground">{count} عملية</span>
          </div>
          <div className="text-right">
            <h3 className="text-card-foreground text-lg font-extrabold">{monthName} {year}</h3>
          </div>
        </div>
        <div className="flex gap-4 mt-2 justify-end flex-wrap">
          <div className="text-center">
            <p className="text-muted-foreground font-bold text-xs">الإجمالي</p>
            <p className={`text-sm font-bold ${colorClass}`}>{total.toLocaleString()} ر.س</p>
          </div>
          {paid !== undefined &&
          <div className="text-center">
              <p className="text-[10px] text-muted-foreground">المقبوض</p>
              <p className="text-sm font-bold text-success">{paid.toLocaleString()} ر.س</p>
            </div>
          }
          {remaining !== undefined && remaining > 0 &&
          <div className="text-center">
              <p className="text-[10px] text-muted-foreground">المتبقي</p>
              <p className="text-sm font-bold text-destructive">{remaining.toLocaleString()} ر.س</p>
            </div>
          }
        </div>
      </button>
      {open &&
      <div className="mt-2 space-y-2 pr-2">
          {children}
        </div>
      }
    </div>);

};

export function groupByMonth<T extends {date: string;}>(items: T[]): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  items.forEach((item) => {
    const key = item.date?.slice(0, 7) || 'unknown';
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  // Sort by month descending
  const sorted: Record<string, T[]> = {};
  Object.keys(groups).sort((a, b) => b.localeCompare(a)).forEach((k) => {
    sorted[k] = groups[k];
  });
  return sorted;
}

export default MonthlyGroup;