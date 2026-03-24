import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Phone, Mail } from "lucide-react";
import logoSvg from "@/assets/logo.svg";
import { useSplashSettings } from "@/hooks/useSplashSettings";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [signupMethod, setSignupMethod] = useState<"email" | "phone">("email");
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(null);
  const { settings: splashSettings } = useSplashSettings();
  const customMainLogo = splashSettings.customMainLogoUrl;

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setSocialLoading(provider);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result?.error) {
        throw result.error;
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ في تسجيل الدخول");
    } finally {
      setSocialLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        let loginEmail = email;

        if (loginMethod === "phone") {
          const { data, error } = await supabase.functions.invoke("lookup-email-by-phone", {
            body: { phone: phone.trim() },
          });
          if (error || data?.error) {
            throw new Error(data?.error || "لم يتم العثور على حساب بهذا الرقم");
          }
          loginEmail = data.email;
        }

        const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
        if (error) throw error;
        toast.success("تم تسجيل الدخول بنجاح");
      } else {
        // Signup
        let signupEmail = email;

        if (signupMethod === "phone") {
          if (!phone.trim()) {
            throw new Error("يرجى إدخال رقم الجوال");
          }
          // Generate a placeholder email from the phone number
          signupEmail = `${phone.trim()}@phone.herd.local`;
        }

        const { error } = await supabase.auth.signUp({
          email: signupEmail,
          password,
          options: {
            data: { display_name: displayName, phone: signupMethod === "phone" ? phone.trim() : undefined },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;

        if (signupMethod === "phone") {
          // Update profile with phone number
          toast.success("تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول برقم الجوال.");
        } else {
          toast.success("تم إنشاء الحساب! تحقق من بريدك الإلكتروني لتأكيد الحساب.");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen items-center justify-center p-4 flex flex-col gap-6 shadow-2xl opacity-100 rounded-sm border-solid px-[20px] bg-[#928472] my-0 py-0 pb-[50px]"
      dir="rtl"
    >
      {/* Outline Logo */}
      <div className="relative w-50 h-50 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite] mt-8">
        {customMainLogo ? (
          <img src={customMainLogo} alt="" className="w-full h-full object-contain" />
        ) : (
          <>
            <img
              src={logoSvg}
              alt=""
              className="absolute invert"
              style={{ inset: "-4px", width: "calc(100% + 8px)", height: "calc(100% + 8px)" }}
            />
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                WebkitMaskImage: `url(${logoSvg})`,
                maskImage: `url(${logoSvg})`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                backgroundColor: "#928472",
              }}
            />
          </>
        )}
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">
            {isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
          </CardTitle>
          <p className="mt-1 font-extrabold text-primary">إدارة القطيع</p>
        </CardHeader>
        <CardContent>
          {/* Social Login Buttons */}
          <div className="flex flex-col gap-2 mb-4">
            <Button
              type="button"
              variant="outline"
              className="w-full gap-3 h-11"
              onClick={() => handleSocialLogin("google")}
              disabled={!!socialLoading}
            >
              {socialLoading === "google" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              الدخول بحساب Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-3 h-11"
              onClick={() => handleSocialLogin("apple")}
              disabled={!!socialLoading}
            >
              {socialLoading === "apple" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
              )}
              الدخول بحساب Apple
            </Button>
          </div>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">أو</span>
            </div>
          </div>

          {/* Method toggle for both login and signup */}
          <div className="flex gap-2 mb-4">
            <Button
              type="button"
              variant={(isLogin ? loginMethod : signupMethod) === "email" ? "default" : "outline"}
              className="flex-1 gap-2"
              onClick={() => (isLogin ? setLoginMethod("email") : setSignupMethod("email"))}
            >
              <Mail className="w-4 h-4" />
              بريد إلكتروني
            </Button>
            <Button
              type="button"
              variant={(isLogin ? loginMethod : signupMethod) === "phone" ? "default" : "outline"}
              className="flex-1 gap-2"
              onClick={() => (isLogin ? setLoginMethod("phone") : setSignupMethod("phone"))}
            >
              <Phone className="w-4 h-4" />
              رقم الجوال
            </Button>
          </div>

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

            {(isLogin ? loginMethod : signupMethod) === "phone" ? (
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
                {isLogin && <p className="text-[11px] text-muted-foreground">أدخل رقم الجوال المسجل في ملفك الشخصي</p>}
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
                  type={showPassword ? "text" : "password"}
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
              {isLogin ? "دخول" : "إنشاء حساب"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setLoginMethod("email");
                setSignupMethod("email");
              }}
              className="text-sm text-primary hover:underline font-bold"
            >
              {isLogin ? "ليس لديك حساب؟ أنشئ حساباً جديداً" : "لديك حساب؟ سجل دخولك"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
