import React, { useState } from 'react';
import {
  Zap,
  Cpu,
  Building2,
  Sliders,
  FlaskConical,
  Atom,
  Search,
  Filter,
  Layers,
  LayoutGrid,
  Table,
  Eye,
  ChevronRight,
  CheckCircle2,
  Activity,
  Flame,
  Radio,
  Gauge,
  Sparkles,
  Compass,
  ArrowRight
} from 'lucide-react';
import { DisciplineId, SimulatorItem } from '../../types';
import { SimulatorCardPreview } from '../SimulatorCardPreview';
import { DepartmentSpecTable } from './DepartmentSpecTable';
import { soundEngine } from '../../utils/audio';

export type DepartmentViewMode = 'grid' | 'grouped' | 'table';

interface DepartmentCategoryShowcaseProps {
  departmentId: DisciplineId;
  accentColor: string;
  simulators: SimulatorItem[];
  onLaunchSimulator: (sim: SimulatorItem) => void;
  onInspectSimulator: (sim: SimulatorItem) => void;
  viewMode: DepartmentViewMode;
  onViewModeChange: (mode: DepartmentViewMode) => void;
}

export interface CuratedCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  tagline: string;
  accentColor: string;
  badgeBg: string;
  borderAccent: string;
  gradientBg: string;
  simTypes: string[];
}

export const DEPARTMENT_CURATED_CATEGORIES: Record<DisciplineId, CuratedCategory[]> = {
  electrical: [
    {
      id: 'circuits-analog',
      title: 'Analog Circuits & Transient Dynamics',
      icon: <Activity className="w-5 h-5 text-cyan-400" />,
      tagline: 'Underdamped RLC ringing, resonant impedance collapse, and 2nd-order active filtering.',
      accentColor: '#06b6d4',
      badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      borderAccent: 'border-cyan-500/40 hover:border-cyan-400/80',
      gradientBg: 'from-cyan-950/40 via-slate-900/90 to-[#080d16]',
      simTypes: ['rlc', 'sallen_key', 'op_amp', 'rc_transient'],
    },
    {
      id: 'power-electronics',
      title: 'Power Electronics & Switching Topologies',
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
      tagline: 'High-frequency synchronous DC-DC conversion, ripple dynamics, and solar MPPT algorithms.',
      accentColor: '#10b981',
      badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      borderAccent: 'border-emerald-500/40 hover:border-emerald-400/80',
      gradientBg: 'from-emerald-950/40 via-slate-900/90 to-[#080d16]',
      simTypes: ['buck_boost', 'solar_pv'],
    },
    {
      id: 'machines-grid',
      title: 'AC Power Grids & Rotating Machinery',
      icon: <Cpu className="w-5 h-5 text-amber-400" />,
      tagline: 'Three-phase revolving stator magnetic fields, induction motors, and transformer flux.',
      accentColor: '#f59e0b',
      badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      borderAccent: 'border-amber-500/40 hover:border-amber-400/80',
      gradientBg: 'from-amber-950/40 via-slate-900/90 to-[#080d16]',
      simTypes: ['three_phase', 'induction_motor', 'dc_motor', 'transformer_test'],
    },
    {
      id: 'rf-signals',
      title: 'RF Waveguides & Harmonic Signal Synthesis',
      icon: <Radio className="w-5 h-5 text-violet-400" />,
      tagline: 'Distributed transmission line reflections, VSWR quarter-wave matching, and Fourier harmonics.',
      accentColor: '#8b5cf6',
      badgeBg: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
      borderAccent: 'border-violet-500/40 hover:border-violet-400/80',
      gradientBg: 'from-violet-950/40 via-slate-900/90 to-[#080d16]',
      simTypes: ['transmission_line', 'fourier'],
    },
  ],

  mechanical: [
    {
      id: 'kinematics-gears',
      title: 'Kinematics & Machine Design',
      icon: <Compass className="w-5 h-5 text-amber-400" />,
      tagline: 'Planar 4-bar linkage synthesis, transmission angles, and AGMA conjugate gear tooth meshing.',
      accentColor: '#f59e0b',
      badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      borderAccent: 'border-amber-500/40 hover:border-amber-400/80',
      gradientBg: 'from-amber-950/40 via-slate-900/90 to-[#080d16]',
      simTypes: ['four_bar', 'spur_gear'],
    },
    {
      id: 'vibrations-dynamics',
      title: 'Structural Dynamics & Vibration Isolation',
      icon: <Activity className="w-5 h-5 text-rose-400" />,
      tagline: 'Forced harmonic resonance, phase-lag transitions, and mechanical transmissibility envelopes.',
      accentColor: '#f43f5e',
      badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      borderAccent: 'border-rose-500/40 hover:border-rose-400/80',
      gradientBg: 'from-rose-950/40 via-slate-900/90 to-[#080d16]',
      simTypes: ['harmonic'],
    },
    {
      id: 'thermo-turbomachinery',
      title: 'Thermodynamics & Thermal Power Cycles',
      icon: <Flame className="w-5 h-5 text-cyan-400" />,
      tagline: 'Rankine steam turbine cycles, internal combustion Otto/Diesel, and vapor compression refrigeration.',
      accentColor: '#06b6d4',
      badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      borderAccent: 'border-cyan-500/40 hover:border-cyan-400/80',
      gradientBg: 'from-cyan-950/40 via-slate-900/90 to-[#080d16]',
      simTypes: ['rankine', 'otto_cycle', 'refrigeration_cycle', 'centrifugal_pump', 'projectile'],
    },
  ],

  civil: [
    {
      id: 'beam-flexure',
      title: 'Structural Elasticity & Beam Flexure',
      icon: <Building2 className="w-5 h-5 text-rose-400" />,
      tagline: 'Euler-Bernoulli continuous beam bending, shear-moment distributions, and column buckling.',
      accentColor: '#f43f5e',
      badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      borderAccent: 'border-rose-500/40 hover:border-rose-400/80',
      gradientBg: 'from-rose-950/40 via-slate-900/90 to-[#080d16]',
      simTypes: ['beam_deflection', 'rc_beam', 'column_buckling'],
    },
    {
      id: 'truss-bridge',
      title: 'Truss Bridges & Heavy Moving Loads',
      icon: <Layers className="w-5 h-5 text-cyan-400" />,
      tagline: 'Method of joints, moving truck influence lines, and axial tension/compression member forces.',
      accentColor: '#06b6d4',
      badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      borderAccent: 'border-cyan-500/40 hover:border-cyan-400/80',
      gradientBg: 'from-cyan-950/40 via-slate-900/90 to-[#080d16]',
      simTypes: ['truss'],
    },
    {
      id: 'seismic-stress',
      title: 'Seismic Base Isolation & Continuum Stress',
      icon: <Activity className="w-5 h-5 text-emerald-400" />,
      tagline: 'Elastomeric seismic base isolation ground motions and 2D Mohr’s Circle principal stress invariants.',
      accentColor: '#10b981',
      badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      borderAccent: 'border-emerald-500/40 hover:border-emerald-400/80',
      gradientBg: 'from-emerald-950/40 via-slate-900/90 to-[#080d16]',
      simTypes: ['seismic', 'mohr_circle'],
    },
  ],

  control: [
    {
      id: 'feedback-pid',
      title: 'Closed-Loop Feedback & Stability Analysis',
      icon: <Sliders className="w-5 h-5 text-emerald-400" />,
      tagline: 'ISA parallel PID tuning with anti-windup clamping, Bode/Nyquist stability, and Evans root locus.',
      accentColor: '#10b981',
      badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      borderAccent: 'border-emerald-500/40 hover:border-emerald-400/80',
      gradientBg: 'from-emerald-950/40 via-slate-900/90 to-[#080d16]',
      simTypes: ['pid', 'bode_plot', 'root_locus'],
    },
    {
      id: 'valves-flow',
      title: 'Final Control Elements & Hydrodynamics',
      icon: <Gauge className="w-5 h-5 text-cyan-400" />,
      tagline: 'IEC 60534 valve flow coefficient sizing, cavitation suppression, and DP orifice flow metering.',
      accentColor: '#06b6d4',
      badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      borderAccent: 'border-cyan-500/40 hover:border-cyan-400/80',
      gradientBg: 'from-cyan-950/40 via-slate-900/90 to-[#080d16]',
      simTypes: ['control_valve', 'orifice_meter'],
    },
    {
      id: 'telemetry-loops',
      title: 'Industrial Telemetry & Sensor Loops',
      icon: <Radio className="w-5 h-5 text-violet-400" />,
      tagline: 'Two-wire 4-20mA smart transmitter burden resistance, loop voltage drop, and HART protocol.',
      accentColor: '#8b5cf6',
      badgeBg: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
      borderAccent: 'border-violet-500/40 hover:border-violet-400/80',
      gradientBg: 'from-violet-950/40 via-slate-900/90 to-[#080d16]',
      simTypes: ['current_loop'],
    },
  ],

  chemical: [
    {
      id: 'reaction-kinetics',
      title: 'Chemical Kinetics & Reactor Engineering',
      icon: <FlaskConical className="w-5 h-5 text-violet-400" />,
      tagline: 'Coupled non-isothermal mass/energy conservation, Arrhenius kinetics, and CSTR thermal runaway.',
      accentColor: '#8b5cf6',
      badgeBg: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
      borderAccent: 'border-violet-500/40 hover:border-violet-400/80',
      gradientBg: 'from-violet-950/40 via-slate-900/90 to-[#080d16]',
      simTypes: ['cstr', 'batch_pfr'],
    },
    {
      id: 'separation-processes',
      title: 'Separation Processes & Mass Transfer',
      icon: <Layers className="w-5 h-5 text-pink-400" />,
      tagline: 'McCabe-Thiele fractional distillation tray stepping and packed tower gas absorption.',
      accentColor: '#ec4899',
      badgeBg: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
      borderAccent: 'border-pink-500/40 hover:border-pink-400/80',
      gradientBg: 'from-pink-950/40 via-slate-900/90 to-[#080d16]',
      simTypes: ['distillation_column', 'gas_absorption', 'liquid_extraction'],
    },
    {
      id: 'heat-transfer',
      title: 'Industrial Heat Transfer',
      icon: <Flame className="w-5 h-5 text-amber-400" />,
      tagline: 'TEMA Class R shell-and-tube exchanger rating, logarithmic mean temperature difference, and baffles.',
      accentColor: '#f59e0b',
      badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      borderAccent: 'border-amber-500/40 hover:border-amber-400/80',
      gradientBg: 'from-amber-950/40 via-slate-900/90 to-[#080d16]',
      simTypes: ['heat_exchanger'],
    },
  ],

  physics: [
    {
      id: 'solid-state-junctions',
      title: 'Solid-State Physics & P-N Junctions',
      icon: <Atom className="w-5 h-5 text-sky-400" />,
      tagline: 'Poisson-Boltzmann built-in electrostatic band bending, depletion width modulation, and Fermi levels.',
      accentColor: '#38bdf8',
      badgeBg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      borderAccent: 'border-sky-500/40 hover:border-sky-400/80',
      gradientBg: 'from-sky-950/40 via-slate-900/90 to-[#080d16]',
      simTypes: ['pn_junction', 'photoelectric'],
    },
    {
      id: 'quantum-transport',
      title: 'Quantum Mechanics & Tunneling',
      icon: <Sparkles className="w-5 h-5 text-violet-400" />,
      tagline: '1D Schrödinger wavefunction penetration, resonant double-barrier tunneling, and RTD NDR.',
      accentColor: '#8b5cf6',
      badgeBg: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
      borderAccent: 'border-violet-500/40 hover:border-violet-400/80',
      gradientBg: 'from-violet-950/40 via-slate-900/90 to-[#080d16]',
      simTypes: ['quantum_tunneling'],
    },
    {
      id: 'power-semiconductors',
      title: 'Power Semiconductor Switching & Thermal Dynamics',
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
      tagline: 'Wide-bandgap SiC dynamic switching energy loss and IGBT multi-layer Foster RC thermal ladders.',
      accentColor: '#06b6d4',
      badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      borderAccent: 'border-cyan-500/40 hover:border-cyan-400/80',
      gradientBg: 'from-cyan-950/40 via-slate-900/90 to-[#080d16]',
      simTypes: ['sic_switching', 'igbt_thermal', 'mosfet_channel'],
    },
  ],
};

export const DepartmentCategoryShowcase: React.FC<DepartmentCategoryShowcaseProps> = ({
  departmentId,
  accentColor,
  simulators,
  onLaunchSimulator,
  onInspectSimulator,
  viewMode,
  onViewModeChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'Fundamentals' | 'Intermediate' | 'Advanced'>('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  const categories = DEPARTMENT_CURATED_CATEGORIES[departmentId] || DEPARTMENT_CURATED_CATEGORIES.electrical;

  // Classify a simulator into its curated category
  const getSimulatorCategory = (sim: SimulatorItem): CuratedCategory => {
    const found = categories.find((c) => c.simTypes.includes(sim.type));
    if (found) return found;
    return categories[0];
  };

  // Filter simulators based on search, difficulty, and category filter
  const filteredSimulators = simulators.filter((sim) => {
    const matchesSearch =
      sim.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sim.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sim.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDifficulty =
      selectedDifficulty === 'all' || sim.difficulty === selectedDifficulty;

    const cat = getSimulatorCategory(sim);
    const matchesCategory =
      activeCategoryFilter === 'all' || cat.id === activeCategoryFilter;

    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  // Group filtered simulators by their curated category
  const categorizedGroups = categories.map((cat) => {
    const sims = filteredSimulators.filter((s) => getSimulatorCategory(s).id === cat.id);
    return {
      category: cat,
      simulators: sims,
    };
  }).filter((group) => activeCategoryFilter === 'all' ? group.simulators.length > 0 : group.category.id === activeCategoryFilter);

  const renderSimulatorCard = (sim: SimulatorItem, category: CuratedCategory) => {
    return (
      <div
        key={sim.id}
        id={`sim-card-${sim.id}`}
        onClick={() => {
          if (typeof (window as any).gtag === 'function') {
            (window as any).gtag('event', 'simulator_launch', { simulator: sim.title });
          }
          onLaunchSimulator(sim);
        }}
        className={`group p-4 rounded-2xl border bg-slate-900/90 hover:bg-slate-850 cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-md hover:shadow-xl hover:-translate-y-1 relative overflow-hidden ${category.borderAccent}`}
        style={{
          boxShadow: `0 4px 20px -2px rgba(0, 0, 0, 0.4)`,
        }}
      >
        {/* Subtle Category Accent Glow at Top Right */}
        <div
          className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-15 pointer-events-none transition-opacity group-hover:opacity-30"
          style={{ backgroundColor: category.accentColor }}
        />

        <div className="space-y-3 relative z-10">
          {/* Top Bar: Category Pill & Difficulty / Verification Badges */}
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border truncate"
              style={{
                color: category.accentColor,
                borderColor: `${category.accentColor}40`,
                backgroundColor: `${category.accentColor}15`,
              }}
            >
              {sim.badge}
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60 text-slate-300">
                {sim.difficulty}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5" title="100% Physics Verified">
                <CheckCircle2 className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* 60 FPS Animated Canvas Preview */}
          <SimulatorCardPreview
            type={sim.type}
            accentColor={category.accentColor}
          />

          {/* Title & Tagline */}
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
              {sim.title}
            </h3>

            <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed font-sans">
              {sim.tagline}
            </p>
          </div>

          {/* Key Metrics Readout Chips */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {sim.keyMetrics.slice(0, 2).map((km, idx) => (
              <div
                key={idx}
                className="px-2 py-1 rounded-md bg-slate-950/80 border border-slate-800 flex items-center justify-between text-[11px] font-mono"
              >
                <span className="text-slate-400 truncate">{km.label}</span>
                <span className="font-bold ml-1 shrink-0" style={{ color: category.accentColor }}>
                  {km.unit || 'unitless'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card Footer: Quick Inspect & Direct Launch Action */}
        <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-1 relative z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              soundEngine.playRelayClick();
              onInspectSimulator(sim);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-mono font-medium flex items-center gap-1 transition-colors border border-slate-700/80"
            title="Inspect Model Equations & Derivations"
          >
            <Eye className="w-3 h-3 text-cyan-400" />
            <span>Inspect</span>
          </button>

          <a
            href={`/simulator/${sim.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold font-mono text-slate-950 shadow-md transition-all duration-200 active:scale-95"
            style={{
              backgroundColor: category.accentColor,
            }}
            rel="noopener"
            onClick={(e) => {
              soundEngine.playRelayClick();
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
            <span>Launch Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  };

  return (
    <section
      id="simulators-catalog"
      aria-label="Department Simulators Showcase"
      className="space-y-6 scroll-mt-28"
    >
      {/* Control Strip: Category Quick-Pills & Search Toolbar */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900/90 via-[#0a0f1d] to-[#060a12] border border-slate-800 p-4 sm:p-5 shadow-xl space-y-4">
        
        {/* Row 1: Curated Category Quick-Jump Tabs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Select Engineering Sub-Discipline</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
              {filteredSimulators.length} of {simulators.length} Laboratories Available
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* "All Disciplines" Pill */}
            <button
              onClick={() => {
                soundEngine.playRelayClick();
                setActiveCategoryFilter('all');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                activeCategoryFilter === 'all'
                  ? 'bg-slate-100 text-slate-950 shadow-md ring-2 ring-cyan-400/50'
                  : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>All Sub-Disciplines</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                activeCategoryFilter === 'all' ? 'bg-slate-300 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                {simulators.length}
              </span>
            </button>

            {/* Individual Category Pills */}
            {categories.map((cat) => {
              const count = simulators.filter((s) => getSimulatorCategory(s).id === cat.id).length;
              const isActive = activeCategoryFilter === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    soundEngine.playRelayClick();
                    setActiveCategoryFilter(cat.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 border ${
                    isActive
                      ? 'shadow-md ring-2 text-slate-950'
                      : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: cat.accentColor,
                          borderColor: cat.accentColor,
                          ringColor: `${cat.accentColor}80`,
                        }
                      : {}
                  }
                >
                  <span className="shrink-0">{cat.icon}</span>
                  <span className="truncate max-w-[190px]">{cat.title.split('&')[0].trim()}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] shrink-0 ${
                      isActive ? 'bg-black/30 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Search Input, Difficulty Filter & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by simulator name, equation, or keyword..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right Toolbar: Difficulty & View Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Difficulty Filter */}
            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-xl border border-slate-800">
              {(['all', 'Fundamentals', 'Intermediate', 'Advanced'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => {
                    soundEngine.playRelayClick();
                    setSelectedDifficulty(diff);
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono font-medium transition-all ${
                    selectedDifficulty === diff
                      ? 'bg-slate-800 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {diff === 'all' ? 'All' : diff}
                </button>
              ))}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-xl border border-slate-800">
              <button
                onClick={() => {
                  soundEngine.playRelayClick();
                  onViewModeChange('grouped');
                }}
                title="Categorized Showcase View"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                  viewMode === 'grouped'
                    ? 'bg-slate-100 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Categories</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playRelayClick();
                  onViewModeChange('grid');
                }}
                title="Flat Cards Grid"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                  viewMode === 'grid'
                    ? 'bg-slate-100 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playRelayClick();
                  onViewModeChange('table');
                }}
                title="Specification Sheet Matrix"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                  viewMode === 'table'
                    ? 'bg-slate-100 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Spec Table</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Main View Display */}
      {viewMode === 'table' ? (
        /* View 1: Specification Table */
        <DepartmentSpecTable
          simulators={filteredSimulators}
          accentColor={accentColor}
          onLaunchSimulator={onLaunchSimulator}
        />
      ) : viewMode === 'grouped' ? (
        /* View 2: High-Impact Categorized Sections (New Primary Default View!) */
        <div className="space-y-8">
          {categorizedGroups.map(({ category, simulators: groupSims }) => (
            <div
              key={category.id}
              className="space-y-4 rounded-2xl bg-gradient-to-br from-slate-950/60 via-slate-900/40 to-slate-950 border border-slate-800/80 p-5 sm:p-6 shadow-xl relative overflow-hidden"
              style={{
                borderLeftWidth: '4px',
                borderLeftColor: category.accentColor,
              }}
            >
              {/* Category Header Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/70">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2.5 rounded-xl border shrink-0"
                    style={{
                      backgroundColor: `${category.accentColor}18`,
                      borderColor: `${category.accentColor}40`,
                    }}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                        {category.title}
                      </h3>
                      <span
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: `${category.accentColor}15`,
                          color: category.accentColor,
                          borderColor: `${category.accentColor}40`,
                        }}
                      >
                        {groupSims.length} {groupSims.length === 1 ? 'Simulator' : 'Simulators'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-sans mt-0.5 max-w-2xl">
                      {category.tagline}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-slate-400 hidden lg:inline">
                  Double-Precision Float64 RK4
                </span>
              </div>

              {/* Grid of Simulators in this Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-4.5">
                {groupSims.map((sim) => renderSimulatorCard(sim, category))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* View 3: Flat Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-4.5">
          {filteredSimulators.map((sim) => renderSimulatorCard(sim, getSimulatorCategory(sim)))}
        </div>
      )}

      {/* Empty State when Search or Filters yield 0 results */}
      {filteredSimulators.length === 0 && (
        <div className="text-center py-12 px-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <h3 className="text-base font-bold text-white mb-1.5">No simulators match your filter</h3>
          <p className="text-xs text-slate-400 mb-3">
            Try adjusting your search query or reset your sub-discipline filter.
          </p>
          <button
            onClick={() => {
              soundEngine.playRelayClick();
              setSearchQuery('');
              setSelectedDifficulty('all');
              setActiveCategoryFilter('all');
            }}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
};
