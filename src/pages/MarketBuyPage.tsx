import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, MapPin, Filter, X, Fence, Car, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Listing {
  id: string; category: string; title: string; description: string;
  animal_type: string; breed: string; gender: string; quantity: number;
  condition: string; price: number; location: string; contact_number: string;
  media_urls: string[]; created_at: string; details: any;
}

const SHEEP_BREEDS = ['حري', 'نجدي', 'نعيمي', 'سواكني', 'رفيدي', 'حبصي', 'عرب', 'مهجن'];
const GOAT_BREEDS = ['عارضي', 'شامي', 'حجازي', 'هولندي', 'بيشي', 'محايلية', 'قبرصية', 'مصرية'];
const CAR_MAKES = ['تويوتا', 'نيسان', 'هيونداي', 'كيا', 'فورد', 'شيفروليه', 'مرسيدس', 'بي ام دبليو', 'لكزس', 'جيب', 'ميتسوبيشي', 'هوندا'];
const GOODS_TYPES = ['أثاث', 'أجهزة كهربائية', 'معدات زراعية', 'معدات صناعية', 'أدوات', 'إلكترونيات', 'مستلزمات حيوانات'];

const tabs = [
  { id: 'livestock', label: 'أغنام', icon: Fence },
  { id: 'car', label: 'سيارات', icon: Car },
  { id: 'goods', label: 'منقولات', icon: Package },
];

interface Filters {
  category: string;
  // Livestock
  animalType: string; breed: string; gender: string; condition: string;
  // Car
  make: string; yearFrom: string; yearTo: string;
  // Goods
  goodsType: string;
  // Common
  location: string; priceMin: string; priceMax: string;
}

const defaultFilters: Filters = {
  category: 'livestock', animalType: '', breed: '', gender: '', condition: '',
  make: '', yearFrom: '', yearTo: '', goodsType: '', location: '', priceMin: '', priceMax: '',
};

const MarketBuyPage = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      let query = supabase.from('market_listings').select('*')
        .eq('status', 'active').eq('listing_type', 'sell')
        .eq('category', filters.category)
        .order('created_at', { ascending: false });

      if (filters.category === 'livestock') {
        if (filters.animalType) query = query.eq('animal_type', filters.animalType);
        if (filters.breed) query = query.eq('breed', filters.breed);
        if (filters.gender) query = query.eq('gender', filters.gender);
        if (filters.condition) query = query.eq('condition', filters.condition);
      }

      if (filters.location) query = query.ilike('location', `%${filters.location}%`);
      if (filters.priceMin) query = query.gte('price', parseFloat(filters.priceMin));
      if (filters.priceMax) query = query.lte('price', parseFloat(filters.priceMax));

      const { data } = await query;
      let results = (data as any[]) || [];

      // Client-side filter for JSONB details (car make, year, goods type)
      if (filters.category === 'car') {
        if (filters.make) results = results.filter(l => l.details?.make === filters.make);
        if (filters.yearFrom) results = results.filter(l => parseInt(l.details?.year || '0') >= parseInt(filters.yearFrom));
        if (filters.yearTo) results = results.filter(l => parseInt(l.details?.year || '9999') <= parseInt(filters.yearTo));
      }
      if (filters.category === 'goods' && filters.goodsType) {
        results = results.filter(l => l.details?.goodsType === filters.goodsType);
      }

      setListings(results);
      setLoading(false);
    };
    fetchListings();

    // Count active filters
    let count = 0;
    if (filters.animalType) count++;
    if (filters.breed) count++;
    if (filters.gender) count++;
    if (filters.condition) count++;
    if (filters.make) count++;
    if (filters.yearFrom) count++;
    if (filters.yearTo) count++;
    if (filters.goodsType) count++;
    if (filters.location) count++;
    if (filters.priceMin) count++;
    if (filters.priceMax) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  const clearFilters = () => setFilters({ ...defaultFilters, category: filters.category });

  const getListingTitle = (l: Listing) => {
    if (l.title) return l.title;
    if (l.category === 'livestock') return `${l.animal_type === 'sheep' ? 'ضأن' : 'ماعز'} - ${l.breed}`;
    if (l.category === 'car') return `${l.details?.make || ''} ${l.details?.model || ''} ${l.details?.year || ''}`;
    return l.details?.goodsType || 'منقولات';
  };

  const breeds = filters.animalType === 'sheep' ? SHEEP_BREEDS : filters.animalType === 'goat' ? GOAT_BREEDS : [];

  return (
    <div className="min-h-screen bg-secondary p-4 sm:p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="الإعلانات المتاحة" backTo="/market" />

        {/* Category Tabs */}
        <div className="flex gap-2 mt-4">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setFilters({ ...defaultFilters, category: tab.id })}
                className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  filters.category === tab.id ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground'
                }`}>
                <Icon className="w-4 h-4" />{tab.label}
              </button>
            );
          })}
        </div>

        {/* Filter button */}
        <div className="flex gap-2 mt-3">
          <Button variant="outline" className="flex-1" onClick={() => setShowFilters(true)}>
            <Filter className="w-4 h-4 ml-2" />
            فلترة {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="icon" onClick={clearFilters}><X className="w-4 h-4" /></Button>
          )}
        </div>

        {/* Listings */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-bold">لا توجد إعلانات</p>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {listings.map(listing => (
              <button key={listing.id} onClick={() => navigate(`/market/listing/${listing.id}`)}
                className="w-full bg-card rounded-xl p-4 shadow-md border border-border text-right">
                {listing.media_urls?.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto mb-3 pb-2">
                    {(listing.media_urls as string[]).slice(0, 3).map((url, i) => (
                      <img key={i} src={url} alt="" className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
                    ))}
                  </div>
                )}
                <p className="font-bold text-foreground text-base">{getListingTitle(listing)}</p>
                {listing.description && <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{listing.description}</p>}
                <div className="flex items-center justify-between mt-2">
                  {listing.price ? <span className="font-bold text-primary">{listing.price.toLocaleString()} ر.س</span> : <span />}
                  {listing.location && (
                    <span className="flex items-center gap-1 text-muted-foreground text-xs">
                      <MapPin className="w-3 h-3" />{listing.location}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Filter Dialog */}
        <Dialog open={showFilters} onOpenChange={setShowFilters}>
          <DialogContent dir="rtl" className="max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>فلترة الإعلانات</DialogTitle></DialogHeader>
            <div className="space-y-4">
              {filters.category === 'livestock' && (
                <>
                  <div>
                    <label className="text-sm font-bold mb-1 block">النوع</label>
                    <Select value={filters.animalType} onValueChange={v => setFilters(f => ({ ...f, animalType: v, breed: '' }))}>
                      <SelectTrigger><SelectValue placeholder="الكل" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sheep">ضأن</SelectItem>
                        <SelectItem value="goat">ماعز</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {breeds.length > 0 && (
                    <div>
                      <label className="text-sm font-bold mb-1 block">السلالة</label>
                      <Select value={filters.breed} onValueChange={v => setFilters(f => ({ ...f, breed: v }))}>
                        <SelectTrigger><SelectValue placeholder="الكل" /></SelectTrigger>
                        <SelectContent>
                          {breeds.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-bold mb-1 block">الجنس</label>
                    <Select value={filters.gender} onValueChange={v => setFilters(f => ({ ...f, gender: v }))}>
                      <SelectTrigger><SelectValue placeholder="الكل" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">ذكر</SelectItem>
                        <SelectItem value="female">أنثى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {filters.category === 'car' && (
                <>
                  <div>
                    <label className="text-sm font-bold mb-1 block">الشركة</label>
                    <Select value={filters.make} onValueChange={v => setFilters(f => ({ ...f, make: v }))}>
                      <SelectTrigger><SelectValue placeholder="الكل" /></SelectTrigger>
                      <SelectContent>
                        {CAR_MAKES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm font-bold mb-1 block">من سنة</label>
                      <Input type="number" value={filters.yearFrom} onChange={e => setFilters(f => ({ ...f, yearFrom: e.target.value }))} placeholder="2000" />
                    </div>
                    <div>
                      <label className="text-sm font-bold mb-1 block">إلى سنة</label>
                      <Input type="number" value={filters.yearTo} onChange={e => setFilters(f => ({ ...f, yearTo: e.target.value }))} placeholder="2026" />
                    </div>
                  </div>
                </>
              )}

              {filters.category === 'goods' && (
                <div>
                  <label className="text-sm font-bold mb-1 block">نوع المنقولات</label>
                  <Select value={filters.goodsType} onValueChange={v => setFilters(f => ({ ...f, goodsType: v }))}>
                    <SelectTrigger><SelectValue placeholder="الكل" /></SelectTrigger>
                    <SelectContent>
                      {GOODS_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="text-sm font-bold mb-1 block">الموقع</label>
                <Input value={filters.location} onChange={e => setFilters(f => ({ ...f, location: e.target.value }))} placeholder="المنطقة / المدينة" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-bold mb-1 block">أقل سعر</label>
                  <Input type="number" value={filters.priceMin} onChange={e => setFilters(f => ({ ...f, priceMin: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-bold mb-1 block">أعلى سعر</label>
                  <Input type="number" value={filters.priceMax} onChange={e => setFilters(f => ({ ...f, priceMax: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => setShowFilters(false)}>تطبيق</Button>
                <Button variant="outline" onClick={() => { clearFilters(); setShowFilters(false); }}>مسح الكل</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MarketBuyPage;
