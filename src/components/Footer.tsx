import React, { useState } from 'react';
import { 
  Activity, 
  Mail, 
  ArrowUpRight, 
  CheckCircle2, 
  X, 
  Send,
  Sparkles,
  ShieldCheck,
  Linkedin,
  Cookie,
  FileText,
  AlertTriangle,
  ExternalLink,
  FlaskConical
} from 'lucide-react';
import { LABS, trackLabLaunch } from '../config/labs';
import { trackNewsletterSignup } from '../utils/analytics';

interface FooterProps {
  onSelectDiscipline: (id: string) => void;
  onOpenTopic?: (topic: string) => void;
  onGoHome?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToContact?: () => void;
  onNavigateToCookiePolicy?: () => void;
  onNavigateToDisclaimer?: () => void;
  onNavigateToPrivacyPolicy?: () => void;
  onNavigateToTerms?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onSelectDiscipline,
  onGoHome,
  onNavigateToAbout,
  onNavigateToContact,
  onNavigateToCookiePolicy,
  onNavigateToDisclaimer,
  onNavigateToPrivacyPolicy,
  onNavigateToTerms,
}) => {
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  // Engineering Dispatch Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      trackNewsletterSignup('footer');
      setNewsletterSubmitted(true);
      setTimeout(() => {
        setNewsletterSubmitted(false);
        setNewsletterEmail('');
      }, 4000);
    }
  };

  const handleScrollToHomeSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      if (onGoHome) onGoHome();
      setTimeout(() => {
        const target = document.getElementById(sectionId);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleDisciplineClick = (disciplineId: string) => {
    onSelectDiscipline(disciplineId);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactEmail.trim()) {
      setContactSubmitted(true);
      setTimeout(() => {
        setContactSubmitted(false);
        setContactModalOpen(false);
        setContactEmail('');
        setContactMessage('');
      }, 2500);
    }
  };

  return (
    <footer className="bg-[#03060d] border-t border-slate-800/90 text-slate-400 font-sans text-xs relative overflow-hidden">
      {/* Subtle Technical Grid Background Texture */}
      <div className="absolute inset-0 bg-tech-grid opacity-15 pointer-events-none" />

      {/* Subtle Ambient Radial Lighting */}
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-cyan-950/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Footer Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative z-10">

        {/* Engineering Dispatch Newsletter Subscription Bar */}
        <div className="mb-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-cyan-950/20 border border-slate-800/90 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                ENGINEERING DISPATCH
              </span>
              <span className="text-[11px] font-mono text-slate-400">Quarterly Numerical Releases</span>
            </div>
            <h3 className="text-base sm:text-lg font-display font-bold text-white tracking-tight">
              Get New Simulator Releases & Governing Formulations
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct notifications when new differential solvers, IEEE/ISO benchmarks, or industrial laboratory modules are deployed. Zero marketing spam.
            </p>
          </div>

          <div className="w-full lg:w-auto shrink-0">
            {newsletterSubmitted ? (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Subscribed! You'll receive numerical solver updates.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="engineer@domain.com"
                  aria-label="Email for Engineering Dispatch"
                  className="px-3.5 py-2 rounded-xl bg-slate-950/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs font-mono min-w-[240px]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Subscribe</span>
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Brand & Mission Column */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="font-display text-xl font-bold text-white tracking-tight">
                LiveSimulators<span className="text-cyan-400">.com</span>
              </span>
            </div>

            {/* Exact Tagline */}
            <p className="text-slate-200 text-sm font-display font-semibold tracking-tight">
              "Don't Just Read Engineering. See It Happen."
            </p>

            <p className="text-slate-400 text-xs font-sans leading-relaxed max-w-sm">
              Interactive numerical simulations turning abstract differential formulations into 
              intuitive, real-time physical behaviors for students, educators, and practicing engineers.
            </p>

            {/* Founder & Direct Contact Snippet */}
            <div className="pt-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 max-w-sm font-mono text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold">Anil Sharma</span>
                <span className="text-[10px] text-cyan-400">FOUNDER</span>
              </div>
              <div className="flex flex-col gap-1 text-slate-400">
                <a 
                  href="mailto:0808miracle@gmail.com" 
                  className="hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3 h-3 text-cyan-400" />
                  <span>0808miracle@gmail.com</span>
                </a>
                <a 
                  href="https://www.linkedin.com/in/toanilsharma/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-blue-300 flex items-center gap-1.5 transition-colors"
                >
                  <Linkedin className="w-3 h-3 text-blue-400" />
                  <span>linkedin.com/in/toanilsharma</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

          </div>

          {/* Group 1: Disciplines */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-white font-display font-semibold text-xs uppercase tracking-wider">
              Disciplines
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <a 
                  href="/department/electrical"
                  onClick={(e) => { e.preventDefault(); handleDisciplineClick('electrical'); }}
                  className="hover:text-cyan-400 transition-colors text-left flex items-center gap-1 group"
                >
                  <span>Electrical Engineering</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              </li>
              <li>
                <a 
                  href="/department/mechanical"
                  onClick={(e) => { e.preventDefault(); handleDisciplineClick('mechanical'); }}
                  className="hover:text-cyan-400 transition-colors text-left flex items-center gap-1 group"
                >
                  <span>Mechanical Systems</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              </li>
              <li>
                <a 
                  href="/department/control"
                  onClick={(e) => { e.preventDefault(); handleDisciplineClick('control'); }}
                  className="hover:text-cyan-400 transition-colors text-left flex items-center gap-1 group"
                >
                  <span>Control & Signals</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              </li>
              <li>
                <a 
                  href="/department/chemical"
                  onClick={(e) => { e.preventDefault(); handleDisciplineClick('chemical'); }}
                  className="hover:text-cyan-400 transition-colors text-left flex items-center gap-1 group"
                >
                  <span>Chemical & Process</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              </li>
              <li>
                <a 
                  href="/department/civil"
                  onClick={(e) => { e.preventDefault(); handleDisciplineClick('civil'); }}
                  className="hover:text-cyan-400 transition-colors text-left flex items-center gap-1 group"
                >
                  <span>Civil & Structural</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              </li>
              <li>
                <a 
                  href="/department/physics"
                  onClick={(e) => { e.preventDefault(); handleDisciplineClick('physics'); }}
                  className="hover:text-cyan-400 transition-colors text-left flex items-center gap-1 group"
                >
                  <span>Applied Physics</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              </li>
            </ul>
          </div>

          {/* Group 2: Industrial Labs (FROM LABS ONLY) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-white font-display font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
              <span>Industrial Labs</span>
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              {LABS.map((lab) => (
                <li key={lab.id}>
                  <a
                    href={lab.url}
                    target={lab.external ? '_blank' : undefined}
                    rel={lab.external ? 'noopener noreferrer' : undefined}
                    onClick={() => trackLabLaunch(lab.id, 'footer')}
                    className="hover:text-cyan-400 transition-colors text-left flex items-start gap-1 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="group-hover:text-cyan-300 font-medium truncate">{lab.name}</span>
                        {lab.external ? (
                          <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 shrink-0 transition-colors" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 shrink-0 transition-colors" />
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 block truncate">
                        {lab.modules} Modules • {lab.dept}
                      </span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Group 3: Platform & About */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-white font-display font-semibold text-xs uppercase tracking-wider">
              About & Desk
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <a 
                  href="/about"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigateToAbout) onNavigateToAbout();
                    else handleScrollToHomeSection('why-interactive');
                  }}
                  className="hover:text-cyan-400 transition-colors text-left flex items-center gap-1 group"
                  id="footer-about-link"
                >
                  <span>About Us</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              </li>
              <li>
                <a 
                  href="/contact"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigateToContact) onNavigateToContact();
                    else setContactModalOpen(true);
                  }}
                  className="hover:text-cyan-400 transition-colors text-left flex items-center gap-1 group text-cyan-400/90 font-medium"
                  id="footer-contact-link"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Contact Us</span>
                </a>
              </li>
              <li>
                <a 
                  href="/#engineering-principles"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollToHomeSection('engineering-principles');
                  }}
                  className="hover:text-cyan-400 transition-colors text-left flex items-center gap-1 group"
                >
                  <span>Principles</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              </li>
              <li>
                <a 
                  href="/#how-it-works"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollToHomeSection('how-it-works');
                  }}
                  className="hover:text-cyan-400 transition-colors text-left flex items-center gap-1 group"
                >
                  <span>Architecture</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              </li>
            </ul>
          </div>

          {/* Group 4: Legal & Standards */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-white font-display font-semibold text-xs uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <a 
                  href="/disclaimer"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigateToDisclaimer) onNavigateToDisclaimer();
                  }}
                  className="hover:text-cyan-400 transition-colors text-left flex items-center gap-1 group"
                  id="footer-disclaimer-link"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400/80" />
                  <span>Engineering Disclaimer</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              </li>
              <li>
                <a 
                  href="/cookie-policy"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigateToCookiePolicy) onNavigateToCookiePolicy();
                  }}
                  className="hover:text-cyan-400 transition-colors text-left flex items-center gap-1 group"
                  id="footer-cookie-link"
                >
                  <Cookie className="w-3.5 h-3.5 text-cyan-400/80" />
                  <span>Cookie Policy</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              </li>
              <li>
                <a 
                  href="/privacy-policy"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigateToPrivacyPolicy) onNavigateToPrivacyPolicy();
                  }}
                  className="hover:text-cyan-400 transition-colors text-left flex items-center gap-1 group"
                  id="footer-privacy-link"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400/80" />
                  <span>Privacy Policy (GDPR/CCPA)</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              </li>
              <li>
                <a 
                  href="/terms"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigateToTerms) onNavigateToTerms();
                  }}
                  className="hover:text-cyan-400 transition-colors text-left flex items-center gap-1 group"
                  id="footer-terms-link"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Terms of Service</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Small Educational-Purpose Statement (Subtle, Not Visually Dominant) */}
        <div className="mt-14 pt-8 border-t border-slate-900 text-[11px] text-slate-500 font-sans leading-relaxed max-w-4xl">
          <p>
            LiveSimulators provides interactive engineering learning experiences and conceptual visualizations. 
            Simulations are intended for education and exploration; users should consult applicable standards, engineering 
            documentation, and qualified professionals for real-world design, safety, or operational decisions.
          </p>
        </div>

        {/* Bottom Technical Copyright & Telemetry Bar */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-mono text-slate-500 border-t border-slate-900/60 pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>FLOAT64 ENGINE</span>
            </div>
            <span>•</span>
            <span>GOOGLE TAG: G-WX8V8HH57V</span>
            <span>•</span>
            <span>OPEN ACADEMIC ACCESS</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <a href="/about" onClick={(e) => { e.preventDefault(); if (onNavigateToAbout) onNavigateToAbout(); }} className="hover:text-cyan-400 transition-colors">About</a>
            <a href="/contact" onClick={(e) => { e.preventDefault(); if (onNavigateToContact) onNavigateToContact(); }} className="hover:text-cyan-400 transition-colors">Contact</a>
            <a href="/cookie-policy" onClick={(e) => { e.preventDefault(); if (onNavigateToCookiePolicy) onNavigateToCookiePolicy(); }} className="hover:text-cyan-400 transition-colors">Cookie Policy</a>
            <a href="/disclaimer" onClick={(e) => { e.preventDefault(); if (onNavigateToDisclaimer) onNavigateToDisclaimer(); }} className="hover:text-cyan-400 transition-colors">Disclaimer</a>
            <a href="/privacy-policy" onClick={(e) => { e.preventDefault(); if (onNavigateToPrivacyPolicy) onNavigateToPrivacyPolicy(); }} className="hover:text-cyan-400 transition-colors">Privacy</a>
            <a href="/terms" onClick={(e) => { e.preventDefault(); if (onNavigateToTerms) onNavigateToTerms(); }} className="hover:text-cyan-400 transition-colors">Terms</a>
          </div>

          <div>
            © {new Date().getFullYear()} LiveSimulators.com. All engineering principles conserved.
          </div>
        </div>

      </div>

      {/* Fallback Contact Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div 
            className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl p-6 space-y-4 font-sans text-xs text-slate-300 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-display text-base font-bold">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>Contact Anil Sharma</span>
              </div>
              <button
                onClick={() => setContactModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {contactSubmitted ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h5 className="font-bold text-white text-sm">Message Received</h5>
                <p className="text-slate-400 text-xs">
                  Thank you for your feedback. Our computational engineering team will review your inquiry.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3.5">
                <p className="text-slate-400 text-xs">
                  Reach out directly to Anil Sharma for simulator requests or equation clarifications.
                </p>

                <div className="space-y-1">
                  <label className="text-slate-400 text-[11px] font-mono">Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="engineer@domain.com"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 text-[11px] font-mono">Message / Simulator Request</label>
                  <textarea
                    rows={3}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="E.g., Can you model IEEE 1584 arc flash incident energy curves or synchronous generator load angle?"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <a
                    href="mailto:0808miracle@gmail.com"
                    className="text-cyan-400 hover:underline font-mono text-[11px] flex items-center gap-1"
                  >
                    <span>Direct: 0808miracle@gmail.com</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-display flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send Message</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </footer>
  );
};
