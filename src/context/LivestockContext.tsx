import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Animal, Expense, Sale, Purchase, BirthRecord, Offspring } from '@/types/animals';

interface LivestockContextType {
  animals: Animal[];
  expenses: Expense[];
  sales: Sale[];
  purchases: Purchase[];
  addAnimal: (animal: Animal) => void;
  updateAnimal: (animal: Animal) => void;
  deleteAnimal: (id: string) => void;
  addBirthRecord: (animalId: string, record: BirthRecord) => void;
  updateBirthRecord: (animalId: string, record: BirthRecord) => void;
  deleteBirthRecord: (animalId: string, recordId: string) => void;
  addExpense: (expense: Expense) => void;
  addSale: (sale: Sale) => void;
  addPurchase: (purchase: Purchase) => void;
  getAnimalsByBreed: (category: string, breed: string) => Animal[];
  getAnimalById: (id: string) => Animal | undefined;
  getAnimalByNumber: (number: number, breed: string) => Animal | undefined;
  getTotalExpenses: () => number;
  getTotalSales: () => number;
  getTotalPurchases: () => number;
}

const LivestockContext = createContext<LivestockContextType | undefined>(undefined);

// Default colors by breed and role
export function getDefaultColor(breed: string, gender: 'male' | 'female', subCategory: string): string {
  if (subCategory === 'mothers' || (subCategory === 'young' && gender === 'female' && false)) {
    // Mothers colors
    if (breed === 'harri') return 'أصفر';
    if (breed === 'najdi') return 'أصفر';
    if (breed === 'goat') return 'برتقالي';
  }
  // Offspring / young colors
  if (breed === 'harri') return gender === 'male' ? 'أبيض' : 'بنفسجي';
  if (breed === 'najdi') return gender === 'male' ? 'أزرق' : 'أخضر';
  if (breed === 'goat') return gender === 'male' ? 'أحمر' : 'وردي';
  return 'أبيض';
}

export function getMotherDefaultColor(breed: string): string {
  if (breed === 'harri' || breed === 'najdi') return 'أصفر';
  if (breed === 'goat') return 'برتقالي';
  return 'أبيض';
}

function generateInitialAnimals(): Animal[] {
  const animals: Animal[] = [];
  const breeds = ['harri', 'najdi', 'goat'] as const;
  const categories = { harri: 'sheep', najdi: 'sheep', goat: 'goat' } as const;

  breeds.forEach(breed => {
    const motherColor = getMotherDefaultColor(breed);
    for (let i = 1; i <= 100; i++) {
      animals.push({
        id: `${breed}-${i}`,
        number: i,
        category: categories[breed],
        breed,
        gender: 'female' as const,
        subCategory: 'mothers',
        color: motherColor,
        birthDate: '',
        birthRecords: [],
      });
    }
  });

  return animals;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

export function LivestockProvider({ children }: { children: ReactNode }) {
  const [animals, setAnimals] = useState<Animal[]>(() => {
    const loaded = loadFromStorage('livestock_animals', generateInitialAnimals());
    // Enforce default colors for mothers
    return loaded.map(a => {
      if (a.subCategory === 'mothers') {
        return { ...a, color: getMotherDefaultColor(a.breed) };
      }
      return a;
    });
  });
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    loadFromStorage('livestock_expenses', [])
  );
  const [sales, setSales] = useState<Sale[]>(() =>
    loadFromStorage('livestock_sales', [])
  );
  const [purchases, setPurchases] = useState<Purchase[]>(() =>
    loadFromStorage('livestock_purchases', [])
  );

  useEffect(() => {
    localStorage.setItem('livestock_animals', JSON.stringify(animals));
  }, [animals]);
  useEffect(() => {
    localStorage.setItem('livestock_expenses', JSON.stringify(expenses));
  }, [expenses]);
  useEffect(() => {
    localStorage.setItem('livestock_sales', JSON.stringify(sales));
  }, [sales]);
  useEffect(() => {
    localStorage.setItem('livestock_purchases', JSON.stringify(purchases));
  }, [purchases]);

  const addAnimal = (animal: Animal) => setAnimals(prev => [...prev, animal]);
  const updateAnimal = (animal: Animal) =>
    setAnimals(prev => prev.map(a => (a.id === animal.id ? animal : a)));
  const deleteAnimal = (id: string) =>
    setAnimals(prev => prev.filter(a => a.id !== id));

  const addBirthRecord = (animalId: string, record: BirthRecord) => {
    setAnimals(prev =>
      prev.map(a =>
        a.id === animalId
          ? { ...a, birthRecords: [...a.birthRecords, record] }
          : a
      )
    );
  };

  const updateBirthRecord = (animalId: string, record: BirthRecord) => {
    setAnimals(prev =>
      prev.map(a =>
        a.id === animalId
          ? { ...a, birthRecords: a.birthRecords.map(r => r.id === record.id ? record : r) }
          : a
      )
    );
  };

  const deleteBirthRecord = (animalId: string, recordId: string) => {
    setAnimals(prev =>
      prev.map(a =>
        a.id === animalId
          ? { ...a, birthRecords: a.birthRecords.filter(r => r.id !== recordId) }
          : a
      )
    );
  };

  const addExpense = (expense: Expense) => setExpenses(prev => [...prev, expense]);
  const addSale = (sale: Sale) => setSales(prev => [...prev, sale]);
  const addPurchase = (purchase: Purchase) => setPurchases(prev => [...prev, purchase]);

  const getAnimalsByBreed = (category: string, breed: string) =>
    animals.filter(a => {
      if (category === 'goat') return a.category === 'goat';
      return a.category === category && a.breed === breed;
    });

  const getAnimalById = (id: string) => animals.find(a => a.id === id);
  
  const getAnimalByNumber = (number: number, breed: string) =>
    animals.find(a => a.number === number && a.breed === breed);

  const getTotalExpenses = () => expenses.reduce((sum, e) => sum + e.amount, 0);
  const getTotalSales = () => sales.reduce((sum, s) => sum + s.amount, 0);
  const getTotalPurchases = () => purchases.reduce((sum, p) => sum + p.amount, 0);

  return (
    <LivestockContext.Provider
      value={{
        animals, expenses, sales, purchases,
        addAnimal, updateAnimal, deleteAnimal, addBirthRecord, updateBirthRecord, deleteBirthRecord,
        addExpense, addSale, addPurchase,
        getAnimalsByBreed, getAnimalById, getAnimalByNumber,
        getTotalExpenses, getTotalSales, getTotalPurchases,
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
