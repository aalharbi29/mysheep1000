import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { useLivestock } from '@/context/LivestockContext';
import { Button } from '@/components/ui/button';
import { FileText, Image } from 'lucide-react';
import { generateFlockReport, downloadSectionReportAsImage } from '@/lib/generateSectionReport';

const categories = [
{ id: 'sheep', label: 'ضأن', emoji: '🐑', path: '/flock/sheep' },
{ id: 'goat', label: 'ماعز', emoji: '🐐', path: '/flock/goat' }];


const FlockPage = () => {
  const navigate = useNavigate();
  const { animals } = useLivestock();

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 rounded-3xl opacity-100 border-8 border-solid ml-0 mr-0 pt-0 pb-0 pl-[5px] pr-[5px] mt-[200px] mb-[200px]">
      <div className="max-w-2xl mx-auto my-[100px] border-2 border-cyan-950 border-solid">
        <PageHeader title="القطيع" subtitle="اختر نوع الماشية" backTo="/" />

        {/* Flock Report buttons */}
        <div className="flex gap-2 mb-4">
          <Button variant="outline" className="flex-1 gap-2 h-10 border-primary/30 text-primary hover:bg-primary/10" onClick={() => generateFlockReport(animals)}>
            <FileText className="w-4 h-4" /> تقرير القطيع PDF
          </Button>
          <Button variant="outline" className="flex-1 gap-2 h-10 border-primary/30 text-primary hover:bg-primary/10" onClick={() => downloadSectionReportAsImage(animals, 'flock')}>
            <Image className="w-4 h-4" /> تقرير صورة
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {categories.map((cat) => {
            const count = animals.filter((a) => a.category === cat.id && a.status !== 'dead' && a.confirmed === true).length;
            return (
              <button
                key={cat.id}
                onClick={() => navigate(cat.path)}
                className="rounded-xl p-6 text-center transition-all duration-200 card-shadow hover:card-shadow-hover hover:scale-[1.02] active:scale-[0.98] text-muted-foreground bg-zinc-300 hover:bg-zinc-200 border-2 border-cyan-300 border-solid">

                <span className="text-5xl block mb-3">{cat.emoji}</span>
                <h2 className="text-card-foreground text-3xl font-extrabold">{cat.label}</h2>
                <p className="mt-1 text-zinc-950 font-extrabold text-xl">{count} رأس</p>
              </button>);

          })}
        </div>
      </div>
    </div>);

};

export default FlockPage;