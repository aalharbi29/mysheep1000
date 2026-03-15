import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Animal, Expense, Sale, Purchase, BirthRecord, AnimalStatus, AnimalSubCategory, AnimalGender, ALL_GOAT_BREED_IDS } from '@/types/animals';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Json } from '@/integrations/supabase/types';

interface LivestockContextType {
  animals: Animal[];
  expenses: Expense[];
  sales: Sale[];
  purchases: Purchase[];
  loading: boolean;
  addAnimal: (animal: Animal) => void;
  updateAnimal: (animal: Animal) => void;
  deleteAnimal: (id: string) => void;
  markAnimalDead: (id: string, deathDate: string) => void;
  addBirthRecord: (animalId: string, record: BirthRecord) => void;
  updateBirthRecord: (animalId: string, record: BirthRecord) => void;
  deleteBirthRecord: (animalId: string, recordId: string) => void;
  addExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  addSale: (sale: Sale) => void;
  updateSale: (sale: Sale) => void;
  deleteSale: (id: string) => void;
  cancelSale: (sale: Sale) => void;
  addPurchase: (purchase: Purchase) => void;
  deletePurchase: (id: string) => void;
  updateAllColors: (breed: string, subCategory: string, color: string) => void;
  getAnimalsByBreed: (category: string, breed: string) => Animal[];
  getAnimalById: (id: string) => Animal | undefined;
  getAnimalByNumber: (number: number, breed: string) => Animal | undefined;
  getTotalExpenses: () => number;
  getTotalSales: () => number;
  getTotalPurchases: () => number;
  getAliveAnimalsCount: () => number;
  getDeadAnimalsCount: () => number;
}

const LivestockContext = createContext<LivestockContextType | undefined>(undefined);

const GOAT_BREED_IDS = ALL_GOAT_BREED_IDS;

export function isGoatBreed(breed: string): boolean {
  return GOAT_BREED_IDS.includes(breed) || breed === 'goat';
}

export function getDefaultColor(breed: string, gender: 'male' | 'female', subCategory: string): string {
  if (subCategory === 'mothers') return getMotherDefaultColor(breed);
  if (breed === 'harri' || breed === 'naimi') return gender === 'male' ? 'أبيض' : 'بنفسجي';
  if (breed === 'najdi' || breed === 'sawakni') return gender === 'male' ? 'أزرق' : 'أخضر';
  if (breed === 'mixed_sheep') return gender === 'male' ? 'رمادي' : 'ذهبي';
  if (isGoatBreed(breed)) return gender === 'male' ? 'أحمر' : 'وردي';
  return 'أبيض';
}

export function getMotherDefaultColor(breed: string): string {
  if (isGoatBreed(breed)) return 'برتقالي';
  return 'أصفر';
}

const ALL_BREEDS = [
  { id: 'harri', cat: 'sheep' },
  { id: 'najdi', cat: 'sheep' },
  { id: 'naimi', cat: 'sheep' },
  { id: 'sawakni', cat: 'sheep' },
  { id: 'mixed_sheep', cat: 'sheep' },
  { id: 'aradi', cat: 'goat' },
  { id: 'shami', cat: 'goat' },
  { id: 'masri', cat: 'goat' },
  { id: 'badwi', cat: 'goat' },
  { id: 'hijazi', cat: 'goat' },
  { id: 'mixed_goat', cat: 'goat' },
];

function generateInitialAnimals(): Animal[] {
  const animals: Animal[] = [];
  ALL_BREEDS.forEach(({ id: breed, cat }) => {
    const motherColor = getMotherDefaultColor(breed);
    for (let i = 1; i <= 100; i++) {
      animals.push({
        id: `${breed}-${i}`,
        number: i,
        category: cat as any,
        breed: breed as any,
        gender: 'female',
        subCategory: 'mothers',
        color: motherColor,
        birthDate: '',
        birthRecords: [],
      });
    }
  });
  return animals;
}

// Convert DB row to Animal
function dbToAnimal(row: any): Animal {
  return {
    id: row.id,
    number: row.number,
    category: row.category,
    breed: row.breed,
    gender: row.gender,
    subCategory: row.sub_category,
    color: row.color || '',
    birthDate: row.birth_date || '',
    motherNumber: row.mother_number ?? undefined,
    motherBreed: row.mother_breed ?? undefined,
    fatherNumber: row.father_number ?? undefined,
    birthRecords: (row.birth_records as any[]) || [],
    notes: row.notes ?? undefined,
    status: row.status as AnimalStatus | undefined,
    deathDate: row.death_date ?? undefined,
    confirmed: row.confirmed ?? undefined,
    ageCategory: row.age_category ?? undefined,
    image: row.image ?? undefined,
  };
}

// Convert Animal to DB insert
function animalToDb(animal: Animal, userId: string) {
  return {
    id: animal.id,
    user_id: userId,
    number: animal.number,
    category: animal.category,
    breed: animal.breed,
    gender: animal.gender,
    sub_category: animal.subCategory,
    color: animal.color,
    birth_date: animal.birthDate || '',
    mother_number: animal.motherNumber ?? null,
    mother_breed: animal.motherBreed ?? null,
    father_number: animal.fatherNumber ?? null,
    birth_records: (animal.birthRecords || []) as unknown as Json,
    notes: animal.notes ?? null,
    status: animal.status || 'alive',
    death_date: animal.deathDate ?? null,
    confirmed: animal.confirmed ?? false,
    age_category: animal.ageCategory ?? null,
    image: animal.image ?? null,
  };
}

function saleToDb(sale: Sale, userId: string) {
  return {
    id: sale.id,
    user_id: userId,
    date: sale.date,
    animal_id: sale.animalId ?? null,
    animal_number: sale.animalNumber ?? null,
    animal_breed: sale.animalBreed ?? null,
    animal_sub_category: sale.animalSubCategory ?? null,
    animal_gender: sale.animalGender ?? null,
    description: sale.description,
    amount: sale.amount,
    quantity: sale.quantity,
    buyer: sale.buyer ?? null,
    payment_type: sale.paymentType,
    amount_paid: sale.amountPaid,
    remaining: sale.remaining,
    last_reminder_date: sale.lastReminderDate ?? null,
  };
}

function dbToSale(row: any): Sale {
  return {
    id: row.id,
    date: row.date,
    animalId: row.animal_id ?? undefined,
    animalNumber: row.animal_number ?? undefined,
    animalBreed: row.animal_breed ?? undefined,
    animalSubCategory: row.animal_sub_category ?? undefined,
    animalGender: row.animal_gender ?? undefined,
    description: row.description,
    amount: Number(row.amount),
    quantity: row.quantity,
    buyer: row.buyer ?? undefined,
    paymentType: row.payment_type,
    amountPaid: Number(row.amount_paid),
    remaining: Number(row.remaining),
    lastReminderDate: row.last_reminder_date ?? undefined,
  };
}

function expenseToDb(expense: Expense, userId: string) {
  return {
    id: expense.id,
    user_id: userId,
    date: expense.date,
    description: expense.description,
    amount: expense.amount,
    category: expense.category,
    sub_category: expense.subCategory ?? null,
    items: (expense.items || []) as unknown as Json,
  };
}

function dbToExpense(row: any): Expense {
  return {
    id: row.id,
    date: row.date,
    description: row.description,
    amount: Number(row.amount),
    category: row.category,
    subCategory: row.sub_category ?? undefined,
    items: (row.items as any[]) ?? undefined,
  };
}

function purchaseToDb(purchase: Purchase, userId: string) {
  return {
    id: purchase.id,
    user_id: userId,
    date: purchase.date,
    description: purchase.description,
    amount: purchase.amount,
    quantity: purchase.quantity,
  };
}

function dbToPurchase(row: any): Purchase {
  return {
    id: row.id,
    date: row.date,
    description: row.description,
    amount: Number(row.amount),
    quantity: row.quantity,
  };
}

export function LivestockProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Load data from DB on mount
  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // Load all data in parallel
        // Fetch all animals in pages to avoid the 1000 row default limit
        const fetchAllAnimals = async () => {
          const allAnimals: any[] = [];
          let from = 0;
          const pageSize = 1000;
          while (true) {
            const { data, error } = await supabase.from('animals').select('*').eq('user_id', userId).range(from, from + pageSize - 1);
            if (error) { console.error('Error loading animals:', error); break; }
            if (!data || data.length === 0) break;
            allAnimals.push(...data);
            if (data.length < pageSize) break;
            from += pageSize;
          }
          return { data: allAnimals, error: null };
        };

        const [animalsRes, expensesRes, salesRes, purchasesRes] = await Promise.all([
          fetchAllAnimals(),
          supabase.from('expenses').select('*').eq('user_id', userId),
          supabase.from('sales').select('*').eq('user_id', userId),
          supabase.from('purchases').select('*').eq('user_id', userId),
        ]);

        if (animalsRes.data && animalsRes.data.length > 0) {
          setAnimals(animalsRes.data.map(dbToAnimal));
        } else if (!initialized) {
          // First time user - seed with initial animals
          const initial = generateInitialAnimals();
          setAnimals(initial);
          // Insert in batches
          const rows = initial.map(a => animalToDb(a, userId));
          for (let i = 0; i < rows.length; i += 500) {
            await supabase.from('animals').insert(rows.slice(i, i + 500));
          }
        }

        if (expensesRes.data) setExpenses(expensesRes.data.map(dbToExpense));
        if (salesRes.data) setSales(salesRes.data.map(dbToSale));
        if (purchasesRes.data) setPurchases(purchasesRes.data.map(dbToPurchase));

        setInitialized(true);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  const addAnimal = useCallback((animal: Animal) => {
    if (!userId) return;
    const a = { ...animal, status: animal.status || 'alive' } as Animal;
    setAnimals(prev => [...prev, a]);
    supabase.from('animals').insert(animalToDb(a, userId)).then(({ error }) => {
      if (error) console.error('Error adding animal:', error);
    });
  }, [userId]);

  const updateAnimal = useCallback((animal: Animal) => {
    if (!userId) return;
    setAnimals(prev => prev.map(a => (a.id === animal.id ? animal : a)));
    const { id, ...rest } = animalToDb(animal, userId);
    supabase.from('animals').update(rest).eq('id', animal.id).eq('user_id', userId).then(({ error }) => {
      if (error) console.error('Error updating animal:', error);
    });
  }, [userId]);

  const deleteAnimal = useCallback((id: string) => {
    if (!userId) return;
    setAnimals(prev => prev.filter(a => a.id !== id));
    supabase.from('animals').delete().eq('id', id).eq('user_id', userId).then(({ error }) => {
      if (error) console.error('Error deleting animal:', error);
    });
  }, [userId]);

  const markAnimalDead = useCallback((id: string, deathDate: string) => {
    if (!userId) return;
    setAnimals(prev =>
      prev.map(a =>
        a.id === id ? { ...a, status: 'dead' as AnimalStatus, deathDate } : a
      )
    );
    supabase.from('animals').update({ status: 'dead', death_date: deathDate }).eq('id', id).eq('user_id', userId).then(({ error }) => {
      if (error) console.error('Error marking dead:', error);
    });
  }, [userId]);

  const addBirthRecord = useCallback((animalId: string, record: BirthRecord) => {
    if (!userId) return;
    setAnimals(prev =>
      prev.map(a => {
        if (a.id === animalId) {
          const updated = { ...a, birthRecords: [...a.birthRecords, record] };
          supabase.from('animals').update({ birth_records: updated.birthRecords as unknown as Json }).eq('id', animalId).eq('user_id', userId);
          return updated;
        }
        return a;
      })
    );
  }, [userId]);

  const updateBirthRecord = useCallback((animalId: string, record: BirthRecord) => {
    if (!userId) return;
    setAnimals(prev =>
      prev.map(a => {
        if (a.id === animalId) {
          const updated = { ...a, birthRecords: a.birthRecords.map(r => r.id === record.id ? record : r) };
          supabase.from('animals').update({ birth_records: updated.birthRecords as unknown as Json }).eq('id', animalId).eq('user_id', userId);
          return updated;
        }
        return a;
      })
    );
  }, [userId]);

  const deleteBirthRecord = useCallback((animalId: string, recordId: string) => {
    if (!userId) return;
    setAnimals(prev =>
      prev.map(a => {
        if (a.id === animalId) {
          const updated = { ...a, birthRecords: a.birthRecords.filter(r => r.id !== recordId) };
          supabase.from('animals').update({ birth_records: updated.birthRecords as unknown as Json }).eq('id', animalId).eq('user_id', userId);
          return updated;
        }
        return a;
      })
    );
  }, [userId]);

  const addExpense = useCallback((expense: Expense) => {
    if (!userId) return;
    setExpenses(prev => [...prev, expense]);
    supabase.from('expenses').insert(expenseToDb(expense, userId)).then(({ error }) => {
      if (error) console.error('Error adding expense:', error);
    });
  }, [userId]);

  const deleteExpense = useCallback((id: string) => {
    if (!userId) return;
    setExpenses(prev => prev.filter(e => e.id !== id));
    supabase.from('expenses').delete().eq('id', id).eq('user_id', userId).then(({ error }) => {
      if (error) console.error('Error deleting expense:', error);
    });
  }, [userId]);

  const addSale = useCallback((sale: Sale) => {
    if (!userId) return;
    setSales(prev => [...prev, sale]);
    supabase.from('sales').insert(saleToDb(sale, userId)).then(({ error }) => {
      if (error) console.error('Error adding sale:', error);
    });
  }, [userId]);

  const updateSale = useCallback((sale: Sale) => {
    if (!userId) return;
    setSales(prev => prev.map(s => s.id === sale.id ? sale : s));
    const { id, ...rest } = saleToDb(sale, userId);
    supabase.from('sales').update(rest).eq('id', sale.id).eq('user_id', userId).then(({ error }) => {
      if (error) console.error('Error updating sale:', error);
    });
  }, [userId]);

  const deleteSale = useCallback((id: string) => {
    if (!userId) return;
    setSales(prev => prev.filter(s => s.id !== id));
    supabase.from('sales').delete().eq('id', id).eq('user_id', userId).then(({ error }) => {
      if (error) console.error('Error deleting sale:', error);
    });
  }, [userId]);

  const cancelSale = useCallback((sale: Sale) => {
    if (sale.animalId && sale.animalNumber && sale.animalBreed) {
      const breed = sale.animalBreed;
      const cat = isGoatBreed(breed) ? 'goat' : 'sheep';
      const subCat = sale.animalSubCategory || 'young';
      const gender = sale.animalGender || 'male';
      const color = subCat === 'mothers'
        ? getMotherDefaultColor(breed)
        : getDefaultColor(breed, gender as 'male' | 'female', subCat);
      addAnimal({
        id: sale.animalId,
        number: sale.animalNumber,
        category: cat as any,
        breed: breed as any,
        gender: gender as any,
        subCategory: subCat as any,
        color,
        birthDate: '',
        birthRecords: [],
        status: 'alive',
      });
    }
    deleteSale(sale.id);
  }, [addAnimal, deleteSale]);

  const addPurchase = useCallback((purchase: Purchase) => {
    if (!userId) return;
    setPurchases(prev => [...prev, purchase]);
    supabase.from('purchases').insert(purchaseToDb(purchase, userId)).then(({ error }) => {
      if (error) console.error('Error adding purchase:', error);
    });
  }, [userId]);

  const deletePurchase = useCallback((id: string) => {
    if (!userId) return;
    setPurchases(prev => prev.filter(p => p.id !== id));
    supabase.from('purchases').delete().eq('id', id).eq('user_id', userId).then(({ error }) => {
      if (error) console.error('Error deleting purchase:', error);
    });
  }, [userId]);

  const updateAllColors = useCallback((breed: string, subCategory: string, color: string) => {
    if (!userId) return;
    setAnimals(prev =>
      prev.map(a => {
        if (a.breed === breed && a.subCategory === subCategory && a.status !== 'dead') {
          return { ...a, color };
        }
        return a;
      })
    );
    supabase.from('animals')
      .update({ color })
      .eq('breed', breed)
      .eq('sub_category', subCategory)
      .neq('status', 'dead')
      .eq('user_id', userId)
      .then(({ error }) => {
        if (error) console.error('Error updating colors:', error);
      });
  }, [userId]);

  const getAnimalsByBreed = useCallback((category: string, breed: string) =>
    animals.filter(a => a.breed === breed), [animals]);

  const getAnimalById = useCallback((id: string) => animals.find(a => a.id === id), [animals]);

  const getAnimalByNumber = useCallback((number: number, breed: string) =>
    animals.find(a => a.number === number && a.breed === breed), [animals]);

  const getTotalExpenses = useCallback(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const getTotalSales = useCallback(() => sales.reduce((sum, s) => sum + s.amount, 0), [sales]);
  const getTotalPurchases = useCallback(() => purchases.reduce((sum, p) => sum + p.amount, 0), [purchases]);
  const getAliveAnimalsCount = useCallback(() => animals.filter(a => a.status !== 'dead' && a.confirmed === true).length, [animals]);
  const getDeadAnimalsCount = useCallback(() => animals.filter(a => a.status === 'dead' && a.confirmed === true).length, [animals]);

  return (
    <LivestockContext.Provider
      value={{
        animals, expenses, sales, purchases, loading,
        addAnimal, updateAnimal, deleteAnimal, markAnimalDead,
        addBirthRecord, updateBirthRecord, deleteBirthRecord,
        addExpense, deleteExpense, addSale, updateSale, deleteSale, cancelSale, addPurchase, deletePurchase,
        updateAllColors,
        getAnimalsByBreed, getAnimalById, getAnimalByNumber,
        getTotalExpenses, getTotalSales, getTotalPurchases,
        getAliveAnimalsCount, getDeadAnimalsCount,
      }}
    >
      {children}
    </LivestockContext.Provider>
  );
}

export function useLivestock() {
  const ctx = useContext(LivestockContext);
  if (!ctx) throw new Error('useLivestock must be used within LivestockProvider');
  return ctx;
}
