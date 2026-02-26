import { useState } from 'react';
import { useLivestock } from '@/context/LivestockContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { VACCINATION_TYPES, addDays, getFollowUpDays, getVaccinationLabel } from '@/types/vaccinations';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Syringe } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Props {
  breed: string;
  subCategory: string;
}

const BulkVaccinationDialog = ({ breed, subCategory }: Props) => {
  const { animals } = useLivestock();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [vacType, setVacType] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = animals.filter(
    (a) => a.breed === breed && a.subCategory === subCategory && a.status !== 'dead' && a.confirmed !== false
  );

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedIds(new Set(filtered.map((a) => a.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleAnimal = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);else
      next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    if (!user || !vacType || selectedIds.size === 0) return;
    setSaving(true);

    const isDeworming = vacType === 'deworming';
    const followUpDays = getFollowUpDays(vacType);
    const followUpDate = addDays(date, followUpDays);

    const rows = filtered.
    filter((a) => selectedIds.has(a.id)).
    map((a) => ({
      user_id: user.id,
      animal_id: a.id,
      animal_number: a.number,
      vaccination_type: vacType,
      first_dose_date: date,
      second_dose_date: isDeworming ? null : followUpDate,
      second_dose_confirmed: false,
      is_deworming: isDeworming,
      repeat_date: isDeworming ? followUpDate : null,
      repeat_confirmed: false
    }));

    const { error } = await supabase.from('vaccinations').insert(rows);
    setSaving(false);

    if (error) {
      toast({ title: '❌ خطأ', description: 'فشل حفظ التحصين', variant: 'destructive' });
    } else {
      const label = getVaccinationLabel(vacType);
      toast({
        title: '💉 تم التحصين',
        description: `${selectedIds.size} رأس - ${label} | ${isDeworming ? 'إعادة بعد 10 أيام' : 'جرعة ثانية بعد 14 يوم'}`
      });
      setOpen(false);
      setSelectedIds(new Set());
      setSelectAll(false);
      setVacType('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Syringe className="w-4 h-4" /> تحصين جماعي
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>💉 تحصين جماعي</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <Label>نوع التحصين</Label>
            <Select value={vacType} onValueChange={setVacType}>
              <SelectTrigger><SelectValue placeholder="اختر التحصين" /></SelectTrigger>
              <SelectContent>
                {VACCINATION_TYPES.map((v) =>
                <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>تاريخ التحصين</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          {vacType &&
          <div className="rounded-lg bg-muted/50 p-3 text-sm text-[#c23838]">
              {vacType === 'deworming' ?
            `📅 إعادة التجريع: ${addDays(date, 10)} (بعد 10 أيام) | تنبيه قبلها بيوم` :
            `📅 الجرعة الثانية: ${addDays(date, 14)} (بعد 14 يوم) | تنبيه قبلها بيوم`
            }
            </div>
          }

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Checkbox
                checked={selectAll}
                onCheckedChange={(c) => handleSelectAll(!!c)}
                id="select-all" />

              <Label htmlFor="select-all" className="cursor-pointer">
                تحديد الكل ({filtered.length} رأس)
              </Label>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[30vh] overflow-y-auto">
              {filtered.map((a) =>
              <button
                key={a.id}
                onClick={() => toggleAnimal(a.id)}
                className={`rounded-lg p-2 text-center text-sm font-bold border-2 transition-all ${
                selectedIds.has(a.id) ?
                'border-primary bg-primary/10 text-primary' :
                'border-border bg-card text-foreground'}`
                }>

                  {a.number}
                </button>
              )}
            </div>
          </div>

          <Button
            onClick={handleSave}
            className="w-full gap-2"
            disabled={!vacType || selectedIds.size === 0 || saving}>

            <Syringe className="w-4 h-4" />
            {saving ? 'جاري الحفظ...' : `تحصين ${selectedIds.size} رأس`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>);

};

export default BulkVaccinationDialog;