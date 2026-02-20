import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Animal, Expense, Sale, Purchase, BirthRecord, Offspring, AnimalStatus } from '@/types/animals';

interface LivestockContextType {
  animals: Animal[];
  expenses: Expense[];
  sales: Sale[];
  purchases: Purchase[];
  addAnimal: (animal: Animal) => void;
  updateAnimal: (animal: Animal) => void;
  deleteAnimal: (id: string) => void;
  markAnimalDead: (id: string, deathDate: string) => void;
  addBirthRecord: (animalId: string, record: BirthRecord) => void;
  updateBirthRecord: (animalId: string, record: BirthRecord) => void;
  deleteBirthRecord: (animalId: string, recordId: string) => void;
  addExpense: (expense: Expense) => void;
  addSale: (sale: Sale) => void;
  updateSale: (sale: Sale) => void;
  deleteSale: (id: string) => void;
  cancelSale: (sale: Sale) => void;
  addPurchase: (purchase: Purchase) => void;
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

  const addAnimal = (animal: Animal) => setAnimals(prev => [...prev, { ...animal, status: animal.status || 'alive' }]);
  const updateAnimal = (animal: Animal) =>
    setAnimals(prev => prev.map(a => (a.id === animal.id ? animal : a)));
  const deleteAnimal = (id: string) =>
    setAnimals(prev => prev.filter(a => a.id !== id));

  const markAnimalDead = (id: string, deathDate: string) => {
    setAnimals(prev =>
      prev.map(a =>
        a.id === id ? { ...a, status: 'dead' as AnimalStatus, deathDate } : a
      )
    );
  };

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
  const updateSale = (sale: Sale) => setSales(prev => prev.map(s => s.id === sale.id ? sale : s));
  const deleteSale = (id: string) => setSales(prev => prev.filter(s => s.id !== id));
  
  const cancelSale = (sale: Sale) => {
    // Restore the animal if it was sold from a card
    if (sale.animalId && sale.animalNumber && sale.animalBreed) {
      const breed = sale.animalBreed;
      const cat = breed === 'goat' ? 'goat' : 'sheep';
      addAnimal({
        id: sale.animalId,
        number: sale.animalNumber,
        category: cat as any,
        breed: breed as any,
        gender: 'male', // default, user can edit
        subCategory: 'young',
        color: 'أبيض',
        birthDate: '',
        birthRecords: [],
        status: 'alive',
      });
    }
    deleteSale(sale.id);
  };
  
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
  const getAliveAnimalsCount = () => animals.filter(a => a.status !== 'dead').length;
  const getDeadAnimalsCount = () => animals.filter(a => a.status === 'dead').length;

  return (
    <LivestockContext.Provider
      value={{
        animals, expenses, sales, purchases,
        addAnimal, updateAnimal, deleteAnimal, markAnimalDead,
        addBirthRecord, updateBirthRecord, deleteBirthRecord,
        addExpense, addSale, updateSale, deleteSale, cancelSale, addPurchase,
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
