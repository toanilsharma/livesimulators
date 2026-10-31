import React from 'react';
import { 
  GitBranch, 
  Binary, 
  Activity, 
  DownloadCloud, 
  Cpu,
  ArrowRight,
  ShieldCheck,
  Zap,
  Terminal
} from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const phases = [
    {
      phaseNumber: '01',
      title: 'Analytical Formulation',
      subtitle: 'Continuous Governing Differential Equations',
      icon: <GitBranch className="w-5 h-5 text-cyan-400" />,
      accentColor: '#06b6d4',
      badge: 'FIRST PRINCIPLES',
      description:
        'Every workbench begins with rigorous conservation laws: Maxwell electrodynamics, Kirchhoff circuit matrices, Navier-Stokes fluid balance, or Euler-Bernoulli beam flexure formulated explicitly without black-box empirical approximations.',
      formula: '\\frac{d\\mathbf{x}}{dt} = \\mathbf{f}(\\mathbf{x}, t, \\mathbf{u})',
      metric: 'Exact Analytical Bounds',
    },
    {
      phaseNumber: '02',
      title: 'Numerical Discretization',
      subtitle: 'Runge-Kutta 4th-Order (RK4) Solver',
      icon: <Binary className="w-5 h-5 text-emerald-400" />,
      accentColor: '#10b981',
      badge: 'RK4 INTEGRATION',
      description:
        'Continuous differential equations are integrated at microsecond sub-timesteps. 4th-order Runge-Kutta slope averaging with adaptive error control prevents numerical drift and enforces physical energy conservation (dE/dt ≤ 0).',
      formula: 'y_{n+1} = y_n + \\frac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4)',
      metric: 'Global Error: O(h⁴)',
    },
    {
      phaseNumber: '03',
      title: 'Synchronous Telemetry',
      subtitle: '60 FPS Dual-Domain Vector Rendering',
      icon: <Activity className="w-5 h-5 text-amber-400" />,
      accentColor: '#f59e0b',
      badge: 'CANVAS & WEBGL',
      description:
        'Computed state vectors pipe directly to double-buffered HTML5 Canvas and WebGL shaders, synchronously rendering time-domain oscilloscope traces, vector field gradients, and FFT spectral magnitudes at a steady 60 frames per second.',
      formula: '\\tau_{\\text{render}} \\le 16.66\\text{ ms}',
      metric: 'Zero Frame Dropping',
    },
    {
      phaseNumber: '04',
      title: 'Data Matrix Export',
      subtitle: 'Bridging Simulation to Physical Lab Benches',
      icon: <DownloadCloud className="w-5 h-5 text-purple-400" />,
      accentColor: '#a855f7',
      badge: 'MATLAB / PYTHON CSV',
      description:
        'Virtual instruments mirror actual laboratory test gear (Keysight, Tektronix). Export full high-density time-series state matrices directly to CSV format for post-processing in Python NumPy, MATLAB, or physical laboratory bench correlation.',
      formula: '\\mathbf{M} = [\\mathbf{t}, \\mathbf{v}(t), \\mathbf{i}(t), \\mathbf{p}(t)]',
      metric: 'Complete Time Series',
    },
  ];

  return (
    <section 
      id="how-it-works" 
      className="py-16 sm:py-20 lg:py-24 border-b border-slate-800/80 bg-[#070c17] relative scroll-mt-20 overflow-hidden"
      aria-label="Computational Architecture and Numerical Pipeline"
    >
      {/* Background Pipeline Trace */}
      <div className="absolute inset-0 bg-tech-grid opacity-10 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-950/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-[1720px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 relative z-10 space-y-12 sm:space-y-16">
        
        {/* =================================================================== */}
        {/* SECTION HEADER (CENTERED WITH BALANCED MARGINS) */}
        {/* =================================================================== */}
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs uppercase tracking-wider mx-auto">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>NUMERICAL PIPELINE ARCHITECTURE • CLIENT-SIDE PHYSICS ENGINE</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            How It Works: Pure Real-Time Numerical Physics
          </h2>

          <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed font-sans max-w-3xl mx-auto">
            LiveSimulators executes 100% inside your browser's client engine using Web Workers and double-buffered Canvas pipelines. 
            No cloud server round-trips, no canned pre-recorded video loops—every trace reflects active numerical integration of continuous physical laws.
          </p>
        </div>

        {/* =================================================================== */}
        {/* CONTINUOUS PIPELINE FLOW (REPLACES 4 FLOATING BOX CARDS) */}
        {/* =================================================================== */}
        <div className="relative pt-4">
          
          {/* Desktop Connecting Linear Rail */}
          <div className="hidden xl:block absolute top-[52px] left-8 right-8 h-0.5 bg-gradient-to-r from-cyan-500/40 via-emerald-500/40 via-amber-500/40 to-purple-500/40 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 xl:gap-6 relative z-10">
            {phases.map((phase, idx) => (
              <div 
                key={phase.phaseNumber}
                className="group relative flex flex-col justify-between space-y-4 pt-2"
              >
                {/* Pipeline Node Marker & Stage Badge */}
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-10 h-10 rounded-xl bg-slate-900 border flex items-center justify-center transition-all group-hover:scale-105 shadow-md"
                      style={{ borderColor: `${phase.accentColor}60`, color: phase.accentColor }}
                    >
                      {phase.icon}
                    </div>

                    <div>
                      <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
                        PHASE {phase.phaseNumber}
                      </div>
                      <div className="text-[10px] font-mono font-semibold" style={{ color: phase.accentColor }}>
                        {phase.badge}
                      </div>
                    </div>
                  </div>

                  <span className="font-mono text-[10px] text-slate-500 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                    {phase.metric}
                  </span>
                </div>

                {/* Plain-Text Title & Subtitle */}
                <div className="space-y-1">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors tracking-tight">
                    {phase.title}
                  </h3>
                  <div className="text-xs font-mono text-slate-400">
                    {phase.subtitle}
                  </div>
                </div>

                {/* Explanatory Body in Natural Plain Text */}
                <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed flex-1">
                  {phase.description}
                </p>

                {/* Mathematical Formula Callout */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 font-mono text-[11px] text-slate-300 overflow-x-auto custom-scrollbar">
                  <div className="text-[9.5px] text-slate-500 uppercase tracking-wider mb-1">
                    Formulation Step:
                  </div>
                  <code className="text-cyan-300 text-xs block font-semibold truncate">
                    {phase.formula}
                  </code>
                </div>

                {/* Desktop Direction Indicator */}
                {idx < phases.length - 1 && (
                  <div className="hidden xl:flex items-center justify-end text-slate-600 text-xs font-mono pt-1">
                    <span className="text-[10px] mr-1">Proceed to 0{idx + 2}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

        {/* =================================================================== */}
        {/* COMPREHENSIVE COMPUTATIONAL BENCHMARK STRIP */}
        {/* =================================================================== */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-950/80 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300 font-semibold">
              Deterministic Browser Execution Architecture
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Zero Cloud Round-Trips (0ms Latency)</span>
            </span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Worker Thread Decoupled (No UI Freezes)</span>
            </span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>IEEE-754 64-Bit Double Precision</span>
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
