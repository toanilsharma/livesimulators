import React from 'react';
import { 
  Activity, 
  ArrowLeft, 
  Home, 
  Search, 
  Compass, 
  AlertOctagon, 
  ArrowRight,
  Zap,
  Sliders,
  Cpu,
  Building2
} from 'lucide-react';
import { FEATURED_ELECTRICAL_SIMULATORS, ALL_AVAILABLE_SIMULATORS, DISCIPLINES } from '../../data/simulators';
import { SimulatorItem, DisciplineId } from '../../types';

interface NotFoundPageProps {
  attemptedPath?: string;
  onGoHome: () => void;
  onOpenSearch: () => void;
  onSelectSimulator: (sim: SimulatorItem) => void;
  onSelectDepartment: (deptId: DisciplineId) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  attemptedPath,
  onGoHome,
  onOpenSearch,
  onSelectSimulator,
  onSelectDepartment
}) => {
  // Top featured simulators across key disciplines
  const topSimulators = [
    ALL_AVAILABLE_SIMULATORS.find((s) => s.id === 'rlc-resonance') || FEATURED_ELECTRICAL_SIMULATORS[0],
    ALL_AVAILABLE_SIMULATORS.find((s) => s.id === 'pid-temperature-controller') || ALL_AVAILABLE_SIMULATORS[1],
    ALL_AVAILABLE_SIMULATORS.find((s) => s.id === 'beam-deflection') || ALL_AVAILABLE_SIMULATORS[2],
    ALL_AVAILABLE_SIMULATORS.find((s) => s.id === 'buck-boost-converter') || ALL_AVAILABLE_SIMULATORS[3],
  ];

  return (
    <div className="min-h-screen bg-[#080d16] text-slate-100 font-sans selection:bg-cyan-500/25 selection:text-cyan-200 relative overflow-x-hidden w-full max-w-full">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-tech-grid opacity-15 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-red-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[400px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10 flex flex-col items-center text-center">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="font-display text-2xl font-extrabold tracking-tight text-white">
            LIVE <span className="text-cyan-400">SIMULATORS</span>
          </span>
        </div>

        {/* 404 Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-mono mb-6">
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>STATUS: 404_ROUTE_UNDEFINED</span>
        </div>

        {/* Main 404 Glitch-styled Heading */}
        <h1 className="text-6xl sm:text-8xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-pink-400 to-cyan-400 tracking-tight leading-none mb-4">
          404
        </h1>

        <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight mb-3">
          Coordinate Not Found in Numerical Field
        </h2>

        <p className="text-slate-400 text-xs sm:text-sm max-w-lg leading-relaxed mb-6 font-sans">
          The requested route {attemptedPath ? <code className="text-cyan-300 font-mono bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">{attemptedPath}</code> : 'path'} does 
          not correspond to an active engineering simulator, department workbench, or institutional page.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-14">
          <button
            onClick={onGoHome}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-display font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
            id="404-home-btn"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home Hub</span>
          </button>

          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono transition-all"
            id="404-search-btn"
          >
            <Search className="w-4 h-4 text-cyan-400" />
            <span>Search All Simulators (Ctrl+K)</span>
          </button>
        </div>

        {/* Recommended Top Simulators Grid */}
        <div className="w-full max-w-3xl text-left bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl mb-10">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                Recommended Engineering Simulators
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">FIRST-PRINCIPLES SOLVERS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topSimulators.map((sim) => (
              <div
                key={sim.id}
                onClick={() => onSelectSimulator(sim)}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 cursor-pointer group transition-all"
              >
                <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
                  <span className="text-cyan-400">{sim.disciplineName}</span>
                  <span className="text-slate-500">{sim.difficulty}</span>
                </div>
                <h4 className="font-display font-bold text-sm text-white group-hover:text-cyan-300 transition-colors flex items-center justify-between">
                  <span>{sim.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-cyan-400" />
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {sim.tagline}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Department Links */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-slate-400">
          <span className="text-slate-600">Departments:</span>
          {DISCIPLINES.map((d) => (
            <button
              key={d.id}
              onClick={() => onSelectDepartment(d.id)}
              className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition-colors"
            >
              {d.name.split(' ')[0]}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};
