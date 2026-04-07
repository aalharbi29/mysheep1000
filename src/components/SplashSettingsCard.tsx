import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';
import { Monitor, Eye, Save, Loader2, Upload, X } from 'lucide-react';
import { SplashSettings, fetchSplashSettings, saveSplashSettingsToDb, saveSplashSettingsLocal, defaultSplashSettings } from '@/lib/splashSettings';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import logoSvg from '@/assets/logo.svg';
import hrsaniLabsLogo from '@/assets/hrsani-labs-logo.png';
import AlHrsaniLabsAnimation from '@/components/AlHrsaniLabsAnimation';

const SplashSettingsCard = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SplashSettings>(defaultSplashSettings);
  const [previewing, setPreviewing] = useState<'phase1' | 'phase2' | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingDev, setUploadingDev] = useState(false);
  const mainLogoRef = useRef<HTMLInputElement>(null);
  const devLogoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSplashSettings().then(s => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const update = (partial: Partial<SplashSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  const uploadLogo = async (file: File, type: 'main' | 'dev') => {
    if (!user) return;
    const setUploading = type === 'main' ? setUploadingMain : setUploadingDev;
    setUploading(true);

    const ext = file.name.split('.').pop() || 'png';
    const path = `${user.id}/${type}-logo-${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from('logos').upload(path, file, { upsert: true });
    if (error) {
      toast({ title: 'خطأ في رفع الشعار', variant: 'destructive' });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path);
    const url = urlData.publicUrl;

    if (type === 'main') {
      update({ customMainLogoUrl: url });
    } else {
      update({ customDevLogoUrl: url });
    }
    toast({ title: 'تم رفع الشعار بنجاح ✅' });
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await saveSplashSettingsToDb(settings, user.id);
    saveSplashSettingsLocal(settings);
    toast({ title: 'تم حفظ إعدادات شاشة البداية ✅' });
    setSaving(false);
  };

  const handleReset = async () => {
    if (!user) return;
    setSaving(true);
    setSettings({ ...defaultSplashSettings });
    await saveSplashSettingsToDb(defaultSplashSettings, user.id);
    saveSplashSettingsLocal(defaultSplashSettings);
    toast({ title: 'تم إعادة الإعدادات الافتراضية ✅' });
    setSaving(false);
  };

  const mainLogoSrc = settings.customMainLogoUrl || logoSvg;
  const devLogoSrc = settings.customDevLogoUrl || hrsaniLabsLogo;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Monitor className="w-5 h-5 text-primary" />
          إعدادات شاشة البداية
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <Label>تفعيل شاشة البداية</Label>
          <Switch checked={settings.enabled} onCheckedChange={v => update({ enabled: v })} />
        </div>

        {settings.enabled && (
          <>
            {/* Colors */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm">لون الخلفية</Label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={settings.bgColor} onChange={e => update({ bgColor: e.target.value })} className="w-10 h-10 rounded border cursor-pointer" />
                  <Input value={settings.bgColor} onChange={e => update({ bgColor: e.target.value })} dir="ltr" className="text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-sm">لون النص</Label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={settings.textColor} onChange={e => update({ textColor: e.target.value })} className="w-10 h-10 rounded border cursor-pointer" />
                  <Input value={settings.textColor} onChange={e => update({ textColor: e.target.value })} dir="ltr" className="text-xs" />
                </div>
              </div>
            </div>

            {/* Main Logo Upload */}
            <div className="border rounded-lg p-3 space-y-3">
              <h3 className="font-semibold text-sm">الشعار الرئيسي</h3>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg border flex items-center justify-center bg-muted overflow-hidden">
                  {settings.customMainLogoUrl ? (
                    <img src={settings.customMainLogoUrl} alt="شعار مخصص" className="w-full h-full object-contain" />
                  ) : (
                    <img src={logoSvg} alt="شعار افتراضي" className="w-12 h-12" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    ref={mainLogoRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) uploadLogo(f, 'main');
                    }}
                  />
                  <Button size="sm" variant="outline" className="w-full gap-2" onClick={() => mainLogoRef.current?.click()} disabled={uploadingMain}>
                    {uploadingMain ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    تغيير الشعار الرئيسي
                  </Button>
                  {settings.customMainLogoUrl && (
                    <Button size="sm" variant="ghost" className="w-full gap-2 text-destructive" onClick={() => update({ customMainLogoUrl: null })}>
                      <X className="w-4 h-4" />
                      إزالة (استخدام الافتراضي)
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">يظهر في شاشة البداية وصفحة الدخول والصفحة الرئيسية</p>
            </div>

            {/* Phase 1 */}
            <div className="border rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">الصفحة الأولى (الشعار)</h3>
                <Button size="sm" variant="ghost" onClick={() => setPreviewing(previewing === 'phase1' ? null : 'phase1')}>
                  <Eye className="w-4 h-4 ml-1" />
                  معاينة
                </Button>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">العنوان</Label>
                <Input value={settings.phase1Title} onChange={e => update({ phase1Title: e.target.value })} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">إظهار الشعار</Label>
                <Switch checked={settings.phase1ShowLogo} onCheckedChange={v => update({ phase1ShowLogo: v })} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">المدة: {(settings.phase1Duration / 1000).toFixed(1)} ثانية</Label>
                <Slider value={[settings.phase1Duration]} onValueChange={([v]) => update({ phase1Duration: v })} min={500} max={5000} step={100} />
              </div>
              {previewing === 'phase1' && (
                <div className="rounded-lg p-6 flex flex-col items-center justify-center gap-3 min-h-[150px]" style={{ backgroundColor: settings.bgColor, color: settings.textColor }}>
                  <h1 className="text-xl font-bold">{settings.phase1Title}</h1>
                  {settings.phase1ShowLogo && (
                    settings.customMainLogoUrl ? (
                      <img src={settings.customMainLogoUrl} alt="شعار" className="w-20 h-20 object-contain" />
                    ) : (
                      <img src={logoSvg} alt="شعار" className="w-20 h-20 invert" />
                    )
                  )}
                </div>
              )}
            </div>

            {/* Phase 2 */}
            <div className="border rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">الصفحة الثانية (التطوير)</h3>
                <Button size="sm" variant="ghost" onClick={() => setPreviewing(previewing === 'phase2' ? null : 'phase2')}>
                  <Eye className="w-4 h-4 ml-1" />
                  معاينة
                </Button>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">السطر الأول</Label>
                <Input value={settings.phase2Line1} onChange={e => update({ phase2Line1: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">السطر الثالث</Label>
                <Input value={settings.phase2Line3} onChange={e => update({ phase2Line3: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">المدة: {(settings.phase2Duration / 1000).toFixed(1)} ثانية</Label>
                <Slider value={[settings.phase2Duration]} onValueChange={([v]) => update({ phase2Duration: v })} min={500} max={5000} step={100} />
              </div>

              {/* Dev Logo Controls */}
              <div className="border-t pt-3 space-y-3">
                <h4 className="font-semibold text-sm text-primary">إعدادات شعار المطور</h4>
                
                {/* Dev Logo Upload */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg border flex items-center justify-center bg-muted overflow-hidden">
                    <img src={devLogoSrc} alt="شعار المطور" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      ref={devLogoRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) uploadLogo(f, 'dev');
                      }}
                    />
                    <Button size="sm" variant="outline" className="w-full gap-2" onClick={() => devLogoRef.current?.click()} disabled={uploadingDev}>
                      {uploadingDev ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      تغيير شعار المطور
                    </Button>
                    {settings.customDevLogoUrl && (
                      <Button size="sm" variant="ghost" className="w-full gap-2 text-destructive" onClick={() => update({ customDevLogoUrl: null })}>
                        <X className="w-4 h-4" />
                        إزالة (استخدام الافتراضي)
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">إظهار الشعار</Label>
                  <Switch checked={settings.devLogoVisible} onCheckedChange={v => update({ devLogoVisible: v })} />
                </div>
                {settings.devLogoVisible && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm">عرض الأنيميشن: {settings.devAnimationWidth}px</Label>
                      <Slider value={[settings.devAnimationWidth]} onValueChange={([v]) => update({ devAnimationWidth: v })} min={200} max={900} step={10} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">ارتفاع الأنيميشن: {settings.devAnimationHeight}px</Label>
                      <Slider value={[settings.devAnimationHeight]} onValueChange={([v]) => update({ devAnimationHeight: v })} min={150} max={700} step={10} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">السطوع: {settings.devLogoBrightness}%</Label>
                      <Slider value={[settings.devLogoBrightness]} onValueChange={([v]) => update({ devLogoBrightness: v })} min={20} max={200} step={5} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">تأثير التوهج</Label>
                      <Switch checked={settings.devLogoGlow} onCheckedChange={v => update({ devLogoGlow: v })} />
                    </div>
                    {settings.devLogoGlow && (
                      <>
                        <div className="space-y-1">
                          <Label className="text-sm">لون التوهج</Label>
                          <div className="flex gap-2 items-center">
                            <input type="color" value={settings.devLogoGlowColor} onChange={e => update({ devLogoGlowColor: e.target.value })} className="w-10 h-10 rounded border cursor-pointer" />
                            <Input value={settings.devLogoGlowColor} onChange={e => update({ devLogoGlowColor: e.target.value })} dir="ltr" className="text-xs" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">شدة التوهج: {settings.devLogoGlowIntensity}%</Label>
                          <Slider value={[settings.devLogoGlowIntensity]} onValueChange={([v]) => update({ devLogoGlowIntensity: v })} min={0} max={100} step={5} />
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              {previewing === 'phase2' && (
                <div className="rounded-lg p-6 flex flex-col items-center justify-center gap-3 min-h-[150px] text-center" style={{ backgroundColor: settings.bgColor, color: settings.textColor }}>
                  <p className="text-lg opacity-80">{settings.phase2Line1}</p>
                  {settings.devLogoVisible && (
                    <AlHrsaniLabsAnimation
                      width={Math.min(400, settings.devLogoSize * 4)}
                      height={settings.devLogoSize * 2.5}
                    />
                  )}
                  <p className="text-sm opacity-60">{settings.phase2Line3}</p>
                </div>
              )}
            </div>

            {/* Logo Dimensions */}
            <div className="border rounded-lg p-3 space-y-4">
              <h3 className="font-semibold text-sm">أبعاد الشعار (بالبكسل)</h3>
              
              {/* Splash Logo */}
              <div className="space-y-2 border-b pb-3">
                <h4 className="text-xs font-medium text-muted-foreground">شاشة البداية</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">العرض: {settings.splashLogoWidth}px</Label>
                    <Slider value={[settings.splashLogoWidth]} onValueChange={([v]) => update({ splashLogoWidth: v })} min={40} max={400} step={4} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">الارتفاع: {settings.splashLogoHeight}px</Label>
                    <Slider value={[settings.splashLogoHeight]} onValueChange={([v]) => update({ splashLogoHeight: v })} min={40} max={400} step={4} />
                  </div>
                </div>
                <div className="flex justify-center p-2 rounded bg-muted">
                  <img src={mainLogoSrc} alt="معاينة" style={{ width: settings.splashLogoWidth / 2, height: settings.splashLogoHeight / 2 }} />
                </div>
              </div>

              {/* Auth Logo */}
              <div className="space-y-2 border-b pb-3">
                <h4 className="text-xs font-medium text-muted-foreground">صفحة الدخول</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">العرض: {settings.authLogoWidth}px</Label>
                    <Slider value={[settings.authLogoWidth]} onValueChange={([v]) => update({ authLogoWidth: v })} min={40} max={400} step={4} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">الارتفاع: {settings.authLogoHeight}px</Label>
                    <Slider value={[settings.authLogoHeight]} onValueChange={([v]) => update({ authLogoHeight: v })} min={40} max={400} step={4} />
                  </div>
                </div>
                <div className="flex justify-center p-2 rounded bg-muted">
                  <img src={mainLogoSrc} alt="معاينة" style={{ width: settings.authLogoWidth / 2, height: settings.authLogoHeight / 2 }} />
                </div>
              </div>

              {/* Dashboard Logo */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground">الصفحة الرئيسية</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">العرض: {settings.dashboardLogoWidth}px</Label>
                    <Slider value={[settings.dashboardLogoWidth]} onValueChange={([v]) => update({ dashboardLogoWidth: v })} min={40} max={400} step={4} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">الارتفاع: {settings.dashboardLogoHeight}px</Label>
                    <Slider value={[settings.dashboardLogoHeight]} onValueChange={([v]) => update({ dashboardLogoHeight: v })} min={40} max={400} step={4} />
                  </div>
                </div>
                <div className="flex justify-center p-2 rounded bg-muted">
                  <img src={mainLogoSrc} alt="معاينة" style={{ width: settings.dashboardLogoWidth, height: settings.dashboardLogoHeight }} />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
                حفظ الإعدادات
              </Button>
              <Button onClick={handleReset} variant="outline" disabled={saving}>
                إعادة ضبط
              </Button>
            </div>
          </>
        )}

        {!settings.enabled && (
          <Button onClick={handleSave} className="w-full" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
            حفظ
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SplashSettingsCard;
