import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Camera, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const CATEGORIES = [
  { id: 'sheep_feed', label: 'أعلاف أغنام' },
  { id: 'sheep_medicine', label: 'أدوية أغنام' },
  { id: 'sheep_tools', label: 'أدوات أغنام' },
  { id: 'poultry_feed', label: 'أعلاف دواجن' },
  { id: 'poultry_medicine', label: 'أدوية دواجن' },
  { id: 'poultry_tools', label: 'أدوات دواجن' },
  { id: 'general', label: 'مستلزمات عامة' },
];

const StoreAddProductPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '', description: '', category: 'sheep_feed', price: '', sale_price: '', stock: '1',
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = () => setPreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!form.name || !form.price || !form.stock) {
      toast({ title: 'يرجى تعبئة الحقول المطلوبة', variant: 'destructive' }); return;
    }
    setSubmitting(true);

    // Upload images
    const imageUrls: string[] = [];
    for (const file of images) {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('market-media').upload(path, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from('market-media').getPublicUrl(path);
        imageUrls.push(urlData.publicUrl);
      }
    }

    const { error } = await supabase.from('store_products').insert({
      name: form.name,
      description: form.description,
      category: form.category,
      price: parseFloat(form.price),
      sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
      stock: parseInt(form.stock),
      image_urls: imageUrls as any,
      seller_id: user.id,
    });

    if (error) {
      toast({ title: 'حدث خطأ', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'تم إضافة المنتج بنجاح! 🎉' });
      navigate('/store');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-secondary p-4 sm:p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="إضافة منتج" backTo="/store" />

        <div className="bg-card rounded-xl p-4 mt-4 border border-border space-y-4">
          <div>
            <label className="text-sm font-bold mb-1 block">اسم المنتج *</label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="مثال: علف شعير 50 كجم" />
          </div>

          <div>
            <label className="text-sm font-bold mb-1 block">التصنيف *</label>
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-bold mb-1 block">الوصف</label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="وصف تفصيلي للمنتج" rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-bold mb-1 block">السعر (ر.س) *</label>
              <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-bold mb-1 block">سعر التخفيض</label>
              <Input type="number" value={form.sale_price} onChange={e => setForm(f => ({ ...f, sale_price: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold mb-1 block">الكمية المتوفرة *</label>
            <Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} min="1" />
          </div>

          {/* Images */}
          <div>
            <label className="text-sm font-bold mb-2 block">صور المنتج</label>
            <div className="flex gap-2 flex-wrap">
              {previews.map((p, i) => (
                <div key={i} className="relative">
                  <img src={p} alt="" className="w-20 h-20 rounded-lg object-cover" />
                  <button onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
                <Camera className="w-6 h-6 text-muted-foreground" />
                <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
              </label>
            </div>
          </div>

          <Button className="w-full" size="lg" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
            نشر المنتج
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StoreAddProductPage;
