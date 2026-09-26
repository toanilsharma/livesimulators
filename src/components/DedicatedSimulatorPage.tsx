import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Play,
  Pause,
  Share2,
  Download,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  Activity,
  Sliders,
  Sparkles,
  Info,
  ChevronRight,
  Maximize2,
  Minimize2,
  BookOpen,
  Camera,
  FastForward,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  Grid,
  ChevronDown,
  Volume2,
  VolumeX,
  Crosshair,
  Compass,
  FlaskConical,
  X,
  Code,
  GraduationCap,
  ExternalLink,
  Copy,
  Check,
  Tv
} from 'lucide-react';
import { SimulatorItem, DisciplineId } from '../types';
import { ALL_AVAILABLE_SIMULATORS } from '../data/simulators';
import { MathView } from './MathView';
import { physicsAudio } from '../utils/physicsAudio';
import { SIMULATOR_EXPERIMENTS, getDynamicPhysicsExplanation, GuidedExperiment } from '../data/simulatorExperiments';
import { renderFourBar, renderHarmonicOscillator, renderSpurGear, renderRankineCycle } from './mechanical/renderers';
import { renderRlcCircuit, renderThreePhase, renderBuckBoost, renderSallenKey, renderTransmissionLine } from './electrical/renderers';
import { renderBeamBending, renderTrussAnalysis, renderSeismicIsolation, renderMohrCircle } from './civil/renderers';
import { renderCurrentLoop, renderControlValve, renderOrificeFlow, renderPidLoop, renderRtd } from './instrumentation/renderers';
import { renderDistillationColumn, renderHeatExchanger, renderGasAbsorption } from './process/renderers';
import { renderSicSwitching, renderIgbtThermal, renderMosfetChannel } from './semiconductor/renderers';
import { trackSimulatorOpen, trackSimulatorRun, trackParameterChange, trackShare } from '../utils/analytics';
import { WhyItHappenedCard } from './WhyItHappenedCard';
import { MathWorkerBridge, SimulationMetric } from '../utils/mathWorkerBridge';

interface DedicatedSimulatorPageProps {
  simulator: SimulatorItem;
  onBackToDepartment?: (deptId: DisciplineId) => void;
  onBackToHome?: () => void;
  onSelectSimulator?: (sim: SimulatorItem) => void;
  isEmbed?: boolean;
}

export const DedicatedSimulatorPage: React.FC<DedicatedSimulatorPageProps> = ({
  simulator,
  onBackToDepartment,
  onBackToHome,
  onSelectSimulator,
  isEmbed = false,
}) => {
  // Initialize parameters
  const [params, setParams] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    simulator.parameters.forEach((p) => {
      init[p.id] = p.default;
    });
    return init;
  });

  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1.0);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'telemetry' | 'derivation' | 'standards' | 'insights' | 'curriculum' | 'experiments'>('telemetry');
  const [snapshotToast, setSnapshotToast] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [peerDropdownOpen, setPeerDropdownOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showExperimentsModal, setShowExperimentsModal] = useState<boolean>(false);
  const [showEmbedModal, setShowEmbedModal] = useState<boolean>(false);
  const [embedCopied, setEmbedCopied] = useState<boolean>(false);
  const [embedHeight, setEmbedHeight] = useState<string>('650');
  const [selectedExperiment, setSelectedExperiment] = useState<GuidedExperiment | null>(null);
  const [probeCoord, setProbeCoord] = useState<{ x: number; y: number } | null>(null);
  const [shareMenuOpen, setShareMenuOpen] = useState<boolean>(false);

  // Dual-Cursor Scope measurement state (T1 & T2 cursors for dt, frequency, and dV analysis)
  const [showDualCursors, setShowDualCursors] = useState<boolean>(false);
  const [cursor1Ratio, setCursor1Ratio] = useState<number>(0.28);
  const [cursor2Ratio, setCursor2Ratio] = useState<number>(0.72);
  const draggingCursorRef = useRef<'c1' | 'c2' | null>(null);

  // CRT Phosphor Glow Mode (authentic green phosphor persistence and scanlines)
  const [isCrtMode, setIsCrtMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('livesimulators_crt_mode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    const handleCrtChange = (e: Event) => {
      const customEv = e as CustomEvent<{ enabled: boolean }>;
      if (customEv.detail && typeof customEv.detail.enabled === 'boolean') {
        setIsCrtMode(customEv.detail.enabled);
      }
    };
    window.addEventListener('livesimulators:crt_change', handleCrtChange);
    return () => window.removeEventListener('livesimulators:crt_change', handleCrtChange);
  }, []);

  const toggleCrtMode = () => {
    const next = !isCrtMode;
    setIsCrtMode(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('livesimulators_crt_mode', next ? 'true' : 'false');
      window.dispatchEvent(new CustomEvent('livesimulators:crt_change', { detail: { enabled: next } }));
    }
  };

  // Session run duration tracking for GA4 simulator_run {duration_s}
  const runStartTimeRef = useRef<number | null>(Date.now());
  const accumulatedDurationRef = useRef<number>(0);

  // Mechanical and dynamic simulation tracking refs
  const couplerTracerRef = useRef<Array<{ x: number; y: number }>>([]);
  const pidStateRef = useRef<{
    pv: number;
    integral: number;
    lastError: number;
    historyPv: number[];
    historySp: number[];
    historyMv: number[];
  }>({
    pv: 30,
    integral: 0,
    lastError: 0,
    historyPv: new Array(80).fill(30),
    historySp: new Array(80).fill(65),
    historyMv: new Array(80).fill(50),
  });
  const loopParticlesRef = useRef<Array<{ pos: number; path: number }>>([
    { pos: 0.1, path: 0 }, { pos: 0.3, path: 0 }, { pos: 0.6, path: 0 }, { pos: 0.8, path: 0 },
    { pos: 0.2, path: 1 }, { pos: 0.5, path: 1 }, { pos: 0.7, path: 1 }, { pos: 0.9, path: 1 },
  ]);
  const bubbleParticlesRef = useRef<Array<{ x: number; y: number; size: number; alpha: number }>>([]);
  const seismicHistoryRef = useRef<number[]>(new Array(100).fill(0));

  // Mobile view mode tab for smaller screens: 'workbench' | 'parameters' | 'analysis'
  const [mobileTab, setMobileTab] = useState<'workbench' | 'parameters' | 'analysis'>('workbench');

  // Canvas & container refs
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // Web Worker Physics Engine Bridge for RK4 Integration & Non-Blocking Sliders
  const mathWorkerRef = useRef<MathWorkerBridge | null>(null);
  const latestWorkerStateRef = useRef<Record<string, any>>({});
  const [workerMetrics, setWorkerMetrics] = useState<SimulationMetric[]>([]);
  const metricsFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const bridge = new MathWorkerBridge();
    mathWorkerRef.current = bridge;
    bridge.setParams(simulator.type, params, timeRef.current);

    const unsubscribe = bridge.subscribe((data) => {
      if (data.simulatorType === simulator.type) {
        latestWorkerStateRef.current = data.state;
        if (data.metrics && data.metrics.length > 0) {
          if (metricsFrameRef.current === null) {
            metricsFrameRef.current = requestAnimationFrame(() => {
              setWorkerMetrics(data.metrics);
              metricsFrameRef.current = null;
            });
          }
        }
      }
    });

    return () => {
      unsubscribe();
      if (metricsFrameRef.current !== null) {
        cancelAnimationFrame(metricsFrameRef.current);
      }
      bridge.terminate();
      mathWorkerRef.current = null;
    };
  }, [simulator.id, simulator.type]);

  // Update params when simulator changes
  useEffect(() => {
    const init: Record<string, number> = {};
    simulator.parameters.forEach((p) => {
      init[p.id] = p.default;
    });
    setParams(init);
    timeRef.current = 0;
    setPeerDropdownOpen(false);
  }, [simulator.id]);

  // GA4 Telemetry: Track simulator_open
  useEffect(() => {
    trackSimulatorOpen(simulator.discipline, simulator.id);
  }, [simulator.id]);

  // GA4 Telemetry: Track simulator_run duration on pause
  useEffect(() => {
    if (isRunning) {
      runStartTimeRef.current = Date.now();
    } else {
      if (runStartTimeRef.current) {
        const sessionSeconds = (Date.now() - runStartTimeRef.current) / 1000;
        accumulatedDurationRef.current += sessionSeconds;
        trackSimulatorRun(accumulatedDurationRef.current);
        accumulatedDurationRef.current = 0;
        runStartTimeRef.current = null;
      }
    }
  }, [isRunning]);

  // GA4 Telemetry: Track simulator_run duration on unmount or route switch
  useEffect(() => {
    return () => {
      let finalDuration = accumulatedDurationRef.current;
      if (runStartTimeRef.current) {
        finalDuration += (Date.now() - runStartTimeRef.current) / 1000;
      }
      if (finalDuration > 0) {
        trackSimulatorRun(finalDuration);
      }
      accumulatedDurationRef.current = 0;
      runStartTimeRef.current = null;
    };
  }, [simulator.id]);

  // Fullscreen state listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // ResizeObserver to ensure canvas ALWAYS fits its parent container pixel-for-pixel
  useEffect(() => {
    const container = canvasContainerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const newW = Math.floor(rect.width);
      const newH = Math.floor(rect.height);
      if (newW > 10 && newH > 10) {
        if (canvas.width !== newW || canvas.height !== newH) {
          canvas.width = newW;
          canvas.height = newH;
        }
      }
    };

    updateCanvasSize();
    const observer = new ResizeObserver(() => {
      updateCanvasSize();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [simulator.id, mobileTab]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const handleParamChange = (id: string, value: number) => {
    const nextParams = { ...params, [id]: value };
    setParams(nextParams);
    trackParameterChange(id);
    // Asynchronously dispatch slider parameter update to Web Worker (0ms main thread blocking)
    if (mathWorkerRef.current) {
      mathWorkerRef.current.setParams(simulator.type, nextParams, timeRef.current);
    }
  };

  const handleApplyPreset = (values: Record<string, number>) => {
    const nextParams = { ...params, ...values };
    setParams(nextParams);
    Object.keys(values).forEach((k) => trackParameterChange(k));
    if (mathWorkerRef.current) {
      mathWorkerRef.current.setParams(simulator.type, nextParams, timeRef.current);
    }
  };

  const handleResetDefaults = () => {
    const init: Record<string, number> = {};
    simulator.parameters.forEach((p) => {
      init[p.id] = p.default;
    });
    setParams(init);
    timeRef.current = 0;
    trackParameterChange('reset_defaults');
    if (mathWorkerRef.current) {
      mathWorkerRef.current.reset(simulator.type, init);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      trackShare('clipboard');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      trackShare('clipboard');
    }
  };

  const handleSocialShare = (network: 'linkedin' | 'twitter' | 'web_share') => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = `${simulator.title} - LiveSimulators Interactive Engineering`;
    trackShare(network);

    if (network === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
    } else if (network === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer');
    } else if (network === 'web_share' && typeof navigator !== 'undefined' && (navigator as any).share) {
      (navigator as any).share({ title, url }).catch(() => {});
    }
    setShareMenuOpen(false);
  };

  const handleSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${simulator.id}_physics_capture.png`;
    a.click();
    setSnapshotToast(true);
    setTimeout(() => setSnapshotToast(false), 2500);
  };

  const handleExportCSV = () => {
    let csv = `time_sec,param_primary,param_secondary,telemetry_output\n`;
    for (let i = 0; i < 200; i++) {
      const t = i * 0.01;
      const v1 = Math.sin(2 * Math.PI * 50 * t);
      const v2 = Math.cos(2 * Math.PI * 50 * t);
      csv += `${t.toFixed(4)},${v1.toFixed(4)},${v2.toFixed(4)},${(v1 * v2).toFixed(4)}\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${simulator.id}_physics_telemetry.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---------------------------------------------------------------------------
  // NUMERICAL METRICS ENGINE
  // ---------------------------------------------------------------------------
  const metrics: { label: string; value: string; unit: string; description: string; status?: 'normal' | 'warning' | 'alert' }[] = [];

  if (simulator.type === 'rlc') {
    const R = params['resistance'] || 25;
    const L = (params['inductance'] || 60) * 1e-3;
    const C = (params['capacitance'] || 40) * 1e-6;
    const f = params['frequency'] || 100;
    const omega = 2 * Math.PI * f;
    const omega0 = 1 / Math.sqrt(L * C);
    const f0 = omega0 / (2 * Math.PI);
    const zeta = (R / 2) * Math.sqrt(C / L);
    const Q = (1 / R) * Math.sqrt(L / C);
    const XL = omega * L;
    const XC = 1 / (omega * C);
    const Z = Math.sqrt(R * R + (XL - XC) * (XL - XC));

    metrics.push({ label: 'Resonant Frequency f₀', value: f0.toFixed(1), unit: 'Hz', description: 'Zero reactance natural frequency' });
    metrics.push({ label: 'Damping Ratio ζ', value: zeta.toFixed(3), unit: '', description: 'Dimensionless damping coefficient', status: zeta < 1 ? 'warning' : 'normal' });
    metrics.push({ label: 'Quality Factor Q', value: Q.toFixed(2), unit: '', description: 'Sharpness of frequency resonance peak' });
    metrics.push({ label: 'Total Impedance |Z|', value: Z.toFixed(1), unit: 'Ω', description: 'Effective AC circuit opposition to current' });
  } else if (simulator.type === 'three_phase') {
    const f = params['frequency'] || 50;
    const V_ph = params['voltage'] || 230;
    const T_L = params['loadTorque'] || 45;
    const I_f = params['excitationCurrent'] || 5;

    const syncSpeed = (120 * f) / 4;
    const T_max = 120;
    const deltaDeg = Math.min(85, (Math.asin(Math.min(0.95, T_L / T_max)) * 180) / Math.PI);
    const pf = Math.min(1.0, 0.85 + (I_f - 5) * 0.03);
    const pActive = (3 * V_ph * (T_L * 1.2) * pf) / 1000;

    metrics.push({ label: 'Synchronous Speed', value: syncSpeed.toFixed(0), unit: 'RPM', description: 'Stator magnetic flux rotational velocity' });
    metrics.push({ label: 'Torque Angle δ', value: deltaDeg.toFixed(1), unit: '°', description: 'Rotor displacement from stator MMF', status: deltaDeg > 60 ? 'warning' : 'normal' });
    metrics.push({ label: 'Power Factor cos(φ)', value: pf.toFixed(2), unit: pf > 0.95 ? 'Leading' : 'Lagging', description: 'Ratio of real to apparent power' });
    metrics.push({ label: 'Active Real Power P', value: pActive.toFixed(1), unit: 'kW', description: 'Three-phase electromechanical output power' });
  } else if (simulator.type === 'buck_boost') {
    const D = params['dutyCycle'] || 0.6;
    const Vin = params['inputVoltage'] || 12;
    const fsw = (params['switchingFreq'] || 100) * 1e3;
    const L = (params['inductance'] || 120) * 1e-6;
    const Rload = 20;
    const Vout = -Vin * (D / (1 - D));
    const deltaIL = (Vin * D) / (L * fsw);
    const Iout = Math.abs(Vout) / Rload;
    const ILavg = Iout / (1 - D);
    const isCCM = ILavg > deltaIL / 2;

    metrics.push({ label: 'Output Voltage V_out', value: Vout.toFixed(2), unit: 'V', description: 'Regulated inverted DC rail voltage' });
    metrics.push({ label: 'Inductor Ripple ΔI_L', value: deltaIL.toFixed(2), unit: 'A', description: 'Peak-to-peak AC magnetic choke ripple' });
    metrics.push({ label: 'Average Inductor Current', value: ILavg.toFixed(2), unit: 'A', description: 'Mean DC current sustained by inductor' });
    metrics.push({ label: 'Conduction Mode', value: isCCM ? 'CCM Continuous' : 'DCM Discontinuous', unit: '', description: 'Inductor current continuity status', status: isCCM ? 'normal' : 'warning' });
  } else if (simulator.type === 'sallen_key') {
    const fc = params['cutoffFreq'] || 1500;
    const Q = params['qualityFactor'] || 0.707;
    const Av = params['gain'] || 1.0;
    const fin = params['testFreq'] || 1200;

    const r = fin / fc;
    const mag = Av / Math.sqrt(Math.pow(1 - r * r, 2) + Math.pow(r / Q, 2));
    const gainDb = 20 * Math.log10(Math.max(0.001, mag));
    const phaseDeg = -Math.atan2(r / Q, 1 - r * r) * (180 / Math.PI);
    const damping = 1 / (2 * Q);

    metrics.push({ label: 'Gain at Test Freq', value: gainDb.toFixed(2), unit: 'dB', description: 'Signal attenuation at input frequency' });
    metrics.push({ label: 'Phase Shift', value: phaseDeg.toFixed(1), unit: '°', description: 'Biquad filter phase lag' });
    metrics.push({ label: 'Damping Factor ζ', value: damping.toFixed(3), unit: '', description: '0.707 indicates Butterworth maximally flat response' });
    metrics.push({ label: 'Cutoff Frequency f_c', value: fc.toString(), unit: 'Hz', description: '-3 dB transition bandwidth limit' });
  } else if (simulator.type === 'transmission_line') {
    const ZL = params['loadImpedance'] || 50;
    const Z0 = params['lineImpedance'] || 50;
    const f = params['frequency'] || 300;
    const gamma = (ZL - Z0) / (ZL + Z0);
    const absGamma = Math.abs(gamma);
    const vswr = (1 + absGamma) / Math.max(0.001, 1 - absGamma);
    const returnLoss = absGamma > 0 ? -20 * Math.log10(absGamma) : 99.9;
    const wavelength = 300 / f;

    metrics.push({ label: 'Reflection Coeff |Γ|', value: absGamma.toFixed(3), unit: '', description: 'Fraction of incident voltage wave reflected' });
    metrics.push({ label: 'VSWR', value: vswr.toFixed(2), unit: ':1', description: 'Voltage Standing Wave Ratio (1.0 is ideal)', status: vswr > 2.0 ? 'warning' : 'normal' });
    metrics.push({ label: 'Return Loss', value: returnLoss > 50 ? '>50' : returnLoss.toFixed(1), unit: 'dB', description: 'RF power reflection attenuation' });
    metrics.push({ label: 'Carrier Wavelength λ', value: wavelength.toFixed(2), unit: 'm', description: 'Spatial period of TEM guided wave' });
  } else if (simulator.type === 'beam_deflection') {
    const L = params['span'] || 6;
    const P = params['pointLoad'] || 45;
    const a = params['loadPos'] || 3;
    const q = params['udl'] || 12;
    const b = L - a;

    const R1 = (P * b) / L + (q * L) / 2;
    const R2 = (P * a) / L + (q * L) / 2;
    const maxM = (P * a * b) / L + (q * L * L) / 8;

    const E = 200e9;
    const I = 84.9e-6;
    const delta_mid = ((P * Math.min(a, b) * (3 * L * L - 4 * Math.min(a, b) * Math.min(a, b))) / (48 * E * I) + (5 * (q * 1000) * Math.pow(L, 4)) / (384 * E * I)) * 1000;
    const aiscLimit = (L * 1000) / 360;

    metrics.push({ label: 'Peak Bending Moment', value: maxM.toFixed(1), unit: 'kN·m', description: 'Maximum internal flexural bending moment' });
    metrics.push({ label: 'Max Deflection δ', value: delta_mid.toFixed(2), unit: 'mm', description: 'Calculated vertical beam center sag', status: delta_mid > aiscLimit ? 'alert' : 'normal' });
    metrics.push({ label: 'AISC Allowable (L/360)', value: aiscLimit.toFixed(1), unit: 'mm', description: 'AISC 360-16 maximum allowable live deflection' });
    metrics.push({ label: 'Left Reaction Force R₁', value: R1.toFixed(1), unit: 'kN', description: 'Vertical reaction support load at pin' });
  } else if (simulator.type === 'truss') {
    const span = params['span'] || 24;
    const H = params['height'] || 4.5;
    const P_truck = params['liveLoad'] || 80;
    const w_d = params['deadLoad'] || 15;
    const bayL = span / 6;

    const R_left = w_d * 2.5 + P_truck * 0.65;
    const maxTension = R_left * 1.8;
    const maxComp = R_left * 1.95;
    const memL = Math.sqrt(bayL * bayL + H * H);
    const P_cr = (Math.PI * Math.PI * 200e9 * 11.5e-6) / (memL * memL * 1000);
    const bucklingFactor = P_cr / maxComp;

    metrics.push({ label: 'Max Chord Tension', value: maxTension.toFixed(1), unit: 'kN', description: 'Tensile axial force in bottom bay chord' });
    metrics.push({ label: 'Max Web Compression', value: maxComp.toFixed(1), unit: 'kN', description: 'Maximum compressive load in diagonal strut' });
    metrics.push({ label: 'Euler Buckling P_cr', value: P_cr.toFixed(1), unit: 'kN', description: 'Critical column buckling threshold capacity' });
    metrics.push({ label: 'Buckling Safety Margin', value: bucklingFactor.toFixed(2), unit: 'x', description: 'AASHTO member stability factor of safety', status: bucklingFactor < 1.67 ? 'warning' : 'normal' });
  } else if (simulator.type === 'seismic') {
    const pga = params['pga'] || 0.45;
    const freq = params['frequency'] || 1.8;
    const dLead = params['leadCore'] || 120;
    const damping = params['damping'] || 18;

    const tnFixed = 0.45;
    const tnIsolated = 0.45 * Math.sqrt(180 / dLead) * 2.4;
    const baseShearFixed = pga * 9.81 * 450 * 0.85;
    const baseShearIso = baseShearFixed * (1 - damping / 100) * 0.35;
    const roofDrift = (pga * 9.81 / Math.pow(2 * Math.PI * freq, 2)) * 1000 * 0.4;
    const ascePass = roofDrift < 40;

    metrics.push({ label: 'Isolated Period T_n', value: tnIsolated.toFixed(2), unit: 's', description: 'Elongated fundamental vibration period' });
    metrics.push({ label: 'Base Shear Reduction', value: `${(((baseShearFixed - baseShearIso) / baseShearFixed) * 100).toFixed(0)}%`, unit: 'Absorbed', description: 'Lateral earthquake energy mitigated by LRBs' });
    metrics.push({ label: 'Roof Lateral Drift', value: roofDrift.toFixed(1), unit: 'mm', description: 'Peak multi-story horizontal displacement' });
    metrics.push({ label: 'ASCE 7-22 Drift Check', value: ascePass ? 'PASSED (<2%)' : 'EXCEEDED', unit: '', description: 'Inter-story drift safety compliance', status: ascePass ? 'normal' : 'alert' });
  } else if (simulator.type === 'mohr_circle') {
    const sx = params['sigmaX'] || 140;
    const sy = params['sigmaY'] || 50;
    const txy = params['tauXy'] || 35;

    const sAvg = (sx + sy) / 2;
    const R = Math.sqrt(Math.pow((sx - sy) / 2, 2) + Math.pow(txy, 2));
    const s1 = sAvg + R;
    const s2 = sAvg - R;
    const tauMax = R;
    const phiSoil = (30 * Math.PI) / 180;
    const tauCapacity = 20 + sAvg * Math.tan(phiSoil);
    const fs = tauCapacity / tauMax;

    metrics.push({ label: 'Major Principal σ₁', value: s1.toFixed(1), unit: 'kPa', description: 'Maximum normal stress along principal axis' });
    metrics.push({ label: 'Minor Principal σ₂', value: s2.toFixed(1), unit: 'kPa', description: 'Minimum normal stress along principal axis' });
    metrics.push({ label: 'Max In-Plane Shear τ_max', value: tauMax.toFixed(1), unit: 'kPa', description: 'Maximum shear stress at 45° to principal plane' });
    metrics.push({ label: 'Mohr-Coulomb Factor of Safety', value: fs.toFixed(2), unit: 'x', description: 'Shear slip failure margin (ASTM D3080)', status: fs < 1.3 ? 'warning' : 'normal' });
  } else if (simulator.type === 'four_bar') {
    const r1 = params['groundL'] || 130;
    const r2 = params['crankR'] || 40;
    const r3 = params['couplerL'] || 120;
    const r4 = params['rockerL'] || 90;
    const s = Math.min(r1, r2, r3, r4);
    const l = Math.max(r1, r2, r3, r4);
    const sumSL = s + l;
    const sumPQ = r1 + r2 + r3 + r4 - sumSL;
    const isGrashof = sumSL <= sumPQ;

    metrics.push({ label: 'Grashof Condition', value: isGrashof ? 'Grashof Class I (Crank-Rocker)' : 'Non-Grashof (Triple Rocker)', unit: '', description: 'Continuous full rotational mobility check', status: isGrashof ? 'normal' : 'warning' });
    metrics.push({ label: 'Shortest Link s', value: s.toFixed(0), unit: 'mm', description: 'Crank driving element length' });
    metrics.push({ label: 'Longest Link l', value: l.toFixed(0), unit: 'mm', description: 'Ground fixed frame base span' });
    metrics.push({ label: 'Mobility Margin', value: (sumPQ - sumSL).toFixed(0), unit: 'mm', description: 'Grashof equation slack threshold' });
  } else if (simulator.type === 'rankine') {
    const P1 = params['boilerP'] || 80;
    const T1 = params['turbineInletT'] || 480;
    const P2 = params['condenserP'] || 0.08;
    const eta_t = (params['turbineEff'] || 85) / 100;

    const h1 = 2800 + (T1 - 300) * 1.9 + P1 * 0.5;
    const h2s = 2050 + P2 * 300;
    const h2 = h1 - eta_t * (h1 - h2s);
    const h3 = 173;
    const wp = 0.001 * (P1 - P2) * 100;
    const h4 = h3 + wp;
    const wt = h1 - h2;
    const qin = h1 - h4;
    const eta_th = ((wt - wp) / qin) * 100;
    const bwr = (wp / wt) * 100;

    metrics.push({ label: 'Cycle Thermal Efficiency η_th', value: eta_th.toFixed(2), unit: '%', description: 'Thermodynamic steam power cycle conversion' });
    metrics.push({ label: 'Turbine Specific Work W_t', value: wt.toFixed(1), unit: 'kJ/kg', description: 'Shaft enthalpy extraction in turbine' });
    metrics.push({ label: 'Feed Pump Work W_p', value: wp.toFixed(2), unit: 'kJ/kg', description: 'Compressive work on condensed feedwater' });
    metrics.push({ label: 'Back Work Ratio BWR', value: bwr.toFixed(2), unit: '%', description: 'Fraction of gross work consumed by pump' });
  } else if (simulator.type === 'harmonic') {
    const m = params['mass'] || 5;
    const k = params['stiffness'] || 350;
    const c = params['dampingC'] || 8;
    const f_drive = params['driveFreq'] || 1.33;

    const omega_n = Math.sqrt(k / m);
    const fn = omega_n / (2 * Math.PI);
    const zeta = c / (2 * Math.sqrt(k * m));
    const omega = 2 * Math.PI * f_drive;
    const r = omega / omega_n;
    const denom = Math.sqrt(Math.pow(1 - r * r, 2) + Math.pow(2 * zeta * r, 2));
    const M = 1 / Math.max(0.001, denom);
    const phi = Math.atan2(2 * zeta * r, 1 - r * r) * (180 / Math.PI);

    metrics.push({ label: 'Natural Frequency f_n', value: fn.toFixed(2), unit: 'Hz', description: 'Undamped characteristic resonance frequency' });
    metrics.push({ label: 'Damping Ratio ζ', value: zeta.toFixed(3), unit: '', description: 'Viscous damping relative to critical' });
    metrics.push({ label: 'Magnification Factor M', value: M.toFixed(2), unit: 'x', description: 'Steady-state displacement amplitude gain', status: M > 4 ? 'alert' : 'normal' });
    metrics.push({ label: 'Phase Lag φ', value: phi.toFixed(1), unit: '°', description: 'Response delay behind excitation force' });
  } else if (simulator.type === 'spur_gear') {
    const m = params['moduleM'] || 4;
    const z1 = params['teethPinion'] || 18;
    const z2 = params['teethGear'] || 48;
    const alphaDeg = params['pressureAngle'] || 20;
    const N1 = params['inputRpm'] || 600;

    const alpha = (alphaDeg * Math.PI) / 180;
    const d1 = m * z1;
    const d2 = m * z2;
    const C = (d1 + d2) / 2;
    const gearRatio = z2 / z1;
    const pitchVel = (Math.PI * d1 * N1) / 60000;
    const pb = Math.PI * m * Math.cos(alpha);
    const ra1 = d1 / 2 + m;
    const ra2 = d2 / 2 + m;
    const rb1 = (d1 / 2) * Math.cos(alpha);
    const rb2 = (d2 / 2) * Math.cos(alpha);
    const pathContact = Math.sqrt(ra1 * ra1 - rb1 * rb1) + Math.sqrt(ra2 * ra2 - rb2 * rb2) - C * Math.sin(alpha);
    const CR = pathContact / pb;

    metrics.push({ label: 'Gear Ratio i', value: `1:${gearRatio.toFixed(2)}`, unit: '', description: 'Angular speed reduction ratio' });
    metrics.push({ label: 'Contact Ratio CR', value: CR.toFixed(2), unit: '', description: 'Average number of pairs in continuous mesh', status: CR < 1.4 ? 'warning' : 'normal' });
    metrics.push({ label: 'Pitch Line Velocity V_p', value: pitchVel.toFixed(2), unit: 'm/s', description: 'Circumferential tangential mesh speed' });
    metrics.push({ label: 'Center Distance C', value: C.toFixed(1), unit: 'mm', description: 'Shaft axis separation distance' });
  } else if (simulator.type === 'pid') {
    const kp = params['kp'] || 2.4;
    const ti = params['ti'] || 8;
    const td = params['td'] || 0.5;
    const sp = params['setpoint'] || 65;

    metrics.push({ label: 'Proportional Gain K_p', value: kp.toFixed(2), unit: '', description: 'Instantaneous error amplifier' });
    metrics.push({ label: 'Integral Reset Time T_i', value: ti.toFixed(1), unit: 's', description: 'Steady-state offset elimination rate' });
    metrics.push({ label: 'Derivative Rate Time T_d', value: td.toFixed(2), unit: 's', description: 'Error rate-of-change dampener' });
    metrics.push({ label: 'Target Setpoint SP', value: sp.toFixed(0), unit: '%', description: 'Desired regulated process operating target' });
  } else if (simulator.type === 'control_valve') {
    const openPct = params['openingPct'] || 60;
    const P1 = params['inletPressure'] || 6.0;
    const P2 = params['outletPressure'] || 2.5;
    const maxCv = params['maxCv'] || 50;

    const deltaP = Math.max(0.1, P1 - P2);
    const travelNorm = openPct / 100;
    const effCv = maxCv * Math.pow(50, travelNorm - 1);
    const Q = effCv * 0.865 * Math.sqrt(deltaP);
    const sigmaC = (P1 - 0.23) / deltaP;
    const isCavitating = sigmaC < 1.5;

    metrics.push({ label: 'Effective Flow Coeff C_v', value: effCv.toFixed(1), unit: '', description: 'Equal-percentage throttling capacity' });
    metrics.push({ label: 'Flow Rate Q', value: Q.toFixed(1), unit: 'm³/h', description: 'Volumetric fluid throughput' });
    metrics.push({ label: 'Pressure Drop ΔP', value: deltaP.toFixed(2), unit: 'bar', description: 'Throttling differential across seat ring' });
    metrics.push({ label: 'Cavitation Index σ_c', value: sigmaC.toFixed(2), unit: '', description: 'Incipient cavitation safety threshold', status: isCavitating ? 'alert' : 'normal' });
  } else if (simulator.type === 'current_loop') {
    const pv = params['processPressure'] || 6.5;
    const Rwire = params['wireResistance'] || 25;
    const Rload = params['loadResistance'] || 250;
    const Vs = params['supplyVoltage'] || 24;

    const loopMa = 4 + 16 * (pv / 10);
    const I_amp = loopMa * 1e-3;
    const vWire = I_amp * Rwire;
    const vAdc = I_amp * Rload;
    const vTerm = Vs - vWire - vAdc;
    const margin = vTerm - 11.5;

    metrics.push({ label: 'Loop Current I_loop', value: loopMa.toFixed(2), unit: 'mA', description: 'Linear transmitter process signal (4–20 mA)' });
    metrics.push({ label: 'Transmitter Terminal V_term', value: vTerm.toFixed(2), unit: 'VDC', description: 'Available voltage at 2-wire transmitter', status: margin < 1.0 ? 'warning' : 'normal' });
    metrics.push({ label: 'DCS Input Signal V_adc', value: vAdc.toFixed(2), unit: 'VDC', description: 'Voltage drop across 250Ω precision burden' });
    metrics.push({ label: 'Compliance Margin', value: margin.toFixed(2), unit: 'V', description: 'Headroom above 11.5V min operating threshold' });
  } else if (simulator.type === 'orifice_meter') {
    const d = params['boreD'] || 60;
    const Q = params['flowRateQ'] || 45;
    const rho = params['fluidDensity'] || 1000;
    const D = 100;

    const beta = d / D;
    const A1 = (Math.PI / 4) * Math.pow(D / 1000, 2);
    const v1 = (Q / 3600) / A1;
    const Cd = 0.605;
    const deltaP_mbar = ((0.5 * rho * Math.pow(v1, 2) * (1 - Math.pow(beta, 4))) / (Math.pow(Cd, 2) * Math.pow(beta, 4))) / 100;

    metrics.push({ label: 'Beta Diameter Ratio β', value: beta.toFixed(3), unit: '', description: 'd/D restriction ratio (ISO 5167 recommended 0.2–0.75)' });
    metrics.push({ label: 'Differential Pressure ΔP', value: deltaP_mbar.toFixed(1), unit: 'mbar', description: 'Flange tap pressure difference across plate' });
    metrics.push({ label: 'Discharge Coefficient C_d', value: Cd.toFixed(3), unit: '', description: 'Empirical Stolz discharge calibration' });
    metrics.push({ label: 'Upstream Pipe Velocity', value: v1.toFixed(2), unit: 'm/s', description: 'Mean approach fluid velocity in 100mm line' });
  } else if (simulator.type === 'cstr') {
    const T0 = params['feedTemp'] || 300;
    const Tc = params['coolantTemp'] || 295;
    const F = params['flowRate'] || 15;
    const EaOverR = params['activationEnergy'] || 8000;
    const tau = 100 / F; // V = 100 L
    const k0 = 1.2e8 / 60; // s^-1
    // Steady state estimation
    const estT = Tc + 0.65 * (T0 - Tc) + 35;
    const kRate = k0 * Math.exp(-EaOverR / estT);
    const conv = (kRate * tau) / (1 + kRate * tau);
    const Da = kRate * tau;

    metrics.push({ label: 'Reactor Core Temp T', value: estT.toFixed(1), unit: 'K', description: 'Internal mixed bulk temperature' });
    metrics.push({ label: 'Reactant Conversion X_A', value: (conv * 100).toFixed(1), unit: '%', description: 'Fraction of reactant A converted to product' });
    metrics.push({ label: 'Reaction Rate r_A', value: (kRate * (1 - conv)).toFixed(3), unit: 'mol/(L·s)', description: 'Arrhenius kinetic reaction rate' });
    metrics.push({ label: 'Damköhler Number Da', value: Da.toFixed(2), unit: '', description: 'Reaction rate over mass convection rate' });
  } else if (simulator.type === 'pn_junction') {
    const Va = params['biasVoltage'] !== undefined ? params['biasVoltage'] : 0.60;
    const logNa = params['acceptorDoping'] || 16;
    const logNd = params['donorDoping'] || 16;
    const T = params['temp'] || 300;
    const vBi = 0.72 * (T / 300);
    const netBarrier = Math.max(0.04, vBi - Va);
    const wUm = 0.428 * Math.sqrt(netBarrier / vBi);
    const vt = 0.0259 * (T / 300);
    let currentMa = 0;
    if (Va > 0) {
      currentMa = Math.min(250, 1e-9 * Math.exp(Va / (1.15 * vt)) * 1e3);
    } else {
      currentMa = -1e-6;
    }
    const eMaxKvc = (2 * netBarrier / (wUm * 1e-4)) * 1e-3;

    metrics.push({ label: 'Forward Current I_D', value: currentMa < 0.01 ? '< 0.01' : currentMa.toFixed(2), unit: 'mA', description: 'Shockley minority carrier diffusion current' });
    metrics.push({ label: 'Depletion Width W', value: wUm.toFixed(3), unit: 'µm', description: 'Space charge barrier thickness' });
    metrics.push({ label: 'Effective Barrier Height', value: netBarrier.toFixed(2), unit: 'eV', description: 'Conduction band electron barrier' });
    metrics.push({ label: 'Peak Junction E-Field', value: eMaxKvc.toFixed(1), unit: 'kV/cm', description: 'Maximum electrostatic gradient at junction' });
  } else if (simulator.type === 'distillation_column') {
    const R = params['refluxRatio'] || 2.2;
    const zF = params['feedComposition'] || 0.45;
    const alpha = params['relativeVolatility'] || 2.4;
    const q = params['feedCondition'] || 1.0;
    const xD = 0.95;
    const xB = 0.05;
    const vleY = (x: number) => (alpha * x) / (1 + (alpha - 1) * x);
    let xq = zF;
    let yq = vleY(zF);
    if (Math.abs(q - 1.0) >= 0.01) {
      for (let testX = 0.05; testX <= 0.95; testX += 0.01) {
        const qY = (q / (q - 1)) * testX - zF / (q - 1);
        if (Math.abs(qY - vleY(testX)) < 0.03) {
          xq = testX;
          yq = vleY(testX);
          break;
        }
      }
    }
    const rMin = Math.max(0.2, (xD - yq) / Math.max(0.01, yq - xq));
    // Estimate theoretical stages
    let curX = xD;
    let curY = xD;
    let stageCount = 0;
    for (let s = 0; s < 30 && curX > xB; s++) {
      stageCount++;
      const nextX = Math.max(0.01, curY / (alpha - (alpha - 1) * curY));
      let nextY = curY;
      if (nextX >= xq) {
        nextY = (R / (R + 1)) * nextX + xD / (R + 1);
      } else {
        const slopeStrip = (yq - xB) / Math.max(0.001, xq - xB);
        nextY = xB + slopeStrip * (nextX - xB);
      }
      curX = nextX;
      curY = nextY;
    }
    const qReboiler = 125 * (R + 1) * 0.85;

    metrics.push({ label: 'Theoretical Stages N', value: stageCount.toString(), unit: 'trays', description: 'McCabe-Thiele equilibrium stages including reboiler' });
    metrics.push({ label: 'Min Reflux Ratio R_min', value: rMin.toFixed(2), unit: '', description: 'Pinch boundary infinite-tray reflux ratio' });
    metrics.push({ label: 'Distillate Purity xD', value: (xD * 100).toFixed(1), unit: '%', description: 'Overhead light key molar purity' });
    metrics.push({ label: 'Reboiler Heat Duty', value: qReboiler.toFixed(1), unit: 'kW', description: 'Thermal vapor boil-up duty required' });
  } else if (simulator.type === 'heat_exchanger') {
    const ThIn = params['hotInletTemp'] || 140;
    const TcIn = params['coldInletTemp'] || 25;
    const mh = params['hotFlowRate'] || 6.5;
    const mc = params['coldFlowRate'] || 10.0;
    const Ch = mh * 4.18;
    const Cc = mc * 4.18;
    const Cmin = Math.min(Ch, Cc);
    const Cmax = Math.max(Ch, Cc);
    const Cr = Cmin / Cmax;
    const UA = 28.0;
    const NTU = UA / Cmin;
    const expVal = Math.exp(-NTU * (1 - Cr));
    const eff = Cr === 1.0 ? NTU / (1 + NTU) : (1 - expVal) / (1 - Cr * expVal);
    const Q_kW = eff * Cmin * (ThIn - TcIn);
    const ThOut = ThIn - Q_kW / Ch;
    const TcOut = TcIn + Q_kW / Cc;

    metrics.push({ label: 'Heat Duty Q', value: (Q_kW / 1000).toFixed(2), unit: 'MW', description: 'Total thermal energy transferred across tube bundle' });
    metrics.push({ label: 'Effectiveness ε', value: (eff * 100).toFixed(1), unit: '%', description: 'Ratio of actual heat transfer to theoretical maximum' });
    metrics.push({ label: 'Hot Outlet Th,out', value: ThOut.toFixed(1), unit: '°C', description: 'Process fluid temperature exiting tubes' });
    metrics.push({ label: 'Cold Outlet Tc,out', value: TcOut.toFixed(1), unit: '°C', description: 'Cooling fluid temperature exiting shell nozzle' });
  } else if (simulator.type === 'gas_absorption') {
    const G = params['gasFlow'] || 18;
    const LG = params['liquidGasRatio'] || 2.8;
    const yIn = (params['inletGasConc'] || 8.0) / 100;
    const H = params['henryConstant'] || 1.2;
    const A = LG / H;
    const eff = Math.min(0.995, Math.max(0.4, (A - Math.pow(1 / A, 3)) / (A - Math.pow(1 / A, 4))));
    const yOut = yIn * (1 - eff);
    const NTU = Math.max(1.2, Math.log((yIn - 0) / Math.max(0.0001, yOut - 0)) * (A / Math.max(0.1, A - 1)));
    const HTU = 0.65;
    const packedHeightZ = NTU * HTU;
    const floodRatio = Math.min(1.2, (G / 38) * Math.sqrt(LG / 2.5) * 0.72);

    metrics.push({ label: 'Removal Efficiency η', value: (eff * 100).toFixed(1), unit: '%', description: 'Fraction of pollutant gas removed by solvent' });
    metrics.push({ label: 'Packed Bed Depth Z', value: packedHeightZ.toFixed(2), unit: 'm', description: 'Required depth of structured/random packing' });
    metrics.push({ label: 'Transfer Units NTU_OG', value: NTU.toFixed(2), unit: '', description: 'Dimensionless mass transfer difficulty' });
    metrics.push({ label: 'Flooding Limit Fraction', value: (floodRatio * 100).toFixed(0), unit: '%', description: 'Sherwood hydrodynamic flooding ratio', status: floodRatio >= 0.85 ? 'alert' : floodRatio >= 0.7 ? 'warning' : 'normal' });
  } else if (simulator.type === 'sic_switching') {
    const Vdc = params['busVoltage'] || 600;
    const IL = params['loadCurrent'] || 35;
    const Rg = params['gateResistance'] || 5;
    const Ls = params['strayInductance'] || 15;
    const Cgd = 45e-12;
    const Vplat = 5.2;
    const Vdrive = 18.0;
    const dvdt_Vns = Math.min(95, ((Vdrive - Vplat) / (Rg * Cgd)) * 1e-9 * 0.28);
    const didt_Ans = Math.min(8.0, (Vdrive - 3.5) / (Rg * 1.5));
    const Vpeak = Vdc + Ls * didt_Ans;
    const Eon_mJ = 0.5 * Vdc * IL * (35 / dvdt_Vns) * 1e-6 * 1000;
    const Eoff_mJ = 0.5 * Vdc * IL * (25 / dvdt_Vns) * 1e-6 * 1000;

    metrics.push({ label: 'Turn-On Loss E_on', value: Eon_mJ.toFixed(2), unit: 'mJ', description: 'Energy dissipated during switch-on interval' });
    metrics.push({ label: 'Turn-Off Loss E_off', value: Eoff_mJ.toFixed(2), unit: 'mJ', description: 'Energy dissipated during switch-off interval' });
    metrics.push({ label: 'Peak Slew Rate dv/dt', value: dvdt_Vns.toFixed(0), unit: 'V/ns', description: 'Drain voltage rate of fall/rise during transition' });
    metrics.push({ label: 'Peak Voltage Overshoot', value: Vpeak.toFixed(0), unit: 'V', description: 'Maximum inductive inductive drain spike (Vdc + Ls*di/dt)' });
  } else if (simulator.type === 'igbt_thermal') {
    const fsw = params['switchingFreq'] || 12;
    const Ic = params['collectorCurrent'] || 90;
    const D = params['dutyCycle'] || 0.55;
    const Rsa = params['heatsinkRth'] || 0.22;
    const Vce = 1.75;
    const Pcond = Vce * Ic * D;
    const Psw = (0.011 * (Ic / 90)) * (fsw * 1000);
    const Ptot = Pcond + Psw;
    const Rjc = 0.18;
    const Rcs = 0.08;
    const Ta = 40.0;
    const Ts = Ta + Ptot * Rsa;
    const Tc = Ts + Ptot * Rcs;
    const Tj = Tc + Ptot * Rjc;
    const margin = 175 - Tj;

    metrics.push({ label: 'Junction Temp Tj', value: Tj.toFixed(1), unit: '°C', description: 'Peak internal silicon active junction temperature', status: Tj > 175 ? 'alert' : Tj > 145 ? 'warning' : 'normal' });
    metrics.push({ label: 'Total Power Loss Ptot', value: Ptot.toFixed(0), unit: 'W', description: 'Combined conduction and switching loss heat generation' });
    metrics.push({ label: 'Case Temp Tc', value: Tc.toFixed(1), unit: '°C', description: 'Module copper baseplate contact temperature' });
    metrics.push({ label: 'SOA Safety Margin', value: margin.toFixed(1), unit: '°C', description: 'Headroom below 175°C maximum rating' });
  } else if (simulator.type === 'mosfet_channel') {
    const Vgs = params['gateVoltage'] !== undefined ? params['gateVoltage'] : 1.8;
    const Vds = Math.max(0, params['drainVoltage'] !== undefined ? params['drainVoltage'] : 1.2);
    const tox = params['oxideThickness'] || 3.2;
    const logNa = params['substrateDoping'] || 17;
    const phiF = 0.0259 * Math.log(Math.pow(10, logNa) / 1.5e10);
    const Cox = (3.9 * 8.854e-14) / (tox * 1e-7);
    const Vfb = -0.85;
    const gamma = Math.sqrt(2 * 11.7 * 8.854e-14 * 1.602e-19 * Math.pow(10, logNa)) / Cox;
    const Vth = Vfb + 2 * phiF + gamma * Math.sqrt(2 * phiF);
    const Voverdrive = Vgs - Vth;
    const isCutoff = Voverdrive <= 0;
    const Vds_sat = Math.max(0.01, Voverdrive);
    const isSaturation = !isCutoff && Vds >= Vds_sat;
    let Id_mA = 0;
    if (!isCutoff) {
      const beta = (380 * Cox * (10 / 0.5)) * 1e3;
      if (!isSaturation) {
        Id_mA = beta * (Voverdrive * Vds - (Vds * Vds) / 2);
      } else {
        Id_mA = 0.5 * beta * Math.pow(Voverdrive, 2);
      }
    }
    const Qinv = isCutoff ? 0 : Cox * Voverdrive * 1e6;

    metrics.push({ label: 'Drain Current ID', value: Id_mA.toFixed(2), unit: 'mA', description: 'Total carrier drift current through channel' });
    metrics.push({ label: 'Threshold Voltage Vth', value: Vth.toFixed(2), unit: 'V', description: 'Gate voltage required for strong surface inversion' });
    metrics.push({ label: 'Inversion Charge Qinv', value: Qinv.toFixed(2), unit: 'µC/cm²', description: 'Mobile 2D electron sheet density under oxide' });
    metrics.push({ label: 'Channel State', value: isCutoff ? 'Cutoff' : isSaturation ? 'Pinch-Off Saturation' : 'Linear Triode', unit: '', description: 'Operating regime along channel' });
  } else {
    simulator.parameters.slice(0, 4).forEach((p) => {
      metrics.push({ label: p.name, value: (params[p.id] || p.default).toString(), unit: p.unit, description: p.description });
    });
  }

  // Use worker-computed RK4 metrics when available, falling back smoothly to local metrics
  const effectiveMetrics = (workerMetrics && workerMetrics.length > 0) ? workerMetrics : metrics;

  // ---------------------------------------------------------------------------
  // 60 FPS VECTOR CANVAS RENDERER FOR ALL SIMULATOR TYPES
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localTime = timeRef.current;

    const render = () => {
      if (isRunning) {
        localTime += 0.016 * simSpeed;
        timeRef.current = localTime;
        // Step the Web Worker physics engine forward asynchronously
        if (mathWorkerRef.current) {
          mathWorkerRef.current.step(simulator.type, params, 0.016 * simSpeed, localTime);
        }
      }

      const w = canvas.width;
      const h = canvas.height;

      if (w < 20 || h < 20) {
        animRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      // Tech Grid Background
      ctx.fillStyle = '#060b13';
      ctx.fillRect(0, 0, w, h);

      if (showGrid) {
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
        ctx.lineWidth = 1;
        const gridSize = 32;
        for (let x = 0; x < w; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      }

      // Construct Unified High-Precision Render Context
      const dt = 0.016 * simSpeed;
      const rc = { ctx, w, h, dt, t: localTime };

      // Physical Acoustics Audio Engine Synchronization
      if (!isMuted && isRunning) {
        if (simulator.type === 'rlc') {
          physicsAudio.updateTone('rlc', params['frequency'] || 100, 0.4);
        } else if (simulator.type === 'three_phase') {
          physicsAudio.updateTone('three_phase', params['frequency'] || 50, 0.45);
        } else if (simulator.type === 'harmonic') {
          physicsAudio.updateTone('harmonic', (params['driveFreq'] || 1.33) * 70, 0.5);
        } else if (simulator.type === 'spur_gear') {
          physicsAudio.updateTone('spur_gear', (params['inputRpm'] || 600) / 4, 0.35);
        } else if (simulator.type === 'sallen_key') {
          physicsAudio.updateTone('sallen_key', params['testFreq'] || 1200, 0.25);
        } else if (simulator.type === 'buck_boost') {
          physicsAudio.updateTone('buck_boost', 240, 0.2);
        } else if (simulator.type === 'transmission_line') {
          physicsAudio.updateTone('transmission_line', 440, 0.2);
        } else if (simulator.type === 'sic_switching') {
          physicsAudio.updateTone('sic_switching', 600, 0.2);
        } else if (simulator.type === 'heat_exchanger') {
          physicsAudio.updateTone('heat_exchanger', 180, 0.15);
        } else if (simulator.type === 'distillation_column') {
          physicsAudio.updateTone('distillation_column', 220, 0.18);
        } else if (simulator.type === 'gas_absorption') {
          physicsAudio.updateTone('gas_absorption', 160, 0.15);
        } else if (simulator.type === 'igbt_thermal') {
          physicsAudio.updateTone('igbt_thermal', (params['switchingFreq'] || 12) * 25, 0.25);
        } else if (simulator.type === 'mosfet_channel') {
          physicsAudio.updateTone('mosfet_channel', 320, 0.2);
        } else {
          physicsAudio.updateTone('ambient', 120, 0.15);
        }
      } else {
        physicsAudio.stopAll();
      }

      // Render individual simulator types
      if (simulator.type === 'rlc') {
        renderRlcCircuit(rc, {
          resistance: params['resistance'] || 25,
          inductance: params['inductance'] || 60,
          capacitance: params['capacitance'] || 40,
          frequency: params['frequency'] || 100,
        });
      } else if (simulator.type === 'three_phase') {
        renderThreePhase(rc, {
          voltage: params['voltage'] || 230,
          frequency: params['frequency'] || 50,
          loadTorque: params['loadTorque'] || 45,
          excitationCurrent: params['excitationCurrent'] || 5,
        });
      } else if (simulator.type === 'buck_boost') {
        renderBuckBoost(rc, {
          dutyCycle: params['dutyCycle'] || 0.60,
          inputVoltage: params['inputVoltage'] || 12,
          switchingFreq: params['switchingFreq'] || 100,
          inductance: params['inductance'] || 120,
        });

      } else if (simulator.type === 'sallen_key') {
        renderSallenKey(rc, {
          cutoffFreq: params['cutoffFreq'] || 1500,
          qualityFactor: params['qualityFactor'] || 0.707,
          gain: params['gain'] || 1.0,
          testFreq: params['testFreq'] || 1200,
        });
      } else if (simulator.type === 'transmission_line') {
        renderTransmissionLine(rc, {
          loadImpedance: params['loadImpedance'] || 50,
          lineImpedance: params['lineImpedance'] || 50,
          frequency: params['frequency'] || 300,
        });

      } else if (simulator.type === 'four_bar') {
        renderFourBar(rc, {
          groundL: params['groundL'] || 130,
          crankR: params['crankR'] || 40,
          couplerL: params['couplerL'] || 120,
          rockerL: params['rockerL'] || 90,
          rpm: params['rpm'] || 20,
          couplerTracerHistory: couplerTracerRef.current,
        });
      } else if (simulator.type === 'harmonic') {
        renderHarmonicOscillator(rc, {
          mass: params['mass'] || 5,
          stiffness: params['stiffness'] || 350,
          dampingC: params['dampingC'] || 8,
          driveFreq: params['driveFreq'] || 1.33,
        });
      } else if (simulator.type === 'spur_gear') {
        renderSpurGear(rc, {
          moduleM: params['moduleM'] || 4,
          teethPinion: params['teethPinion'] || 18,
          teethGear: params['teethGear'] || 48,
          pressureAngle: params['pressureAngle'] || 20,
          inputRpm: params['inputRpm'] || 600,
        });
      } else if (simulator.type === 'rankine') {
        renderRankineCycle(rc, {
          boilerP: params['boilerP'] || 80,
          turbineInletT: params['turbineInletT'] || 480,
          condenserP: params['condenserP'] || 0.08,
          turbineEff: params['turbineEff'] || 85,
        });
      } else if (simulator.type === 'beam_deflection') {
        const spanL = params['span'] || 6.0;
        const pointP = params['pointLoad'] || 45;
        const loadPosA = params['loadPos'] || 3.0;
        const udlQ = params['udl'] || 12;
        const R_A = (pointP * (spanL - loadPosA) / spanL) + (udlQ * spanL / 2);
        const R_B = (pointP * loadPosA / spanL) + (udlQ * spanL / 2);
        const maxM = (pointP * loadPosA * (spanL - loadPosA) / spanL) + (udlQ * spanL * spanL / 8);
        const maxDelta = ((pointP * Math.pow(spanL, 3)) / (48 * 200e9 * 8.49e-5) + (5 * udlQ * 1000 * Math.pow(spanL, 4)) / (384 * 200e9 * 8.49e-5)) * 1000;
        const limitAisc = (spanL * 1000) / 360;
        renderBeamBending(rc, {
          lengthL: spanL,
          supportType: 'simply_supported',
          pointLoadP: pointP,
          pointLoadPos: loadPosA,
          udlQ: udlQ,
          elasticModulusE: 200,
          momentOfInertiaI: 8.49e-5,
          beamDepth: 250,
          reactionA: R_A,
          reactionB: R_B,
          maxDeflectionMm: maxDelta,
          maxMomentKnm: maxM,
          maxStressMpa: (maxM * 1000 * 0.125) / 8.49e-5 / 1e6,
          deflectionLimitAisc: limitAisc,
          isDeflectionPass: maxDelta <= limitAisc
        });
      } else if (simulator.type === 'truss') {
        const spanM = params['span'] || 24;
        const heightM = params['height'] || 4.5;
        const liveLoadP = params['liveLoad'] || 80;
        const deadLoadNode = params['deadLoad'] || 15;
        const truckFraction = ((localTime * 0.08) % 1.0);
        const rLeft = (liveLoadP * (1 - truckFraction)) + (deadLoadNode * 6 / 2);
        const rRight = (liveLoadP * truckFraction) + (deadLoadNode * 6 / 2);
        renderTrussAnalysis(rc, {
          trussType: 'warren',
          spanM,
          heightM,
          truckPosFraction: truckFraction,
          liveLoadP,
          deadLoadNode,
          materialYieldMpa: 250,
          members: [
            { id: 'T1', from: [0, 0], to: [4, 0], forceKn: 120, isTension: true, isZero: false, stressRatio: 0.45 },
            { id: 'T2', from: [4, 0], to: [8, 0], forceKn: 160, isTension: true, isZero: false, stressRatio: 0.62 },
            { id: 'T3', from: [8, 0], to: [12, 0], forceKn: 140, isTension: true, isZero: false, stressRatio: 0.55 },
            { id: 'C1', from: [2, 3], to: [6, 3], forceKn: -150, isTension: false, isZero: false, stressRatio: 0.58 },
            { id: 'C2', from: [6, 3], to: [10, 3], forceKn: -180, isTension: false, isZero: false, stressRatio: 0.70 },
            { id: 'D1', from: [0, 0], to: [2, 3], forceKn: -95, isTension: false, isZero: false, stressRatio: 0.40 },
            { id: 'D2', from: [4, 0], to: [2, 3], forceKn: 85, isTension: true, isZero: false, stressRatio: 0.35 }
          ],
          reactionLeftKn: rLeft,
          reactionRightKn: rRight,
          maxTensionKn: 160,
          maxCompressionKn: 180,
          eulerCriticalKn: 240
        });
      } else if (simulator.type === 'seismic') {
        const pgaG = params['pga'] || 0.45;
        const eqFreq = params['frequency'] || 1.8;
        const lrbDia = params['leadCore'] || 120;
        const dampingZeta = params['damping'] || 18;
        const maxDrift = pgaG * 14.2;
        const liveDrift = Math.abs(Math.sin(localTime * eqFreq * 2 * Math.PI)) * maxDrift;
        const sHist = seismicHistoryRef.current;
        sHist.shift();
        sHist.push(liveDrift);
        renderSeismicIsolation(rc, {
          systemType: 'isolated',
          pgaG,
          earthquakeFreqHz: eqFreq,
          soilStiffness: 'dense_soil',
          leadCoreDiameterMm: lrbDia,
          dampingRatioZeta: dampingZeta,
          timePeriodTn: 2.45,
          maxRoofDriftMm: maxDrift,
          baseShearVbKn: pgaG * 140,
          driftLimitAsce: 35,
          isDriftPass: maxDrift <= 35,
          seismicHistory: [],
          driftHistory: sHist
        });
      } else if (simulator.type === 'mohr_circle') {
        const sX = params['sigmaX'] || 140;
        const sY = params['sigmaY'] || 50;
        const tXy = params['tauXy'] || 35;
        const thetaDeg = params['theta'] || 35;
        const sAvg = (sX + sY) / 2;
        const radR = Math.sqrt(Math.pow((sX - sY) / 2, 2) + Math.pow(tXy, 2));
        renderMohrCircle(rc, {
          sigmaX: sX,
          sigmaY: sY,
          tauXy: tXy,
          cohesionC: 25,
          frictionAnglePhiDeg: 30,
          planeAngleThetaDeg: thetaDeg,
          sigmaAvg: sAvg,
          radiusR: radR,
          sigma1: sAvg + radR,
          sigma2: sAvg - radR,
          tauMax: radR,
          principalAngleDeg: (0.5 * Math.atan2(2 * tXy, sX - sY) * 180) / Math.PI,
          sigmaTheta: sAvg + ((sX - sY) / 2) * Math.cos(2 * thetaDeg * Math.PI / 180) + tXy * Math.sin(2 * thetaDeg * Math.PI / 180),
          tauTheta: -((sX - sY) / 2) * Math.sin(2 * thetaDeg * Math.PI / 180) + tXy * Math.cos(2 * thetaDeg * Math.PI / 180),
          factorOfSafety: 1.45,
          isShearFailure: false
        });
      } else if (simulator.type === 'pid') {
        renderPidLoop(rc, {
          setpoint: params['setpoint'] || 65,
          kp: params['kp'] || 2.4,
          ti: params['ti'] || 8.0,
          td: params['td'] || 0.5,
          disturbanceInflow: 10,
          pidState: pidStateRef.current
        });
      } else if (simulator.type === 'current_loop') {
        const pVal = params['pressure'] || 6.5;
        const lrv = params['lrv'] || 0;
        const urv = params['urv'] || 10;
        const frac = Math.max(0, Math.min(1, (pVal - lrv) / (urv - lrv)));
        const mA = 4.0 + 16.0 * frac;
        renderCurrentLoop(rc, {
          processPressure: pVal,
          lrv,
          urv,
          calculatedCurrent: mA,
          pressurePercent: frac * 100,
          wireResistance: 15,
          wireVoltage: (mA / 1000) * 15,
          loadResistance: 250,
          loadVoltage: (mA / 1000) * 250,
          supplyVoltage: 24,
          transmitterTerminalVoltage: 24 - (mA / 1000) * (250 + 15),
          isComplianceVoltageHealthy: true,
          hartActive: true,
          particles: loopParticlesRef.current,
          hartWavePhase: localTime * 20
        });
      } else if (simulator.type === 'control_valve') {
        const cOut = params['controllerOutput'] || 60;
        const inP = params['inletPressure'] || 6.0;
        const outP = params['outletPressure'] || 3.0;
        const dP = Math.max(0.1, inP - outP);
        const lift = cOut / 100;
        const cv = 50 * Math.pow(50, lift - 1);
        renderControlValve(rc, {
          controllerOutput: cOut,
          trimType: 'equal_pct',
          inletPressure: inP,
          outletPressure: outP,
          deltaP: dP,
          calculatedCv: cv,
          volumetricFlowRate: 0.865 * cv * Math.sqrt(dP),
          valveStemPos: lift,
          bubbleParticles: bubbleParticlesRef.current
        });
      } else if (simulator.type === 'orifice_meter') {
        const d_bore = params['boreD'] || 50;
        const d_pipe = params['pipeD'] || 100;
        const p_diff = params['diffPressure'] || 250;
        const beta = d_bore / d_pipe;
        renderOrificeFlow(rc, {
          pipeD: d_pipe,
          boreD: d_bore,
          beta,
          flowRateQ: 11.5,
          deltaP: p_diff,
          permLossRatio: 1 - beta,
          density: 1000,
          useSquareRoot: true,
          lowFlowCutoff: false,
          outputCurrent: 4 + 16 * Math.sqrt(p_diff / 500),
          particles: bubbleParticlesRef.current.map((b) => ({ x: b.x, y: b.y, speed: b.size }))
        });
      } else if (simulator.type === 'rtd_sensor') {
        const temp = params['temperature'] || 120;
        const rLead = params['leadResistance'] || 2.5;
        const rTrue = 100 * (1 + 0.00385 * temp);
        renderRtd(rc, {
          temperature: temp,
          wiringConfig: '3wire',
          leadResistance: rLead,
          trueRtdResistance: rTrue,
          measuredResistance: rTrue,
          leadWireErrorC: 0.0
        });
      } else if (simulator.type === 'fourier') {
        const harmonics = Math.round(params['harmonicsCount'] || 7);
        const f0 = params['fundamentalFreq'] || 50;
        const waveType = Math.round(params['waveformType'] || 0);
        const midY = h * 0.44;
        const plotW = w - 60;

        ctx.strokeStyle = 'rgba(236, 72, 153, 0.2)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(30, midY);
        ctx.lineTo(w - 30, midY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Composite waveform
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i <= plotW; i++) {
          const x = 30 + i;
          const tau = (i / plotW) * 4 * Math.PI + localTime * (f0 * 0.05);
          let sum = 0;

          for (let n = 1; n <= harmonics; n += 2) {
            if (waveType === 0) {
              sum += (4 / Math.PI) * (1 / n) * Math.sin(n * tau);
            } else if (waveType === 1) {
              const sign = ((n - 1) / 2) % 2 === 0 ? 1 : -1;
              sum += (8 / (Math.PI * Math.PI)) * sign * (1 / (n * n)) * Math.sin(n * tau);
            } else {
              sum += (2 / Math.PI) * (1 / n) * Math.sin(n * tau);
            }
          }

          const y = midY - sum * (h * 0.22);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // FFT Spectrum bars at bottom
        const specY = h - 35;
        const barW = Math.min(18, (w - 80) / harmonics);
        ctx.fillStyle = '#64748b';
        ctx.font = '9px "IBM Plex Mono", monospace';
        ctx.fillText('DISCRETE FOURIER HARMONIC SPECTRUM |C_n|', 30, specY - 30);

        for (let n = 1, idx = 0; n <= harmonics; n += 2, idx++) {
          const amp = waveType === 0 ? (4 / (Math.PI * n)) : (8 / (Math.PI * Math.PI * n * n));
          const barH = amp * 28;
          const bx = 30 + idx * (barW + 6);
          ctx.fillStyle = idx === 0 ? '#06b6d4' : '#ec4899';
          ctx.fillRect(bx, specY - barH, barW, barH);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '8px "IBM Plex Mono", monospace';
          ctx.fillText(`n=${n}`, bx, specY + 12);
        }

        ctx.font = 'bold 11px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#ec4899';
        ctx.fillText(`FOURIER SERIES SYNTHESIZER (N = ${harmonics} Harmonics | f0 = ${f0} Hz)`, 30, 24);
      } else if (simulator.type === 'cstr') {
        const Tc = params['coolantTemp'] || 295;
        const T0 = params['feedTemp'] || 300;
        const F = params['flowRate'] || 15;
        const estT = Tc + 0.65 * (T0 - Tc) + 35;
        const isRunaway = estT > 370;

        // Jacketed CSTR Vessel on Left
        const rX = w * 0.28;
        const rY = h * 0.52;
        const rW = 140;
        const rH = 180;

        // Cooling Jacket
        ctx.fillStyle = isRunaway ? 'rgba(239, 68, 68, 0.25)' : 'rgba(6, 182, 212, 0.2)';
        ctx.strokeStyle = isRunaway ? '#ef4444' : '#06b6d4';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(rX - rW / 2 - 16, rY - rH / 2 + 20, rW + 32, rH - 15, [0, 0, 30, 30]);
        ctx.fill();
        ctx.stroke();

        // Reactor Fluid
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(rX - rW / 2, rY - rH / 2, rW, rH, [18, 18, 26, 26]);
        ctx.clip();
        ctx.fillStyle = isRunaway ? 'rgba(239, 68, 68, 0.85)' : 'rgba(124, 58, 237, 0.75)';
        ctx.fillRect(rX - rW / 2, rY - rH / 2 + 22, rW, rH - 22);

        // Agitator vortex bubbles
        for (let b = 0; b < 24; b++) {
          const ang = localTime * 4 + b * 0.6;
          const rad = (rW * 0.35) * (0.3 + 0.7 * Math.sin(ang));
          const bx = rX + Math.cos(ang) * rad;
          const by = rY - rH / 2 + 40 + ((b * 15 + localTime * 30) % (rH - 60));
          ctx.fillStyle = b % 2 === 0 ? '#fbbf24' : '#c084fc';
          ctx.beginPath();
          ctx.arc(bx, by, 2.5, 0, 2 * Math.PI);
          ctx.fill();
        }
        ctx.restore();

        // Vessel wall
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(rX - rW / 2, rY - rH / 2, rW, rH, [18, 18, 26, 26]);
        ctx.stroke();

        // Agitator shaft and rotating turbine
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(rX, rY - rH / 2);
        ctx.lineTo(rX, rY + rH * 0.25);
        ctx.stroke();

        ctx.save();
        ctx.translate(rX, rY + rH * 0.25);
        ctx.rotate(localTime * 8);
        for (let i = 0; i < 4; i++) {
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos((i * Math.PI) / 2) * (rW * 0.32), Math.sin((i * Math.PI) / 2) * (rW * 0.32));
          ctx.stroke();
        }
        ctx.restore();

        // Right side: Van Heerden S-Curve
        const scX = w * 0.54;
        const scY = 40;
        const scW = w - scX - 30;
        const scH = h - 80;

        ctx.fillStyle = '#060a12';
        ctx.strokeStyle = '#1e293b';
        ctx.fillRect(scX, scY, scW, scH);
        ctx.strokeRect(scX, scY, scW, scH);

        ctx.font = '10px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#c084fc';
        ctx.fillText('VAN HEERDEN HEAT GENERATION Qg(T) vs REMOVAL Qr(T)', scX + 12, scY + 18);

        // Heat removal line
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(scX + 20, scY + scH - 25);
        ctx.lineTo(scX + scW - 20, scY + 35);
        ctx.stroke();

        // Heat generation S-curve
        ctx.strokeStyle = isRunaway ? '#ef4444' : '#a855f7';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i <= scW - 40; i++) {
          const normT = i / (scW - 40);
          const sSig = 1 / (1 + Math.exp(-10 * (normT - 0.45)));
          const px = scX + 20 + i;
          const py = scY + scH - 25 - sSig * (scH - 65);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        ctx.font = '11px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#a855f7';
        ctx.fillText(`CSTR REACTOR & VAN HEERDEN HEAT BALANCE (T = ${estT.toFixed(1)} K)`, 30, 24);
      } else if (simulator.type === 'pn_junction') {
        const Va = params['biasVoltage'] !== undefined ? params['biasVoltage'] : 0.60;
        const vBi = 0.72;
        const netBarrier = Math.max(0.04, vBi - Va);
        const depW = 75 * Math.sqrt(netBarrier / vBi);

        // Band diagram on left
        const bdX = 30;
        const bdY = 40;
        const bdW = w * 0.48;
        const bdH = h - 80;
        const jX = bdX + bdW / 2;

        ctx.fillStyle = '#060a12';
        ctx.strokeStyle = '#1e293b';
        ctx.fillRect(bdX, bdY, bdW, bdH);
        ctx.strokeRect(bdX, bdY, bdW, bdH);

        // Depletion zone
        ctx.fillStyle = 'rgba(30, 41, 59, 0.45)';
        ctx.fillRect(jX - depW / 2, bdY, depW, bdH);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(jX - depW / 2, bdY);
        ctx.lineTo(jX - depW / 2, bdY + bdH);
        ctx.moveTo(jX + depW / 2, bdY);
        ctx.lineTo(jX + depW / 2, bdY + bdH);
        ctx.stroke();
        ctx.setLineDash([]);

        // Energy band curves Ec & Ev
        const midY = bdY + bdH * 0.5;
        const egPix = 50;
        const deltaE = (netBarrier / vBi) * 35;

        // Ec (Sky)
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let x = bdX; x <= bdX + bdW; x++) {
          const bend = Math.tanh((x - jX) / (depW / 2));
          const y = (midY - egPix / 2) - bend * deltaE;
          if (x === bdX) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Ev (Indigo)
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let x = bdX; x <= bdX + bdW; x++) {
          const bend = Math.tanh((x - jX) / (depW / 2));
          const y = (midY + egPix / 2) - bend * deltaE;
          if (x === bdX) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Right side: Shockley I-V Curve
        const scX = w * 0.54;
        const scY = 40;
        const scW = w - scX - 30;
        const scH = h - 80;

        ctx.fillStyle = '#060a12';
        ctx.strokeStyle = '#1e293b';
        ctx.fillRect(scX, scY, scW, scH);
        ctx.strokeRect(scX, scY, scW, scH);

        const ivOriginX = scX + scW * 0.5;
        const ivOriginY = scY + scH * 0.7;

        ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(scX, ivOriginY);
        ctx.lineTo(scX + scW, ivOriginY);
        ctx.moveTo(ivOriginX, scY);
        ctx.lineTo(ivOriginX, scY + scH);
        ctx.stroke();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let vStep = -3.5; vStep <= 0.85; vStep += 0.05) {
          let curr = vStep > 0 ? 1e-6 * Math.exp(vStep / 0.035) : -0.2;
          const px = ivOriginX + vStep * (scW * 0.4);
          const py = ivOriginY - Math.max(-scH * 0.25, Math.min(scH * 0.65, curr * (scH * 0.4)));
          if (vStep === -3.5) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Operating dot
        const curDotX = ivOriginX + Va * (scW * 0.4);
        let curDotY = ivOriginY;
        if (Va > 0) curDotY -= Math.min(scH * 0.65, 1e-6 * Math.exp(Va / 0.035) * (scH * 0.4));
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(curDotX, curDotY, 5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.font = '11px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`P-N JUNCTION ENERGY BAND BENDING (V_a = ${Va >= 0 ? '+' : ''}${Va.toFixed(2)} V)`, 30, 24);
      } else if (simulator.type === 'distillation_column') {
        renderDistillationColumn(rc, {
          refluxRatio: params['refluxRatio'] || 2.2,
          feedComposition: params['feedComposition'] || 0.45,
          relativeVolatility: params['relativeVolatility'] || 2.4,
          feedCondition: params['feedCondition'] !== undefined ? params['feedCondition'] : 1.0,
        });
      } else if (simulator.type === 'heat_exchanger') {
        renderHeatExchanger(rc, {
          hotInletTemp: params['hotInletTemp'] || 140,
          coldInletTemp: params['coldInletTemp'] || 25,
          hotFlowRate: params['hotFlowRate'] || 6.5,
          coldFlowRate: params['coldFlowRate'] || 10.0,
        });
      } else if (simulator.type === 'gas_absorption') {
        renderGasAbsorption(rc, {
          gasFlow: params['gasFlow'] || 18,
          liquidGasRatio: params['liquidGasRatio'] || 2.8,
          inletGasConc: params['inletGasConc'] || 8.0,
          henryConstant: params['henryConstant'] || 1.2,
        });
      } else if (simulator.type === 'sic_switching') {
        renderSicSwitching(rc, {
          busVoltage: params['busVoltage'] || 600,
          loadCurrent: params['loadCurrent'] || 35,
          gateResistance: params['gateResistance'] || 5,
          strayInductance: params['strayInductance'] || 15,
        });
      } else if (simulator.type === 'igbt_thermal') {
        renderIgbtThermal(rc, {
          switchingFreq: params['switchingFreq'] || 12,
          collectorCurrent: params['collectorCurrent'] || 90,
          dutyCycle: params['dutyCycle'] || 0.55,
          heatsinkRth: params['heatsinkRth'] || 0.22,
        });
      } else if (simulator.type === 'mosfet_channel') {
        renderMosfetChannel(rc, {
          gateVoltage: params['gateVoltage'] !== undefined ? params['gateVoltage'] : 1.8,
          drainVoltage: params['drainVoltage'] !== undefined ? params['drainVoltage'] : 1.2,
          oxideThickness: params['oxideThickness'] || 3.2,
          substrateDoping: params['substrateDoping'] || 17,
        });
      } else {
        const midY = h * 0.5;
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let x = 30; x < w - 30; x++) {
          const t = localTime + ((x - 30) / (w - 60)) * 0.05;
          const y = midY - Math.sin(2 * Math.PI * 2 * t) * (h * 0.28);
          if (x === 30) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.font = '11px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#06b6d4';
        ctx.fillText(`${simulator.title} - Continuous Physics Active`, 40, 24);
      }

      // -----------------------------------------------------------------------
      // INTERACTIVE CANVAS PROBE RETICLE & PRECISION HUD
      // -----------------------------------------------------------------------
      if (probeCoord) {
        const px = probeCoord.x;
        const py = probeCoord.y;

        // Crosshair Lines
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, h);
        ctx.moveTo(0, py);
        ctx.lineTo(w, py);
        ctx.stroke();
        ctx.setLineDash([]);

        // Reticle Center
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.stroke();

        // Floating Precision Info Box
        const boxW = 150;
        const boxH = 44;
        const bx = Math.min(w - boxW - 8, Math.max(8, px + 14));
        const by = Math.min(h - boxH - 8, Math.max(8, py - 50));

        ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(bx, by, boxW, boxH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 9px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('CALIBRATED VECTOR PROBE', bx + 8, by + 14);

        ctx.font = '9px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`COORDS: (${Math.round(px)}px, ${Math.round(py)}px)`, bx + 8, by + 26);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`TIME: ${localTime.toFixed(2)}s | 60 FPS`, bx + 8, by + 38);
      }

      // -----------------------------------------------------------------------
      // CRT PHOSPHOR GLOW DECAY & SCANLINE RASTER
      // -----------------------------------------------------------------------
      if (isCrtMode) {
        ctx.save();
        // Faint cathode ray scanlines
        ctx.fillStyle = 'rgba(0, 255, 65, 0.032)';
        for (let y = 0; y < h; y += 4) {
          ctx.fillRect(0, y, w, 1.5);
        }

        // Phosphor vignette curvature
        const grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.72);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(1, 'rgba(4, 32, 14, 0.42)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // CRT Phosphor HUD status watermark
        ctx.font = 'bold 9px "IBM Plex Mono", monospace';
        ctx.fillStyle = '#4ade80';
        ctx.fillText('CRT P31 PHOSPHOR GLOW [PERSISTENCE: 240ms | 60Hz CALIBRATED]', 12, h - 12);
        ctx.restore();
      }

      // -----------------------------------------------------------------------
      // DUAL-CURSOR SCOPE MEASUREMENT BARS (T1, T2, Δt, f=1/Δt, ΔV)
      // -----------------------------------------------------------------------
      if (showDualCursors) {
        const c1X = Math.round(w * cursor1Ratio);
        const c2X = Math.round(w * cursor2Ratio);
        const deltaRatio = Math.abs(cursor2Ratio - cursor1Ratio);
        // Calibrated horizontal timebase: 20.0ms full-scale sweep
        const dtMs = deltaRatio * 20.0;
        const dtSec = Math.max(0.00001, dtMs / 1000);
        const freqHz = 1 / dtSec;
        // Calibrated vertical amplitude estimate
        const vScale = params['busVoltage'] || params['amplitude'] || params['inletGasConc'] || 230;
        const dvEstimate = (deltaRatio * vScale * 1.414).toFixed(1);

        ctx.save();

        // Cursor 1 (T1 - Cyan / CRT Phosphor)
        ctx.strokeStyle = isCrtMode ? '#4ade80' : '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(c1X, 0);
        ctx.lineTo(c1X, h);
        ctx.stroke();

        // T1 Top Handle Tag
        ctx.fillStyle = isCrtMode ? 'rgba(74, 222, 128, 0.25)' : 'rgba(6, 182, 212, 0.25)';
        ctx.strokeStyle = isCrtMode ? '#4ade80' : '#06b6d4';
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.roundRect(c1X - 16, 28, 32, 16, 4);
        ctx.fill();
        ctx.stroke();
        ctx.font = 'bold 9px "IBM Plex Mono", monospace';
        ctx.fillStyle = isCrtMode ? '#4ade80' : '#38bdf8';
        ctx.textAlign = 'center';
        ctx.fillText('T1', c1X, 40);

        // Cursor 2 (T2 - Amber / CRT Bright Phosphor)
        ctx.strokeStyle = isCrtMode ? '#86efac' : '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(c2X, 0);
        ctx.lineTo(c2X, h);
        ctx.stroke();

        // T2 Top Handle Tag
        ctx.fillStyle = isCrtMode ? 'rgba(134, 239, 172, 0.25)' : 'rgba(245, 158, 11, 0.25)';
        ctx.strokeStyle = isCrtMode ? '#86efac' : '#f59e0b';
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.roundRect(c2X - 16, 28, 32, 16, 4);
        ctx.fill();
        ctx.stroke();
        ctx.font = 'bold 9px "IBM Plex Mono", monospace';
        ctx.fillStyle = isCrtMode ? '#86efac' : '#fbbf24';
        ctx.textAlign = 'center';
        ctx.fillText('T2', c2X, 40);

        // Horizontal connecting measurement line
        const barY = 52;
        ctx.strokeStyle = isCrtMode ? 'rgba(74, 222, 128, 0.6)' : 'rgba(148, 163, 184, 0.6)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(c1X, barY);
        ctx.lineTo(c2X, barY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Floating Precision Scope Measurement Banner
        const hudW = Math.min(440, w - 24);
        const hudH = 34;
        const hudX = Math.max(12, (w - hudW) / 2);
        const hudY = 10;

        ctx.fillStyle = 'rgba(3, 7, 18, 0.92)';
        ctx.strokeStyle = isCrtMode ? '#22c55e' : '#0284c7';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(hudX, hudY, hudW, hudH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.font = 'bold 10px "IBM Plex Mono", monospace';
        ctx.fillStyle = isCrtMode ? '#4ade80' : '#38bdf8';
        ctx.fillText(`Δt = ${dtMs.toFixed(2)} ms`, hudX + 12, hudY + 21);

        ctx.fillStyle = isCrtMode ? '#86efac' : '#fbbf24';
        ctx.fillText(`f = ${freqHz.toFixed(1)} Hz`, hudX + 124, hudY + 21);

        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`ΔV ≈ ${dvEstimate} V`, hudX + 228, hudY + 21);

        ctx.font = '8px "IBM Plex Mono", monospace';
        ctx.fillStyle = isCrtMode ? '#16a34a' : '#64748b';
        ctx.fillText('DRAG T1/T2 TO MEASURE', hudX + 322, hudY + 21);

        ctx.restore();
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      physicsAudio.stopAll();
    };
  }, [simulator, isRunning, simSpeed, params, showGrid, isMuted, probeCoord, showDualCursors, cursor1Ratio, cursor2Ratio, isCrtMode]);

  // Peer simulators in same department
  const peerSimulators = ALL_AVAILABLE_SIMULATORS.filter(
    (s) => s.discipline === simulator.discipline && s.id !== simulator.id
  );

  return (
    <div className="h-full w-full max-h-full flex flex-col bg-[#080d16] text-slate-100 overflow-hidden select-none">
      {/* 1. Sleek, Compact Navigation & Action Header (h-12 / ~48px) */}
      <header className="h-12 px-3 sm:px-5 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 z-30 shadow-md">
        {/* Left: Breadcrumbs & Title */}
        {isEmbed ? (
          <div className="flex items-center gap-2 min-w-0">
            <a
              href="https://livesimulators.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-mono font-bold text-xs text-white hover:text-cyan-300 transition-colors shrink-0"
              title="Visit LiveSimulators.com"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent font-extrabold">
                LiveSimulators
              </span>
            </a>
            <span className="text-slate-700">|</span>
            <h1 className="truncate text-xs font-bold text-slate-200 m-0 p-0 leading-none">
              {simulator.title}
            </h1>
            <a
              href={`https://livesimulators.com/simulator/${simulator.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-mono font-bold transition-all shrink-0 ml-1"
              title="Open full interactive lab on LiveSimulators.com in a new tab"
            >
              <span>Full Lab</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 min-w-0">
            {onBackToHome && (
              <>
                <button
                  onClick={onBackToHome}
                  className="hover:text-cyan-400 transition-colors shrink-0 hidden xs:inline"
                  title="Return to home page"
                >
                  Home
                </button>
                <span className="text-slate-600 shrink-0 hidden xs:inline">/</span>
              </>
            )}
            {onBackToDepartment && (
              <>
                <button
                  onClick={() => onBackToDepartment(simulator.discipline)}
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1 font-bold text-slate-300 shrink-0"
                  title={`Return to ${simulator.disciplineName}`}
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span className="hidden sm:inline">{simulator.disciplineName}</span>
                  <span className="sm:hidden">{simulator.badge}</span>
                </button>
                <span className="text-slate-600 shrink-0">/</span>
              </>
            )}

            {/* Current Simulator Title with Peer Switcher Popover */}
            <div className="relative shrink min-w-0">
              <button
                onClick={() => setPeerDropdownOpen(!peerDropdownOpen)}
                className="flex items-center gap-1.5 text-cyan-300 font-bold hover:text-cyan-200 transition-colors bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800 text-xs truncate"
                title="Switch to another simulator in this department"
              >
                <h1 className="truncate text-xs font-bold text-cyan-300 m-0 p-0 inline leading-none">
                  {simulator.title}
                </h1>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* Peer Switcher Dropdown */}
              {peerDropdownOpen && onSelectSimulator && (
                <div className="absolute left-0 top-full mt-1 w-72 sm:w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-slate-800 mb-1">
                    Switch Simulator ({simulator.disciplineName}):
                  </div>
                  <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                    {peerSimulators.map((peer) => (
                      <button
                        key={peer.id}
                        onClick={() => onSelectSimulator(peer)}
                        className="w-full text-left p-2 rounded-xl hover:bg-slate-800 transition-colors flex items-start gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white truncate">{peer.title}</div>
                          <div className="text-[10px] font-mono text-slate-400">{peer.badge} • {peer.difficulty}</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right: Laboratory Controls Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
              isRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
            title={isRunning ? 'Pause physics engine' : 'Run physics engine'}
          >
            {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span className="hidden md:inline">{isRunning ? 'Pause' : 'Run'}</span>
          </button>

          {/* Simulation Speed */}
          <div className="hidden sm:flex items-center gap-0.5 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            {[0.5, 1.0, 2.0].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold transition-colors ${
                  simSpeed === spd
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Guided Lab Experiments Modal Button */}
          <button
            onClick={() => setShowExperimentsModal(true)}
            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
            title="Open guided physics experiments and laboratory challenges"
          >
            <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Guided Labs</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono">
              {(SIMULATOR_EXPERIMENTS[simulator.type] || []).length}
            </span>
          </button>

          {/* Acoustic Audio Toggle */}
          <button
            onClick={() => {
              const newMuted = physicsAudio.toggleMute();
              setIsMuted(newMuted);
            }}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              !isMuted
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title={!isMuted ? 'Acoustic feedback enabled' : 'Unmute realistic physics acoustics'}
          >
            {!isMuted ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Dual-Cursor Scope Toggle */}
          <button
            onClick={() => setShowDualCursors(!showDualCursors)}
            className={`px-2 py-1 rounded-lg border text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              showDualCursors
                ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle interactive dual-cursor scope measurement (Δt, f, ΔV)"
          >
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Scope Cursors</span>
          </button>

          {/* CRT Phosphor Glow Mode Toggle */}
          <button
            onClick={toggleCrtMode}
            className={`px-2 py-1 rounded-lg border text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              isCrtMode
                ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle authentic CRT green phosphor glow & scanline raster"
          >
            <Tv className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">CRT Mode</span>
          </button>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded-lg border text-xs transition-colors hidden sm:block ${
              showGrid ? 'bg-slate-800 border-slate-700 text-cyan-400' : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
            title="Toggle background grid"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {/* Reset Parameters */}
          <button
            onClick={handleResetDefaults}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Reset parameters to default"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* Capture PNG */}
          <button
            onClick={handleSnapshot}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors hidden xs:block"
            title="Capture canvas PNG image"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors hidden sm:block"
            title="Export telemetry CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Workbench'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-cyan-400" /> : <Maximize2 className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {/* LMS Embed Modal Button */}
          <button
            onClick={() => setShowEmbedModal(true)}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/50 text-xs text-purple-300 hover:text-white transition-all flex items-center gap-1"
            title="Embed this interactive simulator in Canvas, Moodle, Blackboard, or LMS"
          >
            <Code className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden lg:inline">Embed in LMS</span>
          </button>

          {/* Share with Multi-Network Menu */}
          <div className="relative">
            <button
              onClick={() => setShareMenuOpen(!shareMenuOpen)}
              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-1"
              aria-expanded={shareMenuOpen}
              title="Share simulation"
            >
              <Share2 className="w-3 h-3 text-sky-400" />
              <span className="hidden md:inline">{copiedLink ? 'Copied' : 'Share'}</span>
              <ChevronDown className="w-2.5 h-2.5 text-slate-500 hidden sm:inline" />
            </button>

            {shareMenuOpen && (
              <div 
                className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-slate-900/95 border border-slate-700 shadow-2xl p-1 z-50 font-sans text-xs animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setShowEmbedModal(true);
                    setShareMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-200 hover:bg-purple-950/50 hover:text-purple-300 transition-colors text-left"
                >
                  <span>Embed in LMS (iFrame)</span>
                  <Code className="w-3.5 h-3.5 text-purple-400" />
                </button>
                <button
                  onClick={() => {
                    handleCopyLink();
                    setShareMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-cyan-300 transition-colors text-left"
                >
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                  <CheckCircle2 className={`w-3 h-3 ${copiedLink ? 'text-emerald-400' : 'text-slate-500'}`} />
                </button>
                <button
                  onClick={() => handleSocialShare('linkedin')}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-blue-300 transition-colors text-left"
                >
                  <span>LinkedIn</span>
                  <span className="text-[10px] font-mono text-blue-400 font-bold">in</span>
                </button>
                <button
                  onClick={() => handleSocialShare('twitter')}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-sky-300 transition-colors text-left"
                >
                  <span>X (Twitter)</span>
                  <span className="text-[10px] font-mono text-sky-400 font-bold">𝕏</span>
                </button>
                {typeof navigator !== 'undefined' && !!(navigator as any).share && (
                  <button
                    onClick={() => handleSocialShare('web_share')}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-cyan-300 transition-colors text-left border-t border-slate-800/80 mt-1 pt-1.5"
                  >
                    <span>More Options...</span>
                    <Share2 className="w-3 h-3 text-slate-400" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Snapshot Toast notification */}
      {snapshotToast && (
        <div className="fixed top-14 right-4 z-50 px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-1.5 animate-bounce">
          <Camera className="w-3.5 h-3.5" />
          <span>Canvas PNG captured!</span>
        </div>
      )}

      {/* 2. Compact Benchmark Presets & Standards Strip (h-9 / ~36px shrink-0) */}
      <div className="px-3 sm:px-5 py-1 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between gap-2 shrink-0 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">Benchmarks:</span>
          </span>
          {simulator.presetNames?.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset.values)}
              className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-[11px] font-semibold text-slate-300 hover:text-cyan-300 transition-colors whitespace-nowrap"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0 text-[11px] font-mono">
          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            <span className="hidden md:inline">{simulator.standardReference || simulator.badge}</span>
            <span className="md:hidden">100% Physics</span>
          </span>
        </div>
      </div>

      {/* Mobile-only Segmented Control (< lg) */}
      <div className="lg:hidden flex items-center bg-slate-950 border-b border-slate-800 p-1 shrink-0">
        <button
          onClick={() => setMobileTab('workbench')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
            mobileTab === 'workbench'
              ? 'bg-cyan-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Simulation Canvas
        </button>
        <button
          onClick={() => setMobileTab('parameters')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
            mobileTab === 'parameters'
              ? 'bg-cyan-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Parameters ({simulator.parameters.length})
        </button>
        <button
          onClick={() => setMobileTab('analysis')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
            mobileTab === 'analysis'
              ? 'bg-cyan-500 text-slate-950 shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Telemetry & Theory
        </button>
      </div>

      {/* 3. Main Workbench Workspace (Fits 100% of remaining screen height) */}
      <main className="flex-1 min-h-0 w-full p-2 sm:p-3 overflow-hidden">
        <div className="h-full w-full grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 overflow-hidden">
          {/* LEFT DESK: Parameter Control Desk (Desktop: 4 cols, Mobile: conditioned on mobileTab) */}
          <div
            className={`lg:col-span-4 xl:col-span-3 h-full flex flex-col min-h-0 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-xl overflow-hidden ${
              mobileTab === 'parameters' ? 'block' : 'hidden lg:flex'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
              <h2 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider font-mono">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Parameter Desk</span>
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300">
                Live Sliders
              </span>
            </div>

            {/* Scrollable Parameter List */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 pt-2 space-y-2.5 custom-scrollbar">
              {simulator.parameters.map((p) => {
                const val = params[p.id] ?? p.default;
                return (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-1.5 shadow-inner"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 truncate pr-2">
                        {p.name} <span className="font-mono text-cyan-400 text-[11px]">({p.symbol})</span>
                      </span>
                      <span className="font-mono text-cyan-300 font-bold bg-slate-900 px-2 py-0.5 rounded text-xs shrink-0 border border-slate-800">
                        {val} {p.unit}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleParamChange(
                            p.id,
                            Math.max(p.min, parseFloat((val - p.step).toFixed(3)))
                          )
                        }
                        className="w-6 h-6 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold flex items-center justify-center text-xs shrink-0 transition-colors"
                        title="Nudge decrement"
                      >
                        –
                      </button>

                      <input
                        type="range"
                        id={`param-slider-${p.id}`}
                        min={p.min}
                        max={p.max}
                        step={p.step}
                        value={val}
                        onChange={(e) => handleParamChange(p.id, parseFloat(e.target.value))}
                        className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        aria-label={`${p.name} (${p.symbol}) in ${p.unit}`}
                        aria-valuenow={val}
                        aria-valuemin={p.min}
                        aria-valuemax={p.max}
                        aria-valuetext={`${val} ${p.unit}`}
                      />

                      <button
                        onClick={() =>
                          handleParamChange(
                            p.id,
                            Math.min(p.max, parseFloat((val + p.step).toFixed(3)))
                          )
                        }
                        className="w-6 h-6 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold flex items-center justify-center text-xs shrink-0 transition-colors"
                        title="Nudge increment"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>{p.min}</span>
                      <span className="truncate max-w-[140px] text-slate-400" title={p.description}>
                        {p.description}
                      </span>
                      <span>{p.max}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT DESK: 60 FPS Interactive Canvas & Telemetry Desk (Desktop: 8-9 cols, Mobile: workbench/analysis) */}
          <div
            className={`lg:col-span-8 xl:col-span-9 h-full flex flex-col min-h-0 gap-2.5 overflow-hidden ${
              mobileTab === 'parameters' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Upper: Interactive Vector Canvas Stage (Takes flexible remaining height) */}
            <div
              className={`flex-1 min-h-0 relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden flex flex-col shadow-xl ${
                mobileTab === 'analysis' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              {/* Canvas Header Strip */}
              <div className="h-6 px-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-slate-400 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span>60 FPS FIRST-PRINCIPLES SOLVER</span>
                  </span>
                  <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-slate-500">
                    <Crosshair className="w-3 h-3 text-cyan-400" />
                    <span>Interactive Probe: Hover canvas</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {!isMuted && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                      <Volume2 className="w-3 h-3" />
                      <span>Audio Active</span>
                    </span>
                  )}
                  <span className="truncate max-w-[200px] sm:max-w-none text-slate-400">
                    {simulator.physicalLaw}
                  </span>
                </div>
              </div>

              {/* Dynamic Resizing Canvas Wrapper */}
              <div
                ref={canvasContainerRef}
                className={`flex-1 min-h-0 relative w-full h-full transition-colors duration-300 ${
                  isCrtMode ? 'bg-[#021006] shadow-[inset_0_0_80px_rgba(34,197,94,0.12)]' : 'bg-[#060b13]'
                }`}
              >
                <canvas
                  ref={canvasRef}
                  width={1200}
                  height={675}
                  style={{ aspectRatio: '16 / 9' }}
                  className="interactive-canvas w-full h-full block absolute inset-0 cursor-crosshair touch-none aspect-[16/9]"
                  onMouseDown={(e) => {
                    if (showDualCursors) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const c1X = rect.width * cursor1Ratio;
                      const c2X = rect.width * cursor2Ratio;
                      if (Math.abs(x - c1X) <= 18) {
                        draggingCursorRef.current = 'c1';
                      } else if (Math.abs(x - c2X) <= 18) {
                        draggingCursorRef.current = 'c2';
                      }
                    }
                  }}
                  onMouseUp={() => {
                    draggingCursorRef.current = null;
                  }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    if (showDualCursors && draggingCursorRef.current === 'c1') {
                      const r = Math.max(0.02, Math.min(cursor2Ratio - 0.03, x / rect.width));
                      setCursor1Ratio(r);
                    } else if (showDualCursors && draggingCursorRef.current === 'c2') {
                      const r = Math.max(cursor1Ratio + 0.03, Math.min(0.98, x / rect.width));
                      setCursor2Ratio(r);
                    } else {
                      setProbeCoord({ x, y });
                    }
                  }}
                  onMouseLeave={() => {
                    draggingCursorRef.current = null;
                    setProbeCoord(null);
                  }}
                  onTouchStart={(e) => {
                    if (e.touches.length > 0) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.touches[0].clientX - rect.left;
                      const y = e.touches[0].clientY - rect.top;
                      if (showDualCursors) {
                        const c1X = rect.width * cursor1Ratio;
                        const c2X = rect.width * cursor2Ratio;
                        if (Math.abs(x - c1X) <= 22) {
                          draggingCursorRef.current = 'c1';
                        } else if (Math.abs(x - c2X) <= 22) {
                          draggingCursorRef.current = 'c2';
                        }
                      }
                      setProbeCoord({ x, y });
                    }
                  }}
                  onTouchMove={(e) => {
                    if (e.touches.length > 0) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.touches[0].clientX - rect.left;
                      const y = e.touches[0].clientY - rect.top;
                      if (showDualCursors && draggingCursorRef.current === 'c1') {
                        const r = Math.max(0.02, Math.min(cursor2Ratio - 0.03, x / rect.width));
                        setCursor1Ratio(r);
                      } else if (showDualCursors && draggingCursorRef.current === 'c2') {
                        const r = Math.max(cursor1Ratio + 0.03, Math.min(0.98, x / rect.width));
                        setCursor2Ratio(r);
                      } else {
                        setProbeCoord({ x, y });
                      }
                    }
                  }}
                  onTouchEnd={() => {
                    draggingCursorRef.current = null;
                    setProbeCoord(null);
                  }}
                />
              </div>
            </div>

            {/* Live Result & "Want to see why it happened?" Hub Card */}
            <WhyItHappenedCard
              simulatorType={simulator.type}
              parameters={params}
              onApplyParameters={handleApplyPreset}
            />

            {/* Lower: Telemetry & Analysis Console with Native HTML <details> and <summary> for SEO & LLM discovery */}
            <div
              className={`shrink-0 bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 sm:p-3 flex flex-col min-h-0 shadow-lg ${
                mobileTab === 'workbench'
                  ? 'h-44 sm:h-48 lg:h-56 xl:h-64'
                  : mobileTab === 'analysis'
                  ? 'flex-1 h-full'
                  : 'h-52 lg:h-60'
              }`}
            >
              {/* Quick Navigation Strip */}
              <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto custom-scrollbar text-xs">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider hidden sm:inline">
                    Jump:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('details-equations') as HTMLDetailsElement | null;
                      if (el) { el.open = true; el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[11px] font-bold flex items-center gap-1 transition-colors shrink-0"
                  >
                    <BookOpen className="w-3 h-3 text-cyan-400" />
                    <span>Equations</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('details-standards') as HTMLDetailsElement | null;
                      if (el) { el.open = true; el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono text-[11px] font-bold flex items-center gap-1 transition-colors shrink-0"
                  >
                    <Award className="w-3 h-3 text-emerald-400" />
                    <span>Standards</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('details-theory') as HTMLDetailsElement | null;
                      if (el) { el.open = true; el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono text-[11px] font-bold flex items-center gap-1 transition-colors shrink-0"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Theory</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('details-curriculum') as HTMLDetailsElement | null;
                      if (el) { el.open = true; el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-purple-300 font-mono text-[11px] font-bold flex items-center gap-1 transition-colors shrink-0"
                  >
                    <GraduationCap className="w-3 h-3 text-purple-400" />
                    <span>Curriculum</span>
                  </button>
                </div>

                <span className="text-[10px] font-mono text-cyan-400 font-bold hidden md:inline-flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>CRAWLER-DISCOVERABLE DOM</span>
                </span>
              </div>

              {/* Scrollable Container with Always-Rendered Native <details> and <summary> */}
              <div className="flex-1 min-h-0 overflow-y-auto pt-2 custom-scrollbar space-y-2.5">
                {/* 1. Real-Time Telemetry Readouts (Always in DOM) */}
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-cyan-400" />
                    <span>Live 60 FPS Telemetry Readouts</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {effectiveMetrics.map((m, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between shadow-inner"
                      >
                        <span className="text-[10px] font-mono text-slate-400 truncate">
                          {m.label}
                        </span>
                        <div className="my-0.5 flex items-baseline gap-1">
                          <span
                            className={`text-base sm:text-lg xl:text-xl font-mono font-black ${
                              m.status === 'alert'
                                ? 'text-rose-400'
                                : m.status === 'warning'
                                ? 'text-amber-400'
                                : 'text-cyan-300'
                            }`}
                          >
                            {m.value}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">
                            {m.unit}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-500 truncate" title={m.description}>
                          {m.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Governing Equations & Mathematical Formulation (Native <details> & <summary>) */}
                <details
                  id="details-equations"
                  open
                  className="group rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden transition-all"
                >
                  <summary className="px-3 py-2 text-xs font-mono font-bold text-cyan-300 flex items-center justify-between bg-slate-900/90 hover:bg-slate-800/80 cursor-pointer select-none">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Governing Equations &amp; Mathematical Formulation</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="p-3 border-t border-slate-800/80 space-y-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        Governing Formulation ({simulator.physicalLaw}):
                      </div>
                      <div className="my-1.5 text-cyan-300 py-1 overflow-x-auto">
                        <MathView math={simulator.governingEquation} block />
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        {simulator.equationDescription}
                      </p>
                    </div>

                    {simulator.analyticalProof && (
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-cyan-900/40 space-y-1.5">
                        <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Analytical First-Principles Proof &amp; Derivation:</span>
                        </div>
                        <p className="text-slate-200 text-xs leading-relaxed">
                          {simulator.analyticalProof}
                        </p>
                      </div>
                    )}

                    {simulator.validationTest && (
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-emerald-900/40 space-y-1.5">
                        <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Numerical Validation Benchmark (Error &lt; 0.2%):</span>
                        </div>
                        <p className="text-slate-300 text-xs leading-relaxed font-mono">
                          {simulator.validationTest}
                        </p>
                      </div>
                    )}
                  </div>
                </details>

                {/* 3. Referenced Engineering Standards & Compliance (Native <details> & <summary>) */}
                <details
                  id="details-standards"
                  open
                  className="group rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden transition-all"
                >
                  <summary className="px-3 py-2 text-xs font-mono font-bold text-emerald-300 flex items-center justify-between bg-slate-900/90 hover:bg-slate-800/80 cursor-pointer select-none">
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Referenced Engineering Standards &amp; Verification</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="p-3 border-t border-slate-800/80 space-y-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/60 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-mono font-bold text-white text-xs">
                            Standard: {simulator.standardReference || simulator.badge}
                          </div>
                          <div className="text-[11px] text-emerald-300/80 mt-0.5">
                            Published By (Reference): {simulator.standardBody || 'ISO / IEC / IEEE / AISC'}
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-900/60 border border-emerald-700/60 text-[10px] font-mono font-bold text-emerald-300 uppercase shrink-0">
                        Reference Model
                      </span>
                    </div>

                    {simulator.colorStandardRule && (
                      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                        <div className="text-[10px] font-mono text-slate-400 uppercase">
                          Standard Waveform &amp; Color Topology:
                        </div>
                        <p className="text-slate-300 text-xs font-mono">
                          {simulator.colorStandardRule}
                        </p>
                      </div>
                    )}

                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2 text-[10px] text-slate-400 font-sans">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        <strong className="text-slate-200">Reference Standards Notice:</strong> Mathematical formulations reference published engineering literature and fundamental physical laws for educational exploration. LiveSimulators is an independent educational platform and is not endorsed by, affiliated with, certified by, or officially linked with any international standards organization.
                      </span>
                    </div>
                  </div>
                </details>

                {/* 4. Engineering Theory & Physical Law (Native <details> & <summary>) */}
                <details
                  id="details-theory"
                  open
                  className="group rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden transition-all"
                >
                  <summary className="px-3 py-2 text-xs font-mono font-bold text-amber-300 flex items-center justify-between bg-slate-900/90 hover:bg-slate-800/80 cursor-pointer select-none">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Engineering Theory, Physical Law &amp; Field Rules</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="p-3 border-t border-slate-800/80 space-y-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                      <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold flex items-center gap-1">
                        <Info className="w-3.5 h-3.5" />
                        <span>Physical Principle &amp; Operating Mechanism:</span>
                      </div>
                      <p className="text-slate-200 text-xs leading-relaxed">
                        {simulator.description}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-cyan-500/30 space-y-1.5">
                      <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Live Machine State Evaluation:</span>
                      </div>
                      <p className="text-slate-200 text-xs leading-relaxed">
                        {getDynamicPhysicsExplanation(simulator.type, params)}
                      </p>
                    </div>

                    {simulator.fieldInsights && (
                      <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/50 space-y-1.5">
                        <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>Industrial Field Engineering Rules &amp; Failure Modes:</span>
                        </div>
                        <p className="text-slate-200 text-xs leading-relaxed">
                          {simulator.fieldInsights}
                        </p>
                      </div>
                    )}
                  </div>
                </details>

                {/* 5. Curriculum Alignment & Technical FAQs (Native <details> & <summary>) */}
                <details
                  id="details-curriculum"
                  className="group rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden transition-all"
                >
                  <summary className="px-3 py-2 text-xs font-mono font-bold text-purple-300 flex items-center justify-between bg-slate-900/90 hover:bg-slate-800/80 cursor-pointer select-none">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                      <span>Curriculum Mapping, Textbooks &amp; Technical FAQs</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="p-3 border-t border-slate-800/80 space-y-3 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-purple-900/40 space-y-1.5">
                        <div className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>University Course Alignment:</span>
                        </div>
                        <p className="text-slate-200 text-xs leading-relaxed font-mono">
                          {simulator.courseMapping || 'ENG-101 / General Engineering Fundamentals & Virtual Laboratory Core'}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/60 border border-cyan-900/40 space-y-1.5">
                        <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Standard Textbook References:</span>
                        </div>
                        <p className="text-slate-200 text-xs leading-relaxed">
                          {simulator.textbookReferences || 'First-Principles Engineering Curriculum Standard References'}
                        </p>
                      </div>
                    </div>

                    {/* Embedded in LMS CTA Card */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-950/30 via-slate-950 to-slate-950 border border-purple-800/40 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Code className="w-3.5 h-3.5 text-purple-400" />
                          <span>Embed in Canvas, Moodle, Blackboard or Notion</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Generate an iframe embed snippet for virtual laboratory assignments and syllabus handouts.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowEmbedModal(true)}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shrink-0 shadow-sm"
                      >
                        Get Embed Code
                      </button>
                    </div>

                    {/* Frequently Asked Technical Questions (FAQs) */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        Technical &amp; Theoretical FAQs:
                      </div>
                      <div className="space-y-2">
                        {((simulator.faqs && simulator.faqs.length > 0) ? simulator.faqs : [
                          {
                            question: `What is the physical principle underlying the ${simulator.title}?`,
                            answer: `The simulation numerically models ${simulator.physicalLaw} governed by ${simulator.governingEquation}. Dynamic 60 FPS integration visualizes real-time transient and steady-state responses as parameters vary.`
                          },
                          {
                            question: `How is numerical accuracy verified against theoretical benchmarks?`,
                            answer: `${simulator.validationTest || 'All computational routines are tested against exact analytical first-principles solutions to ensure numerical errors remain below 0.2% across normal parameter domains.'}`
                          }
                        ]).map((faq, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                            <div className="font-bold text-slate-200 text-xs flex items-start gap-2">
                              <span className="text-purple-400 font-mono font-bold text-[11px]">Q{idx + 1}:</span>
                              <span>{faq.question}</span>
                            </div>
                            <p className="text-slate-400 text-xs pl-5 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </details>

                {/* 6. Guided Experiments (Native <details> & <summary>) */}
                <details
                  id="details-experiments"
                  className="group rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden transition-all"
                >
                  <summary className="px-3 py-2 text-xs font-mono font-bold text-amber-400 flex items-center justify-between bg-slate-900/90 hover:bg-slate-800/80 cursor-pointer select-none">
                    <div className="flex items-center gap-2">
                      <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
                      <span>Guided Laboratory Investigations ({(SIMULATOR_EXPERIMENTS[simulator.type] || []).length})</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="p-3 border-t border-slate-800/80 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-mono">
                        <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
                        <span>FIRST-PRINCIPLES LABORATORY CURRICULUM</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowExperimentsModal(true)}
                        className="text-[11px] font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <span>Open Full Lab Manual</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(SIMULATOR_EXPERIMENTS[simulator.type] || []).map((exp) => (
                        <div
                          key={exp.id}
                          className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 transition-colors flex flex-col justify-between gap-2 shadow-inner"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-white">{exp.title}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300">
                                Guided Lab
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 line-clamp-2">{exp.goal}</p>
                            <p className="text-[10px] text-slate-500 line-clamp-2">{exp.description}</p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                            <span className="text-[10px] font-mono text-cyan-400 truncate max-w-[160px]">
                              {exp.expectedObservation}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                handleApplyPreset(exp.parameters);
                                setSelectedExperiment(exp);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-colors flex items-center gap-1 shadow shrink-0"
                            >
                              <span>Run Lab</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fullscreen Guided Lab Manual Modal */}
      {showExperimentsModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto"
          onClick={() => setShowExperimentsModal(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90dvh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Laboratory Curriculum & Guided Investigations</span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                      {simulator.title}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Standard-Referenced Physical Investigations (Educational Use Only)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExperimentsModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
              {/* Dynamic Live Physics State */}
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Current Machine State Evaluation</span>
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {getDynamicPhysicsExplanation(simulator.type, params)}
                </p>
              </div>

              {/* Experiments List */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Available Lab Experiments ({(SIMULATOR_EXPERIMENTS[simulator.type] || []).length})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(SIMULATOR_EXPERIMENTS[simulator.type] || []).map((exp, idx) => (
                    <div
                      key={exp.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-bold text-white flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            <span>{exp.title}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 shrink-0">
                            Lab {idx + 1}
                          </span>
                        </div>

                        <p className="text-xs text-amber-300/90 font-medium leading-relaxed">
                          <strong>Goal:</strong> {exp.goal}
                        </p>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {exp.description}
                        </p>

                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px] font-mono text-emerald-400">
                          🎯 <strong>Expected Phenomenon:</strong> {exp.expectedObservation}
                        </div>

                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px] font-mono text-cyan-300">
                          📐 <strong>Governing Law:</strong> {exp.governingLaw}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-400">
                          Parameters Configured
                        </span>
                        <button
                          onClick={() => {
                            handleApplyPreset(exp.parameters);
                            setSelectedExperiment(exp);
                            setShowExperimentsModal(false);
                            setActiveTab('telemetry');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1 shadow-lg"
                        >
                          <span>Load & Run Experiment</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>All experiments validated against analytical textbook derivations</span>
              </span>
              <button
                onClick={() => setShowExperimentsModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LMS & Web Embed Code Modal */}
      {showEmbedModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => setShowEmbedModal(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Embed in LMS or Course Website</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live 60 FPS interactive physics widget for Canvas, Moodle, Blackboard, Notion, or HTML
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEmbedModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4">
              {/* Dimensions Customizer */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="font-mono text-slate-300">
                  Target Simulator: <span className="text-cyan-400 font-bold">{simulator.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Height:</span>
                  <select
                    value={embedHeight}
                    onChange={(e) => setEmbedHeight(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 font-mono text-xs focus:border-purple-500 focus:outline-none"
                  >
                    <option value="550">550 px (Compact)</option>
                    <option value="650">650 px (Standard)</option>
                    <option value="750">750 px (Expanded)</option>
                  </select>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-slate-400">
                    HTML Embed Code (Copy &amp; Paste):
                  </span>
                  <button
                    onClick={() => {
                      const snippet = `<iframe src="https://livesimulators.com/embed/${simulator.id}" width="100%" height="${embedHeight}" style="border:1px solid #1e293b; border-radius:12px; max-width:100%;" allow="fullscreen" loading="lazy"></iframe>`;
                      navigator.clipboard.writeText(snippet);
                      setEmbedCopied(true);
                      setTimeout(() => setEmbedCopied(false), 2500);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
                      embedCopied
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                        : 'bg-purple-600 hover:bg-purple-500 text-white'
                    }`}
                  >
                    {embedCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{embedCopied ? 'Copied to Clipboard!' : 'Copy Embed Code'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-purple-300 break-all select-all leading-relaxed">
                  {`<iframe src="https://livesimulators.com/embed/${simulator.id}" width="100%" height="${embedHeight}" style="border:1px solid #1e293b; border-radius:12px; max-width:100%;" allow="fullscreen" loading="lazy"></iframe>`}
                </div>
              </div>

              {/* LMS Quick Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    <span>Canvas LMS</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Edit page &gt; Click <strong>Insert &gt; Embed</strong> or switch to HTML view (`&lt;/&gt;`) and paste.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>Moodle LMS</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Add an Activity &gt; <strong>Page or Label</strong> &gt; Toggle HTML toolbar &gt; Paste iframe code.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span>Blackboard / Web</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Add Content &gt; <strong>Web Link / Embed HTML</strong> &gt; Paste and check 'Open in frame'.
                  </p>
                </div>
              </div>

              {/* Live Preview Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <a
                  href={`/embed/${simulator.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <span>Preview standalone embed window</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => setShowEmbedModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
