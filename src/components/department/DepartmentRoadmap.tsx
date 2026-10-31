import React from 'react';
import { BookOpen, ArrowRight, ChevronRight, CheckCircle2, Sparkles } from 'lucide-react';
import { DisciplineId, SimulatorItem } from '../../types';
import { ALL_AVAILABLE_SIMULATORS } from '../../data/simulators';

interface DepartmentRoadmapProps {
  departmentId: DisciplineId;
  accentColor: string;
  onLaunchSimulator: (sim: SimulatorItem) => void;
}

interface RoadmapStep {
  id: string;
  step: string;
  name: string;
  badge: string;
  desc: string;
  accent: string;
}

interface RoadmapTrack {
  title: string;
  summary: string;
  steps: RoadmapStep[];
}

export const DEPARTMENT_ROADMAPS: Record<DisciplineId, RoadmapTrack> = {
  electrical: {
    title: 'Circuit Theory & Wave Dynamics Lab Sequence',
    summary: 'A progressive sequence advancing from 2nd-order RLC resonance and active biquad filtering to harmonic spectral synthesis and high-frequency transmission line reflections.',
    steps: [
      {
        id: 'rlc-resonance',
        step: '01',
        name: 'RLC Circuit Resonance',
        badge: '2nd-Order ODE',
        desc: 'Canonical series/parallel RLC frequency response, quality factor Q, and transient decaying step response.',
        accent: 'border-cyan-800/60 hover:border-cyan-500 text-cyan-400',
      },
      {
        id: 'sallen-key-filter',
        step: '02',
        name: 'Sallen-Key Active Filter',
        badge: 'Active Biquad',
        desc: 'Op-amp frequency selectivity, Butterworth vs Chebyshev peaking, and -40 dB/dec roll-off.',
        accent: 'border-indigo-800/60 hover:border-indigo-500 text-indigo-400',
      },
      {
        id: 'fourier-synthesis',
        step: '03',
        name: 'Fourier Series Synthesis',
        badge: 'Harmonic Theory',
        desc: 'Harmonic decomposition of square and triangle waves, Gibbs phenomenon, and IEEE 519 THD.',
        accent: 'border-pink-800/60 hover:border-pink-500 text-pink-400',
      },
      {
        id: 'transmission-line',
        step: '04',
        name: 'RF Transmission Line',
        badge: 'Wave Propagation',
        desc: 'Distributed telegrapher equations, impedance mismatch reflection coefficient Γ, and VSWR standing waves.',
        accent: 'border-amber-800/60 hover:border-amber-500 text-amber-400',
      },
    ],
  },
  mechanical: {
    title: 'Mechanical & Thermal Dynamics Sequence',
    summary: 'A progressive sequence connecting single-degree-of-freedom vibrations to multi-bar linkage kinematics, machine gearing, and thermodynamic steam cycles.',
    steps: [
      {
        id: 'harmonic-oscillator',
        step: '01',
        name: 'Harmonic Oscillator',
        badge: 'Vibrations & SDOF',
        desc: 'Mass-spring-damper resonance, dynamic magnification factor M(ω), and 90° phase shift.',
        accent: 'border-amber-800/60 hover:border-amber-500 text-amber-400',
      },
      {
        id: 'four-bar-mechanism',
        step: '02',
        name: '4-Bar Mechanism',
        badge: 'Planar Kinematics',
        desc: 'Grashof mobility criterion, Freudenstein loop closure, and transmission angle tracking.',
        accent: 'border-orange-800/60 hover:border-orange-500 text-orange-400',
      },
      {
        id: 'spur-gear-mesh',
        step: '03',
        name: 'Spur Gear Mesh',
        badge: 'Machine Elements',
        desc: 'Conjugate involute tooth action, pitch line velocity, and AGMA 2001 contact ratio.',
        accent: 'border-emerald-800/60 hover:border-emerald-500 text-emerald-400',
      },
      {
        id: 'rankine-cycle',
        step: '04',
        name: 'Rankine Cycle',
        badge: 'Thermodynamics',
        desc: 'Steam boiler heat addition, non-isentropic turbine expansion, and thermal efficiency on T-s diagrams.',
        accent: 'border-cyan-800/60 hover:border-cyan-500 text-cyan-400',
      },
    ],
  },
  civil: {
    title: 'Structural Mechanics & Earthquake Engineering Track',
    summary: 'A progressive sequence from linear elastic beam flexure and Mohr’s circle principal stress transformations to truss load equilibrium and seismic base isolation.',
    steps: [
      {
        id: 'beam-deflection',
        step: '01',
        name: 'Euler-Bernoulli Beam Deflection',
        badge: 'Elastic Flexure',
        desc: '4th-order differential beam deflection w(x), shear diagrams, and peak bending moment under concentrated loads.',
        accent: 'border-rose-800/60 hover:border-rose-500 text-rose-400',
      },
      {
        id: 'mohr-circle',
        step: '02',
        name: "Mohr's Circle Stress Transform",
        badge: 'Continuum Mechanics',
        desc: '2D stress element rotation, principal stresses σ₁ and σ₂, maximum in-plane shear τ_max, and Tresca yield criteria.',
        accent: 'border-orange-800/60 hover:border-orange-500 text-orange-400',
      },
      {
        id: 'truss-bridge',
        step: '03',
        name: 'Warren Truss Bridge',
        badge: 'Static Equilibrium',
        desc: 'Method of joints equilibrium ∑F=0, tension vs compression member forces, and live truck wheel rolling loads.',
        accent: 'border-amber-800/60 hover:border-amber-500 text-amber-400',
      },
      {
        id: 'seismic-isolation',
        step: '04',
        name: 'Seismic Base Isolation',
        badge: 'Earthquake Dynamics',
        desc: 'Ground motion acceleration spectrum, lead-rubber elastomeric bearings, and structural drift attenuation.',
        accent: 'border-violet-800/60 hover:border-violet-500 text-violet-400',
      },
    ],
  },
  control: {
    title: 'Feedback Control & Process Automation Sequence',
    summary: 'A progressive sequence mastering closed-loop PID error dynamics, frequency-domain Bode stability margins, control valve sizing, and 4-20mA smart transmitter loops.',
    steps: [
      {
        id: 'pid-controller',
        step: '01',
        name: 'Closed-Loop PID Controller',
        badge: 'ISA Standard Form',
        desc: 'Proportional, integral, and derivative gain tuning, anti-windup clamping, and transient settling time minimization.',
        accent: 'border-emerald-800/60 hover:border-emerald-500 text-emerald-400',
      },
      {
        id: 'bode-plot',
        step: '02',
        name: 'Bode & Nyquist Stability',
        badge: 'Frequency Response',
        desc: 'Logarithmic magnitude and phase roll-off, gain margin (GM), and phase margin (PM) for closed-loop stability.',
        accent: 'border-teal-800/60 hover:border-teal-500 text-teal-400',
      },
      {
        id: 'control-valve',
        step: '03',
        name: 'Control Valve Trim Dynamics',
        badge: 'ISA-75.01 Sizing',
        desc: 'Equal percentage vs linear valve trim Cv flow capacity, choked cavitation limits, and Reynolds recovery factor.',
        accent: 'border-cyan-800/60 hover:border-cyan-500 text-cyan-400',
      },
      {
        id: 'current-loop',
        step: '04',
        name: '4-20mA Smart Transmitter Loop',
        badge: 'NAMUR NE 43',
        desc: 'Two-wire telemetry loop resistance burden, compliance voltage drop, and HART frequency shift keying superimposition.',
        accent: 'border-sky-800/60 hover:border-sky-500 text-sky-400',
      },
    ],
  },
  chemical: {
    title: 'Reaction Kinetics & Separation Process Pathway',
    summary: 'A progressive pathway through non-isothermal CSTR thermal runaway, batch to PFR conversion profiles, TEMA heat exchanger rating, and McCabe-Thiele distillation stages.',
    steps: [
      {
        id: 'cstr-kinetics',
        step: '01',
        name: 'Non-Isothermal CSTR',
        badge: 'Reaction Kinetics',
        desc: 'Exothermic Arrhenius reaction rate, heat generation vs cooling curve intersections, and thermal runaway prevention.',
        accent: 'border-violet-800/60 hover:border-violet-500 text-violet-400',
      },
      {
        id: 'batch-pfr',
        step: '02',
        name: 'Batch to Plug-Flow Reactor (PFR)',
        badge: 'Spatial Kinetics',
        desc: 'Differential spatial conversion dX/dV along tubular reactors with variable density expansion and pressure drops.',
        accent: 'border-purple-800/60 hover:border-purple-500 text-purple-400',
      },
      {
        id: 'heat-exchanger',
        step: '03',
        name: 'TEMA Shell & Tube Exchanger',
        badge: 'Heat Transfer',
        desc: 'Logarithmic mean temperature difference (LMTD), overall heat transfer coefficient U, and baffle shell pressure drops.',
        accent: 'border-indigo-800/60 hover:border-indigo-500 text-indigo-400',
      },
      {
        id: 'distillation-column',
        step: '04',
        name: 'McCabe-Thiele Distillation',
        badge: 'Separation Processes',
        desc: 'Equilibrium vapor-liquid operating lines, minimum reflux ratio R_min, and theoretical equilibrium stage stepping.',
        accent: 'border-pink-800/60 hover:border-pink-500 text-pink-400',
      },
    ],
  },
  physics: {
    title: 'Quantum & Semiconductor Physics Progression',
    summary: 'A progressive progression from P-N junction band bending and nanoscale MOSFET inversion to wide-bandgap SiC power switching and quantum resonant tunneling.',
    steps: [
      {
        id: 'pn-junction',
        step: '01',
        name: 'P-N Junction Band Bending',
        badge: 'Solid-State Physics',
        desc: 'Poisson-Boltzmann electrostatic band bending, built-in barrier V_bi, and bias-dependent depletion region modulation.',
        accent: 'border-sky-800/60 hover:border-sky-500 text-sky-400',
      },
      {
        id: 'mosfet-channel',
        step: '02',
        name: 'Nanoscale MOSFET Inversion',
        badge: 'BSIM4 Transport',
        desc: 'Gate-oxide capacitance C_ox, surface inversion potential 2φ_F, velocity saturation, and pinch-off channel dynamics.',
        accent: 'border-blue-800/60 hover:border-blue-500 text-blue-400',
      },
      {
        id: 'sic-switching',
        step: '03',
        name: 'Wide-Bandgap SiC MOSFET',
        badge: 'Power Electronics',
        desc: 'Double-pulse switching inductive test, high slew rate dv/dt transients, and turn-on/turn-off dynamic energy loss E_sw.',
        accent: 'border-cyan-800/60 hover:border-cyan-500 text-cyan-400',
      },
      {
        id: 'quantum-tunneling',
        step: '04',
        name: 'Quantum Resonant Tunneling',
        badge: 'Schrödinger Transport',
        desc: 'GaAs/AlGaAs double barrier quantum well, bound state alignment, and negative differential resistance (NDR) IV curves.',
        accent: 'border-emerald-800/60 hover:border-emerald-500 text-emerald-400',
      },
    ],
  },
};

export const DepartmentRoadmap: React.FC<DepartmentRoadmapProps> = ({
  departmentId,
  accentColor,
  onLaunchSimulator,
}) => {
  const track = DEPARTMENT_ROADMAPS[departmentId] || DEPARTMENT_ROADMAPS.electrical;

  return (
    <section
      id="curriculum-roadmap"
      aria-label={`Curriculum Track: ${track.title}`}
      className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900/90 to-slate-950 p-5 sm:p-6 shadow-xl space-y-4"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div
            className="p-2 rounded-xl border shrink-0"
            style={{
              backgroundColor: `${accentColor}15`,
              borderColor: `${accentColor}40`,
              color: accentColor,
            }}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: `${accentColor}12`,
                  borderColor: `${accentColor}30`,
                  color: accentColor,
                }}
              >
                Curriculum Track
              </span>
              <span className="text-xs text-slate-400 font-mono">Concept Progression Sequence</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
              {track.title}
            </h2>
          </div>
        </div>
        <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
          {track.summary}
        </p>
      </div>

      {/* 4-Step Sequence Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
        {track.steps.map((item, idx) => {
          const sim = ALL_AVAILABLE_SIMULATORS.find((s) => s.id === item.id);

          return (
            <div
              key={item.id}
              className={`relative rounded-xl bg-slate-900/80 border p-3.5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg ${item.accent}`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                    Step {item.step}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{item.badge}</span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-white mb-1">
                  <button
                    onClick={() => {
                      if (sim) onLaunchSimulator(sim);
                    }}
                    className="hover:underline transition-colors flex items-center justify-between text-left w-full"
                  >
                    <span>{item.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100" />
                  </button>
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{item.desc}</p>
              </div>

              <div className="pt-2.5 mt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">
                  {idx < 3 ? 'Advances to next →' : 'Capstone Milestone'}
                </span>
                <button
                  onClick={() => {
                    if (sim) onLaunchSimulator(sim);
                  }}
                  className="text-[11px] font-mono font-bold hover:underline flex items-center gap-0.5 text-white"
                  style={{ color: accentColor }}
                >
                  <span>Launch</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
