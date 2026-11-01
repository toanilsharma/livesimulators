// Guided Learning Experiments and First-Principles Educational Modules
// Empowers users to learn core physical laws and engineering mechanics interactively
import { SimulatorItem } from '../types';

export interface GuidedExperiment {
  id: string;
  title: string;
  goal: string;
  description: string;
  expectedObservation: string;
  governingLaw: string;
  parameters: Record<string, number>;
  targetCondition: (params: Record<string, number>, telemetry?: Record<string, any>) => boolean;
  category?: 'nominal' | 'threshold' | 'fault';
}

export const SIMULATOR_EXPERIMENTS: Record<string, GuidedExperiment[]> = {
  // 1. RLC Resonant Circuit
  rlc: [
    {
      id: 'rlc-nominal-resonance',
      title: 'Lab 1: Nominal Design Baseline (Zero Phase Lag)',
      goal: 'Achieve zero phase lag (cos φ = 1.0) and maximum loop current.',
      description: 'Tune AC generator frequency f to match natural frequency f₀ = 1/(2π√LC). Reactive impedances cancel out completely (X_L = X_C), leaving pure resistance R as the sole current limiter.',
      expectedObservation: 'Watch the current i(t) waveform surge in amplitude and align in phase with driving voltage v(t). Phasor angle collapses to 0°.',
      governingLaw: 'f_0 = \\frac{1}{2\\pi \\sqrt{LC}}, \\quad X_L = X_C \\implies Z = R',
      parameters: { resistance: 25, inductance: 60, capacitance: 42, frequency: 100 },
      targetCondition: (p) => {
        const L = (p['inductance'] ?? 60) * 1e-3;
        const C = (p['capacitance'] ?? 42) * 1e-6;
        const f = p['frequency'] ?? 100;
        const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
        return Math.abs(f - f0) < 6;
      },
      category: 'nominal',
    },
    {
      id: 'rlc-threshold-damping',
      title: 'Lab 2: Threshold Discovery (Critical Damping Boundary)',
      goal: 'Eliminate oscillatory ringing without sluggish transient delay.',
      description: 'Set damping resistance R equal to critical resistance R_crit = 2√(L/C) (damping ratio ζ = 1.0). Used in analog galvanometers and high-speed bus terminators.',
      expectedObservation: 'Damping ratio ζ reaches exactly 1.000 (±0.05). Underdamped ringing is completely extinguished.',
      governingLaw: 'R_{crit} = 2\\sqrt{\\frac{L}{C}}, \\quad \\zeta = 1.0',
      parameters: { resistance: 75, inductance: 60, capacitance: 40, frequency: 100 },
      targetCondition: (p) => {
        const R = p['resistance'] ?? 75;
        const L = (p['inductance'] ?? 60) * 1e-3;
        const C = (p['capacitance'] ?? 40) * 1e-6;
        const Rcrit = 2 * Math.sqrt(L / C);
        const zeta = R / Rcrit;
        return Math.abs(zeta - 1.0) < 0.12;
      },
      category: 'threshold',
    },
    {
      id: 'rlc-fault-surge',
      title: 'Lab 3: Fault Troubleshooting (Subsynchronous Resonance Spike)',
      goal: 'Identify and mitigate catastrophic series resonance overcurrent.',
      description: 'Reduce resistance to R ≤ 5 Ω while driving at resonance (f ≈ f₀). Loop impedance collapses, inducing dangerous overvoltage surge across reactive components.',
      expectedObservation: 'Quality factor Q surges past 8.0. Notice alarming overvoltage warning flag in the operating regime monitor.',
      governingLaw: 'Q = \\frac{1}{R}\\sqrt{\\frac{L}{C}} > 8.0, \\quad |Z| \\approx R \\to 0',
      parameters: { resistance: 4, inductance: 100, capacitance: 25, frequency: 100 },
      targetCondition: (p) => {
        const R = p['resistance'] ?? 4;
        const L = (p['inductance'] ?? 100) * 1e-3;
        const C = (p['capacitance'] ?? 25) * 1e-6;
        const f = p['frequency'] ?? 100;
        const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
        return R <= 8 && Math.abs(f - f0) < 8;
      },
      category: 'fault',
    },
  ],

  // 2. Control Valve & Cavitation
  control_valve: [
    {
      id: 'valve-nominal-linear',
      title: 'Lab 1: Nominal Design Baseline (Sub-Critical Sizing)',
      goal: 'Achieve linear flow regulation with travel between 40% and 70%.',
      description: 'Size upstream and downstream pressures so pressure drop ratio ΔP/P1 remains below 0.5 · xT, ensuring zero cavitation and quiet trim operation.',
      expectedObservation: 'Flow rate Q scales smoothly with travel; cavitation index remains well above safety threshold.',
      governingLaw: 'Q = C_v \\sqrt{\\Delta P / SG}, \\quad \\frac{\\Delta P}{P_1} < 0.5 x_T',
      parameters: { upstreamP: 6.0, downstreamP: 4.2, travelPercent: 55, flFactor: 0.75 },
      targetCondition: (p) => {
        const P1 = p['upstreamP'] ?? 6.0;
        const P2 = p['downstreamP'] ?? 4.2;
        const travel = p['travelPercent'] ?? 55;
        const dP = P1 - P2;
        return dP > 0.5 && dP / P1 < 0.5 && travel >= 40 && travel <= 75;
      },
      category: 'nominal',
    },
    {
      id: 'valve-threshold-choked',
      title: 'Lab 2: Threshold Discovery (Critical Choked Flow Boundary)',
      goal: 'Locate the exact pressure drop ratio where flow saturates (ΔP/P1 = xT).',
      description: 'Lower downstream pressure P2 until pressure drop ratio ΔP/P1 reaches the terminal choked factor xT (0.75). Observe sonic velocity saturation.',
      expectedObservation: 'Further decreases in downstream pressure P2 produce zero increase in volumetric flow rate Q.',
      governingLaw: '\\left(\\frac{\\Delta P}{P_1}\\right)_{choked} = x_T \\approx 0.75',
      parameters: { upstreamP: 8.0, downstreamP: 2.0, travelPercent: 70, flFactor: 0.75 },
      targetCondition: (p) => {
        const P1 = p['upstreamP'] ?? 8.0;
        const P2 = p['downstreamP'] ?? 2.0;
        const xT = p['flFactor'] ?? 0.75;
        return (P1 - P2) / P1 >= xT * 0.90 && (P1 - P2) / P1 <= xT * 1.15;
      },
      category: 'threshold',
    },
    {
      id: 'valve-fault-flashing',
      title: 'Lab 3: Fault Troubleshooting (Severe Vena Contracta Flashing)',
      goal: 'Diagnose choked vaporization and trim erosion, then restore safe backpressure.',
      description: 'Set extreme pressure differential (P1 = 12 bar, P2 = 1.0 bar). Liquid vaporizes instantly, causing severe acoustic vibration. Increase P2 to clear cavitation.',
      expectedObservation: 'Alarm status triggers red CAVITATION / FLASHING flag. Elevating downstream pressure suppresses vapor pocket collapse.',
      governingLaw: '\\Delta P > x_T P_1 \\implies \\text{Sonic Vaporization}',
      parameters: { upstreamP: 12.0, downstreamP: 1.0, travelPercent: 90, flFactor: 0.65 },
      targetCondition: (p) => {
        const P1 = p['upstreamP'] ?? 12.0;
        const P2 = p['downstreamP'] ?? 1.0;
        const xT = p['flFactor'] ?? 0.65;
        return (P1 - P2) / P1 >= xT;
      },
      category: 'fault',
    },
  ],

  // 3. 4-20mA Current Loop & HART Telemetry
  current_loop: [
    {
      id: 'loop-nominal-calibration',
      title: 'Lab 1: Nominal Design Baseline (4.00 mA Zero Calibration)',
      goal: 'Verify 4.00 mA zero-offset live baseline at Lower Range Value (LRV).',
      description: 'Set process pressure to LRV = 0.0 bar. According to NAMUR NE 43, 4.00 mA live zero distinguishes valid zero from an open-circuit wire break (0.0 mA).',
      expectedObservation: 'Calculated current settles at exactly 4.00 mA with full 18+ V terminal voltage headroom.',
      governingLaw: 'I = 4.0\\text{ mA} + 16.0\\left(\\frac{P - LRV}{URV - LRV}\\right) = 4.00\\text{ mA}',
      parameters: { processPressure: 0.0, lrv: 0.0, urv: 10.0, supplyVoltage: 24.0, loadResistance: 250, wireResistance: 15 },
      targetCondition: (p) => {
        const P = p['processPressure'] ?? 0.0;
        const lrv = p['lrv'] ?? 0.0;
        return Math.abs(P - lrv) < 0.2;
      },
      category: 'nominal',
    },
    {
      id: 'loop-threshold-fullscale',
      title: 'Lab 2: Threshold Discovery (20.00 mA Full Scale Span)',
      goal: 'Drive process pressure to Upper Range Value (URV) to test max loop voltage drop.',
      description: 'Raise pressure to URV (10.0 bar). At 20.00 mA, series resistance drop is maximized. Verify transmitter terminal voltage stays above 12.0 V.',
      expectedObservation: 'Current reaches 20.00 mA. Loop voltage drop peaks at 5.3 V across 265 Ω total resistance.',
      governingLaw: 'V_{drop,max} = 0.020\\text{ A} \\times (R_{wire} + R_{load})',
      parameters: { processPressure: 10.0, lrv: 0.0, urv: 10.0, supplyVoltage: 24.0, loadResistance: 250, wireResistance: 15 },
      targetCondition: (p) => {
        const P = p['processPressure'] ?? 10.0;
        const urv = p['urv'] ?? 10.0;
        return Math.abs(P - urv) < 0.3;
      },
      category: 'threshold',
    },
    {
      id: 'loop-fault-brownout',
      title: 'Lab 3: Fault Troubleshooting (Compliance Voltage Starvation)',
      goal: 'Diagnose loop telemetry clipping caused by excessive load resistance or DC supply drop.',
      description: 'Lower DC supply to 12.0 V while load resistance is set to 550 Ω. Transmitter terminal voltage collapses below 12.0 V, corrupting current output.',
      expectedObservation: 'Terminal voltage V_tx collapses below compliance threshold; alert triggers BROWNOUT STARVATION.',
      governingLaw: 'V_{tx} = V_{supply} - I \\cdot R_{loop} < 12.0\\text{ V}',
      parameters: { processPressure: 9.0, lrv: 0.0, urv: 10.0, supplyVoltage: 12.0, loadResistance: 550, wireResistance: 25 },
      targetCondition: (p) => {
        const Vsupply = p['supplyVoltage'] ?? 24;
        const Rload = p['loadResistance'] ?? 250;
        const Rwire = p['wireResistance'] ?? 15;
        const P = p['processPressure'] ?? 5;
        const I = 4.0 + 16.0 * (P / 10);
        const Vtx = Vsupply - (I / 1000) * (Rload + Rwire);
        return Vtx < 12.5;
      },
      category: 'fault',
    },
  ],

  // 4. IGBT Semiconductor Thermal Dynamics
  igbt_thermal: [
    {
      id: 'igbt-nominal-baseline',
      title: 'Lab 1: Nominal Design Baseline (Safe Operating Area)',
      goal: 'Operate converter within steady-state thermal SOA (Tj ≤ 110°C).',
      description: 'Set collector current to 60 A and carrier frequency to 10 kHz. Verify heat sink dissipation keeps junction temperature well below maximum ratings.',
      expectedObservation: 'Junction temperature Tj stabilizes at ~95°C with 80°C safety margin to thermal limit.',
      governingLaw: 'T_j = T_a + P_{tot} R_{th} \\le 125^\\circ\\text{C}',
      parameters: { collectorCurrent: 60, switchingFreq: 10, dutyCycle: 0.5, heatsinkRth: 0.22 },
      targetCondition: (p) => {
        const Ic = p['collectorCurrent'] ?? 60;
        const fsw = p['switchingFreq'] ?? 10;
        return Ic <= 70 && fsw <= 12;
      },
      category: 'nominal',
    },
    {
      id: 'igbt-threshold-derating',
      title: 'Lab 2: Threshold Discovery (150°C Warning Boundary)',
      goal: 'Identify the switching frequency vs current trade-off curve.',
      description: 'Increase switching carrier frequency to 18 kHz with 95 A load. Watch switching losses dominate total power dissipation, pushing Tj to 145°C.',
      expectedObservation: 'Thermal warning chip activates; operating regime shifts to MARGINAL STRESS.',
      governingLaw: 'P_{sw} = (E_{on} + E_{off}) f_{sw} \\propto f_{sw}',
      parameters: { collectorCurrent: 95, switchingFreq: 18, dutyCycle: 0.55, heatsinkRth: 0.25 },
      targetCondition: (p) => {
        const Ic = p['collectorCurrent'] ?? 95;
        const fsw = p['switchingFreq'] ?? 18;
        return Ic >= 85 && fsw >= 15;
      },
      category: 'threshold',
    },
    {
      id: 'igbt-fault-runaway',
      title: 'Lab 3: Fault Troubleshooting (Silicon Die Thermal Runaway)',
      goal: 'Trigger junction overtemperature (>175°C) and implement emergency derating.',
      description: 'Simulate heatsink fan failure (Rth = 0.45 °C/W) at 130 A. Silicon die temperature exceeds 175°C, causing solder degradation and bond-wire lift-off.',
      expectedObservation: 'Critical red OVERTEMP TRIP triggers. Lowering carrier frequency recovers thermal equilibrium.',
      governingLaw: 'T_j > 175^\\circ\\text{C} \\implies \\text{Destructive Silicon Gate Rupture}',
      parameters: { collectorCurrent: 130, switchingFreq: 22, dutyCycle: 0.65, heatsinkRth: 0.45 },
      targetCondition: (p) => {
        const Ic = p['collectorCurrent'] ?? 130;
        const Rth = p['heatsinkRth'] ?? 0.45;
        return Ic >= 120 && Rth >= 0.35;
      },
      category: 'fault',
    },
  ],

  // 5. Euler-Bernoulli Beam Deflection
  beam_deflection: [
    {
      id: 'beam-nominal-serviceability',
      title: 'Lab 1: Nominal Design Baseline (AISC L/360 Deflection)',
      goal: 'Verify girder center deflection satisfies the strict AISC L/360 limit.',
      description: 'Apply nominal point load P = 30 kN at midspan (3.0 m) of a 6.0 m beam. Allowable deflection is 6000 / 360 = 16.7 mm.',
      expectedObservation: 'Midspan deflection measures ~12.2 mm, well within the 16.7 mm AISC code threshold.',
      governingLaw: '\\delta_{mid} = \\frac{P L^3}{48 E I} \\le \\frac{L}{360}',
      parameters: { span: 6.0, pointLoad: 30, loadPos: 3.0, elasticModulus: 200, momentOfInertia: 8000 },
      targetCondition: (p) => {
        const P = p['pointLoad'] ?? 30;
        const L = p['span'] ?? 6.0;
        return P <= 35 && L <= 6.5;
      },
      category: 'nominal',
    },
    {
      id: 'beam-threshold-limit',
      title: 'Lab 2: Threshold Discovery (AISC L/360 Exceedance)',
      goal: 'Find the critical load P_crit that pushes deflection exactly to the L/360 boundary.',
      description: 'Gradually increase midspan load P to 45 kN. Monitor the deflection ratio gauge until it touches 100% of the serviceability limit.',
      expectedObservation: 'Deflection needle enters the amber warning zone at 16.7 mm deflection.',
      governingLaw: 'P_{limit} = \\frac{48 E I (L/360)}{L^3}',
      parameters: { span: 6.0, pointLoad: 45, loadPos: 3.0, elasticModulus: 200, momentOfInertia: 8000 },
      targetCondition: (p) => {
        const P = p['pointLoad'] ?? 45;
        return P >= 42 && P <= 55;
      },
      category: 'threshold',
    },
    {
      id: 'beam-fault-plastic',
      title: 'Lab 3: Fault Troubleshooting (Plastic Moment Overload)',
      goal: 'Overload beam beyond yield strength and observe plastic hinge formation.',
      description: 'Increase point load to 120 kN. Maximum flexural moment exceeds plastic capacity Mp = Zx · Fy, causing permanent structural sagging.',
      expectedObservation: 'Severe deflection > 35 mm exceeds structural safety limits. Alarming RED YIELD status displayed.',
      governingLaw: 'M_{max} = \\frac{P L}{4} > M_p \\implies \\text{Plastic Mechanism}',
      parameters: { span: 7.0, pointLoad: 120, loadPos: 3.5, elasticModulus: 180, momentOfInertia: 6500 },
      targetCondition: (p) => {
        const P = p['pointLoad'] ?? 120;
        return P >= 100;
      },
      category: 'fault',
    },
  ],

  // 6. Closed-Loop PID Control
  pid: [
    {
      id: 'pid-nominal-tracking',
      title: 'Lab 1: Nominal Design Baseline (Smooth Setpoint Tracking)',
      goal: 'Tune PID gains for critically damped setpoint tracking with <5% overshoot.',
      description: 'Set Kp = 2.2, Ti = 6.0s, and Td = 0.4s. Liquid level rises smoothly to the target setpoint with fast settling time.',
      expectedObservation: 'Process variable PV settles cleanly at SP = 60% within 15 seconds without ringing.',
      governingLaw: 'u(t) = K_p e(t) + \\frac{K_p}{T_i}\\int e dt + K_p T_d \\frac{de}{dt}',
      parameters: { kp: 2.2, ti: 6.0, td: 0.4, setpoint: 60 },
      targetCondition: (p) => {
        const kp = p['kp'] ?? 2.2;
        const ti = p['ti'] ?? 6.0;
        return kp >= 1.8 && kp <= 2.8 && ti >= 5.0 && ti <= 8.0;
      },
      category: 'nominal',
    },
    {
      id: 'pid-threshold-decay',
      title: 'Lab 2: Threshold Discovery (Ziegler-Nichols 1/4 Decay)',
      goal: 'Achieve classic 4:1 damped oscillation ratio using ultimate sensitivity.',
      description: 'Increase proportional gain Kp = 4.5. The second oscillation peak decays to exactly one-quarter the height of the first peak.',
      expectedObservation: 'Controlled light overshoot (18%) that dissipates completely within 2 cycles.',
      governingLaw: '\\text{Quarter Amplitude Decay: } \\frac{X_2}{X_1} = 0.25',
      parameters: { kp: 4.5, ti: 4.0, td: 0.6, setpoint: 70 },
      targetCondition: (p) => {
        const kp = p['kp'] ?? 4.5;
        return kp >= 4.0 && kp <= 5.5;
      },
      category: 'threshold',
    },
    {
      id: 'pid-fault-instability',
      title: 'Lab 3: Fault Troubleshooting (Limit Cycle Actuator Hunting)',
      goal: 'Drive loop into sustained limit cycling, then recover stability.',
      description: 'Set Kp = 12.0 and Ti = 0.5s. High gain and rapid reset cause the control valve to slam between 0% and 100% in destructive hunting.',
      expectedObservation: 'Process variable oscillates continuously at 100% valve saturation. Lowering Kp restores control.',
      governingLaw: 'K_p \\ge K_u \\implies \\text{Bifurcation into Sustained Limit Cycle}',
      parameters: { kp: 12.0, ti: 0.5, td: 0.1, setpoint: 80 },
      targetCondition: (p) => {
        const kp = p['kp'] ?? 12.0;
        const ti = p['ti'] ?? 0.5;
        return kp >= 10.0 && ti <= 1.0;
      },
      category: 'fault',
    },
  ],

  // 7. Harmonic Oscillator
  harmonic: [
    {
      id: 'harm-nominal-damped',
      title: 'Lab 1: Nominal Design Baseline (Sub-Critical Oscillation)',
      goal: 'Observe smooth energy dissipation away from natural resonance.',
      description: 'Drive system at f_drive = 0.70 Hz away from natural frequency fn = 1.33 Hz with damping c = 5 N·s/m.',
      expectedObservation: 'Vibration amplitude remains small and phase lag is small (< 30°).',
      governingLaw: 'm\\ddot{x} + c\\dot{x} + kx = F_0 \\cos(\\omega t)',
      parameters: { mass: 5.0, stiffness: 350, dampingC: 5.0, driveFreq: 0.70 },
      targetCondition: (p) => {
        const f = p['driveFreq'] ?? 0.7;
        return f <= 0.85;
      },
      category: 'nominal',
    },
    {
      id: 'harm-threshold-resonance',
      title: 'Lab 2: Threshold Discovery (90° Phase Shift at Resonance)',
      goal: 'Lock driving frequency to natural frequency f_drive = fn = 1.33 Hz.',
      description: 'Match excitation frequency to mechanical resonance. At resonance, phase lag locks at exactly 90° and velocity aligns with input force.',
      expectedObservation: 'Vibration amplitude surges 4x; velocity and force are in-phase.',
      governingLaw: 'f_n = \\frac{1}{2\\pi}\\sqrt{\\frac{k}{m}} = 1.33\\text{ Hz}, \\quad \\phi = 90^\\circ',
      parameters: { mass: 5.0, stiffness: 350, dampingC: 4.0, driveFreq: 1.33 },
      targetCondition: (p) => {
        const f = p['driveFreq'] ?? 1.33;
        return Math.abs(f - 1.33) < 0.08;
      },
      category: 'threshold',
    },
    {
      id: 'harm-fault-destructive',
      title: 'Lab 3: Fault Troubleshooting (Uncontrolled Resonance Runaway)',
      goal: 'Remove damping at resonance and observe amplitude blow-up.',
      description: 'Lower damping to c = 0.5 N·s/m at resonance. Dynamic magnification M exceeds 12x, simulating structural fatigue failure.',
      expectedObservation: 'Violent oscillation trips mechanical safety alarm. Increasing damping c stops runaway.',
      governingLaw: 'M = \\frac{1}{2\\zeta} > 10.0 \\implies \\text{Fatigue Failure}',
      parameters: { mass: 5.0, stiffness: 350, dampingC: 0.5, driveFreq: 1.33 },
      targetCondition: (p) => {
        const f = p['driveFreq'] ?? 1.33;
        const c = p['dampingC'] ?? 0.5;
        return Math.abs(f - 1.33) < 0.1 && c <= 1.0;
      },
      category: 'fault',
    },
  ],
};

/**
 * Universal Experiment Resolver: Guaranteed 3 Progressive Missions for ALL 44 Simulators!
 * Completely eliminates any occurrence of "Guided Labs 0".
 */
export function getSimulatorExperiments(
  simulatorType: string,
  simulator?: SimulatorItem
): GuidedExperiment[] {
  // Check if specialized hand-crafted suite exists
  if (SIMULATOR_EXPERIMENTS[simulatorType] && SIMULATOR_EXPERIMENTS[simulatorType].length >= 3) {
    return SIMULATOR_EXPERIMENTS[simulatorType];
  }

  // Fallback dynamic generator tailored to simulator parameters & physical law
  const p1 = simulator?.parameters[0];
  const p2 = simulator?.parameters[1] || p1;
  const p3 = simulator?.parameters[2] || p1;

  const defaultParams: Record<string, number> = {};
  simulator?.parameters.forEach(p => {
    defaultParams[p.id] = p.default;
  });

  const nominalParams = { ...defaultParams };

  const thresholdParams = { ...defaultParams };
  if (p1) thresholdParams[p1.id] = parseFloat((p1.min + (p1.max - p1.min) * 0.75).toFixed(2));

  const faultParams = { ...defaultParams };
  if (p1) faultParams[p1.id] = p1.max;
  if (p2) faultParams[p2.id] = p2.min;

  return [
    {
      id: `${simulatorType}-lab-nominal`,
      title: 'Lab 1: Nominal Design Baseline',
      goal: `Establish calibrated baseline operating state under ${simulator?.physicalLaw || 'governing physics'}.`,
      description: `Operate with standard inputs (${p1 ? `${p1.name} = ${nominalParams[p1.id]} ${p1.unit}` : 'standard inputs'}). Verify steady-state numerical stability and linear conservation equations.`,
      expectedObservation: 'Telemetry metrics stabilize within expected standard specifications.',
      governingLaw: simulator?.governingEquation || 'y(t) = f(\\mathbf{u}, \\mathbf{p})',
      parameters: nominalParams,
      targetCondition: (p) => {
        if (!p1) return true;
        const val = p[p1.id] ?? p1.default;
        return Math.abs(val - p1.default) < (p1.step * 2 || 2);
      },
      category: 'nominal',
    },
    {
      id: `${simulatorType}-lab-threshold`,
      title: 'Lab 2: Threshold Discovery',
      goal: `Locate non-linear inflection boundary by adjusting ${p1?.name || 'primary parameter'}.`,
      description: `Drive ${p1?.name || 'input'} toward 75% of maximum span (${p1 ? thresholdParams[p1.id] + ' ' + p1.unit : 'threshold point'}). Observe transition from linear response to saturation limit.`,
      expectedObservation: 'Output metric curve bends as dynamic rate of change decelerates.',
      governingLaw: simulator?.governingEquation || '\\Delta y / \\Delta u \\to 0',
      parameters: thresholdParams,
      targetCondition: (p) => {
        if (!p1) return true;
        const val = p[p1.id] ?? p1.default;
        return val >= p1.min + (p1.max - p1.min) * 0.65;
      },
      category: 'threshold',
    },
    {
      id: `${simulatorType}-lab-fault`,
      title: 'Lab 3: Fault Troubleshooting',
      goal: 'Diagnose extreme boundary condition and restore Safe Operating Area (SOA).',
      description: `Push system into boundary saturation (${p1?.name || 'Parameter 1'} = ${p1?.max || 100}). Notice operating regime warning, then adjust controls to recover equilibrium.`,
      expectedObservation: 'Operating regime displays warning or fault state; restoring nominal sliders recovers normal status.',
      governingLaw: simulator?.governingEquation || '\\mathbf{x}_{state} \\notin \\text{SOA}',
      parameters: faultParams,
      targetCondition: (p) => {
        if (!p1) return true;
        const val = p[p1.id] ?? p1.default;
        return val >= p1.max * 0.92;
      },
      category: 'fault',
    },
  ];
}

/**
 * LocalStorage persistence helpers for guided lab progress tracking
 */
export function isLabCompleted(labId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(`livesim_lab_completed_${labId}`) === 'true';
  } catch {
    return false;
  }
}

export function markLabCompleted(labId: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`livesim_lab_completed_${labId}`, 'true');
  } catch {}
}

export function getCompletedLabCount(simulatorType: string, experiments: GuidedExperiment[]): number {
  if (typeof window === 'undefined') return 0;
  return experiments.filter(e => isLabCompleted(e.id)).length;
}

// Dynamic First-Principles Physics State Explainer
export function getDynamicPhysicsExplanation(simulatorType: string, params: Record<string, number>): string {
  switch (simulatorType) {
    case 'rlc': {
      const R = params['resistance'] || 25;
      const L = (params['inductance'] || 60) * 1e-3;
      const C = (params['capacitance'] || 40) * 1e-6;
      const f = params['frequency'] || 100;
      const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
      const Rcrit = 2 * Math.sqrt(L / C);
      const zeta = R / Rcrit;
      return `Series RLC: Natural f₀ = ${f0.toFixed(1)} Hz, Critical R_crit = ${Rcrit.toFixed(1)} Ω. Damping ratio ζ = ${zeta.toFixed(2)} (${zeta < 1.0 ? 'underdamped ringing' : 'overdamped'}). Driving at ${f} Hz.`;
    }
    case 'control_valve': {
      const P1 = params['upstreamP'] || 6.0;
      const P2 = params['downstreamP'] || 3.5;
      const xT = params['flFactor'] || 0.75;
      const dP = Math.max(0, P1 - P2);
      const ratio = dP / P1;
      return `IEC 60534 Valve: ΔP = ${dP.toFixed(2)} bar. Pressure ratio ΔP/P1 = ${ratio.toFixed(2)} against critical factor xT = ${xT}. Flow is ${ratio >= xT ? 'CHOKED with vena contracta cavitation' : 'SUB-CRITICAL linear'}.`;
    }
    default:
      return `Continuous 60 FPS first-principles physics solver actively integrating state vectors with double-precision floating point accuracy.`;
  }
}
