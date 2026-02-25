export const VACCINATION_TYPES = [
  { id: 'intestinal', label: 'معوي' },
  { id: 'blood', label: 'دموي' },
  { id: 'intestinal_blood', label: 'معوي - دموي' },
  { id: 'hoiger', label: 'هويجر' },
  { id: 'fmd', label: 'قلاعية' },
  { id: 'pox', label: 'جدري' },
  { id: 'plague', label: 'طاعون' },
  { id: 'brucella', label: 'مالطيه' },
  { id: 'ivomec_super', label: 'ivomec super' },
  { id: 'deworming', label: 'تجريع ديدان' },
] as const;

export type VaccinationType = (typeof VACCINATION_TYPES)[number]['id'];

export interface Vaccination {
  id: string;
  user_id: string;
  animal_id: string;
  animal_number: number;
  vaccination_type: string;
  first_dose_date: string;
  second_dose_date: string | null;
  second_dose_confirmed: boolean;
  is_deworming: boolean;
  repeat_date: string | null;
  repeat_confirmed: boolean;
  notes: string | null;
  created_at: string;
}

export function getVaccinationLabel(type: string): string {
  return VACCINATION_TYPES.find(v => v.id === type)?.label || type;
}

// Deworming repeats after 10 days, vaccines after 14 days
export function getFollowUpDays(type: string): number {
  return type === 'deworming' ? 10 : 14;
}

// Reminder 1 day before
export function getReminderDate(followUpDate: string): string {
  const d = new Date(followUpDate);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
