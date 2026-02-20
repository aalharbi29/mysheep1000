import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { useLivestock } from '@/context/LivestockContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, FileText, Image } from 'lucide-react';
import { generatePurchasesReport, downloadSectionReportAsImage } from '@/lib/generateSectionReport';

const PurchasesPage = () => {
  const { purchases, addPurchase, getTotalPurchases } = useLivestock();
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [qty, setQty] = useState('1');

  const handleAdd = () => {
    addPurchase({ id: Date.now().toString(), date, description: desc, amount: Number(amount), quantity: Number(qty) });
    setOpen(false);
    setDesc(''); setAmount(''); setDate(''); setQty('1');
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="المشتريات" subtitle={`الإجمالي: ${getTotalPurchases().toLocaleString()} ر.س`} backTo="/" />

        {/* Report buttons */}
        {purchases.length > 0 && (
          <div className="flex gap-2 mb-4">
            <Button variant="outline" className="flex-1 gap-2 h-10 border-info/30 text-info hover:bg-info/10" onClick={() => generatePurchasesReport(purchases)}>
              <FileText className="w-4 h-4" /> تقرير PDF
            </Button>
            <Button variant="outline" className="flex-1 gap-2 h-10 border-info/30 text-info hover:bg-info/10" onClick={() => downloadSectionReportAsImage(purchases, 'purchases')}>
              <Image className="w-4 h-4" /> تقرير صورة
            </Button>
          </div>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mb-4 gap-2"><Plus className="w-4 h-4" /> إضافة شراء</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>إضافة عملية شراء</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-3">
              <div><Label>الوصف</Label><Input value={desc} onChange={e => setDesc(e.target.value)} /></div>
              <div><Label>المبلغ</Label><Input type="number" value={amount} onChange={e => setAmount(e.target.value)} /></div>
              <div><Label>العدد</Label><Input type="number" value={qty} onChange={e => setQty(e.target.value)} /></div>
              <div><Label>التاريخ</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
              <Button onClick={handleAdd} className="w-full">حفظ</Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="space-y-3">
          {purchases.length === 0 && <p className="text-center text-muted-foreground py-8">لا توجد مشتريات مسجلة</p>}
          {purchases.map(p => (
            <div key={p.id} className="rounded-xl bg-card p-4 card-shadow flex justify-between items-center">
              <div>
                <p className="font-semibold text-card-foreground">{p.description}</p>
                <p className="text-xs text-muted-foreground">{p.date} • {p.quantity} قطعة</p>
              </div>
              <span className="font-bold text-info">{p.amount.toLocaleString()} ر.س</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PurchasesPage;
