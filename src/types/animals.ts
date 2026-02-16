export type AnimalCategory = 'sheep' | 'goat';
export type SheepBreed = 'harri' | 'najdi';
export type AnimalGender = 'male' | 'female';

export type OffspringFate = 'flock' | 'sold' | 'died';

export interface Offspring {
  id: string;
  number: number;
  gender: AnimalGender;
  birthDate: string;
  fate: OffspringFate;
  color: string;
}

export interface BirthRecord {
  id: string;
  date: string;
  offspring: Offspring[];
}

export interface Animal {
  id: string;
  number: number;
  category: AnimalCategory;
  breed: SheepBreed | 'goat';
  gender: AnimalGender;
  color: string;
  birthDate: string;
  motherNumber?: number;
  fatherNumber?: number;
  birthRecords: BirthRecord[];
  notes?: string;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

export interface Sale {
  id: string;
  date: string;
  animalNumber?: number;
  description: string;
  amount: number;
  quantity: number;
}

export interface Purchase {
  id: string;
  date: string;
  description: string;
  amount: number;
  quantity: number;
}

export const ANIMAL_COLORS: Record<string, string> = {
  'أبيض': '#F5F0E8',
  'أسود': '#2D2D2D',
  'بني': '#8B6914',
  'أحمر': '#C44536',
  'رمادي': '#8E8E8E',
  'أشقر': '#D4A853',
  'مبرقع': '#E8D5B7',
  'شعلاء': '#CD7F32',
  'صفراء': '#DAA520',
  'حمراء غامق': '#8B0000',
};

export const CATEGORY_LABELS: Record<string, string> = {
  sheep: 'ضأن',
  goat: 'ماعز',
  harri: 'حري',
  najdi: 'نجدي',
};

export const GENDER_LABELS: Record<AnimalGender, string> = {
  male: 'ذكر',
  female: 'أنثى',
};

export const FATE_LABELS: Record<OffspringFate, string> = {
  flock: 'أضيف للقطيع',
  sold: 'تم بيعه',
  died: 'نفق',
};
