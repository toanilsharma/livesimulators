import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Scale, 
  CheckCircle2, 
  BookOpen, 
  Eye, 
  Cpu,
  FileText,
  Award,
  Terminal,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { MathView } from './MathView';

export const TrustPrinciples: React.FC = () => {
  const [showDerivation1, setShowDerivation1] = useState<boolean>(false);
  const [showDerivation2, setShowDerivation2] = useState<boolean>(false);
  return (
    <section 
      id="engineering-principles" 
      className="py-16 sm:py-20 lg:py-24 border-b border-slate-800/80 bg-[#060a12] relative scroll-mt-20 overflow-hidden"
      aria-label="Engineering Principles and Verification Charter"
    >
      {/* Precision Blueprint / Technical Drawing Drafting Grid */}
      <div className="absolute inset-0 bg-tech-grid opacity-15 pointer-events-none" />

      {/* Subtle Technical Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[750px] h-[450px] bg-blue-950/15 rounded-full blur-[150px] pointer-events-none" />

      {/* Screen-fitting container */}
      <div className="w-full max-w-[1720px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 relative z-10 space-y-10 sm:space-y-12">
        
        {/* =================================================================== */}
        {/* TECHNICAL DOCUMENT HEADER STRIP & HEADING (CENTERED) */}
        {/* =================================================================== */}
        <div className="space-y-6">
          
          {/* Engineering Specification Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono border-b border-slate-800 pb-3 text-slate-400">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-cyan-400 font-semibold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>DOC-SPEC: LS-ENG-CHARTER-REV4</span>
              </span>
              <span className="hidden sm:inline text-slate-600">|</span>
              <span className="hidden sm:inline text-slate-400 uppercase">
                Classification: Open Pedagogical Computational Standard
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-400 text-[10.5px]">
              <span>SOLVER: RUNGE-KUTTA RK4 O(h⁴)</span>
              <span className="text-slate-600">•</span>
              <span>UNITS: SI CODATA 2022</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-semibold">STATUS: VERIFIED</span>
            </div>
          </div>

          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-mono mx-auto">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>FIRST-PRINCIPLES COMPUTATIONAL CHARTER</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              Built on Engineering Principles
            </h2>

            {/* Mandated Core Explanation */}
            <p className="text-slate-300 text-sm sm:text-base lg:text-lg font-sans leading-relaxed max-w-2xl mx-auto">
              LiveSimulators focuses on visualising engineering relationships using established principles, 
              equations, models and technical references where applicable. Every numerical model enforces fundamental physical conservation 
              laws rather than cosmetic or arbitrary polynomial curve-fitting.
            </p>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 4 FIRST-PRINCIPLES CHARTER SECTIONS: PLAIN 2x2 WITH HAIRLINE DIVIDERS (NO OUTER CARD) */}
        {/* =================================================================== */}
        <div className="border-t border-b border-slate-800/80 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
          
          {/* COLUMN 1: § 1.0 (Top) & § 3.0 (Bottom) */}
          <div className="divide-y divide-slate-800/80">
            
            {/* § 1.0 PHYSICS */}
            <div className="py-8 sm:py-10 md:pr-8 lg:pr-12 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-950/70 border border-blue-800/60 flex items-center justify-center text-cyan-400">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                      SECTION 1.0 • FIRST PRINCIPLES
                    </span>
                    <h3 className="font-display text-xl font-bold text-white tracking-tight">
                      PHYSICAL CONSERVATION LAWS
                    </h3>
                  </div>
                </div>
                <span className="font-mono text-xs text-slate-500 font-semibold">[§ 1.0-P]</span>
              </div>

              {/* Exact Mandated Description */}
              <p className="text-sm text-slate-300 leading-relaxed font-sans font-medium">
                Systems respond according to defined physical relationships and models.
              </p>

              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Simulations are formulated from fundamental continuity equations: Kirchhoff’s voltage and current laws, 
                Navier-Stokes momentum conservation, and Faraday-Maxwell induction. No black-box statistical interpolations are utilized.
              </p>

              {/* Technical Governing Formula & Interactive Proof Expander */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/70 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-wider">
                  <span>Continuous State Equation:</span>
                  <button
                    type="button"
                    onClick={() => setShowDerivation1(!showDerivation1)}
                    className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>{showDerivation1 ? 'Hide Analytical Proof' : 'View First-Principles Proof'}</span>
                    {showDerivation1 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
                <div className="text-cyan-300 py-1 overflow-x-auto custom-scrollbar">
                  <MathView math="v(t) = L\frac{di}{dt} + R i(t) + \frac{1}{C}\int i(t) dt" block />
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-800/70">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Enforces energy conservation: dE_total/dt ≤ 0</span>
                </div>

                {/* Analytical Derivation Collapsible Panel */}
                {showDerivation1 && (
                  <div className="mt-3 pt-3 border-t border-cyan-900/40 text-[11px] font-sans space-y-2.5 bg-cyan-950/20 -mx-3.5 -mb-3.5 p-3.5 rounded-b-xl animate-in fade-in duration-200">
                    <div className="font-mono text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                      § 1.0-A Analytical Derivation from Maxwell-Kirchhoff Loop:
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed">
                      <li>
                        <strong className="text-white">Kirchhoff's Voltage Law:</strong> The algebraic sum of potentials across loop elements equals zero:
                        <div className="py-1 text-cyan-200 overflow-x-auto font-mono text-[10.5px]">
                          <MathView math="v_{source}(t) - v_L(t) - v_R(t) - v_C(t) = 0" />
                        </div>
                      </li>
                      <li>
                        <strong className="text-white">Canonical 2nd-Order Differential Equation:</strong> Differentiating with respect to time $t$ gives the oscillator ODE:
                        <div className="py-1 text-cyan-200 overflow-x-auto font-mono text-[10.5px]">
                          <MathView math="\frac{d^2 i(t)}{dt^2} + \frac{R}{L}\frac{di(t)}{dt} + \frac{1}{LC} i(t) = \frac{1}{L}\frac{dv_{source}}{dt}" />
                        </div>
                      </li>
                      <li>
                        <strong className="text-white">Runge-Kutta State-Space Vector:</strong> Reduced to two coupled 1st-order state equations solved at discrete time steps:
                        <div className="py-1 text-cyan-200 overflow-x-auto font-mono text-[10.5px]">
                          <MathView math="x_1 = q(t),\quad x_2 = \dot{q}(t) = i(t),\quad \dot{x}_2 = \frac{v(t) - R x_2 - \frac{x_1}{C}}{L}" />
                        </div>
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            </div>

            {/* § 3.0 STANDARDS */}
            <div className="py-8 sm:py-10 md:pr-8 lg:pr-12 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/70 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                      SECTION 3.0 • CURRICULAR LITERATURE REFERENCES
                    </span>
                    <h3 className="font-display text-xl font-bold text-white tracking-tight">
                      CANONICAL ENGINEERING FORMULATIONS
                    </h3>
                  </div>
                </div>
                <span className="font-mono text-xs text-slate-500 font-semibold">[§ 3.0-S]</span>
              </div>

              {/* Exact Mandated Description */}
              <p className="text-sm text-slate-300 leading-relaxed font-sans font-medium">
                Where applicable, simulations align with widely accepted engineering textbook literature and university course curricula.
              </p>

              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Parameter definitions, nomenclature, and governing equations reference canonical methods commonly cataloged 
                in engineering educational literature (such as concepts addressed in IEEE, IEC, ASME, and ISO textbook syllabi). 
                All citations are strictly for educational reference; LiveSimulators is an independent pedagogical resource not approved or certified by any standards body.
              </p>

              {/* Standards Tags Strip */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/70 text-xs font-mono space-y-2">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Academic Curriculum References:
                </div>
                <div className="flex flex-wrap gap-1.5 text-emerald-300 text-xs font-semibold">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Power &amp; Arcing (IEEE Ref)</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Grid Dynamics (IEC Ref)</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Heat Cycles (ASME Ref)</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">SI CODATA Physics</span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-800/70">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Independent textbook derivations verified against closed-form analytical solutions</span>
                </div>
              </div>
            </div>

          </div>

          {/* COLUMN 2: § 2.0 (Top) & § 4.0 (Bottom) */}
          <div className="divide-y divide-slate-800/80">

            {/* § 2.0 ENGINEERING */}
            <div className="py-8 sm:py-10 md:pl-8 lg:pl-12 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-950/70 border border-amber-800/60 flex items-center justify-center text-amber-400">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                      SECTION 2.0 • REAL-WORLD CONCEPTS
                    </span>
                    <h3 className="font-display text-xl font-bold text-white tracking-tight">
                      PRACTICAL ENGINEERING BEHAVIOUR
                    </h3>
                  </div>
                </div>
                <span className="font-mono text-xs text-slate-500 font-semibold">[§ 2.0-E]</span>
              </div>

              {/* Exact Mandated Description */}
              <p className="text-sm text-slate-300 leading-relaxed font-sans font-medium">
                Simulations are designed around practical engineering concepts and system behaviour.
              </p>

              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Real-world components are never purely ideal. Our models integrate non-idealities: parasitic Equivalent Series 
                Resistance (ESR) in capacitors, winding core hysteresis, semiconductor forward voltage drops, and mechanical friction torque.
              </p>

              {/* Technical Practical Equation & Interactive Derivation */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/70 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-wider">
                  <span>Electro-Mechanical Equilibrium:</span>
                  <button
                    type="button"
                    onClick={() => setShowDerivation2(!showDerivation2)}
                    className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 hover:text-amber-300 font-semibold cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>{showDerivation2 ? 'Hide Dynamic Balance' : 'View Dynamic Proof'}</span>
                    {showDerivation2 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
                <div className="text-amber-300 py-1 overflow-x-auto custom-scrollbar">
                  <MathView math="J\frac{d\omega}{dt} = T_{elec} - T_{load} - B\omega" block />
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-800/70">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Incorporates rotor inertia J, back-EMF, and viscous friction B</span>
                </div>

                {/* Practical Balance Collapsible Panel */}
                {showDerivation2 && (
                  <div className="mt-3 pt-3 border-t border-amber-900/40 text-[11px] font-sans space-y-2.5 bg-amber-950/20 -mx-3.5 -mb-3.5 p-3.5 rounded-b-xl animate-in fade-in duration-200">
                    <div className="font-mono text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                      § 2.0-B Rotational Newton-Euler Dynamic Formulation:
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed">
                      <li>
                        <strong className="text-white">Dynamic Torque Equilibrium:</strong> Net rotational acceleration governed by rotor moment of inertia $J$:
                        <div className="py-1 text-amber-200 overflow-x-auto font-mono text-[10.5px]">
                          <MathView math="J \frac{d\omega(t)}{dt} = T_{developed}(i_a, \Phi) - T_{load}(\omega) - B\,\omega(t) - T_c\,\text{sgn}(\omega)" />
                        </div>
                      </li>
                      <li>
                        <strong className="text-white">Electromagnetic Armature Coupling:</strong> Back-EMF $e(t) = K_e \Phi \omega$ directly opposes terminal supply $V_t$:
                        <div className="py-1 text-amber-200 overflow-x-auto font-mono text-[10.5px]">
                          <MathView math="L_a \frac{di_a}{dt} + R_a i_a = V_t - K_e \Phi \omega(t)" />
                        </div>
                      </li>
                      <li>
                        <strong className="text-white">Transient Sub-Stepping:</strong> Bilinear state integration guarantees numerical convergence during motor startup surges and stall events.
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            </div>

            {/* § 4.0 TRANSPARENCY */}
            <div className="py-8 sm:py-10 md:pl-8 lg:pl-12 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-950/70 border border-sky-800/60 flex items-center justify-center text-sky-400">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider block">
                      SECTION 4.0 • MODEL BOUNDARIES
                    </span>
                    <h3 className="font-display text-xl font-bold text-white tracking-tight">
                      METHODOLOGICAL TRANSPARENCY
                    </h3>
                  </div>
                </div>
                <span className="font-mono text-xs text-slate-500 font-semibold">[§ 4.0-T]</span>
              </div>

              {/* Exact Mandated Description */}
              <p className="text-sm text-slate-300 leading-relaxed font-sans font-medium">
                Each simulator should clearly communicate its intended educational scope, assumptions and limitations.
              </p>

              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                We believe scientific software must be intellectually honest. When a simulator employs a lumped-parameter 
                approximation or quasi-static boundary assumption, this is explicitly documented in the workbench UI.
              </p>

              {/* Scope Boundary Box */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/70 text-xs font-mono space-y-2">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Scope &amp; Boundary Conditions:
                </div>
                <div className="flex flex-wrap gap-1.5 text-sky-300 text-xs font-semibold">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Lumped-Parameter Domain</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Quasi-Static Assumptions</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">Deterministic RK4 Step</span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-800/70">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Model limitations and assumptions openly exposed in telemetry</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Compliance & Mathematical Rigor Signature Strip */}
        <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-semibold">
              Rigorous Verification Protocol:
            </span>
            <span className="text-slate-400">
              Continuous conservation laws strictly satisfied
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[10.5px] text-slate-500">
            <span>SI BASE UNITS ONLY</span>
            <span>•</span>
            <span>DETERMINISTIC NUMERICAL INTEGRATION</span>
            <span>•</span>
            <span className="text-cyan-400">NO HALLUCINATED VARIABLES</span>
          </div>
        </div>

      </div>
    </section>
  );
};
