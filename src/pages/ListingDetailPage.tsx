import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Phone, MapPin, MessageCircle, Send, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface Listing {
  id: string; category: string; title: string; description: string;
  animal_type: string; breed: string; gender: string; quantity: number;
  condition: string; kids_count: number; kids_age: string; rams_count: number;
  teeth: string; price: number; location: string; contact_number: string;
  media_urls: string[]; user_id: string; created_at: string; details: any; status: string;
}

interface Comment {
  id: string; user_id: string; user_name: string; content: string; created_at: string;
}

const ListingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      const { data } = await supabase.from('market_listings').select('*').eq('id', id).single();
      if (data) {
        setListing(data as any);
        // Fetch owner name
        const { data: profile } = await supabase.from('profiles').select('display_name').eq('user_id', (data as any).user_id).single();
        if (profile) setOwnerName(profile.display_name || 'مستخدم');
      }
      // Fetch comments
      const { data: commentsData } = await supabase
        .from('listing_comments')
        .select('*')
        .eq('listing_id', id)
        .order('created_at', { ascending: true });
      setComments((commentsData as any[]) || []);
      setLoading(false);
    };
    fetchListing();

    // Realtime comments
    const channel = supabase
      .channel(`comments-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'listing_comments', filter: `listing_id=eq.${id}` },
        (payload) => setComments(prev => [...prev, payload.new as Comment])
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const handleSendComment = async () => {
    if (!user || !newComment.trim() || !id) return;
    setSendingComment(true);
    const { data: profile } = await supabase.from('profiles').select('display_name').eq('user_id', user.id).single();
    const { error } = await supabase.from('listing_comments').insert({
      listing_id: id, user_id: user.id, user_name: profile?.display_name || 'مستخدم', content: newComment.trim(),
    } as any);
    if (error) toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    else setNewComment('');
    setSendingComment(false);
  };

  const startPrivateChat = async () => {
    if (!user || !listing) return;
    if (user.id === listing.user_id) return;
    // Check existing conversation
    const { data: existing } = await supabase.from('conversations').select('id')
      .or(`and(participant1.eq.${user.id},participant2.eq.${listing.user_id}),and(participant1.eq.${listing.user_id},participant2.eq.${user.id})`)
      .eq('listing_id', listing.id).single();
    if (existing) { navigate(`/market/chat/${existing.id}`); return; }
    const { data: conv, error } = await supabase.from('conversations').insert({
      listing_id: listing.id, participant1: user.id, participant2: listing.user_id,
    } as any).select().single();
    if (error) { toast({ title: 'خطأ', description: error.message, variant: 'destructive' }); return; }
    navigate(`/market/chat/${(conv as any).id}`);
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center bg-secondary"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!listing) return <div className="min-h-screen bg-secondary p-4" dir="rtl"><PageHeader title="الإعلان غير موجود" backTo="/market/buy" /></div>;

  const isOwner = user?.id === listing.user_id;
  const whatsappUrl = listing.contact_number ? `https://wa.me/966${listing.contact_number.replace(/^0/, '')}` : '';

  return (
    <div className="min-h-screen bg-secondary p-4 sm:p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <PageHeader title={listing.title || 'تفاصيل الإعلان'} backTo="/market/buy" />

        {/* Media Gallery */}
        {listing.media_urls?.length > 0 && (
          <div className="flex gap-2 overflow-x-auto mt-4 pb-2">
            {(listing.media_urls as string[]).map((url, i) => (
              <button key={i} onClick={() => setSelectedMedia(url)} className="flex-shrink-0">
                {url.match(/\.(mp4|mov|webm)/i) ? (
                  <video src={url} className="w-32 h-32 rounded-xl object-cover" />
                ) : (
                  <img src={url} alt="" className="w-32 h-32 rounded-xl object-cover" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Listing Info */}
        <div className="bg-card rounded-xl p-4 mt-4 shadow-md border border-border space-y-3">
          {listing.description && <p className="text-foreground text-sm leading-relaxed">{listing.description}</p>}

          <div className="grid grid-cols-2 gap-2 text-sm">
            {listing.category === 'livestock' && (
              <>
                <InfoRow label="النوع" value={listing.animal_type === 'sheep' ? 'ضأن' : 'ماعز'} />
                <InfoRow label="السلالة" value={listing.breed} />
                <InfoRow label="الجنس" value={listing.gender === 'male' ? 'ذكر' : 'أنثى'} />
                <InfoRow label="العدد" value={listing.quantity?.toString()} />
                {listing.condition && <InfoRow label="الحالة" value={listing.condition} />}
                {listing.teeth && <InfoRow label="الأسنان" value={listing.teeth} />}
                {listing.kids_count > 0 && <InfoRow label="عدد البهم" value={`${listing.kids_count} (${listing.kids_age || ''})`} />}
                {listing.rams_count > 0 && <InfoRow label="عدد الفحول" value={listing.rams_count.toString()} />}
              </>
            )}
            {listing.category === 'car' && listing.details && (
              <>
                <InfoRow label="الشركة" value={listing.details.make} />
                <InfoRow label="الموديل" value={listing.details.model} />
                <InfoRow label="السنة" value={listing.details.year} />
                {listing.details.condition && <InfoRow label="الحالة" value={listing.details.condition} />}
                {listing.details.mileage && <InfoRow label="الممشى" value={`${parseInt(listing.details.mileage).toLocaleString()} كم`} />}
                {listing.details.color && <InfoRow label="اللون" value={listing.details.color} />}
                {listing.details.transmission && <InfoRow label="ناقل الحركة" value={listing.details.transmission} />}
              </>
            )}
            {listing.category === 'goods' && listing.details && (
              <>
                <InfoRow label="النوع" value={listing.details.goodsType} />
                {listing.details.condition && <InfoRow label="الحالة" value={listing.details.condition} />}
                {listing.details.itemDescription && <div className="col-span-2"><InfoRow label="الوصف" value={listing.details.itemDescription} /></div>}
              </>
            )}
          </div>

          {listing.price && <p className="font-bold text-primary text-lg">{listing.price.toLocaleString()} ر.س</p>}

          <div className="flex flex-wrap gap-3 pt-2">
            {listing.location && (
              <span className="flex items-center gap-1 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4" />{listing.location}
              </span>
            )}
            <span className="text-muted-foreground text-xs">بواسطة: {ownerName}</span>
          </div>

          {/* Contact buttons */}
          {!isOwner && listing.contact_number && (
            <div className="flex gap-2 pt-3">
              <a href={`tel:${listing.contact_number}`} className="flex-1">
                <Button className="w-full" variant="outline"><Phone className="w-4 h-4 ml-2" /> اتصال</Button>
              </a>
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">واتساب</Button>
                </a>
              )}
              <Button variant="outline" onClick={startPrivateChat}>
                <MessageCircle className="w-4 h-4 ml-1" /> محادثة
              </Button>
            </div>
          )}
        </div>

        {/* Comments */}
        <div className="bg-card rounded-xl p-4 mt-4 shadow-md border border-border">
          <h3 className="font-bold text-foreground mb-3">التعليقات ({comments.length})</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {comments.map(c => (
              <div key={c.id} className={`p-3 rounded-lg text-sm ${c.user_id === user?.id ? 'bg-primary/10' : 'bg-muted'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-foreground text-xs">{c.user_name}</span>
                  <span className="text-muted-foreground text-xs">{new Date(c.created_at).toLocaleDateString('ar-SA')}</span>
                </div>
                <p className="text-foreground">{c.content}</p>
              </div>
            ))}
            {comments.length === 0 && <p className="text-center text-muted-foreground text-sm">لا توجد تعليقات</p>}
          </div>
          {user && (
            <div className="flex gap-2 mt-3">
              <Input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="أضف تعليق..."
                onKeyDown={e => e.key === 'Enter' && handleSendComment()} />
              <Button size="icon" onClick={handleSendComment} disabled={sendingComment || !newComment.trim()}>
                {sendingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Media fullscreen dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-2">
          <button onClick={() => setSelectedMedia(null)} className="absolute top-2 left-2 z-10 bg-background/80 rounded-full p-1">
            <X className="w-5 h-5" />
          </button>
          {selectedMedia?.match(/\.(mp4|mov|webm)/i) ? (
            <video src={selectedMedia} controls className="w-full max-h-[85vh] rounded-lg" />
          ) : (
            <img src={selectedMedia || ''} alt="" className="w-full max-h-[85vh] object-contain rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null;
  return (
    <div>
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-bold text-foreground">{value}</span>
    </div>
  );
};

export default ListingDetailPage;
