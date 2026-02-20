import { useState } from 'react';
import { useLivestock } from '@/context/LivestockContext';
import { Animal } from '@/types/animals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface SellAnimalDialogProps {
  animal: Animal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSold?: () => void;
}

const SellAnimalDialog = ({ animal, open, onOpenChange, onSold }: SellAnimalDialogProps) => {
  const { addSale, deleteAnimal } = useLivestock();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [buyer, setBuyer] = useState('');
  const [paymentType, setPaymentType] = useState<'cash' | 'debt'>('cash');
  const [amountPaid, setAmountPaid] = useState('');

  const totalAmount = Number(amount) || 0;
  const paid = paymentType === 'cash' ? totalAmount : (Number(amountPaid) || 0);
  const remaining = totalAmount - paid;

  const handleSell = () => {
    if (!amount || !date) {
      toast({ title: 'خطأ', description: 'يرجى ملء جميع الحقول المطلوبة', variant: 'destructive' });
      return;
    }

    addSale({
      id: Date.now().toString(),
      date,
      animalId: animal.id,
      animalNumber: animal.number,
      animalBreed: animal.breed,
      animalSubCategory: animal.subCategory,
      animalGender: animal.gender,
      description: `بيع رقم ${animal.number} - ${animal.breed === 'harri' ? 'حري' : animal.breed === 'najdi' ? 'نجدي' : animal.breed}`,
      amount: totalAmount,
      quantity: 1,
      buyer,
      paymentType,
      amountPaid: paid,
      remaining: remaining > 0 ? remaining : 0,
    });

    deleteAnimal(animal.id);
    toast({ title: '✅ تم البيع بنجاح', description: `بطاقة رقم ${animal.number} - ${totalAmount.toLocaleString()} ر.س` });
    onOpenChange(false);
    onSold?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>💰 بيع بطاقة رقم {animal.number}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-3">
          <div>
            <Label>التاريخ</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <Label>السعر (ر.س)</Label>
            <Input type="number" placeholder="أدخل السعر" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div>
            <Label>المشتري</Label>
            <Input placeholder="اسم المشتري" value={buyer} onChange={e => setBuyer(e.target.value)} />
          </div>
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
            <>
              <div>
                <Label>المبلغ المقبوض</Label>
                <Input type="number" placeholder="0" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} />
              </div>
              <div className="rounded-lg bg-muted p-3 space-y-1">
                <p className="text-sm text-muted-foreground">الإجمالي: <span className="font-bold text-foreground">{totalAmount.toLocaleString()} ر.س</span></p>
                <p className="text-sm text-muted-foreground">المقبوض: <span className="font-bold text-foreground">{paid.toLocaleString()} ر.س</span></p>
                <p className="text-sm text-destructive font-bold">المتبقي: {remaining > 0 ? remaining.toLocaleString() : 0} ر.س</p>
              </div>
            </>
          )}
          <Button onClick={handleSell} className="w-full" disabled={!amount || !date}>
            تأكيد البيع
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SellAnimalDialog;
