import React from 'react';
import { 
  ArrowRight, 
  Zap, 
  Activity, 
  Terminal, 
  Sliders, 
  Compass,
  AlertTriangle,
  RotateCw,
  Layers,
  Cpu
} from 'lucide-react';
import { FEATURED_ELECTRICAL_SIMULATORS } from '../data/simulators';
import { SimulatorItem } from '../types';

interface FinalCTAProps {
  onLaunchSimulator: (simulator: SimulatorItem) => void;
  onOpenSearchWithQuery?: (query: string) => void;
  onExploreAllSimulators?: () => void;
  onStartWithElectrical?: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({
  onLaunchSimulator,
  onOpenSearchWithQuery,
  onExploreAllSimulators,
  onStartWithElectrical,
}) => {
  const handleExploreAll = () => {
    if (onExploreAllSimulators) {
      onExploreAllSimulators();
    } else {
      const el = document.getElementById('concept-discovery') || document.getElementById('explore-engineering');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleStartElectrical = () => {
    if (onStartWithElectrical) {
      onStartWithElectrical();
    } else {
      const el = document.getElementById('featured-electrical');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        onLaunchSimulator(FEATURED_ELECTRICAL_SIMULATORS[0]);
      }
    }
  };

  return (
    <section 
      id="laboratory-entrance" 
      className="py-24 lg:py-36 border-b border-slate-800/90 bg-[#04070f] relative overflow-hidden text-center"
    >
      {/* ================================================================= */}
      {/* Subtle Animated Engineering Background */}
      {/* ================================================================= */}

      {/* 1. Engineering Grid with Blueprint Crosshairs */}
      <div className="absolute inset-0 bg-tech-grid opacity-25 pointer-events-none" />

      {/* Background Radial Laboratory Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[400px] bg-cyan-950/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[350px] h-[250px] bg-blue-950/25 rounded-full blur-[100px] pointer-events-none" />

      {/* 2. Schematic SVG Layer (Power Flow, Waveform, Rotating Machinery, Instrumentation Signal, Fault Indicator) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-40">
        
        {/* Top-Left: Power Flow Busbar Transmission Line */}
        <div className="absolute top-8 left-4 sm:left-12 lg:left-24 flex items-center gap-3 font-mono text-[10px] text-slate-500">
          <span className="text-cyan-400 font-semibold tracking-wider">BUS 1A [400 kV]</span>
          <svg width="220" height="24" className="overflow-visible hidden sm:block">
            {/* Bus line */}
            <line x1="0" y1="12" x2="200" y2="12" stroke="#1e293b" strokeWidth="2" />
            {/* Animated power flow pulses */}
            <line 
              x1="0" 
              y1="12" 
              x2="200" 
              y2="12" 
              stroke="#06b6d4" 
              strokeWidth="2" 
              strokeDasharray="8 16"
              className="animate-[dash_8s_linear_infinite]" 
            />
            {/* Power direction arrows */}
            <polygon points="196,8 204,12 196,16" fill="#06b6d4" />
          </svg>
          <span className="hidden sm:inline text-cyan-300">P = 620 MW →</span>
        </div>

        {/* Top-Right: Rotating Machinery Rotor Schematic */}
        <div className="absolute top-10 right-6 sm:right-16 lg:right-28 flex items-center gap-3 font-mono text-[10px] text-slate-500">
          <div className="relative w-12 h-12 rounded-full border border-slate-700/80 flex items-center justify-center">
            {/* Rotating Rotor Poles */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/40 animate-[spin_16s_linear_infinite]" />
            <div className="w-4 h-4 rounded-full bg-slate-900 border border-amber-400 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </div>
            {/* Rotor phase ticks */}
            <div className="absolute -top-1 w-1 h-2 bg-slate-600" />
            <div className="absolute -bottom-1 w-1 h-2 bg-slate-600" />
            <div className="absolute -left-1 w-2 h-1 bg-slate-600" />
            <div className="absolute -right-1 w-2 h-1 bg-slate-600" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-amber-400 font-semibold">ROTOR: 3600 RPM</div>
            <div className="text-slate-500">Synchronous Pole Pairs: 2</div>
          </div>
        </div>

        {/* Mid-Left: Oscillating Analog Waveform */}
        <div className="absolute top-1/2 -translate-y-1/2 left-4 sm:left-8 lg:left-16 hidden md:block">
          <div className="font-mono text-[9px] text-slate-500 mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
            <span>CH1: DAMPED RESONANCE v(t)</span>
          </div>
          <svg width="200" height="70" className="overflow-visible opacity-70">
            {/* Scope graticule background */}
            <rect x="0" y="0" width="200" height="70" fill="rgba(15,23,42,0.6)" stroke="#1e293b" strokeWidth="1" rx="4" />
            <line x1="0" y1="35" x2="200" y2="35" stroke="#334155" strokeDasharray="2 4" />
            <line x1="100" y1="0" x2="100" y2="70" stroke="#334155" strokeDasharray="2 4" />
            {/* Sinusoidal damped curve */}
            <path
              d="M 10 35 Q 25 5, 40 35 T 70 35 T 100 35 T 130 35 T 160 35 T 190 35"
              fill="none"
              stroke="#2dd4bf"
              strokeWidth="1.5"
              className="animate-pulse"
            />
          </svg>
        </div>

        {/* Mid-Right: Instrumentation 4-20mA Signal & DAC Pulse */}
        <div className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-8 lg:right-16 hidden md:block text-right">
          <div className="font-mono text-[9px] text-slate-500 mb-1 flex items-center justify-end gap-1.5">
            <span>TRANSMITTER LOOP: 4–20 mA</span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          </div>
          <svg width="200" height="70" className="overflow-visible opacity-70">
            <rect x="0" y="0" width="200" height="70" fill="rgba(15,23,42,0.6)" stroke="#1e293b" strokeWidth="1" rx="4" />
            {/* Stepped instrumentation pulse */}
            <path
              d="M 10 55 L 50 55 L 50 20 L 90 20 L 90 40 L 130 40 L 130 15 L 170 15 L 170 55 L 190 55"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Bottom-Center: Circuit Breaker & Fault Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 font-mono text-[10px] text-slate-500">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">52G GENERATOR BREAKER: CLOSED</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span className="text-slate-400">FAULT MONITOR: ARMED (I_fault &lt; 40kA)</span>
          </div>
        </div>

      </div>

      {/* ================================================================= */}
      {/* Central Foreground Content: Laboratory Entrance */}
      {/* ================================================================= */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        
        {/* Laboratory Threshold Badge */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/50 text-cyan-300 text-xs font-mono shadow-sm">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>DIGITAL ENGINEERING LABORATORY</span>
        </div>

        {/* Headline & Supporting Text */}
        <div className="space-y-5">
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
            Ready to See Engineering in Action?
          </h2>

          <p className="text-slate-300 text-lg sm:text-xl font-sans leading-relaxed max-w-2xl mx-auto">
            Choose a system. Change the conditions. Watch what happens.
          </p>
        </div>

        {/* Action Buttons: Primary & Secondary */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          
          {/* Primary Action Button */}
          <button
            onClick={handleExploreAll}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 font-bold text-base transition-all duration-200 shadow-[0_0_35px_rgba(6,182,212,0.35)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] font-display"
            id="cta-explore-all-simulators"
          >
            <span>Explore All Simulators</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Secondary Action Button */}
          <button
            onClick={handleStartElectrical}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/60 text-slate-200 hover:text-white font-semibold text-base transition-all duration-200 font-display shadow-lg"
            id="cta-start-with-electrical"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Start with Electrical</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>

        </div>

        {/* Technical Specification Sign-off */}
        <div className="pt-6 border-t border-slate-800/80 max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Zero install • Instant browser runtime</span>
          </div>
          <span>•</span>
          <div>Governing differential physics engine</div>
          <span>•</span>
          <div className="text-slate-500">IEEE / IEC referenced</div>
        </div>

      </div>

      {/* Inline styles for custom subtle background dash movement */}
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -240;
          }
        }
      `}</style>
    </section>
  );
};
