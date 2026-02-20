import jsPDF from 'jspdf';
import { Sale, Expense, Purchase, Animal, CATEGORY_LABELS, EXPENSE_CATEGORIES } from '@/types/animals';

async function renderAndExport(container: HTMLDivElement, filename: string, mode: 'pdf' | 'image') {
  document.body.appendChild(container);
  const { default: html2canvas } = await import('html2canvas');
  const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  document.body.removeChild(container);

  if (mode === 'image') {
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } else {
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pdf = new jsPDF('p', 'mm', 'a4');
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    pdf.save(`${filename}.pdf`);
  }
}

function createContainer(): HTMLDivElement {
  const c = document.createElement('div');
  c.style.cssText = 'position:absolute;left:-9999px;top:0;width:800px;font-family:system-ui,-apple-system,sans-serif;direction:rtl;padding:40px;background:white;color:#1a1a2e;';
  return c;
}

function header(title: string, subtitle: string, color: string): string {
  return `
    <div style="text-align:center;margin-bottom:30px;border-bottom:4px solid ${color};padding-bottom:20px;">
      <h1 style="font-size:32px;font-weight:800;color:${color};margin:0;">${title}</h1>
      <p style="color:#666;font-size:14px;margin-top:8px;">${subtitle}</p>
      <p style="color:#999;font-size:12px;margin-top:4px;">📅 ${new Date().toLocaleDateString('ar-SA')}</p>
    </div>`;
}

function summaryCards(items: { label: string; value: string; color: string }[]): string {
  return `<div style="display:grid;grid-template-columns:repeat(${Math.min(items.length, 3)},1fr);gap:12px;margin-bottom:24px;">
    ${items.map(i => `
      <div style="background:${i.color}10;border:2px solid ${i.color};border-radius:12px;padding:16px;text-align:center;">
        <p style="font-size:12px;color:#666;margin:0 0 6px;">${i.label}</p>
        <p style="font-size:20px;font-weight:800;color:${i.color};margin:0;">${i.value}</p>
      </div>
    `).join('')}
  </div>`;
}

function tableHtml(headers: string[], rows: string[][], headerColor: string): string {
  return `
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <thead><tr>${headers.map(h => `<th style="background:${headerColor};color:white;padding:10px 16px;text-align:right;font-size:13px;">${h}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((row, i) => `<tr style="background:${i % 2 === 0 ? '#f8fafc' : 'white'}">${row.map(c => `<td style="padding:8px 16px;border-bottom:1px solid #e5e7eb;font-size:13px;">${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>`;
}

function footer(): string {
  return `<div style="text-align:center;margin-top:30px;padding-top:20px;border-top:3px solid #1a1a2e;">
    <p style="color:#999;font-size:12px;">🐑 نظام إدارة الماشية — تقرير مُنشأ تلقائياً</p>
  </div>`;
}

// ========== SALES REPORT ==========
function createSalesHtml(sales: Sale[]): HTMLDivElement {
  const c = createContainer();
  const total = sales.reduce((s, x) => s + x.amount, 0);
  const cashSales = sales.filter(s => s.paymentType === 'cash');
  const debtSales = sales.filter(s => s.paymentType === 'debt');
  const totalDebt = debtSales.reduce((s, x) => s + x.remaining, 0);
  const totalPaid = sales.reduce((s, x) => s + x.amountPaid, 0);

  const rows = sales.map(s => [
    s.date,
    s.description,
    s.buyer || '-',
    s.paymentType === 'cash' ? 'نقد' : 'دين',
    `<span style="font-weight:700;color:#10b981">${s.amount.toLocaleString()}</span>`,
    s.paymentType === 'debt' ? `<span style="color:#ef4444;font-weight:600">${s.remaining.toLocaleString()}</span>` : '-',
  ]);

  c.innerHTML = `
    ${header('💰 تقرير المبيعات', `إجمالي ${sales.length} عملية بيع`, '#10b981')}
    ${summaryCards([
      { label: 'إجمالي المبيعات', value: `${total.toLocaleString()} ر.س`, color: '#10b981' },
      { label: 'المقبوض', value: `${totalPaid.toLocaleString()} ر.س`, color: '#3b82f6' },
      { label: 'الديون المتبقية', value: `${totalDebt.toLocaleString()} ر.س`, color: '#ef4444' },
    ])}
    ${summaryCards([
      { label: 'نقد', value: `${cashSales.length} عملية`, color: '#10b981' },
      { label: 'دين', value: `${debtSales.length} عملية`, color: '#ef4444' },
      { label: 'عدد الرؤوس', value: `${sales.reduce((s, x) => s + x.quantity, 0)}`, color: '#6366f1' },
    ])}
    ${tableHtml(['التاريخ', 'الوصف', 'المشتري', 'الحالة', 'المبلغ', 'المتبقي'], rows, '#10b981')}
    ${footer()}
  `;
  return c;
}

export async function generateSalesReport(sales: Sale[]) {
  await renderAndExport(createSalesHtml(sales), 'تقرير-المبيعات', 'pdf');
}

// ========== EXPENSES REPORT ==========
function createExpensesHtml(expenses: Expense[]): HTMLDivElement {
  const c = createContainer();
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const byCat: Record<string, number> = {};
  expenses.forEach(e => { byCat[e.category] = (byCat[e.category] || 0) + e.amount; });

  const catRows = Object.entries(byCat).sort(([,a],[,b]) => b - a).map(([cat, amt]) => {
    const pct = total > 0 ? ((amt / total) * 100).toFixed(1) : '0';
    return [cat, `<span style="font-weight:700;color:#ef4444">${amt.toLocaleString()} ر.س</span>`, `${pct}%`];
  });

  const detailRows = expenses.slice().reverse().slice(0, 50).map(e => [
    e.date,
    e.category,
    e.description,
    `<span style="font-weight:700;color:#ef4444">${e.amount.toLocaleString()} ر.س</span>`,
  ]);

  c.innerHTML = `
    ${header('📋 تقرير المصروفات', `إجمالي ${expenses.length} عملية صرف`, '#ef4444')}
    ${summaryCards([
      { label: 'إجمالي المصروفات', value: `${total.toLocaleString()} ر.س`, color: '#ef4444' },
      { label: 'عدد العمليات', value: `${expenses.length}`, color: '#6366f1' },
      { label: 'عدد التصنيفات', value: `${Object.keys(byCat).length}`, color: '#3b82f6' },
    ])}
    <h2 style="font-size:18px;font-weight:700;color:#ef4444;margin-bottom:12px;border-bottom:3px solid #ef444430;padding-bottom:8px;">📊 التصنيفات</h2>
    ${tableHtml(['التصنيف', 'المبلغ', 'النسبة'], catRows, '#ef4444')}
    <h2 style="font-size:18px;font-weight:700;color:#1a1a2e;margin-bottom:12px;border-bottom:3px solid #1a1a2e30;padding-bottom:8px;">🧾 آخر العمليات</h2>
    ${tableHtml(['التاريخ', 'التصنيف', 'الصنف', 'المبلغ'], detailRows, '#1a1a2e')}
    ${footer()}
  `;
  return c;
}

export async function generateExpensesReport(expenses: Expense[]) {
  await renderAndExport(createExpensesHtml(expenses), 'تقرير-المصروفات', 'pdf');
}

// ========== PURCHASES REPORT ==========
function createPurchasesHtml(purchases: Purchase[]): HTMLDivElement {
  const c = createContainer();
  const total = purchases.reduce((s, p) => s + p.amount, 0);
  const totalQty = purchases.reduce((s, p) => s + p.quantity, 0);
  const avg = purchases.length > 0 ? Math.round(total / totalQty) : 0;

  const rows = purchases.map(p => [
    p.date,
    p.description,
    `${p.quantity}`,
    `<span style="font-weight:700;color:#3b82f6">${p.amount.toLocaleString()} ر.س</span>`,
  ]);

  c.innerHTML = `
    ${header('🛒 تقرير المشتريات', `إجمالي ${purchases.length} عملية شراء`, '#3b82f6')}
    ${summaryCards([
      { label: 'إجمالي المشتريات', value: `${total.toLocaleString()} ر.س`, color: '#3b82f6' },
      { label: 'عدد الرؤوس', value: `${totalQty}`, color: '#6366f1' },
      { label: 'متوسط السعر', value: `${avg.toLocaleString()} ر.س`, color: '#10b981' },
    ])}
    ${tableHtml(['التاريخ', 'الوصف', 'العدد', 'المبلغ'], rows, '#3b82f6')}
    ${footer()}
  `;
  return c;
}

export async function generatePurchasesReport(purchases: Purchase[]) {
  await renderAndExport(createPurchasesHtml(purchases), 'تقرير-المشتريات', 'pdf');
}

// ========== FLOCK REPORT ==========
function createFlockHtml(animals: Animal[]): HTMLDivElement {
  const c = createContainer();
  const alive = animals.filter(a => a.status !== 'dead');
  const dead = animals.filter(a => a.status === 'dead');
  const sheep = alive.filter(a => a.category === 'sheep');
  const goats = alive.filter(a => a.category === 'goat');
  const mothers = alive.filter(a => a.subCategory === 'mothers');
  const young = alive.filter(a => a.subCategory === 'young');
  const rams = alive.filter(a => a.subCategory === 'rams');
  const totalBirths = animals.reduce((s, a) => s + a.birthRecords.reduce((ss, r) => ss + r.offspring.length, 0), 0);

  // Breed breakdown
  const breeds = new Set(alive.map(a => a.breed));
  const breedRows = Array.from(breeds).map(breed => {
    const ba = alive.filter(a => a.breed === breed);
    return [
      CATEGORY_LABELS[breed] || breed,
      `${ba.filter(a => a.subCategory === 'mothers').length}`,
      `${ba.filter(a => a.subCategory === 'young').length}`,
      `${ba.filter(a => a.subCategory === 'rams').length}`,
      `<span style="font-weight:700">${ba.length}</span>`,
    ];
  });

  c.innerHTML = `
    ${header('🐑 تقرير القطيع', `إجمالي ${alive.length} رأس حي`, '#6366f1')}
    ${summaryCards([
      { label: 'إجمالي القطيع', value: `${alive.length} رأس`, color: '#6366f1' },
      { label: 'الضأن', value: `${sheep.length} رأس`, color: '#ECC94B' },
      { label: 'الماعز', value: `${goats.length} رأس`, color: '#DD6B20' },
    ])}
    ${summaryCards([
      { label: 'الأمهات', value: `${mothers.length}`, color: '#ECC94B' },
      { label: 'البهم', value: `${young.length}`, color: '#8B5CF6' },
      { label: 'الفحول', value: `${rams.length}`, color: '#3b82f6' },
    ])}
    ${summaryCards([
      { label: 'المواليد', value: `${totalBirths}`, color: '#10b981' },
      { label: 'النافق', value: `${dead.length}`, color: '#ef4444' },
      { label: 'نسبة النفوق', value: `${animals.length > 0 ? ((dead.length / animals.length) * 100).toFixed(1) : 0}%`, color: '#ef4444' },
    ])}
    <h2 style="font-size:18px;font-weight:700;color:#6366f1;margin-bottom:12px;border-bottom:3px solid #6366f130;padding-bottom:8px;">📊 تفاصيل السلالات</h2>
    ${tableHtml(['السلالة', 'أمهات', 'بهم', 'فحول', 'الإجمالي'], breedRows, '#6366f1')}
    ${footer()}
  `;
  return c;
}

export async function generateFlockReport(animals: Animal[]) {
  await renderAndExport(createFlockHtml(animals), 'تقرير-القطيع', 'pdf');
}

// ========== GENERIC IMAGE EXPORT ==========
export async function downloadSectionReportAsImage(data: any[], section: 'sales' | 'expenses' | 'purchases' | 'flock') {
  let container: HTMLDivElement;
  let filename: string;
  switch (section) {
    case 'sales': container = createSalesHtml(data); filename = 'تقرير-المبيعات'; break;
    case 'expenses': container = createExpensesHtml(data); filename = 'تقرير-المصروفات'; break;
    case 'purchases': container = createPurchasesHtml(data); filename = 'تقرير-المشتريات'; break;
    case 'flock': container = createFlockHtml(data); filename = 'تقرير-القطيع'; break;
  }
  await renderAndExport(container, filename, 'image');
}
