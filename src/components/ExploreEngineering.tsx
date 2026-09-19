import React, { useState } from 'react';
import { 
  Zap, 
  Cog, 
  Sliders, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Activity, 
  Flame, 
  Gauge, 
  Droplets, 
  Cpu, 
  Radio, 
  Layers,
  ChevronRight,
  Info,
  CheckCircle2,
  X,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { MathView } from './MathView';

interface ExploreEngineeringProps {
  onExploreElectrical: () => void;
  onExploreInstrumentation?: () => void;
  onExploreCivil?: () => void;
  onOpenTopic?: (topic: string) => void;
}

interface DisciplineData {
  id: 'electrical' | 'mechanical' | 'instrumentation' | 'civil';
  symbol: string;
  title: string;
  tagline: string;
  description: string;
  status: 'active' | 'in_development';
  statusBadge: string;
  accentClass: {
    border: string;
    borderHover: string;
    badge: string;
    iconBg: string;
    iconText: string;
    glow: string;
    tagBorder: string;
    tagBg: string;
    tagText: string;
    btn: string;
    btnText: string;
  };
  topics: string[];
  upcomingHighlights?: {
    name: string;
    equation: string;
    focus: string;
  }[];
}

export const ExploreEngineering: React.FC<ExploreEngineeringProps> = ({
  onExploreElectrical,
  onExploreInstrumentation,
  onExploreCivil,
  onOpenTopic,
}) => {
  const [selectedPreview, setSelectedPreview] = useState<DisciplineData | null>(null);

  const disciplines: DisciplineData[] = [
    {
      id: 'electrical',
      symbol: '⚡',
      title: 'ELECTRICAL ENGINEERING',
      tagline: 'Power Generation, Grid Protection & Dynamics',
      description:
        'Explore how electric energy flows, oscillates, and stabilizes across power grids, switching semiconductors, and protection relays.',
      status: 'active',
      statusBadge: 'Interactive Models Live Now',
      accentClass: {
        border: 'border-blue-900/60',
        borderHover: 'hover:border-cyan-500/70',
        badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/30',
        iconBg: 'bg-blue-950/80 border-blue-800/60',
        iconText: 'text-cyan-400',
        glow: 'group-hover:shadow-[0_0_35px_rgba(6,182,212,0.15)]',
        tagBorder: 'border-slate-800 hover:border-cyan-500/40',
        tagBg: 'bg-slate-900/70 hover:bg-slate-800/80',
        tagText: 'text-slate-300 hover:text-cyan-300',
        btn: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.25)]',
        btnText: 'text-slate-950'
      },
      topics: [
        'Power systems',
        'Protection',
        'Arc flash',
        'Electrical safety',
        'Power electronics',
        'UPS systems',
        'Grounding',
        'Fault scenarios'
      ]
    },
    {
      id: 'instrumentation',
      symbol: '🎛',
      title: 'INSTRUMENTATION & CONTROL',
      tagline: 'Process Dynamics, Sensors & Closed Loops',
      description:
        'Tune feedback loops, calibrate differential sensors, and diagnose valve deadband without putting physical industrial plants at risk.',
      status: 'active',
      statusBadge: 'Interactive Models Live Now',
      accentClass: {
        border: 'border-emerald-900/60',
        borderHover: 'hover:border-emerald-500/70',
        badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30',
        iconBg: 'bg-emerald-950/80 border-emerald-800/60',
        iconText: 'text-emerald-400',
        glow: 'group-hover:shadow-[0_0_35px_rgba(16,185,129,0.15)]',
        tagBorder: 'border-slate-800 hover:border-emerald-500/40',
        tagBg: 'bg-slate-900/70 hover:bg-slate-800/80',
        tagText: 'text-slate-300 hover:text-emerald-300',
        btn: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold',
        btnText: 'text-slate-950'
      },
      topics: [
        'Flow measurement',
        'Pressure',
        'Level',
        'Temperature',
        'Control valves',
        'PID control',
        'Process dynamics',
        'Instrumentation faults'
      ]
    },
    {
      id: 'civil',
      symbol: '🏛',
      title: 'CIVIL & STRUCTURAL',
      tagline: 'Mechanics of Materials, Bridges & Seismic Dynamics',
      description:
        'Analyze Euler-Bernoulli beam deflection and shear, moving Warren/Pratt truss bridge loads, base-isolated earthquake dynamics, and Mohr-Coulomb soil shear slip.',
      status: 'active',
      statusBadge: 'Interactive Models Live Now',
      accentClass: {
        border: 'border-pink-900/60',
        borderHover: 'hover:border-pink-500/70',
        badge: 'bg-pink-950/80 text-pink-300 border-pink-500/30',
        iconBg: 'bg-pink-950/80 border-pink-800/60',
        iconText: 'text-pink-400',
        glow: 'group-hover:shadow-[0_0_35px_rgba(236,72,153,0.15)]',
        tagBorder: 'border-slate-800 hover:border-pink-500/40',
        tagBg: 'bg-slate-900/70 hover:bg-slate-800/80',
        tagText: 'text-slate-300 hover:text-pink-300',
        btn: 'bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold shadow-[0_0_20px_rgba(236,72,153,0.25)]',
        btnText: 'text-slate-950'
      },
      topics: [
        'Beam bending SFD/BMD',
        'Euler-Bernoulli deflection',
        'Warren & Pratt trusses',
        'Method of joints',
        'Seismic base isolation',
        'ASCE 7-22 story drift',
        'Mohr’s circle of stress',
        'Mohr-Coulomb shear failure'
      ]
    },
    {
      id: 'mechanical',
      symbol: '⚙',
      title: 'MECHANICAL ENGINEERING',
      tagline: 'Fluid Dynamics, Rotating Plant & Tribology',
      description:
        'Witness kinematic force transfer, transient hydraulic shock, cavitation voids, and thermodynamic stress propagation in real time.',
      status: 'in_development',
      statusBadge: 'More Simulations in Development',
      accentClass: {
        border: 'border-amber-900/40',
        borderHover: 'hover:border-amber-500/60',
        badge: 'bg-amber-950/70 text-amber-300 border-amber-500/30',
        iconBg: 'bg-amber-950/80 border-amber-800/60',
        iconText: 'text-amber-400',
        glow: 'group-hover:shadow-[0_0_35px_rgba(245,158,11,0.12)]',
        tagBorder: 'border-slate-800 hover:border-amber-500/40',
        tagBg: 'bg-slate-900/70 hover:bg-slate-800/80',
        tagText: 'text-slate-300 hover:text-amber-300',
        btn: 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-slate-700',
        btnText: 'text-slate-200'
      },
      topics: [
        'Fluid systems',
        'Pumps',
        'Cavitation',
        'Water hammer',
        'Bearings',
        'Gearboxes',
        'Lubrication',
        'Mechanical failure scenarios'
      ],
      upcomingHighlights: [
        {
          name: 'Joukowsky Water Hammer Shockwave',
          equation: 'ΔP = ρ · c · Δv',
          focus: 'Rapid valve closure transient elasticity & pipe burst modeling'
        },
        {
          name: 'Centrifugal Pump NPSH & Cavitation Voids',
          equation: 'NPSH_a > NPSH_r + 0.5m',
          focus: 'Vapor bubble collapse dynamics & impeller pitting erosion'
        },
        {
          name: 'Epicyclic Planetary Gear Mesh & Vibration',
          equation: 'i = 1 + (Z_ring / Z_sun)',
          focus: 'Tooth contact stress, backlash, and elastohydrodynamic oil film'
        }
      ]
    }
  ];

  const handleAction = (discipline: DisciplineData) => {
    if (discipline.id === 'electrical') {
      onExploreElectrical();
    } else if (discipline.id === 'instrumentation' && onExploreInstrumentation) {
      onExploreInstrumentation();
    } else if (discipline.id === 'civil' && onExploreCivil) {
      onExploreCivil();
    } else {
      setSelectedPreview(discipline);
    }
  };

  return (
    <section id="explore-engineering" className="py-20 lg:py-28 border-b border-slate-800/90 bg-[#060a12] relative overflow-hidden">
      {/* Precision grid background texture */}
      <div className="absolute inset-0 bg-tech-grid opacity-25 pointer-events-none" />

      {/* Controlled ambient discipline lighting */}
      <div className="absolute top-1/4 left-10 w-[420px] h-[420px] bg-blue-950/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-amber-950/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[420px] h-[420px] bg-emerald-950/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-14">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-700 bg-slate-900/80 text-slate-300 text-xs font-mono">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>DISCIPLINE SPECTRUM</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Explore Engineering Through Simulation
          </h2>

          <p className="text-slate-300 text-base sm:text-lg font-sans leading-relaxed">
            Dive into core physical domains where complex differential equations, high-voltage transients, 
            and fluid dynamics are translated into transparent, real-time visual workbenches.
          </p>
        </div>

        {/* The Four Premium Panels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {disciplines.map((d) => (
            <div
              key={d.id}
              className={`group relative rounded-2xl border ${d.accentClass.border} ${d.accentClass.borderHover} bg-slate-900/80 backdrop-blur-md p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${d.accentClass.glow}`}
            >
              <div className="space-y-6">
                
                {/* Panel Top Header: Symbol, Title & Status */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    {/* Icon container */}
                    <div className={`w-12 h-12 rounded-xl ${d.accentClass.iconBg} border flex items-center justify-center text-xl shadow-inner`}>
                      <span>{d.symbol}</span>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono border ${d.accentClass.badge} flex items-center gap-1.5`}>
                      {d.status === 'active' ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      ) : (
                        <Clock className="w-3 h-3 text-slate-400" />
                      )}
                      <span>{d.statusBadge}</span>
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="font-display text-xl font-bold text-white tracking-tight group-hover:text-slate-100 transition-colors">
                      {d.title}
                    </h3>
                    <p className="text-xs font-mono text-slate-400 pt-1">
                      {d.tagline}
                    </p>
                  </div>
                </div>

                {/* Short Description */}
                <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                  {d.description}
                </p>

                {/* Technical Topics Tag Cloud */}
                <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                    Core Curricula & Practical Scenarios:
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {d.topics.map((topic, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (d.id === 'electrical') {
                            onExploreElectrical();
                          } else if (d.id === 'instrumentation' && onExploreInstrumentation) {
                            onExploreInstrumentation();
                          } else if (d.id === 'civil' && onExploreCivil) {
                            onExploreCivil();
                          } else if (onOpenTopic) {
                            onOpenTopic(topic);
                          } else {
                            setSelectedPreview(d);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-md text-xs font-mono border ${d.accentClass.tagBorder} ${d.accentClass.tagBg} ${d.accentClass.tagText} transition-colors text-left`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upcoming Simulator Preview Callout (for Mechanical & Instrumentation) */}
                {d.status === 'in_development' && d.upcomingHighlights && (
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5 font-mono text-[11px]">
                    <div className="text-slate-400 font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Upcoming Solver Preview:</span>
                    </div>
                    <div className="text-slate-300 truncate">
                      {d.upcomingHighlights[0].name}
                    </div>
                    <div className="text-slate-400 text-[11px] overflow-x-auto custom-scrollbar py-0.5">
                      <span className="text-slate-500 mr-1">Discretizing:</span>
                      <MathView math={d.upcomingHighlights[0].equation} />
                    </div>
                  </div>
                )}

              </div>

              {/* Action Button: Explore [discipline] → */}
              <div className="pt-6 mt-6 border-t border-slate-800/90">
                <button
                  onClick={() => handleAction(d)}
                  className={`w-full py-3 px-4 rounded-xl font-display font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${d.accentClass.btn}`}
                  id={`explore-panel-btn-${d.id}`}
                >
                  <span>
                    Explore {d.id === 'electrical' ? 'Electrical' : d.id === 'civil' ? 'Civil & Structural' : d.id === 'instrumentation' ? 'Instrumentation' : 'Mechanical'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {d.status === 'in_development' && (
                  <div className="text-[10px] font-mono text-center text-slate-500 pt-2">
                    Explore what is coming • Numerical models in development
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Detail Modal for Upcoming Mechanical / Instrumentation Simulators */}
      {selectedPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div 
            className="w-full max-w-2xl my-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-lg">
                  {selectedPreview.symbol}
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-white">
                    {selectedPreview.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedPreview.statusBadge}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPreview(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-xs text-slate-300">
              
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
                  Engineering Roadmap Notice:
                </div>
                <p className="font-sans leading-relaxed text-slate-300 text-xs">
                  We maintain strict fidelity to analytical boundary conditions and numerical stability. 
                  Below are the selected mathematical models currently undergoing Runge-Kutta 4th-order (RK4) discretization for this discipline.
                </p>
              </div>

              {/* Upcoming Simulator Highlights */}
              <div className="space-y-3">
                <div className="text-white font-display font-semibold text-xs tracking-wider uppercase">
                  Models Currently in Development:
                </div>

                {selectedPreview.upcomingHighlights?.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-slate-200 font-bold text-xs">
                      <span>{item.name}</span>
                      <span className="text-[10px] text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">
                        In Discretization
                      </span>
                    </div>
                    <div className="text-[11px] text-cyan-300 font-mono overflow-x-auto custom-scrollbar py-0.5">
                      <div className="text-slate-400 text-[10px] mb-0.5">Governing Formulation:</div>
                      <MathView math={item.equation} />
                    </div>
                    <p className="text-slate-400 font-sans text-xs">
                      {item.focus}
                    </p>
                  </div>
                ))}
              </div>

              {/* Topics Planned */}
              <div className="space-y-2">
                <div className="text-slate-400 uppercase tracking-wider text-[11px]">
                  Planned Laboratory Topologies:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPreview.topics.map((t, i) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-slate-800/70 text-slate-300 border border-slate-700/60 text-[11px]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">No simulated or placeholder data released</span>
              <button
                onClick={() => setSelectedPreview(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
