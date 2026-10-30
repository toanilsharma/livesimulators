import React, { useState } from 'react';
import {
  Zap,
  Cpu,
  Building2,
  Sliders,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  FlaskConical,
  Atom,
  CheckCircle2,
} from 'lucide-react';
import { DisciplineId, SimulatorItem } from '../types';
import {
  FEATURED_ELECTRICAL_SIMULATORS,
  FEATURED_MECHANICAL_SIMULATORS,
  FEATURED_CIVIL_SIMULATORS,
  FEATURED_INSTRUMENTATION_SIMULATORS,
  FEATURED_CHEMICAL_SIMULATORS,
  FEATURED_SEMICONDUCTOR_SIMULATORS,
} from '../data/simulators';
import { SimulatorCardPreview } from './SimulatorCardPreview';

interface HomeDepartmentsHubProps {
  onSelectDepartment: (deptId: DisciplineId) => void;
  onLaunchSimulator: (sim: SimulatorItem) => void;
}

interface DepartmentSectionConfig {
  id: DisciplineId;
  name: string;
  code: string;
  icon: React.ReactNode;
  tagline: string;
  accentColor: string;
  rowBg: string;
  rowBorder: string;
  iconContainer: string;
  codeBadge: string;
  buttonClass: string;
  simCardBorder: string;
  simCardHoverShadow: string;
  subCategoryText: string;
  subCategoryBadge: string;
  launchBtnClass: string;
  simulators: SimulatorItem[];
}

export const HomeDepartmentsHub: React.FC<HomeDepartmentsHubProps> = ({
  onSelectDepartment,
  onLaunchSimulator,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | DisciplineId>('all');

  const departments: DepartmentSectionConfig[] = [
    {
      id: 'electrical',
      name: 'Electrical & Electronic Systems',
      code: 'EE-200',
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
      tagline: 'Analog circuits, switching power electronics, RF transmission lines & 3-phase AC power grids.',
      accentColor: '#06b6d4',
      rowBg: 'bg-gradient-to-r from-cyan-950/40 via-slate-900/90 to-slate-950',
      rowBorder: 'border-cyan-500/30 hover:border-cyan-400/70 shadow-[0_0_25px_rgba(6,182,212,0.12)]',
      iconContainer: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400',
      codeBadge: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
      buttonClass: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.25)]',
      simCardBorder: 'border-cyan-500/25 hover:border-cyan-400/70',
      simCardHoverShadow: 'hover:shadow-[0_12px_32px_rgba(6,182,212,0.18)]',
      subCategoryText: 'text-cyan-400',
      subCategoryBadge: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
      launchBtnClass: 'bg-cyan-500/15 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/40',
      simulators: FEATURED_ELECTRICAL_SIMULATORS,
    },
    {
      id: 'mechanical',
      name: 'Mechanical & Thermal Dynamics',
      code: 'ME-400',
      icon: <Cpu className="w-5 h-5 text-amber-400" />,
      tagline: 'Planar kinematic mechanisms, thermodynamic Rankine cycles, damped vibrations & conjugate gears.',
      accentColor: '#f59e0b',
      rowBg: 'bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-slate-950',
      rowBorder: 'border-amber-500/30 hover:border-amber-400/70 shadow-[0_0_25px_rgba(245,158,11,0.12)]',
      iconContainer: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
      codeBadge: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      buttonClass: 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
      simCardBorder: 'border-amber-500/25 hover:border-amber-400/70',
      simCardHoverShadow: 'hover:shadow-[0_12px_32px_rgba(245,158,11,0.18)]',
      subCategoryText: 'text-amber-400',
      subCategoryBadge: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      launchBtnClass: 'bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40',
      simulators: FEATURED_MECHANICAL_SIMULATORS,
    },
    {
      id: 'control',
      name: 'Instrumentation & Process Control',
      code: 'IC-300',
      icon: <Sliders className="w-5 h-5 text-emerald-400" />,
      tagline: 'Closed-loop PID tuning, pneumatic control valves, 4-20mA telemetry loops & DP orifice flow meters.',
      accentColor: '#10b981',
      rowBg: 'bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-slate-950',
      rowBorder: 'border-emerald-500/30 hover:border-emerald-400/70 shadow-[0_0_25px_rgba(16,185,129,0.12)]',
      iconContainer: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
      codeBadge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
      buttonClass: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
      simCardBorder: 'border-emerald-500/25 hover:border-emerald-400/70',
      simCardHoverShadow: 'hover:shadow-[0_12px_32px_rgba(16,185,129,0.18)]',
      subCategoryText: 'text-emerald-400',
      subCategoryBadge: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
      launchBtnClass: 'bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40',
      simulators: FEATURED_INSTRUMENTATION_SIMULATORS,
    },
    {
      id: 'civil',
      name: 'Civil & Structural Mechanics',
      code: 'CE-320',
      icon: <Building2 className="w-5 h-5 text-rose-400" />,
      tagline: 'Euler-Bernoulli beam flexure, truss bridge nodal equilibrium, seismic base isolation & Mohr stress.',
      accentColor: '#f43f5e',
      rowBg: 'bg-gradient-to-r from-rose-950/40 via-slate-900/90 to-slate-950',
      rowBorder: 'border-rose-500/30 hover:border-rose-400/70 shadow-[0_0_25px_rgba(244,63,94,0.12)]',
      iconContainer: 'bg-rose-500/15 border-rose-500/40 text-rose-400',
      codeBadge: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
      buttonClass: 'bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-[0_0_15px_rgba(244,63,94,0.25)]',
      simCardBorder: 'border-rose-500/25 hover:border-rose-400/70',
      simCardHoverShadow: 'hover:shadow-[0_12px_32px_rgba(244,63,94,0.18)]',
      subCategoryText: 'text-rose-400',
      subCategoryBadge: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
      launchBtnClass: 'bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-slate-950 border border-rose-500/40',
      simulators: FEATURED_CIVIL_SIMULATORS,
    },
    {
      id: 'chemical',
      name: 'Chemical & Process Engineering',
      code: 'CH-250',
      icon: <FlaskConical className="w-5 h-5 text-violet-400" />,
      tagline: 'Continuous Stirred Tank Reactors (CSTR), multi-component distillation columns & mass transfer.',
      accentColor: '#8b5cf6',
      rowBg: 'bg-gradient-to-r from-violet-950/40 via-slate-900/90 to-slate-950',
      rowBorder: 'border-violet-500/30 hover:border-violet-400/70 shadow-[0_0_25px_rgba(139,92,246,0.12)]',
      iconContainer: 'bg-violet-500/15 border-violet-500/40 text-violet-400',
      codeBadge: 'bg-violet-500/15 border-violet-500/30 text-violet-300',
      buttonClass: 'bg-violet-500 hover:bg-violet-400 text-white shadow-[0_0_15px_rgba(139,92,246,0.25)]',
      simCardBorder: 'border-violet-500/25 hover:border-violet-400/70',
      simCardHoverShadow: 'hover:shadow-[0_12px_32px_rgba(139,92,246,0.18)]',
      subCategoryText: 'text-violet-400',
      subCategoryBadge: 'bg-violet-500/10 border-violet-500/30 text-violet-300',
      launchBtnClass: 'bg-violet-500/15 hover:bg-violet-500 text-violet-300 hover:text-white border border-violet-500/40',
      simulators: FEATURED_CHEMICAL_SIMULATORS,
    },
    {
      id: 'physics',
      name: 'Semiconductor & Quantum Physics',
      code: 'PH-500',
      icon: <Atom className="w-5 h-5 text-sky-400" />,
      tagline: 'P-N junction energy band bending, carrier drift-diffusion, and quantum well potential tunneling.',
      accentColor: '#38bdf8',
      rowBg: 'bg-gradient-to-r from-sky-950/40 via-slate-900/90 to-slate-950',
      rowBorder: 'border-sky-500/30 hover:border-sky-400/70 shadow-[0_0_25px_rgba(56,189,248,0.12)]',
      iconContainer: 'bg-sky-500/15 border-sky-500/40 text-sky-400',
      codeBadge: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
      buttonClass: 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.25)]',
      simCardBorder: 'border-sky-500/25 hover:border-sky-400/70',
      simCardHoverShadow: 'hover:shadow-[0_12px_32px_rgba(56,189,248,0.18)]',
      subCategoryText: 'text-sky-400',
      subCategoryBadge: 'bg-sky-500/10 border-sky-500/30 text-sky-300',
      launchBtnClass: 'bg-sky-500/15 hover:bg-sky-500 text-sky-300 hover:text-slate-950 border border-sky-500/40',
      simulators: FEATURED_SEMICONDUCTOR_SIMULATORS,
    },
  ];

  const filteredDepartments =
    selectedFilter === 'all'
      ? departments
      : departments.filter((d) => d.id === selectedFilter);

  // Friendly sub-category label per simulator
  const getSubCategoryLabel = (sim: SimulatorItem): string => {
    switch (sim.type) {
      case 'rlc':
        return 'Analog Circuits & Resonance';
      case 'three_phase':
        return '3-Phase AC Power Grid';
      case 'buck_boost':
        return 'DC-DC Switching Regulators';
      case 'sallen_key':
        return 'Active Sallen-Key Filters';
      case 'transmission_line':
        return 'RF Transmission & Smith Chart';
      case 'fourier':
        return 'Harmonic Spectrum & THD';
      case 'op_amp':
        return 'Op-Amp Instrumentation';
      case 'rc_transient':
        return 'RC & RL Transients';
      case 'transformer_test':
        return 'Transformer Tests (OC/SC)';
      case 'dc_motor':
        return 'DC Motor Speed Control';
      case 'induction_motor':
        return 'Induction Torque-Slip';
      case 'solar_pv':
        return 'Solar PV & MPPT Tracking';
      case 'four_bar':
        return 'Planar Kinematics';
      case 'rankine':
        return 'Rankine Thermodynamic Cycle';
      case 'harmonic':
        return 'Damped Oscillations & Resonance';
      case 'spur_gear':
        return 'Involute Gears & Backlash';
      case 'otto_cycle':
        return '4-Stroke Engine P-V Cycle';
      case 'projectile':
        return 'Ballistics & Non-Linear Drag';
      case 'centrifugal_pump':
        return 'Pump H-Q Head Curve';
      case 'refrigeration_cycle':
        return 'Vapor Compression P-h';
      case 'pid':
        return 'Closed-Loop PID Control';
      case 'control_valve':
        return 'Pneumatic Control Valves';
      case 'current_loop':
        return '4-20mA Telemetry Loop';
      case 'orifice_meter':
        return 'DP Orifice & Venturi Flow';
      case 'bode_plot':
        return 'Bode Margin & Stability';
      case 'root_locus':
        return 'Evans Root Locus';
      case 'beam_deflection':
        return 'Elastic Beam Flexure';
      case 'truss':
        return 'Warren & Pratt Truss FEA';
      case 'seismic':
        return 'Earthquake Base Isolation';
      case 'mohr_circle':
        return '2D Stress Tensor & Mohr';
      case 'rc_beam':
        return 'ACI 318 Concrete Limit State';
      case 'cstr':
        return 'CSTR Chemical Reactor';
      case 'distillation_column':
        return 'McCabe-Thiele Distillation';
      case 'heat_exchanger':
        return 'TEMA Shell & Tube LMTD';
      case 'gas_absorption':
        return 'Packed Gas Scrubber Bed';
      case 'batch_pfr':
        return 'Batch vs PFR Reaction Kinetics';
      case 'pn_junction':
        return 'P-N Diode Band Bending';
      case 'sic_switching':
        return 'SiC Power MOSFET Switching';
      case 'igbt_thermal':
        return 'IGBT Thermal Foster Stack';
      case 'mosfet_channel':
        return 'BSIM4 MOSFET Channel';
      case 'photoelectric':
        return 'Photoelectric Work Function';
      case 'column_buckling':
        return 'Euler Column Buckling & P-Delta';
      case 'liquid_extraction':
        return 'Liquid-Liquid Extraction (LLE)';
      case 'quantum_tunneling':
        return 'Quantum Resonant Tunneling NDR';
      default:
        return sim.badge || 'Live Simulation';
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Fundamentals':
        return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300';
      case 'Intermediate':
        return 'bg-amber-500/15 border-amber-500/30 text-amber-300';
      case 'Advanced':
        return 'bg-purple-500/15 border-purple-500/30 text-purple-300';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  return (
    <section id="departments-hub" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 w-full max-w-[1920px] mx-auto scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-xs font-mono font-semibold uppercase tracking-wider text-blue-300 mb-4 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>STAGE 1 • ACADEMIC FUNDAMENTALS &amp; UNIVERSITY LABS</span>
        </div>
        
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tight leading-tight">
          Explore Simulators by Department
        </h2>
        
        <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
          Curriculum-aligned textbook simulators for students and educators. Explore real-time interactive differential equations, circuit transients, mechanism kinematics, and control loops with live animated solvers.
        </p>

        {/* Systematic Department Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedFilter === 'all'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25'
                : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            All Departments ({departments.reduce((acc, d) => acc + d.simulators.length, 0)})
          </button>
          {departments.map((dept) => {
            const isSelected = selectedFilter === dept.id;
            return (
              <button
                key={dept.id}
                onClick={() => setSelectedFilter(dept.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-100 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dept.accentColor }} />
                <span>{dept.name.split('&')[0].trim()}</span>
                <span className="text-[10px] opacity-75 font-mono">({dept.simulators.length})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Systematic Row-by-Row Department Pipeline */}
      <div className="space-y-12 sm:space-y-16">
        {filteredDepartments.map((dept) => {
          const simCount = dept.simulators.length;

          return (
            <div key={dept.id} id={`dept-group-${dept.id}`} className="space-y-5">
              
              {/* 1. DEPARTMENT IDENTITY BANNER */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border ${dept.rowBorder} ${dept.rowBg} flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 transition-all duration-200`}
              >
                {/* Department Identity */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${dept.iconContainer}`}
                  >
                    {dept.icon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${dept.codeBadge}`}>
                        {dept.code}
                      </span>
                      <span className="text-[11px] font-mono text-slate-300 font-semibold">
                        {simCount} Interactive Workbenches
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>

                    <h3 className="text-lg sm:text-xl font-display font-extrabold text-white tracking-tight truncate">
                      {dept.name}
                    </h3>
                    
                    <p className="text-xs sm:text-sm text-slate-300 line-clamp-1 mt-0.5">
                      {dept.tagline}
                    </p>

                    {dept.id === 'mechanical' && (
                      <div className="mt-1.5">
                        <a
                          href="https://mech.livesimulators.com"
                          target="_blank"
                          rel="noopener"
                          className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-amber-400 hover:text-amber-300 hover:underline transition-colors"
                        >
                          <span>Advanced Turbomachinery &amp; Rotor Dynamics →</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Department Explore Action Button */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <a
                    href={`/department/${dept.id}`}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                        e.preventDefault();
                        onSelectDepartment(dept.id);
                      }
                    }}
                    id={`btn-explore-${dept.id}`}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm active:scale-95 ${dept.buttonClass}`}
                    title={`Open full ${dept.name} department workbench`}
                  >
                    <span>Full Department Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* 2. COMPACT, HALF-SIZE DYNAMIC SIMULATOR CARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5 sm:gap-3">
                {dept.simulators.map((sim) => (
                  <div
                    key={sim.id}
                    id={`card-sim-${sim.id}`}
                    onClick={() => {
                      if (typeof (window as any).gtag === 'function') {
                        (window as any).gtag('event', 'simulator_launch', { simulator: sim.title });
                      }
                      onLaunchSimulator(sim);
                    }}
                    className={`group relative flex flex-col justify-between rounded-xl border ${dept.simCardBorder} bg-gradient-to-b from-slate-900/95 via-[#080e1d]/90 to-[#050913] p-3 cursor-pointer transition-all duration-200 hover:-translate-y-1 ${dept.simCardHoverShadow} shadow-md overflow-hidden`}
                  >
                    {/* Top Edge Ambient Light Bar */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${sim.accentColor || dept.accentColor}, transparent)`,
                      }}
                    />

                    <div className="space-y-2">
                      {/* Sub-category Header & Verification Badges */}
                      <div className="flex items-center justify-between gap-1.5">
                        <span
                          className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border truncate ${dept.subCategoryBadge}`}
                        >
                          {getSubCategoryLabel(sim)}
                        </span>

                        <div className="flex items-center gap-1 shrink-0">
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold ${getDifficultyBadge(sim.difficulty)}`}
                          >
                            {sim.difficulty}
                          </span>
                          <span
                            className="text-emerald-400 text-[9px] font-mono flex items-center"
                            title="100% Analytically Verified Simulation"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          </span>
                        </div>
                      </div>

                      {/* Compact Animated Canvas Visualizer */}
                      <div className="relative group-hover:scale-[1.01] transition-transform duration-200">
                        <SimulatorCardPreview
                          type={sim.type}
                          accentColor={sim.accentColor || dept.accentColor}
                          height={54}
                          showFps={false}
                        />
                      </div>

                      {/* Simulator Title */}
                      <div>
                        <h4 className="text-xs sm:text-sm font-display font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug tracking-tight">
                          {sim.title}
                        </h4>

                        {/* Concise Physical Insight Tagline */}
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed font-sans">
                          {sim.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer: Standard Badge & Direct Launch Button */}
                    <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                      <span
                        className="text-[10px] font-mono text-slate-400 truncate max-w-[110px] flex items-center gap-1"
                        title={sim.standardReference || sim.badge}
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: sim.accentColor || dept.accentColor }} />
                        <span className="truncate">{sim.badge}</span>
                      </span>

                      <a
                        href={`/simulator/${sim.id}`}
                        className={`launch-button px-2.5 py-0.5 rounded-lg text-[11px] font-bold font-mono flex items-center gap-1 shrink-0 transition-all active:scale-95 ${dept.launchBtnClass}`}
                        rel="noopener"
                        onClick={(e) => {
                          if (typeof (window as any).gtag === 'function') {
                            (window as any).gtag('event', 'simulator_launch', { simulator: sim.title });
                          }
                          if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                            e.preventDefault();
                            e.stopPropagation();
                            onLaunchSimulator(sim);
                          }
                        }}
                      >
                        <span>Simulate</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
};
