import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { useLivestock } from '@/context/LivestockContext';
import { CATEGORY_LABELS, SUB_CATEGORY_LABELS } from '@/types/animals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Undo2, RefreshCw, FileText, Image } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { generateSalesReport, downloadSectionReportAsImage } from '@/lib/generateSectionReport';
import AddSaleWizard from '@/components/AddSaleWizard';

const SalesPage = () => {
  const { sales, addSale, updateSale, cancelSale, getTotalSales } = useLivestock();
  const [open, setOpen] = useState(false);

  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<string | null>(null);
  const [newPayment, setNewPayment] = useState('');

  const handleUpdatePayment = () => {
    const sale = sales.find(s => s.id === selectedSale);
    if (!sale) return;
    const payment = Number(newPayment) || 0;
    const newPaid = sale.amountPaid + payment;
    updateSale({ ...sale, amountPaid: newPaid, remaining: sale.amount - newPaid > 0 ? sale.amount - newPaid : 0 });
    setUpdateOpen(false); setNewPayment(''); setSelectedSale(null);
  };

  const handleCancelSale = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;
    if (confirm('هل أنت متأكد من إلغاء عملية البيع؟ سيتم إعادة الحيوان للقطيع.')) {
      cancelSale(sale);
      toast({ title: '↩️ تم إلغاء البيع', description: sale.animalNumber ? `تم إعادة بطاقة رقم ${sale.animalNumber} للقطيع` : 'تم حذف عملية البيع' });
    }
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

        {/* Report buttons */}
        {sales.length > 0 && (
          <div className="flex gap-2 mb-4">
            <Button variant="outline" className="flex-1 gap-2 h-10 border-primary/30 text-primary hover:bg-primary/10" onClick={() => generateSalesReport(sales)}>
              <FileText className="w-4 h-4" /> تقرير PDF
            </Button>
            <Button variant="outline" className="flex-1 gap-2 h-10 border-primary/30 text-primary hover:bg-primary/10" onClick={() => downloadSectionReportAsImage(sales, 'sales')}>
              <Image className="w-4 h-4" /> تقرير صورة
            </Button>
          </div>
        )}

        <Button className="w-full mb-4 gap-2" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" /> إضافة عملية بيع
        </Button>

        <AddSaleWizard open={open} onOpenChange={setOpen} />

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
                  {s.animalBreed && <p className="text-xs text-muted-foreground">السلالة: {CATEGORY_LABELS[s.animalBreed] || s.animalBreed}</p>}
                  {s.animalSubCategory && <p className="text-xs text-muted-foreground">القسم: {SUB_CATEGORY_LABELS[s.animalSubCategory] || s.animalSubCategory}</p>}
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
                  </div>
                  <div className="flex gap-1 mt-2">
                    {s.paymentType === 'debt' && s.remaining > 0 && (
                      <Button
                        size="sm"
                        variant="default"
                        className="h-8 text-xs px-3 gap-1 bg-primary hover:bg-primary/90"
                        onClick={() => { setSelectedSale(s.id); setUpdateOpen(true); }}
                      >
                        <RefreshCw className="w-3 h-3" /> تحديث
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 text-xs px-3 gap-1"
                      onClick={() => handleCancelSale(s.id)}
                    >
                      <Undo2 className="w-3 h-3" /> إلغاء
                    </Button>
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
