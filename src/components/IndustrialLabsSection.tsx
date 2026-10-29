import React, { useState } from 'react';
import {
  ArrowRight,
  Zap,
  Sparkles,
  Camera
} from 'lucide-react';
import { LABS, trackLabLaunch } from '../config/labs';
import { navigateTo } from '../utils/routes';
import { IndustrialLabAnimatedSLD } from './IndustrialLabAnimatedSLD';
import { soundEngine } from '../utils/audio';

const FAULT_CONFIG: Record<string, { trigger: string; reset: string; icon: string }> = {
  'safeops-ups': {
    trigger: 'Grid Loss',
    reset: 'Reset Grid',
    icon: '⚡',
  },
  'power-systems-lab': {
    trigger: '3Φ Bus Fault',
    reset: 'Reset Breaker',
    icon: '💥',
  },
  'power-electronics-lab': {
    trigger: 'Shoot-Through',
    reset: 'Reset Drives',
    icon: '⚠️',
  },
  'electrolive-electrical-safety': {
    trigger: 'Leakage Fault',
    reset: 'Reset ELCB',
    icon: '🛡️',
  },
  'mechanical-digital-twins': {
    trigger: 'Compressor Surge',
    reset: 'Reset Surge',
    icon: '🌀',
  },
};

export const IndustrialLabsSection: React.FC = () => {
  const [viewModes, setViewModes] = useState<Record<string, 'sld' | 'photo'>>({});
  const [faultStates, setFaultStates] = useState<Record<string, boolean>>({});

  const handleToggleFault = (labId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const willBeFault = !faultStates[labId];
    setFaultStates((prev) => ({ ...prev, [labId]: willBeFault }));

    if (willBeFault) {
      if (labId === 'power-systems-lab') {
        soundEngine.playArcFlash(0.4);
        setTimeout(() => soundEngine.playBreakerTrip(0.45), 90);
      } else if (labId === 'safeops-ups') {
        soundEngine.playAlarmChirp(0.35);
        setTimeout(() => soundEngine.playRelayClick(0.3), 120);
      } else if (labId === 'power-electronics-lab') {
        soundEngine.playRelayClick(0.3);
        soundEngine.playAlarmChirp(0.35);
      } else if (labId === 'mechanical-digital-twins') {
        soundEngine.playAlarmChirp(0.35);
        setTimeout(() => soundEngine.playBreakerTrip(0.35), 130);
      } else {
        soundEngine.playArcFlash(0.35);
        setTimeout(() => soundEngine.playBreakerTrip(0.4), 100);
      }
    } else {
      soundEngine.playRelayClick(0.35);
    }
  };

  return (
    <section
      id="industrial-labs"
      className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-[#050811] via-[#070d1a] to-[#050811] relative overflow-hidden border-t border-b border-cyan-500/20 w-full"
    >
      {/* High-Tech Background Ambience */}
      <div className="absolute inset-0 bg-tech-grid opacity-15 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[350px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[550px] h-[300px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Fluid full-width container fitting all desktop/laptop monitors */}
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative z-10">
        
        {/* Top Enterprise Section Banner */}
        <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-amber-500/15 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider mb-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>STAGE 2 • ENTERPRISE PRO SUITES • MISSION-CRITICAL SIMULATORS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white tracking-tight leading-tight">
            Industrial <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-400">Labs Pro</span>
          </h2>

          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed font-sans max-w-3xl mx-auto">
            High-accuracy, multi-module computational platforms built for practicing engineers, utilities, and EPC consultants. 
            Calibrated to published engineering standards (IEEE, IEC, NFPA, NERC, API, ASME) for zero-risk hardware testing, 
            fault mitigation, and operator training.
          </p>
        </div>

        {/* 5 Pro Cards Grid: Enriched & enlarged SLD area, 15% lower card height, single-line bottom learning CTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {LABS.map((lab) => (
            <div
              key={lab.id}
              id={`pro-lab-${lab.id}`}
              className="group relative bg-[#090e1a]/95 hover:bg-[#0c1424] border border-slate-800 hover:border-cyan-500/60 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col shadow-xl hover:shadow-[0_0_35px_rgba(6,182,212,0.18)]"
            >
              {/* Significantly Enlarged & Clear Working Animation Simulator Canvas */}
              <div className="relative h-60 sm:h-64 lg:h-68 w-full overflow-hidden bg-[#050914] border-b border-slate-800/80 shrink-0">
                
                {/* View Mode Toggle Pill & Interactive Fault Trigger (Top Left) */}
                <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/90 border border-slate-700/80 backdrop-blur-md shadow-lg">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewModes((prev) => ({ ...prev, [lab.id]: 'sld' }));
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                      (viewModes[lab.id] || 'sld') === 'sld'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Zap className="w-3 h-3 text-cyan-400" />
                    <span>LIVE SIM</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewModes((prev) => ({ ...prev, [lab.id]: 'photo' }));
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                      viewModes[lab.id] === 'photo'
                        ? 'bg-slate-800 text-white border border-slate-600 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Camera className="w-3 h-3 text-slate-400" />
                    <span>PHOTO</span>
                  </button>

                  {/* Interactive Card Fault Injector Button (When in SLD mode) */}
                  {(viewModes[lab.id] || 'sld') === 'sld' && (
                    <button
                      type="button"
                      onClick={(e) => handleToggleFault(lab.id, e)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all shadow-sm ${
                        faultStates[lab.id]
                          ? 'bg-rose-600 text-white border border-rose-400 animate-pulse shadow-[0_0_12px_rgba(225,29,72,0.6)]'
                          : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 hover:border-amber-400'
                      }`}
                      title={faultStates[lab.id] ? 'Click to reset back to normal' : 'Click to inject a live physics fault with realistic audio'}
                    >
                      <span>{faultStates[lab.id] ? '↺' : FAULT_CONFIG[lab.id]?.icon || '⚡'}</span>
                      <span className="font-semibold">{faultStates[lab.id] ? FAULT_CONFIG[lab.id]?.reset || 'RESET' : FAULT_CONFIG[lab.id]?.trigger || 'FAULT'}</span>
                    </button>
                  )}
                </div>

                {/* Render Animated SLD (Default) or Photo */}
                {(viewModes[lab.id] || 'sld') === 'sld' ? (
                  <div className="w-full h-full relative cursor-crosshair">
                    <IndustrialLabAnimatedSLD 
                      labId={lab.id} 
                      accentColor={lab.accent} 
                      isFaultActive={!!faultStates[lab.id]} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
                  </div>
                ) : (
                  <div className="w-full h-full relative">
                    <img
                      src={lab.shot}
                      alt={`${lab.name} - Interactive Engineering Simulation Lab`}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90" />
                  </div>
                )}
              </div>

              {/* Compact Title & Specification Meta Row */}
              <div className="px-3.5 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-2 bg-[#080d1c]">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="text-sm sm:text-base font-display font-extrabold text-white group-hover:text-cyan-300 transition-colors tracking-tight truncate">
                    {lab.name}
                  </h3>
                  <span className="text-[10px] font-mono font-semibold text-slate-400 shrink-0">
                    • {lab.modules} Modules
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 bg-slate-900 border border-slate-700/80 font-bold">
                    {lab.standardBadge}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-[9.5px] font-mono font-black uppercase tracking-wider border shadow-sm"
                    style={{
                      backgroundColor: `${lab.accent}20`,
                      borderColor: `${lab.accent}60`,
                      color: lab.accent,
                    }}
                  >
                    PRO
                  </span>
                </div>
              </div>

              {/* Extreme Bottom One-Line Learning Callout Banner */}
              <a
                href={lab.url}
                target={lab.external ? '_blank' : undefined}
                rel={lab.external ? 'noopener' : undefined}
                onClick={(e) => {
                  trackLabLaunch(lab.id, 'cta_bottom_banner');
                  if (!lab.external && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
                    e.preventDefault();
                    navigateTo(lab.url);
                  }
                }}
                className="group/cta w-full py-2.5 px-2.5 sm:px-3 bg-gradient-to-r from-cyan-950/90 via-slate-900 to-amber-950/70 hover:from-cyan-900/95 hover:via-slate-800 hover:to-amber-900/85 border-t border-cyan-500/30 hover:border-cyan-400 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 mt-auto shadow-[0_-4px_15px_rgba(6,182,212,0.1)]"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover/cta:scale-110 transition-transform shrink-0" />
                <span className="text-[10px] sm:text-[11px] xl:text-[11.5px] font-display font-black uppercase tracking-tight text-white group-hover/cta:text-cyan-200 whitespace-nowrap text-center leading-none">
                  Click Here To Learn via Live Animations and Real Physics
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover/cta:translate-x-1 transition-transform shrink-0" />
              </a>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
