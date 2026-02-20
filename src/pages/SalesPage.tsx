import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { useLivestock } from '@/context/LivestockContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

const SalesPage = () => {
  const { sales, addSale, updateSale, getTotalSales } = useLivestock();
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [qty, setQty] = useState('1');
  const [buyer, setBuyer] = useState('');
  const [paymentType, setPaymentType] = useState<'cash' | 'debt'>('cash');
  const [amountPaid, setAmountPaid] = useState('');

  // Update debt dialog
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<string | null>(null);
  const [newPayment, setNewPayment] = useState('');

  const handleAdd = () => {
    const total = Number(amount);
    const paid = paymentType === 'cash' ? total : (Number(amountPaid) || 0);
    addSale({
      id: Date.now().toString(), date, description: desc, amount: total, quantity: Number(qty),
      buyer, paymentType, amountPaid: paid, remaining: total - paid > 0 ? total - paid : 0,
    });
    setOpen(false);
    setDesc(''); setAmount(''); setDate(''); setQty('1'); setBuyer(''); setPaymentType('cash'); setAmountPaid('');
  };

  const handleUpdatePayment = () => {
    const sale = sales.find(s => s.id === selectedSale);
    if (!sale) return;
    const payment = Number(newPayment) || 0;
    const newPaid = sale.amountPaid + payment;
    updateSale({ ...sale, amountPaid: newPaid, remaining: sale.amount - newPaid > 0 ? sale.amount - newPaid : 0 });
    setUpdateOpen(false); setNewPayment(''); setSelectedSale(null);
  };

  const totalDebts = sales.filter(s => s.paymentType === 'debt' && s.remaining > 0);
  const totalDebtAmount = totalDebts.reduce((sum, s) => sum + s.remaining, 0);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="المبيعات" subtitle={`الإجمالي: ${getTotalSales().toLocaleString()} ر.س`} backTo="/" />

        {totalDebts.length > 0 && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4 mb-4">
            <p className="text-sm font-bold text-destructive">⚠️ ديون مستحقة: {totalDebtAmount.toLocaleString()} ر.س ({totalDebts.length} عملية)</p>
          </div>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mb-4 gap-2"><Plus className="w-4 h-4" /> إضافة بيع</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>إضافة عملية بيع</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-3">
              <div><Label>الوصف</Label><Input value={desc} onChange={e => setDesc(e.target.value)} /></div>
              <div><Label>المبلغ</Label><Input type="number" value={amount} onChange={e => setAmount(e.target.value)} /></div>
              <div><Label>العدد</Label><Input type="number" value={qty} onChange={e => setQty(e.target.value)} /></div>
              <div><Label>المشتري</Label><Input value={buyer} onChange={e => setBuyer(e.target.value)} /></div>
              <div><Label>التاريخ</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
              <div>
                <Label>حالة الدفع</Label>
                <Select value={paymentType} onValueChange={v => setPaymentType(v as 'cash' | 'debt')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقد</SelectItem>
                    <SelectItem value="debt">دين</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {paymentType === 'debt' && (
                <div><Label>المبلغ المقبوض</Label><Input type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} /></div>
              )}
              <Button onClick={handleAdd} className="w-full">حفظ</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Update debt dialog */}
        <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>تحديث المبلغ المقبوض</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-3">
              <div><Label>مبلغ جديد مقبوض</Label><Input type="number" value={newPayment} onChange={e => setNewPayment(e.target.value)} /></div>
              <Button onClick={handleUpdatePayment} className="w-full">تحديث</Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="space-y-3">
          {sales.length === 0 && <p className="text-center text-muted-foreground py-8">لا توجد مبيعات مسجلة</p>}
          {sales.map(s => (
            <div key={s.id} className="rounded-xl bg-card p-4 card-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-card-foreground">{s.description}</p>
                  <p className="text-xs text-muted-foreground">{s.date} • {s.quantity} رأس</p>
                  {s.buyer && <p className="text-xs text-muted-foreground">المشتري: {s.buyer}</p>}
                  {s.paymentType === 'debt' && (
                    <div className="mt-1 text-xs">
                      <span className="text-muted-foreground">مقبوض: {s.amountPaid.toLocaleString()}</span>
                      {s.remaining > 0 && (
                        <span className="text-destructive font-bold mr-2"> • متبقي: {s.remaining.toLocaleString()} ر.س</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <span className="font-bold text-success">{s.amount.toLocaleString()} ر.س</span>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.paymentType === 'cash' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                      {s.paymentType === 'cash' ? 'نقد' : 'دين'}
                    </span>
                    {s.paymentType === 'debt' && s.remaining > 0 && (
                      <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => { setSelectedSale(s.id); setUpdateOpen(true); }}>
                        تحديث
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
