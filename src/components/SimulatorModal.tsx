import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  Download, 
  Activity, 
  Maximize2, 
  HelpCircle,
  FileCode,
  Share2,
  Check,
  Zap,
  Info,
  ShieldCheck,
  Award,
  BookOpen,
  ChevronDown
} from 'lucide-react';
import { SimulatorItem } from '../types';
import { MathView } from './MathView';
import { MathWorkerBridge } from '../utils/mathWorkerBridge';

interface SimulatorModalProps {
  simulator: SimulatorItem | null;
  onClose: () => void;
}

export const SimulatorModal: React.FC<SimulatorModalProps> = ({ simulator, onClose }) => {
  if (!simulator) return null;

  // Initialize parameter values from simulator defaults
  const [params, setParams] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    simulator.parameters.forEach(p => {
      initial[p.id] = p.default;
    });
    return initial;
  });

  const [isRunning, setIsRunning] = useState(true);
  const [scopeChannelA, setScopeChannelA] = useState(true);
  const [scopeChannelB, setScopeChannelB] = useState(true);
  const [timebaseScale, setTimebaseScale] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // Web Worker Physics Engine Bridge for RK4 Integration & Non-Blocking Sliders
  const mathWorkerRef = useRef<MathWorkerBridge | null>(null);
  const latestWorkerStateRef = useRef<Record<string, any>>({});

  useEffect(() => {
    const bridge = new MathWorkerBridge();
    mathWorkerRef.current = bridge;
    bridge.setParams(simulator.type, params, timeRef.current);

    const unsubscribe = bridge.subscribe((data) => {
      if (data.simulatorType === simulator.type) {
        latestWorkerStateRef.current = data.state;
      }
    });

    return () => {
      unsubscribe();
      bridge.terminate();
      mathWorkerRef.current = null;
    };
  }, [simulator.id, simulator.type]);

  // Update params if simulator changes
  useEffect(() => {
    const initial: Record<string, number> = {};
    simulator.parameters.forEach(p => {
      initial[p.id] = p.default;
    });
    setParams(initial);
    timeRef.current = 0;
  }, [simulator]);

  // Handle parameter changes via postMessage to Web Worker
  const handleParamChange = (id: string, value: number) => {
    const nextParams = { ...params, [id]: value };
    setParams(nextParams);
    if (mathWorkerRef.current) {
      mathWorkerRef.current.setParams(simulator.type, nextParams, timeRef.current);
    }
  };

  const handleApplyPreset = (presetValues: Record<string, number>) => {
    const nextParams = { ...params, ...presetValues };
    setParams(nextParams);
    if (mathWorkerRef.current) {
      mathWorkerRef.current.setParams(simulator.type, nextParams, timeRef.current);
    }
  };

  // Real-time canvas rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTimestamp = performance.now();

    const render = (now: number) => {
      const dt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      if (isRunning) {
        timeRef.current += dt * 3.0 * timebaseScale;
        if (mathWorkerRef.current) {
          mathWorkerRef.current.step(simulator.type, params, dt * 3.0 * timebaseScale, timeRef.current);
        }
      }
      const t = timeRef.current;

      const w = canvas.width;
      const h = canvas.height;

      // Dark oscilloscope display background
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, w, h);

      // Graticule grid lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
      ctx.lineWidth = 1;
      const gridX = 30;
      const gridY = 30;

      for (let x = 0; x < w; x += gridX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Center crosshair
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();
      ctx.setLineDash([]);

      const midY = h / 2;

      // Draw Waveforms depending on simulator type
      if (simulator.type === 'rlc') {
        const R = params['resistance'] || 25;
        const L = (params['inductance'] || 60) / 1000;
        const C = (params['capacitance'] || 40) / 1000000;
        const f = params['frequency'] || 100;
        const omega = 2 * Math.PI * f;
        const XL = omega * L;
        const XC = 1 / (omega * C);
        const Z = Math.sqrt(R * R + (XL - XC) * (XL - XC));
        const phase = Math.atan2(XL - XC, R);

        // Channel A: Driving Voltage (Cyan)
        if (scopeChannelA) {
          ctx.beginPath();
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2.5;
          for (let x = 0; x < w; x++) {
            const wavePhase = (x / w) * 4 * Math.PI - t * 2;
            const y = midY - Math.sin(wavePhase) * (h * 0.35);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        // Channel B: Inductor Voltage or Current (Amber)
        if (scopeChannelB) {
          ctx.beginPath();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          const currentRatio = Math.min(1.5, 45 / Z);
          for (let x = 0; x < w; x++) {
            const wavePhase = (x / w) * 4 * Math.PI - t * 2 - phase;
            const y = midY - Math.sin(wavePhase) * (h * 0.35 * currentRatio);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

      } else if (simulator.type === 'three_phase') {
        // 3-Phase balanced voltages with standard R-Y-B-N phase color conventions
        const f = params['frequency'] || 50;
        const phaseColors = [
          { name: 'R', color: '#ef4444', label: 'Phase R' },
          { name: 'Y', color: '#eab308', label: 'Phase Y' },
          { name: 'B', color: '#2563eb', label: 'Phase B' },
        ];
        const offsets = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];

        // Draw neutral zero reference line (N)
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.moveTo(0, midY);
        ctx.lineTo(w, midY);
        ctx.stroke();
        ctx.setLineDash([]);

        offsets.forEach((phi, idx) => {
          ctx.beginPath();
          ctx.strokeStyle = phaseColors[idx].color;
          ctx.lineWidth = 2.5;
          for (let x = 0; x < w; x++) {
            const wavePhase = (x / w) * 3 * Math.PI - t * 2 + phi;
            const y = midY - Math.sin(wavePhase) * (h * 0.33);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });

        // Overlay standard R-Y-B-N legend box
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(w - 240, h - 42, 226, 30);
        ctx.strokeStyle = '#334155';
        ctx.strokeRect(w - 240, h - 42, 226, 30);

        ctx.font = '9px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#ef4444';
        ctx.fillText('■ R (Red)', w - 232, h - 23);
        ctx.fillStyle = '#eab308';
        ctx.fillText('■ Y (Yel)', w - 176, h - 23);
        ctx.fillStyle = '#2563eb';
        ctx.fillText('■ B (Blu)', w - 124, h - 23);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('┄ N (0V)', w - 74, h - 23);

      } else if (simulator.type === 'buck_boost') {
        const D = params['dutyCycle'] || 0.6;
        const period = 50;

        // Triangular inductor current
        ctx.beginPath();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        for (let x = 0; x < w; x++) {
          const phase = (x + t * 45) % period;
          const frac = phase / period;
          let y;
          if (frac < D) {
            y = midY + 30 - (frac / D) * 60; // ramp up
          } else {
            y = midY - 30 + ((frac - D) / (1 - D)) * 60; // ramp down
          }
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Switch gate voltage
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 0; x < w; x++) {
          const phase = (x + t * 45) % period;
          const frac = phase / period;
          const y = frac < D ? h - 25 : h - 10;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

      } else if (simulator.type === 'fourier') {
        const N = params['harmonicsCount'] || 7;
        ctx.beginPath();
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2.5;
        for (let x = 0; x < w; x++) {
          const theta = (x / w) * 4 * Math.PI - t * 2;
          let sum = 0;
          for (let n = 1; n <= N; n += 2) {
            sum += (1 / n) * Math.sin(n * theta);
          }
          const y = midY - (4 / Math.PI) * sum * (h * 0.35);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

      } else if (simulator.type === 'sic_switching') {
        const vBus = params['vBus'] || 800;
        const iLoad = params['iLoad'] || 40;
        const rg = params['rg'] || 5;
        const ringingDamp = Math.max(0.05, 1 / (rg * 0.4));
        const period = 70;

        // Channel A: Drain-to-Source Voltage V_ds (Cyan)
        if (scopeChannelA) {
          ctx.beginPath();
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2.5;
          for (let x = 0; x < w; x++) {
            const phase = (x + t * 50) % period;
            const frac = phase / period;
            let val = 0;
            if (frac < 0.4) {
              val = 1.0; // OFF state V_ds = V_bus
            } else if (frac < 0.48) {
              const ramp = (frac - 0.4) / 0.08;
              val = 1.0 - ramp + Math.sin(ramp * 18) * 0.25 * Math.exp(-ramp * ringingDamp * 6);
            } else if (frac < 0.85) {
              val = 0.02; // ON state V_ds(on)
            } else {
              const ramp = (frac - 0.85) / 0.15;
              val = ramp * 1.25 * Math.exp(-ramp * ringingDamp * 3) + ramp * 1.0;
            }
            const y = midY + h * 0.35 - Math.max(0, Math.min(1.4, val)) * (h * 0.65);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        // Channel B: Drain Current I_d (Amber)
        if (scopeChannelB) {
          ctx.beginPath();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          for (let x = 0; x < w; x++) {
            const phase = (x + t * 50) % period;
            const frac = phase / period;
            let val = 0;
            if (frac < 0.38) {
              val = 0; // OFF
            } else if (frac < 0.48) {
              const ramp = (frac - 0.38) / 0.10;
              val = ramp * 1.35 * Math.exp(-ramp * ringingDamp * 4) + ramp * 0.85; // overshoot
            } else if (frac < 0.85) {
              val = 1.0; // constant I_load
            } else {
              const ramp = (frac - 0.85) / 0.10;
              val = Math.max(0, 1.0 - ramp * 1.1);
            }
            const y = midY + h * 0.35 - Math.max(0, Math.min(1.5, val)) * (h * 0.55);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

      } else if (simulator.type === 'igbt_thermal') {
        // Channel A: Transient Junction Temperature Tj(t) (Rose/Red)
        const TjMax = params['tJunctionMax'] || 175;
        const Ploss = params['powerLoss'] || 450;
        const rth = (params['rthJc'] || 0.08) * 1.4;

        if (scopeChannelA) {
          ctx.beginPath();
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2.5;
          for (let x = 0; x < w; x++) {
            const normalizedT = (x / w) * 5;
            // 4-stage Foster thermal ladder response
            const zth = (1 - Math.exp(-normalizedT / 0.05)) * 0.2 +
                        (1 - Math.exp(-normalizedT / 0.35)) * 0.35 +
                        (1 - Math.exp(-normalizedT / 1.5)) * 0.45;
            const temp = 25 + (Ploss * rth) * zth;
            const y = h - 30 - (temp / TjMax) * (h * 0.7);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        // Channel B: Pulsed Power Loss P_loss (Amber)
        if (scopeChannelB) {
          ctx.beginPath();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.8;
          for (let x = 0; x < w; x++) {
            const pulse = (Math.sin((x / w) * 6 * Math.PI - t * 2) > 0.1) ? 0.8 : 0.15;
            const y = h - 30 - pulse * (h * 0.5);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

      } else if (simulator.type === 'mosfet_channel') {
        const vgs = params['vgs'] || 3.3;
        const vth = params['vth'] || 0.7;
        const vds = params['vds'] || 2.5;
        const vov = Math.max(0, vgs - vth);
        const isPinchOff = vds >= vov;

        // Channel A: Inversion Charge Qi(x) along channel length (Emerald)
        if (scopeChannelA) {
          ctx.beginPath();
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2.5;
          for (let x = 0; x < w; x++) {
            const xNorm = x / w;
            let charge = 1.0 - (isPinchOff ? (xNorm * 1.0) : (xNorm * (vds / Math.max(0.1, vov))));
            charge = Math.max(0.02, charge);
            const y = midY + h * 0.3 - charge * (h * 0.55);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        // Channel B: Surface Potential psi_s(x) along channel (Cyan)
        if (scopeChannelB) {
          ctx.beginPath();
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2;
          for (let x = 0; x < w; x++) {
            const xNorm = x / w;
            const pot = Math.min(vds, vov * Math.sqrt(xNorm));
            const y = midY + h * 0.3 - (pot / 3.5) * (h * 0.55);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

      } else if (simulator.type === 'distillation_column') {
        const alpha = params['relativeVolatility'] || 2.4;
        // Draw McCabe-Thiele VLE curve & equilibrium stages
        if (scopeChannelA) {
          ctx.beginPath();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          for (let x = 0; x < w; x++) {
            const xMole = x / w;
            const yEquil = (alpha * xMole) / (1 + (alpha - 1) * xMole);
            const y = h - 30 - yEquil * (h * 0.7);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();

          // 45 degree line (slate dashed)
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1.5;
          ctx.moveTo(0, h - 30);
          ctx.lineTo(w, h - 30 - 1.0 * (h * 0.7));
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Channel B: Dynamic concentration waves through trays
        if (scopeChannelB) {
          ctx.beginPath();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          for (let x = 0; x < w; x++) {
            const wave = 0.5 + 0.35 * Math.sin((x / w) * 3 * Math.PI - t * 1.5);
            const y = h - 30 - wave * (h * 0.7);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

      } else if (simulator.type === 'heat_exchanger') {
        const flowConfig = params['flowArrangement'] ?? 1; // 1 = Counter, 0 = Parallel
        const Thi = params['tHotIn'] || 135;
        const Tho = params['tHotOut'] || 82;
        const Tci = params['tColdIn'] || 25;
        const Tco = params['tColdOut'] || 68;

        // Channel A: Hot fluid temperature profile along length L
        if (scopeChannelA) {
          ctx.beginPath();
          ctx.strokeStyle = '#ef4444'; // Red for Hot
          ctx.lineWidth = 2.5;
          for (let x = 0; x < w; x++) {
            const frac = x / w;
            const Th = Thi - (Thi - Tho) * (1 - Math.exp(-2.2 * frac)) / (1 - Math.exp(-2.2));
            const y = h - 30 - (Th / 150) * (h * 0.7);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        // Channel B: Cold fluid temperature profile along length L
        if (scopeChannelB) {
          ctx.beginPath();
          ctx.strokeStyle = '#06b6d4'; // Cyan for Cold
          ctx.lineWidth = 2.5;
          for (let x = 0; x < w; x++) {
            const frac = x / w;
            let Tc = 0;
            if (flowConfig === 1) {
              // Counter-current: rises from inlet at far right or left
              Tc = Tco - (Tco - Tci) * frac;
            } else {
              // Parallel: rises from inlet at left
              Tc = Tci + (Tco - Tci) * (1 - Math.exp(-2.0 * frac)) / (1 - Math.exp(-2.0));
            }
            const y = h - 30 - (Tc / 150) * (h * 0.7);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

      } else if (simulator.type === 'gas_absorption') {
        const Qin = params['gasInletY'] || 0.06;
        const L_over_G = params['liquidGasRatio'] || 1.8;
        // Channel A: Gas mole ratio profile Y(z) along tower height (Amber)
        if (scopeChannelA) {
          ctx.beginPath();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2.5;
          for (let x = 0; x < w; x++) {
            const zNorm = x / w;
            const yRatio = Qin * Math.exp(-2.8 * zNorm);
            const y = h - 30 - (yRatio / 0.08) * (h * 0.7);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        // Channel B: Liquid mole ratio profile X(z) along tower height (Emerald)
        if (scopeChannelB) {
          ctx.beginPath();
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2;
          for (let x = 0; x < w; x++) {
            const zNorm = x / w;
            const xRatio = (Qin / L_over_G) * (1 - Math.exp(-2.8 * (1 - zNorm)));
            const y = h - 30 - (xRatio / 0.08) * (h * 0.7);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

      } else {
        // Generic wave response
        ctx.beginPath();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.5;
        for (let x = 0; x < w; x++) {
          const y = midY - Math.sin((x / w) * 4 * Math.PI - t * 2) * (h * 0.35);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // On-screen Oscilloscope overlay markers
      if (simulator.type === 'three_phase') {
        ctx.font = '10px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#ef4444';
        ctx.fillText('PHASE R: 230V∠0°', 16, 22);
        ctx.fillStyle = '#eab308';
        ctx.fillText('PHASE Y: 230V∠-120°', 150, 22);
        ctx.fillStyle = '#2563eb';
        ctx.fillText('PHASE B: 230V∠-240°', 300, 22);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`STD: IEC 60446 / IEEE 141 (R-Y-B-N)`, w - 250, 22);
      } else if (simulator.type === 'sic_switching') {
        ctx.font = '11px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('CH1 (V_ds): 200V/DIV', 16, 24);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('CH2 (I_d): 10A/DIV', 165, 24);
        ctx.fillStyle = '#10b981';
        ctx.fillText('JEDEC JESD24-11 DPT', w - 170, 24);
      } else if (simulator.type === 'igbt_thermal') {
        ctx.font = '11px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#f43f5e';
        ctx.fillText('CH1 (T_j): 25°C/DIV', 16, 24);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('CH2 (P_loss): 100W/DIV', 165, 24);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('IEC 60747-15 FOSTER', w - 170, 24);
      } else if (simulator.type === 'mosfet_channel') {
        ctx.font = '11px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#10b981';
        ctx.fillText('CH1 (Q_inv): C_ox(V_ov)/DIV', 16, 24);
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('CH2 (psi_s): 0.5V/DIV', 210, 24);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('BSIM4 / IEEE EDS', w - 150, 24);
      } else if (simulator.type === 'distillation_column') {
        ctx.font = '11px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('CH1 (VLE y*): 0.2 mol/DIV', 16, 24);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('CH2 (x_tray): 0.2 mol/DIV', 195, 24);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('AIChE McCABE-THIELE', w - 165, 24);
      } else if (simulator.type === 'heat_exchanger') {
        ctx.font = '11px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#ef4444';
        ctx.fillText('CH1 (T_hot): 25°C/DIV', 16, 24);
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('CH2 (T_cold): 25°C/DIV', 180, 24);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('TEMA CLASS R / API 660', w - 180, 24);
      } else if (simulator.type === 'gas_absorption') {
        ctx.font = '11px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('CH1 (Y_gas): 0.01 mol/DIV', 16, 24);
        ctx.fillStyle = '#10b981';
        ctx.fillText('CH2 (X_liq): 0.01 mol/DIV', 195, 24);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('TWO-FILM / SHERWOOD', w - 170, 24);
      } else {
        ctx.font = '11px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('CH1: 1.0V/DIV', 16, 24);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('CH2: 500mA/DIV', 130, 24);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`TIME: ${(10 / timebaseScale).toFixed(1)}ms/DIV`, w - 140, 24);
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isRunning, params, scopeChannelA, scopeChannelB, timebaseScale, simulator]);

  // Export CSV function
  const handleExportCSV = () => {
    let rows = "time_sec,channel_a_volts,channel_b_metric\n";
    const sampleCount = 500;
    const dt = 0.0002;
    for (let i = 0; i < sampleCount; i++) {
      const t = i * dt;
      const vA = Math.sin(2 * Math.PI * 100 * t);
      const vB = Math.sin(2 * Math.PI * 100 * t - 0.7);
      rows += `${t.toFixed(6)},${vA.toFixed(4)},${vB.toFixed(4)}\n`;
    }
    const blob = new Blob([rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${simulator.id}_telemetry.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="w-full max-w-5xl my-auto rounded-2xl border border-slate-700/90 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800/60 text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-bold text-white">
                  {simulator.title}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                  {simulator.difficulty}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                {simulator.disciplineName} • {simulator.physicalLaw}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white transition-colors text-xs font-mono flex items-center gap-1"
              title="Copy link to this simulator configuration"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close workbench"
              id="close-workbench-modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Main Oscilloscope & Signal Analyzer Canvas */}
          <div className="rounded-xl border border-slate-800 bg-[#030712] overflow-hidden shadow-inner">
            <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  {simulator.type === 'three_phase' ? '3-Phase AC Grid Phasor Scope' : 'Dual-Trace Digital Oscilloscope'}
                </span>
                <span className="text-slate-600">|</span>
                {simulator.type === 'three_phase' ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-950/80 border border-red-700/80 text-red-300">
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Phase R
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-yellow-950/80 border border-yellow-700/80 text-yellow-300">
                      <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Phase Y
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-950/80 border border-blue-700/80 text-blue-300">
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Phase B
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-slate-800 border border-slate-700 text-slate-300">
                      <span className="w-2 h-0.5 bg-slate-400 inline-block" /> Neutral N
                    </span>
                  </div>
                ) : (
                  <>
                    <label className="flex items-center gap-1.5 cursor-pointer text-cyan-400">
                      <input
                        type="checkbox"
                        checked={scopeChannelA}
                        onChange={(e) => setScopeChannelA(e.target.checked)}
                        className="rounded bg-slate-800 border-slate-700 text-cyan-500"
                      />
                      <span>CH1 (Input)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-amber-400">
                      <input
                        type="checkbox"
                        checked={scopeChannelB}
                        onChange={(e) => setScopeChannelB(e.target.checked)}
                        className="rounded bg-slate-800 border-slate-700 text-amber-500"
                      />
                      <span>CH2 (Response)</span>
                    </label>
                  </>
                )}
              </div>

              {/* Timebase speed */}
              <div className="flex items-center gap-2 text-slate-400">
                <span>Timebase:</span>
                <select
                  value={timebaseScale}
                  onChange={(e) => setTimebaseScale(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-slate-200 text-[11px]"
                >
                  <option value={0.5}>0.5x Slow</option>
                  <option value={1}>1.0x Realtime</option>
                  <option value={2}>2.0x Fast</option>
                </select>
              </div>
            </div>

            <div className="relative aspect-[860/260] w-full">
              <canvas
                ref={canvasRef}
                width={860}
                height={260}
                style={{ aspectRatio: '860 / 260' }}
                className="interactive-canvas w-full h-[220px] sm:h-[260px] block cursor-crosshair bg-[#030712] aspect-[860/260]"
              />

              {/* Canvas Inset Control Bar */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-slate-950/90 border border-slate-800 px-2.5 py-1.5 rounded-lg backdrop-blur-sm">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-white transition-colors"
                >
                  {isRunning ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{isRunning ? 'Hold' : 'Run'}</span>
                </button>
                <button
                  onClick={() => { timeRef.current = 0; }}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Reset time baseline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-950 border border-cyan-800/60 hover:bg-cyan-900 text-cyan-300 text-xs font-mono transition-colors"
                  title="Export raw simulated time-series data to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mathematical Governing Equation Callout with live values */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 uppercase tracking-wider">
                Governing Differential Equation
              </span>
              <span className="text-cyan-400 font-semibold">
                Nodal State Model
              </span>
            </div>
            <div className="p-3 rounded bg-slate-900 font-mono text-cyan-300 text-sm overflow-x-auto custom-scrollbar">
              <MathView math={simulator.governingEquation} block />
            </div>
            <p className="text-xs text-slate-400">
              {simulator.equationDescription}
            </p>
          </div>

          {/* Preset Buttons */}
          {simulator.presetNames && simulator.presetNames.length > 0 && (
            <div className="space-y-2 font-mono text-xs">
              <div className="text-slate-400 uppercase tracking-wider text-[11px]">
                Pre-Engineered Benchmark Presets:
              </div>
              <div className="flex flex-wrap gap-2">
                {simulator.presetNames.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => handleApplyPreset(preset.values)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 border border-slate-700 transition-all text-xs"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Parameter Tuning Grid */}
          <div className="space-y-3 font-mono">
            <div className="text-xs text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Variable Circuit & System Parameters
              </span>
              <span className="text-slate-500 text-[11px]">Continuous Sweeper</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {simulator.parameters.map((param) => {
                const val = params[param.id] ?? param.default;
                return (
                  <div
                    key={param.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium">
                        {param.name} ({param.symbol}):
                      </span>
                      <span className="text-cyan-300 font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {val} {param.unit}
                      </span>
                    </div>

                    <input
                      type="range"
                      id={`modal-slider-${param.id}`}
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      value={val}
                      onChange={(e) => handleParamChange(param.id, Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                      aria-label={`${param.name} (${param.symbol}) in ${param.unit}`}
                      aria-valuenow={val}
                      aria-valuemin={param.min}
                      aria-valuemax={param.max}
                      aria-valuetext={`${val} ${param.unit}`}
                    />

                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>{param.min} {param.unit}</span>
                      <span className="text-slate-400 truncate max-w-[150px]">{param.description}</span>
                      <span>{param.max} {param.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Educational Notes & Laboratory Relevance (Native <details> & <summary>) */}
          <details open className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs text-slate-300 group">
            <summary className="flex items-center justify-between font-mono text-cyan-400 font-semibold cursor-pointer select-none">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span>Theory &amp; Laboratory Engineering Application</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform group-open:rotate-180" />
            </summary>
            <p className="leading-relaxed pt-2">
              {simulator.description}
            </p>
          </details>

          {/* Referenced Engineering Standards & Technical Formulas (Native <details> & <summary>) */}
          <details open className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-3 text-xs group">
            <summary className="flex items-center justify-between font-mono text-emerald-400 font-semibold cursor-pointer select-none">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Referenced Engineering Standards &amp; Technical Formulas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 border border-emerald-700/60 text-emerald-300 font-bold uppercase tracking-wider">
                  Reference Model
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform group-open:rotate-180" />
              </div>
            </summary>

            <div className="pt-2 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 text-[10px] block uppercase">Referenced Standard (Academic):</span>
                  <span className="text-emerald-300 font-semibold">
                    {simulator.standardReference || `${simulator.disciplineName} Reference Literature`}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 text-[10px] block uppercase">Publishing Body (Reference Only):</span>
                  <span className="text-cyan-300 font-semibold">
                    {simulator.standardBody || 'ISO / IEC / IEEE / ANSI'}
                  </span>
                </div>
              </div>

              {simulator.colorStandardRule && (
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1 font-mono text-[11px]">
                  <span className="text-slate-400 text-[10px] block uppercase">Color &amp; Diagram Legend Conventions:</span>
                  <span className="text-slate-200">
                    {simulator.colorStandardRule}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  Formulas and nomenclature reference published technical literature for educational study. Standards are cited for identification only; no official affiliation or endorsement is implied.
                </span>
              </div>
            </div>
          </details>

        </div>

        {/* Modal Bottom Bar */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Integrator: Web Worker RK4 60FPS</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV Telemetry</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
