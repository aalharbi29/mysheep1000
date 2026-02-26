import { useEffect, useState } from 'react';
import { useLivestock } from '@/context/LivestockContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const REMINDER_DAYS = [21, 22, 23, 24, 25, 26];

const DebtReminder = () => {
  const { sales, updateSale } = useLivestock();
  const [open, setOpen] = useState(false);
  const [debts, setDebts] = useState<typeof sales>([]);
  const [payments, setPayments] = useState<Record<string, string>>({});

  useEffect(() => {
    const now = new Date();
    const dayOfMonth = now.getDate();
    
    // Only show reminder on days 21-26
    if (!REMINDER_DAYS.includes(dayOfMonth)) return;
    
    const todayStr = now.toISOString().split('T')[0];
    const pendingDebts = sales.filter(s => {
      if (s.paymentType !== 'debt' || s.remaining <= 0) return false;
      // Don't re-show if already reminded today
      if (s.lastReminderDate === todayStr) return false;
      return true;
    });

    if (pendingDebts.length > 0) {
      setDebts(pendingDebts);
      setOpen(true);
    }
  }, [sales]);

  const handleUpdateDebt = (saleId: string) => {
    const newPayment = Number(payments[saleId]) || 0;
    const sale = sales.find(s => s.id === saleId);
    if (!sale || newPayment <= 0) return;

    const newPaid = sale.amountPaid + newPayment;
    const newRemaining = sale.amount - newPaid;

    updateSale({
      ...sale,
      amountPaid: newPaid,
      remaining: newRemaining > 0 ? newRemaining : 0,
      lastReminderDate: new Date().toISOString().split('T')[0],
    });

    setPayments(prev => ({ ...prev, [saleId]: '' }));
  };

  const handleDismiss = () => {
    // Update lastReminderDate for all shown debts to avoid re-showing
    debts.forEach(d => {
      updateSale({ ...d, lastReminderDate: new Date().toISOString().split('T')[0] });
    });
    setOpen(false);
  };

  if (debts.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>⏰ تذكير بالديون المستحقة</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-3">
          {debts.map(debt => (
            <div key={debt.id} className="rounded-xl bg-card p-4 border border-destructive/30 space-y-2">
              <p className="font-semibold text-card-foreground">{debt.description}</p>
              {debt.buyer && <p className="text-sm text-muted-foreground">المشتري: {debt.buyer}</p>}
              <p className="text-sm text-muted-foreground">التاريخ: {debt.date}</p>
              <div className="flex justify-between text-sm">
                <span>الإجمالي: {debt.amount.toLocaleString()} ر.س</span>
                <span>المقبوض: {debt.amountPaid.toLocaleString()} ر.س</span>
              </div>
              <p className="text-destructive font-bold">المتبقي: {debt.remaining.toLocaleString()} ر.س</p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label className="text-xs">إضافة مبلغ مقبوض</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={payments[debt.id] || ''}
                    onChange={e => setPayments(prev => ({ ...prev, [debt.id]: e.target.value }))}
                  />
                </div>
                <Button className="mt-5" size="sm" onClick={() => handleUpdateDebt(debt.id)}>
                  توصيل مبلغ
                </Button>
              </div>
              <Button
                variant="default"
                size="sm"
                className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  updateSale({ ...debt, amountPaid: debt.amount, remaining: 0, lastReminderDate: new Date().toISOString().split('T')[0] });
                  setDebts(prev => prev.filter(d => d.id !== debt.id));
                  toast({ title: '✅ تم السداد الكامل', description: debt.description });
                }}
              >
                ✅ تأكيد سداد المبلغ كامل
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={handleDismiss} className="w-full">
            تأجيل التذكير
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DebtReminder;
