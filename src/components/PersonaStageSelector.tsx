import React from 'react';
import {
  GraduationCap,
  Briefcase,
  Presentation,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { AudiencePersona } from '../types';

interface PersonaStageSelectorProps {
  onSelectStage?: (stage: AudiencePersona) => void;
  activeStage?: AudiencePersona;
}

export const PersonaStageSelector: React.FC<PersonaStageSelectorProps> = ({
  onSelectStage,
}) => {
  const handleStageClick = (stage: AudiencePersona, targetElementId: string) => {
    if (onSelectStage) {
      onSelectStage(stage);
    }
    const targetElement = document.getElementById(targetElementId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav 
      id="profile-stage-selector"
      className="relative z-20 py-4 sm:py-6 px-4 sm:px-6 lg:px-10 xl:px-14 w-full max-w-[1720px] 2xl:max-w-[1800px] mx-auto -mt-4 sm:-mt-6"
      aria-label="Engineering Experience Stage Router"
    >
      {/* Sleek, Single-Surface Stage Navigation Strip (Replaces 3 giant boxed cards) */}
      <div className="rounded-2xl border border-slate-800 bg-[#070c17]/90 backdrop-blur-xl p-3 sm:p-4 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        
        {/* Left: Purpose Signal */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
              <span>Dual-Track Engineering Stages</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-xs font-display font-bold text-white">
              Jump directly to your engineering domain:
            </div>
          </div>
        </div>

        {/* Center / Right: Direct Stage Router Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 lg:max-w-3xl">
          
          {/* Stage 2: Industrial Pro */}
          <button
            type="button"
            onClick={() => handleStageClick('engineers', 'industrial-labs')}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 text-left transition-all group flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Briefcase className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="truncate">
                <div className="text-[10px] font-mono text-amber-400 uppercase font-bold">Stage 2 • Pro</div>
                <div className="text-xs font-bold text-white group-hover:text-amber-300 truncate">Industrial Multi-Domain Suites</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>

          {/* Stage 1: Academic Fundamentals */}
          <button
            type="button"
            onClick={() => handleStageClick('students', 'departments-hub')}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 text-left transition-all group flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <GraduationCap className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="truncate">
                <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Stage 1 • Academic</div>
                <div className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">35+ Coursework Labs</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>

          {/* Faculty & Instruction */}
          <button
            type="button"
            onClick={() => handleStageClick('educators', 'audiences')}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Presentation className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="truncate">
                <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Faculty &amp; Labs</div>
                <div className="text-xs font-bold text-white group-hover:text-emerald-300 truncate">Lecture &amp; LMS Embeds</div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>

        </div>

      </div>
    </nav>
  );
};
