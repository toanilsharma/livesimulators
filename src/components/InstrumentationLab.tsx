import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Sliders,
  Gauge,
  Activity,
  Zap,
  Flame,
  Droplets,
  AlertTriangle,
  AlertOctagon,
  HelpCircle,
  Cpu,
  Layers,
  Waves,
  RotateCw,
  Scale,
  Sparkles,
  CheckCircle2,
  Info
} from 'lucide-react';
import {
  InstrumentationSimulatorMode,
  INSTRUMENTATION_MODES
} from './instrumentation/types';
import { MathView } from './MathView';
import {
  renderCurrentLoop,
  renderRtd,
  renderControlValve,
  renderPidLoop,
  renderOrificeFlow,
  renderThermocouple,
  renderHydrostaticLevel,
  renderCoriolisMeter
} from './instrumentation/renderers';

interface InstrumentationLabProps {
  onOpenTopic?: (topic: string) => void;
}

export const InstrumentationLab: React.FC<InstrumentationLabProps> = ({ onOpenTopic }) => {
  // Active Instrument Mode (1 of 8)
  const [activeMode, setActiveMode] = useState<InstrumentationSimulatorMode>('current_loop');

  // =========================================================================
  // SIMULATOR 1: 4-20mA Pressure Transmitter & NAMUR NE 43 Loop (IEC 60381-1)
  // =========================================================================
  const [processPressure, setProcessPressure] = useState<number>(6.5); // bar
  const [lrv] = useState<number>(0.0);
  const [urv] = useState<number>(10.0);
  const [wireResistance, setWireResistance] = useState<number>(25); // Ω
  const [loadResistance, setLoadResistance] = useState<number>(250); // Ω
  const [supplyVoltage] = useState<number>(24.0); // VDC
  const [faultInjection, setFaultInjection] = useState<'none' | 'burnout_low' | 'burnout_high' | 'wire_break'>('none');
  const [hartActive, setHartActive] = useState<boolean>(true);

  // =========================================================================
  // SIMULATOR 2: Pt100 RTD & 3-Wire Bridge (IEC 60751)
  // =========================================================================
  const [temperature, setTemperature] = useState<number>(85.0); // °C
  const [wiringConfig, setWiringConfig] = useState<'2wire' | '3wire' | '4wire'>('3wire');
  const [leadResistance, setLeadResistance] = useState<number>(4.5); // Ω per wire lead

  // =========================================================================
  // SIMULATOR 3: Pneumatic Control Valve ($C_v$ Flow, IEC 60534)
  // =========================================================================
  const [controllerOutput, setControllerOutput] = useState<number>(60); // %
  const [trimType, setTrimType] = useState<'linear' | 'equal_pct' | 'quick_open'>('equal_pct');
  const [inletPressure, setInletPressure] = useState<number>(6.0); // bar
  const [outletPressure, setOutletPressure] = useState<number>(2.5); // bar
  const [maxCv] = useState<number>(50);

  // =========================================================================
  // SIMULATOR 4: Closed-Loop PID Level Controller (ISA S51.1)
  // =========================================================================
  const [setpoint, setSetpoint] = useState<number>(65); // %
  const [kp, setKp] = useState<number>(2.4);
  const [ti, setTi] = useState<number>(8.0); // s
  const [td, setTd] = useState<number>(0.5); // s
  const [disturbanceInflow, setDisturbanceInflow] = useState<number>(0); // %

  // =========================================================================
  // SIMULATOR 5: DP Orifice Plate Flowmeter (ISO 5167 / ASME MFC-3M)
  // =========================================================================
  const [pipeD] = useState<number>(100); // Pipe internal diameter mm
  const [boreD, setBoreD] = useState<number>(60); // Orifice bore diameter mm
  const [flowRateQ, setFlowRateQ] = useState<number>(45.0); // m3/h
  const [fluidType, setFluidType] = useState<'water' | 'oil' | 'gas'>('water');
  const [useSquareRoot, setUseSquareRoot] = useState<boolean>(true);
  const [lowFlowCutoff, setLowFlowCutoff] = useState<boolean>(true);

  // =========================================================================
  // SIMULATOR 6: Thermocouple & Cold Junction Compensation (IEC 60584)
  // =========================================================================
  const [hotTemp, setHotTemp] = useState<number>(650); // °C
  const [cjcTemp, setCjcTemp] = useState<number>(25); // °C ambient
  const [tcType, setTcType] = useState<'K' | 'J' | 'T' | 'S'>('K');
  const [cjcEnabled, setCjcEnabled] = useState<boolean>(true);
  const [useExtensionWire, setUseExtensionWire] = useState<boolean>(true);

  // =========================================================================
  // SIMULATOR 7: Hydrostatic DP Tank Level (IEC 61515 / ISA-RP51.1)
  // =========================================================================
  const [tankHeight] = useState<number>(4.0); // m
  const [levelMeters, setLevelMeters] = useState<number>(2.6); // m
  const [tankType, setTankType] = useState<'open' | 'closed_dry' | 'closed_wet'>('closed_wet');
  const [sgProcess, setSgProcess] = useState<number>(0.88); // Specific Gravity (Diesel/Oil)
  const [mountingOffsetZ, setMountingOffsetZ] = useState<number>(0.5); // m below datum
  const [blanketGasPressure, setBlanketGasPressure] = useState<number>(1.2); // bar

  // =========================================================================
  // SIMULATOR 8: Coriolis Mass Flowmeter & Density Resonator (ISO 10790)
  // =========================================================================
  const [massFlowKgH, setMassFlowKgH] = useState<number>(5400); // kg/h
  const [coriolisDensity, setCoriolisDensity] = useState<number>(1000); // kg/m3
  const [vibrationAmp, setVibrationAmp] = useState<number>(4.0);
  const [twoPhaseFault, setTwoPhaseFault] = useState<boolean>(false);

  // Interactive Canvas Ref & Animation State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const stateRef = useRef({
    time: 0,
    particles: Array.from({ length: 48 }, (_, i) => ({
      pos: (i * 0.06) % 1.0,
      path: i % 2,
    })),
    orificeParticles: Array.from({ length: 36 }, () => ({
      x: Math.random(),
      y: Math.random(),
      speed: 0.8 + Math.random() * 0.4
    })),
    tcParticles: Array.from({ length: 24 }, (_, i) => ({
      pos: (i * 0.08) % 1.0,
      wire: i % 2
    })),
    bubbleParticles: Array.from({ length: 28 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 1.5 + Math.random() * 2.5,
      speed: 0.7 + Math.random() * 0.8,
    })),
    valveStemPos: 0.6,
    hartWavePhase: 0,
    pidState: {
      pv: 40,
      integral: 0,
      lastError: 0,
      historyPv: Array(80).fill(40),
      historySp: Array(80).fill(65),
      historyMv: Array(80).fill(50),
    }
  });

  // =========================================================================
  // Physics & Metrology Calculations (All 8 Modes)
  // =========================================================================

  // 1. Current Loop Calculations
  const pressureSpan = Math.max(0.001, urv - lrv);
  const pressurePercent = Math.max(0, Math.min(100, ((processPressure - lrv) / pressureSpan) * 100));
  let calculatedCurrent = 4.0 + 16.0 * (pressurePercent / 100.0);
  if (faultInjection === 'burnout_low') {
    calculatedCurrent = 3.5;
  } else if (faultInjection === 'burnout_high') {
    calculatedCurrent = 21.5;
  } else if (faultInjection === 'wire_break') {
    calculatedCurrent = 0.0;
  }
  const currentAmps = calculatedCurrent / 1000.0;
  const loadVoltage = currentAmps * loadResistance;
  const wireVoltage = currentAmps * wireResistance;
  const transmitterTerminalVoltage = Math.max(0, supplyVoltage - loadVoltage - wireVoltage);
  const isComplianceVoltageHealthy = transmitterTerminalVoltage >= 10.5;

  const getNamurStatus = (mA: number, fault: string) => {
    if (fault === 'wire_break') {
      return { label: 'LOOP OPEN CIRCUIT (WIRE BREAK)', level: 'alarm', code: 'I = 0.0 mA (< 3.6 mA)', color: 'text-rose-400 bg-rose-950/80 border-rose-600' };
    }
    if (mA <= 3.6) {
      return { label: 'NAMUR SENSOR BURNOUT / LOW FAILURE', level: 'alarm', code: 'NE 43 FAIL LOW (≤ 3.6 mA)', color: 'text-rose-400 bg-rose-950/80 border-rose-600' };
    }
    if (mA > 3.6 && mA < 3.8) {
      return { label: 'CRITICAL UNDER-RANGE TRANSITION', level: 'warning', code: '3.6 mA < I < 3.8 mA', color: 'text-amber-400 bg-amber-950/80 border-amber-600' };
    }
    if (mA >= 3.8 && mA < 4.0) {
      return { label: 'MEASUREMENT UNDER-RANGE', level: 'warning', code: 'NE 43 UNDER-RANGE (3.8 - 4.0 mA)', color: 'text-amber-400 bg-amber-950/80 border-amber-600' };
    }
    if (mA >= 4.0 && mA <= 20.0) {
      return { label: 'NORMAL CALIBRATED MEASUREMENT', level: 'normal', code: 'IEC 60381-1 VALID (4.0 - 20.0 mA)', color: 'text-emerald-400 bg-emerald-950/80 border-emerald-600' };
    }
    if (mA > 20.0 && mA <= 20.5) {
      return { label: 'MEASUREMENT OVER-RANGE', level: 'warning', code: 'NE 43 OVER-RANGE (20.0 - 20.5 mA)', color: 'text-amber-400 bg-amber-950/80 border-amber-600' };
    }
    return { label: 'NAMUR SENSOR BURNOUT / HIGH FAILURE', level: 'alarm', code: 'NE 43 FAIL HIGH (≥ 21.0 mA)', color: 'text-rose-400 bg-rose-950/80 border-rose-600' };
  };
  const namurStatus = getNamurStatus(calculatedCurrent, faultInjection);

  // 2. Pt100 RTD Calculations
  const R0 = 100.0;
  const A = 3.9083e-3;
  const B = -5.775e-7;
  const trueRtdResistance = temperature >= 0 
    ? R0 * (1 + A * temperature + B * temperature * temperature)
    : R0 * (1 + A * temperature + B * temperature * temperature - 4.183e-12 * (temperature - 100) * Math.pow(temperature, 3));
  
  let measuredResistance = trueRtdResistance;
  let leadWireErrorC = 0;
  if (wiringConfig === '2wire') {
    measuredResistance = trueRtdResistance + 2 * leadResistance;
    leadWireErrorC = (2 * leadResistance) / 0.3851;
  } else if (wiringConfig === '3wire') {
    const mismatch = 0.04;
    measuredResistance = trueRtdResistance + mismatch;
    leadWireErrorC = mismatch / 0.3851;
  } else {
    measuredResistance = trueRtdResistance;
    leadWireErrorC = 0.0;
  }

  // 3. Control Valve Calculations
  const valveLiftFraction = Math.max(0, Math.min(1, controllerOutput / 100));
  let calculatedCv = 0;
  if (trimType === 'linear') {
    calculatedCv = maxCv * valveLiftFraction;
  } else if (trimType === 'equal_pct') {
    const R_range = 50;
    calculatedCv = valveLiftFraction === 0 ? 0 : maxCv * Math.pow(R_range, valveLiftFraction - 1);
  } else {
    calculatedCv = maxCv * Math.sqrt(valveLiftFraction);
  }
  const deltaPValve = Math.max(0.1, inletPressure - outletPressure);
  const volumetricFlowRate = 0.865 * calculatedCv * Math.sqrt(deltaPValve);

  // 5. Orifice Plate Calculations (ISO 5167)
  const betaRatio = boreD / pipeD;
  const fluidDensity = fluidType === 'water' ? 1000 : fluidType === 'oil' ? 840 : 1.25;
  const Cd = 0.5961 + 0.0261 * Math.pow(betaRatio, 2) - 0.216 * Math.pow(betaRatio, 8);
  const E_approach = 1 / Math.sqrt(Math.max(0.01, 1 - Math.pow(betaRatio, 4)));
  const boreArea = (Math.PI / 4) * Math.pow(boreD / 1000, 2);
  const velocityThroughBore = (flowRateQ / 3600) / (Cd * E_approach * boreArea);
  const deltaPOrifice = Math.max(0, 0.5 * fluidDensity * Math.pow(velocityThroughBore, 2) / 1000); // kPa
  const permLossRatio = 1 - Math.pow(betaRatio, 1.9); // ISO 5167 permanent pressure loss
  const maxFlowForSpan = 100.0;
  const maxDeltaPForSpan = 0.5 * fluidDensity * Math.pow((maxFlowForSpan / 3600) / (Cd * E_approach * boreArea), 2) / 1000;
  let orificeCurrent = 4.0;
  if (lowFlowCutoff && flowRateQ < 0.05 * maxFlowForSpan) {
    orificeCurrent = 4.0;
  } else if (useSquareRoot) {
    orificeCurrent = 4.0 + 16.0 * Math.min(1.0, flowRateQ / maxFlowForSpan);
  } else {
    orificeCurrent = 4.0 + 16.0 * Math.min(1.0, deltaPOrifice / maxDeltaPForSpan);
  }

  // 6. Thermocouple Calculations (IEC 60584)
  const seebeckCoeff = tcType === 'K' ? 41.27 : tcType === 'J' ? 51.7 : tcType === 'T' ? 40.7 : 10.3; // µV/°C
  const rawMv = (seebeckCoeff * (hotTemp - cjcTemp)) / 1000.0;
  const cjcMv = (seebeckCoeff * cjcTemp) / 1000.0;
  let netMv = rawMv;
  let indicatedTemp = hotTemp;
  if (!useExtensionWire) {
    // Mismatched copper wire introduces parasitic junction at head temperature (~20°C offset error)
    const parasiticError = 22.5;
    indicatedTemp = hotTemp - parasiticError;
    netMv = (seebeckCoeff * indicatedTemp) / 1000.0;
  } else if (!cjcEnabled) {
    // Uncompensated: floating reference
    indicatedTemp = hotTemp - cjcTemp;
    netMv = rawMv;
  } else {
    netMv = rawMv + cjcMv;
    indicatedTemp = hotTemp;
  }

  // 7. Hydrostatic DP Tank Level Calculations (IEC 61515)
  const sgSeal = 1.05; // Glycol wet leg seal
  const levelPercent = (levelMeters / tankHeight) * 100;
  const pHP = blanketGasPressure * 10197 + sgProcess * (levelMeters + mountingOffsetZ) * 1000; // mmH2O
  let pLP = 0;
  if (tankType === 'closed_dry') {
    pLP = blanketGasPressure * 10197;
  } else if (tankType === 'closed_wet') {
    pLP = blanketGasPressure * 10197 + sgSeal * (tankHeight + mountingOffsetZ) * 1000;
  }
  const deltaPLevel = pHP - pLP;
  // Calibration points:
  const lrvLevel = (tankType === 'closed_wet')
    ? sgProcess * mountingOffsetZ * 1000 - sgSeal * (tankHeight + mountingOffsetZ) * 1000
    : sgProcess * mountingOffsetZ * 1000;
  const urvLevel = (tankType === 'closed_wet')
    ? sgProcess * (tankHeight + mountingOffsetZ) * 1000 - sgSeal * (tankHeight + mountingOffsetZ) * 1000
    : sgProcess * (tankHeight + mountingOffsetZ) * 1000;
  const spanLevel = urvLevel - lrvLevel;
  const outputLevelCurrent = Math.max(3.8, Math.min(20.5, 4.0 + 16.0 * ((deltaPLevel - lrvLevel) / Math.max(1, spanLevel))));
  const calibrationType: 'normal' | 'suppression' | 'elevation' = lrvLevel < 0 ? 'elevation' : lrvLevel > 0 ? 'suppression' : 'normal';

  // 8. Coriolis Mass Flow Calculations (ISO 10790)
  const resonantFreqHz = 125.0 * Math.sqrt(1000.0 / coriolisDensity);
  const phaseShiftMicrosec = (massFlowKgH / 12000.0) * 18.5;
  const volumetricFlowM3H = massFlowKgH / coriolisDensity;
  const coriolisCurrent = 4.0 + 16.0 * (massFlowKgH / 12000.0);

  // =========================================================================
  // Canvas World-Class Engineering Graphics Loop (60 FPS)
  // =========================================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.064);
      lastTime = now;

      const state = stateRef.current;
      state.time += dt;
      const t = state.time;

      const w = canvas.width;
      const h = canvas.height;

      // Dark Precision Technical Drafting Background
      ctx.fillStyle = '#040711';
      ctx.fillRect(0, 0, w, h);

      // Engineering Coordinate Blueprint Grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 0.8;
      const gridSize = 24;
      for (let x = 0; x <= w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y <= h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const rc = { ctx, w, h, dt, t };

      // Dispatch to specialized high-fidelity canvas renderer
      if (activeMode === 'current_loop') {
        renderCurrentLoop(rc, {
          processPressure, lrv, urv, calculatedCurrent, pressurePercent,
          wireResistance, wireVoltage, loadResistance, loadVoltage,
          supplyVoltage, transmitterTerminalVoltage, isComplianceVoltageHealthy,
          hartActive, particles: state.particles, hartWavePhase: state.hartWavePhase
        });
      } else if (activeMode === 'rtd_sensor') {
        renderRtd(rc, {
          temperature, wiringConfig, leadResistance, trueRtdResistance,
          measuredResistance, leadWireErrorC
        });
      } else if (activeMode === 'control_valve') {
        renderControlValve(rc, {
          controllerOutput, trimType, inletPressure, outletPressure,
          deltaP: deltaPValve, calculatedCv, volumetricFlowRate,
          valveStemPos: state.valveStemPos, bubbleParticles: state.bubbleParticles
        });
      } else if (activeMode === 'pid_loop') {
        renderPidLoop(rc, {
          setpoint, kp, ti, td, disturbanceInflow, pidState: state.pidState
        });
      } else if (activeMode === 'orifice_flow') {
        renderOrificeFlow(rc, {
          pipeD, boreD, beta: betaRatio, flowRateQ, deltaP: deltaPOrifice,
          permLossRatio, density: fluidDensity, useSquareRoot, lowFlowCutoff,
          outputCurrent: orificeCurrent, particles: state.orificeParticles
        });
      } else if (activeMode === 'thermocouple') {
        renderThermocouple(rc, {
          hotTemp, cjcTemp, tcType, cjcEnabled, useExtensionWire,
          rawMv, cjcMv, netMv, indicatedTemp, seebeckCoeff, particles: state.tcParticles
        });
      } else if (activeMode === 'hydrostatic_level') {
        renderHydrostaticLevel(rc, {
          tankHeight, levelMeters, levelPercent, sgProcess, sgSeal,
          mountingOffsetZ, tankType, blanketGasPressure, pHP, pLP,
          deltaP: deltaPLevel, lrv: lrvLevel, urv: urvLevel,
          calibrationType, outputCurrent: outputLevelCurrent
        });
      } else if (activeMode === 'coriolis_meter') {
        renderCoriolisMeter(rc, {
          massFlowKgH, density: coriolisDensity, resonantFreqHz,
          phaseShiftMicrosec, volumetricFlowM3H, twoPhaseFault, vibrationAmp
        });
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    activeMode, processPressure, lrv, urv, calculatedCurrent, pressurePercent,
    wireResistance, wireVoltage, loadResistance, loadVoltage, supplyVoltage,
    transmitterTerminalVoltage, isComplianceVoltageHealthy, hartActive,
    temperature, wiringConfig, leadResistance, trueRtdResistance, measuredResistance, leadWireErrorC,
    controllerOutput, trimType, inletPressure, outletPressure, deltaPValve, calculatedCv, volumetricFlowRate,
    setpoint, kp, ti, td, disturbanceInflow,
    pipeD, boreD, betaRatio, flowRateQ, deltaPOrifice, permLossRatio, fluidDensity, useSquareRoot, lowFlowCutoff, orificeCurrent,
    hotTemp, cjcTemp, tcType, cjcEnabled, useExtensionWire, rawMv, cjcMv, netMv, indicatedTemp, seebeckCoeff,
    tankHeight, levelMeters, levelPercent, sgProcess, sgSeal, mountingOffsetZ, tankType, blanketGasPressure, pHP, pLP, deltaPLevel, lrvLevel, urvLevel, calibrationType, outputLevelCurrent,
    massFlowKgH, coriolisDensity, resonantFreqHz, phaseShiftMicrosec, volumetricFlowM3H, twoPhaseFault, vibrationAmp
  ]);

  // Helper icon getter
  const getModeIcon = (mode: InstrumentationSimulatorMode) => {
    switch (mode) {
      case 'current_loop': return <Zap className="w-3.5 h-3.5" />;
      case 'rtd_sensor': return <Flame className="w-3.5 h-3.5" />;
      case 'control_valve': return <Droplets className="w-3.5 h-3.5" />;
      case 'pid_loop': return <Sliders className="w-3.5 h-3.5" />;
      case 'orifice_flow': return <Layers className="w-3.5 h-3.5" />;
      case 'thermocouple': return <Cpu className="w-3.5 h-3.5" />;
      case 'hydrostatic_level': return <Waves className="w-3.5 h-3.5" />;
      case 'coriolis_meter': return <RotateCw className="w-3.5 h-3.5" />;
    }
  };

  const activeItem = INSTRUMENTATION_MODES.find(m => m.id === activeMode) || INSTRUMENTATION_MODES[0];

  return (
    <section id="instrumentation-lab" className="py-14 bg-slate-950 text-slate-100 relative overflow-hidden border-t border-slate-800">
      
      {/* Precision grid pattern background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* ================================================================= */}
        {/* Section Header Strip & Instrument Selection Bar */}
        {/* ================================================================= */}
        <div className="space-y-4 pb-6 border-b border-slate-800">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/40 bg-teal-950/50 text-teal-300 text-xs font-mono">
                <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                <span>IEC 60381-1 • NAMUR NE 43 • IEC 60751 • ISO 5167 • IEC 60584 • IEC 61515 • ISO 10790 • ISA-75</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Instrumentation & Control Simulators
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl font-sans">
                High-fidelity physical models covering pressure loops, temperature thermowells & thermocouples, 
                differential pressure & Coriolis flowmeters, hydrostatic level with elevation/suppression, and control valve dynamics.
              </p>
            </div>

            <div className="text-right hidden lg:block font-mono text-xs text-slate-400">
              <span className="text-cyan-400 font-bold">8 Full Simulators</span> • 100% Physics & Standards
            </div>
          </div>

          {/* 8-Simulator Interactive Mode Selector Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 p-1.5 bg-slate-900/90 border border-slate-800 rounded-xl font-mono text-xs">
            {INSTRUMENTATION_MODES.map((mode) => {
              const isActive = activeMode === mode.id;
              return (
                <button
                  key={mode.id}
                  id={`simulator-tab-${mode.id}`}
                  onClick={() => setActiveMode(mode.id)}
                  className={`px-2.5 py-2 rounded-lg transition-all flex flex-col items-center justify-center text-center gap-1 border ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-950'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800/90'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {getModeIcon(mode.id)}
                    <span className="truncate">{mode.shortName}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3-COLUMN WORKBENCH ARCHITECTURE */}
        {/* Left: Input Controls | Center: Big Visuals | Right: Results & Learning */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* =============================================================== */}
          {/* 1. LEFT SIDE: Input Data & Controls Buttons */}
          {/* =============================================================== */}
          <div className="lg:col-span-3 space-y-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-200">
                <span className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  Input Data Controls
                </span>
                <span className="text-[10px] text-cyan-400 font-semibold uppercase">Live Active</span>
              </div>

              {/* CONTROLS 1: 4-20mA Current Loop */}
              {activeMode === 'current_loop' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span>Process Pressure (PV):</span>
                      <span className="text-cyan-400 font-bold">{processPressure.toFixed(1)} bar</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={12}
                      step={0.1}
                      value={processPressure}
                      onChange={(e) => setProcessPressure(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 uppercase tracking-wider">Calibration 5-Point Check:</label>
                    <div className="grid grid-cols-5 gap-1">
                      {[0, 2.5, 5.0, 7.5, 10.0].map((val, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setProcessPressure(val);
                            setFaultInjection('none');
                          }}
                          className={`py-1 rounded text-[10px] border transition-colors ${
                            processPressure === val && faultInjection === 'none'
                              ? 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {idx * 25}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <label className="text-[11px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      NAMUR NE 43 Fault Injector:
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => setFaultInjection('none')}
                        className={`py-1.5 px-2 rounded text-[10px] border text-left transition-colors ${
                          faultInjection === 'none'
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        ✓ Normal Grid
                      </button>
                      <button
                        onClick={() => setFaultInjection('burnout_low')}
                        className={`py-1.5 px-2 rounded text-[10px] border text-left transition-colors ${
                          faultInjection === 'burnout_low'
                            ? 'bg-rose-950 border-rose-500 text-rose-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        ⚡ Burnout Low (3.5mA)
                      </button>
                      <button
                        onClick={() => setFaultInjection('burnout_high')}
                        className={`py-1.5 px-2 rounded text-[10px] border text-left transition-colors ${
                          faultInjection === 'burnout_high'
                            ? 'bg-rose-950 border-rose-500 text-rose-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        ⚡ Burnout High (21.5mA)
                      </button>
                      <button
                        onClick={() => setFaultInjection('wire_break')}
                        className={`py-1.5 px-2 rounded text-[10px] border text-left transition-colors ${
                          faultInjection === 'wire_break'
                            ? 'bg-rose-950 border-rose-500 text-rose-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        ✂ Wire Break (0mA)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="flex justify-between text-slate-300">
                      <span>Cable Resistance (R_wire):</span>
                      <span className="text-amber-400 font-bold">{wireResistance} Ω</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={200}
                      step={5}
                      value={wireResistance}
                      onChange={(e) => setWireResistance(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300">HART Communication:</span>
                    <button
                      onClick={() => setHartActive(!hartActive)}
                      className={`px-3 py-1 rounded text-[11px] font-bold border transition-colors ${
                        hartActive
                          ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      {hartActive ? 'FSK ACTIVE' : 'MUTED'}
                    </button>
                  </div>
                </div>
              )}

              {/* CONTROLS 2: Pt100 RTD */}
              {activeMode === 'rtd_sensor' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span>Process Temperature:</span>
                      <span className="text-cyan-400 font-bold">{temperature.toFixed(1)} °C</span>
                    </div>
                    <input
                      type="range"
                      min={-50}
                      max={350}
                      step={1}
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 uppercase tracking-wider">Lead Wire Topology:</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['2wire', '3wire', '4wire'] as const).map((cfg) => (
                        <button
                          key={cfg}
                          onClick={() => setWiringConfig(cfg)}
                          className={`py-1.5 rounded text-[10px] border uppercase transition-colors ${
                            wiringConfig === cfg
                              ? 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {cfg}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="flex justify-between text-slate-300">
                      <span>Cable Lead Resistance (R_lead):</span>
                      <span className="text-amber-400 font-bold">{leadResistance.toFixed(1)} Ω</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      step={0.5}
                      value={leadResistance}
                      onChange={(e) => setLeadResistance(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>
                </div>
              )}

              {/* CONTROLS 3: Control Valve */}
              {activeMode === 'control_valve' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span>Controller Output (Lift):</span>
                      <span className="text-cyan-400 font-bold">{controllerOutput}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={controllerOutput}
                      onChange={(e) => setControllerOutput(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 uppercase tracking-wider">Inherent Valve Trim:</label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'linear', label: 'Linear' },
                        { id: 'equal_pct', label: 'Equal %' },
                        { id: 'quick_open', label: 'Q-Open' }
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTrimType(t.id as any)}
                          className={`py-1.5 rounded text-[10px] border transition-colors ${
                            trimType === t.id
                              ? 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="flex justify-between text-slate-300">
                      <span>Inlet Pressure (P1):</span>
                      <span className="text-blue-400 font-bold">{inletPressure.toFixed(1)} bar</span>
                    </div>
                    <input
                      type="range"
                      min={3.0}
                      max={10.0}
                      step={0.5}
                      value={inletPressure}
                      onChange={(e) => setInletPressure(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span>Outlet Pressure (P2):</span>
                      <span className="text-amber-400 font-bold">{outletPressure.toFixed(1)} bar</span>
                    </div>
                    <input
                      type="range"
                      min={1.0}
                      max={inletPressure - 0.5}
                      step={0.5}
                      value={outletPressure}
                      onChange={(e) => setOutletPressure(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>
                </div>
              )}

              {/* CONTROLS 4: Closed-Loop PID */}
              {activeMode === 'pid_loop' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span>Level Setpoint (SP):</span>
                      <span className="text-emerald-400 font-bold">{setpoint}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      step={1}
                      value={setpoint}
                      onChange={(e) => setSetpoint(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span>Proportional Gain (Kp):</span>
                      <span className="text-cyan-400 font-bold">{kp.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={8.0}
                      step={0.1}
                      value={kp}
                      onChange={(e) => setKp(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span>Integral Time (Ti):</span>
                      <span className="text-emerald-400 font-bold">{ti.toFixed(1)} s</span>
                    </div>
                    <input
                      type="range"
                      min={1.0}
                      max={25.0}
                      step={0.5}
                      value={ti}
                      onChange={(e) => setTi(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={() => setDisturbanceInflow(disturbanceInflow === 0 ? 25 : 0)}
                      className={`w-full py-2 rounded-lg font-bold border transition-colors ${
                        disturbanceInflow !== 0
                          ? 'bg-rose-950 border-rose-500 text-rose-300'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {disturbanceInflow !== 0 ? '⚠️ Disturbance Step Active (+25%)' : 'Inject Load Disturbance'}
                    </button>
                  </div>
                </div>
              )}

              {/* CONTROLS 5: DP Orifice Plate Flowmeter (ISO 5167) */}
              {activeMode === 'orifice_flow' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span>Flow Rate (Q):</span>
                      <span className="text-cyan-400 font-bold">{flowRateQ.toFixed(1)} m³/h</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={120}
                      step={1}
                      value={flowRateQ}
                      onChange={(e) => setFlowRateQ(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span>Orifice Bore Diameter (d):</span>
                      <span className="text-emerald-400 font-bold">{boreD} mm (β = {betaRatio.toFixed(2)})</span>
                    </div>
                    <input
                      type="range"
                      min={30}
                      max={75}
                      step={1}
                      value={boreD}
                      onChange={(e) => setBoreD(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 uppercase tracking-wider">Process Fluid Medium:</label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'water', label: 'Water', rho: '1000' },
                        { id: 'oil', label: 'Light Oil', rho: '840' },
                        { id: 'gas', label: 'Gas', rho: '1.2' }
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setFluidType(f.id as any)}
                          className={`py-1.5 rounded text-[10px] border transition-colors ${
                            fluidType === f.id
                              ? 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Square-Root Extractor:</span>
                      <button
                        onClick={() => setUseSquareRoot(!useSquareRoot)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold border ${
                          useSquareRoot ? 'bg-cyan-950 border-cyan-400 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'
                        }`}
                      >
                        {useSquareRoot ? '√ΔP ACTIVE' : 'RAW ΔP'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Low-Flow Cutoff (&lt;5%):</span>
                      <button
                        onClick={() => setLowFlowCutoff(!lowFlowCutoff)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold border ${
                          lowFlowCutoff ? 'bg-emerald-950 border-emerald-400 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'
                        }`}
                      >
                        {lowFlowCutoff ? 'CLAMP 4mA' : 'OFF'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTROLS 6: Thermocouple & CJC (IEC 60584) */}
              {activeMode === 'thermocouple' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span>Hot Process Temp (T_hot):</span>
                      <span className="text-amber-400 font-bold">{hotTemp} °C</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1200}
                      step={10}
                      value={hotTemp}
                      onChange={(e) => setHotTemp(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span>Ambient CJC Temp (T_cjc):</span>
                      <span className="text-cyan-400 font-bold">{cjcTemp} °C</span>
                    </div>
                    <input
                      type="range"
                      min={-10}
                      max={55}
                      step={1}
                      value={cjcTemp}
                      onChange={(e) => setCjcTemp(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 uppercase tracking-wider">Thermocouple Type:</label>
                    <div className="grid grid-cols-4 gap-1">
                      {(['K', 'J', 'T', 'S'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setTcType(t)}
                          className={`py-1.5 rounded text-[10px] border transition-colors ${
                            tcType === t
                              ? 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          Type {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">CJC Auto-Correction:</span>
                      <button
                        onClick={() => setCjcEnabled(!cjcEnabled)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold border ${
                          cjcEnabled ? 'bg-emerald-950 border-emerald-400 text-emerald-300' : 'bg-rose-950 border-rose-500 text-rose-300'
                        }`}
                      >
                        {cjcEnabled ? 'ACTIVE' : 'DISABLED'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Extension Cable Wire:</span>
                      <button
                        onClick={() => setUseExtensionWire(!useExtensionWire)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold border ${
                          useExtensionWire ? 'bg-cyan-950 border-cyan-400 text-cyan-300' : 'bg-rose-950 border-rose-500 text-rose-300'
                        }`}
                      >
                        {useExtensionWire ? 'TC ALLOY' : 'COPPER (FAULT)'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTROLS 7: Hydrostatic DP Level (IEC 61515) */}
              {activeMode === 'hydrostatic_level' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span>Liquid Height (h):</span>
                      <span className="text-cyan-400 font-bold">{levelMeters.toFixed(2)} m ({levelPercent.toFixed(0)}%)</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={tankHeight}
                      step={0.05}
                      value={levelMeters}
                      onChange={(e) => setLevelMeters(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 uppercase tracking-wider">Vessel Installation Type:</label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'open', label: 'Open Atm' },
                        { id: 'closed_dry', label: 'Dry Leg' },
                        { id: 'closed_wet', label: 'Wet Leg' }
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTankType(t.id as any)}
                          className={`py-1.5 rounded text-[10px] border transition-colors ${
                            tankType === t.id
                              ? 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="flex justify-between text-slate-300">
                      <span>Process Liquid SG:</span>
                      <span className="text-amber-400 font-bold">{sgProcess.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.7}
                      max={1.84}
                      step={0.02}
                      value={sgProcess}
                      onChange={(e) => setSgProcess(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span>Transmitter Offset (z):</span>
                      <span className="text-emerald-400 font-bold">{mountingOffsetZ.toFixed(2)} m</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1.5}
                      step={0.1}
                      value={mountingOffsetZ}
                      onChange={(e) => setMountingOffsetZ(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                  </div>
                </div>
              )}

              {/* CONTROLS 8: Coriolis Mass Flowmeter (ISO 10790) */}
              {activeMode === 'coriolis_meter' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span>Mass Flow Rate (ṁ):</span>
                      <span className="text-cyan-400 font-bold">{massFlowKgH} kg/h</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={12000}
                      step={200}
                      value={massFlowKgH}
                      onChange={(e) => setMassFlowKgH(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span>Fluid Density (ρ):</span>
                      <span className="text-emerald-400 font-bold">{coriolisDensity} kg/m³</span>
                    </div>
                    <input
                      type="range"
                      min={600}
                      max={1400}
                      step={20}
                      value={coriolisDensity}
                      onChange={(e) => setCoriolisDensity(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 uppercase tracking-wider">Standard Fluid Presets:</label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { label: 'LPG (620)', rho: 620 },
                        { label: 'Diesel (850)', rho: 850 },
                        { label: 'Water (1000)', rho: 1000 }
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => setCoriolisDensity(item.rho)}
                          className={`py-1.5 rounded text-[10px] border transition-colors ${
                            coriolisDensity === item.rho
                              ? 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={() => setTwoPhaseFault(!twoPhaseFault)}
                      className={`w-full py-2 rounded-lg font-bold border transition-colors ${
                        twoPhaseFault
                          ? 'bg-rose-950 border-rose-500 text-rose-300'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {twoPhaseFault ? '⚠️ Two-Phase Gas Slug Active (Damping)' : 'Inject Gas Bubble Entrainment'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* =============================================================== */}
          {/* 2. CENTER: Big Simulator Visuals (World-Class Dynamic Animation) */}
          {/* =============================================================== */}
          <div className="lg:col-span-6 space-y-3">
            <div className="rounded-2xl border border-slate-700/80 bg-slate-900/90 shadow-2xl shadow-cyan-950/20 overflow-hidden flex flex-col">
              
              {/* Simulator Header Strip */}
              <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="truncate">{activeItem.name.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>FLOAT64 ODE 60FPS</span>
                </div>
              </div>

              {/* The Big Canvas */}
              <div className="relative bg-[#040711]">
                <canvas
                  ref={canvasRef}
                  width={720}
                  height={430}
                  className="w-full h-[330px] sm:h-[400px] lg:h-[430px] block"
                />
              </div>

            </div>
          </div>

          {/* =============================================================== */}
          {/* 3. RIGHT SIDE: Results & Output & Easy Learning */}
          {/* =============================================================== */}
          <div className="lg:col-span-3 space-y-4 font-mono text-xs">
            
            {/* Real-time Telemetry & Readouts Card */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3.5">
              
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-200">
                <span className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-emerald-400" />
                  Results & Telemetry
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">{activeItem.standards.split('•')[0]}</span>
              </div>

              {/* CURRENT LOOP RESULTS */}
              {activeMode === 'current_loop' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Loop Analog Current</span>
                    <span className="text-3xl font-display font-black text-cyan-400 tracking-tight">
                      {calculatedCurrent.toFixed(3)} <span className="text-base text-slate-300 font-normal">mA</span>
                    </span>
                    <div className="text-[11px] text-slate-400 flex items-center justify-center gap-2 pt-1 border-t border-slate-900">
                      <span>Span: {pressurePercent.toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-lg border text-[11px] space-y-1 ${namurStatus.color}`}>
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                      <span>{namurStatus.label}</span>
                    </div>
                    <div className="text-[10px] opacity-90">{namurStatus.code}</div>
                  </div>

                  <div className="space-y-1.5 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px]">
                    <div className="flex justify-between text-slate-300">
                      <span>Tx Terminal Voltage:</span>
                      <span className={`font-bold ${isComplianceVoltageHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {transmitterTerminalVoltage.toFixed(2)} V
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Total Loop Burden:</span>
                      <span className="text-white font-bold">{wireResistance + loadResistance} Ω</span>
                    </div>
                  </div>
                </div>
              )}

              {/* RTD RESULTS */}
              {activeMode === 'rtd_sensor' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Sensor Resistance</span>
                    <span className="text-3xl font-display font-black text-cyan-400 tracking-tight">
                      {trueRtdResistance.toFixed(3)} <span className="text-base text-slate-300 font-normal">Ω</span>
                    </span>
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                      Sensitivity dR/dT = 0.385 Ω/°C
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-lg border text-[11px] space-y-1 ${
                    wiringConfig === '2wire' 
                      ? 'text-rose-400 bg-rose-950/80 border-rose-600' 
                      : 'text-emerald-400 bg-emerald-950/80 border-emerald-600'
                  }`}>
                    <div className="font-bold">
                      {wiringConfig === '2wire' ? '❌ LEAD WIRE PENALTY (+2R)' : '✓ LEAD COMPENSATED (IEC 60751)'}
                    </div>
                    <div className="text-[10px]">
                      {wiringConfig === '2wire' 
                        ? `Error: +${leadWireErrorC.toFixed(2)} °C caused by cabling` 
                        : 'Wheatstone bridge eliminates cable length error.'}
                    </div>
                  </div>
                </div>
              )}

              {/* CONTROL VALVE RESULTS */}
              {activeMode === 'control_valve' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Volumetric Flow Rate</span>
                    <span className="text-3xl font-display font-black text-blue-400 tracking-tight">
                      {volumetricFlowRate.toFixed(2)} <span className="text-base text-slate-300 font-normal">m³/h</span>
                    </span>
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                      ΔP across valve = {deltaPValve.toFixed(2)} bar
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Effective Cv:</span>
                      <span className="text-white font-bold">{calculatedCv.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Valve Stem Travel:</span>
                      <span className="text-cyan-400 font-bold">{controllerOutput}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* PID RESULTS */}
              {activeMode === 'pid_loop' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Tracking Error (SP - PV)</span>
                    <span className="text-3xl font-display font-black text-emerald-400 tracking-tight">
                      {(setpoint - stateRef.current.pidState.pv).toFixed(2)} <span className="text-base text-slate-300 font-normal">%</span>
                    </span>
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                      Integral Reset Active • Anti-Windup
                    </div>
                  </div>
                </div>
              )}

              {/* ORIFICE FLOW RESULTS */}
              {activeMode === 'orifice_flow' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Differential Pressure (ΔP)</span>
                    <span className="text-3xl font-display font-black text-cyan-400 tracking-tight">
                      {deltaPOrifice.toFixed(2)} <span className="text-base text-slate-300 font-normal">kPa</span>
                    </span>
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                      Permanent Head Loss: {(deltaPOrifice * permLossRatio).toFixed(1)} kPa
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Beta Ratio (β = d/D):</span>
                      <span className={`font-bold ${betaRatio >= 0.2 && betaRatio <= 0.75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {betaRatio.toFixed(3)} {betaRatio >= 0.2 && betaRatio <= 0.75 ? '(ISO PASS)' : '(ISO FAIL)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Transmitter Output:</span>
                      <span className="text-cyan-400 font-bold">{orificeCurrent.toFixed(2)} mA</span>
                    </div>
                  </div>
                </div>
              )}

              {/* THERMOCOUPLE RESULTS */}
              {activeMode === 'thermocouple' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Indicated Temperature</span>
                    <span className={`text-3xl font-display font-black tracking-tight ${
                      Math.abs(indicatedTemp - hotTemp) < 1.0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {indicatedTemp.toFixed(1)} <span className="text-base text-slate-300 font-normal">°C</span>
                    </span>
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                      True Process: {hotTemp.toFixed(0)} °C (Error: {(indicatedTemp - hotTemp).toFixed(1)}°C)
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Raw Seebeck EMF:</span>
                      <span className="text-amber-400 font-bold">{rawMv.toFixed(3)} mV</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">CJC Correction:</span>
                      <span className="text-cyan-400 font-bold">+{cjcMv.toFixed(3)} mV</span>
                    </div>
                  </div>
                </div>
              )}

              {/* HYDROSTATIC LEVEL RESULTS */}
              {activeMode === 'hydrostatic_level' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Transmitter ΔP Span</span>
                    <span className="text-3xl font-display font-black text-cyan-400 tracking-tight">
                      {deltaPLevel.toFixed(0)} <span className="text-base text-slate-300 font-normal">mmH2O</span>
                    </span>
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                      Analog Current: {outputLevelCurrent.toFixed(2)} mA
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-lg border text-[11px] space-y-1 ${
                    calibrationType === 'elevation' 
                      ? 'text-purple-400 bg-purple-950/80 border-purple-600'
                      : calibrationType === 'suppression'
                      ? 'text-amber-400 bg-amber-950/80 border-amber-600'
                      : 'text-emerald-400 bg-emerald-950/80 border-emerald-600'
                  }`}>
                    <div className="font-bold uppercase">
                      ★ {calibrationType === 'elevation' ? 'Zero Elevation (Negative LRV)' : calibrationType === 'suppression' ? 'Zero Suppression (Positive LRV)' : 'Zero Normal'}
                    </div>
                    <div className="text-[10px]">
                      LRV: {lrvLevel.toFixed(0)} mmH2O | URV: {urvLevel.toFixed(0)} mmH2O
                    </div>
                  </div>
                </div>
              )}

              {/* CORIOLIS METER RESULTS */}
              {activeMode === 'coriolis_meter' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">True Mass Flow Rate</span>
                    <span className="text-3xl font-display font-black text-cyan-400 tracking-tight">
                      {massFlowKgH} <span className="text-base text-slate-300 font-normal">kg/h</span>
                    </span>
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                      Phase Delay Δt = {phaseShiftMicrosec.toFixed(2)} µs
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Resonant Tube Freq (f0):</span>
                      <span className="text-emerald-400 font-bold">{resonantFreqHz.toFixed(1)} Hz</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Direct Fluid Density:</span>
                      <span className="text-white font-bold">{coriolisDensity} kg/m³</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Easy Learning & Standards Card (Simple & Crystal Clear) */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2.5">
              <div className="flex items-center gap-1.5 text-cyan-400 font-display font-bold text-xs uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                <span>Easy Learning & Standards</span>
              </div>

              {activeMode === 'current_loop' && (
                <div className="space-y-2 text-[11px] font-sans text-slate-300 leading-relaxed">
                  <p className="font-semibold text-white">
                    Why 4 mA instead of 0 mA for zero pressure?
                  </p>
                  <p className="text-slate-400 text-xs">
                    This is called the <strong>"Live Zero"</strong>. If a cable snaps or disconnects, the current drops to 0 mA. Because normal operation never drops below 3.8 mA, the system instantly detects an open-wire fault rather than misinterpreting it as 0 bar!
                  </p>
                  <div className="pt-2 border-t border-slate-800 font-mono text-[10px] text-slate-400">
                    <div>STANDARD: IEC 60381-1 / NAMUR NE 43</div>
                    <div>FORMULA: I = 4 + 16 × (PV - LRV) / Span</div>
                  </div>
                </div>
              )}

              {activeMode === 'rtd_sensor' && (
                <div className="space-y-2 text-[11px] font-sans text-slate-300 leading-relaxed">
                  <p className="font-semibold text-white">
                    Why 3-wire RTDs dominate industry:
                  </p>
                  <p className="text-slate-400 text-xs">
                    In a 2-wire RTD, long plant cables add several ohms, corrupting temperature readings by up to +10°C. A 3-wire circuit connects one lead in opposition within a Wheatstone bridge, cancelling the lead resistance!
                  </p>
                  <div className="pt-2 border-t border-slate-800 font-mono text-[10px] text-slate-400">
                    <div>STANDARD: IEC 60751 (DIN 43760)</div>
                    <div>CURVE: Callendar-Van Dusen equation</div>
                  </div>
                </div>
              )}

              {activeMode === 'control_valve' && (
                <div className="space-y-2 text-[11px] font-sans text-slate-300 leading-relaxed">
                  <p className="font-semibold text-white">
                    Why Equal Percentage ($= \%$) trims?
                  </p>
                  <p className="text-slate-400 text-xs">
                    Equal percentage valves provide equal percentage changes in flow for each increment of lift. This compensates for falling pressure drop across the valve as flow increases in real piping systems!
                  </p>
                  <div className="pt-2 border-t border-slate-800 font-mono text-[10px] text-slate-400">
                    <div>STANDARD: IEC 60534 / ISA-75.01</div>
                    <div>EQUATION: Q = Cv × √(ΔP / SG)</div>
                  </div>
                </div>
              )}

              {activeMode === 'pid_loop' && (
                <div className="space-y-2 text-[11px] font-sans text-slate-300 leading-relaxed">
                  <p className="font-semibold text-white">
                    Balancing P, I, and D parameters:
                  </p>
                  <p className="text-slate-400 text-xs">
                    <strong>P</strong> handles present error, <strong>I</strong> eliminates steady-state offset by accumulating historical error, and <strong>D</strong> anticipates future error by reacting to rate-of-change.
                  </p>
                  <div className="pt-2 border-t border-slate-800 font-mono text-[10px] text-slate-400">
                    <div>STANDARD: ISA S51.1 Instrumentation Terms</div>
                    <div>ALGORITHM: Parallel / Ideal ISA PID</div>
                  </div>
                </div>
              )}

              {activeMode === 'orifice_flow' && (
                <div className="space-y-2 text-[11px] font-sans text-slate-300 leading-relaxed">
                  <p className="font-semibold text-white">
                    Why does ΔP vary with flow squared?
                  </p>
                  <p className="text-slate-400 text-xs">
                    By Bernoulli's principle, kinetic energy is proportional to velocity squared. Constricting flow through the orifice increases velocity, causing a pressure drop proportional to flow squared. Transmitters extract the square root of ΔP to produce a linear 4–20 mA output!
                  </p>
                  <div className="pt-2 border-t border-slate-800 font-mono text-[10px] text-slate-400">
                    <div>STANDARD: ISO 5167 / ASME MFC-3M</div>
                    <div>CRITICAL: 0.20 ≤ β ≤ 0.75 for valid discharge coefficient</div>
                  </div>
                </div>
              )}

              {activeMode === 'thermocouple' && (
                <div className="space-y-2 text-[11px] font-sans text-slate-300 leading-relaxed">
                  <p className="font-semibold text-white">
                    Why Cold Junction Compensation (CJC) is required:
                  </p>
                  <p className="text-slate-400 text-xs">
                    Thermocouples generate EMF proportional to the temperature <em>difference</em> (T_hot - T_cjc). An isothermal RTD inside the transmitter terminal block measures T_cjc and digitally adds the compensation voltage!
                  </p>
                  <div className="pt-2 border-t border-slate-800 font-mono text-[10px] text-slate-400">
                    <div>STANDARD: IEC 60584 / ASTM E230</div>
                    <div>WARNING: Never use copper wire for TC extensions!</div>
                  </div>
                </div>
              )}

              {activeMode === 'hydrostatic_level' && (
                <div className="space-y-2 text-[11px] font-sans text-slate-300 leading-relaxed">
                  <p className="font-semibold text-white">
                    Zero Elevation vs Zero Suppression:
                  </p>
                  <p className="text-slate-400 text-xs">
                    <strong>Zero Elevation</strong> applies when the Low Pressure leg has a wet fill column, making ΔP negative at 0% tank level (LRV &lt; 0). <strong>Zero Suppression</strong> applies when the transmitter sits below the bottom datum tap (LRV &gt; 0).
                  </p>
                  <div className="pt-2 border-t border-slate-800 font-mono text-[10px] text-slate-400">
                    <div>STANDARD: IEC 61515 / ISA-RP51.1</div>
                    <div>LAW: ΔP = P_HP - P_LP = ρ_process·g·h - offset</div>
                  </div>
                </div>
              )}

              {activeMode === 'coriolis_meter' && (
                <div className="space-y-2 text-[11px] font-sans text-slate-300 leading-relaxed">
                  <p className="font-semibold text-white">
                    Direct True Mass Flow & Density:
                  </p>
                  <p className="text-slate-400 text-xs">
                    Coriolis acceleration causes an anti-symmetric twisting of vibrating tubes. The microsecond time shift Δt between pickoff coils is directly proportional to mass flow ṁ. Simultaneously, the natural resonant frequency f0 gives direct fluid density ρ!
                  </p>
                  <div className="pt-2 border-t border-slate-800 font-mono text-[10px] text-slate-400">
                    <div>STANDARD: ISO 10790 / AGA Report 11</div>
                    <div>BENEFIT: No Reynolds number or viscosity sensitivity!</div>
                  </div>
                </div>
              )}

            </div>

            {/* Pure LaTeX Governing Differential Formulation Card */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-2">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Governing Differential Formulation
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 font-mono text-xs text-emerald-300 overflow-x-auto custom-scrollbar">
                <MathView math={activeItem.equation} block />
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                Standards: <span className="text-slate-300">{activeItem.standards}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
};
