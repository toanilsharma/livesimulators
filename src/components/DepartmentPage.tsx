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
  Gauge
} from 'lucide-react';
import { DisciplineId, SimulatorItem } from '../types';
import {
  FEATURED_ELECTRICAL_SIMULATORS,
  FEATURED_MECHANICAL_SIMULATORS,
  FEATURED_CIVIL_SIMULATORS,
  FEATURED_INSTRUMENTATION_SIMULATORS,
} from '../data/simulators';
import { MathView } from './MathView';

interface DepartmentPageProps {
  departmentId: DisciplineId;
  onBackToHome: () => void;
  onLaunchSimulator: (sim: SimulatorItem) => void;
}

// Mini dynamic canvas preview for card thumbnails
const SimulatorCardPreview: React.FC<{ type: string; accentColor: string }> = ({ type, accentColor }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.025;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Dark Tech Background with Grid
      ctx.fillStyle = '#060b13';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(30, 41, 59, 0.35)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      if (type === 'rlc') {
        const midY = h * 0.5;
        // Voltage wave (cyan)
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let x = 10; x < w - 10; x++) {
          const y = midY - Math.sin((x / 20) + t) * (h * 0.35);
          if (x === 10) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Current wave (amber, shifted)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 10; x < w - 10; x++) {
          const y = midY - Math.sin((x / 20) + t - 1.1) * (h * 0.25);
          if (x === 10) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (type === 'three_phase') {
        const midY = h * 0.5;
        const colors = ['#ef4444', '#eab308', '#2563eb'];
        colors.forEach((col, i) => {
          ctx.strokeStyle = col;
          ctx.lineWidth = 2;
          ctx.beginPath();
          const phi = (i * 2 * Math.PI) / 3;
          for (let x = 10; x < w - 10; x++) {
            const y = midY - Math.sin((x / 22) + t - phi) * (h * 0.35);
            if (x === 10) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });
      } else if (type === 'four_bar') {
        const cx = w * 0.5;
        const cy = h * 0.6;
        const r = 26;
        const crankAngle = t * 1.5;
        const bx = cx - 35 + Math.cos(crankAngle) * r;
        const by = cy - Math.sin(crankAngle) * r;
        const dx = cx + 35;
        const dy = cy;

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx - 35, cy);
        ctx.lineTo(dx, dy);
        ctx.stroke();

        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 35, cy);
        ctx.lineTo(bx, by);
        ctx.stroke();

        ctx.strokeStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(dx, cy - 25);
        ctx.stroke();

        ctx.strokeStyle = '#ec4899';
        ctx.beginPath();
        ctx.moveTo(dx, cy - 25);
        ctx.lineTo(dx, dy);
        ctx.stroke();
      } else if (type === 'beam_deflection') {
        const midY = h * 0.35;
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(15, midY);
        ctx.lineTo(w - 15, midY);
        ctx.stroke();

        // Deformed curve
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 15; x < w - 15; x++) {
          const norm = (x - 15) / (w - 30);
          const defl = Math.sin(norm * Math.PI) * (20 + Math.sin(t) * 4);
          if (x === 15) ctx.moveTo(x, midY + defl);
          else ctx.lineTo(x, midY + defl);
        }
        ctx.stroke();

        // Load Arrow
        ctx.strokeStyle = '#ef4444';
        ctx.fillStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        const px = w * 0.5;
        ctx.beginPath();
        ctx.moveTo(px, midY - 20);
        ctx.lineTo(px, midY + 18);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px, midY + 18);
        ctx.lineTo(px - 4, midY + 10);
        ctx.lineTo(px + 4, midY + 10);
        ctx.closePath();
        ctx.fill();
      } else if (type === 'pid') {
        // Step response graph
        const midY = h * 0.8;
        const topY = h * 0.25;
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(15, topY);
        ctx.lineTo(w - 15, topY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let x = 15; x < w - 15; x++) {
          const norm = (x - 15) / (w - 30);
          const curve = 1 - Math.exp(-norm * 5) * Math.cos(norm * 12);
          const y = midY - curve * (midY - topY);
          if (x === 15) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (type === 'harmonic') {
        const midY = h * 0.5;
        const amp = 18 + Math.sin(t * 2) * 8;
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(w * 0.5 - 20, midY - amp - 10, 40, 20);

        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w * 0.5, 10);
        for (let i = 0; i < 8; i++) {
          const sx = w * 0.5 + (i % 2 === 0 ? -8 : 8);
          const sy = 10 + ((i + 1) / 9) * (midY - amp - 20);
          ctx.lineTo(sx, sy);
        }
        ctx.lineTo(w * 0.5, midY - amp - 10);
        ctx.stroke();
      } else {
        // High-precision sinusoidal scan line
        const midY = h * 0.5;
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let x = 10; x < w - 10; x++) {
          const y = midY - Math.sin((x / 18) + t) * (h * 0.32);
          if (x === 10) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [type, accentColor]);

  return (
    <div className="relative w-full h-24 sm:h-28 rounded-xl overflow-hidden border border-slate-800 bg-slate-950/80 shadow-inner">
      <canvas ref={canvasRef} width={340} height={112} className="w-full h-full block" />
      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700/80 text-[10px] font-mono text-cyan-400 font-bold">
        60 FPS LIVE
      </div>
    </div>
  );
};

export const DepartmentPage: React.FC<DepartmentPageProps> = ({
  departmentId,
  onBackToHome,
  onLaunchSimulator,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'Fundamentals' | 'Intermediate' | 'Advanced'>('all');

  const departmentConfig = {
    electrical: {
      name: 'Electrical & Electronic Systems',
      shortName: 'Electrical',
      code: 'EE-200 DEPARTMENT',
      icon: <Zap className="w-10 h-10 text-cyan-400" />,
      color: '#06b6d4',
      accentBg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300',
      gradient: 'from-cyan-950/40 via-slate-900/90 to-slate-950',
      description: 'First-principles numerical models spanning analog circuit transient response, high-frequency RF transmission line reflections, switching power converter topologies, and three-phase rotating stator magnetic fields.',
      governingLaw: "Maxwell's Equations & Kirchhoff's Differential Laws",
      coreEquation: "v(t) = L \\frac{di}{dt} + R i(t) + \\frac{1}{C}\\int i(t)dt",
      equationDescription: 'Total dynamic voltage balance across resistive, inductive, and capacitive impedances.',
      standards: ['IEEE 1547 Grid Interconnection', 'IEEE 519 Harmonic Control', 'IEC 60034 Rotating Electrical Machines', 'IEC 62040 Switching Power'],
      simulators: FEATURED_ELECTRICAL_SIMULATORS,
      subfields: ['Power Electronics & Inverters', 'RF Transmission Lines & Smith Charts', 'Active Analog Biquad Filters', '3-Phase AC Grids & Phasors'],
      labCapacity: '18 Physics Engines Active',
    },
    mechanical: {
      name: 'Mechanical & Thermal Dynamics',
      shortName: 'Mechanical',
      code: 'ME-400 DEPARTMENT',
      icon: <Cpu className="w-10 h-10 text-amber-400" />,
      color: '#f59e0b',
      accentBg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
      gradient: 'from-amber-950/40 via-slate-900/90 to-slate-950',
      description: 'Kinematic mechanism synthesis, thermodynamic steam power generation cycles, damped harmonic resonance vibration isolation, and AGMA involute conjugate gear meshing.',
      governingLaw: "Newtonian Classical Mechanics & 1st/2nd Laws of Thermodynamics",
      coreEquation: "m\\ddot{x} + c\\dot{x} + kx = F_0 \\cos(\\omega t)",
      equationDescription: 'Second-order linear differential equation governing forced damped harmonic oscillators.',
      standards: ['ASME PTC 4.4 Steam Generators', 'ISO 6336 Gear Load Capacity', 'ISO 10816 Mechanical Vibration', 'AGMA 2001 Involute Standard'],
      simulators: FEATURED_MECHANICAL_SIMULATORS,
      subfields: ['Planar Kinematic Synthesis', 'Rankine Steam Cycles & T-s Plots', 'Harmonic Vibration & Resonance', 'Involute Conjugate Gear Meshing'],
      labCapacity: '14 Physics Engines Active',
    },
    civil: {
      name: 'Civil & Structural Engineering',
      shortName: 'Civil',
      code: 'CE-320 DEPARTMENT',
      icon: <Building2 className="w-10 h-10 text-pink-400" />,
      color: '#ec4899',
      accentBg: 'bg-pink-500/15 border-pink-500/40 text-pink-300',
      gradient: 'from-pink-950/40 via-slate-900/90 to-slate-950',
      description: 'Differential beam bending equilibrium, moving truck live load truss bridge analysis, elastomeric seismic base isolation dynamics, and Mohr’s circle principal stress transformations.',
      governingLaw: "Euler-Bernoulli Beam Flexure & Navier-Cauchy Elastic Equilibrium",
      coreEquation: "EI \\frac{d^4 w}{dx^4} = q(x), \\quad \\sum \\vec{F}_{node} = 0",
      equationDescription: 'Fourth-order elastic beam deflection equilibrium under arbitrary distributed lateral loading.',
      standards: ['AISC 360-16 Structural Steel Buildings', 'AASHTO LRFD Bridge Design', 'ASCE 7-22 Seismic Criteria', 'ASTM D3080 Direct Shear'],
      simulators: FEATURED_CIVIL_SIMULATORS,
      subfields: ['Euler-Bernoulli Elastic Flexure', 'Warren & Pratt Truss Equilibrium', 'Lead-Rubber Bearing Seismic Isolation', 'Mohr-Coulomb Soil Shear Slip'],
      labCapacity: '11 Physics Engines Active',
    },
    control: {
      name: 'Instrumentation & Process Automation',
      shortName: 'Instrumentation',
      code: 'IC-300 DEPARTMENT',
      icon: <Sliders className="w-10 h-10 text-emerald-400" />,
      color: '#10b981',
      accentBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
      gradient: 'from-emerald-950/40 via-slate-900/90 to-slate-950',
      description: 'Closed-loop feedback stability with anti-windup PID tuning, IEC control valve flow capacity and cavitation prevention, 4-20mA smart transmitters with line drop burdens, and differential pressure orifice metering.',
      governingLaw: "Laplace Feedback Control & Bernoulli Fluid Energy Continuity",
      coreEquation: "u(t) = K_p e(t) + \\frac{K_p}{T_i}\\int e(\\tau)d\\tau + K_p T_d \\frac{de}{dt}",
      equationDescription: 'Ideal ISA parallel PID closed-loop control algorithm with dynamic rate anti-windup.',
      standards: ['ISA-75.01 Control Valve Sizing', 'IEC 60381-1 Analogue Current Signals', 'ISO 5167 Orifice Metering', 'NAMUR NE 43 Alarm Levels'],
      simulators: FEATURED_INSTRUMENTATION_SIMULATORS,
      subfields: ['Closed-Loop PID Tuning & Anti-Windup', 'Control Valve Trim Dynamics & Cavitation', '4-20mA Smart Current Loops', 'DP Orifice Fluid Flow Metering'],
      labCapacity: '12 Physics Engines Active',
    },
    chemical: {
      name: 'Chemical & Process Engineering',
      shortName: 'Chemical',
      code: 'CH-250 DEPARTMENT',
      icon: <FlaskConical className="w-10 h-10 text-violet-400" />,
      color: '#8b5cf6',
      accentBg: 'bg-violet-500/15 border-violet-500/40 text-violet-300',
      gradient: 'from-violet-950/40 via-slate-900/90 to-slate-950',
      description: 'Continuous Stirred Tank Reactors (CSTR), multi-component equilibrium distillation, and mass transfer diffusion.',
      governingLaw: "Arrhenius Reaction Kinetics & Fickian Diffusion",
      coreEquation: "\\frac{dC_A}{dt} = \\frac{F}{V}(C_{A0} - C_A) - k_0 e^{-E_a/RT} C_A^2",
      equationDescription: 'Dynamic mass balance of reactant concentration in a continuous stirred tank reactor.',
      standards: ['AIChE Standard Guidelines', 'API 520 Pressure Relieving Systems', 'ASME Section VIII Pressure Vessels'],
      simulators: FEATURED_INSTRUMENTATION_SIMULATORS.slice(0, 2),
      subfields: ['CSTR Chemical Kinetics', 'Binary Distillation Trays', 'Heat Transfer Exchangers'],
      labCapacity: '9 Physics Engines Active',
    },
    physics: {
      name: 'Quantum & Semiconductor Physics',
      shortName: 'Physics',
      code: 'PH-500 DEPARTMENT',
      icon: <Atom className="w-10 h-10 text-sky-400" />,
      color: '#38bdf8',
      accentBg: 'bg-sky-500/15 border-sky-500/40 text-sky-300',
      gradient: 'from-sky-950/40 via-slate-900/90 to-slate-950',
      description: 'P-N junction energy band bending, carrier drift-diffusion, and wave-particle dispersion.',
      governingLaw: "Schrödinger Wave Equation & Fermi-Dirac Statistics",
      coreEquation: "i\\hbar \\frac{\\partial}{\\partial t} \\Psi = \\hat{H}\\Psi",
      equationDescription: 'Time-dependent Schrödinger wave equation determining quantum state evolution.',
      standards: ['IEEE Electron Devices Society Guidelines', 'IUPAP Physical Standards'],
      simulators: FEATURED_ELECTRICAL_SIMULATORS.slice(0, 3),
      subfields: ['P-N Diode Band Diagram', 'Quantum Well Tunneling', 'Hall Effect Transport'],
      labCapacity: '8 Physics Engines Active',
    },
  }[departmentId] || {
    name: 'Engineering Laboratory Department',
    shortName: 'Engineering',
    code: 'ENG-LAB',
    icon: <Zap className="w-10 h-10 text-cyan-400" />,
    color: '#06b6d4',
    accentBg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300',
    gradient: 'from-cyan-950/40 via-slate-900/90 to-slate-950',
    description: 'First-principles numerical simulation models.',
    governingLaw: 'Classical Physics & Conservation Laws',
    coreEquation: '\\nabla \\times \\vec{E} = -\\frac{\\partial \\vec{B}}{\\partial t}',
    equationDescription: "Faraday's Law of Electromagnetic Induction.",
    standards: ['International Engineering Standards'],
    simulators: FEATURED_ELECTRICAL_SIMULATORS,
    subfields: ['Simulation Workbenches'],
    labCapacity: '10 Physics Engines Active',
  };

  // Filter simulators by search query and difficulty
  const filteredSimulators = departmentConfig.simulators.filter((sim) => {
    const matchesSearch =
      sim.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sim.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sim.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDifficulty =
      selectedDifficulty === 'all' || sim.difficulty === selectedDifficulty;

    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-[#080d16] text-slate-100 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 relative overflow-x-hidden w-full max-w-full">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-400 min-w-0">
            <button
              onClick={onBackToHome}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 sm:gap-2 text-slate-300 hover:underline shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>All Departments</span>
            </button>
            <span className="text-slate-600 shrink-0">/</span>
            <span className="text-white font-bold truncate">{departmentConfig.name}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className={`text-xs sm:text-sm font-mono font-bold px-2.5 sm:px-3 py-1 rounded-xl border ${departmentConfig.accentBg}`}>
              {departmentConfig.code}
            </span>
            <span className="text-[11px] sm:text-xs font-mono text-emerald-400 px-2.5 sm:px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">100% Physics Verified</span>
              <span className="xs:hidden">Verified</span>
            </span>
          </div>
        </div>

        {/* Master Department Hero Stage */}
        <div
          className={`relative rounded-3xl bg-gradient-to-r ${departmentConfig.gradient} border-2 border-slate-800 p-5 sm:p-8 md:p-12 shadow-2xl overflow-hidden`}
        >
          {/* Decorative Glow */}
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: departmentConfig.color }}
          />

          <div className="relative z-10 max-w-4xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 border-2 border-slate-700/80 flex items-center justify-center shadow-xl shrink-0"
                style={{ boxShadow: `0 12px 30px -6px ${departmentConfig.color}44` }}
              >
                {departmentConfig.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Engineering Department Laboratory
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <span className="text-xs font-mono font-semibold text-cyan-400">
                    {departmentConfig.labCapacity}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  {departmentConfig.name}
                </h1>
              </div>
            </div>

            <p className="text-lg sm:text-xl text-slate-200 leading-relaxed mb-8 max-w-3xl font-medium">
              {departmentConfig.description}
            </p>

            {/* Core Governing Principle & Analytical Equation */}
            <div className="bg-slate-950/90 border-2 border-slate-800/90 rounded-2xl p-5 sm:p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
              <div>
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Governing Principle & Mathematical Law:
                </div>
                <div className="text-base sm:text-lg font-bold text-white mb-1">
                  {departmentConfig.governingLaw}
                </div>
                <div className="text-xs text-slate-400">
                  {departmentConfig.equationDescription}
                </div>
              </div>

              <div className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-sm sm:text-base font-bold text-cyan-300 shrink-0 self-start md:self-auto shadow-inner overflow-x-auto custom-scrollbar">
                <MathView math={departmentConfig.coreEquation} />
              </div>
            </div>

            {/* Standards Complied With */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs sm:text-sm font-mono font-semibold text-slate-300 flex items-center gap-1.5 mr-1">
                <Award className="w-4 h-4 text-cyan-400" />
                Verified Standards:
              </span>
              {departmentConfig.standards.map((std, i) => (
                <span
                  key={i}
                  className="text-xs sm:text-sm font-mono px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 font-medium shadow-sm"
                >
                  {std}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Catalog Control Bar: Search & Difficulty Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
              <span>Dedicated Interactive Simulators</span>
              <span className="text-xs sm:text-sm font-mono px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-bold">
                {filteredSimulators.length} of {departmentConfig.simulators.length} Active
              </span>
            </h2>
            <p className="text-sm text-slate-300 mt-1">
              Select any simulator to launch its dedicated, full-screen interactive workbench with live vector canvas rendering.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter simulators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-700 max-w-full overflow-x-auto custom-scrollbar shrink-0">
              {(['all', 'Fundamentals', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedDifficulty(lvl)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedDifficulty === lvl
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl === 'all' ? 'All' : lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Simulators Grid: Large, Visually Engaging Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {filteredSimulators.map((sim) => (
            <div
              key={sim.id}
              id={`sim-card-${sim.id}`}
              className="group rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border-2 border-slate-800 hover:border-cyan-500/60 p-5 sm:p-7 md:p-8 transition-all duration-300 shadow-xl hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.25)] flex flex-col justify-between"
            >
              <div>
                {/* Top Badges & Physics Indicator */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-300">
                      {sim.badge}
                    </span>
                    <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                      {sim.difficulty}
                    </span>
                    <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-400">
                      {sim.disciplineName}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1 shrink-0 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    100% Physics
                  </span>
                </div>

                {/* Simulator Title */}
                <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-cyan-300 transition-colors mb-2.5 tracking-tight">
                  {sim.title}
                </h3>

                {/* Tagline */}
                <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed mb-4">
                  {sim.tagline}
                </p>

                {/* Animated Mini Canvas Preview */}
                <div className="mb-5">
                  <SimulatorCardPreview type={sim.type} accentColor={sim.accentColor || departmentConfig.color} />
                </div>

                {/* Governing Equation Box */}
                <div className="mb-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs sm:text-sm text-slate-300 overflow-x-auto custom-scrollbar shadow-inner">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Analytical Formulation ({sim.physicalLaw}):
                  </div>
                  <div className="text-cyan-300 font-bold">
                    <MathView math={sim.governingEquation} block />
                  </div>
                </div>

                {/* Key Metrics Readout Preview */}
                <div className="mb-4">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Real-Time Numerical Telemetry:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {sim.keyMetrics.map((km, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono"
                      >
                        <span className="text-slate-400 truncate">{km.label}</span>
                        <span className="text-cyan-300 font-bold shrink-0">{km.unit || 'unitless'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Continuous Parameter Preview Chips */}
                <div className="mb-6">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                    Adjustable Continuous Parameters:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sim.parameters.map((p) => (
                      <span
                        key={p.id}
                        className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/80 text-slate-300 font-medium"
                      >
                        <strong className="text-white">{p.symbol}</strong> ({p.min}–{p.max} {p.unit})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-xs font-mono text-slate-300 font-semibold">
                    Standard: {sim.standardReference || departmentConfig.standards[0]}
                  </span>
                  {sim.standardBody && (
                    <span className="text-[10px] font-mono text-emerald-400">
                      Authority: {sim.standardBody}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onLaunchSimulator(sim)}
                  id={`launch-btn-${sim.id}`}
                  className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-400/20 font-sans group/btn"
                >
                  <span>Launch Dedicated Simulator</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State if Search yielded no results */}
        {filteredSimulators.length === 0 && (
          <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-2">No simulators found</h3>
            <p className="text-sm text-slate-400 mb-4">
              No simulators in {departmentConfig.name} matched your search criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDifficulty('all');
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
