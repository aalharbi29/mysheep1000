import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { 
  Lock, Phone, Trash2, LogOut, Loader2, Settings, Eye, EyeOff, 
  Fence, Receipt, TrendingUp, ShoppingCart, Syringe 
} from 'lucide-react';
import SplashSettingsCard from '@/components/SplashSettingsCard';
import { useIsAdmin } from '@/hooks/useIsAdmin';

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    const { data: { session } } = await supabase.auth.getSession();
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'فشل الحذف');
      toast({ title: 'تم حذف الحساب بنجاح' });
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (e: any) {
      toast({ title: 'حدث خطأ: ' + e.message, variant: 'destructive' });
      setDeletingAccount(false);
    }
  };

  // Password change
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Phone change
  const [phone, setPhone] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneLoaded, setPhoneLoaded] = useState(false);

  // Data reset
  const [deletingSection, setDeletingSection] = useState<string | null>(null);

  useEffect(() => {
    if (!user || phoneLoaded) return;
    supabase.from('profiles').select('phone').eq('user_id', user.id).single().then(({ data }) => {
      if (data?.phone) setPhone(data.phone);
      setPhoneLoaded(true);
    });
  }, [user, phoneLoaded]);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'كلمتا المرور غير متطابقتين', variant: 'destructive' });
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: 'حدث خطأ: ' + error.message, variant: 'destructive' });
    } else {
      toast({ title: 'تم تغيير كلمة المرور بنجاح ✅' });
      setNewPassword('');
      setConfirmPassword('');
    }
    setSavingPassword(false);
  };

  const handleChangePhone = async () => {
    if (!user) return;
    setSavingPhone(true);
    const { error } = await supabase
      .from('profiles')
      .update({ phone: phone.trim() || null })
      .eq('user_id', user.id);
    if (error) {
      toast({ title: 'حدث خطأ أثناء الحفظ', variant: 'destructive' });
    } else {
      toast({ title: 'تم تحديث رقم الجوال ✅' });
    }
    setSavingPhone(false);
  };

  const handleDeleteSection = async (section: string) => {
    if (!user) return;
    setDeletingSection(section);
    
    let error;
    switch (section) {
      case 'animals':
        ({ error } = await supabase.from('animals').delete().eq('user_id', user.id));
        break;
      case 'expenses':
        ({ error } = await supabase.from('expenses').delete().eq('user_id', user.id));
        break;
      case 'sales':
        ({ error } = await supabase.from('sales').delete().eq('user_id', user.id));
        break;
      case 'purchases':
        ({ error } = await supabase.from('purchases').delete().eq('user_id', user.id));
        break;
      case 'vaccinations':
        ({ error } = await supabase.from('vaccinations').delete().eq('user_id', user.id));
        break;
    }

    if (error) {
      toast({ title: 'حدث خطأ أثناء الحذف', variant: 'destructive' });
    } else {
      toast({ title: `تم حذف بيانات ${sectionLabels[section]} بنجاح ✅` });
      window.location.reload();
    }
    setDeletingSection(null);
  };

  const sectionLabels: Record<string, string> = {
    animals: 'القطيع',
    expenses: 'المصروفات',
    sales: 'المبيعات',
    purchases: 'المشتريات',
    vaccinations: 'التطعيمات',
  };

  const sectionIcons: Record<string, React.ReactNode> = {
    animals: <Fence className="w-5 h-5" />,
    expenses: <Receipt className="w-5 h-5" />,
    sales: <TrendingUp className="w-5 h-5" />,
    purchases: <ShoppingCart className="w-5 h-5" />,
    vaccinations: <Syringe className="w-5 h-5" />,
  };

  return (
    <div className="min-h-screen bg-secondary p-4 sm:p-6" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="الإعدادات" backTo="/" />

        <div className="space-y-4 mt-4">
          {/* Change Password */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                تغيير كلمة المرور
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="كلمة المرور الجديدة"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  minLength={6}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="تأكيد كلمة المرور"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                dir="ltr"
              />
              <Button onClick={handleChangePassword} disabled={savingPassword} className="w-full">
                {savingPassword ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Lock className="w-4 h-4 ml-2" />}
                تغيير كلمة المرور
              </Button>
            </CardContent>
          </Card>

          {/* Change Phone */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                تغيير رقم الجوال
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="966XXXXXXXXX"
                maxLength={15}
                dir="ltr"
              />
              <p className="text-[11px] text-muted-foreground">يُستخدم لتسجيل الدخول وللتواصل عبر واتساب</p>
              <Button onClick={handleChangePhone} disabled={savingPhone} className="w-full">
                {savingPhone ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Phone className="w-4 h-4 ml-2" />}
                حفظ رقم الجوال
              </Button>
            </CardContent>
          </Card>

          {/* Splash Screen Settings */}
          <SplashSettingsCard />

          {/* Delete Data Sections */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" />
                حذف البيانات
              </CardTitle>
              <p className="text-sm text-muted-foreground">اختر القسم الذي تريد حذف بياناته (لا يمكن التراجع)</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(sectionLabels).map(([key, label]) => (
                <AlertDialog key={key}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between border-destructive/30 hover:bg-destructive/10 text-foreground"
                      disabled={deletingSection === key}
                    >
                      <span className="flex items-center gap-2">
                        {sectionIcons[key]}
                        حذف {label}
                      </span>
                      {deletingSection === key ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-destructive" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>حذف بيانات {label}؟</AlertDialogTitle>
                      <AlertDialogDescription>
                        سيتم حذف جميع بيانات {label} نهائياً ولا يمكن استرجاعها. هل أنت متأكد؟
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-row-reverse gap-2">
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteSection(key)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        حذف نهائياً
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ))}
            </CardContent>
          </Card>

          {/* Sign Out */}
          <Button 
            variant="destructive" 
            className="w-full" 
            size="lg"
            onClick={signOut}
          >
            <LogOut className="w-5 h-5 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
