import { useParams, useLocation } from 'react-router-dom';
import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import AnimalGrid from '@/components/AnimalGrid';
import { useLivestock } from '@/context/LivestockContext';
import { getDefaultColor, getMotherDefaultColor } from '@/context/LivestockContext';
import { CATEGORY_LABELS, SUB_CATEGORY_LABELS, TAG_COLORS, type AnimalSubCategory, type AnimalGender } from '@/types/animals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Palette } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AnimalCardsPage = () => {
  const { breed, subCategory } = useParams<{ breed: string; subCategory: string }>();
  const location = useLocation();
  const { addAnimal, updateAllColors } = useLivestock();

  const isGoat = location.pathname.startsWith('/flock/goat');
  const breedId = breed || '';
  const sub = (subCategory as AnimalSubCategory) || 'mothers';
  const category = isGoat ? 'goat' : 'sheep';

  const breedLabel = CATEGORY_LABELS[breedId] || breedId;
  const subLabel = SUB_CATEGORY_LABELS[sub] || sub;
  const backTo = isGoat ? `/flock/goat/${breedId}` : `/flock/sheep/${breedId}`;

  const [open, setOpen] = useState(false);
  const [newNumber, setNewNumber] = useState('');
  const [newGender, setNewGender] = useState<AnimalGender>(sub === 'rams' ? 'male' : 'female');
  const [newColor, setNewColor] = useState('');

  const [colorOpen, setColorOpen] = useState(false);
  const [bulkColor, setBulkColor] = useState('');

  const handleAddAnimal = () => {
    const num = Number(newNumber);
    if (!num || num <= 0) {
      toast({ title: 'خطأ', description: 'يرجى إدخال رقم صحيح', variant: 'destructive' });
      return;
    }

    const color = newColor || (sub === 'mothers'
      ? getMotherDefaultColor(breedId)
      : getDefaultColor(breedId, newGender, sub));

    addAnimal({
      id: `${breedId}-${sub}-${num}-${Date.now()}`,
      number: num,
      category: category as any,
      breed: breedId as any,
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
    setNewColor('');
    setNewGender(sub === 'rams' ? 'male' : 'female');
  };

  const handleBulkColor = () => {
    if (!bulkColor) return;
    updateAllColors(breedId, sub, bulkColor);
    toast({ title: '🎨 تم تغيير اللون', description: `تم تغيير لون جميع بطاقات ${subLabel} إلى ${bulkColor}` });
    setColorOpen(false);
    setBulkColor('');
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title={`${subLabel} - ${breedLabel}`}
          subtitle={`عرض بطاقات ${subLabel}`}
          backTo={backTo}
        />

        <div className="flex gap-2 mb-4">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 gap-2">
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
                <div>
                  <Label>لون البطاقة (اختياري)</Label>
                  <Select value={newColor} onValueChange={setNewColor}>
                    <SelectTrigger><SelectValue placeholder="اللون الافتراضي" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(TAG_COLORS).map(([name, hex]) => (
                        <SelectItem key={name} value={name}>
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full inline-block border border-border" style={{ backgroundColor: hex }} />
                            {name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddAnimal} className="w-full" disabled={!newNumber}>
                  إضافة
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={colorOpen} onOpenChange={setColorOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Palette className="w-4 h-4" /> تغيير لون الكل
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>🎨 تغيير لون جميع البطاقات</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-3">
                <p className="text-sm text-muted-foreground">سيتم تغيير لون جميع بطاقات {subLabel} في {breedLabel}</p>
                <div className="grid grid-cols-4 gap-3">
                  {Object.entries(TAG_COLORS).map(([name, hex]) => (
                    <button
                      key={name}
                      onClick={() => setBulkColor(name)}
                      className={`rounded-xl p-3 text-center border-2 transition-all ${bulkColor === name ? 'border-primary scale-105 ring-2 ring-primary/30' : 'border-transparent'}`}
                      style={{ backgroundColor: hex }}
                    >
                      <span className={`text-xs font-bold ${['بني', 'أزرق', 'بنفسجي', 'أسود'].includes(name) ? 'text-white' : 'text-foreground'}`}>
                        {name}
                      </span>
                    </button>
                  ))}
                </div>
                <Button onClick={handleBulkColor} className="w-full" disabled={!bulkColor}>
                  تطبيق اللون على الكل
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <AnimalGrid
          breed={breedId}
          category={category}
          subCategory={sub}
        />
      </div>
    </div>
  );
};

export default AnimalCardsPage;
