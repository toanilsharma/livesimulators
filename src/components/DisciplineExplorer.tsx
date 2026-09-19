import React, { useState } from 'react';
import { 
  Zap, 
  Sliders, 
  Cpu, 
  FlaskConical, 
  Building2, 
  Atom, 
  ArrowRight, 
  Layers, 
  Compass,
  Check,
  ChevronRight
} from 'lucide-react';
import { DISCIPLINES } from '../data/simulators';
import { DisciplineId } from '../types';
import { MathView } from './MathView';

interface DisciplineExplorerProps {
  onSelectDisciplineToFilter: (disciplineId: DisciplineId) => void;
  onOpenTopic: (topic: string) => void;
}

export const DisciplineExplorer: React.FC<DisciplineExplorerProps> = ({
  onSelectDisciplineToFilter,
  onOpenTopic,
}) => {
  const [selectedDiscipline, setSelectedDiscipline] = useState<DisciplineId>('electrical');

  const currentInfo = DISCIPLINES.find((d) => d.id === selectedDiscipline) || DISCIPLINES[0];

  const getIcon = (id: DisciplineId) => {
    switch (id) {
      case 'electrical': return <Zap className="w-5 h-5 text-cyan-400" />;
      case 'control': return <Sliders className="w-5 h-5 text-emerald-400" />;
      case 'mechanical': return <Cpu className="w-5 h-5 text-amber-400" />;
      case 'chemical': return <FlaskConical className="w-5 h-5 text-purple-400" />;
      case 'civil': return <Building2 className="w-5 h-5 text-pink-400" />;
      case 'physics': return <Atom className="w-5 h-5 text-sky-400" />;
    }
  };

  return (
    <section id="discipline-explorer" className="py-16 lg:py-24 border-b border-slate-800 bg-[#080d16]/90 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-wider uppercase">
            <Compass className="w-3.5 h-3.5" />
            <span>Curriculum & Research Coverage</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Explore by Engineering Discipline
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            From circuit transient dynamics to Navier-Stokes fluid mechanics and quantum potential wells. 
            Select any discipline to inspect governing physical models and active simulator engines.
          </p>
        </div>

        {/* 6 Discipline Nav Selector Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-8">
          {DISCIPLINES.map((disc) => {
            const isSelected = disc.id === selectedDiscipline;
            return (
              <button
                key={disc.id}
                onClick={() => setSelectedDiscipline(disc.id)}
                className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-cyan-500/70 bg-slate-900 shadow-md shadow-cyan-950/30 ring-1 ring-cyan-500/30'
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
                    {getIcon(disc.id)}
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">
                    {disc.code}
                  </span>
                </div>
                <div className="font-display text-xs font-bold text-white truncate w-full">
                  {disc.name.split('&')[0]}
                </div>
                <div className="font-mono text-[10px] text-slate-400 mt-1">
                  {disc.activeSimulatorsCount} Solvers Live
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Discipline Deep-Dive Engineering Panel */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-sm shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Col: Discipline Details & Core Equation */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-800/50 text-cyan-300 font-mono text-xs">
                    {currentInfo.code}
                  </span>
                  <h3 className="font-display text-2xl font-bold text-white">
                    {currentInfo.name}
                  </h3>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {currentInfo.description}
                </p>
              </div>

              {/* Governing Mathematical Formulation Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 uppercase tracking-wider">
                    Foundational Differential Equation
                  </span>
                  <span className="text-emerald-400 font-medium">
                    Continuous State Model
                  </span>
                </div>
                <div className="p-3 rounded bg-slate-900/90 font-mono text-cyan-300 text-xs sm:text-sm overflow-x-auto custom-scrollbar">
                  <MathView math={currentInfo.coreEquation} block />
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Integrated with adaptive step Runge-Kutta 4th Order numerical discretizer.
                </div>
              </div>

              {/* Sub-Specialties / Modules Grid */}
              <div className="space-y-3">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Core Simulation Modules in this Discipline:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentInfo.subfields.map((sub, i) => (
                    <button
                      key={i}
                      onClick={() => onOpenTopic(sub)}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 text-left transition-colors group"
                    >
                      <span className="text-xs font-medium text-slate-200 group-hover:text-cyan-300">
                        {sub}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Interactive Visual Lab Card for this Discipline */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono font-medium text-slate-200">
                      Discipline Lab Portal
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {currentInfo.activeSimulatorsCount} Active Simulations
                  </span>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/90 space-y-1">
                    <div className="font-mono text-slate-400 text-[10px] uppercase">
                      Classroom & Lab Suitability
                    </div>
                    <p className="text-slate-200">
                      Standard sophomore to graduate coursework, accreditation lab requirements (ABET), 
                      and industrial verification workflows.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/90 space-y-1">
                    <div className="font-mono text-slate-400 text-[10px] uppercase">
                      Physical Constants & Conservation
                    </div>
                    <p className="text-slate-200">
                      All calculations adhere to strict energy and momentum conservation laws with 
                      double-precision floating point stability.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onSelectDisciplineToFilter(currentInfo.id)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs font-mono transition-colors shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                >
                  <span>Launch {currentInfo.name.split('&')[0]} Simulators</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick specs box */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 text-slate-400">
                  <span className="text-slate-500 block">STATE VARIABLES:</span>
                  <span className="text-slate-200 font-semibold">Continuous Nodal</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 text-slate-400">
                  <span className="text-slate-500 block">EXPORT FORMAT:</span>
                  <span className="text-slate-200 font-semibold">CSV / JSON Data</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
