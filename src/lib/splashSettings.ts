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
  };
}

export async function fetchSplashSettings(userId: string): Promise<SplashSettings> {
  const { data } = await supabase
    .from('splash_settings')
    .select('*')
    .eq('user_id', userId)
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

// Keep localStorage fallback for splash screen (shown before auth)
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
