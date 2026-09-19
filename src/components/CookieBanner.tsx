import React, { useState, useEffect } from 'react';
import { Cookie, Shield, X, Check } from 'lucide-react';
import { getConsentCookie, setConsentCookie } from '../utils/cookies';

interface CookieBannerProps {
  onNavigateToCookiePolicy: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onNavigateToCookiePolicy }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getConsentCookie();
    if (!consent) {
      // Show after a tiny delay for smooth visual entrance
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setConsentCookie('accepted');
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'granted',
      });
    }
    setVisible(false);
  };

  const handleDecline = () => {
    setConsentCookie('rejected');
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'denied',
      });
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside 
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="rounded-2xl border border-slate-700/80 bg-[#070c16]/95 backdrop-blur-xl p-5 shadow-2xl shadow-black/80 text-xs text-slate-300 font-sans space-y-3.5 relative overflow-hidden">
        
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
              <Cookie className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-display font-bold text-white text-xs">Privacy & Simulation Telemetry</h4>
              <span className="text-[10px] font-mono text-cyan-400">Google tag (G-WX8V8HH57V)</span>
            </div>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          We use strictly necessary browser storage for simulations and anonymous Google Analytics to 
          measure module utilization and solver rendering speeds.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <button
            onClick={onNavigateToCookiePolicy}
            className="text-[11px] font-mono text-cyan-400 hover:underline hover:text-cyan-300 transition-colors"
          >
            Manage Policy &rarr;
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDecline}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-mono transition-colors"
              id="cookie-banner-reject"
            >
              Essential Only
            </button>
            <button
              onClick={handleAccept}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-[11px] font-display font-bold transition-colors shadow-[0_0_10px_rgba(6,182,212,0.3)]"
              id="cookie-banner-accept"
            >
              Accept All
            </button>
          </div>
        </div>

      </div>
    </aside>
  );
};
