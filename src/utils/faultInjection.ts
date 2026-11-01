/**
 * Industrial Fault Injection & Safe Operating Area (SOA) Engine
 * Provides authentic industrial failure mode presets (e.g. Cavitation, Loop Brownout,
 * Resonance Surge, Thermal Runaway) and renders dynamic Safe Operating Area (SOA)
 * vs Alarm/Trip Zones directly onto the HTML5 simulation canvas.
 */
import { SimulatorItem } from '../types';

export interface FaultPresetDefinition {
  id: string;
  title: string;
  badge: string;
  description: string;
  faultParams: Record<string, number>;
  standardReference: string;
  alarmTriggerText: string;
}

export const SIMULATOR_FAULT_PRESETS: Record<string, FaultPresetDefinition> = {
  control_valve: {
    id: 'valve-cavitation-choke',
    title: 'Cavitation & Choked Flow',
    badge: 'IEC 60534 TRIP',
    description: 'Upstream pressure spikes to 12.0 bar while downstream drops to 1.0 bar (ΔP/P1 > xT). Liquid flashes into vapor at vena contracta, causing sonic choked flow and destructive valve trim cavitation.',
    faultParams: { upstreamP: 12.0, downstreamP: 1.0, travelPercent: 95, flFactor: 0.65 },
    standardReference: 'IEC 60534-2-1 §5.3 / ISA-75.01.01 Choked Vaporization',
    alarmTriggerText: 'ALARM: Vena contracta pressure < Pv. Cavitation index Kc < 0.6. Trim erosion active.',
  },

  current_loop: {
    id: 'loop-compliance-brownout',
    title: 'Loop Supply Brownout',
    badge: 'NAMUR NE 43 TRIP',
    description: 'Loop supply collapses to 11.5 V while load resistance remains high (600 Ω). Terminal voltage collapses below the 12.0 V compliance limit, starving the transmitter and clipping process telemetry.',
    faultParams: { supplyVoltage: 11.5, loadResistance: 600, wireResistance: 25, processPressure: 9.0 },
    standardReference: 'IEC 60381-1 / NAMUR NE 43 Compliance Voltage Floor',
    alarmTriggerText: 'TRIP: Transmitter terminal V_tx < 12.0 V. Compliance voltage starvation!',
  },

  rlc: {
    id: 'rlc-resonance-surge',
    title: 'Resonance Overvoltage Surge',
    badge: 'IEEE 1459 SURGE',
    description: 'Damping resistance lowered to 2.0 Ω while excitation frequency locks directly to f₀ (103 Hz). Reactances cancel completely, causing a violent current surge and capacitive dielectric overvoltage.',
    faultParams: { resistance: 2.0, inductance: 60, capacitance: 40, frequency: 103 },
    standardReference: 'IEEE 1459 / IEC 60076 Subsynchronous Resonance',
    alarmTriggerText: 'ALERT: Series LC resonance! Loop impedance |Z| ≈ R. Overcurrent exceeds rated I_max.',
  },

  igbt_thermal: {
    id: 'igbt-thermal-runaway',
    title: 'IGBT Thermal Runaway',
    badge: 'JESD51 OVERTEMP',
    description: 'Collector current pushed to 140 A at 25 kHz carrier frequency with clogged heatsink (Rth = 0.45 °C/W). Junction temperature accelerates past 175 °C silicon die threshold, triggering destructive gate puncture.',
    faultParams: { collectorCurrent: 140, switchingFreq: 25, dutyCycle: 0.70, heatsinkRth: 0.45 },
    standardReference: 'IEC 60747-9 / JESD51 Maximum Junction Operating Limit',
    alarmTriggerText: 'CRITICAL TRIP: Tj > 175°C! Silicon thermal runaway in progress. Gate oxide breakdown.',
  },

  sic_switching: {
    id: 'sic-inductive-slew',
    title: 'Ultra-Fast dv/dt Ringing',
    badge: 'IEC 60747-19 FAULT',
    description: 'Gate resistance dropped to 1.0 Ω under 50 nH stray bus inductance. Switching dv/dt exceeds 85 V/ns, creating massive voltage overshoot spikes that puncture drain-source dielectric.',
    faultParams: { busVoltage: 750, loadCurrent: 50, gateResistance: 1.0, strayInductance: 50 },
    standardReference: 'IEC 60747-19 Wide-Bandgap Power Transistor Switching Limits',
    alarmTriggerText: 'ALARM: dv/dt > 80 V/ns. Stray inductive voltage spike exceeds V_BR breakdown ceiling.',
  },

  beam_deflection: {
    id: 'beam-plastic-collapse',
    title: 'Plastic Hinge Collapse',
    badge: 'AISC 360 YIELD',
    description: 'Concentrated midspan point load increased to 150 kN on an unbraced steel girder. Maximum flexural stress exceeds yield strength (Fy = 355 MPa), producing plastic hinge formation and severe sagging.',
    faultParams: { pointLoad: 150, span: 8.0, loadPos: 4.0, elasticModulus: 180 },
    standardReference: 'AISC 360-16 Chapter F / Eurocode 3 Plastic Moment Capacity',
    alarmTriggerText: 'TRIP: M_max > M_yield! Midspan deflection δ > L/180. Structural hinge formed.',
  },

  distillation_column: {
    id: 'dist-sherwood-flood',
    title: 'Vapor Flooding & Entrainment',
    badge: 'API 521 OVERPRESSURE',
    description: 'Vapor boilup and reflux ratio overloaded beyond the Sherwood hydraulic capacity. Liquid accumulates in tray downcomers, inducing total liquid carryover into overhead condensers.',
    faultParams: { refluxRatio: 0.65, feedComposition: 0.60, relativeVolatility: 1.6, feedCondition: 1.1 },
    standardReference: 'API 521 / Kister Distillation Column Hydraulic Flooding',
    alarmTriggerText: 'ALERT: Downcomer backup > 85%. Liquid entrainment detected. Separation lost.',
  },

  harmonic: {
    id: 'harm-destructive-resonance',
    title: 'Destructive Mechanical Resonance',
    badge: 'ISO 10816 TRIP',
    description: 'Viscous damping coefficient reduced to c = 0.5 N·s/m with shaker frequency locked to natural frequency fn (1.33 Hz). Dynamic magnification M > 12x causes violent amplitude runaway.',
    faultParams: { mass: 5.0, stiffness: 350, dampingC: 0.5, driveFreq: 1.33 },
    standardReference: 'ISO 10816-3 Mechanical Vibration Severity Standards',
    alarmTriggerText: 'TRIP: Vibration severity exceeds Zone D (>11.2 mm/s RMS). Mechanical fatigue danger.',
  },

  heat_exchanger: {
    id: 'hx-severe-fouling',
    title: 'Severe Tube Fouling',
    badge: 'TEMA CLASS R FAULT',
    description: 'Hot process flow throttled while tube fouling resistance accumulates. Temperature cross occurs, dropping thermal effectiveness below 35% and triggering process stream overheating.',
    faultParams: { hotInletTemp: 160, coldInletTemp: 45, hotFlowRate: 2.0, coldFlowRate: 3.5 },
    standardReference: 'TEMA Standards Section 5 / ASME Sec VIII Div 1',
    alarmTriggerText: 'WARNING: Thermal effectiveness < 40%. Severe heat transfer bottleneck.',
  },

  pid: {
    id: 'pid-windup-cycling',
    title: 'Integrator Windup & Oscillation',
    badge: 'ISA 5.1 INSTABILITY',
    description: 'Proportional gain set excessively high (Kp = 15.0) with very fast reset time (Ti = 0.4s). System enters sustained non-linear limit cycling with 100% actuator valve saturation.',
    faultParams: { kp: 15.0, ti: 0.4, td: 1.2, setpoint: 85 },
    standardReference: 'ISA-5.1 / IEC 61511 Closed-Loop Safety Instrument Systems',
    alarmTriggerText: 'ALERT: Loop oscillating with 100% actuator hunting. Phase margin collapsed < 10°.',
  },

  column_buckling: {
    id: 'column-euler-buckling',
    title: 'Euler Bifurcation Buckling',
    badge: 'AISC E3 COLLAPSE',
    description: 'Axial load exceeds Euler critical buckling threshold P_cr = π²EI / (KL)². Prismatic column experiences elastic instability bifurcation with explosive lateral bowing.',
    faultParams: { axialLoad: 6500, length: 7.5, kFactor: 1.2, imperfection: 25 },
    standardReference: 'AISC 360-16 Chapter E / Column Buckling Capacity',
    alarmTriggerText: 'CRITICAL TRIP: P_axial > P_critical! Elastic bifurcation buckling underway.',
  },

  centrifugal_pump: {
    id: 'pump-npsh-cavitation',
    title: 'NPSH Starvation Cavitation',
    badge: 'HI 9.6.1 CAVITATION',
    description: 'Impeller speed surged while static suction head drops. Available NPSH falls below required NPSH_r, triggering explosive vapor cavitation at impeller blade leading edges.',
    faultParams: { pumpSpeed: 2400, impellerDia: 250, staticHead: 5, systemResistanceK: 0.001 },
    standardReference: 'Hydraulic Institute HI 9.6.1 NPSH Margin Standard',
    alarmTriggerText: 'ALARM: NPSHa < NPSHr! Impeller cavitation shockwaves active. Acoustic roar.',
  },
};

/**
 * Resolves the tailored fault preset for any simulator, with universal fallback
 */
export function getSimulatorFaultPreset(
  simulatorType: string,
  simulator?: SimulatorItem
): FaultPresetDefinition {
  if (SIMULATOR_FAULT_PRESETS[simulatorType]) {
    return SIMULATOR_FAULT_PRESETS[simulatorType];
  }

  // Fallback dynamic generator using the simulator's extreme parameter ranges
  const p1 = simulator?.parameters[0];
  const p2 = simulator?.parameters[1] || p1;
  const faultParams: Record<string, number> = {};

  if (p1) faultParams[p1.id] = p1.max;
  if (p2) faultParams[p2.id] = p2.min;

  return {
    id: `${simulatorType}-industrial-fault`,
    title: `${simulator?.title || 'Industrial'} Boundary Stress Fault`,
    badge: 'SAFETY TRIP',
    description: `Drives operational parameters to maximum design limits (${p1?.name || 'Input'} = ${p1?.max || 100}) to test safety interlocks and safe operating area boundaries.`,
    faultParams,
    standardReference: simulator?.standardReference || 'IEC / IEEE Consensus Engineering Standard',
    alarmTriggerText: 'ALERT: Operating parameters driven to extreme safety envelope boundary.',
  };
}

/**
 * Evaluates whether current live parameters place the simulator into the Fault / Trip zone
 */
export function isSimulatorInFaultZone(
  simulatorType: string,
  params: Record<string, number>
): boolean {
  switch (simulatorType) {
    case 'control_valve': {
      const P1 = params['upstreamP'] ?? 6.0;
      const P2 = params['downstreamP'] ?? 3.5;
      const xT = params['flFactor'] ?? 0.75;
      return (P1 - P2) / P1 >= xT * 0.95;
    }
    case 'current_loop': {
      const Vsupply = params['supplyVoltage'] ?? 24;
      const Rwire = params['wireResistance'] ?? 15;
      const Rload = params['loadResistance'] ?? 250;
      const P = params['processPressure'] ?? 4.5;
      const I_mA = 4.0 + 16.0 * (P / 10);
      const Vtx = Vsupply - (I_mA / 1000) * (Rwire + Rload);
      return Vtx < 12.0;
    }
    case 'rlc': {
      const R = params['resistance'] ?? 25;
      const L = (params['inductance'] ?? 60) * 1e-3;
      const C = (params['capacitance'] ?? 40) * 1e-6;
      const f = params['frequency'] ?? 100;
      const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
      return Math.abs(f - f0) < 6 && R < 8;
    }
    case 'igbt_thermal': {
      const Ic = params['collectorCurrent'] ?? 80;
      const fsw = params['switchingFreq'] ?? 12;
      const Rth = params['heatsinkRth'] ?? 0.25;
      return Ic > 120 && fsw > 18 && Rth > 0.35;
    }
    case 'beam_deflection': {
      const P = params['pointLoad'] ?? 40;
      const L = params['span'] ?? 6.0;
      return P * L > 500;
    }
    case 'harmonic': {
      const f_drive = params['driveFreq'] ?? 1.33;
      const c = params['dampingC'] ?? 4;
      return Math.abs(f_drive - 1.33) < 0.1 && c < 1.0;
    }
    default:
      return false;
  }
}

/**
 * Renders the Safe Operating Area (SOA) vs Warning vs Alarm/Trip Overlay onto the HTML5 Canvas
 */
export function renderSoaOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  simulatorType: string,
  params: Record<string, number>,
  isFaultActive: boolean
): void {
  ctx.save();

  // 1. Vertical SOA Gauge on right edge of canvas
  const gaugeW = 14;
  const gaugeH = Math.min(180, h * 0.45);
  const gaugeX = w - gaugeW - 14;
  const gaugeY = Math.max(38, h * 0.25);

  // Background track
  ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
  ctx.strokeStyle = 'rgba(71, 85, 105, 0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(gaugeX, gaugeY, gaugeW, gaugeH, 4);
  ctx.fill();
  ctx.stroke();

  // Zone 1: Green Safe Operating Area (bottom 60%)
  const soaH = gaugeH * 0.60;
  const soaY = gaugeY + gaugeH - soaH;
  const greenGrad = ctx.createLinearGradient(0, soaY + soaH, 0, soaY);
  greenGrad.addColorStop(0, 'rgba(16, 185, 129, 0.7)');
  greenGrad.addColorStop(1, 'rgba(6, 182, 212, 0.6)');
  ctx.fillStyle = greenGrad;
  ctx.fillRect(gaugeX + 2, soaY, gaugeW - 4, soaH - 2);

  // Zone 2: Amber Marginal Warning Zone (next 22%)
  const warnH = gaugeH * 0.22;
  const warnY = soaY - warnH;
  ctx.fillStyle = 'rgba(245, 158, 11, 0.75)';
  ctx.fillRect(gaugeX + 2, warnY, gaugeW - 4, warnH);

  // Zone 3: Red Alarm / Trip Zone (top 18%)
  const tripH = gaugeH * 0.18;
  const tripY = gaugeY + 2;
  ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
  ctx.fillRect(gaugeX + 2, tripY, gaugeW - 4, tripH);

  // Calculate current operating needle position (0.0 = safe bottom, 1.0 = top trip)
  let severityRatio = 0.35; // default nominal
  if (isFaultActive || isSimulatorInFaultZone(simulatorType, params)) {
    severityRatio = 0.92;
  } else {
    // Dynamic ratio based on simulator metrics
    switch (simulatorType) {
      case 'control_valve': {
        const P1 = params['upstreamP'] ?? 6.0;
        const P2 = params['downstreamP'] ?? 3.5;
        const xT = params['flFactor'] ?? 0.75;
        severityRatio = Math.min(1.0, Math.max(0.1, (P1 - P2) / P1 / xT));
        break;
      }
      case 'current_loop': {
        const Vsupply = params['supplyVoltage'] ?? 24;
        const Rwire = params['wireResistance'] ?? 15;
        const Rload = params['loadResistance'] ?? 250;
        const drop = (20.0 / 1000) * (Rwire + Rload);
        const Vtx = Vsupply - drop;
        severityRatio = Math.min(1.0, Math.max(0.1, 1.0 - (Vtx - 10) / 14));
        break;
      }
      case 'rlc': {
        const R = params['resistance'] ?? 25;
        const f = params['frequency'] ?? 100;
        severityRatio = Math.min(1.0, Math.max(0.1, (100 - R) / 100 + (f > 95 && f < 110 ? 0.4 : 0)));
        break;
      }
      case 'igbt_thermal': {
        const Ic = params['collectorCurrent'] ?? 80;
        severityRatio = Math.min(1.0, Math.max(0.1, Ic / 150));
        break;
      }
      default:
        severityRatio = 0.40;
    }
  }

  // Pointer indicator on the gauge
  const needleY = gaugeY + gaugeH - severityRatio * gaugeH;
  ctx.fillStyle = severityRatio > 0.82 ? '#f43f5e' : severityRatio > 0.60 ? '#f59e0b' : '#38bdf8';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(gaugeX - 6, needleY);
  ctx.lineTo(gaugeX + 1, needleY - 4);
  ctx.lineTo(gaugeX + 1, needleY + 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Zone boundary labels
  ctx.font = 'bold 8px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#ef4444';
  ctx.fillText('TRIP', gaugeX - 26, tripY + 10);
  ctx.fillStyle = '#f59e0b';
  ctx.fillText('WARN', gaugeX - 28, warnY + 10);
  ctx.fillStyle = '#10b981';
  ctx.fillText('SOA', gaugeX - 24, soaY + soaH - 6);

  // Top Banner Badge
  const isTrip = severityRatio > 0.82;
  const isWarn = severityRatio > 0.60 && !isTrip;
  const bannerW = 200;
  const bannerH = 22;
  const bannerX = w - bannerW - 14;
  const bannerY = 10;

  ctx.fillStyle = isTrip
    ? 'rgba(159, 18, 57, 0.92)'
    : isWarn
    ? 'rgba(120, 53, 15, 0.90)'
    : 'rgba(6, 78, 59, 0.85)';
  ctx.strokeStyle = isTrip ? '#f43f5e' : isWarn ? '#f59e0b' : '#10b981';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 5);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#ffffff';
  const statusMsg = isTrip
    ? '⚠️ ALARM / TRIP: SOA EXCEEDED'
    : isWarn
    ? '⚡ MARGINAL SOA: WARNING ZONE'
    : '🛡️ SAFE OPERATING AREA: 100% OK';
  ctx.fillText(statusMsg, bannerX + 8, bannerY + 14);

  // If in Trip Zone, draw a subtle flashing red perimeter glow
  if (isTrip) {
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, w - 4, h - 4);
  }

  ctx.restore();
}
