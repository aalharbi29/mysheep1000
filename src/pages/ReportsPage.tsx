import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { SavedReport } from '@/types/reports';
import { FileText, Trash2, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FATE_LABELS } from '@/types/animals';

function loadReports(): SavedReport[] {
  try {
    const data = localStorage.getItem('livestock_reports');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function deleteReport(id: string) {
  const reports = loadReports().filter(r => r.id !== id);
  localStorage.setItem('livestock_reports', JSON.stringify(reports));
  return reports;
}

function generateTextReport(report: SavedReport): string {
  const d = report.data;
  const lines: string[] = [];
  lines.push(`═══════════════════════════════════════`);
  lines.push(`  ${report.title}`);
  lines.push(`  تاريخ الإنشاء: ${new Date(report.createdAt).toLocaleDateString('ar-SA')}`);
  lines.push(`═══════════════════════════════════════`);
  lines.push('');
  lines.push(`── صافي ${d.netProfit >= 0 ? 'الربح' : 'الخسارة'}: ${Math.abs(d.netProfit).toLocaleString()} ر.س ──`);
  lines.push('');
  
  lines.push(`◆ إحصائيات القطيع`);
  lines.push(`  إجمالي القطيع: ${d.totalAnimals} رأس`);
  lines.push(`  الضأن: ${d.sheepCount} | الماعز: ${d.goatCount}`);
  lines.push(`  حري: ${d.harriCount} | نجدي: ${d.najdiCount}`);
  lines.push(`  الأمهات: ${d.mothersCount} | البهم: ${d.youngCount} | الفحول: ${d.ramsCount}`);
  lines.push(`  الذكور: ${d.maleCount} | الإناث: ${d.femaleCount}`);
  lines.push('');
  
  lines.push(`◆ المواليد`);
  lines.push(`  إجمالي المواليد: ${d.totalBirths}`);
  Object.entries(d.birthsByFate).forEach(([fate, count]) => {
    lines.push(`  ${FATE_LABELS[fate as keyof typeof FATE_LABELS] || fate}: ${count}`);
  });
  lines.push('');
  
  lines.push(`◆ المبيعات`);
  lines.push(`  الإجمالي: ${d.totalSales.toLocaleString()} ر.س`);
  lines.push(`  عدد العمليات: ${d.salesCount} | الرؤوس: ${d.salesQuantity}`);
  lines.push(`  متوسط السعر: ${d.avgSalePrice > 0 ? d.avgSalePrice.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'} ر.س`);
  lines.push('');
  
  lines.push(`◆ المشتريات`);
  lines.push(`  الإجمالي: ${d.totalPurchases.toLocaleString()} ر.س`);
  lines.push(`  عدد العمليات: ${d.purchasesCount} | الرؤوس: ${d.purchasesQuantity}`);
  lines.push(`  متوسط السعر: ${d.avgPurchasePrice > 0 ? d.avgPurchasePrice.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'} ر.س`);
  lines.push('');
  
  lines.push(`◆ المصروفات`);
  lines.push(`  الإجمالي: ${d.totalExpenses.toLocaleString()} ر.س`);
  lines.push(`  عدد المصروفات: ${d.expensesCount}`);
  if (Object.keys(d.expensesByCategory).length > 0) {
    lines.push(`  التفصيل:`);
    Object.entries(d.expensesByCategory)
      .sort(([, a], [, b]) => b - a)
      .forEach(([cat, amount]) => {
        lines.push(`    ${cat}: ${amount.toLocaleString()} ر.س`);
      });
  }
  lines.push('');
  lines.push(`═══════════════════════════════════════`);
  
  return lines.join('\n');
}

function downloadReport(report: SavedReport) {
  const text = generateTextReport(report);
  const blob = new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${report.title}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

const ReportsPage = () => {
  const [reports, setReports] = useState<SavedReport[]>(loadReports);

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التقرير؟')) {
      setReports(deleteReport(id));
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="التقارير المحفوظة" subtitle={`${reports.length} تقرير`} backTo="/" />

        {reports.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">لا توجد تقارير محفوظة</p>
            <p className="text-xs text-muted-foreground/60 mt-1">يمكنك حفظ تقرير من صفحة الملخص</p>
          </div>
        )}

        <div className="space-y-3">
          {reports.map(report => (
            <div key={report.id} className="rounded-xl bg-card p-4 card-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-card-foreground">{report.title}</h3>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => downloadReport(report)}>
                    <Download className="w-4 h-4 text-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(report.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(report.createdAt).toLocaleDateString('ar-SA')}</span>
                <span>السنة: {report.year}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <MiniStat label="القطيع" value={`${report.data.totalAnimals}`} />
                <MiniStat label="المبيعات" value={`${report.data.totalSales.toLocaleString()}`} className="text-success" />
                <MiniStat label="صافي" value={`${Math.abs(report.data.netProfit).toLocaleString()}`} className={report.data.netProfit >= 0 ? 'text-success' : 'text-destructive'} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MiniStat = ({ label, value, className }: { label: string; value: string; className?: string }) => (
  <div className="rounded-lg bg-muted/50 p-2 text-center">
    <p className="text-[10px] text-muted-foreground">{label}</p>
    <p className={`text-sm font-bold ${className || 'text-foreground'}`}>{value}</p>
  </div>
);

export default ReportsPage;
