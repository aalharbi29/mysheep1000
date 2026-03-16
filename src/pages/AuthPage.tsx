import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, Phone, Mail } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        let loginEmail = email;

        if (loginMethod === 'phone') {
          // Look up email by phone number
          const { data, error } = await supabase.functions.invoke('lookup-email-by-phone', {
            body: { phone: phone.trim() },
          });
          if (error || data?.error) {
            throw new Error(data?.error || 'لم يتم العثور على حساب بهذا الرقم');
          }
          loginEmail = data.email;
        }

        const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
        if (error) throw error;
        toast.success('تم تسجيل الدخول بنجاح');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        toast.success('تم إنشاء الحساب! تحقق من بريدك الإلكتروني لتأكيد الحساب.');
      }
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen items-center justify-center p-4 flex flex-row shadow-2xl opacity-100 rounded-sm border-solid gap-0 px-[20px] bg-[#928472] my-0 py-0 pb-[50px]" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <span className="text-6xl block mb-2">🐑</span>
          <CardTitle className="text-2xl font-bold text-foreground">
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </CardTitle>
          <p className="mt-1 font-extrabold text-primary">إدارة القطيع</p>
        </CardHeader>
        <CardContent>
          {isLogin && (
            <div className="flex gap-2 mb-4">
              <Button
                type="button"
                variant={loginMethod === 'email' ? 'default' : 'outline'}
                className="flex-1 gap-2"
                onClick={() => setLoginMethod('email')}
              >
                <Mail className="w-4 h-4" />
                بريد إلكتروني
              </Button>
              <Button
                type="button"
                variant={loginMethod === 'phone' ? 'default' : 'outline'}
                className="flex-1 gap-2"
                onClick={() => setLoginMethod('phone')}
              >
                <Phone className="w-4 h-4" />
                رقم الجوال
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">الاسم</Label>
                <Input
                  id="name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="أدخل اسمك"
                  required={!isLogin}
                />
              </div>
            )}

            {isLogin && loginMethod === 'phone' ? (
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الجوال</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="966XXXXXXXXX"
                  required
                  dir="ltr"
                />
                <p className="text-[11px] text-muted-foreground">أدخل رقم الجوال المسجل في ملفك الشخصي</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  dir="ltr"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  dir="ltr"
                  className="pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              {isLogin ? 'دخول' : 'إنشاء حساب'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setLoginMethod('email'); }}
              className="text-sm text-primary hover:underline font-bold"
            >
              {isLogin ? 'ليس لديك حساب؟ أنشئ حساباً جديداً' : 'لديك حساب؟ سجل دخولك'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
