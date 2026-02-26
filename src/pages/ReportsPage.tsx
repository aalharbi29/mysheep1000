import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { SavedReport } from '@/types/reports';
import { FileText, Trash2, Download, Calendar, Image, FileDown, GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generatePdfReport, downloadReportAsImage, generateComparisonPdf } from '@/lib/generatePdfReport';
import { toast } from '@/hooks/use-toast';

function loadReports(): SavedReport[] {
  try {
    const data = localStorage.getItem('livestock_reports');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function deleteReport(id: string) {
  const reports = loadReports().filter((r) => r.id !== id);
  localStorage.setItem('livestock_reports', JSON.stringify(reports));
  return reports;
}

const ReportsPage = () => {
  const [reports, setReports] = useState<SavedReport[]>(loadReports);
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set());

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التقرير؟')) {
      setReports(deleteReport(id));
    }
  };

  const toggleCompare = (id: string) => {
    setSelectedForCompare((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);else
      next.add(id);
      return next;
    });
  };

  const handleCompare = async () => {
    const selected = reports.filter((r) => selectedForCompare.has(r.id)).sort((a, b) => a.year - b.year);
    if (selected.length < 2) {
      toast({ title: 'اختر تقريرين على الأقل للمقارنة', variant: 'destructive' });
      return;
    }
    await generateComparisonPdf(selected);
    toast({ title: '📊 تم تصدير المقارنة', description: 'تم تحميل ملف PDF' });
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto mt-[100px] pb-[15px]">
        <PageHeader title="التقارير المحفوظة" subtitle={`${reports.length} تقرير`} backTo="/" />

        {selectedForCompare.size >= 2 &&
        <Button onClick={handleCompare} className="w-full mb-4 gap-2" variant="default">
            <GitCompare className="w-4 h-4" /> مقارنة {selectedForCompare.size} تقارير (PDF)
          </Button>
        }

        {reports.length === 0 &&
        <div className="text-center py-16">
            <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">لا توجد تقارير محفوظة</p>
            <p className="text-xs text-muted-foreground/60 mt-1">يمكنك حفظ تقرير من صفحة الملخص</p>
          </div>
        }

        <div className="space-y-3">
          {reports.map((report) =>
          <div
            key={report.id}
            className={`rounded-xl bg-card p-4 card-shadow transition-all ${selectedForCompare.has(report.id) ? 'ring-2 ring-primary' : ''}`}>

              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <input
                  type="checkbox"
                  checked={selectedForCompare.has(report.id)}
                  onChange={() => toggleCompare(report.id)}
                  className="w-4 h-4 accent-primary rounded" />

                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-card-foreground">{report.title}</h3>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => generatePdfReport(report)} title="تحميل PDF">
                    <FileDown className="w-4 h-4 text-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => downloadReportAsImage(report)} title="تحميل صورة">
                    <Image className="w-4 h-4 text-primary" />
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
          )}
        </div>
      </div>
    </div>);

};

const MiniStat = ({ label, value, className }: {label: string;value: string;className?: string;}) =>
<div className="rounded-lg bg-muted/50 p-2 text-center">
    <p className="text-[10px] text-muted-foreground">{label}</p>
    <p className={`text-sm font-bold ${className || 'text-foreground'}`}>{value}</p>
  </div>;


export default ReportsPage;