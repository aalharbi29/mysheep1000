import { Construction } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const MarketPage = () => {
  return (
    <div className="min-h-screen bg-secondary p-4 sm:p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="المتجر" backTo="/" />

        <div className="mt-16 flex flex-col items-center justify-center text-center gap-4 p-8 rounded-2xl border-2 border-dashed border-muted-foreground/40 bg-card">
          <Construction className="w-20 h-20 text-amber-500 animate-pulse" />
          <h2 className="text-2xl font-extrabold text-foreground">تحت التطوير</h2>
          <p className="text-muted-foreground font-bold">
            المتجر مغلق مؤقتاً ويعمل فريقنا على تطويره وتحسينه.
          </p>
          <p className="text-sm text-muted-foreground/80">
            نعتذر عن الإزعاج، يرجى المحاولة لاحقاً.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketPage;
