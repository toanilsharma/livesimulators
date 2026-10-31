import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Activity, Zap, ExternalLink, Sliders, ArrowRight } from 'lucide-react';
import { DisciplineId, SimulatorItem } from '../../types';
import { ALL_AVAILABLE_SIMULATORS } from '../../data/simulators';

interface DepartmentHeroSandboxProps {
  departmentId: DisciplineId;
  accentColor: string;
  onLaunchSimulator: (sim: SimulatorItem) => void;
}

export const DepartmentHeroSandbox: React.FC<DepartmentHeroSandboxProps> = ({
  departmentId,
  accentColor,
  onLaunchSimulator,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Department-specific parameters
  // Electrical: f (Hz), R (Ohms)
  const [elecFreq, setElecFreq] = useState<number>(101);
  const [elecR, setElecR] = useState<number>(25);

  // Mechanical: r (omega/omega_n), zeta (damping ratio)
  const [mechR, setMechR] = useState<number>(1.0);
  const [mechZeta, setMechZeta] = useState<number>(0.15);

  // Civil: load P (kN), load position a/L (0.1 to 0.9)
  const [civilLoad, setCivilLoad] = useState<number>(80);
  const [civilPos, setCivilPos] = useState<number>(0.5);

  // Control: Kp (0.5 to 8.0), Ki (0.0 to 4.0)
  const [ctrlKp, setCtrlKp] = useState<number>(2.5);
  const [ctrlKi, setCtrlKi] = useState<number>(1.2);

  // Chemical: Coolant Temp Tc (290 to 350 K), Tau (5 to 40 min)
  const [chemTc, setChemTc] = useState<number>(310);
  const [chemTau, setChemTau] = useState<number>(20);

  // Physics: Va (-1.5 to +0.7 V), Doping Na log (15 to 18)
  const [physVa, setPhysVa] = useState<number>(0.0);
  const [physNaLog, setPhysNaLog] = useState<number>(16);

  // Animation frame ref
  const animRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // Map flagship simulator to launch for each department
  const flagshipSimId = {
    electrical: 'rlc-resonance',
    mechanical: 'harmonic-oscillator',
    civil: 'beam-deflection',
    control: 'pid-controller',
    chemical: 'cstr-kinetics',
    physics: 'pn-junction',
  }[departmentId] || 'rlc-resonance';

  const flagshipSim = ALL_AVAILABLE_SIMULATORS.find((s) => s.id === flagshipSimId);

  // 60 FPS Canvas rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      timeRef.current += 0.035;
      const t = timeRef.current;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      const width = rect.width;
      const height = rect.height;

      // Dark background with subtle grid
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 24;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Department-specific rendering
      if (departmentId === 'electrical') {
        // ELECTRICAL: AC Voltage vs Current with resonance phase shift
        const L = 0.05; // 50 mH
        const C = 0.00005; // 50 uF
        const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C)); // ~100.66 Hz
        const omega = 2 * Math.PI * elecFreq;
        const XL = omega * L;
        const XC = 1 / (omega * C);
        const Xnet = XL - XC;
        const Z = Math.sqrt(elecR * elecR + Xnet * Xnet);
        const phase = Math.atan2(Xnet, elecR);
        const currentAmp = Math.min(1.8, (120 / Z) * (elecR / 40));

        const midY = height / 2;

        // Center zero line
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, midY);
        ctx.lineTo(width, midY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Voltage Wave (Cyan)
        ctx.beginPath();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 8;
        for (let x = 0; x < width; x++) {
          const waveT = (x / width) * 4 * Math.PI - t * (elecFreq / 30);
          const y = midY - Math.sin(waveT) * (height * 0.32);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Current Wave (Amber, with phase shift)
        ctx.beginPath();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10;
        for (let x = 0; x < width; x++) {
          const waveT = (x / width) * 4 * Math.PI - t * (elecFreq / 30) - phase;
          const y = midY - Math.sin(waveT) * (height * 0.32 * (currentAmp * 0.7));
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Waveform legends
        ctx.font = '10px monospace';
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('v(t) Input Excitation', 12, 20);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`i(t) Response (Δθ = ${(phase * (180 / Math.PI)).toFixed(1)}°)`, 12, 34);

      } else if (departmentId === 'mechanical') {
        // MECHANICAL: Dynamic Magnification Curve & Vibrating SDOF Mass
        const r = mechR;
        const zeta = mechZeta;
        const denom = Math.sqrt(Math.pow(1 - r * r, 2) + Math.pow(2 * zeta * r, 2));
        const M = Math.min(8.0, 1 / (denom || 0.001));

        // Draw SDOF vibrating mass on the left 30%
        const leftW = Math.min(100, width * 0.3);
        const massY = height / 2 + Math.sin(t * r * 4) * Math.min(height * 0.38, 8 * M);

        ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(leftW / 2 - 20, massY - 15, 40, 30);
        ctx.fillRect(leftW / 2 - 20, massY - 15, 40, 30);

        // Spring line
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(leftW / 2, 0);
        const coils = 8;
        for (let i = 1; i <= coils; i++) {
          const y = (massY - 15) * (i / coils);
          const xOffset = i % 2 === 0 ? 8 : -8;
          ctx.lineTo(leftW / 2 + (i === coils ? 0 : xOffset), y);
        }
        ctx.stroke();

        // Draw Magnification Spectrum Curve M(r) on right 70%
        const specX = leftW + 20;
        const specW = width - specX - 20;
        const specH = height - 40;
        const baseH = height - 20;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.moveTo(specX, baseH);
        ctx.lineTo(specX + specW, baseH);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 6;
        for (let px = 0; px <= specW; px += 2) {
          const evalR = 0.2 + (px / specW) * 2.3;
          const evalDenom = Math.sqrt(Math.pow(1 - evalR * evalR, 2) + Math.pow(2 * zeta * evalR, 2));
          const evalM = Math.min(6, 1 / (evalDenom || 0.001));
          const py = baseH - (evalM / 6) * specH;
          if (px === 0) ctx.moveTo(specX + px, py);
          else ctx.lineTo(specX + px, py);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Current Operating Point Dot on Curve
        const dotX = specX + ((r - 0.2) / 2.3) * specW;
        const dotY = baseH - (Math.min(6, M) / 6) * specH;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = '10px monospace';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`M(ω) Magnification = ${M.toFixed(2)}x`, specX + 5, 20);

      } else if (departmentId === 'civil') {
        // CIVIL: Elastic Beam Deflection w(x) and Moment Diagram
        const P = civilLoad;
        const posRatio = civilPos; // a/L
        const beamY = height * 0.45;
        const marginX = 25;
        const spanW = width - marginX * 2;

        // Beam resting axis
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.25)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(marginX, beamY);
        ctx.lineTo(marginX + spanW, beamY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Supports: Pin at Left, Roller at Right
        ctx.fillStyle = '#f43f5e';
        // Left Pin Triangle
        ctx.beginPath();
        ctx.moveTo(marginX, beamY);
        ctx.lineTo(marginX - 7, beamY + 12);
        ctx.lineTo(marginX + 7, beamY + 12);
        ctx.closePath();
        ctx.fill();
        // Right Roller
        ctx.beginPath();
        ctx.arc(marginX + spanW, beamY + 6, 6, 0, Math.PI * 2);
        ctx.fill();

        // Deflected Elastic Curve w(x)
        ctx.beginPath();
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 10;
        const a = posRatio;
        const b = 1 - a;
        let maxDeflectionY = 0;
        for (let px = 0; px <= spanW; px += 2) {
          const xRatio = px / spanW;
          let wNorm = 0;
          if (xRatio <= a) {
            wNorm = (b * xRatio * (1 - b * b - xRatio * xRatio)) / 6;
          } else {
            const revX = 1 - xRatio;
            wNorm = (a * revX * (1 - a * a - revX * revX)) / 6;
          }
          const dy = wNorm * (P / 20) * 80;
          const currentY = beamY + dy;
          if (currentY > maxDeflectionY) maxDeflectionY = currentY;
          if (px === 0) ctx.moveTo(marginX + px, currentY);
          else ctx.lineTo(marginX + px, currentY);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Force Arrow
        const arrowX = marginX + posRatio * spanW;
        ctx.strokeStyle = '#fb7185';
        ctx.fillStyle = '#fb7185';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(arrowX, beamY - 35);
        ctx.lineTo(arrowX, beamY - 4);
        ctx.stroke();
        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(arrowX, beamY);
        ctx.lineTo(arrowX - 5, beamY - 10);
        ctx.lineTo(arrowX + 5, beamY - 10);
        ctx.closePath();
        ctx.fill();

        ctx.font = '10px monospace';
        ctx.fillStyle = '#fb7185';
        ctx.fillText(`P = ${P} kN @ ${(posRatio * 10).toFixed(1)}m`, arrowX - 25, beamY - 40);
        ctx.fillText(`w_max = ${((P * a * b * 1000) / 1800).toFixed(1)} mm`, marginX, height - 12);

      } else if (departmentId === 'control') {
        // CONTROL: Closed-loop Step Response Curve
        const Kp = ctrlKp;
        const Ki = ctrlKi;
        const marginX = 35;
        const plotW = width - marginX - 15;
        const plotH = height - 40;
        const baseH = height - 15;
        const setpointY = baseH - plotH * 0.65;

        // Setpoint line
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(marginX, setpointY);
        ctx.lineTo(marginX + plotW, setpointY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Axes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.moveTo(marginX, baseH);
        ctx.lineTo(marginX + plotW, baseH);
        ctx.moveTo(marginX, baseH);
        ctx.lineTo(marginX, baseH - plotH);
        ctx.stroke();

        // Step response simulation curve: 2nd-order with PID
        const wn = Math.sqrt(Kp * 2 + Ki * 4);
        const zeta = Math.max(0.1, (2 + Kp) / (2 * wn));
        const wd = wn * Math.sqrt(Math.max(0.01, 1 - zeta * zeta));

        ctx.beginPath();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;
        for (let px = 0; px <= plotW; px += 2) {
          const evalT = (px / plotW) * 8.0;
          let yVal = 1 - Math.exp(-zeta * wn * evalT) * (Math.cos(wd * evalT) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * evalT));
          if (Ki > 0) {
            yVal = yVal + (1 - Math.exp(-evalT * Ki * 0.8)) * 0.05;
          }
          const py = baseH - yVal * (plotH * 0.65);
          if (px === 0) ctx.moveTo(marginX + px, py);
          else ctx.lineTo(marginX + px, py);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        const osPct = Math.max(0, Math.exp((-zeta * Math.PI) / Math.sqrt(1 - zeta * zeta)) * 100);
        ctx.font = '10px monospace';
        ctx.fillStyle = '#10b981';
        ctx.fillText(`Target Setpoint r(t) = 1.0`, marginX + 10, setpointY - 6);
        ctx.fillText(`Overshoot %OS: ${osPct.toFixed(1)}% | Ts: ${(4 / (zeta * wn)).toFixed(2)}s`, marginX + 10, 20);

      } else if (departmentId === 'chemical') {
        // CHEMICAL: Exothermic CSTR Heat Generation vs Removal
        const Tc = chemTc;
        const tau = chemTau;
        const marginX = 40;
        const plotW = width - marginX - 20;
        const plotH = height - 40;
        const baseH = height - 15;

        // Axes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.moveTo(marginX, baseH);
        ctx.lineTo(marginX + plotW, baseH);
        ctx.moveTo(marginX, baseH);
        ctx.lineTo(marginX, baseH - plotH);
        ctx.stroke();

        // Q_rem Line (linear with temperature)
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const tMin = 290;
        const tMax = 420;
        const yRem1 = baseH - ((Tc - tMin) / (tMax - tMin)) * plotH * 0.2;
        const yRem2 = baseH - plotH * 0.85;
        ctx.moveTo(marginX, yRem1);
        ctx.lineTo(marginX + plotW, yRem2);
        ctx.stroke();

        // Q_gen Sigmoidal Arrhenius Curve (Violet)
        ctx.beginPath();
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#8b5cf6';
        ctx.shadowBlur = 8;
        for (let px = 0; px <= plotW; px += 2) {
          const evalT = tMin + (px / plotW) * (tMax - tMin);
          const k = 1e5 * Math.exp(-4200 / evalT);
          const XA = (k * tau) / (1 + k * tau);
          const py = baseH - XA * (plotH * 0.8);
          if (px === 0) ctx.moveTo(marginX + px, py);
          else ctx.lineTo(marginX + px, py);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font = '10px monospace';
        ctx.fillStyle = '#8b5cf6';
        ctx.fillText(`Q_gen Arrhenius S-Curve (Tc = ${Tc} K)`, marginX + 10, 20);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`Q_rem Coolant Line`, marginX + 10, 34);

      } else {
        // PHYSICS: P-N Junction Energy Band Bending (Conduction & Valence)
        const Va = physVa;
        const midX = width / 2;
        const midY = height / 2;
        const Vbi = 0.7;
        const barrier = Math.max(0.05, Vbi - Va);
        const depW = Math.min(width * 0.4, 40 * Math.sqrt(barrier));

        // Depletion zone shading
        ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.fillRect(midX - depW / 2, 0, depW, height);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.setLineDash([2, 3]);
        ctx.strokeRect(midX - depW / 2, 0, depW, height);
        ctx.setLineDash([]);

        // Conduction Band Ec (Sky Blue)
        ctx.beginPath();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        for (let x = 0; x <= width; x += 2) {
          let y = midY - 30;
          if (x < midX - depW / 2) {
            y = midY - 30;
          } else if (x > midX + depW / 2) {
            y = midY - 30 + barrier * 40;
          } else {
            const frac = (x - (midX - depW / 2)) / depW;
            y = midY - 30 + barrier * 40 * (0.5 - 0.5 * Math.cos(frac * Math.PI));
          }
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Valence Band Ev
        ctx.beginPath();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        for (let x = 0; x <= width; x += 2) {
          let y = midY + 25;
          if (x < midX - depW / 2) {
            y = midY + 25;
          } else if (x > midX + depW / 2) {
            y = midY + 25 + barrier * 40;
          } else {
            const frac = (x - (midX - depW / 2)) / depW;
            y = midY + 25 + barrier * 40 * (0.5 - 0.5 * Math.cos(frac * Math.PI));
          }
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Fermi Level Ef
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(20, midY - 5);
        ctx.lineTo(width - 20, midY - 5);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = '10px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`Ec Band Diagram (Va = ${Va >= 0 ? '+' : ''}${Va.toFixed(2)} V)`, 12, 20);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`Fermi Level Ef | Barrier: ${barrier.toFixed(2)} eV`, 12, 34);
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isRunning = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [departmentId, elecFreq, elecR, mechR, mechZeta, civilLoad, civilPos, ctrlKp, ctrlKi, chemTc, chemTau, physVa, physNaLog]);

  return (
    <div
      id="hero-sandbox"
      className="relative rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-950 to-[#050811] border border-slate-800 p-4 sm:p-5 shadow-2xl overflow-hidden"
    >
      {/* Top Bar: Title & Telemetry Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full animate-ping"
            style={{ backgroundColor: accentColor }}
          />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" style={{ color: accentColor }} />
            Live Concept Sandbox (60 FPS Kernel)
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            Real-time ODE
          </span>
        </div>

        {flagshipSim && (
          <button
            onClick={() => onLaunchSimulator(flagshipSim)}
            className="flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-xl border transition-all text-slate-200 hover:text-white"
            style={{
              borderColor: `${accentColor}50`,
              backgroundColor: `${accentColor}15`,
            }}
          >
            <span>Launch Dedicated Lab ({flagshipSim.title.split(' ')[0]})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Sandbox Grid: Interactive Sliders (Left) & Canvas Oscilloscope (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-3.5 items-center">
        {/* Sliders Panel */}
        <div className="lg:col-span-5 space-y-3.5 bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
          <div className="text-[11px] font-mono font-semibold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sliders className="w-3 h-3 text-cyan-400" />
              Dynamic Parameter Controls
            </span>
            <span className="text-[10px] text-slate-500">Touch or Drag</span>
          </div>

          {/* Department-specific Sliders */}
          {departmentId === 'electrical' && (
            <>
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Excitation Frequency (f):</span>
                  <span className="text-cyan-300 font-bold">{elecFreq} Hz</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="250"
                  step="1"
                  value={elecFreq}
                  onChange={(e) => setElecFreq(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
                  <span>20 Hz</span>
                  <span className="text-cyan-400 font-bold">f₀ = 101 Hz (Resonance Peak)</span>
                  <span>250 Hz</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Damping Resistance (R):</span>
                  <span className="text-amber-300 font-bold">{elecR} Ω</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="1"
                  value={elecR}
                  onChange={(e) => setElecR(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
                  <span>5 Ω (High Q Ringing)</span>
                  <span>100 Ω (Overdamped)</span>
                </div>
              </div>
            </>
          )}

          {departmentId === 'mechanical' && (
            <>
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Frequency Ratio (ω / ωₙ):</span>
                  <span className="text-amber-300 font-bold">{mechR.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.05"
                  value={mechR}
                  onChange={(e) => setMechR(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
                  <span>0.2 (Quasi-static)</span>
                  <span className="text-amber-400 font-bold">r = 1.0 (Resonance)</span>
                  <span>2.5 (Isolation)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Damping Ratio (ζ):</span>
                  <span className="text-cyan-300 font-bold">{mechZeta.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={mechZeta}
                  onChange={(e) => setMechZeta(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
                  <span>0.05 (Sharp Peak)</span>
                  <span>0.8 (Heavy Damping)</span>
                </div>
              </div>
            </>
          )}

          {departmentId === 'civil' && (
            <>
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Point Load Magnitude (P):</span>
                  <span className="text-rose-300 font-bold">{civilLoad} kN</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="180"
                  step="5"
                  value={civilLoad}
                  onChange={(e) => setCivilLoad(Number(e.target.value))}
                  className="w-full accent-rose-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
                  <span>20 kN</span>
                  <span>180 kN</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Span Location (x/L):</span>
                  <span className="text-amber-300 font-bold">{civilPos.toFixed(2)}L</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={civilPos}
                  onChange={(e) => setCivilPos(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
                  <span>0.1 (Near Support)</span>
                  <span className="text-rose-400 font-bold">0.5 (Mid-Span Max)</span>
                  <span>0.9</span>
                </div>
              </div>
            </>
          )}

          {departmentId === 'control' && (
            <>
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Proportional Gain (Kp):</span>
                  <span className="text-emerald-300 font-bold">{ctrlKp.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="7.0"
                  step="0.2"
                  value={ctrlKp}
                  onChange={(e) => setCtrlKp(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
                  <span>0.5 (Sluggish)</span>
                  <span>7.0 (High Slew)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Integral Gain (Ki):</span>
                  <span className="text-cyan-300 font-bold">{ctrlKi.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="3.5"
                  step="0.1"
                  value={ctrlKi}
                  onChange={(e) => setCtrlKi(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
                  <span>0.0 (Has Offset)</span>
                  <span className="text-emerald-400 font-bold">Eliminates e_ss</span>
                  <span>3.5 (Ringing)</span>
                </div>
              </div>
            </>
          )}

          {departmentId === 'chemical' && (
            <>
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Coolant Temp (Tc):</span>
                  <span className="text-violet-300 font-bold">{chemTc} K</span>
                </div>
                <input
                  type="range"
                  min="290"
                  max="350"
                  step="1"
                  value={chemTc}
                  onChange={(e) => setChemTc(Number(e.target.value))}
                  className="w-full accent-violet-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
                  <span>290 K (Strong Cooling)</span>
                  <span>350 K (Thermal Runaway Risk)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Residence Time (τ):</span>
                  <span className="text-cyan-300 font-bold">{chemTau} min</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="1"
                  value={chemTau}
                  onChange={(e) => setChemTau(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
                  <span>5 min (Low XA)</span>
                  <span>40 min (High XA)</span>
                </div>
              </div>
            </>
          )}

          {departmentId === 'physics' && (
            <>
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Applied Bias Voltage (Va):</span>
                  <span className="text-sky-300 font-bold">{physVa >= 0 ? '+' : ''}{physVa.toFixed(2)} V</span>
                </div>
                <input
                  type="range"
                  min="-1.5"
                  max="0.7"
                  step="0.05"
                  value={physVa}
                  onChange={(e) => setPhysVa(Number(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
                  <span>-1.5V (Reverse Bias, Wide Barrier)</span>
                  <span>+0.7V (Forward Conduction)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Acceptor Doping (Na):</span>
                  <span className="text-amber-300 font-bold">10^{physNaLog} cm⁻³</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="18"
                  step="1"
                  value={physNaLog}
                  onChange={(e) => setPhysNaLog(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
                  <span>10¹⁵ (Light Doping)</span>
                  <span>10¹⁸ (Heavy Degenerate)</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 60 FPS Real-Time Canvas Screen (Right) */}
        <div className="lg:col-span-7 relative rounded-xl border border-slate-800 overflow-hidden bg-[#050811] shadow-inner h-[210px] sm:h-[220px]">
          <canvas
            ref={canvasRef}
            className="w-full h-full block cursor-crosshair"
          />

          {/* Canvas Bottom Watermark */}
          <div className="absolute bottom-1.5 right-2 text-[9px] font-mono text-slate-500 pointer-events-none flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Float64 Live ODE Kernel Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
