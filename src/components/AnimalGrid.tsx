import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLivestock } from '@/context/LivestockContext';
import { ANIMAL_COLORS, GENDER_LABELS, CATEGORY_LABELS, SUB_CATEGORY_LABELS, AGE_OPTIONS, type AnimalSubCategory, type AnimalAge } from '@/types/animals';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Check, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';

interface AnimalGridProps {
  breed: string;
  category: string;
  subCategory: AnimalSubCategory;
}

// Returns best text color (white or dark) for a given background hex
// Colors that should always use black text
const LIGHT_BG_COLORS = ['#F5F0E8', '#E53E3E', '#ECC94B', '#DD6B20', '#38A169', '#ED64A6', '#A0AEC0', '#D4AF37'];

function getContrastTextColor(hexBg: string): string {
  if (LIGHT_BG_COLORS.includes(hexBg)) return '#1a1a1a';
  return '#ffffff';
}

function getContrastSubColor(hexBg: string): string {
  if (LIGHT_BG_COLORS.includes(hexBg)) return '#333333';
  return 'rgba(255,255,255,0.75)';
}

const AnimalGrid = ({ breed, category, subCategory }: AnimalGridProps) => {
  const navigate = useNavigate();
  const { animals, updateAnimal, deleteAnimal } = useLivestock();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAnimalId, setDeleteAnimalId] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [confirmBirthDate, setConfirmBirthDate] = useState('');
  const [confirmBirthUnknown, setConfirmBirthUnknown] = useState(false);
  const [confirmAge, setConfirmAge] = useState<AnimalAge>('غير معروف');

  const filtered = animals.
  filter((a) => a.breed === breed && a.subCategory === subCategory).
  sort((a, b) => a.number - b.number);

  const handleOpenConfirm = (e: React.MouseEvent, animalId: string) => {
    e.stopPropagation();
    setSelectedAnimalId(animalId);
    setConfirmBirthDate('');
    setConfirmBirthUnknown(false);
    setConfirmAge('غير معروف');
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!selectedAnimalId) return;
    const animal = animals.find((a) => a.id === selectedAnimalId);
    if (!animal) return;

    updateAnimal({
      ...animal,
      confirmed: true,
      birthDate: confirmBirthUnknown ? 'غير معروف' : confirmBirthDate,
      ageCategory: confirmAge
    });

    toast({ title: '✅ تم التأكيد', description: `بطاقة رقم ${animal.number} أصبحت رسمية` });
    setConfirmOpen(false);
    setSelectedAnimalId(null);
  };

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 opacity-100 shadow-xl py-0 my-[20px] mx-[50px] mt-[100px] mb-0 rounded">
        {filtered.length === 0 &&
        <p className="col-span-full text-center text-muted-foreground my-0 py-[10px] mx-[15px]">
            لا توجد بطاقات في قسم {SUB_CATEGORY_LABELS[subCategory]}
          </p>
        }
        {filtered.map((animal) => {
          const isDead = animal.status === 'dead';
          const isConfirmed = animal.confirmed === true;
          const bgColor = ANIMAL_COLORS[animal.color] || '#F5F0E8';
          const textColor = getContrastTextColor(bgColor);
          const subTextColor = getContrastSubColor(bgColor);

          return (
            <button
              key={animal.id}
              onClick={() => navigate(`/animal/${animal.id}`)}
              className={`rounded-xl p-3 text-center transition-all duration-200 card-shadow hover:card-shadow-hover hover:scale-[1.03] active:scale-[0.97] relative overflow-hidden ${isDead ? 'opacity-60' : ''} ${!isConfirmed ? 'ring-1 ring-dashed ring-muted-foreground/30' : ''}`}
              style={{ backgroundColor: bgColor }}>

              {isDead &&
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <span className="text-6xl font-black opacity-70" style={{ color: '#E53E3E' }}>✕</span>
                </div>
              }

              {/* Confirmed badge */}
              {isConfirmed &&
              <div className="absolute top-1 left-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#38A169' }}>
                  <Check className="w-3 h-3" style={{ color: '#fff' }} />
                </div>
              }

              {/* Thumbnail image */}
              {animal.image &&
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-1 rounded-full overflow-hidden border-2 border-white/50">
                  <img src={animal.image} alt={`رأس ${animal.number}`} className="w-full h-full object-cover" />
                </div>
              }

              <span className="text-3xl sm:text-4xl font-black block leading-tight" style={{ color: textColor }}>
                {animal.number}
              </span>
              <span className="text-[11px] font-bold block mt-1" style={{ color: subTextColor }}>
                {CATEGORY_LABELS[animal.breed] || animal.breed}
              </span>
              <span className="text-[10px] font-bold block" style={{ color: subTextColor }}>
                {GENDER_LABELS[animal.gender]}
              </span>
              {isDead && animal.deathDate &&
              <span className="text-[9px] block mt-0.5 font-black" style={{ color: '#E53E3E' }}>
                  نفق: {animal.deathDate}
                </span>
              }
              {!isDead && animal.birthDate &&
              <span className="text-[9px] block mt-0.5 font-bold" style={{ color: subTextColor }}>
                  {animal.birthDate}
                </span>
              }
              {animal.ageCategory && animal.ageCategory !== 'غير معروف' &&
              <span className="text-[9px] block font-bold" style={{ color: subTextColor }}>
                  {animal.ageCategory}
                </span>
              }

              {/* Confirm button for unconfirmed animals (not needed for young) */}
              {!isConfirmed && !isDead && animal.subCategory !== 'young' &&
              <div
                className="mt-1.5 mx-auto rounded-md px-2 py-0.5 text-[9px] font-bold cursor-pointer transition-colors flex items-center justify-center gap-0.5"
                style={{ backgroundColor: 'rgba(56,161,105,0.15)', color: '#38A169', border: '1px solid rgba(56,161,105,0.3)' }}
                onClick={(e) => handleOpenConfirm(e, animal.id)}>

                  <Plus className="w-3 h-3" />
                  إضافة
                </div>
              }

              {/* Delete button for young animals only */}
              {animal.subCategory === 'young' &&
              <div
                className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                style={{ backgroundColor: 'rgba(229,62,62,0.15)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteAnimalId(animal.id);
                  setDeleteDialogOpen(true);
                }}>

                  <Trash2 className="w-3 h-3" style={{ color: '#E53E3E' }} />
                </div>
              }
            </button>);

        })}
      </div>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد إضافة الرأس للقطيع</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-3">
            <div>
              <Label>تاريخ الولادة</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="date"
                  value={confirmBirthDate}
                  onChange={(e) => {setConfirmBirthDate(e.target.value);setConfirmBirthUnknown(false);}}
                  disabled={confirmBirthUnknown}
                  className="flex-1" />

                <Button
                  type="button"
                  variant={confirmBirthUnknown ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {setConfirmBirthUnknown(!confirmBirthUnknown);setConfirmBirthDate('');}}>

                  غير معروف
                </Button>
              </div>
            </div>
            <div>
              <Label>العمر التقريبي</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {AGE_OPTIONS.map((age) =>
                <button
                  key={age}
                  type="button"
                  onClick={() => setConfirmAge(age)}
                  className={`rounded-lg px-2 py-2 text-xs font-bold border-2 transition-all ${
                  confirmAge === age ?
                  'border-primary bg-primary/10 text-primary scale-105' :
                  'border-border bg-card text-card-foreground hover:border-primary/40'}`
                  }>

                    {age}
                  </button>
                )}
              </div>
            </div>
            <Button onClick={handleConfirm} className="w-full gap-2">
              <Check className="w-4 h-4" /> تأكيد الإضافة
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل تريد حذف هذه البطاقة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف البطاقة نهائياً ولا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteAnimalId) {
                  deleteAnimal(deleteAnimalId);
                  toast({ title: '🗑️ تم الحذف', description: 'تم حذف البطاقة بنجاح' });
                }
                setDeleteAnimalId(null);
              }}>

              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>);

};

export default AnimalGrid;