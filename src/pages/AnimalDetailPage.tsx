import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { useLivestock } from '@/context/LivestockContext';
import { getDefaultColor, getMotherDefaultColor, isGoatBreed } from '@/context/LivestockContext';
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
import { Baby, Calendar, Palette, TreePine, Plus, Edit, Trash2, Skull, DollarSign, Home, Camera } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import SellAnimalDialog from '@/components/SellAnimalDialog';
import AnimalVaccinations from '@/components/AnimalVaccinations';

const AnimalDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAnimalById, updateAnimal, addBirthRecord, updateBirthRecord, deleteBirthRecord, addAnimal, deleteAnimal, markAnimalDead } = useLivestock();
  const animal = getAnimalById(id || '');
  const [sellOpen, setSellOpen] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [birthOpen, setBirthOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false); // kept for state but move UI removed
  const [editRecordOpen, setEditRecordOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BirthRecord | null>(null);
  const [editRecordDate, setEditRecordDate] = useState('');
  const [editRecordOffspring, setEditRecordOffspring] = useState<Offspring[]>([]);

  const [editColor, setEditColor] = useState(animal?.color || '');
  const [editBirthDate, setEditBirthDate] = useState(animal?.birthDate || '');
  const [editGender, setEditGender] = useState<AnimalGender>(animal?.gender || 'female');
  const [editNotes, setEditNotes] = useState(animal?.notes || '');

  const [birthDate, setBirthDate] = useState('');
  const defaultOffspringColor = animal ? getDefaultColor(animal.breed, 'female', 'young') : 'أبيض';
  const [offspringList, setOffspringList] = useState<(Partial<Offspring> & { assignedNumber?: number })[]>([
    { gender: 'female', color: defaultOffspringColor, fate: 'flock', assignedNumber: undefined },
  ]);

  const [moveTarget, setMoveTarget] = useState<AnimalSubCategory>('mothers');

  if (!animal) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <p className="text-muted-foreground">لم يتم العثور على الحيوان</p>
      </div>
    );
  }

  const bgColor = ANIMAL_COLORS[animal.color] || '#F5F0E8';
  const isDark = ['بني', 'أزرق', 'بنفسجي', 'أسود'].includes(animal.color);
  const isGoat = animal.category === 'goat';
  const backPath = isGoat
    ? `/flock/goat/${animal.breed}/${animal.subCategory}`
    : `/flock/sheep/${animal.breed}/${animal.subCategory}`;

  const totalOffspring = animal.birthRecords.reduce(
    (sum, r) => sum + r.offspring.length, 0
  );

  const handleSaveEdit = () => {
    updateAnimal({ ...animal, color: editColor, birthDate: editBirthDate, gender: editGender, notes: editNotes });
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

    const record: BirthRecord = { id: Date.now().toString(), date: birthDate, offspring };
    addBirthRecord(animal.id, record);

    // Check for stillborn offspring and add alert note to mother
    const hasStillborn = offspring.some(o => o.fate === 'stillborn');
    if (hasStillborn) {
      const existingNotes = animal.notes || '';
      const stillbornNote = `⚠️ طشت بتاريخ ${birthDate}`;
      const updatedNotes = existingNotes ? `${existingNotes}\n${stillbornNote}` : stillbornNote;
      updateAnimal({ ...animal, notes: updatedNotes, birthRecords: [...animal.birthRecords, record] });
    }

    offspring.forEach((off) => {
      if (off.number > 0 && off.fate !== 'stillborn') {
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
          confirmed: true,
        });
      }
    });

    setBirthOpen(false);
    setBirthDate('');
    setOffspringList([{ gender: 'female', color: 'أبيض', fate: 'flock', assignedNumber: undefined }]);
  };

  const addOffspringField = () => {
    const color = animal ? getDefaultColor(animal.breed, 'female', 'young') : 'أبيض';
    setOffspringList(prev => [...prev, { gender: 'female', color, fate: 'flock', assignedNumber: undefined }]);
  };

  const updateOffspringField = (index: number, field: string, value: string | number) => {
    setOffspringList(prev =>
      prev.map((o, i) => {
        if (i !== index) return o;
        const updated = { ...o, [field]: value };
        if (field === 'gender' && animal) {
          updated.color = getDefaultColor(animal.breed, value as 'male' | 'female', 'young');
        }
        return updated;
      })
    );
  };

  const handleMove = () => {
    updateAnimal({ ...animal, subCategory: moveTarget });
    setMoveOpen(false);
  };

  const handleEditRecord = (record: BirthRecord) => {
    setEditingRecord(record);
    setEditRecordDate(record.date);
    setEditRecordOffspring([...record.offspring]);
    setEditRecordOpen(true);
  };

  const handleSaveRecord = () => {
    if (!editingRecord) return;
    updateBirthRecord(animal.id, { ...editingRecord, date: editRecordDate, offspring: editRecordOffspring });
    setEditRecordOpen(false);
    setEditingRecord(null);
  };

  const handleDeleteRecord = (recordId: string) => {
    if (confirm('هل أنت متأكد من حذف سجل الولادة هذا؟')) {
      deleteBirthRecord(animal.id, recordId);
    }
  };

  const updateEditOffspring = (index: number, field: string, value: string | number) => {
    setEditRecordOffspring(prev => prev.map((o, i) => (i === index ? { ...o, [field]: value } : o)));
  };

  const deleteEditOffspring = (index: number) => {
    setEditRecordOffspring(prev => prev.filter((_, i) => i !== index));
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
        <div className="rounded-2xl p-6 mb-6 card-shadow" style={{ backgroundColor: bgColor }}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {/* Animal thumbnail */}
              <label className="cursor-pointer flex flex-col items-center">
                <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-white/60 shadow-md hover:shadow-lg transition-shadow"
                  onClick={(e) => {
                    if (animal.image) {
                      e.preventDefault();
                      setImagePreviewOpen(true);
                    }
                  }}
                >
                  {animal.image ? (
                    <AvatarImage src={animal.image} alt={`رأس ${animal.number}`} />
                  ) : (
                    <AvatarFallback className="bg-white/30 text-2xl">
                      <Camera className="w-6 h-6 opacity-50" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const img = new Image();
                    const url = URL.createObjectURL(file);
                    img.onload = () => {
                      const MAX = 300;
                      let w = img.width, h = img.height;
                      if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
                      else { w = Math.round(w * MAX / h); h = MAX; }
                      const canvas = document.createElement('canvas');
                      canvas.width = w;
                      canvas.height = h;
                      const ctx = canvas.getContext('2d')!;
                      ctx.drawImage(img, 0, 0, w, h);
                      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                      URL.revokeObjectURL(url);
                      try {
                        updateAnimal({ ...animal, image: dataUrl });
                        toast({ title: '📷 تم إضافة الصورة' });
                      } catch {
                        toast({ title: '⚠️ خطأ', description: 'لم يتم حفظ الصورة، مساحة التخزين ممتلئة' });
                      }
                    };
                    img.src = url;
                  }}
                />
              </label>
              <div>
                <span className="text-5xl font-extrabold text-black">
                  {animal.number}
                </span>
                <div className="mt-2 space-y-1 text-black">
                  <p className="flex items-center gap-2 text-sm font-bold"><Palette className="w-4 h-4" /> لون التاق: {animal.color}</p>
                  <p className="flex items-center gap-2 text-sm font-bold">{GENDER_LABELS[animal.gender]}</p>
                  <p className="flex items-center gap-2 text-sm font-bold">📂 القسم: {SUB_CATEGORY_LABELS[animal.subCategory]}</p>
                  {animal.motherNumber && <p className="flex items-center gap-2 text-sm font-bold">🐑 رقم الأم: {animal.motherNumber}</p>}
                  {animal.birthDate && <p className="flex items-center gap-2 text-sm font-bold"><Calendar className="w-4 h-4" /> تاريخ الميلاد: {animal.birthDate}</p>}
                  {animal.subCategory === 'mothers' && <p className="flex items-center gap-2 text-sm font-bold"><Baby className="w-4 h-4" /> عدد المواليد: {totalOffspring}</p>}
                </div>
              </div>
            </div>

            <div className="flex gap-1">
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1"><Edit className="w-3 h-3" /> تعديل</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>تعديل بطاقة رقم {animal.number}</DialogTitle></DialogHeader>
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
                    <div><Label>تاريخ الميلاد</Label><Input type="date" value={editBirthDate} onChange={e => setEditBirthDate(e.target.value)} /></div>
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
                    <div><Label>ملاحظات</Label><Input value={editNotes} onChange={e => setEditNotes(e.target.value)} /></div>
                    <Button onClick={handleSaveEdit} className="w-full">حفظ</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          {animal.notes && (
            <p className="mt-3 text-sm font-bold text-black/70">{animal.notes}</p>
          )}
        </div>

        {/* Stillborn alert banner */}
        {animal.notes?.includes('طشت') && (
          <div className="rounded-xl bg-amber-100 border-2 border-amber-400 p-4 mb-6 flex items-center gap-3 animate-pulse">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold text-amber-800">تنبيه متابعة</p>
              {animal.notes.split('\n').filter(n => n.includes('طشت')).map((line, i) => (
                <p key={i} className="text-sm text-amber-700 font-semibold">{line}</p>
              ))}
            </div>
          </div>
        )}

        {/* Death status banner */}
        {animal.status === 'dead' && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4 mb-6 text-center">
            <p className="text-lg font-bold text-destructive">💀 نافق</p>
            {animal.deathDate && <p className="text-sm text-destructive/80">تاريخ النفوق: {animal.deathDate}</p>}
          </div>
        )}

        {/* Actions */}
        {animal.status !== 'dead' && (
          <div className="rounded-xl bg-card p-4 mb-6 card-shadow">
            <h3 className="text-sm font-bold text-foreground mb-3">🔄 إجراءات</h3>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" className="gap-1 text-xs h-auto py-3 flex-col" onClick={() => {
                const deathDate = prompt('أدخل تاريخ النفوق (مثال: 2025-01-15)');
                if (deathDate) {
                  markAnimalDead(animal.id, deathDate);
                  toast({ title: '💀 تم تسجيل النفوق', description: `بطاقة رقم ${animal.number} - ${deathDate}` });
                }
              }}>
                <Skull className="w-5 h-5 text-destructive" /><span>نفوق</span>
              </Button>
              <Button variant="outline" className="gap-1 text-xs h-auto py-3 flex-col" onClick={() => setSellOpen(true)}>
                <DollarSign className="w-5 h-5 text-success" /><span>بيع</span>
              </Button>
              {animal.subCategory === 'young' && (
                <Button variant="outline" className="gap-1 text-xs h-auto py-3 flex-col" onClick={() => {
                  updateAnimal({ ...animal, subCategory: 'mothers' });
                  toast({ title: '🐑 تم التحويل للأمهات', description: `بطاقة رقم ${animal.number}` });
                }}>
                  <Home className="w-5 h-5 text-primary" /><span>تحويل للأمهات</span>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Vaccinations */}
        <AnimalVaccinations animalId={animal.id} animalNumber={animal.number} />

        {/* Birth registration */}
        {animal.subCategory === 'mothers' && (
          <Dialog open={birthOpen} onOpenChange={setBirthOpen}>
            <DialogTrigger asChild>
              <Button className="w-full mb-6 gap-2" size="lg"><Baby className="w-5 h-5" /> تسجيل ولادة جديدة</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader><DialogTitle>تسجيل ولادة - بطاقة {animal.number}</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div><Label>تاريخ الولادة</Label><Input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} /></div>
                <div>
                  <Label>تاريخ ميلاد الأم</Label>
                  <div className="flex items-center gap-2">
                    <Input type="date" value={animal.birthDate === 'غير معروف' ? '' : animal.birthDate} disabled className="flex-1" />
                    {!animal.birthDate && (
                      <Button type="button" variant="outline" size="sm" onClick={() => updateAnimal({ ...animal, birthDate: 'غير معروف' })}>غير معروف</Button>
                    )}
                  </div>
                  {animal.birthDate === 'غير معروف' && <p className="text-xs text-muted-foreground mt-1">تاريخ ميلاد الأم: غير معروف</p>}
                </div>

                {offspringList.map((o, index) => (
                  <div key={index} className="rounded-lg bg-muted p-3 space-y-3">
                    <p className="text-sm font-semibold text-foreground">مولود {index + 1}</p>
                    <div><Label className="text-xs">رقم البطاقة</Label><Input type="number" placeholder="أدخل رقم البطاقة" value={o.assignedNumber || ''} onChange={e => updateOffspringField(index, 'assignedNumber', Number(e.target.value))} /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">النوع</Label>
                        <Select value={o.gender || 'female'} onValueChange={v => updateOffspringField(index, 'gender', v)}>
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">ذكر</SelectItem>
                            <SelectItem value="female">أنثى</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">المصير</Label>
                        <Select value={o.fate || 'flock'} onValueChange={v => updateOffspringField(index, 'fate', v)}>
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(FATE_LABELS).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">لون التاق</Label>
                      <Select value={o.color || 'أبيض'} onValueChange={v => updateOffspringField(index, 'color', v)}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.keys(ANIMAL_COLORS).map(c => (
                            <SelectItem key={c} value={c}>
                              <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: ANIMAL_COLORS[c] }} />
                                {c}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full gap-2" onClick={addOffspringField}><Plus className="w-4 h-4" /> إضافة مولود آخر</Button>
                <Button onClick={handleAddBirth} className="w-full" disabled={!birthDate}>حفظ سجل الولادة</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Birth records */}
        {animal.birthRecords.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">📋 سجلات الولادة</h3>
            {animal.birthRecords.map(record => (
              <div key={record.id} className="rounded-xl bg-card p-4 card-shadow">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="font-semibold text-card-foreground">📅 {record.date}</p>
                    <p className="text-xs text-muted-foreground">{record.offspring.length} مولود</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleEditRecord(record)}>
                      <Edit className="w-3 h-3" /> تعديل
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-destructive" onClick={() => handleDeleteRecord(record.id)}>
                      <Trash2 className="w-3 h-3" /> حذف
                    </Button>
                  </div>
                </div>
                {record.offspring.map(off => (
                  <div key={off.id} className="rounded-lg p-2 mb-1 flex justify-between items-center" style={{ backgroundColor: `${ANIMAL_COLORS[off.color] || '#F5F0E8'}30` }}>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: ANIMAL_COLORS[off.color] || '#F5F0E8' }} />
                      <span className="text-sm font-semibold">{off.number > 0 ? `#${off.number}` : 'بدون رقم'}</span>
                      <span className="text-xs text-muted-foreground">{GENDER_LABELS[off.gender]}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${off.fate === 'died' ? 'bg-destructive/10 text-destructive' : off.fate === 'sold' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                      {FATE_LABELS[off.fate]}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Edit birth record dialog */}
        <Dialog open={editRecordOpen} onOpenChange={setEditRecordOpen}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>تعديل سجل الولادة</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>تاريخ الولادة</Label><Input type="date" value={editRecordDate} onChange={e => setEditRecordDate(e.target.value)} /></div>
              {editRecordOffspring.map((off, idx) => (
                <div key={off.id} className="rounded-lg bg-muted p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold">مولود {idx + 1}</p>
                    <button onClick={() => deleteEditOffspring(idx)} className="text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">النوع</Label>
                      <Select value={off.gender} onValueChange={v => updateEditOffspring(idx, 'gender', v)}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">ذكر</SelectItem>
                          <SelectItem value="female">أنثى</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">المصير</Label>
                      <Select value={off.fate} onValueChange={v => updateEditOffspring(idx, 'fate', v)}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(FATE_LABELS).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              <Button onClick={handleSaveRecord} className="w-full">حفظ التعديلات</Button>
            </div>
          </DialogContent>
        </Dialog>

        <SellAnimalDialog animal={animal} open={sellOpen} onOpenChange={setSellOpen} onSold={() => navigate(backPath)} />

        {/* Image Preview Dialog */}
        <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
          <DialogContent className="max-w-sm p-2">
            <DialogHeader>
              <DialogTitle className="text-center">رأس رقم {animal.number}</DialogTitle>
            </DialogHeader>
            {animal.image && (
              <img src={animal.image} alt={`رأس ${animal.number}`} className="w-full rounded-xl object-contain max-h-[60vh]" />
            )}
            <Button
              variant="destructive"
              size="sm"
              className="w-full gap-2 mt-2"
              onClick={() => {
                updateAnimal({ ...animal, image: undefined });
                setImagePreviewOpen(false);
                toast({ title: '🗑️ تم حذف الصورة' });
              }}
            >
              <Trash2 className="w-4 h-4" /> حذف الصورة
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AnimalDetailPage;
