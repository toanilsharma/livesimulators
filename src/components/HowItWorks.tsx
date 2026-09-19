import React, { useState } from 'react';
import { 
  GitBranch, 
  Binary, 
  Activity, 
  DownloadCloud, 
  ArrowRight,
  Terminal,
  CheckCircle2,
  Cpu
} from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      stepNumber: '01',
      title: 'Physical & Mathematical Formulation',
      subtitle: 'Continuous Governing Differential Equations',
      icon: <GitBranch className="w-5 h-5 text-cyan-400" />,
      description: 'Every simulator begins with first-principles physics: Maxwell\'s equations, Kirchhoff\'s laws, Navier-Stokes fluid mechanics, or Euler-Bernoulli beam theory. All non-linear and boundary conditions are explicitly formulated without black-box approximations.',
      technicalDetails: [
        'Explicit state-variable formulation: ẋ = f(x, u, t)',
        'Conservation of energy, charge, and momentum enforced at every node',
        'Physical parameters specified in strict SI units (Ohms, Henries, Farads, Pascals)'
      ],
      codeSnippet: `// Continuous System State Derivative
function evaluateDerivatives(state, t, params) {
  const { vC, iL } = state;
  const { R, L, C, vIn } = params;
  
  const diL_dt = (vIn(t) - R * iL - vC) / L; // Faraday + KVL
  const dvC_dt = iL / C;                     // Capacitor charge balance
  
  return { dvC_dt, diL_dt };
}`
    },
    {
      stepNumber: '02',
      title: 'High-Precision Numerical Discretization',
      subtitle: 'Runge-Kutta 4th-Order (RK4) Integration',
      icon: <Binary className="w-5 h-5 text-emerald-400" />,
      description: 'Continuous differential equations are integrated in real time using 4th-order Runge-Kutta (RK4) and Modified Nodal Analysis (MNA). Adaptive micro-timestepping prevents numerical instability even when encountering stiff non-linearities or rapid switching transients.',
      technicalDetails: [
        'Global truncation error bounded to O(Δt⁴)',
        'CFL (Courant–Friedrichs–Lewy) stability criterion verification',
        'High-speed client-side execution in JavaScript TypedArrays (Float64)'
      ],
      codeSnippet: `// 4th-Order Runge-Kutta (RK4) Step
function rk4Step(state, t, dt, params) {
  const k1 = evaluateDerivatives(state, t, params);
  const k2 = evaluateDerivatives(add(state, k1, dt/2), t + dt/2, params);
  const k3 = evaluateDerivatives(add(state, k2, dt/2), t + dt/2, params);
  const k4 = evaluateDerivatives(add(state, k3, dt),   t + dt,   params);
  
  return add(state, weightedSum(k1, k2, k3, k4), dt / 6);
}`
    },
    {
      stepNumber: '03',
      title: 'Real-Time Synchronous Visual Telemetry',
      subtitle: 'Dual-Domain Oscilloscope & Vector Graphics',
      icon: <Activity className="w-5 h-5 text-amber-400" />,
      description: 'Calculated state vectors are immediately piped to low-latency HTML5 Canvas/WebGL engines. Time-domain traces, rotating phasor vectors, frequency-domain Bode plots, and spatial heat/strain maps update synchronously at 60 FPS.',
      technicalDetails: [
        'Sub-millisecond render cycle aligned with requestAnimationFrame',
        'Direct tactile manipulation: sliders trigger immediate state evolution',
        'Simultaneous multi-channel probing with true trigger thresholds'
      ],
      codeSnippet: `// 60 FPS Canvas Telemetry Pipeline
function renderTelemetry(ctx, timeSeries, params) {
  ctx.clearRect(0, 0, width, height);
  drawScopeGrid(ctx, 10, 8); // 10 divs horizontal, 8 vertical
  renderChannel(ctx, timeSeries.vIn, '#06b6d4', 'Vin');
  renderChannel(ctx, timeSeries.vOut, '#10b981', 'Vout');
  renderPhasorPlane(ctx, timeSeries.lastPhase, '#f59e0b');
}`
    },
    {
      stepNumber: '04',
      title: 'Lab Correlation & Telemetry Data Export',
      subtitle: 'Bridging Simulated Theory to Physical Benchmarks',
      icon: <DownloadCloud className="w-5 h-5 text-purple-400" />,
      description: 'Simulations are designed to mirror actual laboratory test equipment (e.g. Keysight, Tektronix, Rigol). Students and engineers can export full time-series matrices to CSV for MATLAB, Python, or physical bench correlation.',
      technicalDetails: [
        'Export time-stamped node voltages and branch currents to CSV',
        'Standardized probe impedance and signal noise simulation',
        'Direct compatibility with university lab manual assignments'
      ],
      codeSnippet: `// Raw Time-Series Telemetry Export
function exportTelemetryCSV(buffer) {
  const headers = "time_s,vin_v,vout_v,i_inductor_a,phase_deg\\n";
  const rows = buffer.map(p => 
    \`\${p.t.toFixed(6)},\${p.vIn.toFixed(4)},\${p.vOut.toFixed(4)},\${p.iL.toFixed(4)},\${p.phase.toFixed(2)}\`
  ).join("\\n");
  downloadBlob(new Blob([headers + rows], { type: 'text/csv' }), 'sim_data.csv');
}`
    }
  ];

  const active = steps[activeStep - 1];

  return (
    <section id="how-it-works" className="py-16 lg:py-24 border-b border-slate-800 bg-[#080d16] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-wider uppercase">
            <Cpu className="w-3.5 h-3.5" />
            <span>Architecture & Numerical Pipeline</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            How It Works
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            The mathematical and computational sequence running inside your browser. 
            No cloud round-trips, no canned video loops—pure real-time numerical physics.
          </p>
        </div>

        {/* 4 Steps Navigation Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {steps.map((s, idx) => {
            const isCurrent = idx + 1 === activeStep;
            return (
              <button
                key={s.stepNumber}
                onClick={() => setActiveStep(idx + 1)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'bg-slate-900 border-cyan-500/70 shadow-lg shadow-cyan-950/20'
                    : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    PHASE {s.stepNumber}
                  </span>
                  <div className="p-1 rounded bg-slate-800/60">
                    {s.icon}
                  </div>
                </div>
                <div className="font-display text-sm font-bold text-white">
                  {s.title}
                </div>
                <div className="text-[11px] font-mono text-slate-400 truncate mt-1">
                  {s.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Step Detail Showcase */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Step Description & Rigor Details */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                  <span>STEP {active.stepNumber} OF 04</span>
                  <span>•</span>
                  <span>{active.subtitle}</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-white">
                  {active.title}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {active.description}
                </p>
              </div>

              {/* Technical Specifications Checklist */}
              <div className="space-y-2.5 pt-2">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Numerical Implementation Guarantees:
                </div>
                {active.technicalDetails.map((detail, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>

              {/* Step Navigation Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
                <button
                  onClick={() => setActiveStep(activeStep === 1 ? 4 : activeStep - 1)}
                  className="px-3.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
                >
                  ← Previous Phase
                </button>
                <button
                  onClick={() => setActiveStep(activeStep === 4 ? 1 : activeStep + 1)}
                  className="px-3.5 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs font-mono transition-colors"
                >
                  Next Phase →
                </button>
              </div>
            </div>

            {/* Right: Technical Code & Algorithm Pane */}
            <div className="lg:col-span-6">
              <div className="rounded-xl border border-slate-800 bg-[#040711] overflow-hidden font-mono text-xs shadow-xl">
                
                {/* Code Terminal Topbar */}
                <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-slate-300 text-[11px]">
                      LiveSimulators Core Solver Kernel
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    TypeScript / Float64
                  </span>
                </div>

                {/* Code Body */}
                <div className="p-4 overflow-x-auto text-[11px] leading-relaxed text-slate-300">
                  <pre className="text-cyan-300/90 font-mono">
                    <code>{active.codeSnippet}</code>
                  </pre>
                </div>

                {/* Footer status */}
                <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Execution Target: Local Client Thread</span>
                  <span className="text-emerald-400 font-semibold">Zero Server Overhead</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
