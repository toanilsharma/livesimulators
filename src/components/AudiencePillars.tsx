import React, { useState } from 'react';
import { 
  GraduationCap, 
  Presentation, 
  Briefcase, 
  CheckCircle2, 
  ArrowRight,
  BookOpen,
  Laptop,
  Layers,
  Wrench
} from 'lucide-react';
import { AudiencePersona } from '../types';

interface AudiencePillarsProps {
  onExploreForAudience: (persona: AudiencePersona) => void;
}

export const AudiencePillars: React.FC<AudiencePillarsProps> = ({ onExploreForAudience }) => {
  const [activePersona, setActivePersona] = useState<AudiencePersona>('students');

  const audiences = [
    {
      id: 'students' as AudiencePersona,
      title: 'Engineering Students',
      subtitle: 'Undergraduate & Graduate Coursework',
      icon: <GraduationCap className="w-5 h-5 text-cyan-400" />,
      badge: 'Academic Intuition',
      headline: 'Replace formula memorization with real-time physical understanding.',
      description: 'Struggling with abstract differential equations in circuit theory, signals & systems, or fluid dynamics? LiveSimulators lets you adjust parameters and watch the waveforms react, making homework and exam preparation tangible.',
      keyCapabilities: [
        { title: 'Interactive Homework Pre-Labs', desc: 'Verify your calculated pole frequencies, resonance peaks, and component values before physical lab sessions.' },
        { title: 'Visual Laplace & Fourier Mastery', desc: 'Directly see how pole-zero coordinates on the complex s-plane dictate time-domain transient ringing.' },
        { title: 'Safe Extreme Parameter Sweeping', desc: 'Explore what happens at 0Ω short circuits, high frequency limits, and resonance without risk of component failure.' },
        { title: 'Instant Mobile & Laptop Access', desc: 'No MATLAB, PSPICE, or CAD license required. Runs instantly in any standard web browser.' }
      ],
      recommendedSimulators: ['RLC Resonant Circuit', 'Fourier Series Harmonics', 'Sallen-Key Active Filter']
    },
    {
      id: 'educators' as AudiencePersona,
      title: 'Professors & Faculty',
      subtitle: 'Universities, Colleges & STEM Labs',
      icon: <Presentation className="w-5 h-5 text-emerald-400" />,
      badge: 'Lecture & Lab Instruction',
      headline: 'Elevate lectures with live interactive demonstrations on the projector screen.',
      description: 'Static textbook slides fail to explain dynamic concepts. With LiveSimulators, professors can project live simulations during lectures, ask students to predict parameter outcomes, and create interactive lab assignments.',
      keyCapabilities: [
        { title: 'Live Lecture Projections', desc: 'Manipulate circuit and control parameters live in front of the lecture hall to answer "what if" student questions in seconds.' },
        { title: 'Zero IT Installation Overhead', desc: 'No software installation tickets, no complex virtual desktops, and no student platform compatibility headaches.' },
        { title: 'Curriculum-Aligned Topologies', desc: 'Simulations follow canonical textbook engineering syllabi (Hayt & Kemmerly, Sedra & Smith, Ogata, Oppenheim).' },
        { title: 'Flipped Classroom & Lab Homework', desc: 'Assign discovery-based pre-lab modules where students determine critical damping resistance by sweeping simulation dials.' }
      ],
      recommendedSimulators: ['3-Phase Synchronous Motor', 'RF Transmission Line', 'Buck-Boost Regulator']
    },
    {
      id: 'engineers' as AudiencePersona,
      title: 'Practicing Engineers',
      subtitle: 'Industrial Design, R&D & Training',
      icon: <Briefcase className="w-5 h-5 text-amber-400" />,
      badge: 'Industrial Sanity Checking',
      headline: 'Rapid first-principles sanity checks before deep SPICE or CAD simulations.',
      description: 'Industrial engineers, hardware designers, and systems architects use LiveSimulators for fast topology comparisons, transient surge intuition, and training cross-functional engineering teams on core physics.',
      keyCapabilities: [
        { title: 'Rapid Topology Prototyping', desc: 'Evaluate inductor ripple current (CCM vs DCM) or filter roll-off in seconds before building full schematic netlists.' },
        { title: 'Transient Surge Intuition', desc: 'Gain rapid qualitative insight into inductive kickback, switching transients, and impedance mismatch reflection coefficients.' },
        { title: 'Internal Technical Training', desc: 'Train junior engineers, technicians, and application specialists on power electronic and RF principles.' },
        { title: 'Time-Series Data Export', desc: 'Export node voltage and current matrices directly to CSV for Python NumPy / SciPy post-processing.' }
      ],
      recommendedSimulators: ['Buck-Boost Regulator', 'Transmission Line VSWR', '3-Phase AC Grid Dynamics']
    }
  ];

  const current = audiences.find((a) => a.id === activePersona) || audiences[0];

  return (
    <section id="audiences" className="py-16 lg:py-24 border-b border-slate-800 bg-[#060a12] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-wider uppercase">
            <Layers className="w-3.5 h-3.5" />
            <span>Multi-Audience Engineering Value</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Built for the Entire Engineering Ecosystem
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            From sophomore university students establishing first-principles intuition to professors 
            conducting live lecture demonstrations and industrial engineers sanity-checking design topologies.
          </p>
        </div>

        {/* 3 Audience Selector Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          {audiences.map((aud) => {
            const isSelected = aud.id === activePersona;
            return (
              <button
                key={aud.id}
                onClick={() => setActivePersona(aud.id)}
                className={`p-5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-500/70 shadow-lg shadow-cyan-950/30'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                    {aud.icon}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {aud.badge}
                  </span>
                </div>
                <div className="font-display text-base font-bold text-white">
                  {aud.title}
                </div>
                <div className="text-xs font-mono text-slate-400 mt-1">
                  {aud.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Persona Deep Showcase Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="space-y-2 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <span>TAILORED ENGINEERING WORKFLOW</span>
                <span>•</span>
                <span>{current.subtitle}</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-white">
                {current.headline}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed max-w-4xl">
                {current.description}
              </p>
            </div>

            {/* 4 Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {current.keyCapabilities.map((cap, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 space-y-1.5"
                >
                  <div className="flex items-center gap-2 font-display text-sm font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{cap.title}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-6">
                    {cap.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Recommended Simulators for this persona */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>RECOMMENDED STARTING SIMULATORS:</span>
                <div className="flex flex-wrap gap-1.5">
                  {current.recommendedSimulators.map((rec, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 text-[11px]"
                    >
                      {rec}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onExploreForAudience(current.id)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs font-mono transition-colors shrink-0"
              >
                <span>Launch {current.title} Workbench</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
