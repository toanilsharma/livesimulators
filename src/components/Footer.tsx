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
  FlaskConical,
  Calculator,
  Wrench,
  Share2,
  Copy,
  Check,
  Zap,
  BarChart3,
  Layers
} from 'lucide-react';
import { LABS, trackLabLaunch } from '../config/labs';
import { navigateTo } from '../utils/routes';

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


  // Social Share & Link Copy State
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  const handleCopyShareLink = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText('https://livesimulators.com').then(() => {
        setCopiedShareLink(true);
        setTimeout(() => setCopiedShareLink(false), 2500);
      }).catch(() => {
        setCopiedShareLink(true);
        setTimeout(() => setCopiedShareLink(false), 2500);
      });
    } else {
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2500);
    }
  };

  const shareCanonicalUrl = 'https://livesimulators.com';
  const shareEncodedUrl = encodeURIComponent(shareCanonicalUrl);
  const shareEncodedTitle = encodeURIComponent('LiveSimulators — Free Interactive First-Principles Engineering & Physics Simulators');
  const shareEncodedText = encodeURIComponent('Explore interactive first-principles simulations for Electrical, Mechanical, Process, Control, and Physics systems created by Anil Sharma.');


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

  const socialSharePlatforms = [
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareEncodedUrl}`,
      colorClass: 'bg-[#0077b5]/15 hover:bg-[#0077b5] text-[#70b5f9] hover:text-white border-[#0077b5]/40 hover:border-[#0077b5]',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      )
    },
    {
      name: 'X (Twitter)',
      url: `https://twitter.com/intent/tweet?url=${shareEncodedUrl}&text=${shareEncodedTitle}`,
      colorClass: 'bg-white/10 hover:bg-white text-slate-200 hover:text-black border-slate-700 hover:border-white',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    {
      name: 'WhatsApp',
      url: `https://api.whatsapp.com/send?text=${shareEncodedTitle}%20${shareEncodedUrl}`,
      colorClass: 'bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-white border-[#25D366]/40 hover:border-[#25D366]',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      )
    },
    {
      name: 'Reddit',
      url: `https://reddit.com/submit?url=${shareEncodedUrl}&title=${shareEncodedTitle}`,
      colorClass: 'bg-[#FF4500]/15 hover:bg-[#FF4500] text-[#FF4500] hover:text-white border-[#FF4500]/40 hover:border-[#FF4500]',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm7.625 13.875c.012.164.018.33.018.498 0 2.535-2.94 4.59-6.564 4.59s-6.564-2.055-6.564-4.59c0-.168.006-.334.018-.498-.59-.344-.988-.979-.988-1.706 0-1.096.889-1.984 1.984-1.984.542 0 1.033.218 1.393.57 1.15-.79 2.709-1.303 4.444-1.364l.872-4.098 2.848.605c.083-.497.513-.878 1.03-.878.58 0 1.05.47 1.05 1.05s-.47 1.05-1.05 1.05c-.538 0-.98-.406-1.038-.927l-2.457-.523-.746 3.513c1.78.051 3.385.57 4.562 1.378.364-.361.865-.586 1.419-.586 1.095 0 1.984.888 1.984 1.984 0 .727-.398 1.362-.988 1.706zm-8.875-1.875c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm5.5 0c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm-6.275 4.965c-.09-.091-.09-.237 0-.327.279-.279 1.163-.638 2.025-.638s1.746.359 2.025.638c.09.09.09.236 0 .327-.09.09-.236.09-.327 0-.21-.21-.92-.465-1.698-.465s-1.488.255-1.698.465c-.091.09-.237.09-.327 0z"/>
        </svg>
      )
    },
    {
      name: 'Telegram',
      url: `https://t.me/share/url?url=${shareEncodedUrl}&text=${shareEncodedTitle}`,
      colorClass: 'bg-[#229ED9]/15 hover:bg-[#229ED9] text-[#229ED9] hover:text-white border-[#229ED9]/40 hover:border-[#229ED9]',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.195 1.006.128.832.942z"/>
        </svg>
      )
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${shareEncodedUrl}`,
      colorClass: 'bg-[#1877F2]/15 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border-[#1877F2]/40 hover:border-[#1877F2]',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
        </svg>
      )
    }
  ];

  return (
    <footer className="bg-[#03060d] border-t border-slate-800/90 text-slate-400 font-sans text-xs relative overflow-hidden">
      {/* Subtle Technical Grid Background Texture */}
      <div className="absolute inset-0 bg-tech-grid opacity-15 pointer-events-none" />

      {/* Subtle Ambient Radial Lighting */}
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-cyan-950/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Footer Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative z-10">


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
                    onClick={(e) => {
                      trackLabLaunch(lab.id, 'footer');
                      if (!lab.external) {
                        e.preventDefault();
                        navigateTo(lab.url);
                      }
                    }}
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

        {/* Social Media Share Bar */}
        <div className="mt-14 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-cyan-950/20 border border-slate-800/90 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Share2 className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-sm font-display font-bold text-white tracking-tight">
                Share LiveSimulators with Engineering Colleagues & Students
              </h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Help engineers, university professors, and students discover free, interactive first-principles simulations for continuous processes, power electronics, and structural mechanics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {socialSharePlatforms.map((platform) => (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`Share LiveSimulators on ${platform.name}`}
                aria-label={`Share on ${platform.name}`}
                className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 ${platform.colorClass}`}
              >
                {platform.icon}
                <span className="hidden sm:inline font-sans">{platform.name}</span>
              </a>
            ))}

            {/* Direct Copy Link Button */}
            <button
              onClick={handleCopyShareLink}
              type="button"
              title="Copy LiveSimulators.com Link"
              aria-label="Copy LiveSimulators link"
              className={`px-3 py-2 rounded-xl border text-xs font-mono font-medium transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95 ${
                copiedShareLink
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-500'
              }`}
            >
              {copiedShareLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold text-emerald-300">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Companion Engineering Platforms by Anil Sharma (Side-by-Side in Row) */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-xs font-display font-bold text-white tracking-wide uppercase">
                Engineering Ecosystem by Anil Sharma
              </span>
              <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">• Free Companion Portals</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 hidden md:inline">
              Standards-Referenced Calculation & Plant Reliability Analytics
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: DesignCalculators.co.in (Emerald / Cyan Highlight) */}
            <a
              href="https://designcalculators.co.in"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-4 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-400/80 transition-all duration-200 flex flex-col justify-between gap-3 hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                    <Calculator className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                        DesignCalculators.co.in
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400/90 block">
                      Electrical • Mechanical • Instrumentation Calculators
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shrink-0">
                  IEEE • IEC • ASME Refs
                </span>
              </div>

              <p className="text-xs text-slate-300/90 leading-relaxed">
                Free engineering calculators for Electrical, Mechanical, and Instrumentation disciplines based on publicly documented industry methodologies (referenced from IEEE, IEC, ASME, API, ISA for technical reference only)—covering cable sizing, substation grounding, pressure vessels, pipe hydraulics, and control valve sizing (<span className="font-mono text-slate-200">Cv</span>).
              </p>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                <span className="text-emerald-400/80">Referenced Industry Standards</span>
                <span className="text-emerald-400 font-medium group-hover:underline flex items-center gap-1">
                  Visit portal ↗
                </span>
              </div>
            </a>

            {/* Card 2: ReliabilityTools.co.in (Violet / Fuchsia Highlight) */}
            <a
              href="https://reliabilitytools.co.in"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-4 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 border border-violet-500/30 hover:border-violet-400/80 transition-all duration-200 flex flex-col justify-between gap-3 hover:shadow-[0_0_20px_rgba(139,92,246,0.12)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0 group-hover:scale-105 transition-transform">
                    <Wrench className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-bold text-sm text-white group-hover:text-violet-300 transition-colors">
                        ReliabilityTools.co.in
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-violet-400 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                    <span className="text-[10px] font-mono text-violet-400/90 block">
                      Plant Reliability & Maintenance Analytics
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-violet-500/10 text-violet-300 border border-violet-500/30 shrink-0">
                  Uptime & Analytics
                </span>
              </div>

              <p className="text-xs text-slate-300/90 leading-relaxed">
                Improve your plant’s reliability and reduce downtime using free reliability tools—including 2P/3P Weibull failure analysis, MTBF/MTTR uptime modeling, Root Cause Analysis (RCA), OEE loss tracking, and IEC 61508/61511 SIL verification.
              </p>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/60">
                <span className="text-violet-400/80">Asset Optimization & RCA</span>
                <span className="text-violet-400 font-medium group-hover:underline flex items-center gap-1">
                  Visit portal ↗
                </span>
              </div>
            </a>
          </div>
        </div>

        {/* Small Educational-Purpose Statement & Non-Affiliation Trademark Notice */}
        <div className="mt-10 pt-8 border-t border-slate-900 text-[11px] text-slate-500 font-sans leading-relaxed max-w-5xl space-y-2">
          <p>
            LiveSimulators provides interactive engineering learning experiences and conceptual visualizations. 
            Simulations are intended for education and exploration; users should consult applicable standards, engineering 
            documentation, and qualified professionals for real-world design, safety, or operational decisions.
          </p>
          <p className="text-[10px] text-slate-500">
            <strong>Non-Affiliation & Standards Reference Notice:</strong> All product names, trademarks, and standard designations (including IEEE, IEC, ASME, API, ISO, ISA, NFPA, and ASTM) belong to their respective proprietary owners. Mention of any standard, code, or organization is strictly for academic cross-referencing, educational identification, and computational modeling context only, and does not constitute or imply any endorsement, sponsorship, affiliation, certification, or approval by any standards organization.
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
