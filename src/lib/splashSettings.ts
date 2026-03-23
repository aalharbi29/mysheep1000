export interface SplashSettings {
  phase1Title: string;
  phase1ShowLogo: boolean;
  phase1Duration: number; // ms
  phase2Line1: string;
  phase2Line2: string;
  phase2Line3: string;
  phase2Duration: number; // ms
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

const STORAGE_KEY = 'splash_settings';

export function getSplashSettings(): SplashSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultSplashSettings, ...JSON.parse(raw) };
  } catch {}
  return { ...defaultSplashSettings };
}

export function saveSplashSettings(settings: SplashSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
