import { useState, useEffect } from 'react';
import logoSvg from '@/assets/logo.svg';
import hrsaniLabsLogo from '@/assets/hrsani-labs-logo.png';
import { getSplashSettings, fetchSplashSettings, SplashSettings } from '@/lib/splashSettings';

type SplashPhase = 'logo' | 'credits' | 'done';

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [settings, setSettings] = useState<SplashSettings>(() => getSplashSettings());
  const [phase, setPhase] = useState<SplashPhase>('logo');
  const [fadeOut, setFadeOut] = useState(false);
  const [ready, setReady] = useState(false);

  const mainLogoSrc = settings.customMainLogoUrl || null;
  const devLogoSrc = settings.customDevLogoUrl || hrsaniLabsLogo;

  // Fetch global settings from DB, then start animation
  useEffect(() => {
    fetchSplashSettings().then(s => {
      setSettings(s);
      setReady(true);
    }).catch(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!settings.enabled) {
      onComplete();
      return;
    }

    const fadeMs = 500;
    const timer1 = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setFadeOut(false);
        setPhase('credits');
      }, fadeMs);
    }, settings.phase1Duration);

    const timer2 = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setPhase('done');
        onComplete();
      }, fadeMs);
    }, settings.phase1Duration + fadeMs + settings.phase2Duration);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete, settings, ready]);

  if (!ready || phase === 'done' || !settings.enabled) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ backgroundColor: settings.bgColor, color: settings.textColor }}
    >
      {phase === 'logo' && (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">{settings.phase1Title}</h1>
          {settings.phase1ShowLogo && (
            mainLogoSrc ? (
              <img src={mainLogoSrc} alt="" style={{ width: settings.splashLogoWidth, height: settings.splashLogoHeight }} />
            ) : (
              <div className="relative" style={{ width: settings.splashLogoWidth, height: settings.splashLogoHeight }}>
                <img src={logoSvg} alt="" className="absolute invert" style={{ inset: '-4px', width: 'calc(100% + 8px)', height: 'calc(100% + 8px)' }} />
                <div className="absolute inset-0 w-full h-full" style={{
                  WebkitMaskImage: `url(${logoSvg})`,
                  maskImage: `url(${logoSvg})`,
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                  backgroundColor: settings.bgColor
                }} />
              </div>
            )
          )}
        </div>
      )}
      {phase === 'credits' && (
        <div className="flex flex-col items-center gap-4 animate-fade-in text-center">
          <p className="text-xl opacity-80">{settings.phase2Line1}</p>
          {settings.devLogoVisible && (
            <img
              src={devLogoSrc}
              alt="Al-Hrsani Labs"
              className="object-contain"
              style={{
                height: `${settings.devLogoSize}px`,
                filter: `brightness(${settings.devLogoBrightness / 100})${settings.devLogoGlow ? ` drop-shadow(0 0 ${settings.devLogoGlowIntensity / 3}px ${settings.devLogoGlowColor})` : ''}`,
                animation: settings.devLogoGlow ? 'glow-pulse 2.5s ease-in-out infinite' : 'none',
              }}
            />
          )}
          <p className="text-sm opacity-60 mt-2">{settings.phase2Line3}</p>
        </div>
      )}
    </div>
  );
};

export default SplashScreen;
