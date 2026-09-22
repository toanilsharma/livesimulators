import React, { useState } from 'react';
import {
  GraduationCap,
  Briefcase,
  Presentation,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Layers,
  Award
} from 'lucide-react';
import { AudiencePersona } from '../types';

interface PersonaStageSelectorProps {
  onSelectStage?: (stage: AudiencePersona) => void;
  activeStage?: AudiencePersona;
}

export const PersonaStageSelector: React.FC<PersonaStageSelectorProps> = ({
  onSelectStage,
  activeStage: controlledStage,
}) => {
  const [internalStage, setInternalStage] = useState<AudiencePersona>('engineers');
  const activeStage = controlledStage || internalStage;

  const handleStageClick = (stage: AudiencePersona, targetElementId: string) => {
    setInternalStage(stage);
    if (onSelectStage) {
      onSelectStage(stage);
    }
    
    // Smooth scroll to targeted experience section
    const targetElement = document.getElementById(targetElementId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section 
      id="profile-stage-selector"
      className="relative z-20 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto -mt-6 sm:-mt-8"
      aria-label="Engineering Experience Stage Selector"
    >
      {/* Background Frame */}
      <div className="rounded-3xl border border-cyan-500/30 bg-[#080e1a]/95 backdrop-blur-xl p-4 sm:p-6 lg:p-7 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden">
        
        {/* Subtle Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-5 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] font-bold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>TAILORED ENGINEERING STAGES</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight">
              Select Your Profile to Explore Specialized Tools
            </h2>
          </div>
          <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Dual-Track: Academic Fundamentals & Industrial Pro</span>
          </div>
        </div>

        {/* 3 Profile Stage Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-5">
          
          {/* STAGE 1: PRACTICING ENGINEERS (PROMINENT HIGHLIGHT) */}
          <div
            onClick={() => handleStageClick('engineers', 'industrial-labs')}
            className={`group cursor-pointer rounded-2xl p-5 sm:p-6 border transition-all duration-300 relative flex flex-col justify-between ${
              activeStage === 'engineers'
                ? 'bg-gradient-to-b from-cyan-950/50 via-slate-900 to-slate-950 border-cyan-500/80 shadow-[0_0_30px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/90'
            }`}
          >
            {/* Top Pro Ribbon */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/50 text-amber-300 font-mono text-[10px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>MISSION-CRITICAL SUITES</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">STAGE 2 • PRO</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-300 shadow-lg group-hover:scale-110 transition-transform">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-display font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                    Working Engineers & EPCs
                  </h3>
                  <div className="text-[11px] font-mono text-slate-400">Industry Utilities & Facilities</div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
                Calibrated to international engineering codes (IEEE, IEC, NFPA, NERC) for zero-risk hardware testing, transmission fault flow, and arc-flash boundaries.
              </p>

              {/* Core Suite Tags */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-cyan-300">Power Electronics</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-cyan-300">Power Systems</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-emerald-300">SafeOps UPS</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-amber-300">ElectroLive Safety</span>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-cyan-400 group-hover:text-cyan-300">
              <span className="flex items-center gap-1.5">
                <span>Explore Industrial Labs Pro</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* STAGE 2: ENGINEERING STUDENTS */}
          <div
            onClick={() => handleStageClick('students', 'departments-hub')}
            className={`group cursor-pointer rounded-2xl p-5 sm:p-6 border transition-all duration-300 relative flex flex-col justify-between ${
              activeStage === 'students'
                ? 'bg-gradient-to-b from-blue-950/50 via-slate-900 to-slate-950 border-blue-500/80 shadow-[0_0_30px_rgba(59,130,246,0.25)] ring-1 ring-blue-400/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/90'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/40 text-blue-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                <GraduationCap className="w-3 h-3 text-blue-400" />
                <span>COURSEWORK & PRE-LABS</span>
              </span>
              <span className="text-[10px] font-mono text-blue-400 font-bold">STAGE 1 • ACADEMIC</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-300 shadow-lg group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-display font-extrabold text-white group-hover:text-blue-300 transition-colors">
                    Engineering Students
                  </h3>
                  <div className="text-[11px] font-mono text-slate-400">Undergraduate & Graduate</div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
                Replace textbook formula memorization with real-time physical understanding. Sweep parameters live in circuits, beam deflection, and thermodynamics.
              </p>

              {/* Core Suite Tags */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-300">RLC Resonant</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-300">Op-Amps & Sallen-Key</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-300">Beam Flexure</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-300">PID Tank</span>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
              <span>Explore 30+ Fundamentals</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* STAGE 3: PROFESSORS & FACULTY */}
          <div
            onClick={() => handleStageClick('educators', 'audiences')}
            className={`group cursor-pointer rounded-2xl p-5 sm:p-6 border transition-all duration-300 relative flex flex-col justify-between ${
              activeStage === 'educators'
                ? 'bg-gradient-to-b from-emerald-950/50 via-slate-900 to-slate-950 border-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/90'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                <Presentation className="w-3 h-3 text-emerald-400" />
                <span>LECTURE & LMS INTEGRATION</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">STAGE 3 • FACULTY</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-300 shadow-lg group-hover:scale-110 transition-transform">
                  <Presentation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-display font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                    Professors & Faculty
                  </h3>
                  <div className="text-[11px] font-mono text-slate-400">Universities & STEM Colleges</div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
                Project live simulations during lectures, verify syllabus concepts, and embed interactive workbench frames directly into Canvas or Moodle with zero IT installation.
              </p>

              {/* Core Suite Tags */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-300">Canvas / Moodle Iframe</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-300">Textbook Aligned</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-300">Live Lecture Projections</span>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
              <span>View Educator Workflows</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
