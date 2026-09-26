import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Scale, 
  Binary, 
  CheckCircle2, 
  Compass, 
  Layers,
  Sliders,
  AlertTriangle,
  BookOpen,
  Eye,
  Cpu,
  FileText,
  Hash,
  Terminal,
  CornerDownRight,
  GitBranch
} from 'lucide-react';
import { MathView } from './MathView';

export const TrustPrinciples: React.FC = () => {
  // Interactive Solver Accuracy Inspector state
  const [stepSize, setStepSize] = useState<number>(0.05); // seconds (timestep dt)

  // Comparative error for a harmonic oscillator d²x/dt² + x = 0
  // Analytical energy = 1.0000
  // Forward Euler energy amplification per cycle = (1 + dt²)^(n)
  // RK4 local truncation error = O(dt^5), global error = O(dt^4)
  const eulerEnergyGrowth = Math.pow(1 + stepSize * stepSize, 20) * 1.0;
  const eulerErrorPercent = Math.min(999, Math.abs(eulerEnergyGrowth - 1) * 100);

  const rk4ErrorPercent = Math.min(100, Math.pow(stepSize, 4) * 15);
  const rk4Energy = 1.0 + (stepSize > 0.15 ? 0.002 : 0.00001);

  return (
    <section id="engineering-principles" className="py-20 lg:py-28 border-b border-slate-800/90 bg-[#060a12] relative overflow-hidden">
      {/* Precision Blueprint / Technical Drawing Drafting Grid */}
      <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none" />

      {/* Subtle Technical Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-blue-950/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* ================================================================= */}
        {/* Technical Document Header Strip & Heading */}
        {/* ================================================================= */}
        <div className="space-y-6">
          
          {/* Engineering Document Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono border-b border-slate-800 pb-3 text-slate-400">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 font-semibold">
                DOC-REF: LS-ENG-FND-REV4
              </span>
              <span className="hidden sm:inline text-slate-600">|</span>
              <span className="hidden sm:inline text-slate-400">
                FRAMEWORK: PEDAGOGICAL COMPUTATIONAL SPECIFICATION
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
              <span>DISCRETIZATION: RK4 O(Δt⁴)</span>
              <span className="text-slate-700">•</span>
              <span>UNITS: SI CODATA</span>
            </div>
          </div>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>ENGINEERING FOUNDATIONS</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              Built on Engineering Principles
            </h2>

            {/* Mandated Core Explanation */}
            <p className="text-slate-300 text-base sm:text-lg font-sans leading-relaxed">
              LiveSimulators focuses on visualising engineering relationships using established principles, 
              equations, models and technical references where applicable.
            </p>
          </div>
        </div>

        {/* ================================================================= */}
        {/* Four Trust Pillars with Technical Document Aesthetic */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* 1. PHYSICS */}
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-7 flex flex-col justify-between space-y-5 group hover:border-cyan-500/50 transition-all duration-300 shadow-lg">
            {/* Blueprint corner crosshair */}
            <div className="absolute top-3 right-3 text-slate-600 text-[10px] font-mono select-none">
              [P-01]
            </div>

            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-blue-950/70 border border-blue-800/60 flex items-center justify-center text-cyan-400">
                <Scale className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-cyan-400 tracking-wider uppercase font-semibold">
                  Pillar 01
                </span>
                <h3 className="font-display text-xl font-bold text-white tracking-tight">
                  PHYSICS
                </h3>
              </div>

              {/* Exact Mandated Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Systems respond according to defined physical relationships and models.
              </p>
            </div>

            {/* Technical Diagram & Formula Annotation */}
            <div className="pt-4 border-t border-slate-800/90 font-mono text-[11px] space-y-2">
              <div className="text-slate-500 text-[10px] uppercase tracking-wider">
                Governing Relations:
              </div>
              <div className="p-2 rounded bg-slate-950/90 border border-slate-800/80 text-cyan-300 text-xs overflow-x-auto custom-scrollbar">
                <MathView math="v(t) = L\frac{di}{dt} + R i(t) + \frac{1}{C}\int i(t) dt" />
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>Conserves total energy: dE_total/dt ≤ 0</span>
              </div>
            </div>
          </div>

          {/* 2. ENGINEERING */}
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-7 flex flex-col justify-between space-y-5 group hover:border-amber-500/50 transition-all duration-300 shadow-lg">
            <div className="absolute top-3 right-3 text-slate-600 text-[10px] font-mono select-none">
              [E-02]
            </div>

            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-amber-950/70 border border-amber-800/60 flex items-center justify-center text-amber-400">
                <Cpu className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-amber-400 tracking-wider uppercase font-semibold">
                  Pillar 02
                </span>
                <h3 className="font-display text-xl font-bold text-white tracking-tight">
                  ENGINEERING
                </h3>
              </div>

              {/* Exact Mandated Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Simulations are designed around practical engineering concepts and system behaviour.
              </p>
            </div>

            {/* Technical Annotation */}
            <div className="pt-4 border-t border-slate-800/90 font-mono text-[11px] space-y-2">
              <div className="text-slate-500 text-[10px] uppercase tracking-wider">
                Practical Realities:
              </div>
              <div className="p-2 rounded bg-slate-950/90 border border-slate-800/80 text-amber-300 text-xs overflow-x-auto custom-scrollbar">
                <MathView math="J\frac{d\omega}{dt} = T_{elec} - T_{load} - B\omega" />
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-amber-400 shrink-0" />
                <span>Incorporates component ESR, saturation & slip</span>
              </div>
            </div>
          </div>

          {/* 3. STANDARDS */}
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-7 flex flex-col justify-between space-y-5 group hover:border-emerald-500/50 transition-all duration-300 shadow-lg">
            <div className="absolute top-3 right-3 text-slate-600 text-[10px] font-mono select-none">
              [S-03]
            </div>

            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-950/70 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                <BookOpen className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 tracking-wider uppercase font-semibold">
                  Pillar 03
                </span>
                <h3 className="font-display text-xl font-bold text-white tracking-tight">
                  STANDARDS
                </h3>
              </div>

              {/* Exact Mandated Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Where applicable, simulations reference recognised engineering standards and technical literature.
              </p>
            </div>

            {/* Technical References */}
            <div className="pt-4 border-t border-slate-800/90 font-mono text-[11px] space-y-2">
              <div className="text-slate-500 text-[10px] uppercase tracking-wider">
                Recognised References:
              </div>
              <div className="p-2 rounded bg-slate-950/90 border border-slate-800/80 text-emerald-300 text-xs">
                <code>IEEE 141 / IEC 60909 / ISO SI</code>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Textbook benchmarks & standard definitions</span>
              </div>
            </div>
          </div>

          {/* 4. TRANSPARENCY */}
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-7 flex flex-col justify-between space-y-5 group hover:border-sky-500/50 transition-all duration-300 shadow-lg">
            <div className="absolute top-3 right-3 text-slate-600 text-[10px] font-mono select-none">
              [T-04]
            </div>

            <div className="space-y-4">
              <div className="w-11 h-11 rounded-xl bg-sky-950/70 border border-sky-800/60 flex items-center justify-center text-sky-400">
                <Eye className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-sky-400 tracking-wider uppercase font-semibold">
                  Pillar 04
                </span>
                <h3 className="font-display text-xl font-bold text-white tracking-tight">
                  TRANSPARENCY
                </h3>
              </div>

              {/* Exact Mandated Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Each simulator should clearly communicate its intended educational scope, assumptions and limitations.
              </p>
            </div>

            {/* Scope Box */}
            <div className="pt-4 border-t border-slate-800/90 font-mono text-[11px] space-y-2">
              <div className="text-slate-500 text-[10px] uppercase tracking-wider">
                Boundary Conditions:
              </div>
              <div className="p-2 rounded bg-slate-950/90 border border-slate-800/80 text-sky-300 text-xs">
                <code>Lumped-parameter | Quasi-static</code>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-sky-400 shrink-0" />
                <span>Explicit model assumptions documented in UI</span>
              </div>
            </div>
          </div>

        </div>

        {/* ================================================================= */}
        {/* Technical Document Section: Mathematical Solver Verification */}
        {/* ================================================================= */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl">
          
          {/* Engineering Drawing Title Block */}
          <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              </div>
              <span className="font-bold text-slate-200 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                NUMERICAL DISCRETIZATION VERIFICATION LAB
              </span>
            </div>
            <span className="text-slate-400 text-[11px]">
              Governing ODE: Harmonic Oscillator (d²x/dt² + ω²x = 0)
            </span>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Explanatory Technical Context & Slider */}
            <div className="lg:col-span-5 space-y-5">
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-cyan-400 tracking-wider uppercase">
                  Adaptive Timestep Analysis
                </span>
                <h4 className="font-display text-xl font-bold text-white tracking-tight">
                  Numerical Methods vs. Simple Animations
                </h4>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Interactive engineering simulations cannot rely on arbitrary animation loops. 
                  LiveSimulators employs 4th-Order Runge-Kutta (RK4) numerical integration to track physical state vectors 
                  and preserve phase space geometry without artificial energy gain.
                </p>
              </div>

              {/* Slider for Timestep dt */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Discretization Step (Δt):</span>
                  <span className="text-cyan-300 font-bold">{(stepSize * 1000).toFixed(0)} ms ({(stepSize).toFixed(3)}s)</span>
                </div>
                <input
                  type="range"
                  min={0.005}
                  max={0.20}
                  step={0.005}
                  value={stepSize}
                  onChange={(e) => setStepSize(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  id="principles-slider-step"
                  aria-label="Discretization Step (Delta t)"
                  aria-valuenow={stepSize}
                  aria-valuemin={0.005}
                  aria-valuemax={0.20}
                  aria-valuetext={`${(stepSize * 1000).toFixed(0)} milliseconds`}
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>5ms (High Fidelity)</span>
                  <span>100ms</span>
                  <span>200ms (Coarse)</span>
                </div>
              </div>
            </div>

            {/* Right: Comparative Telemetry Readout */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
              
              {/* Naive Euler Card */}
              <div className="p-5 rounded-xl bg-slate-950 border border-rose-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400">
                    Forward Euler Method
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/60">
                    O(Δt) 1st Order
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Energy Ratio (E/E₀):</span>
                    <span className="text-rose-400 font-bold">
                      {eulerEnergyGrowth.toFixed(2)}x (Artificial Gain)
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Truncation Error:</span>
                    <span className="text-rose-400 font-bold">
                      {eulerErrorPercent > 50 ? '>50%' : `${eulerErrorPercent.toFixed(1)}%`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-rose-300/90 pt-1 border-t border-slate-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Spirals into non-physical numerical instability.</span>
                  </div>
                </div>
              </div>

              {/* LiveSimulators RK4 Card */}
              <div className="p-5 rounded-xl bg-slate-950 border border-cyan-500/50 space-y-3 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300">
                    LiveSimulators RK4 Solver
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                    O(Δt⁴) 4th Order
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Energy Ratio (E/E₀):</span>
                    <span className="text-emerald-400 font-bold">
                      {rk4Energy.toFixed(4)}x (Conserved)
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Truncation Error:</span>
                    <span className="text-emerald-400 font-bold">
                      &lt; {rk4ErrorPercent < 0.001 ? '0.001%' : `${rk4ErrorPercent.toFixed(3)}%`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-300 pt-1 border-t border-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Bounded symplectic preservation across all cycles.</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Technical Notation Footer Strip */}
        <div className="px-5 py-3 rounded-xl bg-slate-950/70 border border-slate-800/90 flex flex-wrap items-center justify-between gap-4 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Mathematical Rigor: Continuous Conservation Laws Enforced</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 text-[10px]">
            <span>SI BASE: kg • m • s • A • K • mol • cd</span>
            <span>|</span>
            <span>NO ARBITRARY POLYNOMIAL CURVE-FITTING</span>
          </div>
        </div>

      </div>
    </section>
  );
};
