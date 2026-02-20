export type AnimalCategory = 'sheep' | 'goat';
export type SheepBreed = 'harri' | 'najdi';
export type AnimalGender = 'male' | 'female';

export type OffspringFate = 'flock' | 'sold' | 'died' | 'infant';
export type AnimalSubCategory = 'mothers' | 'young' | 'rams';

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
  subCategory: AnimalSubCategory;
  color: string;
  birthDate: string;
  motherNumber?: number;
  motherBreed?: string;
  fatherNumber?: number;
  birthRecords: BirthRecord[];
  notes?: string;
}

export const SUB_CATEGORY_LABELS: Record<AnimalSubCategory, string> = {
  mothers: 'الأمهات',
  young: 'البهم',
  rams: 'الفحول',
};

export const SUB_CATEGORY_ICONS: Record<AnimalSubCategory, string> = {
  mothers: '🐑',
  young: '🐣',
  rams: '🐏',
};

export interface ExpenseItem {
  itemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  subCategory?: string;
  items?: ExpenseItem[];
}

export type ExpenseCategoryKey = 'feed' | 'medicine' | 'infrastructure' | 'permanentLabor' | 'tempLabor';

export const EXPENSE_CATEGORIES: Record<ExpenseCategoryKey, { label: string; icon: string; items: string[] }> = {
  feed: {
    label: 'غذاء',
    icon: '🌾',
    items: ['شعير', 'شعير مضغوط', 'شعير مجروش', 'وافي تربية', 'وافي تسمين', 'اراسكو 18', 'اراسكو 21', 'حملان 24', 'ذرة مجروشة', 'برسيم', 'تبن', 'رودس', 'ذرة قصب', 'تمر', 'خبز'],
  },
  medicine: {
    label: 'أدوية',
    icon: '💊',
    items: ['مضاد حيوي بنسلين', 'مضاد حيوي تيراميسين', 'مضاد حيوي اوكسي تتراسيكلين', 'ايفرمكتين (طفيليات)', 'البندازول (ديدان)', 'فيتامين AD3E', 'فيتامين B12', 'فيتامين B المركب', 'سيلينيوم + فيتامين E', 'كالسيوم', 'فوسفور', 'أملاح معدنية', 'حجر ملح', 'مضاد انتفاخ', 'مضاد إسهال', 'مطهر جروح', 'بخاخ مضاد ذباب', 'لقاح جدري', 'لقاح تسمم معوي', 'لقاح حمى مالطية', 'لقاح باستريلا'],
  },
  infrastructure: {
    label: 'تجهيزات بنية تحتية',
    icon: '🏗️',
    items: ['بلك', 'اسمنت', 'بطحاء', 'خشب', 'حديد', 'هنقر', 'شباك', 'غرفة', 'مكيف', 'ثلاجة', 'اسطوانة غاز', 'رفع مخلفات أغنام', 'حرث أرض', 'بذور', 'سماد', 'ليات زراعية', 'محابس', 'خزان فيبر', 'خزان حديد'],
  },
  permanentLabor: {
    label: 'أجور عمالة دائمة',
    icon: '👷',
    items: [],
  },
  tempLabor: {
    label: 'أجور عمالة مؤقتة',
    icon: '🔧',
    items: ['بناء', 'تنزيل أعلاف', 'رفع مخلفات', 'فحوصات بيطرية', 'قص أظلاف', 'جز صوف', 'نقل أغنام', 'صيانة عامة'],
  },
};

export type PaymentType = 'cash' | 'debt';

export interface Sale {
  id: string;
  date: string;
  animalId?: string;
  animalNumber?: number;
  animalBreed?: string;
  description: string;
  amount: number;
  quantity: number;
  buyer?: string;
  paymentType: PaymentType;
  amountPaid: number;
  remaining: number;
  lastReminderDate?: string;
}

export interface Purchase {
  id: string;
  date: string;
  description: string;
  amount: number;
  quantity: number;
}

export const TAG_COLORS: Record<string, string> = {
  'أبيض': '#F5F0E8',
  'أحمر': '#E53E3E',
  'أصفر': '#ECC94B',
  'أخضر': '#38A169',
  'أزرق': '#3182CE',
  'وردي': '#ED64A6',
  'بنفسجي': '#805AD5',
  'برتقالي': '#DD6B20',
  'رمادي': '#A0AEC0',
  'بني': '#8B6914',
};

// Keep backward compat alias
export const ANIMAL_COLORS = TAG_COLORS;

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
  infant: 'رضيع',
};
