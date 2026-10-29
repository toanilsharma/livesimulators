import React from 'react';
import { 
  ShieldCheck, 
  Scale, 
  CheckCircle2, 
  BookOpen, 
  Eye, 
  Cpu
} from 'lucide-react';
import { MathView } from './MathView';

export const TrustPrinciples: React.FC = () => {
  return (
    <section id="engineering-principles" className="py-20 lg:py-28 border-b border-slate-800/90 bg-[#060a12] relative overflow-hidden">
      {/* Precision Blueprint / Technical Drawing Drafting Grid */}
      <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none" />

      {/* Subtle Technical Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-blue-950/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative z-10 space-y-16">
        
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
