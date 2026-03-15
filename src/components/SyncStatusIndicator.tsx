import { CloudCheck, CloudOff, Loader2 } from 'lucide-react';
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
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full px-4 py-2.5 shadow-lg transition-all active:scale-95 bg-card border border-border card-shadow"
      title={loading ? 'جاري الحفظ...' : 'البيانات محفوظة'}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
          <span className="text-xs font-medium text-amber-600">جاري الحفظ...</span>
        </>
      ) : (
        <>
          <CloudCheck className="w-5 h-5 text-emerald-500" />
          <span className="text-xs font-medium text-emerald-600">محفوظ ✓</span>
        </>
      )}
    </button>
  );
};

export default SyncStatusIndicator;
