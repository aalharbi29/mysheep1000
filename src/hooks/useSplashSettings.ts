import { useState, useEffect } from 'react';
import { SplashSettings, fetchSplashSettings, defaultSplashSettings, getSplashSettings } from '@/lib/splashSettings';
import { useAuth } from '@/context/AuthContext';

export function useSplashSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SplashSettings>(() => getSplashSettings());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSplashSettings().then(s => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  return { settings, loading };
}
