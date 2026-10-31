import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  Terminal, 
  BookOpen, 
  Cpu, 
  DownloadCloud, 
  GraduationCap, 
  ShieldCheck 
} from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export const HOME_FAQ_DATA: FaqItem[] = [
  {
    category: 'Computational Engine',
    question: 'How does LiveSimulators achieve real-time 60 FPS numerical solving without cloud servers?',
    answer:
      'LiveSimulators executes 100% client-side inside your browser engine. Continuous governing differential equations are solved using a high-precision 4th-order Runge-Kutta (RK4) integration algorithm running either on dedicated background Web Workers or synchronous rendering loops. Calculated state vector matrices pipe directly to hardware-accelerated HTML5 Canvas and WebGL shaders within a strict 16.66ms per-frame budget, eliminating network latency and cloud round-trips entirely.',
  },
  {
    category: 'Formulations & Reference Literature',
    question: 'How are mathematical models developed and cross-referenced with engineering literature?',
    answer:
      'Every simulator is independently developed from classical first-principles physics, textbook derivations, and published university engineering curricula (such as topics cataloged in electrical, mechanical, and thermal reference literature). Physical equations incorporate real-world phenomena—including parasitic resistances, magnetic saturation, and mechanical damping—for authentic qualitative behavior. LiveSimulators is an independent educational platform and is not affiliated with, endorsed by, or certified by any standards body.',
  },
  {
    category: 'Academic LMS Integration',
    question: 'Can university faculty embed LiveSimulators into Canvas, Moodle, or Blackboard?',
    answer:
      'Yes. Every workbench provides a dedicated lightweight embed URL (/embed/:simulatorId) formatted specifically for standard responsive iframes. Professors can embed live simulations directly into lecture slides, LMS course portals, pre-lab assignments, and flipped-classroom modules without requiring students to purchase software licenses or install plugins.',
  },
  {
    category: 'Data Export & Lab Correlation',
    question: 'Can telemetry data be exported to MATLAB, Python, or physical laboratory reports?',
    answer:
      'Yes. Virtual instruments (oscilloscopes, power analyzers, Bode magnitude plotters) feature one-click CSV matrix export. Users can download complete, high-density time-series data vectors containing timestamped voltages, currents, rotor speeds, or flow rates for post-processing in Python NumPy/SciPy, MATLAB, or physical laboratory bench correlation.',
  },
  {
    category: 'Comparison with SPICE & Simulink',
    question: 'How does LiveSimulators compare with tools like SPICE or MATLAB Simulink?',
    answer:
      'SPICE and Simulink are offline batch-processing tools that require software installation, complex syntax netlists, and licensed environments. LiveSimulators provides instantaneous qualitative physical intuition with zero barrier to entry: as you move dials and sliders, systems react live at 60 FPS. It is specifically designed to build foundational physical understanding before committing to deep schematic netlists.',
  },
  {
    category: 'Licensing & Platform Access',
    question: 'Is software installation or payment required to use the academic simulators?',
    answer:
      'No. All Stage 1 Academic Fundamental simulators (over 35+ verified workbenches covering Electrical, Mechanical, Instrumentation, Civil, Chemical, and Semiconductor physics) are completely free, open-access, and run in any modern web browser across Windows, macOS, Linux, iOS, and Android.',
  },
];

export const HomeFaq: React.FC = () => {
  const [openIndexes, setOpenIndexes] = useState<Record<number, boolean>>({
    0: true, // First item open by default for immediate preview
    1: false,
    2: false,
  });

  const toggleFaq = (index: number) => {
    setOpenIndexes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <section
      id="faq"
      className="py-16 sm:py-20 lg:py-24 border-b border-slate-800/80 bg-[#070c16] relative scroll-mt-20 overflow-hidden w-full"
      aria-label="Frequently Asked Technical Questions"
    >
      {/* Background Ambience */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[350px] bg-cyan-950/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Screen-fitting fluid container */}
      <div className="w-full max-w-[1720px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 relative z-10 space-y-10 sm:space-y-12">
        
        {/* SECTION HEADER (CENTERED) */}
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs uppercase tracking-wider mx-auto">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>KNOWLEDGE BASE • FREQUENTLY ASKED TECHNICAL QUESTIONS</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            Frequently Asked Technical Questions
          </h2>

          <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed font-sans max-w-3xl mx-auto">
            Detailed answers regarding client-side numerical solvers, LMS integration for university instruction, 
            academic engineering literature referencing, and laboratory telemetry data export.
          </p>
        </div>

        {/* 2-COLUMN BALANCED SCREEN-FITTING FAQ ACCORDION (NO WASTED SIDE SPACE) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-2">
          {HOME_FAQ_DATA.map((faq, index) => {
            const isOpen = !!openIndexes[index];

            return (
              <div 
                key={index}
                className="border-b border-slate-800/80 py-4 sm:py-5 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-start justify-between gap-4 text-left group cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="space-y-1 pr-2">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold block">
                      {faq.category}
                    </span>
                    <h3 className="font-display text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors tracking-tight">
                      {faq.question}
                    </h3>
                  </div>

                  <ChevronDown 
                    className={`w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-transform duration-200 shrink-0 mt-1 ${
                      isOpen ? 'rotate-180 text-cyan-400' : ''
                    }`} 
                  />
                </button>

                {isOpen && (
                  <div className="mt-3 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed animate-fadeIn">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* BOTTOM CONTACT CALLOUT STRIP */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-slate-400 border-t border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Have a custom engineering equation or university syllabus request?</span>
          </div>

          <a
            href="/contact"
            className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 hover:underline transition-all shrink-0"
          >
            <span>Contact Engineering Desk →</span>
          </a>
        </div>

      </div>
    </section>
  );
};
