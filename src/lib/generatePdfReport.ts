import jsPDF from 'jspdf';
import { ReportData, SavedReport } from '@/types/reports';
import { FATE_LABELS, EXPENSE_CATEGORIES } from '@/types/animals';
import type { OffspringFate } from '@/types/animals';

export async function generatePdfReport(report: SavedReport) {
  const container = createReportHtml(report);
  document.body.appendChild(container);

  const { default: html2canvas } = await import('html2canvas');
  const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  document.body.removeChild(container);

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

  pdf.save(`${report.title}.pdf`);
}

export async function generateComparisonPdf(reports: SavedReport[]) {
  const container = createComparisonHtml(reports);
  document.body.appendChild(container);

  const { default: html2canvas } = await import('html2canvas');
  const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  document.body.removeChild(container);

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = 297;
  const pageHeight = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const pdf = new jsPDF('l', 'mm', 'a4');
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

  pdf.save(`مقارنة-تقارير.pdf`);
}

export async function downloadReportAsImage(report: SavedReport) {
  const container = createReportHtml(report);
  document.body.appendChild(container);

  const { default: html2canvas } = await import('html2canvas');
  const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  document.body.removeChild(container);

  const link = document.createElement('a');
  link.download = `${report.title}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function createReportHtml(report: SavedReport): HTMLDivElement {
  const d = report.data;
  const container = document.createElement('div');
  container.style.cssText = 'position:absolute;left:-9999px;top:0;width:800px;font-family:system-ui,-apple-system,sans-serif;direction:rtl;padding:40px;background:white;color:#1a1a2e;';

  const netColor = d.netProfit >= 0 ? '#10b981' : '#ef4444';
  const netIcon = d.netProfit >= 0 ? '📈' : '📉';
  const netLabel = d.netProfit >= 0 ? 'صافي الربح' : 'صافي الخسارة';

  // Breed breakdown
  const breedSection = createSectionHtml('🐑 تفاصيل السلالات', `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
      ${createBreedCard('حري', d.harriBreed || { mothers: 0, young: 0, rams: 0, males: 0, females: 0, births: 0 }, '#ECC94B')}
      ${createBreedCard('نجدي', d.najdiBreed || { mothers: 0, young: 0, rams: 0, males: 0, females: 0, births: 0 }, '#ECC94B')}
      ${createBreedCard('ماعز', d.goatBreed || { mothers: 0, young: 0, rams: 0, males: 0, females: 0, births: 0 }, '#DD6B20')}
    </div>
  `);

  // Expense details
  const expenseDetailRows = Object.entries(d.expensesByCategory)
    .sort(([,a],[,b]) => b - a)
    .map(([cat, amt]) => {
      const pct = d.totalExpenses > 0 ? ((amt / d.totalExpenses) * 100).toFixed(1) : '0';
      return [cat, `${amt.toLocaleString()} ر.س`, `${pct}%`];
    });

  container.innerHTML = `
    <div style="text-align:center;margin-bottom:30px;border-bottom:3px solid #1a1a2e;padding-bottom:20px;">
      <h1 style="font-size:32px;font-weight:800;color:#1a1a2e;margin:0;">🐑 ${report.title}</h1>
      <p style="color:#666;font-size:14px;margin-top:8px;">📅 تاريخ الإنشاء: ${new Date(report.createdAt).toLocaleDateString('ar-SA')}</p>
      <div style="background:${netColor}15;border:2px solid ${netColor};border-radius:16px;padding:20px;margin-top:20px;display:inline-block;min-width:300px;">
        <p style="color:${netColor};font-size:16px;margin:0;">${netIcon} ${netLabel}</p>
        <p style="color:${netColor};font-size:36px;font-weight:800;margin:8px 0 0;">${Math.abs(d.netProfit).toLocaleString()} ر.س</p>
      </div>
    </div>

    ${createSectionHtml('📊 ملخص مالي سريع', `
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
        ${createSummaryCard('💰 المبيعات', d.totalSales.toLocaleString() + ' ر.س', '#10b981')}
        ${createSummaryCard('🛒 المشتريات', d.totalPurchases.toLocaleString() + ' ر.س', '#3b82f6')}
        ${createSummaryCard('📋 المصروفات', d.totalExpenses.toLocaleString() + ' ر.س', '#ef4444')}
      </div>
    `)}

    ${createSectionHtml('🐄 إحصائيات القطيع', createColoredTableHtml([
      ['إجمالي القطيع', `${d.totalAnimals} رأس`, '#1a1a2e'],
      ['الضأن 🐑', `${d.sheepCount} رأس`, '#6366f1'],
      ['الماعز 🐐', `${d.goatCount} رأس`, '#DD6B20'],
      ['الأمهات 👩', `${d.mothersCount}`, '#ECC94B'],
      ['البهم 🐣', `${d.youngCount}`, '#8B5CF6'],
      ['الفحول 🐏', `${d.ramsCount}`, '#3b82f6'],
      ['الذكور ♂', `${d.maleCount}`, '#3182CE'],
      ['الإناث ♀', `${d.femaleCount}`, '#ED64A6'],
    ]))}

    ${breedSection}

    ${createSectionHtml('👶 إحصائيات المواليد', createColoredTableHtml([
      ['إجمالي المواليد', `${d.totalBirths}`, '#6366f1'],
      ...Object.entries(d.birthsByFate).map(([f, c]) => [
        fateEmoji(f as OffspringFate) + ' ' + (FATE_LABELS[f as OffspringFate] || f),
        `${c}`,
        f === 'died' ? '#ef4444' : f === 'sold' ? '#10b981' : '#6366f1'
      ]),
    ]))}

    ${createSectionHtml('💰 المبيعات', createColoredTableHtml([
      ['إجمالي المبيعات', `${d.totalSales.toLocaleString()} ر.س`, '#10b981'],
      ['عدد العمليات', `${d.salesCount}`, '#10b981'],
      ['عدد الرؤوس المباعة', `${d.salesQuantity} رأس`, '#10b981'],
      ['متوسط سعر البيع', `${d.avgSalePrice > 0 ? d.avgSalePrice.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'} ر.س`, '#10b981'],
    ]), '#10b981')}

    ${createSectionHtml('🛒 المشتريات', createColoredTableHtml([
      ['إجمالي المشتريات', `${d.totalPurchases.toLocaleString()} ر.س`, '#3b82f6'],
      ['عدد العمليات', `${d.purchasesCount}`, '#3b82f6'],
      ['عدد الرؤوس المشتراة', `${d.purchasesQuantity} رأس`, '#3b82f6'],
      ['متوسط سعر الشراء', `${d.avgPurchasePrice > 0 ? d.avgPurchasePrice.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'} ر.س`, '#3b82f6'],
    ]), '#3b82f6')}

    ${createSectionHtml('📋 تفاصيل المصروفات', `
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#ef4444;color:white;">
            <th style="padding:10px 16px;text-align:right;font-size:13px;">التصنيف</th>
            <th style="padding:10px 16px;text-align:right;font-size:13px;">المبلغ</th>
            <th style="padding:10px 16px;text-align:right;font-size:13px;">النسبة</th>
          </tr>
        </thead>
        <tbody>
          ${expenseDetailRows.map((row, i) => `
            <tr style="background:${i % 2 === 0 ? '#fef2f2' : 'white'}">
              <td style="padding:8px 16px;border-bottom:1px solid #fecaca;font-size:13px;font-weight:600;">${row[0]}</td>
              <td style="padding:8px 16px;border-bottom:1px solid #fecaca;font-size:13px;font-weight:700;color:#ef4444;">${row[1]}</td>
              <td style="padding:8px 16px;border-bottom:1px solid #fecaca;font-size:13px;">${row[2]}</td>
            </tr>
          `).join('')}
          <tr style="background:#ef4444;color:white;font-weight:700;">
            <td style="padding:10px 16px;font-size:14px;">الإجمالي</td>
            <td style="padding:10px 16px;font-size:14px;">${d.totalExpenses.toLocaleString()} ر.س</td>
            <td style="padding:10px 16px;font-size:14px;">100%</td>
          </tr>
        </tbody>
      </table>
    `, '#ef4444')}

    ${d.expenseDetails && d.expenseDetails.length > 0 ? createSectionHtml('🧾 تفاصيل الأصناف', `
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead>
          <tr style="background:#1a1a2e;color:white;">
            <th style="padding:8px;text-align:right;">التصنيف</th>
            <th style="padding:8px;text-align:right;">الصنف</th>
            <th style="padding:8px;text-align:right;">التاريخ</th>
            <th style="padding:8px;text-align:right;">المبلغ</th>
          </tr>
        </thead>
        <tbody>
          ${d.expenseDetails.map((item, i) => `
            <tr style="background:${i % 2 === 0 ? '#f8fafc' : 'white'}">
              <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${item.category}</td>
              <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${item.description}</td>
              <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;">${item.date}</td>
              <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#ef4444;">${item.amount.toLocaleString()} ر.س</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `) : ''}

    <div style="text-align:center;margin-top:30px;padding-top:20px;border-top:3px solid #1a1a2e;">
      <p style="color:#999;font-size:12px;">🐑 نظام إدارة الماشية — تقرير مُنشأ تلقائياً</p>
    </div>
  `;

  return container;
}

function createComparisonHtml(reports: SavedReport[]): HTMLDivElement {
  const container = document.createElement('div');
  container.style.cssText = 'position:absolute;left:-9999px;top:0;width:1200px;font-family:system-ui,-apple-system,sans-serif;direction:rtl;padding:40px;background:white;color:#1a1a2e;';

  const years = reports.map(r => r.year);
  const headers = ['البند', ...years.map(y => `📅 ${y}`)];

  // Calculate changes
  const changeIndicator = (values: number[]) => {
    if (values.length < 2) return '';
    const diff = values[values.length - 1] - values[values.length - 2];
    if (diff > 0) return ` <span style="color:#10b981;font-size:11px;">▲ +${diff.toLocaleString()}</span>`;
    if (diff < 0) return ` <span style="color:#ef4444;font-size:11px;">▼ ${diff.toLocaleString()}</span>`;
    return ` <span style="color:#999;font-size:11px;">━</span>`;
  };

  const rows: { cells: string[]; color?: string }[] = [
    { cells: ['🐄 إجمالي القطيع', ...reports.map(r => `${r.data.totalAnimals} رأس`)] },
    { cells: ['🐑 الضأن', ...reports.map(r => `${r.data.sheepCount}`)] },
    { cells: ['🐐 الماعز', ...reports.map(r => `${r.data.goatCount}`)] },
    { cells: ['حري', ...reports.map(r => `${r.data.harriCount}`)] },
    { cells: ['نجدي', ...reports.map(r => `${r.data.najdiCount}`)] },
    { cells: ['👩 الأمهات', ...reports.map(r => `${r.data.mothersCount}`)] },
    { cells: ['🐣 البهم', ...reports.map(r => `${r.data.youngCount}`)] },
    { cells: ['🐏 الفحول', ...reports.map(r => `${r.data.ramsCount}`)] },
    { cells: ['👶 المواليد', ...reports.map(r => `${r.data.totalBirths}`)] },
    { cells: ['💰 المبيعات', ...reports.map(r => `${r.data.totalSales.toLocaleString()} ر.س`)], color: '#10b981' },
    { cells: ['🛒 المشتريات', ...reports.map(r => `${r.data.totalPurchases.toLocaleString()} ر.س`)], color: '#3b82f6' },
    { cells: ['📋 المصروفات', ...reports.map(r => `${r.data.totalExpenses.toLocaleString()} ر.س`)], color: '#ef4444' },
    { cells: ['📊 صافي الربح/الخسارة', ...reports.map(r => {
      const color = r.data.netProfit >= 0 ? '#10b981' : '#ef4444';
      return `<span style="color:${color};font-weight:700">${r.data.netProfit >= 0 ? '+' : ''}${r.data.netProfit.toLocaleString()} ر.س</span>`;
    })] },
  ];

  // Expense category comparison
  const allCats = new Set<string>();
  reports.forEach(r => Object.keys(r.data.expensesByCategory).forEach(c => allCats.add(c)));

  const expenseCompRows = Array.from(allCats).map(cat => ({
    cells: [`📋 ${cat}`, ...reports.map(r => `${(r.data.expensesByCategory[cat] || 0).toLocaleString()} ر.س`)],
    color: '#ef4444' as string
  }));

  container.innerHTML = `
    <div style="text-align:center;margin-bottom:30px;border-bottom:3px solid #1a1a2e;padding-bottom:20px;">
      <h1 style="font-size:28px;font-weight:800;margin:0;">📊 مقارنة التقارير السنوية</h1>
      <p style="color:#666;font-size:14px;margin-top:8px;">مقارنة بين سنوات ${years.join(' و ')}</p>
    </div>

    <h2 style="font-size:18px;font-weight:700;color:#1a1a2e;margin-bottom:12px;">📈 المؤشرات الرئيسية</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <thead>
        <tr>${headers.map(h => `<th style="background:#1a1a2e;color:white;padding:12px 16px;text-align:right;font-size:14px;">${h}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows.map((row, i) => `<tr style="background:${i % 2 === 0 ? '#f8fafc' : 'white'}">
          ${row.cells.map((cell, ci) => `<td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:13px;${ci === 0 ? 'font-weight:600;' : ''}${row.color && ci > 0 ? `color:${row.color};font-weight:600;` : ''}">${cell}</td>`).join('')}
        </tr>`).join('')}
      </tbody>
    </table>

    ${expenseCompRows.length > 0 ? `
      <h2 style="font-size:18px;font-weight:700;color:#ef4444;margin-bottom:12px;">📋 مقارنة المصروفات حسب التصنيف</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr>${headers.map(h => `<th style="background:#ef4444;color:white;padding:10px 16px;text-align:right;font-size:13px;">${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${expenseCompRows.map((row, i) => `<tr style="background:${i % 2 === 0 ? '#fef2f2' : 'white'}">
            ${row.cells.map((cell, ci) => `<td style="padding:8px 16px;border-bottom:1px solid #fecaca;font-size:12px;${ci === 0 ? 'font-weight:600;' : 'color:#ef4444;font-weight:600;'}">${cell}</td>`).join('')}
          </tr>`).join('')}
        </tbody>
      </table>
    ` : ''}

    <div style="text-align:center;margin-top:30px;padding-top:20px;border-top:3px solid #1a1a2e;">
      <p style="color:#999;font-size:12px;">🐑 نظام إدارة الماشية — مقارنة سنوية</p>
    </div>
  `;

  return container;
}

function createSectionHtml(title: string, content: string, accentColor = '#6366f1'): string {
  return `
    <div style="margin-bottom:24px;">
      <h2 style="font-size:18px;font-weight:700;color:${accentColor};margin-bottom:12px;padding-bottom:8px;border-bottom:3px solid ${accentColor}30;">${title}</h2>
      ${content}
    </div>
  `;
}

function createColoredTableHtml(rows: string[][]): string {
  return `
    <table style="width:100%;border-collapse:collapse;">
      <tbody>
        ${rows.map((row, i) => `
          <tr style="background:${i % 2 === 0 ? '#f8fafc' : 'white'}">
            <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;font-weight:600;width:50%;">${row[0]}</td>
            <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:15px;font-weight:700;text-align:left;color:${row[2] || '#1a1a2e'};">${row[1]}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function createSummaryCard(title: string, value: string, color: string): string {
  return `
    <div style="background:${color}10;border:2px solid ${color};border-radius:12px;padding:16px;text-align:center;">
      <p style="font-size:13px;color:#666;margin:0 0 6px;">${title}</p>
      <p style="font-size:20px;font-weight:800;color:${color};margin:0;">${value}</p>
    </div>
  `;
}

function createBreedCard(name: string, data: { mothers: number; young: number; rams: number; males: number; females: number; births: number }, color: string): string {
  return `
    <div style="background:${color}15;border:2px solid ${color};border-radius:12px;padding:16px;">
      <h3 style="font-size:16px;font-weight:700;color:${color};margin:0 0 10px;text-align:center;">${name}</h3>
      <div style="font-size:12px;line-height:2;">
        <div style="display:flex;justify-content:space-between;"><span>👩 أمهات</span><strong>${data.mothers}</strong></div>
        <div style="display:flex;justify-content:space-between;"><span>🐣 بهم</span><strong>${data.young}</strong></div>
        <div style="display:flex;justify-content:space-between;"><span>🐏 فحول</span><strong>${data.rams}</strong></div>
        <div style="display:flex;justify-content:space-between;"><span>♂ ذكور</span><strong>${data.males}</strong></div>
        <div style="display:flex;justify-content:space-between;"><span>♀ إناث</span><strong>${data.females}</strong></div>
        <div style="display:flex;justify-content:space-between;"><span>👶 مواليد</span><strong>${data.births}</strong></div>
      </div>
    </div>
  `;
}

function fateEmoji(fate: OffspringFate): string {
  const map: Record<OffspringFate, string> = {
    flock: '🐑',
    sold: '💰',
    died: '💀',
    infant: '🍼',
    stillborn: '⚠️',
  };
  return map[fate] || '❓';
}
