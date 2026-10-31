import React, { useState, useMemo, useEffect } from 'react';
import {
  Zap,
  Cpu,
  Building2,
  Sliders,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  FlaskConical,
  Atom,
  CheckCircle2,
  BookOpen,
  Layers,
  Sparkles,
  Search,
  X,
  ExternalLink,
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
import { MathView } from './MathView';

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
  academicOverview: string;
  governingTheory: string;
  textbookBenchmark: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  badgeClass: string;
  buttonClass: string;
  simulators: SimulatorItem[];
}

export const HomeDepartmentsHub: React.FC<HomeDepartmentsHubProps> = ({
  onSelectDepartment,
  onLaunchSimulator,
}) => {
  const [activeDepartment, setActiveDepartment] = useState<DisciplineId>('electrical');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showDerivation, setShowDerivation] = useState<boolean>(false);

  // Sync active tab with URL hash or external stage buttons (e.g., #dept-mechanical)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#dept-')) {
        const deptId = hash.replace('#dept-', '') as DisciplineId;
        if (['electrical', 'mechanical', 'control', 'civil', 'chemical', 'physics'].includes(deptId)) {
          setActiveDepartment(deptId);
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const departments: DepartmentSectionConfig[] = [
    {
      id: 'electrical',
      name: 'Electrical & Electronic Systems',
      code: 'EE-200',
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
      tagline: 'Analog circuit resonance, high-frequency RF transmission, and switching power electronics.',
      academicOverview:
        'Continuous ODE models solving Kirchhoff voltage and current laws, Maxwell wave propagation, and 3-phase grid dynamics. Designed for coursework in circuit theory, power electronics, and electromagnetic fields referencing core concepts covered in university electrical engineering curricula.',
      governingTheory: 'v(t) = L\\frac{di}{dt} + Ri(t) + \\frac{1}{C}\\int i(t)dt',
      textbookBenchmark: 'Alexander & Sadiku (Ch. 8–9) • Hayt & Kemmerly (Ch. 14)',
      accentColor: '#06b6d4',
      accentBg: 'bg-cyan-500/10',
      accentBorder: 'border-cyan-500/30',
      badgeClass: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
      buttonClass: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.25)]',
      simulators: FEATURED_ELECTRICAL_SIMULATORS,
    },
    {
      id: 'mechanical',
      name: 'Mechanical & Thermal Dynamics',
      code: 'ME-400',
      icon: <Cpu className="w-5 h-5 text-amber-400" />,
      tagline: 'Planar kinematic mechanisms, thermodynamic power cycles, and damped structural vibrations.',
      academicOverview:
        'First-principles rigid-body kinematics (Grashof four-bar linkages), conjugate gear tooth meshing, and second-law thermodynamic cycles (Rankine & Otto). Formulated for dynamics, vibrations, and applied thermodynamics with ASME and ISO reference data.',
      governingTheory: 'm\\ddot{x} + c\\dot{x} + kx = F_0 \\cos(\\omega t)',
      textbookBenchmark: 'Shigley Mechanical Engineering Design • Moran & Shapiro Thermodynamics',
      accentColor: '#f59e0b',
      accentBg: 'bg-amber-500/10',
      accentBorder: 'border-amber-500/30',
      badgeClass: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      buttonClass: 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
      simulators: FEATURED_MECHANICAL_SIMULATORS,
    },
    {
      id: 'control',
      name: 'Instrumentation & Process Control',
      code: 'IC-300',
      icon: <Sliders className="w-5 h-5 text-emerald-400" />,
      tagline: 'Closed-loop PID regulation, telemetry transmitter loops, and pneumatic valve actuation.',
      academicOverview:
        'Discrete-time numerical integration of negative feedback systems, root locus trajectories, and frequency-domain stability margins (Bode & Nyquist). Built for instrumentation, automation, and chemical process control aligned with ISA-5.1 standards.',
      governingTheory: 'u(t) = K_p e(t) + K_i \\int_0^t e(\\tau)d\\tau + K_d \\frac{de(t)}{dt}',
      textbookBenchmark: 'Modern Control Engineering (K. Ogata) • Seborg Process Dynamics & Control',
      accentColor: '#10b981',
      accentBg: 'bg-emerald-500/10',
      accentBorder: 'border-emerald-500/30',
      badgeClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
      buttonClass: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
      simulators: FEATURED_INSTRUMENTATION_SIMULATORS,
    },
    {
      id: 'civil',
      name: 'Civil & Structural Mechanics',
      code: 'CE-320',
      icon: <Building2 className="w-5 h-5 text-rose-400" />,
      tagline: 'Euler-Bernoulli flexure, truss nodal equilibrium, and seismic base isolation.',
      academicOverview:
        'Static equilibrium and dynamic response under moving vehicular loads, shear force and bending moment diagrams, and earthquake ground acceleration spectrums. Formulations modeled from open literature citing AISC 360, ACI 318, and ASCE 7-22 design guidelines.',
      governingTheory: 'EI \\frac{d^4 w}{dx^4} = q(x)',
      textbookBenchmark: 'Hibbeler Structural Analysis • Beer & Johnston Mechanics of Materials',
      accentColor: '#f43f5e',
      accentBg: 'bg-rose-500/10',
      accentBorder: 'border-rose-500/30',
      badgeClass: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
      buttonClass: 'bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-[0_0_15px_rgba(244,63,94,0.25)]',
      simulators: FEATURED_CIVIL_SIMULATORS,
    },
    {
      id: 'chemical',
      name: 'Chemical & Process Engineering',
      code: 'CH-250',
      icon: <FlaskConical className="w-5 h-5 text-violet-400" />,
      tagline: 'CSTR reaction kinetics, multi-stage distillation, and TEMA shell & tube heat transfer.',
      academicOverview:
        'Non-linear differential mass and thermal energy balances with Arrhenius reaction kinetics, vapor-liquid equilibrium (VLE) tray hydraulics, and logarithmic mean temperature difference (LMTD) heat exchanger solvers.',
      governingTheory: '\\frac{dC_A}{dt} = \\frac{F}{V}(C_{A0} - C_A) - k_0 e^{-E_a/RT} C_A^2',
      textbookBenchmark: 'Levenspiel Chemical Reaction Engineering • McCabe, Smith & Harriott Unit Operations',
      accentColor: '#8b5cf6',
      accentBg: 'bg-violet-500/10',
      accentBorder: 'border-violet-500/30',
      badgeClass: 'bg-violet-500/15 border-violet-500/30 text-violet-300',
      buttonClass: 'bg-violet-500 hover:bg-violet-400 text-white shadow-[0_0_15px_rgba(139,92,246,0.25)]',
      simulators: FEATURED_CHEMICAL_SIMULATORS,
    },
    {
      id: 'physics',
      name: 'Semiconductor & Quantum Physics',
      code: 'PH-500',
      icon: <Atom className="w-5 h-5 text-sky-400" />,
      tagline: 'P-N junction band bending, Poisson space-charge carrier drift, and quantum tunneling.',
      academicOverview:
        'Carrier statistics and energy band structures under variable electrostatic bias. Simulates Poisson-Boltzmann equations, Fermi-Dirac distributions, and quantum barrier tunneling for solid-state devices and modern wide-bandgap SiC power transistors.',
      governingTheory: '-\\frac{\\hbar^2}{2m^*}\\frac{d^2\\psi}{dx^2} + V(x)\\psi = E\\psi',
      textbookBenchmark: 'Streetman & Banerjee Solid State Electronic Devices • Sze Physics of Semiconductor Devices',
      accentColor: '#38bdf8',
      accentBg: 'bg-sky-500/10',
      accentBorder: 'border-sky-500/30',
      badgeClass: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
      buttonClass: 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.25)]',
      simulators: FEATURED_SEMICONDUCTOR_SIMULATORS,
    },
  ];

  // Active spotlight per department
  const [activeSpotlights, setActiveSpotlights] = useState<Record<DisciplineId, string>>({
    electrical: FEATURED_ELECTRICAL_SIMULATORS[0].id,
    mechanical: FEATURED_MECHANICAL_SIMULATORS[0].id,
    control: FEATURED_INSTRUMENTATION_SIMULATORS[0].id,
    civil: FEATURED_CIVIL_SIMULATORS[0].id,
    chemical: FEATURED_CHEMICAL_SIMULATORS[0].id,
    physics: FEATURED_SEMICONDUCTOR_SIMULATORS[0].id,
  });

  // Filter departments: when searching, search across all departments; otherwise display single active department tab
  const filteredDepartments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // When global search query is active, search across all 44 workbenches
    if (query) {
      return departments
        .map((dept) => {
          const matchingSims = dept.simulators.filter((sim) => {
            return (
              sim.title.toLowerCase().includes(query) ||
              sim.tagline.toLowerCase().includes(query) ||
              (sim.physicalLaw && sim.physicalLaw.toLowerCase().includes(query)) ||
              (sim.badge && sim.badge.toLowerCase().includes(query)) ||
              (sim.courseMapping && sim.courseMapping.toLowerCase().includes(query)) ||
              (sim.standardReference && sim.standardReference.toLowerCase().includes(query))
            );
          });

          return {
            ...dept,
            simulators: matchingSims,
          };
        })
        .filter((dept) => dept.simulators.length > 0);
    }

    // Default: render ONLY the active single department tab (cuts height by ~5,000 px!)
    return departments.filter((dept) => dept.id === activeDepartment);
  }, [departments, activeDepartment, searchQuery]);

  const totalMatchingSimulators = useMemo(() => {
    return filteredDepartments.reduce((acc, d) => acc + d.simulators.length, 0);
  }, [filteredDepartments]);

  const totalSimulatorsCount = departments.reduce((acc, d) => acc + d.simulators.length, 0);

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
    <section
      id="departments-hub"
      className="py-14 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-10 xl:px-14 w-full max-w-[1720px] 2xl:max-w-[1800px] mx-auto scroll-mt-20 border-b border-slate-800/80"
    >
      {/* Editorial Section Header */}
      <div className="max-w-4xl mx-auto text-center mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-xs font-mono font-semibold uppercase tracking-wider text-blue-300 mb-4 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>STAGE 1 • ACADEMIC CURRICULUM DIRECTORY &amp; VIRTUAL LABS</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tight leading-[1.15]">
          Explore Engineering Disciplines &amp; Coursework Labs
        </h2>

        <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-sans max-w-3xl mx-auto">
          Every simulator runs real-time numerical solutions to continuous governing differential equations.
          Browse curriculum topics below, inspect mathematical formulations, and launch interactive browser workbenches calibrated to standard engineering university syllabi.
        </p>

        {/* =============================================================== */}
        {/* WOW ENHANCEMENT: INTERACTIVE IN-HUB INSTANT SEARCH BAR */}
        {/* =============================================================== */}
        <div className="relative max-w-lg mx-auto w-full mt-6">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 35+ topics: e.g. 'PID', 'Buck', 'Truss', 'Fourier', 'RLC'..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/50 font-mono transition-all shadow-inner"
            aria-label="Filter simulators by topic name, physical law or course code"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live Search Result Feedback */}
        {searchQuery && (
          <div className="mt-2 text-xs font-mono text-cyan-300 flex items-center justify-center gap-2">
            <span>
              Showing {totalMatchingSimulators} matching workbenches for &ldquo;{searchQuery}&rdquo;
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-white underline text-[11px]"
            >
              Reset filter
            </button>
          </div>
        )}

        {/* Department Switcher Tabs (Instant 1-Click Single Stage Switch) */}
        {!searchQuery ? (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {departments.map((dept) => {
              const isActive = activeDepartment === dept.id;
              return (
                <button
                  key={dept.id}
                  onClick={() => {
                    setActiveDepartment(dept.id);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-slate-100 text-slate-950 font-bold shadow-lg shadow-cyan-500/10 scale-[1.02]'
                      : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                  aria-pressed={isActive}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dept.accentColor }} />
                  <span>{dept.name.split('&')[0].trim()}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      isActive ? 'bg-slate-300 text-slate-900' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {dept.simulators.length}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 mt-4 text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/50 py-1.5 px-3 rounded-xl max-w-md mx-auto">
            <span>Global search active: {totalMatchingSimulators} workbenches match &ldquo;{searchQuery}&rdquo;</span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-300 hover:text-white underline text-[11px] ml-1 font-semibold"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Structured Department Matrix */}
      <div className="space-y-16 sm:space-y-20">
        {filteredDepartments.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-950/60 font-mono text-xs text-slate-400 space-y-2">
            <div>No matching topics found for &ldquo;{searchQuery}&rdquo;.</div>
            <button
              onClick={() => setSearchQuery('')}
              className="text-cyan-400 hover:underline font-bold"
            >
              Clear search query to show all 35+ workbenches
            </button>
          </div>
        ) : (
          filteredDepartments.map((dept) => {
            const activeSimId = activeSpotlights[dept.id] || dept.simulators[0]?.id;
            const activeSim = dept.simulators.find((s) => s.id === activeSimId) || dept.simulators[0];

            return (
              <article
                key={dept.id}
                id={`dept-${dept.id}`}
                className="rounded-3xl border border-slate-800/90 bg-[#060a14]/90 p-5 sm:p-7 lg:p-9 shadow-xl relative overflow-hidden"
              >
                {/* Top Department Brand & Overview Row */}
                <div className="border-b border-slate-800/90 pb-6 mb-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Left: Discipline Identity */}
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${dept.accentBg} ${dept.accentBorder} mt-0.5`}
                      >
                        {dept.icon}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${dept.badgeClass}`}>
                            {dept.code}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 font-semibold">
                            {dept.simulators.length} Verified Simulators
                          </span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>

                        <h3 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight">
                          {dept.name}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1">
                          {dept.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Right: Academic Benchmark Pill & Department Hub Link */}
                    <div className="flex flex-wrap items-center gap-3 lg:self-center">
                      <div className="hidden sm:block text-right font-mono text-[11px] text-slate-400 border-l border-slate-800 pl-3">
                        <div className="text-[10px] text-slate-500 uppercase">Textbook Benchmark</div>
                        <div className="text-slate-300 text-[11px] font-sans truncate max-w-[280px]">
                          {dept.textbookBenchmark}
                        </div>
                      </div>

                      <a
                        href={`/department/${dept.id}`}
                        onClick={(e) => {
                          if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                            e.preventDefault();
                            onSelectDepartment(dept.id);
                          }
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${dept.buttonClass}`}
                        title={`Open full ${dept.name} department workbench`}
                      >
                        <span>Full Department Hub</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Plain-Text Editorial Curriculum Summary (High SEO & Educational Value) */}
                  <div className="mt-4 pt-4 border-t border-slate-800/60 grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs font-sans text-slate-300 leading-relaxed">
                    <div className="lg:col-span-8 space-y-1">
                      <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 block">
                        Curriculum Scope &amp; Pedagogical Objective:
                      </span>
                      <p>{dept.academicOverview}</p>
                    </div>

                    <div className="lg:col-span-4 rounded-xl bg-slate-950/70 border border-slate-800/80 p-3 font-mono text-[11px] flex flex-col justify-between">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                        Governing Formulation:
                      </span>
                      <div className="py-1 text-cyan-300 overflow-x-auto custom-scrollbar">
                        <MathView math={dept.governingTheory} block />
                      </div>
                      <span className="text-[9.5px] text-slate-400">
                        Discretized via 4th-order numerical solvers
                      </span>
                    </div>
                  </div>
                </div>

                {/* DUAL-PANE LAYOUT: Left Plain-Text Topic Directory (65%) | Right Live Spotlight Console (35%) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                     {/* LEFT: Plain-Text Editorial Simulator Directory (Compact, Non-Scrolling, High-Density) */}
                  <div className="lg:col-span-7 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-300">Coursework Directory ({dept.simulators.length} Topics)</span>
                        <span className="hidden sm:inline-block text-[9.5px] px-2 py-0.5 rounded bg-slate-800/80 text-cyan-400 font-sans normal-case">
                          Instant 1-Click Interactive Preview
                        </span>
                      </div>
                      <span className="text-cyan-400 text-[10px]">Hover or Click to Preview</span>
                    </div>

                    {/* Compact non-scrolling directory list */}
                    <div className="space-y-1">
                      {dept.simulators.map((sim, index) => {
                        const isActive = activeSim && sim.id === activeSim.id;

                        return (
                          <div
                            key={sim.id}
                            onMouseEnter={() =>
                              setActiveSpotlights((prev) => ({ ...prev, [dept.id]: sim.id }))
                            }
                            onClick={() => {
                              setActiveSpotlights((prev) => ({ ...prev, [dept.id]: sim.id }));
                            }}
                            className={`group px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 border ${
                              isActive
                                ? 'bg-slate-900 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.12)]'
                                : 'border-transparent hover:bg-slate-900/60 hover:border-slate-800/80'
                            }`}
                          >
                            {/* Left: Index + Title + 1-Line Tagline */}
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <span
                                className={`text-[11px] font-mono font-bold shrink-0 w-6 text-center rounded py-0.5 transition-colors ${
                                  isActive
                                    ? 'bg-cyan-500/20 text-cyan-300'
                                    : 'text-slate-500 group-hover:text-slate-300 bg-slate-900/60'
                                }`}
                              >
                                {String(index + 1).padStart(2, '0')}
                              </span>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <a
                                    href={`/simulator/${sim.id}`}
                                    onClick={(e) => {
                                      if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                                        e.preventDefault();
                                        onLaunchSimulator(sim);
                                      }
                                    }}
                                    className={`text-xs sm:text-[13px] font-display font-bold transition-colors tracking-tight truncate ${
                                      isActive ? 'text-cyan-300' : 'text-white group-hover:text-cyan-200'
                                    }`}
                                  >
                                    {sim.title}
                                  </a>

                                  <span
                                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold shrink-0 hidden md:inline-block ${getDifficultyBadge(
                                      sim.difficulty
                                    )}`}
                                  >
                                    {sim.difficulty}
                                  </span>
                                </div>

                                {/* 1-Line Clean Tagline (Truncated, No Bulky 3rd Line) */}
                                <p className="text-[11px] text-slate-400 font-sans truncate leading-none mt-1 group-hover:text-slate-300">
                                  {sim.tagline}
                                </p>
                              </div>
                            </div>

                            {/* Right: Sleek Action Button */}
                            <div className="shrink-0 flex items-center gap-2">
                              <a
                                href={`/simulator/${sim.id}`}
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
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 transition-all ${
                                  isActive
                                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                                    : 'bg-slate-800/80 text-slate-400 group-hover:text-white group-hover:bg-slate-700'
                                }`}
                              >
                                <span>Simulate</span>
                                <ChevronRight className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* RIGHT: High-Resolution Interactive Spotlight Console */}
                  {activeSim && (
                    <div className="lg:col-span-5 rounded-2xl border border-slate-700/80 bg-slate-950 p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xl sticky top-24">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                            Interactive Spotlight
                          </span>
                        </div>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          60 FPS ODE SOLVER
                        </span>
                      </div>

                      {/* Active Simulator Title & Quick Tag */}
                      <div>
                        <h4 className="text-base sm:text-lg font-display font-extrabold text-white">
                          {activeSim.title}
                        </h4>
                        <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                          {activeSim.description || activeSim.tagline}
                        </p>
                      </div>

                      {/* High-Resolution Live Canvas Viewport (170px height) */}
                      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#050914] shadow-inner">
                        <SimulatorCardPreview
                          type={activeSim.type}
                          accentColor={activeSim.accentColor || dept.accentColor}
                          height={165}
                          showFps={false}
                        />

                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-[9px] font-mono text-slate-400 pointer-events-none">
                          Active Telemetry
                        </div>
                      </div>

                      {/* Real-time Math Formulation Callout */}
                      {activeSim.governingEquation && (
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono space-y-1">
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                            Governing Model:
                          </div>
                          <div className="text-cyan-300 py-0.5 overflow-x-auto custom-scrollbar">
                            <MathView math={activeSim.governingEquation} block />
                          </div>
                          {activeSim.equationDescription && (
                            <div className="text-[10px] text-slate-400 font-sans">
                              {activeSim.equationDescription}
                            </div>
                          )}

                          {/* =============================================================== */}
                          {/* WOW ENHANCEMENT: INTERACTIVE STEP-BY-STEP ANALYTICAL PROOF EXPANDER */}
                          {/* =============================================================== */}
                          {activeSim.analyticalProof && (
                            <div className="pt-2 mt-2 border-t border-slate-800">
                              <button
                                type="button"
                                onClick={() => setShowDerivation(!showDerivation)}
                                className="text-[10.5px] font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <span>{showDerivation ? 'Hide Analytical Proof' : 'View Step-by-Step Derivation & Proof'}</span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDerivation ? 'rotate-180' : ''}`} />
                              </button>

                              {showDerivation && (
                                <div className="mt-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-sans text-slate-300 leading-relaxed space-y-2 animate-fadeIn">
                                  <div className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider font-semibold">
                                    First-Principles Mathematical Proof:
                                  </div>
                                  <p>{activeSim.analyticalProof}</p>
                                  {activeSim.validationTest && (
                                    <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                                      <span className="text-emerald-400 font-bold">Analytical Verification Benchmark: </span>
                                      <span>{activeSim.validationTest}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Engineering Domain Topic Focus */}
                      <div className="text-[11px] font-mono text-cyan-400/90 flex items-center gap-1.5 pt-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{activeSim.disciplineName || 'Interactive Engineering Workbench'}</span>
                      </div>

                      {/* Launch Spotlight Simulator Button */}
                      <a
                        href={`/simulator/${activeSim.id}`}
                        onClick={(e) => {
                          if (typeof (window as any).gtag === 'function') {
                            (window as any).gtag('event', 'simulator_launch', { simulator: activeSim.title });
                          }
                          if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                            e.preventDefault();
                            onLaunchSimulator(activeSim);
                          }
                        }}
                        className={`w-full py-2.5 px-4 rounded-xl font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 ${dept.buttonClass}`}
                      >
                        <span>Launch Full {activeSim.title.split(' ')[0]} Lab</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  )}

                </div>

              </article>
            );
          })
        )}
      </div>
    </section>
  );
};
