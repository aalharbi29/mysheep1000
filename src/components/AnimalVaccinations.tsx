import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { VACCINATION_TYPES, Vaccination, addDays, getFollowUpDays, getVaccinationLabel } from '@/types/vaccinations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Syringe, Check, Trash2, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Props {
  animalId: string;
  animalNumber: number;
}

const AnimalVaccinations = ({ animalId, animalNumber }: Props) => {
  const { user } = useAuth();
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [vacType, setVacType] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadVaccinations();
  }, [user, animalId]);

  const loadVaccinations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('vaccinations')
      .select('*')
      .eq('user_id', user.id)
      .eq('animal_id', animalId)
      .order('created_at', { ascending: false });

    if (data) setVaccinations(data as unknown as Vaccination[]);
  };

  const handleAdd = async () => {
    if (!user || !vacType) return;
    setSaving(true);

    const isDeworming = vacType === 'deworming';
    const followUpDays = getFollowUpDays(vacType);
    const followUpDate = addDays(date, followUpDays);

    const { error } = await supabase.from('vaccinations').insert({
      user_id: user.id,
      animal_id: animalId,
      animal_number: animalNumber,
      vaccination_type: vacType,
      first_dose_date: date,
      second_dose_date: isDeworming ? null : followUpDate,
      second_dose_confirmed: false,
      is_deworming: isDeworming,
      repeat_date: isDeworming ? followUpDate : null,
      repeat_confirmed: false,
    });

    setSaving(false);
    if (error) {
      toast({ title: '❌ خطأ', description: 'فشل الحفظ', variant: 'destructive' });
    } else {
      toast({ title: '💉 تم التحصين', description: getVaccinationLabel(vacType) });
      setAddOpen(false);
      setVacType('');
      loadVaccinations();
    }
  };

  const confirmFollowUp = async (v: Vaccination) => {
    const updateData = v.is_deworming
      ? { repeat_confirmed: true }
      : { second_dose_confirmed: true };

    await supabase.from('vaccinations').update(updateData).eq('id', v.id);
    toast({ title: '✅ تم التأكيد' });
    loadVaccinations();
  };

  const deleteVaccination = async (id: string) => {
    await supabase.from('vaccinations').delete().eq('id', id);
    toast({ title: '🗑️ تم الحذف' });
    loadVaccinations();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="rounded-xl bg-card p-4 mb-6 card-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground">💉 التحصينات</h3>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1 text-xs">
              <Plus className="w-3 h-3" /> إضافة تحصين
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>💉 إضافة تحصين - رقم {animalNumber}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>نوع التحصين</Label>
                <Select value={vacType} onValueChange={setVacType}>
                  <SelectTrigger><SelectValue placeholder="اختر التحصين" /></SelectTrigger>
                  <SelectContent>
                    {VACCINATION_TYPES.map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>التاريخ</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              {vacType && (
                <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                  {vacType === 'deworming'
                    ? `📅 إعادة التجريع: ${addDays(date, 10)} (بعد 10 أيام)`
                    : `📅 الجرعة الثانية: ${addDays(date, 14)} (بعد 14 يوم)`
                  }
                </div>
              )}
              <Button onClick={handleAdd} className="w-full" disabled={!vacType || saving}>
                {saving ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {vaccinations.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">لا توجد تحصينات مسجلة</p>
      ) : (
        <div className="space-y-2">
          {vaccinations.map(v => {
            const followUpDate = v.is_deworming ? v.repeat_date : v.second_dose_date;
            const isConfirmed = v.is_deworming ? v.repeat_confirmed : v.second_dose_confirmed;
            const isDue = followUpDate && today >= followUpDate && !isConfirmed;

            return (
              <div
                key={v.id}
                className={`rounded-lg p-3 border ${isDue ? 'border-destructive bg-destructive/5' : 'border-border'}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold flex items-center gap-1">
                      <Syringe className="w-3 h-3" />
                      {getVaccinationLabel(v.vaccination_type)}
                    </p>
                    <p className="text-xs text-muted-foreground">📅 {v.first_dose_date}</p>
                    {followUpDate && (
                      <p className={`text-xs ${isDue ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                        {v.is_deworming ? '🔄 إعادة: ' : '💉 جرعة ثانية: '}
                        {followUpDate}
                        {isConfirmed && ' ✅'}
                        {isDue && ' ⚠️ مطلوب'}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {followUpDate && !isConfirmed && (
                      <Button size="sm" variant="default" className="h-7 text-xs gap-1" onClick={() => confirmFollowUp(v)}>
                        <Check className="w-3 h-3" /> تأكيد
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => deleteVaccination(v.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AnimalVaccinations;
