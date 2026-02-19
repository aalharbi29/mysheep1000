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
  // Net
  netProfit: number;
}
