export interface BreedBreakdown {
  mothers: number;
  young: number;
  rams: number;
  males: number;
  females: number;
  births: number;
}

export interface ExpenseDetail {
  category: string;
  description: string;
  date: string;
  amount: number;
}

export interface SavedReport {
  id: string;
  title: string;
  year: number;
  createdAt: string;
  data: ReportData;
}

export interface ReportData {
  // Flock
  totalAnimals: number;
  sheepCount: number;
  goatCount: number;
  harriCount: number;
  najdiCount: number;
  mothersCount: number;
  youngCount: number;
  ramsCount: number;
  maleCount: number;
  femaleCount: number;
  // Breed breakdown
  harriBreed?: BreedBreakdown;
  najdiBreed?: BreedBreakdown;
  goatBreed?: BreedBreakdown;
  // Births
  totalBirths: number;
  birthsByFate: Record<string, number>;
  // Sales
  totalSales: number;
  salesCount: number;
  salesQuantity: number;
  avgSalePrice: number;
  // Purchases
  totalPurchases: number;
  purchasesCount: number;
  purchasesQuantity: number;
  avgPurchasePrice: number;
  // Expenses
  totalExpenses: number;
  expensesCount: number;
  expensesByCategory: Record<string, number>;
  expenseDetails?: ExpenseDetail[];
  // Net
  netProfit: number;
}
