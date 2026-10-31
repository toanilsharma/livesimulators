import React from 'react';
import { 
  GraduationCap, 
  Presentation, 
  Briefcase, 
  CheckCircle2, 
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { AudiencePersona } from '../types';

interface AudiencePillarsProps {
  onExploreForAudience: (persona: AudiencePersona) => void;
}

export const AudiencePillars: React.FC<AudiencePillarsProps> = ({ onExploreForAudience }) => {
  const audiences = [
    {
      id: 'students' as AudiencePersona,
      title: 'Engineering Students',
      subtitle: 'Undergraduate & Graduate Coursework',
      icon: <GraduationCap className="w-5 h-5 text-cyan-400" />,
      accentColor: '#06b6d4',
      badge: 'Academic Intuition & Pre-Labs',
      headline: 'Replace formula memorization with real-time physical understanding.',
      description:
        'Struggling with abstract second-order differential equations in circuits, feedback stability, or fluid dynamics? LiveSimulators lets you sweep parameters and inspect continuous waveform transients live, transforming textbook theory into permanent engineering intuition.',
      keyCapabilities: [
        {
          title: 'Pre-Lab Hardware Verification',
          desc: 'Calculate resonant poles, filter cut-off frequencies, and damping factors analytically, then verify them on virtual instruments before entering physical university labs.',
        },
        {
          title: 'Complex s-Plane & Fourier Mastery',
          desc: 'Observe directly how moving poles and zeros on the complex Laplace s-plane dictates time-domain transient ringing and frequency-domain harmonic peaking.',
        },
        {
          title: 'Hazard-Free Boundary Sweeping',
          desc: 'Safely explore 0Ω dead shorts, high-frequency cutoff limits, and resonance catastrophes without risking burnt components or lab hazards.',
        },
        {
          title: 'Instant Mobile & Laptop Access',
          desc: '100% browser native. No MATLAB, PSPICE, or CAD license required. Runs smoothly on any standard laptop, tablet, or smartphone.',
        },
      ],
      recommendedSimulators: [
        { name: 'RLC Resonant Circuit', path: '/simulator/rlc-resonance' },
        { name: 'Fourier Harmonics', path: '/simulator/fourier-series' },
        { name: 'Sallen-Key Filter', path: '/simulator/sallen-key-filter' },
      ],
      ctaLabel: 'Explore Coursework Labs',
      targetSectionId: 'departments-hub',
    },
    {
      id: 'educators' as AudiencePersona,
      title: 'Professors & Faculty',
      subtitle: 'Universities, Colleges & STEM Labs',
      icon: <Presentation className="w-5 h-5 text-emerald-400" />,
      accentColor: '#10b981',
      badge: 'Lecture Projection & LMS Embeds',
      headline: 'Elevate lectures with live interactive demonstrations on the projector screen.',
      description:
        'Static textbook slides fail to explain dynamic transient physics. Professors project LiveSimulators during lectures, manipulate parameters live in response to student "what if" questions, and assign discovery-based pre-lab homework.',
      keyCapabilities: [
        {
          title: 'Live Lecture Hall Demonstrations',
          desc: 'Manipulate circuit component values and PID gains live in front of the lecture hall to provide immediate, visual answers to student inquiries.',
        },
        {
          title: 'Seamless Canvas & Moodle Embeds',
          desc: 'Embed full interactive simulation workbenches directly into university LMS portals (Canvas, Blackboard, Moodle) via responsive embed iframes.',
        },
        {
          title: 'Standard Textbook Alignment',
          desc: 'Simulations map directly to canonical engineering syllabi and textbooks: Alexander & Sadiku, Hayt & Kemmerly, Ogata, and Beer & Johnston.',
        },
        {
          title: 'Flipped Classroom Pre-Labs',
          desc: 'Assign discovery modules where students deduce critical damping resistance or phase margins by sweeping simulation dials before physical lab sessions.',
        },
      ],
      recommendedSimulators: [
        { name: '3-Phase Synchronous Motor', path: '/simulator/three-phase-motor' },
        { name: 'RF Transmission Line', path: '/simulator/transmission-line' },
        { name: 'Buck-Boost Regulator', path: '/simulator/buck-boost-converter' },
      ],
      ctaLabel: 'Explore Teaching Tools',
      targetSectionId: 'departments-hub',
    },
    {
      id: 'engineers' as AudiencePersona,
      title: 'Practicing Engineers',
      subtitle: 'Industrial Design, Utilities & EPCs',
      icon: <Briefcase className="w-5 h-5 text-amber-400" />,
      accentColor: '#f59e0b',
      badge: 'First-Principles Sanity Checking',
      headline: 'Rapid qualitative checks before committing to deep SPICE or FEA netlists.',
      description:
        'Industrial engineers, hardware designers, and systems architects use LiveSimulators for rapid topology evaluation, switching surge intuition, and cross-functional technical training across engineering teams.',
      keyCapabilities: [
        {
          title: 'Rapid Topology Prototyping',
          desc: 'Quickly evaluate continuous vs. discontinuous inductor conduction (CCM vs DCM) and switching ripple before configuring complex SPICE schematics.',
        },
        {
          title: 'Transient Surge Intuition',
          desc: 'Gain qualitative physical insight into inductive flyback, transmission line reflection coefficients, and arc flash energy distribution.',
        },
        {
          title: 'Cross-Discipline Team Training',
          desc: 'A visual, intuitive training tool for junior engineers, field technicians, and application specialists to understand core power systems and controls.',
        },
        {
          title: 'Time-Series Matrix CSV Export',
          desc: 'Export high-density node voltage, current, and pressure time-series matrices directly to CSV for Python NumPy / SciPy and MATLAB processing.',
        },
      ],
      recommendedSimulators: [
        { name: 'Power Systems Lab', path: '/industrial-labs/power-systems-lab' },
        { name: 'SafeOps UPS Suite', path: '/industrial-labs/safeops-ups' },
        { name: 'ElectroLive Safety', path: '/industrial-labs/electrolive-electrical-safety' },
      ],
      ctaLabel: 'Explore Industrial Pro',
      targetSectionId: 'industrial-labs',
    },
  ];

  return (
    <section 
      id="audiences" 
      className="py-16 sm:py-20 lg:py-24 border-b border-slate-800/80 bg-[#060a12] relative scroll-mt-20 overflow-hidden"
      aria-label="Target Engineering Audiences and Workflows"
    >
      {/* Subtle Background Glow */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[400px] bg-cyan-950/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-[1720px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 relative z-10 space-y-12 sm:space-y-16">
        
        {/* =================================================================== */}
        {/* SECTION HEADER (CENTERED WITH BALANCED MARGINS) */}
        {/* =================================================================== */}
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs uppercase tracking-wider mx-auto">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>MULTI-AUDIENCE ENGINEERING VALUE • ECOSYSTEM GUIDE</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            Built for the Entire Engineering Ecosystem
          </h2>

          <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed font-sans max-w-3xl mx-auto">
            From undergraduate university students establishing first-principles intuition to professors 
            delivering dynamic lecture demonstrations and industrial consultants conducting rapid topology sanity checks.
          </p>
        </div>

        {/* =================================================================== */}
        {/* SIMULTANEOUS 3-COLUMN TYPOGRAPHIC ECOSYSTEM GUIDE (REPLACES NESTED CARDS) */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12 pt-4 border-t border-slate-800/80">
          {audiences.map((aud) => (
            <article 
              key={aud.id}
              className="flex flex-col justify-between space-y-6"
            >
              {/* Persona Header & Badge */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-9 h-9 rounded-xl bg-slate-900 border flex items-center justify-center shrink-0 shadow-sm"
                      style={{ borderColor: `${aud.accentColor}60` }}
                    >
                      {aud.icon}
                    </div>
                    <div>
                      <h3 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
                        {aud.title}
                      </h3>
                      <div className="text-[11px] font-mono text-slate-400">
                        {aud.subtitle}
                      </div>
                    </div>
                  </div>

                  <span 
                    className="text-[9.5px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded border shrink-0 hidden sm:inline-block"
                    style={{ 
                      backgroundColor: `${aud.accentColor}15`, 
                      borderColor: `${aud.accentColor}40`,
                      color: aud.accentColor 
                    }}
                  >
                    {aud.badge}
                  </span>
                </div>

                <div className="text-sm font-display font-bold text-cyan-200">
                  {aud.headline}
                </div>

                <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                  {aud.description}
                </p>
              </div>

              {/* Plain-Text Capability Checklist (No nested cards, clean list items) */}
              <div className="space-y-3 pt-2 flex-1">
                <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                  Key Capabilities &amp; Workflows:
                </div>

                <ul className="space-y-2.5 text-xs text-slate-300 font-sans">
                  {aud.keyCapabilities.map((cap, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 
                        className="w-3.5 h-3.5 shrink-0 mt-0.5" 
                        style={{ color: aud.accentColor }} 
                      />
                      <div>
                        <span className="font-semibold text-white block sm:inline mr-1">
                          {cap.title}:
                        </span>
                        <span className="text-slate-400 leading-relaxed">
                          {cap.desc}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Recommendations & Direct Action CTA */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3">
                <div className="text-[10.5px] font-mono text-slate-400">
                  <span className="text-slate-500 uppercase block mb-1">Recommended Starting Labs:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {aud.recommendedSimulators.map((rec, i) => (
                      <a
                        key={i}
                        href={rec.path}
                        className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 hover:border-cyan-500/50 text-[10.5px] transition-colors"
                      >
                        {rec.name}
                      </a>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onExploreForAudience(aud.id);
                    const el = document.getElementById(aud.targetSectionId);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all bg-slate-900 hover:bg-slate-850 text-white border border-slate-700 hover:border-cyan-500/60 shadow-sm"
                >
                  <span>{aud.ctaLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              </div>

            </article>
          ))}
        </div>

      </div>
    </section>
  );
};
