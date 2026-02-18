import { useParams } from 'react-router-dom';
import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { useLivestock } from '@/context/LivestockContext';
import {
  ANIMAL_COLORS,
  CATEGORY_LABELS,
  GENDER_LABELS,
  FATE_LABELS,
  SUB_CATEGORY_LABELS,
  type BirthRecord,
  type Offspring,
  type AnimalGender,
  type OffspringFate,
  type AnimalSubCategory,
} from '@/types/animals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Baby, Calendar, Palette, TreePine, Plus, Edit, ArrowRightLeft } from 'lucide-react';

const AnimalDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getAnimalById, updateAnimal, addBirthRecord, addAnimal } = useLivestock();
  const animal = getAnimalById(id || '');
  const [editOpen, setEditOpen] = useState(false);
  const [birthOpen, setBirthOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);

  // Edit form state
  const [editColor, setEditColor] = useState(animal?.color || '');
  const [editBirthDate, setEditBirthDate] = useState(animal?.birthDate || '');
  const [editGender, setEditGender] = useState<AnimalGender>(animal?.gender || 'female');
  const [editNotes, setEditNotes] = useState(animal?.notes || '');

  // Birth form state
  const [birthDate, setBirthDate] = useState('');
  const [offspringList, setOffspringList] = useState<(Partial<Offspring> & { assignedNumber?: number })[]>([
    { gender: 'female', color: 'أبيض', fate: 'flock', assignedNumber: undefined },
  ]);

  // Move state
  const [moveTarget, setMoveTarget] = useState<AnimalSubCategory>('mothers');

  if (!animal) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <p className="text-muted-foreground">لم يتم العثور على الحيوان</p>
      </div>
    );
  }

  const bgColor = ANIMAL_COLORS[animal.color] || '#F5F0E8';
  const isDark = ['بني', 'أزرق', 'بنفسجي'].includes(animal.color);
  const isGoat = animal.category === 'goat';
  const backPath = isGoat
    ? `/flock/goat/${animal.subCategory}`
    : `/flock/sheep/${animal.breed}/${animal.subCategory}`;

  const totalOffspring = animal.birthRecords.reduce(
    (sum, r) => sum + r.offspring.length, 0
  );

  const handleSaveEdit = () => {
    updateAnimal({
      ...animal,
      color: editColor,
      birthDate: editBirthDate,
      gender: editGender,
      notes: editNotes,
    });
    setEditOpen(false);
  };

  const handleAddBirth = () => {
    const offspring: Offspring[] = offspringList.map((o, i) => ({
      id: `${Date.now()}-${i}`,
      number: o.assignedNumber || 0,
      gender: (o.gender as AnimalGender) || 'female',
      birthDate,
      fate: (o.fate as OffspringFate) || 'flock',
      color: o.color || 'أبيض',
    }));

    const record: BirthRecord = {
      id: Date.now().toString(),
      date: birthDate,
      offspring,
    };
    addBirthRecord(animal.id, record);

    // Create animal cards in "young" subCategory for each offspring
    offspring.forEach((off) => {
      if (off.number > 0) {
        addAnimal({
          id: `${animal.breed}-young-${off.number}-${Date.now()}`,
          number: off.number,
          category: animal.category,
          breed: animal.breed,
          gender: off.gender,
          subCategory: 'young',
          color: off.color,
          birthDate,
          motherNumber: animal.number,
          motherBreed: animal.breed,
          birthRecords: [],
        });
      }
    });

    setBirthOpen(false);
    setBirthDate('');
    setOffspringList([{ gender: 'female', color: 'أبيض', fate: 'flock', assignedNumber: undefined }]);
  };

  const addOffspringField = () => {
    setOffspringList(prev => [...prev, { gender: 'female', color: 'أبيض', fate: 'flock', assignedNumber: undefined }]);
  };

  const updateOffspringField = (index: number, field: string, value: string | number) => {
    setOffspringList(prev =>
      prev.map((o, i) => (i === index ? { ...o, [field]: value } : o))
    );
  };

  const handleMove = () => {
    updateAnimal({ ...animal, subCategory: moveTarget });
    setMoveOpen(false);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title={`بطاقة رقم ${animal.number}`}
          subtitle={`${CATEGORY_LABELS[animal.breed] || animal.breed} - ${SUB_CATEGORY_LABELS[animal.subCategory]}`}
          backTo={backPath}
        />

        {/* Main card */}
        <div
          className="rounded-2xl p-6 mb-6 card-shadow"
          style={{ backgroundColor: bgColor }}
        >
          <div className="flex items-start justify-between">
            <div>
              <span className={`text-5xl font-extrabold ${isDark ? 'text-primary-foreground' : 'text-foreground'}`}>
                {animal.number}
              </span>
              <div className={`mt-2 space-y-1 ${isDark ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                <p className="flex items-center gap-2 text-sm">
                  <Palette className="w-4 h-4" /> لون التاق: {animal.color}
                </p>
                <p className="flex items-center gap-2 text-sm">
                  {GENDER_LABELS[animal.gender]}
                </p>
                <p className="flex items-center gap-2 text-sm">
                  📂 القسم: {SUB_CATEGORY_LABELS[animal.subCategory]}
                </p>
                {animal.motherNumber && (
                  <p className="flex items-center gap-2 text-sm">
                    🐑 رقم الأم: {animal.motherNumber}
                  </p>
                )}
                {animal.birthDate && (
                  <p className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" /> تاريخ الميلاد: {animal.birthDate}
                  </p>
                )}
                {animal.subCategory === 'mothers' && (
                  <p className="flex items-center gap-2 text-sm">
                    <Baby className="w-4 h-4" /> عدد المواليد: {totalOffspring}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-1">
              <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1">
                    <ArrowRightLeft className="w-3 h-3" /> نقل
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>نقل إلى قسم آخر</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <Select value={moveTarget} onValueChange={v => setMoveTarget(v as AnimalSubCategory)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mothers">الأمهات</SelectItem>
                        <SelectItem value="young">البهم</SelectItem>
                        <SelectItem value="rams">الفحول</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleMove} className="w-full">نقل</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Edit className="w-3 h-3" /> تعديل
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>تعديل بطاقة رقم {animal.number}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>لون التاق</Label>
                      <Select value={editColor} onValueChange={setEditColor}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.keys(ANIMAL_COLORS).map(c => (
                            <SelectItem key={c} value={c}>
                              <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full inline-block border" style={{ backgroundColor: ANIMAL_COLORS[c] }} />
                                {c}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>تاريخ الميلاد</Label>
                      <Input type="date" value={editBirthDate} onChange={e => setEditBirthDate(e.target.value)} />
                    </div>
                    <div>
                      <Label>النوع</Label>
                      <Select value={editGender} onValueChange={v => setEditGender(v as AnimalGender)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">ذكر</SelectItem>
                          <SelectItem value="female">أنثى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>ملاحظات</Label>
                      <Input value={editNotes} onChange={e => setEditNotes(e.target.value)} />
                    </div>
                    <Button onClick={handleSaveEdit} className="w-full">حفظ</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          {animal.notes && (
            <p className={`mt-3 text-sm ${isDark ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
              {animal.notes}
            </p>
          )}
        </div>

        {/* Birth registration - only for mothers */}
        {animal.subCategory === 'mothers' && (
          <Dialog open={birthOpen} onOpenChange={setBirthOpen}>
            <DialogTrigger asChild>
              <Button className="w-full mb-6 gap-2" size="lg">
                <Baby className="w-5 h-5" /> تسجيل ولادة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>تسجيل ولادة - بطاقة {animal.number}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>تاريخ الولادة</Label>
                  <Input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
                </div>
                <div>
                  <Label>تاريخ ميلاد الأم</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={animal.birthDate === 'غير معروف' ? '' : animal.birthDate}
                      disabled
                      className="flex-1"
                    />
                    {!animal.birthDate && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateAnimal({ ...animal, birthDate: 'غير معروف' });
                        }}
                      >
                        غير معروف
                      </Button>
                    )}
                  </div>
                  {animal.birthDate === 'غير معروف' && (
                    <p className="text-xs text-muted-foreground mt-1">تاريخ ميلاد الأم: غير معروف</p>
                  )}
                </div>

                {offspringList.map((o, index) => (
                  <div key={index} className="rounded-lg bg-muted p-3 space-y-3">
                    <p className="text-sm font-semibold text-foreground">مولود {index + 1}</p>
                    <div>
                      <Label className="text-xs">رقم البطاقة</Label>
                      <Input
                        type="number"
                        placeholder="أدخل رقم البطاقة"
                        value={o.assignedNumber || ''}
                        onChange={e => updateOffspringField(index, 'assignedNumber', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs">النوع</Label>
                        <Select value={o.gender} onValueChange={v => updateOffspringField(index, 'gender', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">ذكر</SelectItem>
                            <SelectItem value="female">أنثى</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">لون التاق</Label>
                        <Select value={o.color} onValueChange={v => updateOffspringField(index, 'color', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.keys(ANIMAL_COLORS).map(c => (
                              <SelectItem key={c} value={c}>
                                <span className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full inline-block border" style={{ backgroundColor: ANIMAL_COLORS[c] }} />
                                  {c}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">الإجراء</Label>
                        <Select value={o.fate} onValueChange={v => updateOffspringField(index, 'fate', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="flock">إضافة للقطيع</SelectItem>
                            <SelectItem value="sold">بيع</SelectItem>
                            <SelectItem value="died">نفوق</SelectItem>
                            <SelectItem value="infant">رضيع</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}

                <Button variant="outline" onClick={addOffspringField} className="w-full gap-1">
                  <Plus className="w-4 h-4" /> إضافة مولود آخر
                </Button>
                <Button onClick={handleAddBirth} className="w-full" disabled={!birthDate}>
                  حفظ الولادة
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Birth history */}
        {animal.birthRecords.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TreePine className="w-5 h-5 text-primary" /> سجل الولادات
            </h2>
            <div className="space-y-3">
              {animal.birthRecords.map((record) => (
                <div key={record.id} className="rounded-xl bg-card p-4 card-shadow">
                  <p className="text-sm font-semibold text-foreground mb-2">
                    <Calendar className="w-4 h-4 inline ml-1" />
                    {record.date}
                    <span className="text-muted-foreground font-normal mr-2">
                      ({record.offspring.length} مواليد)
                    </span>
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {record.offspring.map((off) => (
                      <div
                        key={off.id}
                        className="rounded-lg p-2 text-xs"
                        style={{ backgroundColor: ANIMAL_COLORS[off.color] || '#F5F0E8' }}
                      >
                        <span className="font-bold">#{off.number}</span>
                        <span className="mx-1">•</span>
                        <span>{GENDER_LABELS[off.gender]}</span>
                        <span className="mx-1">•</span>
                        <span>{off.color}</span>
                        <span className="mx-1">•</span>
                        <span>{FATE_LABELS[off.fate]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AnimalDetailPage;
