import React, { useState } from 'react';
import { 
  Compass, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  X, 
  CheckCircle2, 
  Info, 
  ExternalLink,
  Sliders,
  Activity,
  Layers
} from 'lucide-react';
import { FEATURED_ELECTRICAL_SIMULATORS } from '../data/simulators';
import { SimulatorItem } from '../types';
import { MathView } from './MathView';

interface ConceptDiscoveryProps {
  onLaunchSimulator: (simulator: SimulatorItem) => void;
  onExploreSection?: (sectionId: string) => void;
}

interface ConceptItem {
  id: string;
  title: string;
  symbol: string;
  tagline: string;
  status: 'available' | 'coming_soon';
  simulatorId?: string;
  sectionId?: string;
  disciplineCategory: 'Electrical' | 'Mechanical' | 'Control' | 'Instrumentation';
  equationPreview?: string;
  details: string;
  accent: {
    border: string;
    borderHover: string;
    glow: string;
    tag: string;
    iconText: string;
    btn: string;
  };
}

export const ConceptDiscovery: React.FC<ConceptDiscoveryProps> = ({
  onLaunchSimulator,
  onExploreSection,
}) => {
  const [selectedUpcoming, setSelectedUpcoming] = useState<ConceptItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const concepts: ConceptItem[] = [
    {
      id: 'electrical-faults',
      title: 'Electrical Faults',
      symbol: '⚡',
      tagline: 'Short-circuit transients, phase collapse & sudden inrush currents.',
      status: 'available',
      simulatorId: 'rlc-resonance',
      disciplineCategory: 'Electrical',
      equationPreview: 'i(t) = I_{max} \\sin(\\omega t - \\theta) + [I_0 - I_{max}\\sin(-\\theta)]e^{-t/\\tau}',
      details: 'Visualize how sub-transient and transient impedances dictate fault current magnitudes during sudden ground faults, and see how system damping resists explosive overcurrents.',
      accent: {
        border: 'border-cyan-900/40',
        borderHover: 'hover:border-cyan-400/80',
        glow: 'group-hover:shadow-[0_0_25px_rgba(6,182,212,0.18)]',
        tag: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/30',
        iconText: 'text-cyan-400',
        btn: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold'
      }
    },
    {
      id: 'arc-flash',
      title: 'Arc Flash',
      symbol: '🔥',
      tagline: 'Incident energy radiation, boundary distances & clearing times.',
      status: 'coming_soon',
      disciplineCategory: 'Electrical',
      equationPreview: 'E = 4.184 \\cdot C_f \\cdot E_n \\cdot (t / 0.2) \\cdot (610^x / D^x)',
      details: 'Based on IEEE 1584 formulations: explore how arcing fault currents release thermal incident energy (cal/cm²), and test how reducing relay trip time drastically lowers PPE hazard category.',
      accent: {
        border: 'border-rose-900/30',
        borderHover: 'hover:border-rose-500/60',
        glow: 'group-hover:shadow-[0_0_25px_rgba(244,63,94,0.12)]',
        tag: 'bg-rose-950/60 text-rose-300 border-rose-800/40',
        iconText: 'text-rose-400',
        btn: 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }
    },
    {
      id: 'ups-batteries',
      title: 'UPS & Batteries',
      symbol: '🔋',
      tagline: 'Double-conversion inverters, battery discharge kinetics & transfer time.',
      status: 'coming_soon',
      disciplineCategory: 'Electrical',
      equationPreview: 'V_{cell}(t) = E_0 - R_{int} i(t) - \\frac{K \\cdot Q}{Q - it} \\cdot i^*',
      details: 'Examine online vs. line-interactive topologies, static bypass switch commutations, DC bus ripple, and electrochemical Peukert capacity derating under heavy instantaneous loads.',
      accent: {
        border: 'border-amber-900/30',
        borderHover: 'hover:border-amber-500/60',
        glow: 'group-hover:shadow-[0_0_25px_rgba(245,158,11,0.12)]',
        tag: 'bg-amber-950/60 text-amber-300 border-amber-800/40',
        iconText: 'text-amber-400',
        btn: 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }
    },
    {
      id: 'power-electronics',
      title: 'Power Electronics',
      symbol: '〰',
      tagline: 'PWM switching regulators, volt-second balance & inductor ripple.',
      status: 'available',
      simulatorId: 'buck-boost-converter',
      disciplineCategory: 'Electrical',
      equationPreview: 'V_{out} = -V_{in} \\frac{D}{1 - D}, \\quad \\Delta I_L = \\frac{V_{in} D}{L f_{sw}}',
      details: 'Experiment with switching semiconductors (MOSFET/IGBT), continuous vs. discontinuous conduction modes (CCM/DCM), inductive flyback energy dump, and synchronous rectification.',
      accent: {
        border: 'border-sky-900/40',
        borderHover: 'hover:border-sky-400/80',
        glow: 'group-hover:shadow-[0_0_25px_rgba(56,189,248,0.18)]',
        tag: 'bg-sky-950/80 text-sky-300 border-sky-500/30',
        iconText: 'text-sky-400',
        btn: 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold'
      }
    },
    {
      id: 'protection-systems',
      title: 'Protection Systems',
      symbol: '🛡',
      tagline: 'Inverse-time overcurrent (50/51) curves, zone coordination & trip margins.',
      status: 'coming_soon',
      disciplineCategory: 'Electrical',
      equationPreview: 't(I) = \\text{TDS} \\cdot \\left[ \\frac{A}{(I / I_s)^p - 1} + B \\right]',
      details: 'Interact with ANSI/IEEE standard inverse, very inverse, and extremely inverse trip characteristics to see how time-dial settings prevent nuisance tripping while protecting upstream transformers.',
      accent: {
        border: 'border-indigo-900/30',
        borderHover: 'hover:border-indigo-500/60',
        glow: 'group-hover:shadow-[0_0_25px_rgba(99,102,241,0.12)]',
        tag: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/40',
        iconText: 'text-indigo-400',
        btn: 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }
    },
    {
      id: 'power-systems',
      title: 'Power Systems',
      symbol: '🌐',
      tagline: '3-phase AC synchronous grid stability, power factor & reactive VARs.',
      status: 'available',
      simulatorId: 'three-phase-ac',
      disciplineCategory: 'Electrical',
      equationPreview: 'P = \\frac{E V}{X_s} \\sin(\\delta), \\quad Q = \\frac{V}{X_s}[E\\cos(\\delta) - V]',
      details: 'Trace how balanced 120° phase-shifted currents synthesize a revolving circular stator magnetic field, and investigate what happens to rotor torque angle δ when heavy mechanical loads are coupled.',
      accent: {
        border: 'border-teal-900/40',
        borderHover: 'hover:border-teal-400/80',
        glow: 'group-hover:shadow-[0_0_25px_rgba(20,184,166,0.18)]',
        tag: 'bg-teal-950/80 text-teal-300 border-teal-500/30',
        iconText: 'text-teal-400',
        btn: 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold'
      }
    },
    {
      id: 'fluid-systems',
      title: 'Fluid Systems',
      symbol: '💧',
      tagline: 'Joukowsky water hammer waves, cavitation voids & Bernoulli dynamics.',
      status: 'coming_soon',
      disciplineCategory: 'Mechanical',
      equationPreview: '\\Delta P = \\rho \\cdot c \\cdot \\Delta v, \\quad \\text{NPSH}_a = \\frac{P_0 - P_v}{\\rho g} + h_s - h_f',
      details: 'Simulate transient pressure shockwaves from fast-closing gate valves, vapor pocket collapse, and pump suction head limits that cause severe cavitation pitting erosion.',
      accent: {
        border: 'border-blue-900/30',
        borderHover: 'hover:border-blue-500/60',
        glow: 'group-hover:shadow-[0_0_25px_rgba(59,130,246,0.12)]',
        tag: 'bg-blue-950/60 text-blue-300 border-blue-800/40',
        iconText: 'text-blue-400',
        btn: 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }
    },
    {
      id: 'rotating-equipment',
      title: 'Rotating Equipment',
      symbol: '⚙',
      tagline: 'Rotor inertia, electromagnetic torque counter-forces & mechanical slip.',
      status: 'available',
      simulatorId: 'three-phase-ac',
      disciplineCategory: 'Mechanical',
      equationPreview: 'T_{mech} = \\frac{3}{2} p \\cdot \\lambda_m \\cdot I_q, \\quad \\omega_{sync} = \\frac{120 f}{P}',
      details: 'Explore mechanical torque-speed curves, synchronous pull-out limits, bearing counter-torque, and rotor inertia response during grid frequency disturbances.',
      accent: {
        border: 'border-orange-900/40',
        borderHover: 'hover:border-orange-400/80',
        glow: 'group-hover:shadow-[0_0_25px_rgba(249,115,22,0.18)]',
        tag: 'bg-orange-950/80 text-orange-300 border-orange-500/30',
        iconText: 'text-orange-400',
        btn: 'bg-orange-500 hover:bg-orange-400 text-slate-950 font-semibold'
      }
    },
    {
      id: 'process-control',
      title: 'Process Control',
      symbol: '🎛',
      tagline: 'Closed-loop PID tuning, Ziegler-Nichols step response & anti-windup.',
      status: 'available',
      sectionId: 'instrumentation-lab',
      disciplineCategory: 'Control',
      equationPreview: 'u(t) = K_p e(t) + K_i \\int_0^t e(\\tau)d\\tau + K_d \\frac{de(t)}{dt}',
      details: 'Adjust proportional gain, integral reset rate, and derivative filtering to balance rise time against overshoot, and see how actuator saturation leads to integrator windup.',
      accent: {
        border: 'border-emerald-900/40',
        borderHover: 'hover:border-emerald-400/80',
        glow: 'group-hover:shadow-[0_0_25px_rgba(16,185,129,0.18)]',
        tag: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30',
        iconText: 'text-emerald-400',
        btn: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold'
      }
    },
    {
      id: 'instrumentation',
      title: 'Instrumentation',
      symbol: '📡',
      tagline: '4-20mA current loops, differential pressure transmitters & RTDs.',
      status: 'available',
      sectionId: 'instrumentation-lab',
      disciplineCategory: 'Instrumentation',
      equationPreview: 'I_{loop} = 4\\text{mA} + 16\\text{mA} \\cdot \\frac{\\text{PV} - \\text{LRV}}{\\text{URV} - \\text{LRV}}',
      details: 'Diagnose common industrial transmitter issues: loop burden resistance, 2-wire vs 4-wire power supply drops, ground loop voltage shifts, and thermocouple cold-junction drift.',
      accent: {
        border: 'border-violet-900/40',
        borderHover: 'hover:border-violet-400/80',
        glow: 'group-hover:shadow-[0_0_25px_rgba(139,92,246,0.18)]',
        tag: 'bg-violet-950/80 text-violet-300 border-violet-500/30',
        iconText: 'text-violet-400',
        btn: 'bg-violet-500 hover:bg-violet-400 text-slate-950 font-semibold'
      }
    }
  ];

  const handleTileClick = (concept: ConceptItem) => {
    if (concept.sectionId && onExploreSection) {
      onExploreSection(concept.sectionId);
      return;
    }
    if (concept.status === 'available' && concept.simulatorId) {
      const sim = FEATURED_ELECTRICAL_SIMULATORS.find(s => s.id === concept.simulatorId);
      if (sim) {
        onLaunchSimulator(sim);
        return;
      }
    }
    // For concepts coming soon or without direct mapping: show preview info modal
    setSelectedUpcoming(concept);
  };

  const filteredConcepts = filterCategory === 'all' 
    ? concepts 
    : concepts.filter(c => c.disciplineCategory.toLowerCase() === filterCategory.toLowerCase());

  return (
    <section id="concept-discovery" className="py-20 lg:py-28 border-b border-slate-800/90 bg-[#070c16] relative overflow-hidden">
      {/* Background Tech Texture */}
      <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 right-10 w-[500px] h-[500px] bg-cyan-950/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-amber-950/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-700 bg-slate-900/80 text-cyan-300 text-xs font-mono">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>CONCEPT-FIRST DISCOVERY</span>
          </div>

          {/* Exact Heading Requested */}
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            What Do You Want to Understand?
          </h2>

          <p className="text-slate-300 text-base sm:text-lg font-sans leading-relaxed">
            Instead of searching through textbook indices or product catalogs, choose an engineering phenomenon. 
            Jump directly into verified visual models or explore mathematical formulations in development.
          </p>

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            {[
              { id: 'all', label: 'All Concepts (10)' },
              { id: 'electrical', label: '⚡ Electrical' },
              { id: 'mechanical', label: '⚙ Mechanical' },
              { id: 'control', label: '🎛 Control' },
              { id: 'instrumentation', label: '📡 Instrumentation' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterCategory(f.id)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                  filterCategory === f.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 10 Concept Tiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
          {filteredConcepts.map((concept) => {
            const isLive = concept.status === 'available';

            return (
              <div
                key={concept.id}
                onClick={() => handleTileClick(concept)}
                className={`group relative rounded-2xl border ${concept.accent.border} ${concept.accent.borderHover} bg-slate-900/80 backdrop-blur-sm p-5 flex flex-col justify-between transition-all duration-300 cursor-pointer ${concept.accent.glow} hover:-translate-y-1`}
              >
                {/* Visual Header */}
                <div className="space-y-3.5">
                  
                  {/* Top row: Symbol, Category & Status Tag */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                      <span>{concept.symbol}</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${concept.accent.tag} flex items-center gap-1`}>
                      {isLive ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                          <span>Active Model</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-2.5 h-2.5 text-slate-400" />
                          <span>Coming soon</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="font-display text-base font-bold text-white tracking-tight group-hover:text-cyan-200 transition-colors">
                      {concept.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-sans line-clamp-2 mt-1 leading-relaxed">
                      {concept.tagline}
                    </p>
                  </div>

                  {/* Micro Dynamic Engineering Visual on Hover */}
                  <div className="h-12 w-full rounded-lg bg-slate-950/90 border border-slate-800/80 p-2 overflow-hidden flex items-center justify-center relative">
                    
                    {/* Visual 1: Waveforms (for electrical/power electronics) */}
                    {concept.id === 'electrical-faults' && (
                      <div className="w-full h-full flex items-center justify-between px-1">
                        <div className="w-full flex items-center gap-0.5 h-6">
                          {[3, 8, 14, 22, 10, 4, 18, 12, 6, 2].map((val, idx) => (
                            <span 
                              key={idx} 
                              className="flex-1 bg-cyan-500/70 rounded-full transition-all duration-300 group-hover:scale-y-125"
                              style={{ height: `${val * 2}px` }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Visual 2: Arc Flash spark */}
                    {concept.id === 'arc-flash' && (
                      <div className="flex items-center gap-2 text-rose-400 text-xs font-mono">
                        <span className="animate-ping text-rose-500">⚡</span>
                        <span className="text-[10px] text-slate-400 group-hover:text-rose-300 transition-colors">IEEE 1584 Arc</span>
                      </div>
                    )}

                    {/* Visual 3: Battery Charge */}
                    {concept.id === 'ups-batteries' && (
                      <div className="w-full px-2">
                        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5">
                          <div className="h-full bg-amber-500 rounded-full w-3/4 group-hover:w-full transition-all duration-700" />
                        </div>
                        <div className="text-[9px] font-mono text-slate-500 flex justify-between pt-1">
                          <span>Inverter Online</span>
                          <span>100%</span>
                        </div>
                      </div>
                    )}

                    {/* Visual 4: Power Electronics PWM pulses */}
                    {concept.id === 'power-electronics' && (
                      <div className="w-full h-full flex items-center justify-center gap-1 font-mono text-[10px] text-sky-400">
                        <span className="w-2 h-6 bg-sky-500/80 group-hover:h-7 transition-all" />
                        <span className="w-4 h-1 bg-sky-900" />
                        <span className="w-3 h-6 bg-sky-500/80 group-hover:h-7 transition-all" />
                        <span className="w-4 h-1 bg-sky-900" />
                        <span className="w-2 h-6 bg-sky-500/80 group-hover:h-7 transition-all" />
                      </div>
                    )}

                    {/* Visual 5: Protection inverse curve */}
                    {concept.id === 'protection-systems' && (
                      <div className="w-full h-full flex items-center justify-center font-mono text-[10px] text-indigo-400">
                        <span className="text-slate-400 group-hover:text-indigo-300 transition-colors">50/51 Curve: t(I)</span>
                      </div>
                    )}

                    {/* Visual 6: Rotating field circles */}
                    {concept.id === 'power-systems' && (
                      <div className="relative flex items-center justify-center w-8 h-8 rounded-full border border-teal-500/40 group-hover:rotate-180 transition-transform duration-700">
                        <div className="w-2 h-2 rounded-full bg-teal-400" />
                        <div className="absolute top-0 w-1 h-1 rounded-full bg-teal-300" />
                      </div>
                    )}

                    {/* Visual 7: Fluid water droplets */}
                    {concept.id === 'fluid-systems' && (
                      <div className="w-full flex items-center justify-around text-blue-400 text-xs">
                        <span className="group-hover:translate-x-2 transition-transform">💧</span>
                        <span className="text-[10px] font-mono text-slate-400">ΔP = ρ·c·Δv</span>
                      </div>
                    )}

                    {/* Visual 8: Rotating Equipment gear */}
                    {concept.id === 'rotating-equipment' && (
                      <div className="flex items-center gap-2 font-mono text-orange-400 text-xs">
                        <span className="group-hover:rotate-90 transition-transform duration-500 text-base">⚙</span>
                        <span className="text-[10px] text-slate-400">3000 RPM</span>
                      </div>
                    )}

                    {/* Visual 9: PID Step response */}
                    {concept.id === 'process-control' && (
                      <div className="w-full px-2 flex items-center justify-center text-[10px] font-mono text-emerald-400">
                        <span className="text-slate-400 group-hover:text-emerald-300 transition-colors">Step Target: PV → SP</span>
                      </div>
                    )}

                    {/* Visual 10: 4-20mA Transmitter */}
                    {concept.id === 'instrumentation' && (
                      <div className="w-full px-2 flex items-center justify-between font-mono text-[10px] text-violet-400">
                        <span>4mA</span>
                        <div className="flex-1 mx-2 h-1 bg-violet-950 rounded">
                          <div className="w-2/3 h-full bg-violet-500 rounded group-hover:w-5/6 transition-all duration-500" />
                        </div>
                        <span>20mA</span>
                      </div>
                    )}

                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  {isLive ? (
                    <div className="w-full flex items-center justify-between font-mono">
                      <span className="text-cyan-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        <span>Explore Simulator</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[10px] text-slate-500 font-sans">Interactive</span>
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-between text-slate-400 font-mono text-[11px]">
                      <span className="text-slate-400 group-hover:text-slate-300 flex items-center gap-1">
                        <span>Coming soon</span>
                        <Info className="w-3 h-3 text-slate-500" />
                      </span>
                      <span className="text-[10px] text-slate-600">Roadmap</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Upcoming Concept Detail Modal (Prevents Broken Links) */}
      {selectedUpcoming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div 
            className="w-full max-w-xl my-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-lg">
                  {selectedUpcoming.symbol}
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-white">
                    {selectedUpcoming.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Discipline: {selectedUpcoming.disciplineCategory} • Model in Development
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUpcoming(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs text-slate-300">
              
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-amber-400 uppercase tracking-wider text-[11px] font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Interactive Simulator Coming Soon</span>
                </div>
                <p className="font-sans leading-relaxed text-slate-300 text-xs">
                  {selectedUpcoming.details}
                </p>
              </div>

              {selectedUpcoming.equationPreview && (
                <div className="space-y-1.5">
                  <div className="text-slate-400 text-[11px]">
                    Governing Equation Under Discretization:
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs overflow-x-auto custom-scrollbar">
                    <MathView math={selectedUpcoming.equationPreview} block />
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 font-sans">
                💡 <strong className="text-slate-300">Try an active simulator now:</strong> While this specific model is undergoing numerical validation, you can test our active <em>Power Electronics</em> or <em>3-Phase Motor Dynamics</em> workbenches immediately.
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  setSelectedUpcoming(null);
                  // Launch flagship simulator
                  onLaunchSimulator(FEATURED_ELECTRICAL_SIMULATORS[0]);
                }}
                className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>Launch Active RLC Simulator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setSelectedUpcoming(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
              >
                Dismiss
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
