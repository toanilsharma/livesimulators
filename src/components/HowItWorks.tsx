import React from 'react';
import { 
  GitBranch, 
  Binary, 
  Activity, 
  DownloadCloud, 
  Cpu
} from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      stepNumber: '01',
      title: 'Physical & Mathematical Formulation',
      subtitle: 'Continuous Governing Differential Equations',
      icon: <GitBranch className="w-5 h-5 text-cyan-400" />,
      description: 'First-principles physics: Maxwell\'s equations, Kirchhoff\'s laws, Navier-Stokes fluid mechanics, or Euler-Bernoulli beam theory formulated explicitly without black-box approximations.'
    },
    {
      stepNumber: '02',
      title: 'High-Precision Numerical Discretization',
      subtitle: 'Runge-Kutta 4th-Order (RK4) Integration',
      icon: <Binary className="w-5 h-5 text-emerald-400" />,
      description: 'Continuous differential equations integrated in real time using 4th-order Runge-Kutta and Modified Nodal Analysis with adaptive timestepping.'
    },
    {
      stepNumber: '03',
      title: 'Real-Time Synchronous Visual Telemetry',
      subtitle: 'Dual-Domain Oscilloscope & Vector Graphics',
      icon: <Activity className="w-5 h-5 text-amber-400" />,
      description: 'Calculated state vectors piped directly to low-latency HTML5 Canvas/WebGL engines updating synchronously at 60 FPS.'
    },
    {
      stepNumber: '04',
      title: 'Lab Correlation & Telemetry Data Export',
      subtitle: 'Bridging Simulated Theory to Physical Benchmarks',
      icon: <DownloadCloud className="w-5 h-5 text-purple-400" />,
      description: 'Simulations mirror actual laboratory test equipment (Keysight, Tektronix). Export full time-series matrices to CSV for MATLAB, Python, or physical bench correlation.'
    }
  ];

  return (
    <section id="how-it-works" className="py-16 lg:py-24 border-b border-slate-800 bg-[#080d16] relative">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        
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

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s) => (
            <div
              key={s.stepNumber}
              className="p-5 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:bg-slate-900/60 hover:border-slate-700/80 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    PHASE {s.stepNumber}
                  </span>
                  <div className="p-1.5 rounded bg-slate-800/60">
                    {s.icon}
                  </div>
                </div>
                <div className="font-display text-base font-bold text-white mb-1.5">
                  {s.title}
                </div>
                <div className="text-[11px] font-mono text-slate-400 mb-3">
                  {s.subtitle}
                </div>
              </div>
              <p className="text-xs text-slate-400 pt-3 border-t border-slate-800/70 leading-relaxed font-sans">
                {s.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
