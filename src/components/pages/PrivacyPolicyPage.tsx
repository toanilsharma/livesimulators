import React from 'react';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Lock, 
  Eye, 
  Database, 
  FileText, 
  CheckCircle2, 
  Mail, 
  ExternalLink,
  Globe
} from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBackToHome: () => void;
  onNavigateToCookiePolicy: () => void;
  onNavigateToContact: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({
  onBackToHome,
  onNavigateToCookiePolicy,
  onNavigateToContact
}) => {
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
            id="privacy-back-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Simulators</span>
          </button>
          <span className="text-slate-700">/</span>
          <span className="text-xs font-mono text-cyan-400">LEGAL & COMPLIANCE</span>
          <span className="text-slate-700">/</span>
          <span className="text-xs font-mono text-slate-300">PRIVACY POLICY</span>
        </div>

        {/* Document Header */}
        <div className="border-b border-slate-800 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            GDPR & CCPA COMPLIANCE SPECIFICATION
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
            Privacy Policy
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
            <span>EFFECTIVE DATE: September 2026</span>
            <span>•</span>
            <span>DATA CONTROLLER: LiveSimulators (Anil Sharma)</span>
          </div>
        </div>

        {/* Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="text-cyan-400 font-mono font-bold mb-1">ZERO DATA SALES</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              We never sell, rent, monetize, or trade your personal data with third-party advertisers or data brokers.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="text-emerald-400 font-mono font-bold mb-1">CLIENT COMPUTING</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Calculations run locally in your browser. Parameter inputs are not sent to any backend database.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="text-purple-400 font-mono font-bold mb-1">ANONYMOUS TELEMETRY</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Google Analytics 4 operates with IP anonymization to track aggregate site health and popularity.
            </p>
          </div>
        </div>

        {/* Narrative Sections */}
        <div className="space-y-8 text-xs text-slate-300 leading-relaxed font-sans">
          
          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              1. Information We Collect
            </h3>
            <p>
              LiveSimulators minimizes data collection by architecture. We collect information only in two limited contexts:
            </p>
            <div className="space-y-2 pl-2">
              <div>
                <strong className="text-white font-mono text-[11px]">A. Information You Voluntarily Provide:</strong>
                <p className="text-slate-400 mt-0.5">
                  When you submit an engineering inquiry or simulator feedback via our contact forms, you provide your name, 
                  email address, subject, and message content. This is used solely to respond to your technical correspondence.
                </p>
              </div>
              <div>
                <strong className="text-white font-mono text-[11px]">B. Automated Aggregated Telemetry:</strong>
                <p className="text-slate-400 mt-0.5">
                  We use Google Analytics (Google tag: <span className="text-cyan-300 font-mono">G-WX8V8HH57V</span>) to collect 
                  non-personally identifiable metrics: browser user-agent, operating system, referrer URL, pages viewed, and approximate geographic region (city/country level).
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              2. How We Use Information
            </h3>
            <p>
              We process data strictly for legitimate educational and computational purposes:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>To maintain, optimize, and diagnose numerical simulation rendering performance.</li>
              <li>To communicate regarding bug reports, equation clarifications, or syllabus partnerships.</li>
              <li>To detect and prevent technical abuse, automated scraping, or denial-of-service attempts.</li>
              <li>To understand which academic engineering disciplines (electrical, mechanical, civil, etc.) demand expanded simulation modules.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              3. Google Analytics & Third-Party Services
            </h3>
            <p>
              We implement Google Analytics via <span className="font-mono text-cyan-300">gtag.js</span>. Google may process 
              anonymized telemetry on servers located in the United States or other international jurisdictions. 
              We do not enable Google Analytics Advertising Features, remarketing audiences, or cross-device user tracking.
            </p>
            <p>
              You can opt out of Google Analytics measurement at any time via our{' '}
              <button onClick={onNavigateToCookiePolicy} className="text-cyan-300 underline font-mono">
                Cookie Policy Preference Manager
              </button>{' '}
              or by using the official Google Analytics Opt-out Browser Add-on.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              4. Your Data Rights (GDPR & CCPA/CPRA)
            </h3>
            <p>
              Depending on your location (such as the European Economic Area, United Kingdom, or California), you hold statutory rights regarding your personal information:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong className="text-white">Right of Access:</strong> You can request a copy of any personal data we hold about you.</li>
              <li><strong className="text-white">Right to Rectification:</strong> You may request correction of inaccurate contact records.</li>
              <li><strong className="text-white">Right to Erasure:</strong> You may request deletion of previous email correspondences from our inbox.</li>
              <li><strong className="text-white">Right to Object / Restrict Processing:</strong> You may object to telemetry collection at any time.</li>
              <li><strong className="text-white">Non-Discrimination:</strong> We do not restrict simulator access or alter platform functionality if you choose to exercise privacy rights.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold text-white">5. Data Retention</h3>
            <p>
              Contact form inquiries and associated email records are retained only as long as necessary to address the 
              pedagogical or technical inquiry, or as required by standard record-keeping practices. Aggregated Google Analytics 
              event data is retained for standard periods (typically 2 to 14 months) per Google Analytics 4 data retention configuration.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold text-white">6. Data Protection Officer & Privacy Inquiries</h3>
            <p>
              For any questions, rights requests, or feedback regarding our privacy practices, please contact our designated privacy lead:
            </p>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] space-y-1">
              <div>PRIVACY CONTACT: Anil Sharma</div>
              <div>EMAIL: <a href="mailto:0808miracle@gmail.com" className="text-cyan-300 underline">0808miracle@gmail.com</a></div>
              <div>LINKEDIN: <a href="https://www.linkedin.com/in/toanilsharma/" target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline">linkedin.com/in/toanilsharma</a></div>
            </div>
          </section>

        </div>

        {/* Links Strip */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <button onClick={onNavigateToCookiePolicy} className="hover:text-cyan-300 underline">
            Manage Cookie Preferences &rarr;
          </button>
          <button onClick={onNavigateToContact} className="hover:text-cyan-300 underline">
            Submit Privacy Request &rarr;
          </button>
        </div>

      </div>
    </div>
  );
};
