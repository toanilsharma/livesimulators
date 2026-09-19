import React, { useState } from 'react';
import { 
  Lightbulb, 
  Eye, 
  RotateCcw, 
  ShieldAlert, 
  Layers, 
  ArrowRight,
  Sparkles,
  BookOpen,
  Activity
} from 'lucide-react';

export const WhyInteractive: React.FC = () => {
  const [comparisonMode, setComparisonMode] = useState<'interactive' | 'static'>('interactive');

  return (
    <section id="why-interactive" className="py-16 lg:py-24 border-b border-slate-800 bg-[#060a12] relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-cyan-950/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
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

        {/* Interactive Comparison Widget: Static Textbook vs LiveSimulators */}
        <div className="mb-14 rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl">
          {/* Comparison Mode Switcher */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-slate-300">
                COMPARISON STUDY:
              </span>
              <span className="text-xs font-mono text-cyan-400">
                Understanding RLC Phase Lag & Damping
              </span>
            </div>

            <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800 font-mono text-xs">
              <button
                onClick={() => setComparisonMode('static')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                  comparisonMode === 'static'
                    ? 'bg-slate-800 text-slate-200 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Static Textbook Diagram</span>
              </button>
              <button
                onClick={() => setComparisonMode('interactive')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                  comparisonMode === 'interactive'
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>LiveSimulators Interactive Model</span>
              </button>
            </div>
          </div>

          {/* Comparison Display Body */}
          <div className="p-6 sm:p-8">
            {comparisonMode === 'static' ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-6 p-6 rounded-xl bg-slate-950/80 border border-slate-800/80 font-mono text-slate-400 space-y-4">
                  <div className="text-[11px] text-slate-500 uppercase border-b border-slate-800 pb-2">
                    FIGURE 4.12: Traditional Textbook Page 148
                  </div>
                  
                  {/* Faded static diagram */}
                  <div className="p-4 rounded border border-slate-800 bg-[#090e17] text-center space-y-2 opacity-75">
                    <div className="text-xs text-slate-300 font-serif italic">
                      "Let v(t) = V_m cos(ωt + φ). Substituting into Kirchhoff's Voltage Law yields..."
                    </div>
                    {/* Static ASCII circuit depiction */}
                    <div className="text-[11px] text-slate-500 py-3 select-none leading-tight font-mono">
                      +---[ R ]---[ L ]---[ C ]---+<br />
                      |                           |<br />
                      +-----(~) e(t) = E₀ sin(ωt) -+
                    </div>
                    <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-2">
                      Static graph: Single curve printed in black ink. No parameter sweep possible.
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1">
                    <p className="text-rose-400/90 font-medium">Cognitive Friction:</p>
                    <p>• Students memorize the formula without internalizing why current lags voltage.</p>
                    <p>• Cannot observe transient ringing transition into steady state.</p>
                    <p>• Zero intuition for what happens if resistance is reduced to zero.</p>
                  </div>
                </div>

                <div className="md:col-span-6 space-y-4">
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono text-xs">
                    The Textbook Limitation
                  </span>
                  <h3 className="font-display text-2xl font-bold text-white">
                    Frozen math forces memorization instead of comprehension.
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Printed textbooks can only show a single static snapshot at arbitrary coordinates. 
                    They cannot convey phase propagation, frequency response curves shifting under variable loads, 
                    or the tactile feel of an underdamped oscillator ringing toward equilibrium.
                  </p>
                  <button
                    onClick={() => setComparisonMode('interactive')}
                    className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <span>Switch to the Interactive Simulation Model</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-6 p-6 rounded-xl bg-slate-950 border border-cyan-500/30 font-mono space-y-4 shadow-inner">
                  <div className="flex items-center justify-between text-[11px] text-cyan-400 border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      LIVE SOLVER: REAL-TIME CONTINUOUS EVALUATION
                    </span>
                    <span>60 FPS</span>
                  </div>

                  {/* Dynamic simulated waveform representation */}
                  <div className="p-4 rounded-lg border border-slate-800 bg-[#030712] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Phase Angle Δφ:</span>
                      <span className="text-cyan-400 font-bold">-48.2° (Lagging Inductive)</span>
                    </div>
                    {/* Simulated live visual bars */}
                    <div className="space-y-1.5 text-[10px]">
                      <div className="flex justify-between text-slate-400">
                        <span>Reactive Inductor Power (VARs)</span>
                        <span className="text-emerald-400 font-bold">+184.2 VAR</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full w-[65%]" />
                      </div>
                      <div className="flex justify-between text-slate-400 pt-1">
                        <span>Capacitive Reactive Energy</span>
                        <span className="text-amber-400 font-bold">-92.1 VAR</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full w-[35%]" />
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                      ⚡ Resonance reached when Inductive and Capacitive energies equal each other exactly.
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1">
                    <p className="text-emerald-400 font-medium">Visual Cognitive Mastery:</p>
                    <p>✓ Immediate visual connection between R, L, C sliders and phasor angle.</p>
                    <p>✓ Intuitive grasp of resonance as the point where reactances cancel.</p>
                    <p>✓ Deep retention verified through active parameter experimentation.</p>
                  </div>
                </div>

                <div className="md:col-span-6 space-y-4">
                  <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 font-mono text-xs border border-cyan-800/60">
                    The LiveSimulators Advantage
                  </span>
                  <h3 className="font-display text-2xl font-bold text-white">
                    Direct sensory coupling between equations and physical behavior.
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    When you turn a knob on an interactive simulation, your brain correlates the mathematical 
                    parameter with its physical effect in milliseconds. You don't just calculate damping; 
                    you see the ringing waveform flatten out as resistance increases.
                  </p>
                  <div className="text-xs font-mono text-slate-400 pt-1">
                    "Don't just read engineering. See it happen."
                  </div>
                </div>
              </div>
            )}
          </div>
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
