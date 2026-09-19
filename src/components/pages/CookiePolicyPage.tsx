import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  Cookie, 
  Sliders, 
  Save, 
  ArrowLeft, 
  ExternalLink,
  CheckCircle2,
  Check,
  Info,
  Server,
  Activity
} from 'lucide-react';
import { getConsentCookie, setConsentCookie } from '../../utils/cookies';

interface CookiePolicyPageProps {
  onBackToHome: () => void;
  onNavigateToPrivacy: () => void;
  onNavigateToContact: () => void;
}

export const CookiePolicyPage: React.FC<CookiePolicyPageProps> = ({
  onBackToHome,
  onNavigateToPrivacy,
  onNavigateToContact
}) => {
  const [analyticsConsent, setAnalyticsConsent] = useState<boolean>(true);
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    const saved = getConsentCookie();
    if (saved === 'rejected') {
      setAnalyticsConsent(false);
    } else {
      setAnalyticsConsent(true);
    }
  }, []);

  const handleSavePreferences = () => {
    const consentValue = analyticsConsent ? 'accepted' : 'rejected';
    setConsentCookie(consentValue);

    // Update gtag consent if available
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('consent', 'update', {
        analytics_storage: analyticsConsent ? 'granted' : 'denied',
      });
    }

    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#080d16] text-slate-100 font-sans selection:bg-cyan-500/25 selection:text-cyan-200 relative overflow-x-hidden w-full max-w-full">
      {/* Background Decorators */}
      <div className="absolute inset-0 bg-tech-grid opacity-10 pointer-events-none" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors bg-slate-900/80 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg group"
            id="cookie-back-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Simulators</span>
          </button>
          <span className="text-slate-700">/</span>
          <span className="text-xs font-mono text-cyan-400">LEGAL & COMPLIANCE</span>
          <span className="text-slate-700">/</span>
          <span className="text-xs font-mono text-slate-300">COOKIE POLICY</span>
        </div>

        {/* Document Header */}
        <div className="border-b border-slate-800 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-3">
            <Cookie className="w-3.5 h-3.5" />
            TRANSPARENCY & CONSENT MANAGEMENT
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
            Cookie & Telemetry Policy
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
            <span>EFFECTIVE DATE: September 2026</span>
            <span>•</span>
            <span>STANDARD: EU GDPR / ePrivacy / California CPRA</span>
          </div>
        </div>

        {/* Interactive Consent Control Center */}
        <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 via-slate-900/80 to-slate-900 p-6 sm:p-8 mb-12 shadow-xl shadow-cyan-950/20">
          <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-white text-base">Your Privacy & Cookie Preferences</h2>
                <p className="text-xs text-slate-400">Configure which telemetry and cookie types you permit on this device.</p>
              </div>
            </div>
            {savedFeedback && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono border border-emerald-500/40 animate-in fade-in duration-200">
                <Check className="w-3.5 h-3.5" />
                Preferences Saved
              </span>
            )}
          </div>

          <div className="space-y-4">
            {/* Strictly Essential */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-display font-semibold text-white text-xs">Strictly Necessary & Computation</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">ALWAYS ON</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-xl">
                  Required for simulator state caching, rendering loop stabilization, and storing your consent preferences. These do not track personal identifying information.
                </p>
              </div>
              <div className="w-12 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-end px-1 cursor-not-allowed opacity-80">
                <div className="w-4 h-4 rounded-full bg-emerald-400" />
              </div>
            </div>

            {/* Google Analytics & Performance */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-display font-semibold text-white text-xs">Google Analytics 4 & Performance Telemetry</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">TAG: G-WX8V8HH57V</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-xl">
                  Helps us understand which engineering simulators are most utilized, identify high-traffic educational modules, and measure simulator rendering speeds.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAnalyticsConsent(!analyticsConsent)}
                className={`w-12 h-6 rounded-full transition-colors flex items-center p-1 cursor-pointer border ${
                  analyticsConsent 
                    ? 'bg-cyan-500 border-cyan-400 justify-end' 
                    : 'bg-slate-800 border-slate-700 justify-start'
                }`}
                aria-label="Toggle analytics cookies"
                id="toggle-analytics-cookie"
              >
                <div className={`w-4 h-4 rounded-full transition-transform ${analyticsConsent ? 'bg-slate-950' : 'bg-slate-400'}`} />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500">Changes apply immediately across all simulators</span>
            <button
              onClick={handleSavePreferences}
              className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-display font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              id="save-cookie-pref-btn"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Preferences</span>
            </button>
          </div>
        </div>

        {/* Detailed Narrative Policy Body */}
        <div className="space-y-8 text-xs text-slate-300 leading-relaxed font-sans">
          
          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold text-white">1. What Are Cookies and Local Storage?</h3>
            <p>
              Cookies are small text files placed on your computer or mobile device when you visit websites. 
              Modern web applications like LiveSimulators also utilize <span className="font-mono text-cyan-300">localStorage</span> and 
              in-memory buffers to maintain high-speed computational integrity without making continuous round trips to remote servers.
            </p>
            <p>
              Because LiveSimulators runs physics solvers directly in your client's web browser using Float64 
              JavaScript arithmetic, our mathematical engines do not require cookies to calculate waveforms, 
              differential equations, or frequency responses.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold text-white">2. Detailed Inventory of Cookies Used</h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-slate-800 rounded-xl overflow-hidden font-mono text-[11px] text-left">
                <thead className="bg-slate-900 text-slate-300">
                  <tr>
                    <th className="p-3 border-b border-slate-800">Cookie Name</th>
                    <th className="p-3 border-b border-slate-800">Provider</th>
                    <th className="p-3 border-b border-slate-800">Purpose</th>
                    <th className="p-3 border-b border-slate-800">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/50">
                  <tr>
                    <td className="p-3 text-cyan-300">_ga</td>
                    <td className="p-3">Google Analytics (G-WX8V8HH57V)</td>
                    <td className="p-3 font-sans">Distinguishes unique users across web sessions anonymously</td>
                    <td className="p-3">2 years</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-cyan-300">_ga_WX8V8HH57V</td>
                    <td className="p-3">Google Analytics (G-WX8V8HH57V)</td>
                    <td className="p-3 font-sans">Maintains session state and aggregated interaction telemetry</td>
                    <td className="p-3">2 years</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-cyan-300">livesim_cookie_consent</td>
                    <td className="p-3">LiveSimulators (localStorage)</td>
                    <td className="p-3 font-sans">Remembers your cookie and telemetry preferences</td>
                    <td className="p-3">Persistent</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold text-white">3. Third-Party Web Analytics</h3>
            <p>
              We integrate Google Analytics via Google tag (<span className="font-mono text-cyan-300">gtag.js</span>, ID: <span className="font-mono text-cyan-300">G-WX8V8HH57V</span>). 
              This allows us to evaluate aggregated metrics such as average session duration, most popular engineering simulators, 
              and geographic educational adoption. IP addresses are anonymized according to Google's standard protocols.
            </p>
            <p>
              We do not permit Google to use your data for targeted advertising or to associate your telemetry with other Google profiling services.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold text-white">4. Managing Cookies via Browser Settings</h3>
            <p>
              You can block or delete cookies directly in your browser preferences at any time:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong className="text-white">Google Chrome:</strong> Settings &gt; Privacy and Security &gt; Cookies and other site data.</li>
              <li><strong className="text-white">Mozilla Firefox:</strong> Settings &gt; Privacy &amp; Security &gt; Enhanced Tracking Protection.</li>
              <li><strong className="text-white">Apple Safari:</strong> Preferences &gt; Privacy &gt; Block all cookies.</li>
              <li><strong className="text-white">Microsoft Edge:</strong> Settings &gt; Cookies and site permissions.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold text-white">5. Contact Point for Privacy Matters</h3>
            <p>
              If you have any questions regarding our cookie practices or wish to submit a data inquiry, please contact our lead engineer:
            </p>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] space-y-1">
              <div>OFFICER: Anil Sharma</div>
              <div>EMAIL: <a href="mailto:0808miracle@gmail.com" className="text-cyan-300 underline">0808miracle@gmail.com</a></div>
              <div>LINKEDIN: <a href="https://www.linkedin.com/in/toanilsharma/" target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline">linkedin.com/in/toanilsharma</a></div>
            </div>
          </section>

        </div>

        {/* Links Strip */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <button onClick={onNavigateToPrivacy} className="hover:text-cyan-300 underline">
            Read Full Privacy Policy &rarr;
          </button>
          <button onClick={onNavigateToContact} className="hover:text-cyan-300 underline">
            Contact Engineering Team &rarr;
          </button>
        </div>

      </div>
    </div>
  );
};
