import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { useLivestock } from '@/context/LivestockContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

const ExpensesPage = () => {
  const { expenses, addExpense, getTotalExpenses } = useLivestock();
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');

  const handleAdd = () => {
    addExpense({
      id: Date.now().toString(),
      date,
      description: desc,
      amount: Number(amount),
      category,
    });
    setOpen(false);
    setDesc(''); setAmount(''); setDate(''); setCategory('');
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="المصروفات" subtitle={`الإجمالي: ${getTotalExpenses().toLocaleString()} ر.س`} backTo="/" />

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mb-4 gap-2"><Plus className="w-4 h-4" /> إضافة مصروف</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>إضافة مصروف جديد</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-3">
              <div><Label>الوصف</Label><Input value={desc} onChange={e => setDesc(e.target.value)} /></div>
              <div><Label>المبلغ</Label><Input type="number" value={amount} onChange={e => setAmount(e.target.value)} /></div>
              <div><Label>التاريخ</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
              <div><Label>التصنيف</Label><Input value={category} onChange={e => setCategory(e.target.value)} placeholder="علف، أدوية..." /></div>
              <Button onClick={handleAdd} className="w-full">حفظ</Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="space-y-3">
          {expenses.length === 0 && <p className="text-center text-muted-foreground py-8">لا توجد مصروفات مسجلة</p>}
          {expenses.map(e => (
            <div key={e.id} className="rounded-xl bg-card p-4 card-shadow flex justify-between items-center">
              <div>
                <p className="font-semibold text-card-foreground">{e.description}</p>
                <p className="text-xs text-muted-foreground">{e.date} {e.category && `• ${e.category}`}</p>
              </div>
              <span className="font-bold text-destructive">{e.amount.toLocaleString()} ر.س</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;
