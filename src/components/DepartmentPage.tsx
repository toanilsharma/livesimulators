import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Zap,
  Cpu,
  Building2,
  Sliders,
  ChevronRight,
  Sparkles,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Search,
  Filter,
  Activity,
  Layers,
  FlaskConical,
  Atom,
  Gauge,
  LayoutGrid,
  Table,
  Eye,
  FileCheck,
  FileText
} from 'lucide-react';
import { DisciplineId, SimulatorItem } from '../types';
import {
  FEATURED_ELECTRICAL_SIMULATORS,
  FEATURED_MECHANICAL_SIMULATORS,
  FEATURED_CIVIL_SIMULATORS,
  FEATURED_INSTRUMENTATION_SIMULATORS,
  FEATURED_CHEMICAL_SIMULATORS,
  FEATURED_SEMICONDUCTOR_SIMULATORS,
  ALL_AVAILABLE_SIMULATORS,
} from '../data/simulators';
import { MathView } from './MathView';
import { SimulatorCardPreview } from './SimulatorCardPreview';
import { DepartmentHeroSandbox } from './department/DepartmentHeroSandbox';
import { DepartmentRoadmap } from './department/DepartmentRoadmap';
import { DepartmentSpecTable } from './department/DepartmentSpecTable';
import { DepartmentStickyBar, DepartmentViewMode } from './department/DepartmentStickyBar';
import { DepartmentInspectorDrawer } from './department/DepartmentInspectorDrawer';
import { DepartmentFormulaCheatSheet } from './department/DepartmentFormulaCheatSheet';
import { DepartmentIndustryApplications } from './department/DepartmentIndustryApplications';
import { DepartmentStandardsMatrix } from './department/DepartmentStandardsMatrix';
import { DepartmentKnowledgeBlock } from './department/DepartmentKnowledgeBlock';
import { DepartmentFaq } from './department/DepartmentFaq';
import { DepartmentLabWorksheetModal } from './department/DepartmentLabWorksheetModal';
import { DepartmentNextNavigator } from './department/DepartmentNextNavigator';
import { DepartmentCategoryShowcase } from './department/DepartmentCategoryShowcase';
import { soundEngine } from '../utils/audio';

interface DepartmentPageProps {
  departmentId: DisciplineId;
  onBackToHome: () => void;
  onLaunchSimulator: (sim: SimulatorItem) => void;
  onSelectDepartment?: (deptId: DisciplineId) => void;
}

// Subcategory classifier for each simulator
const getSimulatorSubCategory = (type: string): { label: string; subfield: string } => {
  switch (type) {
    case 'rlc':
      return { label: 'Analog Circuits', subfield: 'Analog Circuits' };
    case 'three_phase':
      return { label: 'Power Grid', subfield: '3-Phase AC Grids' };
    case 'buck_boost':
      return { label: 'Switching Converter', subfield: 'Power Electronics' };
    case 'sallen_key':
      return { label: 'Active Filter', subfield: 'Active Filters' };
    case 'transmission_line':
      return { label: 'RF Waveguide', subfield: 'RF Transmission Lines' };
    case 'fourier':
      return { label: 'Fourier Synthesis', subfield: 'Signal Processing' };
    case 'four_bar':
      return { label: 'Kinematic Linkage', subfield: 'Kinematics' };
    case 'rankine':
      return { label: 'Steam Power Cycle', subfield: 'Thermodynamics' };
    case 'harmonic':
      return { label: 'Vibration & Resonance', subfield: 'Structural Dynamics' };
    case 'spur_gear':
      return { label: 'Involute Gearing', subfield: 'Machine Design' };
    case 'beam_deflection':
      return { label: 'Beam Flexure', subfield: 'Structural Analysis' };
    case 'truss':
      return { label: 'Truss Bridge', subfield: 'Bridge Mechanics' };
    case 'seismic':
      return { label: 'Base Isolation', subfield: 'Earthquake Eng' };
    case 'mohr_circle':
      return { label: 'Stress Transformation', subfield: 'Stress Analysis' };
    case 'pid':
      return { label: 'Closed-Loop PID', subfield: 'Process Automation' };
    case 'control_valve':
      return { label: 'Control Valve Trim', subfield: 'Control Valves' };
    case 'current_loop':
      return { label: '4-20mA Telemetry', subfield: 'Current Loops' };
    case 'orifice_meter':
      return { label: 'DP Flow Metering', subfield: 'Flow Metering' };
    case 'cstr':
      return { label: 'CSTR Kinetics', subfield: 'Reaction Engineering' };
    case 'distillation_column':
      return { label: 'Fractional Distillation', subfield: 'Separation Processes' };
    case 'heat_exchanger':
      return { label: 'Shell & Tube Exchanger', subfield: 'Heat Transfer' };
    case 'gas_absorption':
      return { label: 'Packed Absorption', subfield: 'Mass Transfer' };
    case 'pn_junction':
      return { label: 'P-N Band Bending', subfield: 'Solid-State Physics' };
    case 'sic_switching':
      return { label: 'Wide-Bandgap SiC', subfield: 'Power Electronics' };
    case 'igbt_thermal':
      return { label: 'IGBT Thermal Foster', subfield: 'Thermal Management' };
    case 'mosfet_channel':
      return { label: 'MOSFET Inversion', subfield: 'Microelectronics' };
    case 'op_amp':
      return { label: 'Op-Amp Linear Topologies', subfield: 'Active Analog' };
    case 'rc_transient':
      return { label: 'RC & RL Transients', subfield: '1st-Order Dynamics' };
    case 'transformer_test':
      return { label: 'Transformer OC / SC', subfield: 'Magnetic Machines' };
    case 'dc_motor':
      return { label: 'DC Machine & Drive', subfield: 'Electromechanics' };
    case 'induction_motor':
      return { label: '3-Phase Induction Motor', subfield: 'AC Drives & Machinery' };
    case 'solar_pv':
      return { label: 'Solar PV & MPPT Tracking', subfield: 'Renewable Photovoltaics' };
    case 'rc_beam':
      return { label: 'RC Beam Flexure ACI 318', subfield: 'Concrete Structures' };
    case 'otto_cycle':
      return { label: '4-Stroke Otto / Diesel', subfield: 'IC Heat Engines' };
    case 'projectile':
      return { label: 'Aerodynamic Ballistics', subfield: 'Newtonian Trajectories' };
    case 'centrifugal_pump':
      return { label: 'Centrifugal Turbopump', subfield: 'Hydraulic Systems' };
    case 'refrigeration_cycle':
      return { label: 'Vapor Compression P-h', subfield: 'Thermal Refrigeration' };
    case 'bode_plot':
      return { label: 'Bode & Nyquist Stability', subfield: 'Frequency Response' };
    case 'root_locus':
      return { label: 'Evans Root Locus', subfield: 'S-Plane Control' };
    case 'batch_pfr':
      return { label: 'Batch & PFR Reactors', subfield: 'Chemical Kinetics' };
    case 'photoelectric':
      return { label: 'Photoelectric Quantum', subfield: 'Modern Physics' };
    case 'column_buckling':
      return { label: 'Euler Column Buckling', subfield: 'Buckling Instability' };
    case 'liquid_extraction':
      return { label: 'Liquid-Liquid Extraction', subfield: 'Ternary Extraction' };
    case 'quantum_tunneling':
      return { label: 'Quantum Resonant Tunneling', subfield: 'Quantum Well Tunneling' };
    default:
      return { label: 'Physics Engine', subfield: 'First-Principles' };
  }
};

export const DepartmentPage: React.FC<DepartmentPageProps> = ({
  departmentId,
  onBackToHome,
  onLaunchSimulator,
  onSelectDepartment,
}) => {
  const [viewMode, setViewMode] = useState<DepartmentViewMode>('grouped');
  const [inspectingSim, setInspectingSim] = useState<SimulatorItem | null>(null);
  const [isWorksheetOpen, setIsWorksheetOpen] = useState(false);

  const departmentConfig = {
    electrical: {
      name: 'Electrical & Electronic Systems',
      shortName: 'Electrical',
      code: 'EE-200',
      icon: <Zap className="w-8 h-8 text-cyan-400" />,
      color: '#06b6d4',
      accentBg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300',
      gradient: 'from-cyan-950/40 via-slate-900/90 to-slate-950',
      simCardHover: 'hover:border-cyan-500/60 hover:shadow-[0_0_25px_rgba(6,182,212,0.18)] group-hover:text-cyan-300',
      description: 'First-principles numerical models spanning analog circuit transient response, RF transmission line reflections, switching power converter topologies, and three-phase rotating stator magnetic fields.',
      governingLaw: "Maxwell's Equations & Kirchhoff's Differential Laws",
      coreEquation: "v(t) = L \\frac{di}{dt} + R i(t) + \\frac{1}{C}\\int i(t)dt",
      equationDescription: 'Total dynamic voltage balance across resistive, inductive, and capacitive impedances.',
      standards: ['IEEE 1547 Grid Interconnection', 'IEEE 519 Harmonic Control', 'IEC 60034 Rotating Machines', 'IEC 62040 Switching Power'],
      simulators: FEATURED_ELECTRICAL_SIMULATORS,
      labCapacity: '6 Dedicated Physics Engines',
    },
    mechanical: {
      name: 'Mechanical & Thermal Dynamics',
      shortName: 'Mechanical',
      code: 'ME-400',
      icon: <Cpu className="w-8 h-8 text-amber-400" />,
      color: '#f59e0b',
      accentBg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
      gradient: 'from-amber-950/40 via-slate-900/90 to-slate-950',
      simCardHover: 'hover:border-amber-500/60 hover:shadow-[0_0_25px_rgba(245,158,11,0.18)] group-hover:text-amber-300',
      description: 'Kinematic mechanism synthesis, thermodynamic steam power generation cycles, damped harmonic resonance vibration isolation, and AGMA involute conjugate gear meshing.',
      governingLaw: "Newtonian Classical Mechanics & 1st/2nd Laws of Thermodynamics",
      coreEquation: "m\\ddot{x} + c\\dot{x} + kx = F_0 \\cos(\\omega t)",
      equationDescription: 'Second-order linear differential equation governing forced damped harmonic oscillators.',
      standards: ['ASME PTC 4.4 Steam Generators', 'ISO 6336 Gear Load Capacity', 'ISO 10816 Mechanical Vibration', 'AGMA 2001 Involute Standard'],
      simulators: FEATURED_MECHANICAL_SIMULATORS,
      labCapacity: '4 Dedicated Physics Engines',
    },
    civil: {
      name: 'Civil & Structural Engineering',
      shortName: 'Civil',
      code: 'CE-320',
      icon: <Building2 className="w-8 h-8 text-rose-400" />,
      color: '#f43f5e',
      accentBg: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
      gradient: 'from-rose-950/40 via-slate-900/90 to-slate-950',
      simCardHover: 'hover:border-rose-500/60 hover:shadow-[0_0_25px_rgba(244,63,94,0.18)] group-hover:text-rose-300',
      description: 'Differential beam bending equilibrium, moving truck live load truss bridge analysis, elastomeric seismic base isolation dynamics, and Mohr’s circle principal stress transformations.',
      governingLaw: "Euler-Bernoulli Beam Flexure & Navier-Cauchy Elastic Equilibrium",
      coreEquation: "EI \\frac{d^4 w}{dx^4} = q(x), \\quad \\sum \\vec{F}_{node} = 0",
      equationDescription: 'Fourth-order elastic beam deflection equilibrium under arbitrary distributed lateral loading.',
      standards: ['AISC 360-16 Structural Steel Buildings', 'AASHTO LRFD Bridge Design', 'ASCE 7-22 Seismic Criteria', 'ASTM D3080 Direct Shear'],
      simulators: FEATURED_CIVIL_SIMULATORS,
      labCapacity: '4 Dedicated Physics Engines',
    },
    control: {
      name: 'Instrumentation & Process Automation',
      shortName: 'Instrumentation',
      code: 'IC-300',
      icon: <Sliders className="w-8 h-8 text-emerald-400" />,
      color: '#10b981',
      accentBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
      gradient: 'from-emerald-950/40 via-slate-900/90 to-slate-950',
      simCardHover: 'hover:border-emerald-500/60 hover:shadow-[0_0_25px_rgba(16,185,129,0.18)] group-hover:text-emerald-300',
      description: 'Closed-loop feedback stability with anti-windup PID tuning, IEC control valve flow capacity and cavitation prevention, 4-20mA smart transmitters with line drop burdens, and differential pressure orifice metering.',
      governingLaw: "Laplace Feedback Control & Bernoulli Fluid Energy Continuity",
      coreEquation: "u(t) = K_p e(t) + \\frac{K_p}{T_i}\\int e(\\tau)d\\tau + K_p T_d \\frac{de}{dt}",
      equationDescription: 'Ideal ISA parallel PID closed-loop control algorithm with dynamic rate anti-windup.',
      standards: ['ISA-75.01 Control Valve Sizing', 'IEC 60381-1 Analogue Current Signals', 'ISO 5167 Orifice Metering', 'NAMUR NE 43 Alarm Levels'],
      simulators: FEATURED_INSTRUMENTATION_SIMULATORS,
      labCapacity: '4 Dedicated Physics Engines',
    },
    chemical: {
      name: 'Chemical & Process Engineering',
      shortName: 'Chemical',
      code: 'CH-250',
      icon: <FlaskConical className="w-8 h-8 text-violet-400" />,
      color: '#8b5cf6',
      accentBg: 'bg-violet-500/15 border-violet-500/40 text-violet-300',
      gradient: 'from-violet-950/40 via-slate-900/90 to-slate-950',
      simCardHover: 'hover:border-violet-500/60 hover:shadow-[0_0_25px_rgba(139,92,246,0.18)] group-hover:text-violet-300',
      description: 'First-principles process engineering models spanning non-isothermal CSTR thermal runaway, binary sieve tray distillation McCabe-Thiele stages, TEMA Class R shell-and-tube heat transfer, and packed tower gas absorption.',
      governingLaw: "Arrhenius Reaction Kinetics, Raoult's Law & Two-Film Mass Transfer",
      coreEquation: "\\frac{dC_A}{dt} = \\frac{F}{V}(C_{A0} - C_A) - k_0 e^{-E_a/RT} C_A^2, \\quad Q = U A \\Delta T_{lm}",
      equationDescription: 'Coupled reaction mass/energy conservation and heat exchanger rating.',
      standards: ['AIChE Standard Guidelines', 'TEMA Standards 10th Edition', 'ASTM D86 Distillation', 'EPA 40 CFR 63 Scrubbers'],
      simulators: FEATURED_CHEMICAL_SIMULATORS,
      labCapacity: '4 Dedicated Physics Engines',
    },
    physics: {
      name: 'Quantum & Semiconductor Physics',
      shortName: 'Physics',
      code: 'PH-500',
      icon: <Atom className="w-8 h-8 text-sky-400" />,
      color: '#38bdf8',
      accentBg: 'bg-sky-500/15 border-sky-500/40 text-sky-300',
      gradient: 'from-sky-950/40 via-slate-900/90 to-slate-950',
      simCardHover: 'hover:border-sky-500/60 hover:shadow-[0_0_25px_rgba(56,189,248,0.18)] group-hover:text-sky-300',
      description: 'Wide-bandgap power semiconductor switching dynamics, P-N junction energy band bending, IGBT multi-layer thermal Foster networks, and nanoscale BSIM4 MOSFET inversion channels.',
      governingLaw: "Poisson-Boltzmann Equation, Maxwell Slew Rates & Fermi-Dirac Statistics",
      coreEquation: "E_{sw} = \\int v_{ds}(t) i_d(t) dt, \\quad \\phi_s = \\frac{q N_A W_{dep}^2}{2\\varepsilon_s}",
      equationDescription: 'Power semiconductor dynamic switching energy integral and surface inversion potential.',
      standards: ['JEDEC JESD24-11 Switching', 'IEC 60747 Power Semiconductors', 'IEEE EDS Standards', 'BSIM4 Compact Modeling'],
      simulators: FEATURED_SEMICONDUCTOR_SIMULATORS,
      labCapacity: '4 Dedicated Physics Engines',
    },
  }[departmentId] || {
    name: 'Engineering Laboratory Department',
    shortName: 'Engineering',
    code: 'ENG-LAB',
    icon: <Zap className="w-8 h-8 text-cyan-400" />,
    color: '#06b6d4',
    accentBg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300',
    gradient: 'from-cyan-950/40 via-slate-900/90 to-slate-950',
    simCardHover: 'hover:border-cyan-500/60 hover:shadow-[0_0_25px_rgba(6,182,212,0.18)] group-hover:text-cyan-300',
    description: 'First-principles numerical simulation models.',
    governingLaw: 'Classical Physics & Conservation Laws',
    coreEquation: '\\nabla \\times \\vec{E} = -\\frac{\\partial \\vec{B}}{\\partial t}',
    equationDescription: "Faraday's Law of Electromagnetic Induction.",
    standards: ['International Engineering Standards'],
    simulators: FEATURED_ELECTRICAL_SIMULATORS,
    labCapacity: '4 Dedicated Physics Engines',
  };

  return (
    <div className="min-h-screen bg-[#080d16] text-slate-100 py-5 sm:py-8 px-4 sm:px-6 lg:px-10 xl:px-14 relative overflow-x-hidden w-full max-w-full">
      {/* Sticky Anchor & View Navigation Bar */}
      <DepartmentStickyBar
        departmentId={departmentId}
        departmentCode={departmentConfig.code}
        departmentName={departmentConfig.name}
        accentColor={departmentConfig.color}
        totalCount={departmentConfig.simulators.length}
        filteredCount={departmentConfig.simulators.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenWorksheet={() => {
          soundEngine.playRelayClick();
          setIsWorksheetOpen(true);
        }}
      />

      <div className="w-full max-w-[1720px] 2xl:max-w-[1800px] mx-auto space-y-6 sm:space-y-8">
        
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-400 min-w-0">
            <button
              onClick={onBackToHome}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-slate-300 hover:underline shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Departments</span>
            </button>
            <span className="text-slate-600 shrink-0">/</span>
            <span className="text-white font-bold truncate">{departmentConfig.name}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                soundEngine.playRelayClick();
                setIsWorksheetOpen(true);
              }}
              className="text-xs font-mono font-semibold px-2.5 py-1 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Open ABET Laboratory Worksheet Generator"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Lab Worksheet</span>
            </button>

            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${departmentConfig.accentBg}`}>
              {departmentConfig.code}
            </span>
            <span className="text-xs font-mono text-emerald-400 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1 font-bold hidden sm:flex">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% Physics Verified</span>
            </span>
          </div>
        </div>

        {/* Compact, Sleek Department Banner */}
        <div
          className={`relative rounded-2xl bg-gradient-to-r ${departmentConfig.gradient} border border-slate-800 p-5 sm:p-7 shadow-xl overflow-hidden`}
        >
          {/* Subtle Ambient Glow */}
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
            style={{ backgroundColor: departmentConfig.color }}
          />

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-lg shrink-0"
                  style={{ boxShadow: `0 8px 24px -4px ${departmentConfig.color}33` }}
                >
                  {departmentConfig.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Department Laboratory
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    <span className="text-[11px] font-mono font-semibold text-cyan-400">
                      {departmentConfig.labCapacity}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {departmentConfig.name}
                  </h1>
                </div>
              </div>

              {/* Core Equation Chip */}
              <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs font-bold text-cyan-300 shrink-0 shadow-inner flex items-center gap-2 max-w-full overflow-x-auto">
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider shrink-0">Law:</span>
                <MathView math={departmentConfig.coreEquation} />
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans max-w-3xl mb-4">
              {departmentConfig.description}
            </p>

            {/* Standards Referenced */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/80">
              <span className="text-xs font-mono font-semibold text-slate-400 flex items-center gap-1.5 mr-1">
                <Award className="w-3.5 h-3.5 text-cyan-400" />
                Referenced Standards Literature:
              </span>
              {departmentConfig.standards.map((std, i) => (
                <span
                  key={i}
                  className="text-xs font-mono px-2.5 py-0.8 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 font-medium"
                >
                  {std}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Curated Categorized Simulators Showcase (Immediately Above the Fold!) */}
        <DepartmentCategoryShowcase
          departmentId={departmentId}
          accentColor={departmentConfig.color}
          simulators={departmentConfig.simulators}
          onLaunchSimulator={onLaunchSimulator}
          onInspectSimulator={setInspectingSim}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Dedicated Subdomain Feature Section for Mechanical Digital Twins */}
        {departmentId === 'mechanical' && (
          <section className="relative mt-4 sm:mt-6 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-[#080d16] border border-amber-500/40 p-6 sm:p-8 shadow-2xl overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-3xl space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Specialized Subdomain Workbench
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60">API 610 / 617 / 618 Ref</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60">ASME B31.3 Ref</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60">AGMA 2001 Ref</span>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                  Advanced Mechanical Digital Twins
                </h2>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
                  For full-fidelity turbomachinery, rotor dynamics, and industrial process simulations referencing published methodologies from API 610, API 617, API 618, ASME B31.3, and AGMA standards literature for educational and technical exploration, visit our dedicated mechanical engineering workbench.
                </p>

                <p className="text-[11px] text-slate-400 leading-relaxed font-sans pt-2 border-t border-amber-500/20">
                  <strong className="text-amber-400/90 font-mono">Standards Citation &amp; Non-Affiliation Notice:</strong> All standard designations (including API, ASME, AGMA, ISO, and IEEE) are cited exclusively for technical identification and academic literature context under nominative fair use. LiveSimulators is an independent educational platform and is not affiliated with, endorsed by, certified by, or sponsored by any standards organization, nor does it claim copyright in published standards.
                </p>
              </div>

              <div className="shrink-0">
                <a
                  href="https://mech.livesimulators.com"
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-display font-bold text-sm sm:text-base shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-95 transition-all duration-200"
                >
                  <span>Launch Mechanical Digital Twins →</span>
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Interactive 60 FPS Concept Sandbox Hero Widget */}
        <DepartmentHeroSandbox
          departmentId={departmentId}
          accentColor={departmentConfig.color}
          onLaunchSimulator={onLaunchSimulator}
        />

        {/* Universal 4-Step Concept Progression Roadmap */}
        <DepartmentRoadmap
          departmentId={departmentId}
          accentColor={departmentConfig.color}
          onLaunchSimulator={onLaunchSimulator}
        />

        {/* Core Equations & LaTeX/Python Cheat Sheet */}
        <DepartmentFormulaCheatSheet
          departmentId={departmentId}
          accentColor={departmentConfig.color}
        />

        {/* Real-World Industry Case Studies */}
        <DepartmentIndustryApplications
          departmentId={departmentId}
          accentColor={departmentConfig.color}
        />

        {/* Referenced International Standards Matrix */}
        <DepartmentStandardsMatrix
          departmentId={departmentId}
          accentColor={departmentConfig.color}
        />

        {/* Machine & LLM Citable Knowledge Base (Taxonomy & State-Space) */}
        <DepartmentKnowledgeBlock
          departmentId={departmentId}
          accentColor={departmentConfig.color}
        />

        {/* Curricular & Numerical Solvers FAQ */}
        <DepartmentFaq
          departmentId={departmentId}
          accentColor={departmentConfig.color}
        />

        {/* Continuous Flow Navigation to Next Engineering Discipline */}
        <DepartmentNextNavigator
          currentDepartmentId={departmentId}
          onNavigateDepartment={(nextDeptId) => {
            if (onSelectDepartment) {
              onSelectDepartment(nextDeptId);
            } else {
              onBackToHome();
            }
          }}
        />

      </div>

      {/* Quick Model Inspector Drawer */}
      <DepartmentInspectorDrawer
        simulator={inspectingSim}
        accentColor={departmentConfig.color}
        departmentId={departmentId}
        onClose={() => setInspectingSim(null)}
        onLaunchSimulator={onLaunchSimulator}
      />

      {/* ABET Laboratory Worksheet Generator Modal */}
      <DepartmentLabWorksheetModal
        isOpen={isWorksheetOpen}
        onClose={() => setIsWorksheetOpen(false)}
        departmentId={departmentId}
        departmentName={departmentConfig.name}
        departmentCode={departmentConfig.code}
        accentColor={departmentConfig.color}
        simulators={departmentConfig.simulators}
      />
    </div>
  );
};
