import { useState, useEffect } from 'react';
import logoSvg from '@/assets/logo.svg';
import { getSplashSettings } from '@/lib/splashSettings';

type SplashPhase = 'logo' | 'credits' | 'done';

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [settings] = useState(() => getSplashSettings());
  const [phase, setPhase] = useState<SplashPhase>('logo');
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
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
  }, [onComplete, settings]);

  if (phase === 'done' || !settings.enabled) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ backgroundColor: settings.bgColor, color: settings.textColor }}
    >
      {phase === 'logo' && (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <h1 className="text-3xl font-bold mb-2">{settings.phase1Title}</h1>
          {settings.phase1ShowLogo && <img src={logoSvg} alt="شعار التطبيق" className="w-32 h-32 invert" />}
        </div>
      )}
      {phase === 'credits' && (
        <div className="flex flex-col items-center gap-4 animate-fade-in text-center">
          <p className="text-xl opacity-80">{settings.phase2Line1}</p>
          <h2 className="text-2xl font-bold">{settings.phase2Line2}</h2>
          <p className="text-sm opacity-60 mt-2">{settings.phase2Line3}</p>
        </div>
      )}
    </div>
  );
};

export default SplashScreen;
