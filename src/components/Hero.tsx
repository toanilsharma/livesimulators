import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Cpu,
  Building2,
  Sliders,
  ArrowRight,
  Play,
  Pause,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Activity,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Sparkles,
  Gauge,
  Radio,
  Share2,
  Info,
  ChevronRight,
  RefreshCw,
  Flame,
  ShieldCheck,
  FlaskConical,
  Atom
} from 'lucide-react';
import { DisciplineId, SimulatorItem } from '../types';
import {
  FEATURED_ELECTRICAL_SIMULATORS,
  FEATURED_MECHANICAL_SIMULATORS,
  FEATURED_CIVIL_SIMULATORS,
  FEATURED_INSTRUMENTATION_SIMULATORS,
  FEATURED_CHEMICAL_SIMULATORS,
  FEATURED_SEMICONDUCTOR_SIMULATORS,
} from '../data/simulators';

interface HeroProps {
  onSelectDepartment: (deptId: DisciplineId) => void;
  onLaunchSimulator?: (simulator: SimulatorItem) => void;
}

type DeptSimulationMode = 'electrical' | 'mechanical' | 'civil' | 'control' | 'chemical' | 'physics';
type ScenarioMode = 'normal' | 'surge' | 'fault';

export const Hero: React.FC<HeroProps> = ({
  onSelectDepartment,
  onLaunchSimulator,
}) => {
  const [activeDept, setActiveDept] = useState<DeptSimulationMode>('electrical');
  const [scenario, setScenario] = useState<ScenarioMode>('normal');
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1.0);
  const [autoTour, setAutoTour] = useState<boolean>(false);
  const [tourCountdown, setTourCountdown] = useState<number>(10);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [shockwaveTrigger, setShockwaveTrigger] = useState<{ x: number; y: number; time: number } | null>(null);

  // Department-specific physical parameter controls
  const [elecFreq, setElecFreq] = useState<number>(60);
  const [mechRpm, setMechRpm] = useState<number>(45);
  const [civilLoad, setCivilLoad] = useState<number>(60);
  const [pidSetpoint, setPidSetpoint] = useState<number>(70);
  const [chemTemp, setChemTemp] = useState<number>(345);
  const [semiBias, setSemiBias] = useState<number>(0.65);

  // Canvas interaction & inspection reticle state
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // High-fidelity animation & multi-physics state
  const stateRef = useRef({
    time: 0,
    rotorAngle: 0,
    earthquakePhase: 0,
    shockwaves: [] as { x: number; y: number; radius: number; maxRadius: number; color: string; alpha: number }[],
    couplerTrail: [] as { x: number; y: number; alpha: number }[],
    arcFlashes: [] as { x1: number; y1: number; x2: number; y2: number; life: number }[],
    // Electrical state (IEC 60446 / IEEE 141 / IS 3043)
    elecAngle: 0,
    faultSag: 1.0,
    // Mechanical state (Willis Planetary Epicyclic + 4-Bar Grashof)
    crankAngle: 0,
    sunAngle: 0,
    carrierAngle: 0,
    planetAngle: 0,
    // Civil state (AASHTO Moving Truck + ASCE 7-22 Seismic Base Isolation)
    truckDist: 0,
    isolatorDisp: 0,
    // Instrumentation & Control state (Discrete numerical PID + Torricelli mass balance)
    pidPV: 50,
    pidIntegral: 30,
    pidPrevError: 0,
    pidCO: 50,
    pidHistory: [] as { sp: number; pv: number; co: number; t: number }[],
    // Chemical CSTR state (Arrhenius reaction kinetics & Van Heerden thermal balance)
    cstrCa: 0.15,
    cstrBubbles: Array.from({ length: 36 }, () => ({
      x: 0.15 + Math.random() * 0.7,
      y: 0.2 + Math.random() * 0.6,
      r: 1.5 + Math.random() * 3,
      speed: 0.5 + Math.random() * 0.8,
      angle: Math.random() * Math.PI * 2,
    })),
    cstrHistory: [] as { t: number; temp: number; conversion: number }[],
    // Semiconductor state (Carrier wavepackets & Poisson depletion layer)
    semiElectrons: Array.from({ length: 24 }, () => ({
      x: 0.55 + Math.random() * 0.4,
      y: 0.22 + Math.random() * 0.55,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
    })),
    semiHoles: Array.from({ length: 24 }, () => ({
      x: 0.05 + Math.random() * 0.4,
      y: 0.22 + Math.random() * 0.55,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
    })),
    particles: Array.from({ length: 45 }, (_, i) => ({
      x: 0,
      y: 0,
      tOffset: (i * 0.022) % 1,
      speed: 0.6 + Math.random() * 0.4,
      size: 1.5 + Math.random() * 2,
    })),
  });

  // Sound FX synthesizer
  const playSynthesizedTone = (freq: number, type: OscillatorType = 'sine', duration = 0.15, gainVal = 0.05) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context may be restricted before user gesture
    }
  };

  // Auto-tour across departments
  useEffect(() => {
    if (!autoTour) return;
    const depts: DeptSimulationMode[] = ['electrical', 'mechanical', 'chemical', 'physics', 'control', 'civil'];
    const timer = setInterval(() => {
      setTourCountdown((prev) => {
        if (prev <= 1) {
          setActiveDept((cur) => {
            const nextIdx = (depts.indexOf(cur) + 1) % depts.length;
            return depts[nextIdx];
          });
          playSynthesizedTone(520, 'sine', 0.1, 0.03);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [autoTour, soundEnabled]);

  // Scenario event handler
  const triggerScenario = (mode: ScenarioMode) => {
    setScenario(mode);
    if (mode === 'fault') {
      playSynthesizedTone(120, 'sawtooth', 0.45, 0.1);
      // Spawn intense electric arcs or structural shockwave
      const canvas = canvasRef.current;
      if (canvas) {
        stateRef.current.shockwaves.push({
          x: canvas.width / 2,
          y: canvas.height / 2,
          radius: 10,
          maxRadius: Math.max(canvas.width, canvas.height) * 0.7,
          color:
            activeDept === 'electrical'
              ? '#38bdf8'
              : activeDept === 'chemical'
              ? '#c084fc'
              : activeDept === 'physics'
              ? '#38bdf8'
              : activeDept === 'civil'
              ? '#ef4444'
              : '#f59e0b',
          alpha: 0.9,
        });
      }
      setTimeout(() => setScenario('normal'), 4000);
    } else if (mode === 'surge') {
      playSynthesizedTone(440, 'triangle', 0.25, 0.08);
      setTimeout(() => setScenario('normal'), 5000);
    } else {
      playSynthesizedTone(660, 'sine', 0.1, 0.04);
    }
  };

  // Canvas click interaction creates shockwave ripple
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    stateRef.current.shockwaves.push({
      x,
      y,
      radius: 5,
      maxRadius: 180,
      color: activeDept === 'chemical' ? '#a855f7' : activeDept === 'physics' ? '#38bdf8' : '#06b6d4',
      alpha: 0.85,
    });
    setShockwaveTrigger({ x, y, time: Date.now() });
    playSynthesizedTone(380, 'sine', 0.12, 0.04);
  };

  // Canvas mouse move for telemetry inspection
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setHoverPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Get active representative simulator to launch
  const getActiveSimulator = (): SimulatorItem => {
    switch (activeDept) {
      case 'electrical':
        return FEATURED_ELECTRICAL_SIMULATORS[0];
      case 'mechanical':
        return FEATURED_MECHANICAL_SIMULATORS[0];
      case 'civil':
        return FEATURED_CIVIL_SIMULATORS[0];
      case 'control':
        return FEATURED_INSTRUMENTATION_SIMULATORS[0];
      case 'chemical':
        return FEATURED_CHEMICAL_SIMULATORS[0];
      case 'physics':
        return FEATURED_SEMICONDUCTOR_SIMULATORS[0];
    }
  };

  // ---------------------------------------------------------------------------
  // 60 FPS ULTRA-CRISP MULTI-PHYSICS LIVING VECTOR ENGINE
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05) * simSpeed;
      lastTime = now;

      const state = stateRef.current;
      if (isRunning) {
        state.time += dt;

        // 1. Electrical physics (IEC 60446 / IEEE 141 / IS 3043)
        const omega_e = 2 * Math.PI * elecFreq;
        state.elecAngle += dt * omega_e;
        if (scenario === 'fault') {
          state.faultSag = Math.max(0.12, state.faultSag - dt * 4.5);
          if (Math.random() < 0.35) {
            state.arcFlashes.push({
              x1: 70 + Math.random() * 20,
              y1: 60 + Math.random() * 120,
              x2: 120 + Math.random() * 50,
              y2: 70 + Math.random() * 140,
              life: 0.15,
            });
          }
        } else {
          state.faultSag = Math.min(1.0, state.faultSag + dt * 2.5);
        }

        // 2. Mechanical physics (AGMA 2001 / ISO 6336 & Freudenstein 4-Bar Kinematics)
        const omega_mech = (mechRpm * 2 * Math.PI) / 60;
        state.rotorAngle += dt * omega_mech;
        state.crankAngle += dt * omega_mech;
        state.sunAngle += dt * omega_mech * 2.5;
        // Willis formula: fixed ring Zr=52, Zs=20 => i = 1 + 52/20 = 3.60
        state.carrierAngle = state.sunAngle / 3.6;
        state.planetAngle = -state.carrierAngle * (52 / 16);

        // 3. Civil physics (AASHTO Moving Truck & ASCE 7-22 Seismic Base Isolation)
        state.truckDist += dt * 42; // truck position across span
        const omega_q = scenario === 'fault' ? 18 : 6;
        state.earthquakePhase += dt * omega_q;
        const qAmp = scenario === 'fault' ? 24 : scenario === 'surge' ? 12 : 3;
        const gDisp = Math.sin(state.earthquakePhase) * qAmp;
        state.isolatorDisp = gDisp * 0.72; // LRB bearing absorbs ~72% of ground displacement

        // 4. Instrumentation & Control (Discrete PID Numerical Integration with Anti-Windup)
        const sp = pidSetpoint;
        const error = sp - state.pidPV;
        const Kp = 1.6;
        const Ti = 3.2; // reset time in seconds
        const Td = 0.45; // derivative time in seconds
        const P = Kp * error;
        // Anti-windup integral clamping [0, 100]
        state.pidIntegral = Math.max(0, Math.min(100, state.pidIntegral + (Kp * dt / Ti) * error));
        // Filtered derivative to prevent derivative kick
        const D = -Kp * (Td / (dt + 0.12 * Td)) * (state.pidPV - state.pidPrevError);
        state.pidPrevError = state.pidPV;
        const rawCO = P + state.pidIntegral + D;
        state.pidCO = Math.max(0, Math.min(100, rawCO));

        // Process vessel dynamic mass balance (dh/dt = (Qin - Qout - disturbance) / Area)
        const Qin = (state.pidCO / 100) * 24;
        const Qout = Math.sqrt(Math.max(0, state.pidPV / 100)) * 18; // Torricelli outflow
        const dist = scenario === 'surge' ? 12 : scenario === 'fault' ? -18 : 0;
        const dhdt = (Qin - Qout - dist) * 0.45;
        state.pidPV = Math.max(4, Math.min(96, state.pidPV + dhdt * dt));

        // Append to rolling PID scope history
        const hist = state.pidHistory;
        if (hist.length === 0 || state.time - hist[hist.length - 1].t >= 0.08) {
          hist.push({ sp, pv: state.pidPV, co: state.pidCO, t: state.time });
          if (hist.length > 90) hist.shift();
        }
      }

      const t = state.time;
      const w = canvas.width;
      const h = canvas.height;

      // 1. Deep Space Tech Blueprint Backdrop
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, w, h);

      // Subtle Radial Vignette
      const grad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, w * 0.7);
      grad.addColorStop(0, 'rgba(8, 20, 38, 0.6)');
      grad.addColorStop(1, 'rgba(2, 4, 10, 0.98)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Precision CAD Coordinate Grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      const step = 32;
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Shockwave rings
      for (let i = state.shockwaves.length - 1; i >= 0; i--) {
        const sw = state.shockwaves[i];
        sw.radius += dt * 320;
        sw.alpha -= dt * 1.5;
        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          state.shockwaves.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = Math.max(0, sw.alpha);
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
      }

      // =======================================================================
      // MODE 1: ELECTRICAL SYSTEMS (4-Pole AC Stage, R-Y-B-N Standard, Phasors & Scope)
      // IEC 60446 / IEEE 141 / IS 3043 Standard Compliant
      // =======================================================================
      if (activeDept === 'electrical') {
        const isFault = scenario === 'fault';
        const isSurge = scenario === 'surge';

        // 3-Phase 4-Wire Standard Busbars (R, Y, B, N)
        // Color Code: R = Red (#ef4444), Y = Yellow (#eab308), B = Blue (#2563eb), N = Neutral (#64748b)
        const busX = 54;
        const busY1 = 32;
        const busY2 = h * 0.56;
        const busbars = [
          { code: 'R', name: 'Phase R (0°)', offset: -24, color: '#ef4444', isPhase: true, phaseLag: 0 },
          { code: 'Y', name: 'Phase Y (-120°)', offset: -8, color: '#eab308', isPhase: true, phaseLag: (2 * Math.PI) / 3 },
          { code: 'B', name: 'Phase B (-240°)', offset: 8, color: '#2563eb', isPhase: true, phaseLag: (4 * Math.PI) / 3 },
          { code: 'N', name: 'Neutral N', offset: 24, color: '#64748b', isPhase: false, phaseLag: 0 },
        ];

        // Fault physics: Phase R voltage sags drastically, healthy phases stay nominal
        const vrNominal = 277;
        const vrActual = isFault ? Math.round(vrNominal * state.faultSag) : vrNominal;
        const vyActual = 277;
        const vbActual = 277;
        const faultCurrent = isFault ? Math.round(42 + (1 - state.faultSag) * 608) : 42;

        busbars.forEach((bb, idx) => {
          const x = busX + bb.offset;
          ctx.strokeStyle = isFault && bb.code === 'R' ? '#ff2222' : bb.color;
          ctx.lineWidth = bb.isPhase ? 2.5 : 2;
          if (!bb.isPhase) {
            ctx.setLineDash([4, 2]);
          } else {
            ctx.setLineDash([]);
          }
          ctx.beginPath();
          ctx.moveTo(x, busY1);
          ctx.lineTo(x, busY2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Flowing energy electron packets (proportional to electrical frequency)
          ctx.fillStyle = '#ffffff';
          const packetCount = bb.isPhase ? 5 : isFault ? 4 : 2;
          for (let k = 0; k < packetCount; k++) {
            const frac = ((t * (elecFreq / 60) * 1.8 + k / packetCount + (bb.isPhase ? idx * 0.33 : 0)) % 1);
            const py = busY1 + frac * (busY2 - busY1);
            ctx.beginPath();
            ctx.arc(x, py, bb.isPhase ? 2.5 : 1.8, 0, 2 * Math.PI);
            ctx.fill();
          }

          // Busbar Standard R-Y-B-N Badges at Top
          ctx.fillStyle = bb.color;
          ctx.fillRect(x - 7, busY1 - 14, 14, 10);
          ctx.font = 'bold 8px "IBM Plex Mono", monospace';
          ctx.fillStyle = bb.code === 'Y' ? '#000000' : '#ffffff';
          ctx.fillText(bb.code, x - 3, busY1 - 6);
        });

        // Arc Flashes during fault
        if (isFault) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          state.arcFlashes.forEach((arc) => {
            ctx.beginPath();
            ctx.moveTo(arc.x1, arc.y1);
            ctx.lineTo((arc.x1 + arc.x2) / 2 + (Math.random() - 0.5) * 20, (arc.y1 + arc.y2) / 2 + (Math.random() - 0.5) * 20);
            ctx.lineTo(arc.x2, arc.y2);
            ctx.stroke();
          });
        }

        // =====================================================================
        // Central 4-Pole AC Stator Stage & Rotating Magnetic Field (R-Y-B-N)
        // Synchronous Speed: Ns = 120 * f / P = 30 * f RPM (deterministic physics)
        // =====================================================================
        const machX = w * 0.42;
        const machY = h * 0.30;
        const statorR = 52;
        const rotorR = 34;

        // Terminal Block atop Stator with standard R, Y, B, N terminals
        const tbY = machY - statorR - 15;
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.fillRect(machX - 28, tbY, 56, 11);
        ctx.strokeRect(machX - 28, tbY, 56, 11);

        const terminals = [
          { code: 'R', color: '#ef4444', x: machX - 20 },
          { code: 'Y', color: '#eab308', x: machX - 7 },
          { code: 'B', color: '#2563eb', x: machX + 6 },
          { code: 'N', color: '#64748b', x: machX + 19 },
        ];
        terminals.forEach((term) => {
          ctx.fillStyle = term.color;
          ctx.beginPath();
          ctx.arc(term.x, tbY + 5.5, 3, 0, 2 * Math.PI);
          ctx.fill();
        });

        // Outer Stator Iron Laminated Core
        ctx.fillStyle = '#0b1120';
        ctx.strokeStyle = isFault ? '#ef4444' : '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(machX, machY, statorR + 7, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // 4 Symmetrical Magnetic Pole Indicators on Stator Yoke (P1, P2, P3, P4)
        for (let p = 0; p < 4; p++) {
          const poleAngle = (p * Math.PI) / 2;
          const px = machX + Math.cos(poleAngle) * (statorR + 10);
          const py = machY + Math.sin(poleAngle) * (statorR + 10);
          ctx.fillStyle = p % 2 === 0 ? '#ef4444' : '#2563eb';
          ctx.font = 'bold 7px "IBM Plex Mono", monospace';
          ctx.fillText(p % 2 === 0 ? 'N' : 'S', px - 2.5, py + 2.5);
        }

        // 12 Stator Copper Windings (4 Poles × 3 Phases = 12 Coils) in Standard R, Y, B Colors
        // Coils 0, 3, 6, 9: Phase R (Red)
        // Coils 1, 4, 7, 10: Phase Y (Yellow)
        // Coils 2, 5, 8, 11: Phase B (Blue)
        const eAngle = state.elecAngle;
        const ir = Math.cos(eAngle) * (isFault ? state.faultSag : 1.0);
        const iy = Math.cos(eAngle - (2 * Math.PI) / 3);
        const ib = Math.cos(eAngle - (4 * Math.PI) / 3);

        const phaseWindingDefs = [
          { phase: 'R', color: '#ef4444', current: ir },
          { phase: 'Y', color: '#eab308', current: iy },
          { phase: 'B', color: '#2563eb', current: ib },
        ];

        for (let i = 0; i < 12; i++) {
          const coilAngle = (i * 2 * Math.PI) / 12 - Math.PI / 2;
          const cx = machX + Math.cos(coilAngle) * statorR;
          const cy = machY + Math.sin(coilAngle) * statorR;
          const pDef = phaseWindingDefs[i % 3];

          // Current-dependent dynamic copper glow
          const currentIntensity = Math.abs(pDef.current);
          ctx.fillStyle = pDef.color;
          ctx.beginPath();
          ctx.arc(cx, cy, 4.5 + currentIntensity * 1.5, 0, 2 * Math.PI);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Lead lines to center neutral star node (N)
          ctx.strokeStyle = 'rgba(100, 116, 139, 0.25)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(machX, machY);
          ctx.stroke();
        }

        // Central Neutral (N) Star Point Node inside stator
        ctx.fillStyle = '#64748b';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(machX, machY, 6.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px "IBM Plex Mono", monospace';
        ctx.fillText('N', machX - 2.5, machY + 2.8);

        // Rotating Induction Rotor with Squirrel Cage Bars
        // For a 4-pole machine (P=4), mechanical synchronous speed = omega_e / 2 = pi * f rad/s
        // Ns = 120 * f / P = 30 * f RPM
        const syncRPM = 30 * elecFreq;
        const slip = isFault ? 0.22 : isSurge ? 0.08 : 0.035;
        const rotorRPM = Math.round(syncRPM * (1 - slip));
        const rotorAngle = (eAngle / 2) * (1 - slip);

        ctx.save();
        ctx.translate(machX, machY);
        ctx.rotate(rotorAngle);

        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, rotorR, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Rotor Squirrel Cage Conductive Bars
        for (let i = 0; i < 12; i++) {
          const a = (i * 2 * Math.PI) / 12;
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(Math.cos(a) * (rotorR - 5), Math.sin(a) * (rotorR - 5), 2.2, 0, 2 * Math.PI);
          ctx.fill();
        }
        ctx.restore();

        // 4-Pole Rotating Magnetic Flux Field Vector (revolving at omega_e / 2)
        const fluxMechAngle = eAngle / 2;
        ctx.save();
        ctx.translate(machX, machY);
        ctx.rotate(fluxMechAngle);

        for (let p = 0; p < 4; p++) {
          const pAngle = (p * Math.PI) / 2;
          const isNorth = p % 2 === 0;
          ctx.strokeStyle = isFault ? 'rgba(239, 68, 68, 0.8)' : isNorth ? 'rgba(239, 68, 68, 0.75)' : 'rgba(37, 99, 235, 0.75)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(pAngle) * (statorR - 5), Math.sin(pAngle) * (statorR - 5));
          ctx.stroke();

          ctx.fillStyle = isFault ? '#ef4444' : isNorth ? '#ef4444' : '#2563eb';
          ctx.beginPath();
          ctx.arc(Math.cos(pAngle) * (statorR - 5), Math.sin(pAngle) * (statorR - 5), 3, 0, 2 * Math.PI);
          ctx.fill();
        }
        ctx.restore();

        // Stator Stage Labels with live deterministic RPM
        ctx.font = '9px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('4-POLE AC STAGE (R-Y-B-N)', machX - 56, machY + statorR + 18);
        ctx.fillStyle = '#64748b';
        ctx.font = '8px "IBM Plex Mono", monospace';
        ctx.fillText(`P=4 • Ns=${syncRPM} RPM • Nr=${rotorRPM} RPM`, machX - 58, machY + statorR + 28);

        // =====================================================================
        // 3-Phase Rotating Phasor Wheel with Neutral Reference (Right of Machine)
        // Standard R, Y, B Phasor Vectors at 120° Spacing with Neutral Star Point (N)
        // =====================================================================
        const pwX = w * 0.78;
        const pwY = machY;
        const pwR = 36;

        ctx.fillStyle = '#090e17';
        ctx.strokeStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(pwX, pwY, pwR, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Phasor outer dial marks
        for (let deg = 0; deg < 360; deg += 30) {
          const rad = (deg * Math.PI) / 180;
          ctx.strokeStyle = 'rgba(51, 65, 85, 0.5)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pwX + Math.cos(rad) * (pwR - 3), pwY + Math.sin(rad) * (pwR - 3));
          ctx.lineTo(pwX + Math.cos(rad) * pwR, pwY + Math.sin(rad) * pwR);
          ctx.stroke();
        }

        // Center Neutral (N) 0V Star Hub
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(pwX, pwY, 3, 0, 2 * Math.PI);
        ctx.fill();

        // 3 Phase Vectors: R (0°), Y (-120°), B (-240°)
        const phasors = [
          { code: 'R', color: '#ef4444', angle: eAngle, mag: isFault ? state.faultSag : 1.0 },
          { code: 'Y', color: '#eab308', angle: eAngle - (2 * Math.PI) / 3, mag: 1.0 },
          { code: 'B', color: '#2563eb', angle: eAngle - (4 * Math.PI) / 3, mag: 1.0 },
        ];

        phasors.forEach((ph) => {
          ctx.strokeStyle = ph.color;
          ctx.lineWidth = 2;
          const vectorR = (pwR - 5) * ph.mag;
          const tipX = pwX + Math.cos(ph.angle) * vectorR;
          const tipY = pwY - Math.sin(ph.angle) * vectorR;
          ctx.beginPath();
          ctx.moveTo(pwX, pwY);
          ctx.lineTo(tipX, tipY);
          ctx.stroke();

          // Arrow tip
          ctx.fillStyle = ph.color;
          ctx.beginPath();
          ctx.arc(tipX, tipY, 2.5, 0, 2 * Math.PI);
          ctx.fill();
        });

        ctx.font = '9px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText('PHASOR (R-Y-B)', pwX - 32, pwY + pwR + 18);
        ctx.fillStyle = isFault ? '#ef4444' : '#64748b';
        ctx.font = '8px "IBM Plex Mono", monospace';
        ctx.fillText(isFault ? 'ASYMMETRICAL FAULT' : '120° BALANCED', pwX - 38, pwY + pwR + 28);

        // =====================================================================
        // Bottom Digital Phosphor Oscilloscope & Harmonic Spectrum
        // Shows R, Y, B & N Standard Color Traces (wave cycles scale with frequency f)
        // =====================================================================
        const scX = 20;
        const scY = h * 0.64;
        const scW = w - 40;
        const scH = h * 0.31;

        ctx.fillStyle = '#060a12';
        ctx.strokeStyle = '#1e293b';
        ctx.fillRect(scX, scY, scW, scH);
        ctx.strokeRect(scX, scY, scW, scH);

        // Graticule grid
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(scX, scY + scH / 2);
        ctx.lineTo(scX + scW, scY + scH / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Neutral (N) Baseline Trace at 0V
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.7)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(scX, scY + scH / 2);
        ctx.lineTo(scX + scW - 110, scY + scH / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // 3-Phase Voltage Waveforms (R, Y, B) - exact physical wave propagation
        const scopePhases = [
          { code: 'R', color: '#ef4444', lag: 0, amp: isFault ? state.faultSag : 1.0 },
          { code: 'Y', color: '#eab308', lag: (2 * Math.PI) / 3, amp: 1.0 },
          { code: 'B', color: '#2563eb', lag: (4 * Math.PI) / 3, amp: 1.0 },
        ];

        scopePhases.forEach((spItem) => {
          ctx.strokeStyle = isFault && spItem.code === 'R' ? '#ff2222' : spItem.color;
          ctx.lineWidth = spItem.code === 'R' ? 2.2 : 1.6;
          ctx.beginPath();
          const traceW = scW - 110;
          for (let x = 0; x < traceW; x++) {
            // Wave mechanics: phase angle depends on electrical frequency
            const waveCycles = 3.5 * (elecFreq / 60);
            const rad = (x / traceW) * waveCycles * 2 * Math.PI - eAngle - spItem.lag;
            const noise = isFault && spItem.code === 'R' ? (Math.sin(rad * 7) * 8 + (Math.random() - 0.5) * 4) : 0;
            const y = scY + scH / 2 - (Math.sin(rad) * (scH * 0.35) * spItem.amp) - noise;
            if (x === 0) ctx.moveTo(scX + x, y);
            else ctx.lineTo(scX + x, y);
          }
          ctx.stroke();
        });

        // Live FFT Harmonic Bar Spectrum on right of scope (IEEE 519 Standard)
        const fftX = scX + scW - 95;
        const fftW = 85;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(fftX, scY + 6, fftW, scH - 12);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '8px "IBM Plex Mono", monospace';
        ctx.fillText('FFT SPECTRUM', fftX + 6, scY + 16);

        const harmonics = [
          { name: 'f1', val: isFault ? 0.42 : 0.92, color: '#eab308' },
          { name: '3rd', val: isFault ? 0.68 : 0.03, color: '#ef4444' },
          { name: '5th', val: isFault ? 0.46 : 0.02, color: '#2563eb' },
          { name: '7th', val: isFault ? 0.28 : 0.01, color: '#64748b' },
        ];

        harmonics.forEach((hm, idx) => {
          const barH = hm.val * (scH - 36);
          const bx = fftX + 8 + idx * 18;
          const by = scY + scH - 12 - barH;
          ctx.fillStyle = hm.color;
          ctx.fillRect(bx, by, 12, barH);
          ctx.fillText(hm.name, bx, scY + scH - 3);
        });

        // Standard R-Y-B-N Telemetry Header on Scope
        ctx.font = 'bold 8px "IBM Plex Mono", monospace';
        ctx.fillStyle = isFault ? '#ef4444' : '#ef4444';
        ctx.fillText(`R: ${vrActual}V`, scX + 8, scY + 13);
        ctx.fillStyle = '#eab308';
        ctx.fillText(`Y: ${vyActual}V`, scX + 58, scY + 13);
        ctx.fillStyle = '#2563eb';
        ctx.fillText(`B: ${vbActual}V`, scX + 108, scY + 13);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('N: 0V', scX + 158, scY + 13);

        ctx.font = '8px "IBM Plex Mono", monospace';
        ctx.fillStyle = isFault ? '#ef4444' : '#64748b';
        ctx.fillText(
          isFault ? `⚠ TRIP: R-N FAULT • ${faultCurrent}A` : `480V L-L • ${elecFreq}Hz • PF 0.98`,
          scX + 195,
          scY + 13
        );

      // =======================================================================
      // MODE 2: MECHANICAL SYSTEMS (Epicyclic Gear Train & 4-Bar Grashof Kinematics)
      // AGMA 2001-D04 / ISO 6336 Willis Gear Kinematics & Analytical 4-Bar Loop Closure
      // =======================================================================
      } else if (activeDept === 'mechanical') {
        const isSurge = scenario === 'surge';

        // 1. Left Half: Epicyclic Planetary Gearset (Willis Equation)
        // Fixed Ring: Zr = 52T, Sun: Zs = 20T, Planets: Zp = 16T
        // Kinematic Ratio: i = 1 + Zr / Zs = 1 + 52/20 = 3.60:1
        const pgX = w * 0.20;
        const pgY = h * 0.44;
        const sunR = 20;
        const planetR = 16;
        const ringR = sunR + 2 * planetR; // 52px matches 52 teeth exactly

        // Outer Ring Gear (Stationary casing with 52 teeth)
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(pgX, pgY, ringR, 0, 2 * Math.PI);
        ctx.stroke();

        // Ring teeth (52 teeth internal)
        for (let i = 0; i < 26; i++) {
          const a = (i * 2 * Math.PI) / 26;
          ctx.beginPath();
          ctx.moveTo(pgX + Math.cos(a) * (ringR - 5), pgY + Math.sin(a) * (ringR - 5));
          ctx.lineTo(pgX + Math.cos(a) * ringR, pgY + Math.sin(a) * ringR);
          ctx.stroke();
        }

        // Sun Gear (Rotating at speed omega_sun)
        const sunAngle = state.sunAngle;
        ctx.save();
        ctx.translate(pgX, pgY);
        ctx.rotate(sunAngle);
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(0, 0, sunR, 0, 2 * Math.PI);
        ctx.fill();
        for (let i = 0; i < 10; i++) {
          const a = (i * 2 * Math.PI) / 10;
          ctx.strokeStyle = '#080d1a';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * sunR, Math.sin(a) * sunR);
          ctx.stroke();
        }
        ctx.restore();

        // 3 Planet Gears orbiting Sun on Carrier (Willis Kinematics)
        const carrierAngle = state.carrierAngle;
        const planetRelAngle = state.planetAngle;
        for (let i = 0; i < 3; i++) {
          const pOrbitAngle = carrierAngle + (i * 2 * Math.PI) / 3;
          const px = pgX + Math.cos(pOrbitAngle) * (sunR + planetR);
          const py = pgY + Math.sin(pOrbitAngle) * (sunR + planetR);

          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(carrierAngle + planetRelAngle);
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(0, 0, planetR, 0, 2 * Math.PI);
          ctx.fill();
          // Planet spoke marks
          ctx.strokeStyle = '#080d1a';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(-planetR, 0);
          ctx.lineTo(planetR, 0);
          ctx.moveTo(0, -planetR);
          ctx.lineTo(0, planetR);
          ctx.stroke();
          ctx.restore();
        }

        ctx.font = '9px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('WILLIS EPICYCLIC GEARS', pgX - 52, pgY + ringR + 18);
        ctx.fillStyle = '#64748b';
        ctx.font = '8px "IBM Plex Mono", monospace';
        ctx.fillText('Zs=20 • Zp=16 • Zr=52 (3.60:1)', pgX - 58, pgY + ringR + 28);

        // 2. Right Half: 4-Bar Grashof Kinematic Mechanism with Analytical Loop Closure
        // Ground AD: r1=110, Crank AB: r2=36, Coupler BC: r3=96, Rocker CD: r4=74
        // Grashof Condition: r2 + r1 = 146 <= r3 + r4 = 170 (Crank-Rocker)
        const r1 = 110;
        const r2 = 36;
        const r3 = 96;
        const r4 = 74;
        const scale = 0.85;
        const ox = w * 0.44;
        const oy = h * 0.54;

        const theta2 = state.crankAngle;
        const A = { x: ox, y: oy };
        const D = { x: ox + r1 * scale, y: oy };
        const B = {
          x: A.x + r2 * scale * Math.cos(theta2),
          y: A.y - r2 * scale * Math.sin(theta2),
        };

        const distBD = Math.hypot(D.x - B.x, D.y - B.y) / scale;
        const angleBD = Math.atan2(D.y - B.y, D.x - B.x);
        const cosAngle = Math.max(-1, Math.min(1, (r4 * r4 + distBD * distBD - r3 * r3) / (2 * r4 * distBD)));
        const delta = Math.acos(cosAngle);
        const angleCD = angleBD - delta;

        const C = {
          x: D.x - r4 * scale * Math.cos(angleCD),
          y: D.y - r4 * scale * Math.sin(angleCD),
        };

        // Transmission Angle mu = arccos((r3^2 + r4^2 - dBD^2) / (2*r3*r4))
        const cosMu = Math.max(-1, Math.min(1, (r3 * r3 + r4 * r4 - distBD * distBD) / (2 * r3 * r4)));
        const muDeg = Math.round((Math.acos(cosMu) * 180) / Math.PI);

        const E = {
          x: (B.x + C.x) / 2 - (C.y - B.y) * 0.45,
          y: (B.y + C.y) / 2 + (C.x - B.x) * 0.45,
        };

        // Add Coupler Point E to persistent trail
        state.couplerTrail.unshift({ x: E.x, y: E.y, alpha: 1.0 });
        if (state.couplerTrail.length > 55) state.couplerTrail.pop();

        // Draw Coupler Curve Glowing Trail
        ctx.lineWidth = 2;
        for (let k = 0; k < state.couplerTrail.length - 1; k++) {
          const pt1 = state.couplerTrail[k];
          const pt2 = state.couplerTrail[k + 1];
          ctx.strokeStyle = `rgba(236, 72, 153, ${pt1.alpha * 0.8})`;
          ctx.beginPath();
          ctx.moveTo(pt1.x, pt1.y);
          ctx.lineTo(pt2.x, pt2.y);
          ctx.stroke();
          pt1.alpha -= 0.015;
        }

        // Ground frame link AD
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(D.x, D.y);
        ctx.stroke();

        // Crank AB (Cyan)
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.stroke();

        // Coupler BC (Amber)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(B.x, B.y);
        ctx.lineTo(C.x, C.y);
        ctx.stroke();

        // Rocker CD (Pink)
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(C.x, C.y);
        ctx.lineTo(D.x, D.y);
        ctx.stroke();

        // Coupler tracer point E
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(E.x, E.y, 6, 0, 2 * Math.PI);
        ctx.fill();

        [A, B, C, D].forEach((pt) => {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
          ctx.fill();
        });

        // Live Kinematic Transmission & Phase Space Monitor on top right
        const rw = 138;
        const rx = w - rw - 18;
        const ry = 18;
        const rh = 88;

        ctx.fillStyle = '#090e17';
        ctx.strokeStyle = '#1e293b';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeRect(rx, ry, rw, rh);

        ctx.font = '8px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('KINEMATICS & PHASE ORBIT', rx + 8, ry + 14);

        // Analytical phase orbit (θ4 vs θ2)
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let a = 0; a < 2 * Math.PI; a += 0.12) {
          const bxVal = A.x + r2 * scale * Math.cos(a);
          const byVal = A.y - r2 * scale * Math.sin(a);
          const dBD = Math.hypot(D.x - bxVal, D.y - byVal) / scale;
          const aBD = Math.atan2(D.y - byVal, D.x - bxVal);
          const cAng = Math.max(-1, Math.min(1, (r4 * r4 + dBD * dBD - r3 * r3) / (2 * r4 * dBD)));
          const th4 = aBD - Math.acos(cAng);
          const px = rx + rw / 2 + Math.cos(a) * (rw * 0.35);
          const py = ry + rh / 2 + Math.sin(th4) * (rh * 0.30);
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();

        // Current phase point
        const curOrbitX = rx + rw / 2 + Math.cos(theta2) * (rw * 0.35);
        const curOrbitY = ry + rh / 2 + Math.sin(angleCD) * (rh * 0.30);
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(curOrbitX, curOrbitY, 4, 0, 2 * Math.PI);
        ctx.fill();

        // Readout of Transmission Angle mu (AGMA Standard: 45° <= mu <= 135°)
        ctx.font = '8px "IBM Plex Mono", monospace';
        ctx.fillStyle = muDeg >= 45 && muDeg <= 135 ? '#10b981' : '#f59e0b';
        ctx.fillText(`μ = ${muDeg}° (${muDeg >= 45 && muDeg <= 135 ? 'OPTIMAL' : 'ALLOWABLE'})`, rx + 8, ry + rh - 16);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`CRANK: ${mechRpm} RPM`, rx + 8, ry + rh - 6);

      // =======================================================================
      // MODE 3: CIVIL & STRUCTURAL (Seismic Earthquake Shake Table & Truss FEA)
      // AISC 360-16 / AASHTO / ASCE 7-22 Base Isolated Frame & Bilinear BMD/SFD
      // =======================================================================
      } else if (activeDept === 'civil') {
        const isQuake = scenario === 'fault';
        const groundDisp = Math.sin(state.earthquakePhase) * (isQuake ? 22 : scenario === 'surge' ? 12 : 3);
        const isolatorDisp = state.isolatorDisp;

        // 1. Left Half: 4-Story Seismically Isolated Building Frame
        const bldgX = w * 0.22;
        const baseY = h * 0.80;
        const stories = 4;
        const storyH = 34;
        const bldgW = 85;

        // Vibrating Shake Table Ground Plate
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(bldgX - bldgW / 2 - 18 + groundDisp, baseY + 10, bldgW + 36, 14);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bldgX - bldgW / 2 - 18 + groundDisp, baseY + 10, bldgW + 36, 14);

        // Lead Rubber Bearing (LRB) Base Isolators (absorbing base shear force)
        const isoLeftX = bldgX - bldgW / 2 + 12;
        const isoRightX = bldgX + bldgW / 2 - 12;

        [isoLeftX, isoRightX].forEach((ix) => {
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(ix + isolatorDisp - 10, baseY - 3, 20, 13);
          // Rubber laminates
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(ix + isolatorDisp - 10, baseY + 3);
          ctx.lineTo(ix + isolatorDisp + 10, baseY + 3);
          ctx.stroke();
        });

        // Building Floors Swaying with Damped Structural Drift (ASCE 7-22)
        for (let s = 0; s <= stories; s++) {
          // Dynamic mode shape displacement relative to ground
          const drift = isolatorDisp * 0.35 * Math.sin((s / stories) * (Math.PI / 2));
          const fy = baseY - s * storyH;

          // Floor Slab
          ctx.fillStyle = '#334155';
          ctx.fillRect(bldgX - bldgW / 2 + drift, fy, bldgW, 5);

          // Stress color on structural columns
          const stressVal = Math.abs(drift) / 8;
          ctx.strokeStyle = stressVal > 0.8 ? '#ef4444' : stressVal > 0.4 ? '#f59e0b' : '#38bdf8';
          ctx.lineWidth = 3;

          if (s < stories) {
            const nextDrift = isolatorDisp * 0.35 * Math.sin(((s + 1) / stories) * (Math.PI / 2));
            const nextFy = baseY - (s + 1) * storyH;

            // Left column
            ctx.beginPath();
            ctx.moveTo(bldgX - bldgW / 2 + 6 + drift, fy);
            ctx.lineTo(bldgX - bldgW / 2 + 6 + nextDrift, nextFy);
            ctx.stroke();

            // Right column
            ctx.beginPath();
            ctx.moveTo(bldgX + bldgW / 2 - 6 + drift, fy);
            ctx.lineTo(bldgX + bldgW / 2 - 6 + nextDrift, nextFy);
            ctx.stroke();

            // Cross bracing
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
            ctx.beginPath();
            ctx.moveTo(bldgX - bldgW / 2 + 6 + drift, fy);
            ctx.lineTo(bldgX + bldgW / 2 - 6 + nextDrift, nextFy);
            ctx.moveTo(bldgX + bldgW / 2 - 6 + drift, fy);
            ctx.lineTo(bldgX - bldgW / 2 + 6 + nextDrift, nextFy);
            ctx.stroke();
          }
        }

        ctx.font = '9px "IBM Plex Mono", monospace';
        ctx.fillStyle = isQuake ? '#ef4444' : '#06b6d4';
        ctx.fillText('ASCE 7-22 BASE ISOLATED', bldgX - 54, baseY + 36);

        // 2. Right Half: Warren Truss Bridge with Moving AASHTO Heavy Truck Load
        const trussStartX = w * 0.48;
        const trussW = w * 0.48;
        const trussBaseY = h * 0.44;
        const trussH = 58;
        const bays = 5;
        const bayW = trussW / bays;

        // Support symbols (Pin at left, Roller at right)
        // Left Pin Support (triangle)
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.moveTo(trussStartX, trussBaseY);
        ctx.lineTo(trussStartX - 6, trussBaseY + 10);
        ctx.lineTo(trussStartX + 6, trussBaseY + 10);
        ctx.closePath();
        ctx.fill();

        // Right Roller Support (triangle with rollers)
        ctx.beginPath();
        ctx.moveTo(trussStartX + trussW, trussBaseY);
        ctx.lineTo(trussStartX + trussW - 6, trussBaseY + 10);
        ctx.lineTo(trussStartX + trussW + 6, trussBaseY + 10);
        ctx.closePath();
        ctx.fill();

        // Moving AASHTO Heavy Truck (Truck position xp across span L)
        const L = trussW;
        const xp = (state.truckDist) % L;
        const truckX = trussStartX + xp;

        // Statics: Support Reactions for Point Load P at xp
        const P = civilLoad;
        const RA = (P * (L - xp)) / L;
        const RB = (P * xp) / L;
        const Mmax = (P * xp * (L - xp)) / L;

        // Bottom Chords (Tension: Cyan)
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(trussStartX, trussBaseY);
        ctx.lineTo(trussStartX + trussW, trussBaseY);
        ctx.stroke();

        // Top Chords (Compression: Amber)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(trussStartX + bayW * 0.5, trussBaseY - trussH);
        ctx.lineTo(trussStartX + trussW - bayW * 0.5, trussBaseY - trussH);
        ctx.stroke();

        // Web Diagonals (carry shear force)
        for (let b = 0; b < bays; b++) {
          const bx = trussStartX + b * bayW;
          const diagMidX = bx + bayW * 0.5;
          const isTension = diagMidX > truckX;
          ctx.strokeStyle = isTension ? '#38bdf8' : '#fb923c';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(bx, trussBaseY);
          ctx.lineTo(bx + bayW * 0.5, trussBaseY - trussH);
          ctx.lineTo(bx + bayW, trussBaseY);
          ctx.stroke();
        }

        // AASHTO Truck Rendering
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(truckX - 18, trussBaseY - 20, 36, 14);
        ctx.beginPath();
        ctx.arc(truckX - 10, trussBaseY - 5, 4.5, 0, 2 * Math.PI);
        ctx.arc(truckX + 10, trussBaseY - 5, 4.5, 0, 2 * Math.PI);
        ctx.fillStyle = '#0f172a';
        ctx.fill();

        ctx.font = '8px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#ef4444';
        ctx.fillText(`P=${civilLoad}kN`, truckX - 18, trussBaseY - 26);

        // Dynamic Bending Moment Diagram (BMD) M(x)
        // Exact piecewise linear triangle peaking at xp:
        // For x <= xp: M(x) = RA * x
        // For x >= xp: M(x) = RB * (L - x)
        const bmdTop = h * 0.65;
        const bmdScale = 0.009 * (civilLoad / 50);

        ctx.fillStyle = 'rgba(6, 182, 212, 0.14)';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(trussStartX, bmdTop);
        // Triangle vertex under truck
        const peakY = bmdTop + Math.min(42, Mmax * bmdScale);
        ctx.lineTo(trussStartX + xp, peakY);
        ctx.lineTo(trussStartX + trussW, bmdTop);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.font = '9px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('EXACT BENDING MOMENT M(x)', trussStartX + 6, bmdTop + 13);
        ctx.font = '8px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(
          `RA: ${RA.toFixed(0)}kN • RB: ${RB.toFixed(0)}kN • Mmax: ${(Mmax / 10).toFixed(0)} kNm`,
          trussStartX + 6,
          bmdTop + 24
        );

      // =======================================================================
      // MODE 4: INSTRUMENTATION & CHEMICAL PROCESS (Process Vessel, Centrifugal Pump & PID Scope)
      // ISA-5.1 P&ID & IEC 60534 Closed-Loop Control Standards
      // =======================================================================
      } else if (activeDept === 'control') {
        const isSurge = scenario === 'surge';
        const isFault = scenario === 'fault';
        const sp = pidSetpoint;
        const pv = state.pidPV;
        const co = state.pidCO;

        // 1. Left: Industrial Liquid Reservoir
        const tankX = 28;
        const tankY = 42;
        const tankW = 95;
        const tankH = 150;

        const liquidH = (pv / 100) * tankH;
        const liquidY = tankY + tankH - liquidH;

        // Transparent acrylic tank walls
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        ctx.strokeRect(tankX, tankY, tankW, tankH);

        // Liquid fill with dynamic wave surface
        ctx.fillStyle = 'rgba(6, 182, 212, 0.35)'; // ISA standard Cyan for Process Variable
        ctx.beginPath();
        ctx.moveTo(tankX + 2, liquidY);
        for (let x = 0; x <= tankW - 4; x++) {
          const wave = Math.sin((x / 16) + t * 4) * 2.5;
          ctx.lineTo(tankX + 2 + x, liquidY + wave);
        }
        ctx.lineTo(tankX + tankW - 2, tankY + tankH - 2);
        ctx.lineTo(tankX + 2, tankY + tankH - 2);
        ctx.closePath();
        ctx.fill();

        // Rising aeration bubbles
        for (let i = 0; i < 6; i++) {
          const bx = tankX + 12 + ((i * 15 + t * 18) % (tankW - 24));
          const by = liquidY + ((i * 20 + t * 30) % Math.max(1, liquidH));
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.beginPath();
          ctx.arc(bx, by, 2 + (i % 2), 0, 2 * Math.PI);
          ctx.fill();
        }

        // Ultrasonic Radar Level Sensor [LT-101] on top emitting acoustic pulses
        const sensorX = tankX + tankW / 2;
        const sensorY = tankY - 10;
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(sensorX - 12, sensorY, 24, 10);

        // Acoustic Conical Waves traveling down
        const waveProgress = (t * 2) % 1;
        const waveY = sensorY + 10 + waveProgress * (liquidY - sensorY);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(sensorX, sensorY + 10, Math.max(1, waveY - sensorY), Math.PI * 0.35, Math.PI * 0.65);
        ctx.stroke();

        // ISA-5.1 Instrument Tag Bubble [LT-101]
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(sensorX, sensorY - 14, 9, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.font = 'bold 7px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('LT', sensorX - 4.5, sensorY - 15);
        ctx.fillText('101', sensorX - 6.5, sensorY - 7);

        // Setpoint Dashed Line (ISA Standard Emerald Green for Setpoint)
        const spY = tankY + tankH - (sp / 100) * tankH;
        ctx.strokeStyle = '#10b981';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(tankX - 12, spY);
        ctx.lineTo(tankX + tankW + 12, spY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = '8px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#10b981';
        ctx.fillText(`SP ${sp}%`, tankX + tankW + 8, spY + 3);
        ctx.fillStyle = '#06b6d4';
        ctx.fillText(`PV ${pv.toFixed(0)}%`, tankX + tankW + 8, liquidY + 3);

        // 2. Center: Centrifugal Impeller Pump with Fluid Pipeline
        const pumpX = tankX + tankW + 42;
        const pumpY = tankY + tankH - 20;
        const pumpR = 18;

        // Pipeline connection
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(tankX + tankW, pumpY);
        ctx.lineTo(pumpX, pumpY);
        ctx.stroke();

        // Pump casing
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pumpX, pumpY, pumpR, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Rotating impeller blades (speed proportional to Controller Output CO)
        const impAngle = t * (4 + (co / 100) * 16);
        ctx.save();
        ctx.translate(pumpX, pumpY);
        ctx.rotate(impAngle);
        for (let b = 0; b < 4; b++) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos((b * Math.PI) / 2) * (pumpR - 4), Math.sin((b * Math.PI) / 2) * (pumpR - 4));
          ctx.stroke();
        }
        ctx.restore();

        ctx.font = '8px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('Pump P-101', pumpX - 22, pumpY + pumpR + 14);

        // Control Valve [FCV-101] on discharge pipe
        const vX = pumpX + 28;
        const vY = pumpY;
        ctx.strokeStyle = '#f59e0b';
        ctx.fillStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        // Valve body (two triangles)
        ctx.beginPath();
        ctx.moveTo(vX - 6, vY - 6);
        ctx.lineTo(vX + 6, vY + 6);
        ctx.lineTo(vX + 6, vY - 6);
        ctx.lineTo(vX - 6, vY + 6);
        ctx.closePath();
        ctx.fill();

        ctx.font = '8px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`CO:${co.toFixed(0)}%`, vX - 14, vY + 18);

        // 3. Right: Dual-Trace Digital Process Scope (ISA-5.1 Standard Colors: SP=Green, PV=Cyan, CO=Amber)
        const scX = w * 0.48;
        const scY = 32;
        const scW = w - scX - 18;
        const scH = h * 0.78;

        ctx.fillStyle = '#060a12';
        ctx.strokeStyle = '#1e293b';
        ctx.fillRect(scX, scY, scW, scH);
        ctx.strokeRect(scX, scY, scW, scH);

        // Graticule lines
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
        ctx.setLineDash([2, 2]);
        for (let g = 0.25; g < 1; g += 0.25) {
          ctx.beginPath();
          ctx.moveTo(scX, scY + scH * g);
          ctx.lineTo(scX + scW, scY + scH * g);
          ctx.stroke();
        }
        ctx.setLineDash([]);

        // Setpoint (SP) horizontal line
        const scSpY = scY + scH - (sp / 100) * scH;
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(scX, scSpY);
        ctx.lineTo(scX + scW, scSpY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Real-Time Scrolling History Plot (Discrete Numerical PID Solver)
        const hist = state.pidHistory;
        if (hist.length > 1) {
          // 1. Controller Output (CO) trace in Amber
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.75)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          for (let k = 0; k < hist.length; k++) {
            const hx = scX + (k / (hist.length - 1)) * scW;
            const hy = scY + scH - (hist[k].co / 100) * scH;
            if (k === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.stroke();

          // 2. Process Variable (PV) trace in Cyan
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          for (let k = 0; k < hist.length; k++) {
            const hx = scX + (k / (hist.length - 1)) * scW;
            const hy = scY + scH - (hist[k].pv / 100) * scH;
            if (k === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.stroke();
        }

        ctx.font = '9px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('ISA-5.1 PID CLOSED-LOOP SCOPE', scX + 8, scY + 16);
        ctx.fillStyle = '#10b981';
        ctx.fillText(`• SP = ${sp}%`, scX + 8, scY + 30);
        ctx.fillStyle = '#06b6d4';
        ctx.fillText(`• PV = ${pv.toFixed(1)}%`, scX + 8, scY + 44);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`• CO = ${co.toFixed(1)}%`, scX + 8, scY + 58);

      // =======================================================================
      // MODE 5: CHEMICAL & PROCESS (Exothermic Jacketed CSTR & Van Heerden S-Curve)
      // AIChE / Fogler Arrhenius Reaction Kinetics & Thermal Runaway Dynamics
      // =======================================================================
      } else if (activeDept === 'chemical') {
        const t = state.time;
        // Arrhenius rate k = k0 * exp(-Ea / (R * T))
        const k0 = 2.5e6;
        const EaOverR = 8000; // K
        let effectiveT = chemTemp;
        if (scenario === 'surge') effectiveT += 18;
        if (scenario === 'fault') effectiveT += 45; // Cooling failure leads to runaway!

        const kRate = k0 * Math.exp(-EaOverR / effectiveT);
        // CSTR mass balance: V*dCa/dt = F*(Ca0 - Ca) - V*k*Ca
        // Steady conversion X_A = (k * tau) / (1 + k * tau) where tau = V / F
        const tau = 6.67; // minutes / scale
        const conversion = Math.min(0.985, (kRate * tau) / (1 + kRate * tau));
        const ca = Math.max(0.01, 1.0 - conversion);
        state.cstrCa = ca;

        // Record history for scrolling plot
        if (state.cstrHistory.length === 0 || t - state.cstrHistory[state.cstrHistory.length - 1].t > 0.12) {
          state.cstrHistory.push({ t, temp: effectiveT, conversion });
          if (state.cstrHistory.length > 55) state.cstrHistory.shift();
        }

        // 1. Left: Jacketed Continuous Stirred Tank Reactor (CSTR) Vessel
        const rX = w * 0.22;
        const rY = h * 0.52;
        const rW = 120;
        const rH = 160;

        // Outer Cooling Jacket Shell (Annulus)
        const jW = rW + 28;
        const jH = rH - 15;
        const jX = rX - jW / 2;
        const jY = rY - rH / 2 + 18;

        const isRunaway = effectiveT > 375;
        const jacketColor = isRunaway ? 'rgba(239, 68, 68, 0.25)' : 'rgba(6, 182, 212, 0.2)';
        const jacketBorder = isRunaway ? '#ef4444' : '#06b6d4';

        ctx.fillStyle = jacketColor;
        ctx.strokeStyle = jacketBorder;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(jX, jY, jW, jH, [0, 0, 30, 30]);
        ctx.fill();
        ctx.stroke();

        // Jacket Coolant Flow Labels
        ctx.fillStyle = '#06b6d4';
        ctx.font = '8px "IBM Plex Mono", monospace';
        ctx.fillText('COOLANT IN (Tc=295K)', jX - 15, jY + jH - 6);
        ctx.fillText('COOLANT OUT', jX + jW - 35, jY + 12);

        // Reactor Vessel Body
        const vX = rX - rW / 2;
        const vY = rY - rH / 2;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(vX, vY, rW, rH, [18, 18, 26, 26]);
        ctx.clip();

        // Reactive Fluid Fill (shifts with temperature & conversion)
        const fluidGrad = ctx.createLinearGradient(vX, vY, vX, vY + rH);
        if (isRunaway) {
          fluidGrad.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
          fluidGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.9)');
          fluidGrad.addColorStop(1, 'rgba(185, 28, 28, 0.95)');
        } else {
          fluidGrad.addColorStop(0, 'rgba(147, 51, 234, 0.55)');
          fluidGrad.addColorStop(0.5, 'rgba(124, 58, 237, 0.75)');
          fluidGrad.addColorStop(1, 'rgba(76, 29, 149, 0.9)');
        }
        ctx.fillStyle = fluidGrad;
        ctx.fillRect(vX, vY + 22, rW, rH - 22);

        // Vortex meniscus surface
        ctx.fillStyle = isRunaway ? '#f87171' : '#c084fc';
        ctx.beginPath();
        ctx.ellipse(rX, vY + 22, rW / 2 - 2, 8, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Circulating Reaction Bubbles & Reactant Vortices
        state.cstrBubbles.forEach((b) => {
          b.angle += dt * 3.5;
          const swirlRadius = (rW * 0.35) * (0.3 + 0.7 * Math.sin(b.angle * 0.5));
          const bx = rX + Math.cos(b.angle) * swirlRadius;
          const by = vY + 35 + ((b.y * (rH - 65) + t * 25 * b.speed) % (rH - 65));
          
          ctx.fillStyle = (b.angle % 2 > 1) ? '#fbbf24' : '#c084fc';
          ctx.beginPath();
          ctx.arc(bx, by, b.r, 0, 2 * Math.PI);
          ctx.fill();
        });

        ctx.restore();

        // Reactor Vessel Outline
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(vX, vY, rW, rH, [18, 18, 26, 26]);
        ctx.stroke();

        // Agitator Motor M-101 on top
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.fillRect(rX - 16, vY - 26, 32, 26);
        ctx.strokeRect(rX - 16, vY - 26, 32, 26);

        ctx.font = '8px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('AGITATOR', rX - 18, vY - 30);

        // Central Shaft
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(rX, vY);
        ctx.lineTo(rX, rY + rH * 0.28);
        ctx.stroke();

        // Rotating Impeller Blades (Axial Pitch Turbine)
        const bladeAngle = t * 9;
        ctx.save();
        ctx.translate(rX, rY + rH * 0.28);
        ctx.rotate(bladeAngle);
        for (let b = 0; b < 4; b++) {
          ctx.strokeStyle = isRunaway ? '#ef4444' : '#c084fc';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos((b * Math.PI) / 2) * (rW * 0.32), Math.sin((b * Math.PI) / 2) * (rW * 0.32));
          ctx.stroke();
        }
        ctx.restore();

        // Inlet Feed Pipe (Reactant A) Top Left
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(vX - 25, vY + 12);
        ctx.lineTo(vX + 15, vY + 12);
        ctx.stroke();
        ctx.fillStyle = '#a855f7';
        ctx.font = '8px "IBM Plex Mono", monospace';
        ctx.fillText('FEED [F, CA0]', vX - 45, vY + 8);

        // Outlet Product Pipe Bottom Right
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(vX + rW - 15, vY + rH - 18);
        ctx.lineTo(vX + rW + 25, vY + rH - 18);
        ctx.stroke();
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('EFFLUENT [CA, T]', vX + rW + 5, vY + rH - 6);

        // Thermowell & Tag TT-101
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(vX + rW - 14, vY + 30);
        ctx.lineTo(vX + rW - 14, vY + 85);
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = isRunaway ? '#ef4444' : '#a855f7';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(vX + rW - 14, vY + 95, 12, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.font = '8px "IBM Plex Mono", monospace';
        ctx.fillStyle = isRunaway ? '#ef4444' : '#f8fafc';
        ctx.fillText('TT', vX + rW - 18, vY + 98);

        // 2. Right: Van Heerden Energy Balance & Reaction Rate Scope
        const scX = w * 0.48;
        const scY = 32;
        const scW = w - scX - 18;
        const scH = h * 0.78;

        ctx.fillStyle = '#060a12';
        ctx.strokeStyle = '#1e293b';
        ctx.fillRect(scX, scY, scW, scH);
        ctx.strokeRect(scX, scY, scW, scH);

        // Graticule grid
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
        ctx.setLineDash([2, 2]);
        for (let g = 0.25; g < 1; g += 0.25) {
          ctx.beginPath();
          ctx.moveTo(scX, scY + scH * g);
          ctx.lineTo(scX + scW, scY + scH * g);
          ctx.stroke();
        }
        ctx.setLineDash([]);

        // Top half: Van Heerden S-curve (Qg vs Qr)
        const vhH = scH * 0.50;
        ctx.font = '8px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#c084fc';
        ctx.fillText('VAN HEERDEN HEAT BALANCE [Qg vs Qr]', scX + 8, scY + 14);

        // Heat Removal Line Qr(T) in Cyan
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(scX + 15, scY + vhH - 12);
        ctx.lineTo(scX + scW - 20, scY + 22);
        ctx.stroke();

        // Heat Generation Sigmoid S-Curve Qg(T) in Violet/Amber
        ctx.strokeStyle = isRunaway ? '#ef4444' : '#a855f7';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let i = 0; i <= scW - 35; i++) {
          const plotT = 290 + (i / (scW - 35)) * 130;
          const kVal = k0 * Math.exp(-EaOverR / plotT);
          const xVal = (kVal * tau) / (1 + kVal * tau);
          const qGen = xVal * 0.85;
          const px = scX + 15 + i;
          const py = scY + vhH - 12 - qGen * (vhH - 34);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Operating point dot on S-curve
        const curNormX = Math.max(0, Math.min(1, (effectiveT - 290) / 130));
        const dotX = scX + 15 + curNormX * (scW - 35);
        const dotY = scY + vhH - 12 - conversion * 0.85 * (vhH - 34);
        ctx.fillStyle = isRunaway ? '#ef4444' : '#fbbf24';
        ctx.beginPath();
        ctx.arc(dotX, dotY, 4.5, 0, 2 * Math.PI);
        ctx.fill();

        // Bottom half: Dynamic Rolling Traces (Temp & Conversion)
        const btmY = scY + vhH + 10;
        const btmH = scH - vhH - 18;
        ctx.font = '8px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('DYNAMIC CONVERSION & THERMAL HISTORY', scX + 8, btmY + 12);

        const cHist = state.cstrHistory;
        if (cHist.length > 1) {
          // Temperature trace in Amber/Rose
          ctx.strokeStyle = isRunaway ? '#ef4444' : '#f59e0b';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let k = 0; k < cHist.length; k++) {
            const hx = scX + 15 + (k / (cHist.length - 1)) * (scW - 30);
            const normTemp = Math.max(0, Math.min(1, (cHist[k].temp - 290) / 130));
            const hy = btmY + btmH - 6 - normTemp * (btmH - 24);
            if (k === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.stroke();

          // Conversion trace in Emerald
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          for (let k = 0; k < cHist.length; k++) {
            const hx = scX + 15 + (k / (cHist.length - 1)) * (scW - 30);
            const hy = btmY + btmH - 6 - cHist[k].conversion * (btmH - 24);
            if (k === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.stroke();
        }

        // Live HUD Metrics
        ctx.font = '9px "IBM Plex Mono", monospace';
        ctx.fillStyle = isRunaway ? '#ef4444' : '#f8fafc';
        ctx.fillText(`• CORE TEMP: T = ${effectiveT.toFixed(1)} K`, scX + 8, scY + scH - 32);
        ctx.fillStyle = '#10b981';
        ctx.fillText(`• CONVERSION: X_A = ${(conversion * 100).toFixed(1)}%`, scX + 8, scY + scH - 20);
        ctx.fillStyle = '#c084fc';
        ctx.fillText(`• RATE k = ${kRate.toExponential(2)} s⁻¹`, scX + 8, scY + scH - 8);

      // =======================================================================
      // MODE 6: QUANTUM & SEMICONDUCTOR PHYSICS (Abrupt P-N Junction Diode)
      // Poisson-Boltzmann Band Bending, Space-Charge Layer & Shockley Transport
      // =======================================================================
      } else if (activeDept === 'physics') {
        const t = state.time;
        let bias = semiBias;
        if (scenario === 'surge') bias = Math.min(0.85, bias + 0.15);
        if (scenario === 'fault') bias = -3.8; // Reverse avalanche breakdown!

        // Built-in barrier potential V_bi ≈ 0.72 V for Silicon at 300K
        const vBi = 0.72;
        const netBarrier = Math.max(0.04, vBi - bias);
        const w0 = 60; // pixel scale for equilibrium depletion width
        const depW = w0 * Math.sqrt(netBarrier / vBi);
        const Is = 1e-12; // A
        const vt = 0.026; // Thermal voltage kT/q = 26 mV
        let currentMa = 0;
        if (bias > 0) {
          currentMa = Math.min(120, Is * Math.exp(bias / (1.2 * vt)) * 1e3);
        } else if (bias < -3.5) {
          currentMa = -(Math.abs(bias) - 3.5) * 85;
        } else {
          currentMa = -0.05;
        }

        // 1. Left: Abrupt P-N Junction Energy Band Diagram (Ec, Ev, Ef)
        const bdX = 25;
        const bdY = 32;
        const bdW = w * 0.44;
        const bdH = h * 0.78;
        const jX = bdX + bdW / 2;

        ctx.fillStyle = '#060a12';
        ctx.strokeStyle = '#1e293b';
        ctx.fillRect(bdX, bdY, bdW, bdH);
        ctx.strokeRect(bdX, bdY, bdW, bdH);

        // Depletion Zone Shading (Space Charge Region W)
        const depLeft = jX - depW / 2;
        const depRight = jX + depW / 2;
        ctx.fillStyle = 'rgba(30, 41, 59, 0.4)';
        ctx.fillRect(depLeft, bdY, depW, bdH);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(depLeft, bdY);
        ctx.lineTo(depLeft, bdY + bdH);
        ctx.moveTo(depRight, bdY);
        ctx.lineTo(depRight, bdY + bdH);
        ctx.stroke();
        ctx.setLineDash([]);

        // Region Header Badges
        ctx.font = '8px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('P-TYPE (Boron)', bdX + 10, bdY + 14);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('N-TYPE (Phosphorus)', bdX + bdW - 95, bdY + 14);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`DEPLETION W = ${(depW * 0.007).toFixed(3)} µm`, jX - 38, bdY + bdH - 8);

        // Built-in Electric Field Vector E_bi (pointing right to left)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(jX + depW * 0.35, bdY + 28);
        ctx.lineTo(jX - depW * 0.35, bdY + 28);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(jX - depW * 0.35, bdY + 28);
        ctx.lineTo(jX - depW * 0.35 + 5, bdY + 25);
        ctx.lineTo(jX - depW * 0.35 + 5, bdY + 31);
        ctx.closePath();
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.font = '7px "IBM Plex Mono", monospace';
        ctx.fillText('E_bi', jX - 8, bdY + 24);

        // Fixed Ionized Dopant Cores inside Depletion Region
        ctx.font = '9px "IBM Plex Mono", monospace';
        for (let row = 0; row < 3; row++) {
          const iy = bdY + 55 + row * 24;
          if (depLeft < jX - 10) {
            ctx.fillStyle = '#ef4444';
            ctx.fillText('⊖', jX - depW * 0.35, iy);
          }
          if (depRight > jX + 10) {
            ctx.fillStyle = '#06b6d4';
            ctx.fillText('⊕', jX + depW * 0.15, iy);
          }
        }

        // Energy Band Curves: Ec(x) and Ev(x)
        const egPix = 46;
        const midEnergy = bdY + bdH * 0.48;
        const deltaE = (netBarrier / vBi) * 28;

        // Conduction Band Ec (Sky Blue #38bdf8)
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let x = bdX; x <= bdX + bdW; x++) {
          const normX = (x - jX) / (depW / 2);
          const bend = Math.tanh(normX);
          const ecY = (midEnergy - egPix / 2) - bend * deltaE;
          if (x === bdX) ctx.moveTo(x, ecY);
          else ctx.lineTo(x, ecY);
        }
        ctx.stroke();
        ctx.font = '8px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('E_c', bdX + 6, midEnergy - egPix / 2 + deltaE - 4);

        // Valence Band Ev (Indigo/Violet #818cf8)
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let x = bdX; x <= bdX + bdW; x++) {
          const normX = (x - jX) / (depW / 2);
          const bend = Math.tanh(normX);
          const evY = (midEnergy + egPix / 2) - bend * deltaE;
          if (x === bdX) ctx.moveTo(x, evY);
          else ctx.lineTo(x, evY);
        }
        ctx.stroke();
        ctx.fillStyle = '#818cf8';
        ctx.fillText('E_v', bdX + 6, midEnergy + egPix / 2 + deltaE + 12);

        // Quasi-Fermi Levels
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);
        const efpY = midEnergy + egPix / 2 + deltaE - 10;
        ctx.beginPath();
        ctx.moveTo(bdX, efpY);
        ctx.lineTo(jX - depW * 0.2, efpY);
        ctx.stroke();

        const efnY = midEnergy - egPix / 2 - deltaE + 10;
        ctx.beginPath();
        ctx.moveTo(jX + depW * 0.2, efnY);
        ctx.lineTo(bdX + bdW, efnY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('E_F', bdX + bdW - 20, efnY - 4);

        // Free Carriers Swarm & Drift-Diffusion Wavepackets
        state.semiElectrons.forEach((el) => {
          el.x += (el.vx + (bias > 0.4 ? -0.4 : 0.05)) * dt;
          if (el.x < 0.5) {
            if (bias > 0.5) {
              if (Math.random() < 0.08) {
                state.arcFlashes.push({
                  x1: bdX + el.x * bdW,
                  y1: midEnergy,
                  x2: bdX + el.x * bdW + 5,
                  y2: midEnergy + 10,
                  life: 0.15,
                });
              }
              el.x = 0.95;
            } else {
              el.x = 0.52;
            }
          }
          if (el.x > 0.95) el.x = 0.55;
          const ex = bdX + el.x * bdW;
          const ey = midEnergy - egPix / 2 - deltaE - 8 + Math.sin(t * 5 + el.y * 10) * 8;
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(ex, ey, 2.5, 0, 2 * Math.PI);
          ctx.fill();
        });

        state.semiHoles.forEach((h) => {
          h.x += (h.vx + (bias > 0.4 ? 0.4 : -0.05)) * dt;
          if (h.x > 0.5) {
            if (bias > 0.5) h.x = 0.05;
            else h.x = 0.48;
          }
          if (h.x < 0.05) h.x = 0.45;
          const hx = bdX + h.x * bdW;
          const hy = midEnergy + egPix / 2 + deltaE + 8 + Math.cos(t * 5 + h.y * 10) * 8;
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(hx, hy, 2.5, 0, 2 * Math.PI);
          ctx.stroke();
        });

        // 2. Right: Live Shockley Diode I-V Graph & Carrier Scope
        const scX = w * 0.48;
        const scY = 32;
        const scW = w - scX - 18;
        const scH = h * 0.78;

        ctx.fillStyle = '#060a12';
        ctx.strokeStyle = '#1e293b';
        ctx.fillRect(scX, scY, scW, scH);
        ctx.strokeRect(scX, scY, scW, scH);

        const ivOriginX = scX + scW * 0.55;
        const ivOriginY = scY + scH * 0.68;

        ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(scX, ivOriginY);
        ctx.lineTo(scX + scW, ivOriginY);
        ctx.moveTo(ivOriginX, scY);
        ctx.lineTo(ivOriginX, scY + scH);
        ctx.stroke();

        ctx.font = '8px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText('+V (Forward)', scX + scW - 60, ivOriginY - 4);
        ctx.fillText('-V (Reverse)', scX + 8, ivOriginY - 4);
        ctx.fillText('+I (mA)', ivOriginX + 6, scY + 14);

        // Analytical Shockley Diode I-V Curve
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const vScale = (scW * 0.38) / 1.0;
        const iScale = (scH * 0.55) / 100;

        for (let vStep = -3.8; vStep <= 0.85; vStep += 0.02) {
          let curr = 0;
          if (vStep > 0) {
            curr = Is * Math.exp(vStep / (1.2 * vt)) * 1e3;
          } else if (vStep < -3.5) {
            curr = -(Math.abs(vStep) - 3.5) * 85;
          } else {
            curr = -0.5;
          }
          const px = ivOriginX + vStep * vScale;
          const py = ivOriginY - Math.max(-scH * 0.28, Math.min(scH * 0.65, curr * iScale));
          if (vStep === -3.8) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Forward Knee Marker at 0.7V
        const kneeX = ivOriginX + 0.70 * vScale;
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(kneeX, scY + 20);
        ctx.lineTo(kneeX, scY + scH);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('VF ≈ 0.7V', kneeX - 16, scY + 28);

        // Live Dynamic Operating Point Dot
        const opX = ivOriginX + bias * vScale;
        const opY = ivOriginY - Math.max(-scH * 0.28, Math.min(scH * 0.65, currentMa * iScale));
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(opX, opY, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Live HUD Readouts
        ctx.font = '9px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('SHOCKLEY DIODE TRANSPORT SCOPE', scX + 8, scY + 16);
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(`• BIAS: V_a = ${bias >= 0 ? '+' : ''}${bias.toFixed(2)} V`, scX + 8, scY + scH - 32);
        ctx.fillStyle = currentMa > 0.1 ? '#10b981' : currentMa < -1 ? '#ef4444' : '#94a3b8';
        ctx.fillText(`• CURRENT: I_D = ${currentMa.toFixed(2)} mA`, scX + 8, scY + scH - 20);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`• BARRIER: q(Vbi-Va) = ${netBarrier.toFixed(2)} eV`, scX + 8, scY + scH - 8);
      }

      // =======================================================================
      // INTERACTIVE CANVAS INSPECTION RETICLE (HOVER)
      // =======================================================================
      if (hoverPos) {
        ctx.save();
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);

        // Crosshairs
        ctx.beginPath();
        ctx.moveTo(hoverPos.x, 0);
        ctx.lineTo(hoverPos.x, h);
        ctx.moveTo(0, hoverPos.y);
        ctx.lineTo(w, hoverPos.y);
        ctx.stroke();

        // HUD Targeting Ring
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(hoverPos.x, hoverPos.y, 14, 0, 2 * Math.PI);
        ctx.stroke();

        // Floating Telemetry Readout
        const cardX = Math.min(w - 180, hoverPos.x + 18);
        const cardY = Math.max(30, hoverPos.y - 45);

        ctx.fillStyle = 'rgba(6, 11, 22, 0.95)';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.fillRect(cardX, cardY, 160, 52);
        ctx.strokeRect(cardX, cardY, 160, 52);

        ctx.font = '10px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#06b6d4';
        ctx.fillText(`PROBE: [${Math.round(hoverPos.x)}, ${Math.round(hoverPos.y)}]`, cardX + 8, cardY + 16);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`FIELD INTENSITY: ${(Math.sin(hoverPos.x * 0.02 + t) * 50 + 50).toFixed(1)}%`, cardX + 8, cardY + 30);
        ctx.fillStyle = '#10b981';
        ctx.fillText('CLICK: INJECT IMPULSE', cardX + 8, cardY + 44);

        ctx.restore();
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [activeDept, scenario, isRunning, simSpeed, elecFreq, mechRpm, civilLoad, pidSetpoint, chemTemp, semiBias, hoverPos]);

  return (
    <section className="relative overflow-hidden pt-8 pb-14 lg:py-16 border-b border-slate-800/80 bg-gradient-to-b from-[#050912] via-[#070e1c] to-[#080d16]">
      {/* High-Tech Ambient Ion Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[340px] bg-cyan-950/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[380px] bg-amber-950/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* =================================================================== */}
        {/* TWO-COLUMN HERO GRID: LEFT INFO & BUTTONS | RIGHT COMPACT SIMULATOR */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* LEFT COLUMN: Brand Signal, Mission, & Department Navigation */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Top Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>REAL-TIME 60 FPS ODE SOLVER</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.14]">
              <span className="block text-cyan-400 text-xs sm:text-sm lg:text-base font-mono font-semibold tracking-wider uppercase mb-3">
                LiveSimulators • Interactive Engineering Simulations
              </span>
              Don't Just Read <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300">
                Engineering.
              </span> <br />
              See It Happen.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
              Explore interactive engineering simulations and virtual physics laboratories. Experience living differential formulations,
              transient dynamics, and real-time control directly in your browser.
            </p>

            {/* Dual-Track Quick Stage Action Strip */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <button
                onClick={() => {
                  const el = document.getElementById('industrial-labs');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex-1 flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-cyan-500/15 to-blue-500/15 border border-amber-500/60 hover:border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)] text-left group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <span>Working Engineers</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-200">Industrial Suites Pro (IEEE)</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('departments-hub');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex-1 flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 text-left group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">Students & Faculty</div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-200">30+ Academic Fundamentals</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Department Navigation Hub */}
            <div className="space-y-2.5 pt-1">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
                <span>Dedicated Departments</span>
                <span className="text-cyan-400 text-[10px]">SELECT TO LAUNCH</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    setActiveDept('electrical');
                    onSelectDepartment('electrical');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all group ${
                    activeDept === 'electrical'
                      ? 'bg-cyan-950/70 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="mt-2 text-xs font-bold text-white group-hover:text-cyan-300">Electrical</div>
                  <div className="text-[10px] text-slate-400">Power, Flux & Machines</div>
                </button>

                <button
                  onClick={() => {
                    setActiveDept('mechanical');
                    onSelectDepartment('mechanical');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all group ${
                    activeDept === 'mechanical'
                      ? 'bg-amber-950/70 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Cpu className="w-4 h-4 text-amber-400" />
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="mt-2 text-xs font-bold text-white group-hover:text-amber-300">Mechanical</div>
                  <div className="text-[10px] text-slate-400">Gears & Kinematics</div>
                </button>

                <button
                  onClick={() => {
                    setActiveDept('chemical');
                    onSelectDepartment('chemical');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all group ${
                    activeDept === 'chemical'
                      ? 'bg-purple-950/70 border-purple-500/60 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <FlaskConical className="w-4 h-4 text-purple-400" />
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="mt-2 text-xs font-bold text-white group-hover:text-purple-300">Chemical</div>
                  <div className="text-[10px] text-slate-400">CSTR & Runaway Kinetics</div>
                </button>

                <button
                  onClick={() => {
                    setActiveDept('physics');
                    onSelectDepartment('physics');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all group ${
                    activeDept === 'physics'
                      ? 'bg-sky-950/70 border-sky-500/60 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Atom className="w-4 h-4 text-sky-400" />
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="mt-2 text-xs font-bold text-white group-hover:text-sky-300">Semiconductors</div>
                  <div className="text-[10px] text-slate-400">Bandgap & P-N Physics</div>
                </button>

                <button
                  onClick={() => {
                    setActiveDept('control');
                    onSelectDepartment('control');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all group ${
                    activeDept === 'control'
                      ? 'bg-emerald-950/70 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="mt-2 text-xs font-bold text-white group-hover:text-emerald-300">Instrumentation</div>
                  <div className="text-[10px] text-slate-400">PID & Process Controls</div>
                </button>

                <button
                  onClick={() => {
                    setActiveDept('civil');
                    onSelectDepartment('civil');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all group ${
                    activeDept === 'civil'
                      ? 'bg-pink-950/70 border-pink-500/60 shadow-[0_0_15px_rgba(236,72,153,0.2)]'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Building2 className="w-4 h-4 text-pink-400" />
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-pink-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="mt-2 text-xs font-bold text-white group-hover:text-pink-300">Civil</div>
                  <div className="text-[10px] text-slate-400">FEA, Bridges & Seismic</div>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: The Compact, Sleek Living Simulation Workbench */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-700/80 bg-slate-900/95 shadow-2xl shadow-cyan-950/40 overflow-hidden flex flex-col">
              
              {/* Compact Top Control Bar */}
              <div className="px-3.5 py-2.5 bg-slate-950/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                
                {/* Department Selector Tabs */}
                <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-lg border border-slate-800 flex-wrap">
                  <button
                    onClick={() => {
                      setActiveDept('electrical');
                      playSynthesizedTone(440, 'sine', 0.1, 0.03);
                    }}
                    className={`px-2 py-1 rounded-md text-[10.5px] font-semibold transition-all ${
                      activeDept === 'electrical'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ⚡ Elec
                  </button>

                  <button
                    onClick={() => {
                      setActiveDept('mechanical');
                      playSynthesizedTone(330, 'triangle', 0.1, 0.03);
                    }}
                    className={`px-2 py-1 rounded-md text-[10.5px] font-semibold transition-all ${
                      activeDept === 'mechanical'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ⚙️ Mech
                  </button>

                  <button
                    onClick={() => {
                      setActiveDept('chemical');
                      playSynthesizedTone(480, 'sine', 0.1, 0.03);
                    }}
                    className={`px-2 py-1 rounded-md text-[10.5px] font-semibold transition-all ${
                      activeDept === 'chemical'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.25)]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🧪 Chem
                  </button>

                  <button
                    onClick={() => {
                      setActiveDept('physics');
                      playSynthesizedTone(580, 'sine', 0.1, 0.03);
                    }}
                    className={`px-2 py-1 rounded-md text-[10.5px] font-semibold transition-all ${
                      activeDept === 'physics'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-[0_0_10px_rgba(56,189,248,0.25)]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ⚛️ Semi
                  </button>

                  <button
                    onClick={() => {
                      setActiveDept('control');
                      playSynthesizedTone(520, 'sine', 0.1, 0.03);
                    }}
                    className={`px-2 py-1 rounded-md text-[10.5px] font-semibold transition-all ${
                      activeDept === 'control'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🎛️ Control
                  </button>

                  <button
                    onClick={() => {
                      setActiveDept('civil');
                      playSynthesizedTone(260, 'sine', 0.1, 0.03);
                    }}
                    className={`px-2 py-1 rounded-md text-[10.5px] font-semibold transition-all ${
                      activeDept === 'civil'
                        ? 'bg-pink-500/20 text-pink-300 border border-pink-500/50 shadow-[0_0_10px_rgba(236,72,153,0.25)]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🏛️ Civil
                  </button>
                </div>

                {/* Scenario Stress Tests & Toggles */}
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <button
                    onClick={() => triggerScenario('normal')}
                    className={`px-2 py-0.5 rounded text-[10px] transition-all ${
                      scenario === 'normal'
                        ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Nominal
                  </button>

                  <button
                    onClick={() => triggerScenario('surge')}
                    className={`px-2 py-0.5 rounded text-[10px] transition-all ${
                      scenario === 'surge'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                    title="Dynamic surge load"
                  >
                    Surge
                  </button>

                  <button
                    onClick={() => triggerScenario('fault')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all flex items-center gap-1 ${
                      scenario === 'fault'
                        ? 'bg-red-950 text-red-300 border border-red-500/80 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                        : 'bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-300'
                    }`}
                    title="Trigger fault event"
                  >
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                    <span>Fault</span>
                  </button>

                  <div className="h-3.5 w-px bg-slate-800 mx-0.5" />

                  {/* Sound Toggle */}
                  <button
                    onClick={() => {
                      setSoundEnabled(!soundEnabled);
                      if (!soundEnabled) playSynthesizedTone(600, 'sine', 0.1, 0.05);
                    }}
                    className={`p-1 rounded border transition-colors ${
                      soundEnabled
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                        : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                    }`}
                    title={soundEnabled ? 'Mute Sound' : 'Enable Audio Synth'}
                  >
                    {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                  </button>

                  {/* Auto-Tour Toggle */}
                  <button
                    onClick={() => setAutoTour(!autoTour)}
                    className={`px-1.5 py-0.5 rounded border text-[10px] font-mono transition-all flex items-center gap-1 ${
                      autoTour
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-300'
                    }`}
                    title="Auto-tour showcase"
                  >
                    <RefreshCw className={`w-2.5 h-2.5 ${autoTour ? 'animate-spin' : ''}`} />
                    <span>{autoTour ? `${tourCountdown}s` : 'Tour'}</span>
                  </button>
                </div>
              </div>

              {/* Compact Living Simulation Canvas */}
              <div className="relative bg-[#050811] select-none">
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={340}
                  onClick={handleCanvasClick}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseLeave={() => setHoverPos(null)}
                  className="w-full h-[260px] sm:h-[300px] lg:h-[330px] block cursor-crosshair"
                />

                {/* Overlaid Telemetry Indicator */}
                <div className="absolute top-2.5 left-2.5 bg-slate-950/85 border border-slate-800 rounded-lg px-2 py-1 backdrop-blur-md font-mono text-[10px] space-y-0.5 pointer-events-none shadow-md">
                  <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>LIVING LAB ACTIVE</span>
                  </div>
                  <div className="text-slate-400 text-[9px]">
                    {activeDept === 'electrical' && '4-POLE AC STAGE (R-Y-B-N) • PHASOR WHEEL • 3Φ SCOPE'}
                    {activeDept === 'mechanical' && 'EPICYCLIC GEARS • 4-BAR RIBBON TRACER'}
                    {activeDept === 'chemical' && 'JACKETED CSTR REACTOR • ARRHENIUS KINETICS • VAN HEERDEN'}
                    {activeDept === 'physics' && 'P-N JUNCTION BAND BENDING • SPACE CHARGE • SHOCKLEY I-V'}
                    {activeDept === 'control' && 'CASCADE PROCESS TANK • CLOSED-LOOP PID'}
                    {activeDept === 'civil' && 'SEISMIC SHAKE TABLE • WARREN TRUSS BMD'}
                  </div>
                </div>

                {/* Probing Tip */}
                <div className="absolute bottom-2 right-2 bg-slate-950/80 border border-slate-800/80 rounded px-2 py-0.5 text-[9px] font-mono text-slate-400 pointer-events-none backdrop-blur-sm">
                  Click to shockwave • Hover to probe
                </div>
              </div>

              {/* Compact Bottom Slider & Full Simulator Launcher */}
              <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono">
                
                {/* Responsive Parameter Slider */}
                <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                  {activeDept === 'electrical' && (
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-slate-400 shrink-0 text-[11px]">Grid Freq:</span>
                      <input
                        type="range"
                        min="30"
                        max="90"
                        value={elecFreq}
                        onChange={(e) => setElecFreq(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                      <span className="text-cyan-300 font-bold shrink-0 text-xs">{elecFreq} Hz</span>
                    </div>
                  )}

                  {activeDept === 'mechanical' && (
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-slate-400 shrink-0 text-[11px]">Crank RPM:</span>
                      <input
                        type="range"
                        min="10"
                        max="90"
                        value={mechRpm}
                        onChange={(e) => setMechRpm(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                      <span className="text-amber-300 font-bold shrink-0 text-xs">{mechRpm} RPM</span>
                    </div>
                  )}

                  {activeDept === 'chemical' && (
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-slate-400 shrink-0 text-[11px]">Core Temp:</span>
                      <input
                        type="range"
                        min="290"
                        max="420"
                        value={chemTemp}
                        onChange={(e) => setChemTemp(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                      />
                      <span className="text-purple-300 font-bold shrink-0 text-xs">{chemTemp} K</span>
                    </div>
                  )}

                  {activeDept === 'physics' && (
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-slate-400 shrink-0 text-[11px]">Bias V_a:</span>
                      <input
                        type="range"
                        min="-3.5"
                        max="0.85"
                        step="0.05"
                        value={semiBias}
                        onChange={(e) => setSemiBias(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                      />
                      <span className="text-sky-300 font-bold shrink-0 text-xs">
                        {semiBias >= 0 ? '+' : ''}{semiBias.toFixed(2)} V
                      </span>
                    </div>
                  )}

                  {activeDept === 'control' && (
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-slate-400 shrink-0 text-[11px]">Level SP:</span>
                      <input
                        type="range"
                        min="15"
                        max="95"
                        value={pidSetpoint}
                        onChange={(e) => setPidSetpoint(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                      />
                      <span className="text-emerald-300 font-bold shrink-0 text-xs">{pidSetpoint}%</span>
                    </div>
                  )}

                  {activeDept === 'civil' && (
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-slate-400 shrink-0 text-[11px]">Truck Load:</span>
                      <input
                        type="range"
                        min="20"
                        max="120"
                        value={civilLoad}
                        onChange={(e) => setCivilLoad(parseFloat(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-400"
                      />
                      <span className="text-pink-300 font-bold shrink-0 text-xs">{civilLoad} kN</span>
                    </div>
                  )}
                </div>

                {/* Control Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsRunning(!isRunning)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                    title={isRunning ? 'Pause' : 'Resume'}
                  >
                    {isRunning ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>

                  <button
                    onClick={() => onLaunchSimulator && onLaunchSimulator(getActiveSimulator())}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.25)] font-sans"
                  >
                    <span>Open Workbench</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
