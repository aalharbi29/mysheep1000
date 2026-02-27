import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Edit2, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

interface Listing {
  id: string;
  category: string;
  title: string;
  description: string;
  animal_type: string;
  breed: string;
  price: number;
  location: string;
  contact_number: string;
  media_urls: string[];
  status: string;
  created_at: string;
  details: any;
}

const categoryLabels: Record<string, string> = { livestock: 'أغنام', car: 'سيارة', goods: 'منقولات' };

const MyListingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLocation, setEditLocation] = useState('');

  const fetchListings = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('market_listings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setListings((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, [user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('market_listings').delete().eq('id', id);
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'تم حذف الإعلان ✅' });
      setListings(prev => prev.filter(l => l.id !== id));
    }
  };

  const handleEdit = (listing: Listing) => {
    setEditingId(listing.id);
    setEditPrice(listing.price?.toString() || '');
    setEditDesc(listing.description || '');
    setEditLocation(listing.location || '');
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from('market_listings').update({
      price: editPrice ? parseFloat(editPrice) : null,
      description: editDesc,
      location: editLocation,
    } as any).eq('id', editingId);
    if (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'تم التعديل ✅' });
      setEditingId(null);
      fetchListings();
    }
  };

  const getListingTitle = (l: Listing) => {
    if (l.title) return l.title;
    if (l.category === 'livestock') return `${l.animal_type === 'sheep' ? 'ضأن' : 'ماعز'} - ${l.breed}`;
    if (l.category === 'car') return `${l.details?.make || ''} ${l.details?.model || ''}`;
    return l.category;
  };

  return (
    <div className="min-h-screen bg-secondary p-4 sm:p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="إعلاناتي" backTo="/market" />
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-bold">لا توجد إعلانات</p>
            <Button className="mt-4" onClick={() => navigate('/market/sell')}>أضف إعلان جديد</Button>
          </div>
        ) : (
          <div className="space-y-4 mt-6">
            {listings.map(listing => (
              <div key={listing.id} className="bg-card rounded-xl p-4 shadow-md border border-border">
                {listing.media_urls?.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto mb-3 pb-2">
                    {(listing.media_urls as string[]).slice(0, 3).map((url, i) => (
                      <img key={i} src={url} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                    ))}
                  </div>
                )}
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-foreground text-base">{getListingTitle(listing)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${listing.status === 'active' ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {listing.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{categoryLabels[listing.category] || listing.category}</p>
                  {listing.price && <p className="font-bold text-primary">{listing.price.toLocaleString()} ر.س</p>}
                  {listing.description && <p className="text-muted-foreground text-xs line-clamp-2">{listing.description}</p>}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/market/listing/${listing.id}`)}>
                    <Eye className="w-4 h-4 ml-1" /> عرض
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(listing)}>
                    <Edit2 className="w-4 h-4 ml-1" /> تعديل
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive"><Trash2 className="w-4 h-4 ml-1" /> حذف</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent dir="rtl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>حذف الإعلان؟</AlertDialogTitle>
                        <AlertDialogDescription>لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(listing.id)}>حذف</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
          <DialogContent dir="rtl">
            <DialogHeader><DialogTitle>تعديل الإعلان</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold mb-1 block">الوصف</label>
                <Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">الموقع</label>
                <Input value={editLocation} onChange={e => setEditLocation(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">السعر</label>
                <Input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} />
              </div>
              <Button className="w-full" onClick={handleSaveEdit}>حفظ التعديلات</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MyListingsPage;
