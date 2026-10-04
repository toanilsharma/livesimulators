import React, { useState } from 'react';
import {
  ExternalLink,
  ArrowRight,
  FlaskConical,
  Layers,
  ShieldCheck,
  Zap,
  Cpu,
  Globe2,
  Sparkles,
  Server,
  Camera,
  Cog
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

          {/* Global Industry Target Trust Strip */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-left">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Server className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">Tier IV Data Centers</div>
                <div className="text-[10px] text-slate-400 font-mono truncate">Continuous Power & PUE</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Globe2 className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">High-Voltage Grids</div>
                <div className="text-[10px] text-slate-400 font-mono truncate">Transmission & Fault Flow</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Cpu className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">Semiconductor Fabs</div>
                <div className="text-[10px] text-slate-400 font-mono truncate">SiC/GaN PWM Dynamics</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">EHS & Arc-Flash Safety</div>
                <div className="text-[10px] text-slate-400 font-mono truncate">NFPA 70E / IEEE 1584</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 col-span-2 sm:col-span-1 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                <Cog className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">Turbomachinery Plants</div>
                <div className="text-[10px] text-slate-400 font-mono truncate">API 610/617 & ASME B31.3</div>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Pro Cards Grid: Large Prominent Animation Simulators & Minimalist Text */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {LABS.map((lab) => (
            <div
              key={lab.id}
              id={`pro-lab-${lab.id}`}
              className="group relative bg-[#090e1a]/95 hover:bg-[#0c1424] border border-slate-800 hover:border-cyan-500/60 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col shadow-xl hover:shadow-[0_0_35px_rgba(6,182,212,0.18)]"
            >
              {/* Pro Badge Ribbon */}
              <div className="absolute top-3 right-3 z-20 pointer-events-none">
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-widest backdrop-blur-md shadow-md border"
                  style={{
                    backgroundColor: `${lab.accent}25`,
                    borderColor: `${lab.accent}70`,
                    color: lab.accent,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: lab.accent }} />
                  <span>PRO SUITE</span>
                </span>
              </div>

              {/* Large Impressive Working Animation Simulator Canvas (~70% of Card) */}
              <div className="relative h-64 sm:h-72 lg:h-80 w-full overflow-hidden bg-[#050914] border-b border-slate-800/80 shrink-0">
                
                {/* View Mode Toggle Pill & Interactive Fault Trigger (Top Left) */}
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/90 border border-slate-700/80 backdrop-blur-md shadow-lg">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-50 pointer-events-none" />
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

                {/* Overlaid Technical Badge Strip */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                  <span 
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-md border shadow-md"
                    style={{ 
                      backgroundColor: `${lab.accent}25`, 
                      borderColor: `${lab.accent}60`, 
                      color: '#ffffff',
                    }}
                  >
                    <Layers className="w-3.5 h-3.5" style={{ color: lab.accent }} />
                    <span>{lab.modules} Interactive Modules</span>
                  </span>

                  <span className="px-2.5 py-1 rounded-lg bg-slate-950/85 border border-slate-700/80 text-[11px] font-mono text-cyan-300 uppercase tracking-wider backdrop-blur-md font-bold">
                    {lab.standardBadge}
                  </span>
                </div>
              </div>

              {/* Reduced Text & Clean Action Section (~30% of Card) */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                      {lab.deploymentType}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Float64 Solver Kernel
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-display font-extrabold text-white group-hover:text-cyan-300 transition-colors tracking-tight line-clamp-1">
                    {lab.name}
                  </h3>

                  <p className="mt-1 text-slate-300 text-xs leading-relaxed font-sans line-clamp-2">
                    {lab.tagline}
                  </p>

                  {/* Concise Engineering Capabilities Highlights */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {lab.capabilities.slice(0, 2).map((cap, cIdx) => (
                      <span
                        key={cIdx}
                        className="px-2.5 py-1 rounded-md text-[10.5px] font-medium bg-slate-950/80 border border-slate-800 text-slate-300 line-clamp-1"
                        title={cap}
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action Launch Buttons */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 min-w-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">Industry Calibrated</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Standalone CNAME / Netlify External Portal */}
                    {lab.standaloneUrl && !lab.external && (
                      <a
                        href={lab.standaloneUrl}
                        target="_blank"
                        rel="noopener"
                        onClick={() => trackLabLaunch(lab.id, 'standalone_external_btn')}
                        title="Open direct standalone portal in full browser window"
                        className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-mono font-bold bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-all hover:border-slate-500"
                      >
                        <span>Portal</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    )}

                    {/* Main Workbench Launch */}
                    <a
                      href={lab.url}
                      target={lab.external ? '_blank' : undefined}
                      rel={lab.external ? 'noopener' : undefined}
                      onClick={(e) => {
                        trackLabLaunch(lab.id, 'home_card');
                        if (!lab.external) {
                          if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                            e.preventDefault();
                            navigateTo(lab.url);
                          }
                        }
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-display font-extrabold transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-95 shrink-0"
                      style={{
                        backgroundColor: lab.accent,
                        color: '#030712',
                        boxShadow: `0 0 18px ${lab.accent}40`,
                      }}
                    >
                      <span>{lab.external ? 'Portal Launch Pro Lab' : 'Launch Pro Lab'}</span>
                      {lab.external ? <ExternalLink className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    </a>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
