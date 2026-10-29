import React from 'react';
import { 
  Lightbulb, 
  Eye, 
  RotateCcw, 
  ShieldAlert, 
  Layers, 
  Sparkles
} from 'lucide-react';

export const WhyInteractive: React.FC = () => {
  return (
    <section id="why-interactive" className="py-16 lg:py-24 border-b border-slate-800 bg-[#060a12] relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-cyan-950/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-wider uppercase">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Pedagogical & Cognitive Foundation</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Why Interactive Simulation?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Engineering isn't a collection of frozen equations. It is the study of continuous physical 
            systems responding to dynamic boundary conditions, disturbances, and time.
          </p>
        </div>

        {/* 4 Core Pillars of Interactive Simulation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-white">
              Visualizing Invisible Fields
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Magnetic flux lines, electric potential gradients, and acoustic pressure waves cannot be seen in the physical world. Real-time visual shaders render them visible to the human eye.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-white">
              Instant Feedback Loops
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Traditional homework takes days to grade. Interactive simulators provide instantaneous confirmation: change a PID derivative gain and immediately see oscillation vanish or explode.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-white">
              Safe Failure & Extreme Sweeps
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Push a buck converter past its saturation boundary, trigger thermal runaway, or hit the resonant catastrophe of a bridge. Safe experimentation without burnt silicon or lab hazards.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-white">
              Dual-Domain Synchrony
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Simultaneously inspect the time-domain waveform and its frequency-domain FFT spectrum side by side, making abstract Laplace and Fourier transforms concrete and intuitive.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
