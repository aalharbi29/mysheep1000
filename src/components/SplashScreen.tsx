import { useState, useEffect } from 'react';
import logoSvg from '@/assets/logo.svg';

type SplashPhase = 'logo' | 'credits' | 'done';

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<SplashPhase>('logo');
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setFadeOut(false);
        setPhase('credits');
      }, 500);
    }, 2000);

    const timer2 = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setPhase('done');
        onComplete();
      }, 500);
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#928472] transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      {phase === 'logo' && (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2">الحظيرة النموذجية</h1>
          <img src={logoSvg} alt="شعار التطبيق" className="w-32 h-32 invert" />
        </div>
      )}
      {phase === 'credits' && (
        <div className="flex flex-col items-center gap-4 animate-fade-in text-center">
          <p className="text-xl text-white/80">برمجة وتطوير</p>
          <h2 className="text-2xl font-bold text-white">Al-Hrsani Labs</h2>
          <p className="text-sm text-white/60 mt-2">لتطوير المحتوى</p>
        </div>
      )}
    </div>
  );
};

export default SplashScreen;
