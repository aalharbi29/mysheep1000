import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, Upload, Check, ArrowLeft } from 'lucide-react';

const GOODS_TYPES = ['أثاث', 'أجهزة كهربائية', 'معدات زراعية', 'معدات صناعية', 'أدوات', 'إلكترونيات', 'مستلزمات حيوانات', 'أخرى'];
const GOODS_CONDITIONS = ['جديد', 'مستعمل نظيف', 'مستعمل'];

interface FormData {
  goodsType: string;
  condition: string;
  itemDescription: string;
  location: string;
  contactNumber: string;
  price: string;
}

const SellGoodsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    goodsType: '', condition: '', itemDescription: '', location: '', contactNumber: '', price: '',
  });
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setMediaFiles(prev => [...prev, ...newFiles]);
    newFiles.forEach(file => setMediaPreviews(prev => [...prev, URL.createObjectURL(file)]));
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const mediaUrls: string[] = [];
      for (const file of mediaFiles) {
        const ext = file.name.split('.').pop();
        const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from('market-media').upload(path, file, { cacheControl: '3600', upsert: false });
        if (!error) {
          const { data: urlData } = supabase.storage.from('market-media').getPublicUrl(path);
          mediaUrls.push(urlData.publicUrl);
        }
      }

      let aiTitle = `${form.goodsType} - ${form.condition}`;
      let aiDesc = '';
      try {
        const { data: aiData } = await supabase.functions.invoke('generate-listing-description', {
          body: { listingData: { category: 'goods', ...form } },
        });
        if (aiData?.title) aiTitle = aiData.title;
        if (aiData?.description) aiDesc = aiData.description;
      } catch { /* use defaults */ }

      const { error } = await supabase.from('market_listings').insert({
        user_id: user.id, listing_type: 'sell', category: 'goods',
        title: aiTitle, description: aiDesc,
        details: { goodsType: form.goodsType, condition: form.condition, itemDescription: form.itemDescription },
        location: form.location, contact_number: form.contactNumber,
        price: form.price ? parseFloat(form.price) : null, media_urls: mediaUrls,
      } as any);

      if (error) throw error;
      toast({ title: 'تم نشر الإعلان بنجاح ✅' });
      navigate('/market');
    } catch (e: any) {
      toast({ title: 'خطأ', description: e.message, variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const CardOption = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
    <button onClick={onClick} className={`rounded-xl p-4 text-center font-bold transition-all duration-200 border-2 ${selected ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground hover:border-primary/50'}`}>
      {selected && <Check className="w-5 h-5 mx-auto mb-1 text-primary" />}
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-secondary p-4 sm:p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="بيع منقولات" backTo={step > 1 ? undefined : '/market/sell'} />
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-primary font-bold mb-4 hover:opacity-80">
            <ArrowLeft className="w-4 h-4" /> رجوع
          </button>
        )}
        <div className="flex gap-1 mt-4 mb-6">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-border'}`} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">نوع المنقولات</h3>
            <div className="grid grid-cols-2 gap-3">
              {GOODS_TYPES.map(t => (
                <CardOption key={t} label={t} selected={form.goodsType === t} onClick={() => { setForm(f => ({ ...f, goodsType: t })); setStep(2); }} />
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">حالة المنقول</h3>
            <div className="grid grid-cols-1 gap-3">
              {GOODS_CONDITIONS.map(c => (
                <CardOption key={c} label={c} selected={form.condition === c} onClick={() => { setForm(f => ({ ...f, condition: c })); setStep(3); }} />
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground mb-4">التفاصيل</h3>
            <div>
              <label className="text-sm font-bold text-foreground mb-1 block">وصف المنقول</label>
              <Textarea value={form.itemDescription} onChange={e => setForm(f => ({ ...f, itemDescription: e.target.value }))} placeholder="صف المنقول بالتفصيل..." rows={3} />
            </div>
            <div>
              <label className="text-sm font-bold text-foreground mb-1 block">الموقع</label>
              <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="المنطقة / المدينة" />
            </div>
            <div>
              <label className="text-sm font-bold text-foreground mb-1 block">رقم التواصل</label>
              <Input type="tel" value={form.contactNumber} onChange={e => setForm(f => ({ ...f, contactNumber: e.target.value }))} placeholder="05xxxxxxxx" />
            </div>
            <div>
              <label className="text-sm font-bold text-foreground mb-1 block">السعر (اختياري)</label>
              <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="السعر بالريال" />
            </div>
            <Button className="w-full mt-4" size="lg" onClick={() => setStep(4)}>
              التالي <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground mb-4">الصور والفيديو</h3>
            {mediaPreviews.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {mediaPreviews.map((url, i) => (
                  <div key={i} className="relative">
                    {mediaFiles[i]?.type.startsWith('video/') ? (
                      <video src={url} className="w-24 h-24 rounded-lg object-cover" />
                    ) : (
                      <img src={url} alt="" className="w-24 h-24 rounded-lg object-cover" />
                    )}
                    <button onClick={() => removeMedia(i)} className="absolute -top-2 -left-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full text-xs font-bold">✕</button>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-6 h-6" /><span className="text-xs">من الملفات</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => cameraInputRef.current?.click()}>
                <Camera className="w-6 h-6" /><span className="text-xs">من الكاميرا</span>
              </Button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={e => handleFileChange(e.target.files)} />
            <input ref={cameraInputRef} type="file" accept="image/*,video/*" capture="environment" className="hidden" onChange={e => handleFileChange(e.target.files)} />
            <Button className="w-full mt-6" size="lg" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'نشر الإعلان ✅'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellGoodsPage;
