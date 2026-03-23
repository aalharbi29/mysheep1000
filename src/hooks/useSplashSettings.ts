import { useState, useEffect } from 'react';
import { SplashSettings, fetchSplashSettings, defaultSplashSettings, getSplashSettings } from '@/lib/splashSettings';
import { useAuth } from '@/context/AuthContext';

export function useSplashSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SplashSettings>(() => getSplashSettings());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchSplashSettings(user.id).then(s => {
      setSettings(s);
      setLoading(false);
    });
  }, [user]);

  return { settings, loading };
}
