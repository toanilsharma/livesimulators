import React from 'react';
import { 
  FileCheck2, 
  ArrowLeft, 
  Scale, 
  CheckCircle2, 
  ShieldCheck, 
  BookOpen, 
  AlertOctagon, 
  Copyright,
  Mail
} from 'lucide-react';

interface TermsPageProps {
  onBackToHome: () => void;
  onNavigateToDisclaimer: () => void;
  onNavigateToContact: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({
  onBackToHome,
  onNavigateToDisclaimer,
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
            id="terms-back-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Simulators</span>
          </button>
          <span className="text-slate-700">/</span>
          <span className="text-xs font-mono text-cyan-400">LEGAL & COMPLIANCE</span>
          <span className="text-slate-700">/</span>
          <span className="text-xs font-mono text-slate-300">TERMS OF SERVICE</span>
        </div>

        {/* Document Header */}
        <div className="border-b border-slate-800 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-3">
            <FileCheck2 className="w-3.5 h-3.5" />
            PLATFORM ACCESS & USAGE AGREEMENT
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
            Terms of Service
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
            <span>EFFECTIVE DATE: September 2026</span>
            <span>•</span>
            <span>OPEN EDUCATIONAL PLATFORM STANDARD</span>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8 text-xs text-slate-300 leading-relaxed font-sans">
          
          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              1. Platform Purpose & Educational License
            </h3>
            <p>
              LiveSimulators is provided as a publicly accessible, interactive educational resource. 
              We grant you a non-exclusive, non-transferable, revocable license to access, run, interact with, 
              and display our engineering simulators in private study, university classrooms, research lectures, 
              and professional continuing education demonstrations.
            </p>
            <p>
              You are warmly encouraged to cite LiveSimulators in course syllabi, academic presentations, and 
              lecture slides with attribution to <span className="font-mono text-cyan-300">LiveSimulators.com</span>.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-amber-400" />
              2. Acceptable Use & Conduct Restrictions
            </h3>
            <p>
              In using LiveSimulators, you agree not to engage in any activity that impairs, degrades, or abuses the platform:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400 font-mono text-[11px]">
              <li>You may not launch automated distributed Denial of Service (DDoS) attacks or high-frequency automated scraping scripts that exhaust hosting bandwidth.</li>
              <li>You may not attempt to reverse-engineer, inject malicious scripts, or alter client-side solvers for harmful purposes.</li>
              <li>You may not frame, iframe, or republish the entire website behind paywalls without express written consent from the founder.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Copyright className="w-4 h-4 text-emerald-400" />
              3. Intellectual Property Rights
            </h3>
            <p>
              The platform's distinctive user interface, custom canvas rendering algorithms, animated differential solver 
              implementations, pedagogical layout, and brand identity are the intellectual property of LiveSimulators and its 
              creator, Anil Sharma.
            </p>
            <p>
              The underlying fundamental mathematical equations and physics laws (e.g. Kirchhoff's Voltage Law, Navier-Stokes, 
              Hooke's Law, Mohr's Circle, Sallen-Key transfer functions) belong to the shared scientific heritage of humanity 
              and reside in the public domain.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-purple-400" />
              4. Disclaimer of Warranties & Limitation of Liability
            </h3>
            <p>
              All simulators are provided on an "AS IS" and "AS AVAILABLE" basis without warranty of any kind. 
              LiveSimulators does not guarantee that calculations will be error-free or suitable for commercial fabrication. 
              Please review our full{' '}
              <button onClick={onNavigateToDisclaimer} className="text-cyan-300 underline font-mono">
                Engineering Simulation Disclaimer
              </button>{' '}
              for comprehensive details.
            </p>
            <p>
              Under no circumstance shall LiveSimulators, its founder, or contributors be held liable for any damages arising 
              from the reliance upon simulation results.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold text-white">5. Modifications to Terms</h3>
            <p>
              We reserve the right to revise or update these Terms of Service periodically to reflect platform expansions 
              or regulatory requirements. Changes become effective immediately upon posting to this URL. Continued use of 
              the website constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold text-white">6. Inquiries & Contact</h3>
            <p>
              For licensing inquiries, institutional partnerships, or clarifications regarding these terms, please contact:
            </p>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] space-y-1">
              <div>LEGAL & PARTNERSHIPS: Anil Sharma</div>
              <div>EMAIL: <a href="mailto:0808miracle@gmail.com" className="text-cyan-300 underline">0808miracle@gmail.com</a></div>
              <div>LINKEDIN: <a href="https://www.linkedin.com/in/toanilsharma/" target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline">linkedin.com/in/toanilsharma</a></div>
            </div>
          </section>

        </div>

        {/* Links Strip */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <button onClick={onNavigateToDisclaimer} className="hover:text-cyan-300 underline">
            Review Disclaimer &rarr;
          </button>
          <button onClick={onNavigateToContact} className="hover:text-cyan-300 underline">
            Contact Engineering Team &rarr;
          </button>
        </div>

      </div>
    </div>
  );
};
