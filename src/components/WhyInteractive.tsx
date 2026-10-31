import React from 'react';
import { 
  Lightbulb, 
  Eye, 
  RotateCcw, 
  ShieldAlert, 
  Layers, 
  BookOpen,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export const WhyInteractive: React.FC = () => {
  return (
    <section 
      id="why-interactive" 
      className="py-16 sm:py-20 lg:py-24 border-b border-slate-800/80 bg-[#060a12] relative overflow-hidden scroll-mt-20"
      aria-label="Pedagogical and Cognitive Foundations of Interactive Simulation"
    >
      {/* Subtle Technical Ambient Glow */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-cyan-950/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[450px] h-[450px] bg-blue-950/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="w-full max-w-[1720px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 relative z-10 space-y-12 sm:space-y-16">
        
        {/* =================================================================== */}
        {/* SECTION HEADER (CENTERED WITH BALANCED MARGINS) */}
        {/* =================================================================== */}
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs uppercase tracking-wider mx-auto">
            <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
            <span>PEDAGOGICAL &amp; COGNITIVE FOUNDATION • WHITE PAPER BRIEF</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            Why Interactive Simulation? <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300">
              Don't Just Read Equations — See Systems Respond.
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed font-sans max-w-3xl mx-auto">
            Engineering is not a catalog of frozen algebraic solutions. Physical reality consists of continuous, 
            interconnected differential systems responding dynamically to time-varying boundary conditions, non-linearities, 
            and disturbances. Static textbook diagrams isolate variables, leaving students to mentally reconstruct spatial and transient mechanics.
          </p>
        </div>

        {/* =================================================================== */}
        {/* TWO-COLUMN EDITORIAL ARTICLE (NO FLOATING BOX CARDS) */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 pt-4 border-t border-slate-800/80">
          
          {/* LEFT EDITORIAL COLUMN */}
          <div className="space-y-10 sm:space-y-12">
            
            {/* 01. Field Visualization */}
            <article className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-cyan-400 tracking-wider">
                  SECTION 01
                </span>
                <span className="h-px bg-slate-800 flex-1" />
                <Eye className="w-4 h-4 text-cyan-400" />
              </div>

              <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                Visualizing Imperceptible Vector Fields
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                Electric potential gradients (<span className="font-mono text-cyan-300">∇V</span>), magnetic vector potentials (<span className="font-mono text-cyan-300">A</span>), 
                and stress tensor trajectories are completely invisible to the human eye in physical laboratories. 
                Static textbooks reduce these multi-dimensional interactions to scalar formulas, forcing the learner to guess how spatial 
                geometry shapes flux lines.
              </p>

              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                By rendering continuous vector shaders directly on HTML5 Canvas at 60 FPS, LiveSimulators allows learners 
                to immediately observe magnetic flux compression, electric field crowding at conductor edges, and shear stress 
                rotations in real time.
              </p>
            </article>

            {/* 02. Instant Feedback Loops */}
            <article className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-emerald-400 tracking-wider">
                  SECTION 02
                </span>
                <span className="h-px bg-slate-800 flex-1" />
                <RotateCcw className="w-4 h-4 text-emerald-400" />
              </div>

              <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                Sub-16ms Feedback Latency Accelerates Intuition
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                Traditional university coursework suffers from a multi-day feedback loop: a student solves a second-order 
                differential equation, submits homework, and waits days for a graded review. By then, the causal connection between 
                damping coefficients and transient ringing has faded from short-term memory.
              </p>

              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                Interactive solvers compress that feedback loop to under 16 milliseconds. Adjusting a damping resistance dial or PID derivative gain 
                immediately reveals the emergence of oscillation or overdamped sluggishness. This immediate physical reinforcement builds 
                deep qualitative engineering intuition far faster than static derivations alone.
              </p>
            </article>

          </div>

          {/* RIGHT EDITORIAL COLUMN */}
          <div className="space-y-10 sm:space-y-12">
            
            {/* 03. Safe Extreme Sweeps */}
            <article className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-amber-400 tracking-wider">
                  SECTION 03
                </span>
                <span className="h-px bg-slate-800 flex-1" />
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              </div>

              <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                Safe Exploration of Boundary Extremes &amp; Failure Modes
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                In physical hardware laboratories, safety protocols intentionally prevent students from pushing components into 
                destructive operating boundaries. You cannot intentionally short a high-voltage capacitor, drive a power MOSFET into 
                thermal runaway, or exceed the critical buckling load of a column without destroying expensive equipment or risking injury.
              </p>

              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                In a numerical physics environment, failure is the ultimate teacher. Students can sweep frequency to exact resonance catastrophe, 
                simulate inductor core saturation in switching converters, and induce 3-phase grid ground faults with zero risk and complete telemetry transparency.
              </p>
            </article>

            {/* 04. Dual-Domain Synchrony */}
            <article className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-purple-400 tracking-wider">
                  SECTION 04
                </span>
                <span className="h-px bg-slate-800 flex-1" />
                <Layers className="w-4 h-4 text-purple-400" />
              </div>

              <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
                Synchronous Dual-Domain (Time &amp; Frequency) Coupling
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                Textbooks routinely split time-domain transient analysis and frequency-domain spectral analysis into separate chapters taught weeks apart. 
                Consequently, engineering students frequently struggle to correlate pole-zero coordinates on the complex s-plane with time-domain ringing.
              </p>

              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                LiveSimulators couples both domains synchronously side-by-side. As you change circuit poles or filter orders, you observe the time-domain 
                oscilloscope step response update in exact lockstep with the frequency-domain Bode magnitude and phase plot.
              </p>
            </article>

          </div>

        </div>

        {/* =================================================================== */}
        {/* TYPOGRAPHIC COMPARISON MATRIX (CLEAN TECHNICAL DATA TABLE) */}
        {/* =================================================================== */}
        <div className="pt-8 border-t border-slate-800/80">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Pedagogical Comparison: Static Slides vs. Real-Time Numerical Solvers</span>
          </div>

          <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-slate-800 bg-slate-950/70">
            <table className="w-full text-left border-collapse text-xs font-sans min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 font-mono text-[11px] text-slate-400 uppercase">
                  <th className="py-3 px-4 font-semibold">Cognitive Learning Dimension</th>
                  <th className="py-3 px-4 font-semibold text-slate-400">Static Textbook Slide</th>
                  <th className="py-3 px-4 font-semibold text-cyan-300">LiveSimulators 60 FPS Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white font-mono text-[11px]">
                    Field &amp; Flux Dynamics
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    Static 2D contour drawings; scalar equations
                  </td>
                  <td className="py-3 px-4 text-cyan-300 font-medium">
                    Continuous animated vector flux lines &amp; potential shaders
                  </td>
                </tr>
                <tr className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white font-mono text-[11px]">
                    Causal Feedback Latency
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    Days to weeks (homework grading cycle)
                  </td>
                  <td className="py-3 px-4 text-cyan-300 font-medium">
                    &lt; 16 ms instant waveform re-computation
                  </td>
                </tr>
                <tr className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white font-mono text-[11px]">
                    Domain Correlation
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    Isolated chapters (Laplace separate from transients)
                  </td>
                  <td className="py-3 px-4 text-cyan-300 font-medium">
                    Synchronous side-by-side time oscilloscope &amp; frequency FFT
                  </td>
                </tr>
                <tr className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white font-mono text-[11px]">
                    Hardware Safety &amp; Stress Testing
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    Restricted to safe nominal ranges; failure prohibited
                  </td>
                  <td className="py-3 px-4 text-cyan-300 font-medium">
                    Unrestricted sweeping into resonance, saturation &amp; faults
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
};
