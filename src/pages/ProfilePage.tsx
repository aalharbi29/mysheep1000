import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, User, Phone, Mail, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('display_name, phone')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setDisplayName(data.display_name || '');
        setPhone(data.phone || '');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    if (!displayName.trim()) {
      toast({ title: 'يرجى إدخال الاسم', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim(), phone: phone.trim() || null })
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'حدث خطأ أثناء الحفظ', variant: 'destructive' });
    } else {
      toast({ title: 'تم حفظ البيانات بنجاح ✅' });
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary p-4 sm:p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="الملف الشخصي" backTo="/" />

        <div className="bg-card rounded-xl p-6 mt-4 border border-border space-y-5">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-10 h-10 text-primary" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-foreground flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" /> البريد الإلكتروني
            </label>
            <Input value={user?.email || ''} disabled className="bg-muted" />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" /> الاسم
            </label>
            <Input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="أدخل اسمك"
              maxLength={100}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-foreground flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" /> رقم الجوال
            </label>
            <Input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="966XXXXXXXXX"
              maxLength={15}
              dir="ltr"
            />
            <p className="text-[11px] text-muted-foreground">يُستخدم للتواصل مع المشترين عبر واتساب والاتصال</p>
          </div>

          <Button className="w-full" size="lg" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
            حفظ التغييرات
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
