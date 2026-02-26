import { useState } from 'react';
import { useLivestock } from '@/context/LivestockContext';
import { SHEEP_BREEDS, GOAT_BREEDS, CATEGORY_LABELS } from '@/types/animals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AddSaleWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'size' | 'type' | 'breed' | 'details';

const AddSaleWizard = ({ open, onOpenChange }: AddSaleWizardProps) => {
  const { addSale } = useLivestock();
  const [step, setStep] = useState<Step>('size');
  const [sizeCategory, setSizeCategory] = useState<'big' | 'small' | ''>('');
  const [animalType, setAnimalType] = useState<'sheep' | 'goat' | ''>('');
  const [breed, setBreed] = useState('');

  // Details
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [maleCount, setMaleCount] = useState('');
  const [femaleCount, setFemaleCount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [buyer, setBuyer] = useState('');
  const [paymentType, setPaymentType] = useState<'cash' | 'debt'>('cash');
  const [amountPaid, setAmountPaid] = useState('');

  const totalAmount = (Number(quantity) || 0) * (Number(unitPrice) || 0);
  const paid = paymentType === 'cash' ? totalAmount : (Number(amountPaid) || 0);
  const remaining = totalAmount - paid;

  const reset = () => {
    setStep('size');
    setSizeCategory('');
    setAnimalType('');
    setBreed('');
    setQuantity('');
    setUnitPrice('');
    setMaleCount('');
    setFemaleCount('');
    setDate(new Date().toISOString().split('T')[0]);
    setBuyer('');
    setPaymentType('cash');
    setAmountPaid('');
  };

  const handleClose = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

  const goBack = () => {
    if (step === 'details') setStep('breed');
    else if (step === 'breed') setStep('type');
    else if (step === 'type') setStep('size');
  };

  const handleSelectSize = (size: 'big' | 'small') => {
    setSizeCategory(size);
    setStep('type');
  };

  const handleSelectType = (type: 'sheep' | 'goat') => {
    setAnimalType(type);
    setStep('breed');
  };

  const handleSelectBreed = (b: string) => {
    setBreed(b);
    setStep('details');
  };

  const breeds = animalType === 'sheep' ? SHEEP_BREEDS : animalType === 'goat' ? GOAT_BREEDS : [];

  const handleSubmit = () => {
    if (!quantity || !unitPrice || !date) {
      toast({ title: 'خطأ', description: 'يرجى ملء جميع الحقول المطلوبة', variant: 'destructive' });
      return;
    }

    const sizeLabel = sizeCategory === 'big' ? 'كبير' : 'صغير (بهم)';
    const typeLabel = CATEGORY_LABELS[animalType] || animalType;
    const breedLabel = CATEGORY_LABELS[breed] || breed;
    const subCat = sizeCategory === 'small' ? 'young' : undefined;

    addSale({
      id: Date.now().toString(),
      date,
      description: `بيع ${sizeLabel} - ${typeLabel} - ${breedLabel} (${quantity} رأس)`,
      amount: totalAmount,
      quantity: Number(quantity),
      buyer,
      paymentType,
      amountPaid: paid,
      remaining: remaining > 0 ? remaining : 0,
      animalBreed: breed,
      animalSubCategory: subCat as any,
      animalGender: Number(maleCount) > 0 && Number(femaleCount) === 0 ? 'male' : Number(femaleCount) > 0 && Number(maleCount) === 0 ? 'female' : undefined,
    });

    toast({ title: '✅ تم تسجيل البيع', description: `${totalAmount.toLocaleString()} ر.س` });
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step !== 'size' && (
              <button onClick={goBack} className="text-primary hover:opacity-70">
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
            <span>
              {step === 'size' && '📦 اختر الحجم'}
              {step === 'type' && '🐑 اختر النوع'}
              {step === 'breed' && '🏷️ اختر الفصيلة'}
              {step === 'details' && '💰 بيانات البيع'}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Size */}
        {step === 'size' && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <button
              onClick={() => handleSelectSize('big')}
              className="rounded-xl border-2 border-primary/30 bg-card p-6 text-center hover:border-primary hover:bg-primary/5 transition-all"
            >
              <span className="text-4xl block mb-2">🐑</span>
              <span className="font-bold text-lg text-card-foreground">كبير</span>
              <p className="text-xs text-muted-foreground mt-1">أمهات / فحول</p>
            </button>
            <button
              onClick={() => handleSelectSize('small')}
              className="rounded-xl border-2 border-primary/30 bg-card p-6 text-center hover:border-primary hover:bg-primary/5 transition-all"
            >
              <span className="text-4xl block mb-2">🐣</span>
              <span className="font-bold text-lg text-card-foreground">صغير</span>
              <p className="text-xs text-muted-foreground mt-1">بهم</p>
            </button>
          </div>
        )}

        {/* Step 2: Type */}
        {step === 'type' && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <button
              onClick={() => handleSelectType('sheep')}
              className="rounded-xl border-2 border-primary/30 bg-card p-6 text-center hover:border-primary hover:bg-primary/5 transition-all"
            >
              <span className="text-4xl block mb-2">🐏</span>
              <span className="font-bold text-lg text-card-foreground">ضأن</span>
            </button>
            <button
              onClick={() => handleSelectType('goat')}
              className="rounded-xl border-2 border-primary/30 bg-card p-6 text-center hover:border-primary hover:bg-primary/5 transition-all"
            >
              <span className="text-4xl block mb-2">🐐</span>
              <span className="font-bold text-lg text-card-foreground">ماعز</span>
            </button>
          </div>
        )}

        {/* Step 3: Breed */}
        {step === 'breed' && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {breeds.map(b => (
              <button
                key={b.id}
                onClick={() => handleSelectBreed(b.id)}
                className="rounded-xl border-2 border-primary/30 bg-card p-4 text-center hover:border-primary hover:bg-primary/5 transition-all"
              >
                <span className="font-bold text-card-foreground">{b.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 4: Details */}
        {step === 'details' && (
          <div className="space-y-3 mt-3">
            <div className="rounded-lg bg-muted/50 p-3 text-sm text-center font-semibold text-foreground">
              {sizeCategory === 'big' ? 'كبير' : 'بهم'} • {CATEGORY_LABELS[animalType] || animalType} • {CATEGORY_LABELS[breed] || breed}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>العدد</Label>
                <Input type="number" placeholder="0" value={quantity} onChange={e => setQuantity(e.target.value)} />
              </div>
              <div>
                <Label>السعر الإفرادي</Label>
                <Input type="number" placeholder="0" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>عدد الذكور</Label>
                <Input type="number" placeholder="0" value={maleCount} onChange={e => setMaleCount(e.target.value)} />
              </div>
              <div>
                <Label>عدد الإناث</Label>
                <Input type="number" placeholder="0" value={femaleCount} onChange={e => setFemaleCount(e.target.value)} />
              </div>
            </div>

            <div>
              <Label>المشتري</Label>
              <Input placeholder="اسم المشتري" value={buyer} onChange={e => setBuyer(e.target.value)} />
            </div>

            <div>
              <Label>تاريخ البيع</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>

            <div>
              <Label>حالة الدفع</Label>
              <Select value={paymentType} onValueChange={v => setPaymentType(v as 'cash' | 'debt')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">كاش (نقد)</SelectItem>
                  <SelectItem value="debt">دين</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentType === 'debt' && (
              <div>
                <Label>المبلغ المقبوض</Label>
                <Input type="number" placeholder="0" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} />
              </div>
            )}

            {/* Auto total */}
            <div className="rounded-xl bg-muted p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">العدد × السعر الإفرادي</span>
                <span className="font-bold text-foreground">{Number(quantity) || 0} × {Number(unitPrice) || 0}</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-border pt-2">
                <span className="text-foreground">الإجمالي</span>
                <span className="text-primary">{totalAmount.toLocaleString()} ر.س</span>
              </div>
              {paymentType === 'debt' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">المقبوض</span>
                    <span className="text-foreground">{paid.toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-destructive">المتبقي</span>
                    <span className="text-destructive">{remaining > 0 ? remaining.toLocaleString() : 0} ر.س</span>
                  </div>
                </>
              )}
              {(Number(maleCount) > 0 || Number(femaleCount) > 0) && (
                <div className="flex justify-between text-xs text-muted-foreground border-t border-border pt-2">
                  <span>ذكور: {maleCount || 0}</span>
                  <span>إناث: {femaleCount || 0}</span>
                </div>
              )}
            </div>

            <Button onClick={handleSubmit} className="w-full" disabled={!quantity || !unitPrice || !date}>
              تأكيد البيع
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddSaleWizard;
