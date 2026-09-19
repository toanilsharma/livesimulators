import React, { useState } from 'react';
import {
  Zap,
  Cpu,
  Building2,
  Sliders,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  Activity,
  Award,
  FlaskConical,
  Atom,
  CheckCircle2,
  Play
} from 'lucide-react';
import { DisciplineId, SimulatorItem } from '../types';
import {
  FEATURED_ELECTRICAL_SIMULATORS,
  FEATURED_MECHANICAL_SIMULATORS,
  FEATURED_CIVIL_SIMULATORS,
  FEATURED_INSTRUMENTATION_SIMULATORS,
} from '../data/simulators';

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
  // Visual classes
  rowBg: string;
  rowBorder: string;
  iconContainer: string;
  codeBadge: string;
  buttonClass: string;
  simCardHover: string;
  subCategoryText: string;
  simulators: SimulatorItem[];
  fallbackCards?: {
    id: string;
    subCategory: string;
    title: string;
    badge: string;
    difficulty: string;
    tagline: string;
  }[];
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
      simCardHover: 'hover:border-cyan-500/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] group-hover:text-cyan-300',
      subCategoryText: 'text-cyan-400',
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
      simCardHover: 'hover:border-amber-500/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] group-hover:text-amber-300',
      subCategoryText: 'text-amber-400',
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
      simCardHover: 'hover:border-emerald-500/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] group-hover:text-emerald-300',
      subCategoryText: 'text-emerald-400',
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
      simCardHover: 'hover:border-rose-500/60 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] group-hover:text-rose-300',
      subCategoryText: 'text-rose-400',
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
      simCardHover: 'hover:border-violet-500/60 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] group-hover:text-violet-300',
      subCategoryText: 'text-violet-400',
      simulators: [],
      fallbackCards: [
        {
          id: 'cstr-reactor',
          subCategory: 'Reactor Dynamics',
          title: 'CSTR Continuous Stirred Tank Reactor',
          badge: 'AIChE / Arrhenius',
          difficulty: 'Intermediate',
          tagline: 'Non-isothermal reaction mass balance, residence time distribution & conversion curves.',
        },
        {
          id: 'binary-distillation',
          subCategory: 'Separation Engineering',
          title: 'Binary Distillation Column & Stages',
          badge: 'McCabe-Thiele',
          difficulty: 'Advanced',
          tagline: 'Vapor-liquid equilibrium (VLE), reflux ratio, stripping section & theoretical stages.',
        },
      ],
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
      simCardHover: 'hover:border-sky-500/60 hover:shadow-[0_0_20px_rgba(56,189,248,0.15)] group-hover:text-sky-300',
      subCategoryText: 'text-sky-400',
      simulators: [],
      fallbackCards: [
        {
          id: 'pn-junction',
          subCategory: 'Solid-State Physics',
          title: 'P-N Junction Energy Band Diagram',
          badge: 'IEEE EDS / Shockley',
          difficulty: 'Fundamentals',
          tagline: 'Built-in potential barrier, Fermi levels & space-charge depletion layer diffusion.',
        },
        {
          id: 'mosfet-channel',
          subCategory: 'Quantum Devices',
          title: 'MOSFET Inversion Channel & Gate Bias',
          badge: 'BSIM / Poisson',
          difficulty: 'Intermediate',
          tagline: 'Gate oxide capacitance, surface potential band bending & 2D inversion electron sheet.',
        },
      ],
    },
  ];

  const filteredDepartments =
    selectedFilter === 'all'
      ? departments
      : departments.filter((d) => d.id === selectedFilter);

  // Helper to extract a friendly sub-category label per simulator
  const getSubCategoryLabel = (sim: SimulatorItem): string => {
    switch (sim.type) {
      case 'rlc':
        return 'Analog Circuits';
      case 'three_phase':
        return 'Power Grid';
      case 'buck_boost':
        return 'Switching Regulators';
      case 'sallen_key':
        return 'Active Filters';
      case 'transmission_line':
        return 'RF Transmission';
      case 'four_bar':
        return 'Planar Kinematics';
      case 'harmonic':
        return 'Damped Oscillations';
      case 'spur_gear':
        return 'Gears & Transmissions';
      case 'rankine':
        return 'Thermodynamics';
      case 'pid':
        return 'Feedback Control';
      case 'control_valve':
        return 'Pneumatic Valves';
      case 'current_loop':
        return 'Signal Telemetry';
      case 'fourier':
        return 'Harmonic Spectrum';
      case 'orifice_meter':
        return 'Flow Metering';
      case 'beam_deflection':
        return 'Beam Flexure';
      case 'truss':
        return 'Truss FEA';
      case 'seismic':
        return 'Earthquake Damping';
      case 'mohr_circle':
        return '2D Stress Tensor';
      default:
        return sim.badge || 'Engineering Lab';
    }
  };

  return (
    <section id="engineering-departments" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono font-semibold uppercase tracking-wider text-cyan-300 mb-4 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>SIMULATION DIRECTORY BY DEPARTMENT</span>
        </div>
        
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tight leading-tight">
          Explore Simulators by Department
        </h2>
        
        <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
          Organized systematically row-by-row. Select a department to explore or click any sub-category simulator below to launch its real-time 60 FPS physics workbench immediately.
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
            All Departments (18)
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
              </button>
            );
          })}
        </div>
      </div>

      {/* Systematic Row-by-Row Department Pipeline */}
      <div className="space-y-10 sm:space-y-12">
        {filteredDepartments.map((dept) => {
          const simCount = dept.simulators.length > 0 ? dept.simulators.length : (dept.fallbackCards?.length || 0);

          return (
            <div key={dept.id} id={`dept-group-${dept.id}`} className="space-y-3.5">
              
              {/* 1. ONE ROW FOR EACH DEPARTMENT (Compact, distinctive, color-coded) */}
              <div
                className={`p-4 sm:p-4.5 rounded-2xl border ${dept.rowBorder} ${dept.rowBg} flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 transition-all duration-200`}
              >
                {/* Department Identity */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${dept.iconContainer}`}
                  >
                    {dept.icon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${dept.codeBadge}`}>
                        {dept.code}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {simCount} Live Simulators
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-display font-extrabold text-white tracking-tight truncate">
                      {dept.name}
                    </h3>
                    
                    <p className="text-xs text-slate-300 line-clamp-1">
                      {dept.tagline}
                    </p>
                  </div>
                </div>

                {/* Right: Department Explore Action Button */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => onSelectDepartment(dept.id)}
                    id={`btn-explore-${dept.id}`}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${dept.buttonClass}`}
                    title={`Open full ${dept.name} hub`}
                  >
                    <span>Explore Department</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 2. SUB-CATEGORY SIMULATORS DIRECTLY BELOW (Compact, informative, clickable cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3">
                {dept.simulators.map((sim) => (
                  <div
                    key={sim.id}
                    id={`card-sim-${sim.id}`}
                    onClick={() => onLaunchSimulator(sim)}
                    className={`group p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-850 cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-0.5 ${dept.simCardHover}`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-1.5 mb-2">
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${dept.subCategoryText} truncate`}>
                          {getSubCategoryLabel(sim)}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0">
                          {sim.difficulty}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs sm:text-sm font-bold text-white transition-colors line-clamp-2 leading-snug">
                        {sim.title}
                      </h4>

                      {/* Plain-English Tagline */}
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1.5 leading-relaxed font-sans">
                        {sim.tagline}
                      </p>
                    </div>

                    {/* Card Footer: Standard Badge & Direct Launch */}
                    <div className="pt-2.5 mt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-1">
                      <span className="text-[10px] font-mono text-slate-400 truncate max-w-[110px]" title={sim.badge}>
                        {sim.badge}
                      </span>

                      <span className="text-[11px] font-bold font-mono text-slate-300 group-hover:text-white flex items-center gap-1 shrink-0 transition-colors">
                        <span>Launch</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                ))}

                {/* For departments with academic modules (Chemical, Semiconductor) */}
                {dept.fallbackCards?.map((fCard) => (
                  <div
                    key={fCard.id}
                    onClick={() => onSelectDepartment(dept.id)}
                    className={`group p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-850 cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-0.5 ${dept.simCardHover}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1.5 mb-2">
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${dept.subCategoryText} truncate`}>
                          {fCard.subCategory}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0">
                          {fCard.difficulty}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-white transition-colors line-clamp-2 leading-snug">
                        {fCard.title}
                      </h4>

                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1.5 leading-relaxed font-sans">
                        {fCard.tagline}
                      </p>
                    </div>

                    <div className="pt-2.5 mt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-1">
                      <span className="text-[10px] font-mono text-slate-400 truncate max-w-[110px]">
                        {fCard.badge}
                      </span>

                      <span className="text-[11px] font-bold font-mono text-slate-300 group-hover:text-white flex items-center gap-1 shrink-0 transition-colors">
                        <span>Explore</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
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
