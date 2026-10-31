import React from 'react';
import {
  ArrowRight,
  Zap,
  Cpu,
  Building2,
  Sliders,
  FlaskConical,
  Atom,
  Sparkles,
  ChevronRight,
  Compass
} from 'lucide-react';
import { DisciplineId } from '../../types';
import { soundEngine } from '../../utils/audio';

interface DepartmentNextNavigatorProps {
  currentDepartmentId: DisciplineId;
  onNavigateDepartment: (deptId: DisciplineId) => void;
}

interface DisciplineTransitionInfo {
  nextId: DisciplineId;
  nextName: string;
  nextCode: string;
  nextIcon: React.ReactNode;
  accentColor: string;
  themeGradient: string;
  transitionTheme: string;
  rationale: string;
  previewSimulators: string[];
}

const DISCIPLINE_TRANSITIONS: Record<DisciplineId, DisciplineTransitionInfo> = {
  electrical: {
    nextId: 'control',
    nextName: 'Instrumentation & Process Control',
    nextCode: 'IC-300',
    nextIcon: <Sliders className="w-6 h-6 text-emerald-400" />,
    accentColor: '#10b981',
    themeGradient: 'from-emerald-950/40 via-slate-900/90 to-[#080d16]',
    transitionTheme: 'From Electromagnetic Transients to Closed-Loop Automation',
    rationale: 'Now that you have analyzed circuit impedances, switching harmonics, and electromagnetic wave reflections, advance to closed-loop negative feedback, anti-windup PID tuning, and hydrodynamic control valves.',
    previewSimulators: ['Closed-Loop PID Tuning', 'Control Valve Sizing', '4-20mA Telemetry Loops'],
  },
  control: {
    nextId: 'mechanical',
    nextName: 'Mechanical & Thermal Dynamics',
    nextCode: 'ME-400',
    nextIcon: <Cpu className="w-6 h-6 text-amber-400" />,
    accentColor: '#f59e0b',
    themeGradient: 'from-amber-950/40 via-slate-900/90 to-[#080d16]',
    transitionTheme: 'From Feedback Control Algorithms to Kinetic Machinery',
    rationale: 'Apply control theory principles to physical rotating actuators, four-bar kinematic linkages, multi-stage Rankine steam cycles, and damped mechanical vibration isolation.',
    previewSimulators: ['Four-Bar Linkage Kinematics', 'Rankine Steam Cycle', 'Damped Harmonic Resonance'],
  },
  mechanical: {
    nextId: 'civil',
    nextName: 'Civil & Structural Engineering',
    nextCode: 'CE-320',
    nextIcon: <Building2 className="w-6 h-6 text-rose-400" />,
    accentColor: '#f43f5e',
    themeGradient: 'from-rose-950/40 via-slate-900/90 to-[#080d16]',
    transitionTheme: 'From Machine Dynamics to Large-Scale Structural Statics',
    rationale: 'Scale from machine component kinematics to heavy infrastructure: indeterminate beam flexure, Warren/Pratt truss bridge moving loads, and elastomeric base isolation against seismic tremors.',
    previewSimulators: ['Euler-Bernoulli Beam Flexure', 'Truss Bridge Moving Load', 'Seismic Base Isolation'],
  },
  civil: {
    nextId: 'chemical',
    nextName: 'Chemical & Process Engineering',
    nextCode: 'CH-250',
    nextIcon: <FlaskConical className="w-6 h-6 text-violet-400" />,
    accentColor: '#8b5cf6',
    themeGradient: 'from-violet-950/40 via-slate-900/90 to-[#080d16]',
    transitionTheme: 'From Solid Infrastructure to Multiphase Transport & Reactions',
    rationale: 'Move from solid elastic mechanics into transport phenomena: non-isothermal CSTR thermal runaway, McCabe-Thiele fractional distillation trays, and TEMA shell-and-tube exchangers.',
    previewSimulators: ['CSTR Reactor Runaway', 'McCabe-Thiele Distillation', 'Shell-and-Tube Heat Exchanger'],
  },
  chemical: {
    nextId: 'physics',
    nextName: 'Quantum & Semiconductor Physics',
    nextCode: 'PH-500',
    nextIcon: <Atom className="w-6 h-6 text-cyan-400" />,
    accentColor: '#06b6d4',
    themeGradient: 'from-cyan-950/40 via-slate-900/90 to-[#080d16]',
    transitionTheme: 'From Molecular Reaction Rates to Quantum Wave Mechanics',
    rationale: 'Investigate the atomic and quantum foundations underlying all engineering: 1D quantum well tunneling, P-N junction band bending, and wide-bandgap Silicon Carbide (SiC) power switching.',
    previewSimulators: ['Quantum Tunneling Waves', 'P-N Junction Band Bending', 'Wide-Bandgap SiC Switching'],
  },
  physics: {
    nextId: 'electrical',
    nextName: 'Electrical & Electronic Systems',
    nextCode: 'EE-200',
    nextIcon: <Zap className="w-6 h-6 text-cyan-400" />,
    accentColor: '#06b6d4',
    themeGradient: 'from-cyan-950/40 via-slate-900/90 to-[#080d16]',
    transitionTheme: 'From Semiconductor Physics to Macroscopic Electrical Circuits',
    rationale: 'Complete the multidisciplinary loop by scaling solid-state electron physics into analog operational amplifiers, switching power converters, and high-voltage grid transmission networks.',
    previewSimulators: ['RLC Transient Resonance', 'Buck-Boost Switching Converter', '3-Phase Rotating AC Grid'],
  },
};

const ALL_DISCIPLINES: Array<{ id: DisciplineId; code: string; name: string; icon: React.ReactNode; color: string }> = [
  { id: 'electrical', code: 'EE-200', name: 'Electrical & Electronics', icon: <Zap className="w-4 h-4 text-cyan-400" />, color: '#06b6d4' },
  { id: 'control', code: 'IC-300', name: 'Instrumentation & Control', icon: <Sliders className="w-4 h-4 text-emerald-400" />, color: '#10b981' },
  { id: 'mechanical', code: 'ME-400', name: 'Mechanical & Thermal', icon: <Cpu className="w-4 h-4 text-amber-400" />, color: '#f59e0b' },
  { id: 'civil', code: 'CE-320', name: 'Civil & Structural', icon: <Building2 className="w-4 h-4 text-rose-400" />, color: '#f43f5e' },
  { id: 'chemical', code: 'CH-250', name: 'Chemical & Process', icon: <FlaskConical className="w-4 h-4 text-violet-400" />, color: '#8b5cf6' },
  { id: 'physics', code: 'PH-500', name: 'Quantum & Semiconductors', icon: <Atom className="w-4 h-4 text-cyan-400" />, color: '#06b6d4' },
];

export const DepartmentNextNavigator: React.FC<DepartmentNextNavigatorProps> = ({
  currentDepartmentId,
  onNavigateDepartment,
}) => {
  const transition = DISCIPLINE_TRANSITIONS[currentDepartmentId] || DISCIPLINE_TRANSITIONS.electrical;

  const handleNextClick = () => {
    soundEngine.playRelayClick();
    onNavigateDepartment(transition.nextId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDisciplineClick = (deptId: DisciplineId) => {
    soundEngine.playRelayClick();
    onNavigateDepartment(deptId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section
      id="next-navigator"
      aria-label="Next Recommended Discipline Navigation"
      className="mt-14 sm:mt-20 pt-8 border-t border-slate-800/80 space-y-8"
    >
      {/* Featured Next Progression Banner */}
      <div className={`relative rounded-2xl bg-gradient-to-br ${transition.themeGradient} border border-slate-700/80 p-6 sm:p-8 lg:p-10 shadow-2xl overflow-hidden`}>
        {/* Ambient Glow */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ backgroundColor: transition.accentColor }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1.5"
                style={{
                  backgroundColor: `${transition.accentColor}18`,
                  borderColor: `${transition.accentColor}40`,
                  color: transition.accentColor,
                }}
              >
                <Compass className="w-3.5 h-3.5" />
                Next Discipline in Curricular Flow
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                {transition.nextCode}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
              {transition.transitionTheme}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {transition.rationale}
            </p>

            {/* Preview Simulators Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-[11px] font-mono text-slate-400">Featured Laboratories:</span>
              {transition.previewSimulators.map((simTitle, idx) => (
                <span
                  key={idx}
                  className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300"
                >
                  {simTitle}
                </span>
              ))}
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="shrink-0">
            <button
              onClick={handleNextClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-slate-950 font-display font-black text-sm sm:text-base shadow-xl transition-all duration-200 active:scale-95 group"
              style={{
                backgroundColor: transition.accentColor,
              }}
            >
              <span>Explore {transition.nextName}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Universal 6-Discipline Direct Quick-Switcher Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Switch Engineering Disciplines</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Direct Access to All Virtual Laboratories
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {ALL_DISCIPLINES.map((dept) => {
            const isCurrent = dept.id === currentDepartmentId;

            return (
              <button
                key={dept.id}
                disabled={isCurrent}
                onClick={() => handleDisciplineClick(dept.id)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                  isCurrent
                    ? 'bg-slate-900/80 border-cyan-500/50 cursor-default ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700 cursor-pointer active:scale-95'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    {dept.icon}
                  </span>
                  <span
                    className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: `${dept.color}15`,
                      color: dept.color,
                    }}
                  >
                    {dept.code}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-bold text-white leading-snug truncate">
                    {dept.name}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {isCurrent ? '• Active Lab Hub' : 'Launch Hub →'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </section>
  );
};
