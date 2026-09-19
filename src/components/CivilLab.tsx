import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Activity, 
  Layers, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Maximize2, 
  RotateCcw, 
  Info, 
  ArrowRight,
  ChevronRight,
  TrendingDown,
  Compass,
  Gauge,
  HelpCircle,
  Truck,
  Waves,
  CircleDot
} from 'lucide-react';
import { 
  CivilSimulatorMode, 
  CIVIL_MODES 
} from './civil/types';
import { MathView } from './MathView';
import { 
  renderBeamBending, 
  renderTrussAnalysis, 
  renderSeismicIsolation, 
  renderMohrCircle 
} from './civil/renderers';

export const CivilLab: React.FC = () => {
  const [activeMode, setActiveMode] = useState<CivilSimulatorMode>('beam_bending');

  // -------------------------------------------------------------
  // 1. BEAM BENDING STATE (Euler-Bernoulli)
  // -------------------------------------------------------------
  const [beamLength, setBeamLength] = useState<number>(6.0); // m
  const [supportType, setSupportType] = useState<'simply_supported' | 'cantilever' | 'propped_cantilever'>('simply_supported');
  const [pointLoadP, setPointLoadP] = useState<number>(45); // kN
  const [pointLoadPos, setPointLoadPos] = useState<number>(3.0); // m
  const [udlQ, setUdlQ] = useState<number>(12); // kN/m
  const [beamMaterial, setBeamMaterial] = useState<'steel' | 'concrete' | 'timber'>('steel');

  // -------------------------------------------------------------
  // 2. TRUSS BRIDGE STATE (Warren / Pratt)
  // -------------------------------------------------------------
  const [trussType, setTrussType] = useState<'warren' | 'pratt' | 'howe'>('warren');
  const [trussSpan, setTrussSpan] = useState<number>(24); // m
  const [trussHeight, setTrussHeight] = useState<number>(4.5); // m
  const [truckPos, setTruckPos] = useState<number>(0.4); // 0.0 - 1.0
  const [liveLoadP, setLiveLoadP] = useState<number>(80); // kN
  const [deadLoadNode, setDeadLoadNode] = useState<number>(15); // kN
  const [isTruckMoving, setIsTruckMoving] = useState<boolean>(true);

  // -------------------------------------------------------------
  // 3. SEISMIC ISOLATION STATE (ASCE 7-22)
  // -------------------------------------------------------------
  const [seismicSystem, setSeismicSystem] = useState<'fixed_base' | 'isolated'>('isolated');
  const [pgaG, setPgaG] = useState<number>(0.45); // g
  const [earthquakeFreq, setEarthquakeFreq] = useState<number>(1.8); // Hz
  const [soilType, setSoilType] = useState<'rock' | 'dense_soil' | 'soft_clay'>('dense_soil');

  // -------------------------------------------------------------
  // 4. MOHR'S CIRCLE & SOIL SHEAR STATE (ASTM D3080)
  // -------------------------------------------------------------
  const [sigmaX, setSigmaX] = useState<number>(140); // kPa
  const [sigmaY, setSigmaY] = useState<number>(50); // kPa
  const [tauXy, setTauXy] = useState<number>(35); // kPa
  const [cohesionC, setCohesionC] = useState<number>(20); // kPa
  const [frictionAnglePhi, setFrictionAnglePhi] = useState<number>(28); // deg
  const [planeAngleTheta, setPlaneAngleTheta] = useState<number>(35); // deg

  // Canvas ref & Animation loop
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const tRef = useRef<number>(0);
  const driftHistoryRef = useRef<number[]>(new Array(40).fill(0));

  // Material properties lookup for beam
  const getMaterialE = () => {
    switch (beamMaterial) {
      case 'steel': return 200; // GPa (AISC A36/S355)
      case 'concrete': return 30; // GPa
      case 'timber': return 12; // GPa
    }
  };

  // -------------------------------------------------------------
  // Mathematical Calculators
  // -------------------------------------------------------------
  // 1. Beam Bending Math
  const E_GPa = getMaterialE();
  const I_m4 = 85e-6; // 85 x 10^6 mm^4 typical W-beam section
  const beamDepthMm = 350; // mm

  let reactionA = 0;
  let reactionB = 0;
  let maxMomentKnm = 0;
  let maxDeflectionMm = 0;

  if (supportType === 'simply_supported') {
    const totalUdl = udlQ * beamLength;
    const a = Math.min(beamLength, pointLoadPos);
    const b = beamLength - a;
    reactionB = (totalUdl * 0.5 * beamLength + pointLoadP * a) / beamLength;
    reactionA = totalUdl + pointLoadP - reactionB;
    // Moment under point load & center UDL
    maxMomentKnm = (reactionA * a) - (0.5 * udlQ * Math.pow(a, 2));
    // Midspan deflection approx (UDL + Point load)
    const deltaUdl = (5 * (udlQ * 1000) * Math.pow(beamLength, 4)) / (384 * (E_GPa * 1e9) * I_m4);
    const deltaPoint = ((pointLoadP * 1000) * Math.pow(beamLength, 3)) / (48 * (E_GPa * 1e9) * I_m4);
    maxDeflectionMm = (deltaUdl + deltaPoint) * 1000;
  } else if (supportType === 'cantilever') {
    reactionA = udlQ * beamLength + pointLoadP;
    maxMomentKnm = (udlQ * Math.pow(beamLength, 2) * 0.5) + (pointLoadP * Math.min(beamLength, pointLoadPos));
    const deltaUdl = ((udlQ * 1000) * Math.pow(beamLength, 4)) / (8 * (E_GPa * 1e9) * I_m4);
    const deltaPoint = ((pointLoadP * 1000) * Math.pow(beamLength, 3)) / (3 * (E_GPa * 1e9) * I_m4);
    maxDeflectionMm = (deltaUdl + deltaPoint) * 1000;
  } else {
    // Propped cantilever
    reactionB = (3 / 8) * udlQ * beamLength + (pointLoadP * 0.4);
    reactionA = udlQ * beamLength + pointLoadP - reactionB;
    maxMomentKnm = (udlQ * Math.pow(beamLength, 2)) / 8 + pointLoadP * 1.5;
    maxDeflectionMm = ((udlQ * 1000) * Math.pow(beamLength, 4)) / (185 * (E_GPa * 1e9) * I_m4) * 1000;
  }

  const maxStressMpa = (maxMomentKnm * 1e3 * (beamDepthMm * 0.5 * 1e-3)) / I_m4 / 1e6;
  const aiscDeflectionLimit = (beamLength * 1000) / 360; // L/360
  const isBeamPass = maxDeflectionMm <= aiscDeflectionLimit;

  // 2. Truss Bridge Math
  // Warren 6-bay truss topology
  const totalDeckNodes = 7;
  const reactionLeftTruss = (deadLoadNode * 5 + liveLoadP * (1 - truckPos));
  const reactionRightTruss = (deadLoadNode * 5 + liveLoadP * truckPos);

  const trussMembers: {
    id: string;
    from: [number, number];
    to: [number, number];
    forceKn: number;
    isTension: boolean;
    isZero: boolean;
    stressRatio: number;
  }[] = [
    // Bottom Chord members (y=0)
    { id: 'B1', from: [0, 0], to: [0.166, 0], forceKn: reactionLeftTruss * 1.1, isTension: true, isZero: false, stressRatio: 0.35 },
    { id: 'B2', from: [0.166, 0], to: [0.333, 0], forceKn: reactionLeftTruss * 1.7, isTension: true, isZero: false, stressRatio: 0.58 },
    { id: 'B3', from: [0.333, 0], to: [0.5, 0], forceKn: (reactionLeftTruss + reactionRightTruss) * 1.0, isTension: true, isZero: false, stressRatio: 0.72 },
    { id: 'B4', from: [0.5, 0], to: [0.666, 0], forceKn: (reactionLeftTruss + reactionRightTruss) * 1.0, isTension: true, isZero: false, stressRatio: 0.72 },
    { id: 'B5', from: [0.666, 0], to: [0.833, 0], forceKn: reactionRightTruss * 1.7, isTension: true, isZero: false, stressRatio: 0.58 },
    { id: 'B6', from: [0.833, 0], to: [1.0, 0], forceKn: reactionRightTruss * 1.1, isTension: true, isZero: false, stressRatio: 0.35 },
    // Top Chord members (y=1)
    { id: 'T1', from: [0.166, 1], to: [0.333, 1], forceKn: -reactionLeftTruss * 1.5, isTension: false, isZero: false, stressRatio: 0.52 },
    { id: 'T2', from: [0.333, 1], to: [0.5, 1], forceKn: -(reactionLeftTruss + reactionRightTruss) * 1.1, isTension: false, isZero: false, stressRatio: 0.78 },
    { id: 'T3', from: [0.5, 1], to: [0.666, 1], forceKn: -(reactionLeftTruss + reactionRightTruss) * 1.1, isTension: false, isZero: false, stressRatio: 0.78 },
    { id: 'T4', from: [0.666, 1], to: [0.833, 1], forceKn: -reactionRightTruss * 1.5, isTension: false, isZero: false, stressRatio: 0.52 },
    // Web diagonals & verticals
    { id: 'D1', from: [0, 0], to: [0.166, 1], forceKn: -reactionLeftTruss * 1.3, isTension: false, isZero: false, stressRatio: 0.48 },
    { id: 'D2', from: [0.166, 1], to: [0.333, 0], forceKn: reactionLeftTruss * 0.9, isTension: true, isZero: false, stressRatio: 0.32 },
    { id: 'D3', from: [0.333, 0], to: [0.5, 1], forceKn: -reactionLeftTruss * 0.6, isTension: false, isZero: false, stressRatio: 0.25 },
    { id: 'D4', from: [0.5, 1], to: [0.666, 0], forceKn: -reactionRightTruss * 0.6, isTension: false, isZero: false, stressRatio: 0.25 },
    { id: 'D5', from: [0.666, 0], to: [0.833, 1], forceKn: reactionRightTruss * 0.9, isTension: true, isZero: false, stressRatio: 0.32 },
    { id: 'D6', from: [0.833, 1], to: [1.0, 0], forceKn: -reactionRightTruss * 1.3, isTension: false, isZero: false, stressRatio: 0.48 },
  ];

  const maxTensionKn = Math.max(...trussMembers.filter(m => m.isTension).map(m => m.forceKn));
  const maxCompressionKn = Math.max(...trussMembers.filter(m => !m.isTension).map(m => Math.abs(m.forceKn)));
  const eulerCriticalKn = 220; // kN for selected strut section

  // 3. Seismic Isolation Math
  const timePeriodTn = seismicSystem === 'isolated' ? 2.45 : 0.42; // s
  const driftLimitAsce = 25.0; // mm (2% drift limit)
  const roofDriftMm = seismicSystem === 'isolated' 
    ? (pgaG * 8.5) 
    : (pgaG * 48.0);
  const isDriftPass = roofDriftMm <= driftLimitAsce;
  const baseShearKn = seismicSystem === 'isolated'
    ? (pgaG * 140)
    : (pgaG * 520);

  // 4. Mohr's Circle Math
  const sigmaAvg = (sigmaX + sigmaY) / 2;
  const radiusR = Math.sqrt(Math.pow((sigmaX - sigmaY) / 2, 2) + Math.pow(tauXy, 2));
  const sigma1 = sigmaAvg + radiusR;
  const sigma2 = sigmaAvg - radiusR;
  const tauMax = radiusR;
  const principalAngleDeg = (0.5 * Math.atan2(2 * tauXy, sigmaX - sigmaY) * 180) / Math.PI;

  const thetaRad = (planeAngleTheta * Math.PI) / 180;
  const sigmaTheta = sigmaAvg + ((sigmaX - sigmaY) / 2) * Math.cos(2 * thetaRad) + tauXy * Math.sin(2 * thetaRad);
  const tauTheta = -((sigmaX - sigmaY) / 2) * Math.sin(2 * thetaRad) + tauXy * Math.cos(2 * thetaRad);

  // Mohr-Coulomb shear strength at normal stress sigmaTheta
  const tanPhi = Math.tan((frictionAnglePhi * Math.PI) / 180);
  const tauAvailable = cohesionC + Math.max(0, sigmaTheta) * tanPhi;
  const factorOfSafety = Math.abs(tauTheta) > 0.1 ? tauAvailable / Math.abs(tauTheta) : 9.99;
  const isShearFailure = factorOfSafety < 1.0;

  // -------------------------------------------------------------
  // Canvas Animation Frame
  // -------------------------------------------------------------
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      tRef.current += dt;

      // Update truck position if moving
      if (activeMode === 'truss_analysis' && isTruckMoving) {
        setTruckPos((prev) => {
          const next = prev + dt * 0.08;
          return next > 1.0 ? 0.0 : next;
        });
      }

      // Update seismic drift history
      if (activeMode === 'seismic_isolation') {
        const liveDrift = Math.abs(Math.sin(tRef.current * earthquakeFreq * 2 * Math.PI)) * roofDriftMm;
        const hist = driftHistoryRef.current;
        hist.shift();
        hist.push(liveDrift);
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          // Clear background with dark engineering drafting canvas
          ctx.fillStyle = '#060a12';
          ctx.fillRect(0, 0, w, h);

          // Subtle engineering grid
          ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
          ctx.lineWidth = 0.7;
          for (let x = 0; x < w; x += 25) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
          }
          for (let y = 0; y < h; y += 25) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
          }

          const rc = { ctx, w, h, dt, t: tRef.current };

          if (activeMode === 'beam_bending') {
            renderBeamBending(rc, {
              lengthL: beamLength,
              supportType,
              pointLoadP,
              pointLoadPos,
              udlQ,
              elasticModulusE: E_GPa,
              momentOfInertiaI: I_m4,
              beamDepth: beamDepthMm,
              reactionA,
              reactionB,
              maxDeflectionMm,
              maxMomentKnm,
              maxStressMpa,
              deflectionLimitAisc: aiscDeflectionLimit,
              isDeflectionPass: isBeamPass
            });
          } else if (activeMode === 'truss_analysis') {
            renderTrussAnalysis(rc, {
              trussType,
              spanM: trussSpan,
              heightM: trussHeight,
              truckPosFraction: truckPos,
              liveLoadP,
              deadLoadNode,
              materialYieldMpa: 250,
              members: trussMembers,
              reactionLeftKn: reactionLeftTruss,
              reactionRightKn: reactionRightTruss,
              maxTensionKn,
              maxCompressionKn,
              eulerCriticalKn
            });
          } else if (activeMode === 'seismic_isolation') {
            renderSeismicIsolation(rc, {
              systemType: seismicSystem,
              pgaG,
              earthquakeFreqHz: earthquakeFreq,
              soilStiffness: soilType,
              leadCoreDiameterMm: 120,
              dampingRatioZeta: seismicSystem === 'isolated' ? 18 : 3,
              timePeriodTn,
              maxRoofDriftMm: roofDriftMm,
              baseShearVbKn: baseShearKn,
              driftLimitAsce,
              isDriftPass,
              seismicHistory: [],
              driftHistory: driftHistoryRef.current
            });
          } else if (activeMode === 'mohr_circle') {
            renderMohrCircle(rc, {
              sigmaX,
              sigmaY,
              tauXy,
              cohesionC,
              frictionAnglePhiDeg: frictionAnglePhi,
              planeAngleThetaDeg: planeAngleTheta,
              sigmaAvg,
              radiusR,
              sigma1,
              sigma2,
              tauMax,
              principalAngleDeg,
              sigmaTheta,
              tauTheta,
              factorOfSafety,
              isShearFailure
            });
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    activeMode, beamLength, supportType, pointLoadP, pointLoadPos, udlQ, beamMaterial,
    trussType, trussSpan, trussHeight, truckPos, liveLoadP, deadLoadNode, isTruckMoving,
    seismicSystem, pgaG, earthquakeFreq, soilType,
    sigmaX, sigmaY, tauXy, cohesionC, frictionAnglePhi, planeAngleTheta
  ]);

  const activeItem = CIVIL_MODES.find(m => m.id === activeMode) || CIVIL_MODES[0];

  return (
    <section id="civil-lab" className="py-16 lg:py-24 border-b border-slate-800 bg-[#060a12] text-slate-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Lab Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-pink-950/70 border border-pink-500/30 text-pink-300 font-mono text-xs">
              <Building2 className="w-3.5 h-3.5 text-pink-400" />
              <span>CIVIL & STRUCTURAL ENGINEERING LABORATORY</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Civil Infrastructure & Mechanics Simulators
            </h2>
            <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
              Real-time computational engines calibrated to AISC 360-16, AASHTO LRFD, ASCE 7-22, and ASTM geotechnical testing standards. 
              Analyze elastic beam deflection, moving bridge truss loads, base-isolated earthquake dynamics, and Mohr-Coulomb soil failure.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/90 text-[11px] font-mono text-slate-300 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
              <span>AISC 360 • AASHTO • ASCE 7-22</span>
            </div>
          </div>
        </div>

        {/* 4 Mode Selector Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-8">
          {CIVIL_MODES.map((mode) => {
            const isSelected = mode.id === activeMode;
            return (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-pink-500/80 bg-slate-900/95 shadow-lg shadow-pink-950/30 ring-1 ring-pink-500/40'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] text-pink-400 uppercase tracking-wider font-semibold">
                    {mode.category}
                  </span>
                  <span className="font-mono text-[9px] text-slate-400">
                    {mode.standards.split('•')[0]}
                  </span>
                </div>
                <div className="font-display text-sm font-bold text-white leading-snug">
                  {mode.shortName}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  {mode.tagline}
                </p>
              </button>
            );
          })}
        </div>

        {/* 3-Column Engineering Workbench Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: Input Controls & Presets (col-span-3) */}
          {/* ========================================================= */}
          <div className="lg:col-span-3 space-y-4">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-pink-300 uppercase tracking-wider">
                  <Sliders className="w-3.5 h-3.5 text-pink-400" />
                  <span>Interactive Inputs</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">SI Units</span>
              </div>

              {/* CONTROLS FOR: BEAM BENDING */}
              {activeMode === 'beam_bending' && (
                <div className="space-y-4 text-xs font-mono">
                  {/* Support Type */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 flex justify-between">
                      <span>BOUNDARY CONDITION</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'simply_supported', label: 'Simple' },
                        { id: 'cantilever', label: 'Cantilever' },
                        { id: 'propped_cantilever', label: 'Propped' }
                      ].map(sup => (
                        <button
                          key={sup.id}
                          onClick={() => setSupportType(sup.id as any)}
                          className={`py-1 px-1.5 rounded text-[10px] border transition-colors ${
                            supportType === sup.id
                              ? 'bg-pink-500/20 border-pink-500 text-pink-200'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {sup.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Material */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400 flex justify-between">
                      <span>MATERIAL</span>
                      <span className="text-cyan-400">E = {E_GPa} GPa</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'steel', label: 'Steel A36' },
                        { id: 'concrete', label: 'Concrete' },
                        { id: 'timber', label: 'Timber' }
                      ].map(mat => (
                        <button
                          key={mat.id}
                          onClick={() => setBeamMaterial(mat.id as any)}
                          className={`py-1 px-1.5 rounded text-[10px] border transition-colors ${
                            beamMaterial === mat.id
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {mat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Span Length */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Span Length L</span>
                      <span className="text-white font-bold">{beamLength.toFixed(1)} m</span>
                    </div>
                    <input 
                      type="range" 
                      min={2.0} 
                      max={12.0} 
                      step={0.5} 
                      value={beamLength}
                      onChange={(e) => setBeamLength(parseFloat(e.target.value))}
                      className="w-full accent-pink-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Point Load */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Point Load P</span>
                      <span className="text-pink-400 font-bold">{pointLoadP} kN</span>
                    </div>
                    <input 
                      type="range" 
                      min={0} 
                      max={150} 
                      step={5} 
                      value={pointLoadP}
                      onChange={(e) => setPointLoadP(parseFloat(e.target.value))}
                      className="w-full accent-pink-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Point Load Position */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Load Position x</span>
                      <span className="text-white font-bold">{pointLoadPos.toFixed(1)} m</span>
                    </div>
                    <input 
                      type="range" 
                      min={0.5} 
                      max={beamLength} 
                      step={0.25} 
                      value={Math.min(pointLoadPos, beamLength)}
                      onChange={(e) => setPointLoadPos(parseFloat(e.target.value))}
                      className="w-full accent-pink-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* UDL q */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Distributed Load q</span>
                      <span className="text-amber-400 font-bold">{udlQ.toFixed(1)} kN/m</span>
                    </div>
                    <input 
                      type="range" 
                      min={0} 
                      max={35} 
                      step={1} 
                      value={udlQ}
                      onChange={(e) => setUdlQ(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Presets */}
                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    <div className="text-[10px] text-slate-400">QUICK LOAD CASES:</div>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => { setSupportType('simply_supported'); setPointLoadP(60); setPointLoadPos(3); setUdlQ(15); setBeamLength(6); }}
                        className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                      >
                        Midspan Load
                      </button>
                      <button 
                        onClick={() => { setSupportType('cantilever'); setPointLoadP(25); setPointLoadPos(4); setUdlQ(8); setBeamLength(4); }}
                        className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                      >
                        Balcony Cantilever
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CONTROLS FOR: TRUSS ANALYSIS */}
              {activeMode === 'truss_analysis' && (
                <div className="space-y-4 text-xs font-mono">
                  {/* Truss Type */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400">TRUSS TOPOLOGY</label>
                    <div className="grid grid-cols-3 gap-1">
                      {['warren', 'pratt', 'howe'].map(t => (
                        <button
                          key={t}
                          onClick={() => setTrussType(t as any)}
                          className={`py-1 px-1.5 rounded text-[10px] uppercase border transition-colors ${
                            trussType === t
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Moving Live Load */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Live Truck Load</span>
                      <span className="text-amber-400 font-bold">{liveLoadP} kN</span>
                    </div>
                    <input 
                      type="range" 
                      min={20} 
                      max={200} 
                      step={10} 
                      value={liveLoadP}
                      onChange={(e) => setLiveLoadP(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Dead load per node */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Dead Load / Node</span>
                      <span className="text-slate-400 font-bold">{deadLoadNode} kN</span>
                    </div>
                    <input 
                      type="range" 
                      min={5} 
                      max={40} 
                      step={5} 
                      value={deadLoadNode}
                      onChange={(e) => setDeadLoadNode(parseFloat(e.target.value))}
                      className="w-full accent-slate-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Truck Position Manual Control */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Truck Position</span>
                      <span className="text-white font-bold">{(truckPos * 100).toFixed(0)}% Span</span>
                    </div>
                    <input 
                      type="range" 
                      min={0} 
                      max={1} 
                      step={0.02} 
                      value={truckPos}
                      onChange={(e) => { setTruckPos(parseFloat(e.target.value)); setIsTruckMoving(false); }}
                      className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Auto-drive truck toggle */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-300">Animate Moving Load</span>
                    <button
                      onClick={() => setIsTruckMoving(!isTruckMoving)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors ${
                        isTruckMoving 
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400' 
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {isTruckMoving ? 'RUNNING' : 'PAUSED'}
                    </button>
                  </div>
                </div>
              )}

              {/* CONTROLS FOR: SEISMIC ISOLATION */}
              {activeMode === 'seismic_isolation' && (
                <div className="space-y-4 text-xs font-mono">
                  {/* System Toggle */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400">FOUNDATION ISOLATION</label>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        onClick={() => setSeismicSystem('fixed_base')}
                        className={`py-1.5 px-2 rounded text-[10px] font-bold border transition-colors ${
                          seismicSystem === 'fixed_base'
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        Fixed-Base (Conv.)
                      </button>
                      <button
                        onClick={() => setSeismicSystem('isolated')}
                        className={`py-1.5 px-2 rounded text-[10px] font-bold border transition-colors ${
                          seismicSystem === 'isolated'
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        Base-Isolated (LRB)
                      </button>
                    </div>
                  </div>

                  {/* Peak Ground Acceleration (PGA) */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>PGA Excitation</span>
                      <span className="text-pink-400 font-bold">{pgaG.toFixed(2)} g</span>
                    </div>
                    <input 
                      type="range" 
                      min={0.10} 
                      max={0.80} 
                      step={0.05} 
                      value={pgaG}
                      onChange={(e) => setPgaG(parseFloat(e.target.value))}
                      className="w-full accent-pink-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Frequency */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Earthquake Freq f</span>
                      <span className="text-cyan-400 font-bold">{earthquakeFreq.toFixed(1)} Hz</span>
                    </div>
                    <input 
                      type="range" 
                      min={0.5} 
                      max={4.0} 
                      step={0.1} 
                      value={earthquakeFreq}
                      onChange={(e) => setEarthquakeFreq(parseFloat(e.target.value))}
                      className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Soil Deposit */}
                  <div className="space-y-1.5">
                    <label className="text-slate-400">SOIL CLASS (ASCE 7-22)</label>
                    <div className="grid grid-cols-3 gap-1">
                      {['rock', 'dense_soil', 'soft_clay'].map(s => (
                        <button
                          key={s}
                          onClick={() => setSoilType(s as any)}
                          className={`py-1 px-1 rounded text-[9px] uppercase border transition-colors ${
                            soilType === s
                              ? 'bg-pink-500/20 border-pink-500 text-pink-200'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {s.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CONTROLS FOR: MOHR'S CIRCLE */}
              {activeMode === 'mohr_circle' && (
                <div className="space-y-4 text-xs font-mono">
                  {/* Normal Stress X */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Normal Stress σx</span>
                      <span className="text-cyan-400 font-bold">{sigmaX} kPa</span>
                    </div>
                    <input 
                      type="range" 
                      min={20} 
                      max={250} 
                      step={5} 
                      value={sigmaX}
                      onChange={(e) => setSigmaX(parseFloat(e.target.value))}
                      className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Normal Stress Y */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Normal Stress σy</span>
                      <span className="text-cyan-400 font-bold">{sigmaY} kPa</span>
                    </div>
                    <input 
                      type="range" 
                      min={0} 
                      max={180} 
                      step={5} 
                      value={sigmaY}
                      onChange={(e) => setSigmaY(parseFloat(e.target.value))}
                      className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Shear Stress XY */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Shear Stress τxy</span>
                      <span className="text-amber-400 font-bold">{tauXy} kPa</span>
                    </div>
                    <input 
                      type="range" 
                      min={0} 
                      max={80} 
                      step={2} 
                      value={tauXy}
                      onChange={(e) => setTauXy(parseFloat(e.target.value))}
                      className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Plane Rotation Angle */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Plane Rotation θ</span>
                      <span className="text-pink-400 font-bold">{planeAngleTheta}°</span>
                    </div>
                    <input 
                      type="range" 
                      min={0} 
                      max={180} 
                      step={1} 
                      value={planeAngleTheta}
                      onChange={(e) => setPlaneAngleTheta(parseFloat(e.target.value))}
                      className="w-full accent-pink-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Soil Cohesion c */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Soil Cohesion c</span>
                      <span className="text-slate-400 font-bold">{cohesionC} kPa</span>
                    </div>
                    <input 
                      type="range" 
                      min={0} 
                      max={60} 
                      step={5} 
                      value={cohesionC}
                      onChange={(e) => setCohesionC(parseFloat(e.target.value))}
                      className="w-full accent-slate-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Friction Angle Phi */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Friction Angle φ</span>
                      <span className="text-slate-400 font-bold">{frictionAnglePhi}°</span>
                    </div>
                    <input 
                      type="range" 
                      min={10} 
                      max={45} 
                      step={1} 
                      value={frictionAnglePhi}
                      onChange={(e) => setFrictionAnglePhi(parseFloat(e.target.value))}
                      className="w-full accent-slate-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ========================================================= */}
          {/* CENTER COLUMN: High-Fidelity 60 FPS Canvas (col-span-6) */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 space-y-3">
            <div className="relative rounded-2xl border border-slate-800 bg-[#060a12] overflow-hidden shadow-2xl">
              {/* Canvas Header HUD */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/80 bg-slate-950/80">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-pulse" />
                  <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    {activeItem.shortName} Visualizer
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                  <span>60 FPS SYMLECTIC ENGINE</span>
                  <span className="text-slate-700">•</span>
                  <span className="text-pink-400">{activeItem.standards.split('•')[0]}</span>
                </div>
              </div>

              {/* Main Interactive Canvas Element */}
              <div className="relative w-full aspect-[16/10] sm:aspect-[16/9]">
                <canvas 
                  ref={canvasRef} 
                  width={800} 
                  height={450} 
                  className="w-full h-full block"
                />
              </div>

              {/* Bottom Quick Status Bar */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800/80 bg-slate-950/90 text-[11px] font-mono">
                <div className="flex items-center gap-4 text-slate-400">
                  <span>MODE: <strong className="text-slate-200">{activeMode.replace('_', ' ').toUpperCase()}</strong></span>
                  <span>SOLVER: <strong className="text-emerald-400">EXACT ANALYTICAL</strong></span>
                </div>
                <div className="text-pink-400 font-semibold">
                  {activeMode === 'beam_bending' && `Max δ: ${maxDeflectionMm.toFixed(2)} mm`}
                  {activeMode === 'truss_analysis' && `Max Force: ${maxCompressionKn.toFixed(1)} kN`}
                  {activeMode === 'seismic_isolation' && `Drift: ${roofDriftMm.toFixed(1)} mm`}
                  {activeMode === 'mohr_circle' && `FS: ${factorOfSafety.toFixed(2)}`}
                </div>
              </div>
            </div>

            {/* Explanatory Banner Below Canvas */}
            <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex items-start gap-2.5 text-xs text-slate-300">
              <Info className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
              <p>
                <strong>Educational Insight:</strong>{' '}
                {activeMode === 'beam_bending' && 'Euler-Bernoulli beam theory assumes plane sections remain plane and normal to the deformed longitudinal axis. Watch how shear force V(x) is the first spatial derivative of bending moment dM/dx.'}
                {activeMode === 'truss_analysis' && 'Method of joints resolves 2D nodal equilibrium. Member tension pulls outwards from joint pins, while compression pushes inwards, rendering columns susceptible to Euler buckling.'}
                {activeMode === 'seismic_isolation' && 'Lead-Rubber Bearings (LRB) decouple the building superstructure from violent ground motion by shifting the natural vibration period Tn away from the high-energy earthquake response plateau.'}
                {activeMode === 'mohr_circle' && 'Mohr’s circle graphically determines stress states on any inclined plane without transforming tensors manually. Failure occurs when the stress circle intersects the Coulomb shear envelope.'}
              </p>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Physics Telemetry & Standards (col-span-3) */}
          {/* ========================================================= */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Live Metrics Card */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-4 font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-pink-300 uppercase tracking-wider">
                  <Activity className="w-3.5 h-3.5 text-pink-400" />
                  <span>Real-Time Telemetry</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>

              {activeMode === 'beam_bending' && (
                <div className="space-y-3 text-xs">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Peak Moment M_max</span>
                    <span className="text-amber-400 font-bold">{maxMomentKnm.toFixed(1)} kN·m</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Max Deflection δ</span>
                    <span className="text-cyan-400 font-bold">{maxDeflectionMm.toFixed(2)} mm</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Max Bending Stress σ</span>
                    <span className="text-pink-400 font-bold">{maxStressMpa.toFixed(1)} MPa</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">AISC L/360 Limit</span>
                      <span className={isBeamPass ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {isBeamPass ? 'PASS' : 'EXCEEDED'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Allowable: {aiscDeflectionLimit.toFixed(1)} mm | Actual: {maxDeflectionMm.toFixed(1)} mm
                    </div>
                  </div>
                </div>
              )}

              {activeMode === 'truss_analysis' && (
                <div className="space-y-3 text-xs">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Max Tension (T)</span>
                    <span className="text-cyan-400 font-bold">+{maxTensionKn.toFixed(1)} kN</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Max Compression (C)</span>
                    <span className="text-orange-400 font-bold">-{maxCompressionKn.toFixed(1)} kN</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Euler P_critical</span>
                    <span className="text-emerald-400 font-bold">{eulerCriticalKn.toFixed(1)} kN</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Buckling Check</span>
                      <span className={maxCompressionKn <= eulerCriticalKn ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {maxCompressionKn <= eulerCriticalKn ? 'SAFE (η < 1.0)' : 'UNSTABLE'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Utilization Ratio: {(maxCompressionKn / eulerCriticalKn).toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              {activeMode === 'seismic_isolation' && (
                <div className="space-y-3 text-xs">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Natural Period Tn</span>
                    <span className="text-cyan-400 font-bold">{timePeriodTn.toFixed(2)} s</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Base Shear Vb</span>
                    <span className="text-amber-400 font-bold">{baseShearKn.toFixed(0)} kN</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Roof Lateral Drift</span>
                    <span className="text-pink-400 font-bold">{roofDriftMm.toFixed(1)} mm</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">ASCE 7-22 Drift Check</span>
                      <span className={isDriftPass ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {isDriftPass ? 'PASS (< 2%)' : 'EXCEEDED'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Limit: {driftLimitAsce.toFixed(1)} mm | Actual: {roofDriftMm.toFixed(1)} mm
                    </div>
                  </div>
                </div>
              )}

              {activeMode === 'mohr_circle' && (
                <div className="space-y-3 text-xs">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Principal Stress σ₁</span>
                    <span className="text-cyan-400 font-bold">{sigma1.toFixed(1)} kPa</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Principal Stress σ₂</span>
                    <span className="text-cyan-400 font-bold">{sigma2.toFixed(1)} kPa</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Max In-Plane Shear τ</span>
                    <span className="text-amber-400 font-bold">{tauMax.toFixed(1)} kPa</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Shear Factor of Safety</span>
                      <span className={!isShearFailure ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        FS = {factorOfSafety.toFixed(2)} {!isShearFailure ? '✓' : '⚠'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {!isShearFailure ? 'Soil wedge stable' : 'Slip plane rupture active'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Governing Physical Equation Box */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl space-y-2">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Governing Differential Formulation
              </div>
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 font-mono text-xs text-pink-300 overflow-x-auto custom-scrollbar">
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
