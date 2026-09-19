import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  ArrowUpRight, 
  Activity, 
  Play, 
  Sliders, 
  Cpu, 
  Layers, 
  Maximize2,
  Code2,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { SimulatorItem } from '../types';
import { FEATURED_ELECTRICAL_SIMULATORS } from '../data/simulators';
import { MathView } from './MathView';

interface FeaturedElectricalProps {
  onLaunchSimulator: (simulator: SimulatorItem) => void;
}

// Micro-canvas renderer for the 6 electrical simulator cards
const MicroSimulatorCanvas: React.FC<{
  type: string;
  accentColor: string;
}> = ({ type, accentColor }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const tRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      tRef.current += dt * 2.2;
      const t = tRef.current;
      const w = canvas.width;
      const h = canvas.height;

      // Dark scope background
      ctx.fillStyle = '#040711';
      ctx.fillRect(0, 0, w, h);

      // Light engineering grid lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 0.8;
      for (let x = 0; x < w; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const midY = h / 2;

      if (type === 'rlc') {
        // Underdamped decaying ringing or sinusoidal resonance
        ctx.beginPath();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        for (let x = 0; x < w; x++) {
          const progress = x / w;
          const decay = Math.exp(-progress * 2.2);
          const y = midY - Math.sin(progress * 18 - t * 4) * (h * 0.38) * decay;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Envelope
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const progress = x / w;
          const decay = Math.exp(-progress * 2.2);
          const y = midY - (h * 0.38) * decay;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

      } else if (type === 'three_phase') {
        // Standard R-Y-B-N 3-Phase balanced waveforms (IEC 60446 / IS 3043 / IEEE 141)
        // R (Red: #ef4444), Y (Yellow: #eab308), B (Blue: #2563eb), N (Neutral: #64748b)
        const phaseColors = ['#ef4444', '#eab308', '#2563eb'];
        const offsets = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];

        // Neutral (N) 0V Reference Line
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(0, midY);
        ctx.lineTo(w, midY);
        ctx.stroke();
        ctx.setLineDash([]);

        offsets.forEach((phi, idx) => {
          ctx.beginPath();
          ctx.strokeStyle = phaseColors[idx];
          ctx.lineWidth = 2.0;
          for (let x = 0; x < w; x++) {
            const y = midY - Math.sin((x / w) * 2.5 * Math.PI - t * 2.5 + phi) * (h * 0.32);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });

        // Standard R-Y-B-N Phase Identification Badge
        ctx.font = 'bold 9px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#ef4444';
        ctx.fillText('R', w - 42, 16);
        ctx.fillStyle = '#eab308';
        ctx.fillText('Y', w - 30, 16);
        ctx.fillStyle = '#2563eb';
        ctx.fillText('B', w - 18, 16);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('N', w - 8, 16);

      } else if (type === 'buck_boost') {
        // Inductor ramp current triangular wave + PWM pulses
        ctx.beginPath();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        const period = 36;
        const duty = 0.6;
        for (let x = 0; x < w; x++) {
          const phase = (x + t * 40) % period;
          const normPhase = phase / period;
          let y;
          if (normPhase < duty) {
            y = midY + 20 - (normPhase / duty) * 35; // rising slope
          } else {
            y = midY - 15 + ((normPhase - duty) / (1 - duty)) * 35; // falling slope
          }
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Gate PWM square pulse at bottom
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const phase = (x + t * 40) % period;
          const normPhase = phase / period;
          const y = normPhase < duty ? h - 18 : h - 6;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

      } else if (type === 'sallen_key') {
        // Low-pass filter frequency response (Bode plot) with moving probe
        ctx.beginPath();
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2.2;
        const cutoffX = w * 0.55;
        for (let x = 0; x < w; x++) {
          let y;
          if (x < cutoffX) {
            // Flat passband
            y = 28 + Math.sin(x / 10) * 0.5;
          } else {
            // -40dB/decade drop
            const dx = (x - cutoffX) / (w - cutoffX);
            y = 28 + dx * dx * (h - 45);
          }
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // -3dB Cutoff point marker
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(cutoffX, 32, 4, 0, 2 * Math.PI);
        ctx.fill();

        // Animated probe signal
        const probeX = (cutoffX + Math.sin(t * 2) * (w * 0.35));
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(probeX, 0);
        ctx.lineTo(probeX, h);
        ctx.stroke();
        ctx.setLineDash([]);

      } else if (type === 'transmission_line') {
        // Standing wave pattern: Incident + Reflected interference envelope
        ctx.beginPath();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        for (let x = 0; x < w; x++) {
          const spatial = (x / w) * 4 * Math.PI;
          // Standing wave = 2 * A * cos(kx) * sin(wt)
          const instant = 2 * Math.cos(spatial) * Math.sin(t * 3);
          const y = midY - instant * (h * 0.18);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Standing wave envelope (VSWR max/min bounds)
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const spatial = (x / w) * 4 * Math.PI;
          const env = 2 * Math.abs(Math.cos(spatial));
          const y = midY - env * (h * 0.18);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

      } else if (type === 'fourier') {
        // Partial sum of square wave harmonics
        ctx.beginPath();
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2;
        for (let x = 0; x < w; x++) {
          const theta = (x / w) * 3 * Math.PI - t * 2;
          let sum = 0;
          for (let n = 1; n <= 7; n += 2) {
            sum += (1 / n) * Math.sin(n * theta);
          }
          const y = midY - (4 / Math.PI) * sum * (h * 0.35);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Target ideal square wave in faint outline
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.25)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const theta = (x / w) * 3 * Math.PI - t * 2;
          const sq = Math.sin(theta) >= 0 ? 1 : -1;
          const y = midY - sq * (h * 0.35);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [type, accentColor]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={110}
      className="w-full h-[110px] block rounded-t-lg bg-[#040711]"
    />
  );
};

export const FeaturedElectrical: React.FC<FeaturedElectricalProps> = ({ onLaunchSimulator }) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filteredSimulators = activeFilter === 'all' 
    ? FEATURED_ELECTRICAL_SIMULATORS 
    : FEATURED_ELECTRICAL_SIMULATORS.filter(s => s.difficulty.toLowerCase() === activeFilter.toLowerCase());

  return (
    <section id="featured-electrical" className="py-16 lg:py-24 border-b border-slate-800 bg-[#080d16] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-slate-800/80">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-wider uppercase">
              <Zap className="w-3.5 h-3.5" />
              <span>Flagship Domain • Electrical Engineering</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Featured Electrical Simulators
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Real-time nodal solvers for AC power grids, switching converters, transmission lines, 
              and active analog signal processors. Interact immediately with live mathematical waveforms.
            </p>
          </div>

          {/* Difficulty Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${activeFilter === 'all' ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'}`}
            >
              All Topologies (6)
            </button>
            <button
              onClick={() => setActiveFilter('fundamentals')}
              className={`px-3 py-1.5 rounded-md transition-colors ${activeFilter === 'fundamentals' ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Fundamentals (3)
            </button>
            <button
              onClick={() => setActiveFilter('intermediate')}
              className={`px-3 py-1.5 rounded-md transition-colors ${activeFilter === 'intermediate' ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Intermediate (2)
            </button>
            <button
              onClick={() => setActiveFilter('advanced')}
              className={`px-3 py-1.5 rounded-md transition-colors ${activeFilter === 'advanced' ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Advanced (1)
            </button>
          </div>
        </div>

        {/* 6 High-Fidelity Simulator Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-10">
          {filteredSimulators.map((sim) => (
            <div
              key={sim.id}
              onClick={() => onLaunchSimulator(sim)}
              className="group relative rounded-xl border border-slate-800 bg-slate-900/70 hover:bg-slate-900/95 hover:border-cyan-500/60 transition-all duration-300 flex flex-col overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.18)] hover:-translate-y-1 cursor-pointer"
              id={`card-sim-${sim.id}`}
            >
              {/* Card Micro-Canvas Header */}
              <div className="relative border-b border-slate-800/80">
                <MicroSimulatorCanvas type={sim.type} accentColor={sim.accentColor} />

                {/* Floating Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-slate-950/85 border border-slate-800 text-slate-200 backdrop-blur-sm">
                    {sim.disciplineName}
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
                    {sim.difficulty}
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <span
                    className="p-1.5 rounded bg-slate-950/80 group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-300 border border-slate-800 group-hover:border-cyan-400 transition-all backdrop-blur-sm inline-flex items-center justify-center shadow-sm"
                    title="Launch this simulator in full studio"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Bottom wave tag */}
                <div className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded bg-slate-950/85 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>60 FPS Dynamic Trace</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                
                <div>
                  <h3 className="font-display text-lg font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center justify-between">
                    <span>{sim.title}</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </h3>
                  
                  <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                    {sim.tagline}
                  </p>
                </div>

                {/* Governing Equation Box */}
                <div className="p-2.5 rounded-lg bg-slate-950/90 border border-slate-800/90 group-hover:border-cyan-500/30 transition-colors font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Governing Math</span>
                    <span className="text-slate-400 font-semibold">{sim.physicalLaw}</span>
                  </div>
                  <div className="text-cyan-300 font-mono text-xs overflow-x-auto custom-scrollbar py-0.5" title={sim.governingEquation}>
                    <MathView math={sim.governingEquation} />
                  </div>
                </div>

                {/* Parameter Pills */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Controllable Parameters:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sim.parameters.map((param) => (
                      <span
                        key={param.id}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800/80 text-slate-300 border border-slate-700/60 group-hover:border-slate-600 transition-colors"
                        title={param.description}
                      >
                        {param.symbol} ({param.unit || 'ratio'})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Real-time ODE</span>
                  </div>

                  <span
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-slate-800 group-hover:bg-cyan-500 text-slate-200 group-hover:text-slate-950 font-bold text-xs transition-all shadow-sm"
                  >
                    <span>Launch Simulator</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Electrical Engineering Standards Note */}
        <div className="mt-10 p-4 rounded-xl border border-slate-800/90 bg-slate-950/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>All electrical circuits benchmarked against SPICE transient engines and analytical differential solutions.</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>UNITS: SI (V, A, Ω, H, F, W)</span>
            <span>INTEGRATOR: RUNGE-KUTTA 4</span>
          </div>
        </div>

      </div>
    </section>
  );
};
