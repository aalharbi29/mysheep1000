import { useState, useMemo } from 'react';
import PageHeader from '@/components/PageHeader';
import { useLivestock } from '@/context/LivestockContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ShoppingCart, FileText, Image } from 'lucide-react';
import { EXPENSE_CATEGORIES, ExpenseCategoryKey, ExpenseItem } from '@/types/animals';
import { toast } from '@/hooks/use-toast';
import { generateExpensesReport, downloadSectionReportAsImage } from '@/lib/generateSectionReport';
import MonthlyGroup, { groupByMonth } from '@/components/MonthlyGroup';

const ExpensesPage = () => {
  const { expenses, addExpense, deleteExpense, getTotalExpenses } = useLivestock();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategoryKey | ''>('');
  const [items, setItems] = useState<{name: string;qty: string;price: string;}[]>([]);
  const [workerName, setWorkerName] = useState('');
  const [workerSalary, setWorkerSalary] = useState('');
  const [workerBonus, setWorkerBonus] = useState('');
  const [tempWorkType, setTempWorkType] = useState('');
  const [tempAmount, setTempAmount] = useState('');
  const [customItem, setCustomItem] = useState('');
  const [customCategories, setCustomCategories] = useState<Record<string, string[]>>(() => {
    try {return JSON.parse(localStorage.getItem('livestock_custom_expense_items') || '{}');} catch {return {};}
  });

  const categoryData = selectedCategory ? EXPENSE_CATEGORIES[selectedCategory] : null;

  const allItemsForCategory = useMemo(() => {
    if (!selectedCategory || !categoryData) return [];
    const custom = customCategories[selectedCategory] || [];
    return [...categoryData.items, ...custom];
  }, [selectedCategory, categoryData, customCategories]);

  const addItem = (itemName: string) => {
    if (items.find((i) => i.name === itemName)) return;
    setItems((prev) => [...prev, { name: itemName, qty: '1', price: '' }]);
  };
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: 'qty' | 'price', value: string) => {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };
  const getItemTotal = (item: {qty: string;price: string;}) => (Number(item.qty) || 0) * (Number(item.price) || 0);
  const grandTotal = items.reduce((sum, item) => sum + getItemTotal(item), 0);

  const handleAddCustomItem = () => {
    if (!customItem.trim() || !selectedCategory) return;
    const updated = { ...customCategories };
    if (!updated[selectedCategory]) updated[selectedCategory] = [];
    if (!updated[selectedCategory].includes(customItem.trim())) {
      updated[selectedCategory].push(customItem.trim());
      setCustomCategories(updated);
      localStorage.setItem('livestock_custom_expense_items', JSON.stringify(updated));
    }
    addItem(customItem.trim());
    setCustomItem('');
  };

  const handleSave = () => {
    if (!selectedCategory || !date) return;
    const catLabel = categoryData?.label || selectedCategory;
    if (selectedCategory === 'permanentLabor') {
      if (!workerName || !workerSalary) return;
      const total = Number(workerSalary) + Number(workerBonus || 0);
      addExpense({ id: Date.now().toString(), date, description: `راتب: ${workerName}`, amount: total, category: catLabel, subCategory: workerName, items: [{ itemName: 'راتب', quantity: 1, unitPrice: Number(workerSalary), total: Number(workerSalary) }, ...(workerBonus ? [{ itemName: 'حافز', quantity: 1, unitPrice: Number(workerBonus), total: Number(workerBonus) }] : [])] });
      toast({ title: 'تم الحفظ', description: `تم إضافة راتب ${workerName}` });
    } else if (selectedCategory === 'tempLabor') {
      if (!tempWorkType || !tempAmount) return;
      addExpense({ id: Date.now().toString(), date, description: tempWorkType, amount: Number(tempAmount), category: catLabel, subCategory: tempWorkType, items: [{ itemName: tempWorkType, quantity: 1, unitPrice: Number(tempAmount), total: Number(tempAmount) }] });
      toast({ title: 'تم الحفظ', description: `تم إضافة أجر عمالة مؤقتة` });
    } else {
      if (items.length === 0) return;
      const expenseItems: ExpenseItem[] = items.map((i) => ({ itemName: i.name, quantity: Number(i.qty) || 0, unitPrice: Number(i.price) || 0, total: getItemTotal(i) }));
      expenseItems.forEach((ei, idx) => {
        addExpense({ id: `${Date.now()}-${idx}`, date, description: ei.itemName, amount: ei.total, category: catLabel, subCategory: ei.itemName, items: [ei] });
      });
      toast({ title: 'تم الحفظ', description: `تم إضافة ${expenseItems.length} صنف بإجمالي ${grandTotal.toLocaleString()} ر.س` });
    }
    resetForm();
    setOpen(false);
  };

  const resetForm = () => {
    setSelectedCategory('');setItems([]);
    setWorkerName('');setWorkerSalary('');setWorkerBonus('');
    setTempWorkType('');setTempAmount('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    expenses.forEach((e) => {totals[e.category || 'أخرى'] = (totals[e.category || 'أخرى'] || 0) + e.amount;});
    return totals;
  }, [expenses]);

  const monthlyGroups = useMemo(() => groupByMonth(expenses), [expenses]);

  return (
    <div className="min-h-screen p-4 sm:p-6 rounded-3xl bg-gray-900">
      <div className="max-w-2xl mx-auto my-[30px] mt-[100px] pb-[15px] border-accent border border-solid rounded-3xl bg-primary-foreground">
        <PageHeader title="المصروفات" subtitle={`الإجمالي: ${getTotalExpenses().toLocaleString()} ر.س`} backTo="/" />

        {Object.keys(categoryTotals).length > 0 &&
        <div className="grid grid-cols-2 gap-2 mb-4">
            {Object.entries(categoryTotals).sort(([, a], [, b]) => b - a).map(([cat, total]) => {
            const catInfo = Object.values(EXPENSE_CATEGORIES).find((c) => c.label === cat);
            return (
              <div key={cat} className="rounded-xl bg-card p-3 card-shadow">
                  <div className="flex items-center gap-1 mb-1">
                    <span>{catInfo?.icon || '📋'}</span>
                    <span className="text-xs text-muted-foreground">{cat}</span>
                  </div>
                  <p className="text-lg font-bold text-destructive">{total.toLocaleString()} <span className="text-xs font-normal">ر.س</span></p>
                </div>);

          })}
          </div>
        }

        {expenses.length > 0 &&
        <div className="flex gap-2 mb-4">
            <Button variant="outline" className="flex-1 gap-2 h-10 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => generateExpensesReport(expenses)}>
              <FileText className="w-4 h-4" /> تقرير PDF
            </Button>
            <Button variant="outline" className="flex-1 gap-2 h-10 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => downloadSectionReportAsImage(expenses, 'expenses')}>
              <Image className="w-4 h-4" /> تقرير صورة
            </Button>
          </div>
        }

        <Dialog open={open} onOpenChange={(o) => {setOpen(o);if (!o) resetForm();}}>
          <DialogTrigger asChild>
            <Button className="w-full mb-4 gap-2 h-12 text-base"><Plus className="w-5 h-5" /> إضافة مصروف</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>إضافة مصروفات</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-3">
              <div><Label>التاريخ</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
              <div>
                <Label>نوع الصرف</Label>
                <Select value={selectedCategory} onValueChange={(v) => {setSelectedCategory(v as ExpenseCategoryKey);setItems([]);}}>
                  <SelectTrigger><SelectValue placeholder="اختر نوع الصرف" /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(EXPENSE_CATEGORIES) as ExpenseCategoryKey[]).map((key) =>
                    <SelectItem key={key} value={key}>{EXPENSE_CATEGORIES[key].icon} {EXPENSE_CATEGORIES[key].label}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategory === 'permanentLabor' &&
              <div className="space-y-3 rounded-xl bg-muted/50 p-3">
                  <div><Label>اسم العامل</Label><Input value={workerName} onChange={(e) => setWorkerName(e.target.value)} placeholder="مثال: محمد" /></div>
                  <div><Label>الراتب الشهري</Label><Input type="number" value={workerSalary} onChange={(e) => setWorkerSalary(e.target.value)} placeholder="0" /></div>
                  <div><Label>حافز (اختياري)</Label><Input type="number" value={workerBonus} onChange={(e) => setWorkerBonus(e.target.value)} placeholder="0" /></div>
                  {workerSalary && <div className="text-left font-bold text-primary">الإجمالي: {(Number(workerSalary) + Number(workerBonus || 0)).toLocaleString()} ر.س</div>}
                </div>
              }

              {selectedCategory === 'tempLabor' &&
              <div className="space-y-3 rounded-xl bg-muted/50 p-3">
                  <div>
                    <Label>نوع العمل</Label>
                    <Select value={tempWorkType} onValueChange={setTempWorkType}>
                      <SelectTrigger><SelectValue placeholder="اختر نوع العمل" /></SelectTrigger>
                      <SelectContent>
                        {[...EXPENSE_CATEGORIES.tempLabor.items, ...(customCategories.tempLabor || [])].map((item) =>
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                      )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1"><Label>إضافة نوع عمل جديد</Label><Input value={customItem} onChange={(e) => setCustomItem(e.target.value)} placeholder="نوع عمل آخر" /></div>
                    <Button size="sm" variant="outline" onClick={() => {if (customItem.trim()) {handleAddCustomItem();setTempWorkType(customItem.trim());}}}>إضافة</Button>
                  </div>
                  <div><Label>المبلغ</Label><Input type="number" value={tempAmount} onChange={(e) => setTempAmount(e.target.value)} placeholder="0" /></div>
                </div>
              }

              {selectedCategory && !['permanentLabor', 'tempLabor'].includes(selectedCategory) &&
              <div className="space-y-3">
                  <Label>اختر الأصناف</Label>
                  <div className="flex flex-wrap gap-2">
                    {allItemsForCategory.map((item) => {
                    const isSelected = items.find((i) => i.name === item);
                    return (
                      <button key={item} onClick={() => isSelected ? removeItem(items.findIndex((i) => i.name === item)) : addItem(item)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${isSelected ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-foreground hover:border-primary/50'}`}>
                          {item}
                        </button>);

                  })}
                  </div>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1"><Label>إضافة صنف جديد</Label><Input value={customItem} onChange={(e) => setCustomItem(e.target.value)} placeholder="صنف غير موجود" /></div>
                    <Button size="sm" variant="outline" onClick={handleAddCustomItem}><Plus className="w-4 h-4" /></Button>
                  </div>
                  {items.length > 0 &&
                <div className="space-y-2 mt-3">
                      <Label>تفاصيل الأصناف المحددة</Label>
                      {items.map((item, idx) =>
                  <div key={item.name} className="rounded-lg bg-card border border-border p-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-sm text-foreground">{item.name}</span>
                            <button onClick={() => removeItem(idx)} className="text-destructive hover:text-destructive/80"><Trash2 className="w-4 h-4" /></button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div><Label className="text-xs">الكمية</Label><Input type="number" value={item.qty} onChange={(e) => updateItem(idx, 'qty', e.target.value)} className="h-8 text-sm" /></div>
                            <div><Label className="text-xs">سعر الوحدة</Label><Input type="number" value={item.price} onChange={(e) => updateItem(idx, 'price', e.target.value)} className="h-8 text-sm" placeholder="0" /></div>
                            <div><Label className="text-xs">الإجمالي</Label><div className="h-8 flex items-center text-sm font-bold text-primary">{getItemTotal(item).toLocaleString()} ر.س</div></div>
                          </div>
                        </div>
                  )}
                    </div>
                }
                </div>
              }

              {selectedCategory && !['permanentLabor', 'tempLabor'].includes(selectedCategory) && items.length > 0 &&
              <div className="rounded-xl bg-primary/10 p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">الإجمالي الكلي</p>
                  <p className="text-2xl font-extrabold text-primary">{grandTotal.toLocaleString()} ر.س</p>
                </div>
              }

              <Button onClick={handleSave} className="w-full h-12 text-base" disabled={
              !selectedCategory || !date ||
              selectedCategory === 'permanentLabor' && (!workerName || !workerSalary) ||
              selectedCategory === 'tempLabor' && (!tempWorkType || !tempAmount) ||
              !['permanentLabor', 'tempLabor'].includes(selectedCategory) && items.length === 0
              }>
                <ShoppingCart className="w-5 h-5 ml-2" /> حفظ المصروفات
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {expenses.length === 0 && <p className="text-center text-muted-foreground py-[10px]">لا توجد مصروفات مسجلة</p>}

        {Object.entries(monthlyGroups).map(([monthKey, monthExpenses]) => {
          const monthTotal = monthExpenses.reduce((s, x) => s + x.amount, 0);
          return (
            <MonthlyGroup key={monthKey} monthKey={monthKey} total={monthTotal} count={monthExpenses.length} variant="expenses">
              {monthExpenses.slice().reverse().map((e) => {
                const catInfo = Object.values(EXPENSE_CATEGORIES).find((c) => c.label === e.category);
                return (
                  <div key={e.id} className="rounded-xl bg-card p-4 card-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span>{catInfo?.icon || '📋'}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{e.category}</span>
                        </div>
                        <p className="font-semibold text-card-foreground">{e.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{e.date}</p>
                        {e.items && e.items.length > 0 &&
                        <p className="text-xs text-muted-foreground">
                            {e.items.map((i) => `${i.itemName} (${i.quantity}×${i.unitPrice.toLocaleString()})`).join(' • ')}
                          </p>
                        }
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-bold text-destructive whitespace-nowrap">{e.amount.toLocaleString()} ر.س</span>
                        <button onClick={() => {if (confirm('هل أنت متأكد من حذف هذا المصروف؟')) {deleteExpense(e.id);toast({ title: '🗑️ تم الحذف', description: 'تم حذف المصروف بنجاح' });}}} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>);

              })}
            </MonthlyGroup>);

        })}
      </div>
    </div>);

};

export default ExpensesPage;