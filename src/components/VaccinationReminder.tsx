import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Vaccination, getVaccinationLabel, getReminderDate } from '@/types/vaccinations';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Syringe, AlertTriangle, Check } from 'lucide-react';

const VaccinationReminder = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Vaccination[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadReminders();
  }, [user]);

  const loadReminders = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    
    const { data } = await supabase
      .from('vaccinations')
      .select('*')
      .eq('user_id', user.id);

    if (!data) return;

    const pending = (data as unknown as Vaccination[]).filter(v => {
      // Check second dose reminders (vaccines)
      if (!v.is_deworming && v.second_dose_date && !v.second_dose_confirmed) {
        const reminder = getReminderDate(v.second_dose_date);
        return today >= reminder;
      }
      // Check deworming repeat reminders
      if (v.is_deworming && v.repeat_date && !v.repeat_confirmed) {
        const reminder = getReminderDate(v.repeat_date);
        return today >= reminder;
      }
      return false;
    });

    if (pending.length > 0) {
      setReminders(pending);
      setOpen(true);
    }
  };

  const confirmDose = async (vaccination: Vaccination) => {
    const updateData = vaccination.is_deworming
      ? { repeat_confirmed: true }
      : { second_dose_confirmed: true };

    await supabase
      .from('vaccinations')
      .update(updateData)
      .eq('id', vaccination.id);

    setReminders(prev => prev.filter(r => r.id !== vaccination.id));
    if (reminders.length <= 1) setOpen(false);
  };

  if (reminders.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            تنبيهات التحصين ({reminders.length})
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          {reminders.map(v => {
            const dueDate = v.is_deworming ? v.repeat_date : v.second_dose_date;
            const today = new Date().toISOString().split('T')[0];
            const isOverdue = dueDate && today >= dueDate;
            const label = v.is_deworming ? 'إعادة تجريع الديدان' : `الجرعة الثانية - ${getVaccinationLabel(v.vaccination_type)}`;

            return (
              <div
                key={v.id}
                className={`rounded-xl p-4 border-2 ${isOverdue ? 'border-destructive bg-destructive/5' : 'border-warning bg-warning/5'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-foreground flex items-center gap-2">
                      <Syringe className="w-4 h-4" />
                      {label}
                    </p>
                    <p className="text-sm text-muted-foreground">رأس رقم: {v.animal_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {isOverdue ? '⚠️ متأخر - ' : '📅 '}
                      التاريخ المطلوب: {dueDate}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="default"
                    className="gap-1 shrink-0"
                    onClick={() => confirmDose(v)}
                  >
                    <Check className="w-4 h-4" /> تأكيد
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VaccinationReminder;
