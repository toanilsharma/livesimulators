import React from 'react';
import { 
  Activity, 
  ArrowLeft, 
  Cpu, 
  Layers, 
  Compass, 
  Award, 
  Zap, 
  BookOpen, 
  CheckCircle2, 
  Users, 
  ArrowRight,
  ExternalLink,
  Linkedin,
  Mail
} from 'lucide-react';

interface AboutPageProps {
  onBackToHome: () => void;
  onNavigateToContact: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ 
  onBackToHome, 
  onNavigateToContact 
}) => {
  return (
    <div className="min-h-screen bg-[#080d16] text-slate-100 font-sans selection:bg-cyan-500/25 selection:text-cyan-200 relative overflow-x-hidden w-full max-w-full">
      {/* Background Decorators */}
      <div className="absolute inset-0 bg-tech-grid opacity-10 pointer-events-none" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors bg-slate-900/80 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg group"
            id="about-back-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Simulators</span>
          </button>
          <span className="text-slate-700">/</span>
          <span className="text-xs font-mono text-cyan-400">ABOUT PLATFORM</span>
        </div>

        {/* Hero Section */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-4">
            <Activity className="w-3.5 h-3.5" />
            THE NUMERICAL PEDAGOGY REVOLUTION
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white tracking-tight leading-tight">
            Engineering isn't meant to be memorized. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">
              It's meant to be seen.
            </span>
          </h1>
          <p className="mt-6 text-slate-300 text-base sm:text-lg leading-relaxed font-sans">
            LiveSimulators was created with a single uncompromising mission: bridge the massive canyon 
            between abstract differential equations on a lecture chalkboard and the vivid physical 
            realities of modern engineering systems.
          </p>
        </div>

        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-2">First-Principles Solvers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No pre-rendered videos or hardcoded animations. Every waveform, stress tensor, and thermal 
              gradient is computed live using 4th-Order Runge-Kutta (RK4) integration and exact physical constants.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-2">Float64 Client-Side Execution</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant feedback with zero server round-trip latency. Parameter sliders trigger 60 FPS live canvas 
              updates directly in your browser without requiring installs, specialized hardware, or plugins.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-2">Standard Engineering Rigor</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mapped directly to international standards (IEEE, ASME, AISC, IEC, SI-CODATA) and verified against 
              analytical closed-form boundary solutions and university benchmark proofs.
            </p>
          </div>
        </div>

        {/* Detailed Narrative Section */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 sm:p-10 mb-16 space-y-8">
          <div className="max-w-3xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-4">
              Why Interactive Engineering?
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Traditional engineering education suffers from a profound pedagogy flaw: students spend hundreds 
              of hours calculating partial fractions, Laplace transforms, and boundary value integrals without ever 
              developing an intuitive feel for how real systems behave when variables swing.
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">
              What happens when damping ratio drops below unity? Why does frequency response spike at resonance? 
              How does changing shear center deform an asymmetric beam? When you adjust a slider on LiveSimulators, 
              the math comes alive immediately. You don't just calculate <span className="font-mono text-cyan-400">damping ratio ζ</span>; 
              you see the energy ring through the system.
            </p>
          </div>

          {/* Key Audience Impact */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-800/80">
            <div>
              <div className="text-xs font-mono text-cyan-400 mb-1">01. FOR UNDERGRADUATES</div>
              <h4 className="font-display font-bold text-white text-base mb-1">Pass Exams with Intuition</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Transform abstract homework formulas into mental models that stick permanently during competitive exams and interviews.
              </p>
            </div>

            <div>
              <div className="text-xs font-mono text-emerald-400 mb-1">02. FOR PROFESSORS</div>
              <h4 className="font-display font-bold text-white text-base mb-1">Live Lecture Demonstrations</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Project live physical simulations during lectures to instantly answer "what if" student questions in real time.
              </p>
            </div>

            <div>
              <div className="text-xs font-mono text-amber-400 mb-1">03. FOR PRACTICING ENGINEERS</div>
              <h4 className="font-display font-bold text-white text-base mb-1">Rapid Sanity Verification</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Quick first-principles boundary checks before committing to heavy, multi-hour FEA/SPICE simulation runs.
              </p>
            </div>
          </div>
        </div>

        {/* Founder & Computational Lead Card */}
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950 p-8 sm:p-10 mb-16 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-display font-black text-2xl shadow-[0_0_20px_rgba(6,182,212,0.25)]">
                AS
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-white">Anil Sharma</h3>
                <p className="text-xs font-mono text-cyan-400">Founder & Principal Computational Engineer</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/in/toanilsharma/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-mono flex items-center gap-2 transition-colors"
                id="about-linkedin-link"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn Profile</span>
                <ExternalLink className="w-3 h-3 text-blue-400" />
              </a>
              <button
                onClick={onNavigateToContact}
                className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-display font-bold flex items-center gap-2 transition-colors"
                id="about-contact-btn"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Message Founder</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-xs text-slate-300 leading-relaxed max-w-3xl space-y-3">
            <p>
              Anil Sharma founded LiveSimulators to empower the global engineering community with 
              unfettered, world-class interactive educational tools. With an intense focus on computational 
              fidelity, clean mathematical pedagogy, and responsive client-side architecture, Anil leads 
              the modeling and implementation of every simulator on the platform.
            </p>
            <p className="text-slate-400">
              For syllabus partnerships, custom simulation models, or research collaborations, reach out via 
              email at <a href="mailto:0808miracle@gmail.com" className="text-cyan-300 underline font-mono">0808miracle@gmail.com</a>.
            </p>
          </div>
        </div>

        {/* Bottom CTA Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div>
            <h4 className="font-display font-bold text-white text-base">Ready to experience engineering in action?</h4>
            <p className="text-xs text-slate-400 mt-0.5">Explore our comprehensive library of live simulators across all engineering disciplines.</p>
          </div>
          <button
            onClick={onBackToHome}
            className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-display font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all flex-shrink-0"
          >
            <span>Launch Simulators</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
