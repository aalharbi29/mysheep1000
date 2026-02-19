import jsPDF from 'jspdf';
import { ReportData, SavedReport } from '@/types/reports';
import { FATE_LABELS } from '@/types/animals';
import type { OffspringFate } from '@/types/animals';

// Amiri font is complex; we'll use built-in + manual RTL text rendering
// Instead, we generate a styled HTML and convert to image then PDF

export async function generatePdfReport(report: SavedReport) {
  const container = createReportHtml(report);
  document.body.appendChild(container);

  const { default: html2canvas } = await import('html2canvas');
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  document.body.removeChild(container);

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = 210; // A4 width in mm
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
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

  document.body.removeChild(container);

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = 297; // A4 landscape
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
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  });

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

  container.innerHTML = `
    <div style="text-align:center;margin-bottom:30px;">
      <h1 style="font-size:28px;font-weight:800;color:#1a1a2e;margin:0;">🐑 ${report.title}</h1>
      <p style="color:#666;font-size:14px;margin-top:8px;">📅 تاريخ الإنشاء: ${new Date(report.createdAt).toLocaleDateString('ar-SA')}</p>
      <div style="background:${netColor}15;border:2px solid ${netColor};border-radius:16px;padding:20px;margin-top:20px;display:inline-block;min-width:300px;">
        <p style="color:${netColor};font-size:16px;margin:0;">${netIcon} ${netLabel}</p>
        <p style="color:${netColor};font-size:36px;font-weight:800;margin:8px 0 0;">${Math.abs(d.netProfit).toLocaleString()} ر.س</p>
      </div>
    </div>

    ${createSectionHtml('🐄 إحصائيات القطيع', createTableHtml([
      ['إجمالي القطيع', `${d.totalAnimals} رأس`],
      ['الضأن 🐑', `${d.sheepCount}`],
      ['الماعز 🐐', `${d.goatCount}`],
      ['حري', `${d.harriCount}`],
      ['نجدي', `${d.najdiCount}`],
      ['الأمهات 👩', `${d.mothersCount}`],
      ['البهم 🐣', `${d.youngCount}`],
      ['الفحول 🐏', `${d.ramsCount}`],
      ['الذكور ♂', `${d.maleCount}`],
      ['الإناث ♀', `${d.femaleCount}`],
    ]))}

    ${createSectionHtml('👶 إحصائيات المواليد', createTableHtml([
      ['إجمالي المواليد', `${d.totalBirths}`],
      ...Object.entries(d.birthsByFate).map(([f, c]) => [
        fateEmoji(f as OffspringFate) + ' ' + (FATE_LABELS[f as OffspringFate] || f),
        `${c}`
      ]),
    ]))}

    ${createSectionHtml('💰 المبيعات', createTableHtml([
      ['إجمالي المبيعات', `${d.totalSales.toLocaleString()} ر.س`],
      ['عدد العمليات', `${d.salesCount}`],
      ['عدد الرؤوس', `${d.salesQuantity}`],
      ['متوسط السعر', `${d.avgSalePrice > 0 ? d.avgSalePrice.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'} ر.س`],
    ]), '#10b981')}

    ${createSectionHtml('🛒 المشتريات', createTableHtml([
      ['إجمالي المشتريات', `${d.totalPurchases.toLocaleString()} ر.س`],
      ['عدد العمليات', `${d.purchasesCount}`],
      ['عدد الرؤوس', `${d.purchasesQuantity}`],
      ['متوسط السعر', `${d.avgPurchasePrice > 0 ? d.avgPurchasePrice.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'} ر.س`],
    ]), '#3b82f6')}

    ${createSectionHtml('📋 المصروفات', createTableHtml([
      ['إجمالي المصروفات', `${d.totalExpenses.toLocaleString()} ر.س`],
      ['عدد المصروفات', `${d.expensesCount}`],
      ...Object.entries(d.expensesByCategory).sort(([,a],[,b]) => b - a).map(([cat, amt]) => [cat, `${amt.toLocaleString()} ر.س`]),
    ]), '#ef4444')}

    <div style="text-align:center;margin-top:30px;padding-top:20px;border-top:2px solid #e5e7eb;">
      <p style="color:#999;font-size:12px;">🐑 نظام إدارة الماشية — تقرير مُنشأ تلقائياً</p>
    </div>
  `;

  return container;
}

function createComparisonHtml(reports: SavedReport[]): HTMLDivElement {
  const container = document.createElement('div');
  container.style.cssText = 'position:absolute;left:-9999px;top:0;width:1100px;font-family:system-ui,-apple-system,sans-serif;direction:rtl;padding:40px;background:white;color:#1a1a2e;';

  const years = reports.map(r => r.year);
  const headers = ['البند', ...years.map(y => `📅 ${y}`)];

  const rows: string[][] = [
    ['🐄 إجمالي القطيع', ...reports.map(r => `${r.data.totalAnimals}`)],
    ['🐑 الضأن', ...reports.map(r => `${r.data.sheepCount}`)],
    ['🐐 الماعز', ...reports.map(r => `${r.data.goatCount}`)],
    ['👩 الأمهات', ...reports.map(r => `${r.data.mothersCount}`)],
    ['🐣 البهم', ...reports.map(r => `${r.data.youngCount}`)],
    ['🐏 الفحول', ...reports.map(r => `${r.data.ramsCount}`)],
    ['👶 المواليد', ...reports.map(r => `${r.data.totalBirths}`)],
    ['💰 المبيعات', ...reports.map(r => `${r.data.totalSales.toLocaleString()} ر.س`)],
    ['🛒 المشتريات', ...reports.map(r => `${r.data.totalPurchases.toLocaleString()} ر.س`)],
    ['📋 المصروفات', ...reports.map(r => `${r.data.totalExpenses.toLocaleString()} ر.س`)],
    ['📊 صافي الربح/الخسارة', ...reports.map(r => {
      const color = r.data.netProfit >= 0 ? '#10b981' : '#ef4444';
      return `<span style="color:${color};font-weight:700">${r.data.netProfit >= 0 ? '+' : ''}${r.data.netProfit.toLocaleString()} ر.س</span>`;
    })],
  ];

  container.innerHTML = `
    <div style="text-align:center;margin-bottom:30px;">
      <h1 style="font-size:28px;font-weight:800;margin:0;">📊 مقارنة التقارير السنوية</h1>
      <p style="color:#666;font-size:14px;margin-top:8px;">مقارنة بين ${years.join(' و ')}</p>
    </div>
    <table style="width:100%;border-collapse:collapse;direction:rtl;">
      <thead>
        <tr>${headers.map(h => `<th style="background:#1a1a2e;color:white;padding:12px 16px;text-align:right;font-size:14px;">${h}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows.map((row, i) => `<tr style="background:${i % 2 === 0 ? '#f8fafc' : 'white'}">
          ${row.map((cell, ci) => `<td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:13px;${ci === 0 ? 'font-weight:600;' : ''}">${cell}</td>`).join('')}
        </tr>`).join('')}
      </tbody>
    </table>
    <div style="text-align:center;margin-top:30px;padding-top:20px;border-top:2px solid #e5e7eb;">
      <p style="color:#999;font-size:12px;">🐑 نظام إدارة الماشية — مقارنة سنوية</p>
    </div>
  `;

  return container;
}

function createSectionHtml(title: string, content: string, accentColor = '#6366f1'): string {
  return `
    <div style="margin-bottom:24px;">
      <h2 style="font-size:18px;font-weight:700;color:${accentColor};margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid ${accentColor}30;">${title}</h2>
      ${content}
    </div>
  `;
}

function createTableHtml(rows: string[][]): string {
  return `
    <table style="width:100%;border-collapse:collapse;">
      <tbody>
        ${rows.map((row, i) => `
          <tr style="background:${i % 2 === 0 ? '#f8fafc' : 'white'}">
            <td style="padding:8px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;font-weight:600;width:50%;">${row[0]}</td>
            <td style="padding:8px 16px;border-bottom:1px solid #e5e7eb;font-size:14px;font-weight:700;text-align:left;">${row[1]}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function fateEmoji(fate: OffspringFate): string {
  const map: Record<OffspringFate, string> = {
    flock: '🐑',
    sold: '💰',
    died: '💀',
    infant: '🍼',
  };
  return map[fate] || '❓';
}
