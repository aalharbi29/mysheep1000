import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Animal, Expense, Sale, Purchase, BirthRecord, Offspring, AnimalStatus, AnimalSubCategory, AnimalGender, ALL_GOAT_BREED_IDS } from '@/types/animals';

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
  // Young / rams colors by breed
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

function migrateAnimals(animals: Animal[]): Animal[] {
  // Migrate legacy 'goat' breed to 'mixed_goat'
  let migrated = animals.map(a => {
    if ((a.breed as string) === 'goat') {
      return { ...a, breed: 'mixed_goat' as any };
    }
    return a;
  });

  // Add missing breeds (100 mothers each)
  const existingBreeds = new Set(migrated.map(a => a.breed));
  ALL_BREEDS.forEach(({ id: breed, cat }) => {
    if (!existingBreeds.has(breed as any)) {
      const motherColor = getMotherDefaultColor(breed);
      for (let i = 1; i <= 100; i++) {
        migrated.push({
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
    }
  });

  return migrated;
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
    return migrateAnimals(loaded);
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
    if (sale.animalId && sale.animalNumber && sale.animalBreed) {
      const breed = sale.animalBreed;
      const cat = isGoatBreed(breed) ? 'goat' : 'sheep';
      const subCat = sale.animalSubCategory || 'young';
      const gender = sale.animalGender || 'male';
      const color = subCat === 'mothers'
        ? getMotherDefaultColor(breed)
        : getDefaultColor(breed, gender, subCat);
      addAnimal({
        id: sale.animalId,
        number: sale.animalNumber,
        category: cat as any,
        breed: breed as any,
        gender,
        subCategory: subCat,
        color,
        birthDate: '',
        birthRecords: [],
        status: 'alive',
      });
    }
    deleteSale(sale.id);
  };

  const addPurchase = (purchase: Purchase) => setPurchases(prev => [...prev, purchase]);

  const updateAllColors = (breed: string, subCategory: string, color: string) => {
    setAnimals(prev =>
      prev.map(a => {
        if (a.breed === breed && a.subCategory === subCategory && a.status !== 'dead') {
          return { ...a, color };
        }
        return a;
      })
    );
  };

  const getAnimalsByBreed = (category: string, breed: string) =>
    animals.filter(a => a.breed === breed);

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
