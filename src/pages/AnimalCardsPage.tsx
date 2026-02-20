import { useParams, useLocation } from 'react-router-dom';
import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import AnimalGrid from '@/components/AnimalGrid';
import { useLivestock } from '@/context/LivestockContext';
import { getDefaultColor, getMotherDefaultColor } from '@/context/LivestockContext';
import { CATEGORY_LABELS, SUB_CATEGORY_LABELS, type AnimalSubCategory, type AnimalGender } from '@/types/animals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AnimalCardsPage = () => {
  const { breed: breedParam, subCategory } = useParams<{ breed: string; subCategory: string }>();
  const location = useLocation();
  const { addAnimal } = useLivestock();

  const isGoat = location.pathname.startsWith('/flock/goat');
  const breed = isGoat ? 'goat' : (breedParam || '');
  const sub = (isGoat ? (breedParam || subCategory) : subCategory) as AnimalSubCategory || 'mothers';

  const breedLabel = CATEGORY_LABELS[breed] || breed;
  const subLabel = SUB_CATEGORY_LABELS[sub] || sub;
  const backTo = isGoat ? '/flock/goat' : `/flock/sheep/${breed}`;

  const [open, setOpen] = useState(false);
  const [newNumber, setNewNumber] = useState('');
  const [newGender, setNewGender] = useState<AnimalGender>(sub === 'rams' ? 'male' : 'female');

  const handleAddAnimal = () => {
    const num = Number(newNumber);
    if (!num || num <= 0) {
      toast({ title: 'خطأ', description: 'يرجى إدخال رقم صحيح', variant: 'destructive' });
      return;
    }

    const color = sub === 'mothers'
      ? getMotherDefaultColor(breed)
      : getDefaultColor(breed, newGender, sub);

    addAnimal({
      id: `${breed}-${sub}-${num}-${Date.now()}`,
      number: num,
      category: (isGoat ? 'goat' : 'sheep') as any,
      breed: breed as any,
      gender: newGender,
      subCategory: sub,
      color,
      birthDate: '',
      birthRecords: [],
      status: 'alive',
    });

    toast({ title: '✅ تمت الإضافة', description: `بطاقة رقم ${num} - ${subLabel}` });
    setOpen(false);
    setNewNumber('');
    setNewGender(sub === 'rams' ? 'male' : 'female');
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title={`${subLabel} - ${breedLabel}`}
          subtitle={`عرض بطاقات ${subLabel}`}
          backTo={backTo}
        />

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mb-4 gap-2">
              <Plus className="w-4 h-4" /> إضافة رقم جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة بطاقة جديدة - {subLabel}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-3">
              <div>
                <Label>رقم البطاقة</Label>
                <Input
                  type="number"
                  placeholder="أدخل رقم البطاقة"
                  value={newNumber}
                  onChange={e => setNewNumber(e.target.value)}
                />
              </div>
              {sub !== 'mothers' && (
                <div>
                  <Label>النوع</Label>
                  <Select value={newGender} onValueChange={v => setNewGender(v as AnimalGender)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">ذكر</SelectItem>
                      <SelectItem value="female">أنثى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button onClick={handleAddAnimal} className="w-full" disabled={!newNumber}>
                إضافة
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <AnimalGrid
          breed={breed}
          category={isGoat ? 'goat' : 'sheep'}
          subCategory={sub}
        />
      </div>
    </div>
  );
};

export default AnimalCardsPage;
