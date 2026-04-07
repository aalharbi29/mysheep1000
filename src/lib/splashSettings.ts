import { supabase } from '@/integrations/supabase/client';

export interface SplashSettings {
  phase1Title: string;
  phase1ShowLogo: boolean;
  phase1Duration: number;
  phase2Line1: string;
  phase2Line2: string;
  phase2Line3: string;
  phase2Duration: number;
  bgColor: string;
  textColor: string;
  enabled: boolean;
  devLogoVisible: boolean;
  devLogoSize: number;
  devLogoBrightness: number;
  devLogoGlow: boolean;
  devLogoGlowColor: string;
  devLogoGlowIntensity: number;
  devAnimationWidth: number;
  devAnimationHeight: number;
  customMainLogoUrl: string | null;
  customDevLogoUrl: string | null;
  splashLogoWidth: number;
  splashLogoHeight: number;
  authLogoWidth: number;
  authLogoHeight: number;
  dashboardLogoWidth: number;
  dashboardLogoHeight: number;
}

export const defaultSplashSettings: SplashSettings = {
  phase1Title: 'الحظيرة النموذجية',
  phase1ShowLogo: true,
  phase1Duration: 2000,
  phase2Line1: 'برمجة وتطوير',
  phase2Line2: 'Al-Hrsani Labs',
  phase2Line3: 'لتطوير المحتوى',
  phase2Duration: 2500,
  bgColor: '#928472',
  textColor: '#ffffff',
  enabled: true,
  devLogoVisible: true,
  devLogoSize: 112,
  devLogoBrightness: 100,
  devLogoGlow: true,
  devLogoGlowColor: '#ffffff',
  devLogoGlowIntensity: 30,
  devAnimationWidth: 660,
  devAnimationHeight: 450,
  customMainLogoUrl: null,
  customDevLogoUrl: null,
  splashLogoWidth: 192,
  splashLogoHeight: 192,
  authLogoWidth: 200,
  authLogoHeight: 128,
  dashboardLogoWidth: 64,
  dashboardLogoHeight: 64,
};

function rowToSettings(row: any): SplashSettings {
  return {
    phase1Title: row.phase1_title,
    phase1ShowLogo: row.phase1_show_logo,
    phase1Duration: row.phase1_duration,
    phase2Line1: row.phase2_line1,
    phase2Line2: row.phase2_line2,
    phase2Line3: row.phase2_line3,
    phase2Duration: row.phase2_duration,
    bgColor: row.bg_color,
    textColor: row.text_color,
    enabled: row.enabled,
    devLogoVisible: row.dev_logo_visible ?? true,
    devLogoSize: row.dev_logo_size ?? 112,
    devLogoBrightness: row.dev_logo_brightness ?? 100,
    devLogoGlow: row.dev_logo_glow ?? true,
    devLogoGlowColor: row.dev_logo_glow_color ?? '#ffffff',
    devLogoGlowIntensity: row.dev_logo_glow_intensity ?? 30,
    devAnimationWidth: row.dev_animation_width ?? 660,
    devAnimationHeight: row.dev_animation_height ?? 450,
    customMainLogoUrl: row.custom_main_logo_url ?? null,
    customDevLogoUrl: row.custom_dev_logo_url ?? null,
    splashLogoWidth: row.splash_logo_width ?? 192,
    splashLogoHeight: row.splash_logo_height ?? 192,
    authLogoWidth: row.auth_logo_width ?? 200,
    authLogoHeight: row.auth_logo_height ?? 128,
    dashboardLogoWidth: row.dashboard_logo_width ?? 64,
    dashboardLogoHeight: row.dashboard_logo_height ?? 64,
  };
}

function settingsToRow(settings: SplashSettings, userId: string) {
  return {
    user_id: userId,
    phase1_title: settings.phase1Title,
    phase1_show_logo: settings.phase1ShowLogo,
    phase1_duration: settings.phase1Duration,
    phase2_line1: settings.phase2Line1,
    phase2_line2: settings.phase2Line2,
    phase2_line3: settings.phase2Line3,
    phase2_duration: settings.phase2Duration,
    bg_color: settings.bgColor,
    text_color: settings.textColor,
    enabled: settings.enabled,
    dev_logo_visible: settings.devLogoVisible,
    dev_logo_size: settings.devLogoSize,
    dev_logo_brightness: settings.devLogoBrightness,
    dev_logo_glow: settings.devLogoGlow,
    dev_logo_glow_color: settings.devLogoGlowColor,
    dev_logo_glow_intensity: settings.devLogoGlowIntensity,
    dev_animation_width: settings.devAnimationWidth,
    dev_animation_height: settings.devAnimationHeight,
    custom_main_logo_url: settings.customMainLogoUrl,
    custom_dev_logo_url: settings.customDevLogoUrl,
    splash_logo_width: settings.splashLogoWidth,
    splash_logo_height: settings.splashLogoHeight,
    auth_logo_width: settings.authLogoWidth,
    auth_logo_height: settings.authLogoHeight,
    dashboard_logo_width: settings.dashboardLogoWidth,
    dashboard_logo_height: settings.dashboardLogoHeight,
  };
}

export async function fetchSplashSettings(userId?: string): Promise<SplashSettings> {
  const { data } = await supabase
    .from('splash_settings')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();
  if (data) return rowToSettings(data);
  return { ...defaultSplashSettings };
}

export async function saveSplashSettingsToDb(settings: SplashSettings, userId: string): Promise<void> {
  const row = settingsToRow(settings, userId);
  const { data: existing } = await supabase
    .from('splash_settings')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existing) {
    await supabase.from('splash_settings').update(row).eq('user_id', userId);
  } else {
    await supabase.from('splash_settings').insert(row);
  }
}

const STORAGE_KEY = 'splash_settings';

export function getSplashSettings(): SplashSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultSplashSettings, ...JSON.parse(raw) };
  } catch {}
  return { ...defaultSplashSettings };
}

export function saveSplashSettingsLocal(settings: SplashSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
