import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import PageHeader from '@/components/PageHeader';
import { Loader2, MapPin, Phone } from 'lucide-react';

interface Listing {
  id: string;
  animal_type: string;
  breed: string;
  gender: string;
  quantity: number;
  condition: string;
  kids_count: number;
  kids_age: string;
  rams_count: number;
  teeth: string;
  location: string;
  contact_number: string;
  price: number;
  media_urls: string[];
  created_at: string;
}

const MarketBuyPage = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('market_listings')
        .select('*')
        .eq('status', 'active')
        .eq('listing_type', 'sell')
        .order('created_at', { ascending: false });
      setListings((data as any[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-secondary p-4 sm:p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="الإعلانات المتاحة" backTo="/market" />
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-bold">لا توجد إعلانات حالياً</p>
          </div>
        ) : (
          <div className="space-y-4 mt-6">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-card rounded-xl p-4 shadow-md border border-border">
                {listing.media_urls?.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto mb-3 pb-2">
                    {listing.media_urls.map((url, i) => (
                      <img key={i} src={url} alt="" className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
                    ))}
                  </div>
                )}
                <div className="space-y-1 text-sm">
                  <p className="font-bold text-foreground text-base">
                    {listing.animal_type === 'sheep' ? 'ضأن' : 'ماعز'} - {listing.breed}
                  </p>
                  <p className="text-muted-foreground">الجنس: {listing.gender === 'male' ? 'ذكر' : 'أنثى'} | العدد: {listing.quantity}</p>
                  {listing.condition && <p className="text-muted-foreground">الحالة: {listing.condition}</p>}
                  {listing.teeth && <p className="text-muted-foreground">الأسنان: {listing.teeth}</p>}
                  {listing.price && <p className="font-bold text-primary">الحد: {listing.price.toLocaleString()} ر.س</p>}
                  <div className="flex gap-4 pt-2">
                    {listing.location && (
                      <span className="flex items-center gap-1 text-muted-foreground"><MapPin className="w-4 h-4" />{listing.location}</span>
                    )}
                    {listing.contact_number && (
                      <a href={`tel:${listing.contact_number}`} className="flex items-center gap-1 text-primary">
                        <Phone className="w-4 h-4" />{listing.contact_number}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketBuyPage;
