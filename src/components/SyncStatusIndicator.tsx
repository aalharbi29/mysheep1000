import { Cloud, CloudOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLivestock } from '@/context/LivestockContext';
import { toast } from '@/hooks/use-toast';

const SyncStatusIndicator = () => {
  const { user } = useAuth();
  const { loading } = useLivestock();

  if (!user) return null;

  const handleClick = () => {
    if (loading) {
      toast({ title: '⏳ جاري المزامنة', description: 'يتم حفظ البيانات...' });
    } else {
      toast({ title: '✅ البيانات محفوظة', description: 'جميع بياناتك محفوظة تلقائياً في قاعدة البيانات ولن تختفي إلا بالحذف اليدوي.' });
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full px-4 py-2.5 shadow-lg transition-all active:scale-95 bg-card border border-border"
      title={loading ? 'جاري الحفظ...' : 'البيانات محفوظة'}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-xs font-medium text-muted-foreground">جاري الحفظ...</span>
        </>
      ) : (
        <>
          <Cloud className="w-5 h-5 text-primary" />
          <span className="text-xs font-medium text-foreground">محفوظ ✓</span>
        </>
      )}
    </button>
  );
};

export default SyncStatusIndicator;
