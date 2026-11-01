import React, { useState } from 'react';
import { Calculator, ChevronDown, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';
import { SimulatorItem } from '../types';
import { MathView } from './MathView';
import { WorkedCalculationResult } from '../utils/workedCalculations';

interface WorkedCalculationDrawerProps {
  simulator: SimulatorItem;
  calculation: WorkedCalculationResult;
  isOpenDefault?: boolean;
}

export const WorkedCalculationDrawer: React.FC<WorkedCalculationDrawerProps> = ({
  simulator,
  calculation,
  isOpenDefault = false,
}) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);

  const getRegimeBadge = () => {
    switch (calculation.regime) {
      case 'fault':
        return {
          bg: 'bg-rose-500/20',
          text: 'text-rose-400',
          border: 'border-rose-500/50',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />,
          label: 'FAULT / SATURATION',
        };
      case 'marginal':
        return {
          bg: 'bg-amber-500/20',
          text: 'text-amber-400',
          border: 'border-amber-500/50',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
          label: 'MARGINAL ZONE',
        };
      default:
        return {
          bg: 'bg-emerald-500/20',
          text: 'text-emerald-400',
          border: 'border-emerald-500/50',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
          label: 'NORMAL SOA',
        };
    }
  };

  const badge = getRegimeBadge();

  return (
    <div className="w-full bg-slate-900/95 border-t border-slate-800 transition-all duration-200">
      {/* Drawer Toggle Header Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-850/80 transition-colors focus:outline-none group select-none"
        aria-expanded={isOpen}
        title="Toggle live step-by-step mathematical substitution drawer"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 group-hover:bg-cyan-500/20 transition-colors shrink-0">
            <Calculator className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-mono font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
              Live Worked Calculation
            </span>
            <span className="text-slate-600 text-[10px] hidden sm:inline">•</span>
            <span className="text-[11px] font-mono text-cyan-300/80 truncate hidden sm:inline">
              {calculation.solvedValueFormatted}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Live Operating Regime Chip */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${badge.bg} ${badge.text} ${badge.border}`}
          >
            {badge.icon}
            <span>{badge.label}</span>
          </span>

          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-cyan-400' : ''
            }`}
          />
        </div>
      </button>

      {/* Expandable Worked Calculation Body */}
      {isOpen && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-800/80 bg-slate-950/90 text-xs font-sans space-y-3 animate-in fade-in duration-150">
          
          {/* Header & Subtitle */}
          <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-mono text-slate-400">
            <span className="font-semibold text-slate-300">{calculation.title}</span>
            {calculation.governingStandard && (
              <span className="text-[10px] text-cyan-400/90 bg-cyan-950/60 border border-cyan-800/50 px-1.5 py-0.5 rounded">
                Standard: {calculation.governingStandard.split('/')[0].trim()}
              </span>
            )}
          </div>

          {/* Three-Step Pedagogical Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            
            {/* STEP 1: Symbolic Governing Formula */}
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 tracking-wider flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px]">1</span>
                    <span>Symbolic Formula</span>
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">KaTeX Form</span>
                </div>
                <div className="py-2 px-1 text-center bg-slate-950/80 rounded border border-slate-800/60 overflow-x-auto custom-scrollbar">
                  <MathView math={calculation.symbolicLatex} displayMode={true} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 leading-snug">
                {calculation.formulaDescription}
              </p>
            </div>

            {/* STEP 2: Live Numerical Substitution */}
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-400 tracking-wider flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px]">2</span>
                    <span>Live Substitution</span>
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">Live 100ms</span>
                </div>
                <div className="py-2 px-1 text-center bg-slate-950/80 rounded border border-slate-800/60 overflow-x-auto custom-scrollbar">
                  <MathView math={calculation.substitutionLatex} displayMode={true} />
                </div>
              </div>
              <div className="flex flex-wrap gap-1 text-[9px] font-mono text-slate-300">
                {calculation.parameterHighlights.map((ph, idx) => (
                  <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                    <strong className="text-amber-400">{ph.symbol}:</strong> {ph.value} {ph.unit}
                  </span>
                ))}
              </div>
            </div>

            {/* STEP 3: Solved Output & Operating Regime Status */}
            <div className={`p-2.5 rounded-lg bg-slate-900 border ${badge.border} flex flex-col justify-between space-y-2`}>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold uppercase ${badge.text} tracking-wider flex items-center gap-1`}>
                    <span className={`w-4 h-4 rounded-full ${badge.bg} ${badge.text} flex items-center justify-center text-[10px]`}>3</span>
                    <span>Operating Regime</span>
                  </span>
                  <span className={`text-[9px] font-mono font-bold uppercase ${badge.text}`}>
                    {calculation.regime}
                  </span>
                </div>

                <div className={`p-2 rounded bg-slate-950/90 border ${badge.border} text-xs font-mono font-bold ${badge.text}`}>
                  {calculation.regimeTitle}
                </div>

                <p className="text-[11px] text-slate-300 leading-snug">
                  {calculation.regimeDescription}
                </p>
              </div>

              <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Output Solved:</span>
                <span className="font-bold text-cyan-300">{calculation.solvedValueFormatted}</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
