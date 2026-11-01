import { SimulatorItem, ParameterDef } from '../types';
import { cleanLatexToPlainText } from './engineeringTheory';
import { getSimulatorEngineeringContent } from '../data/simulatorEngineeringContent';

export interface ScenarioParameter {
  symbol: string;
  name: string;
  value: number | string;
  unit: string;
}

export interface WorkedEngineeringScenario {
  state: 'Nominal Design Point' | 'High-Load / Boundary Condition' | 'Fault / Saturation State';
  name: string;
  parameters: ScenarioParameter[];
  physicalResponse: string;
  solvedMetrics: string;
  industrialVerdict: string;
}

export interface OperationalLimit {
  parameter: string;
  symbol: string;
  operationalRange: string;
  physicalConsequence: string;
}

export interface BoundaryConditionDetails {
  operationalLimits: OperationalLimit[];
  saturationThreshold: string;
  failureMode: string;
  standards: Array<{
    standard: string;
    body: string;
    rule?: string;
  }>;
}

export interface DomainFaqItem {
  question: string;
  answer: string;
}

export interface SimulatorEngineeringDetails {
  boundaryConditions: BoundaryConditionDetails;
  scenarios: WorkedEngineeringScenario[];
  faqs: DomainFaqItem[];
}

/**
 * High-fidelity worked scenarios registry for key flagship simulators.
 */
const FLAGSHIP_SCENARIOS: Record<string, WorkedEngineeringScenario[]> = {
  'current-loop': [
    {
      state: 'Nominal Design Point',
      name: '50% Span Mid-Scale Transmission',
      parameters: [
        { symbol: 'PV', name: 'Process Pressure', value: 5.0, unit: 'bar' },
        { symbol: 'R_wire', name: 'Field Cable Resistance', value: 25, unit: 'Ω' },
        { symbol: 'R_load', name: 'DCS / PLC Burden Resistor', value: 250, unit: 'Ω' },
        { symbol: 'V_s', name: 'Loop Power Supply', value: 24, unit: 'VDC' },
      ],
      physicalResponse:
        'Loop current scales linearly to I = 12.00 mA. Total loop resistance R_loop = 275 Ω. Total loop IR drop = 3.30 VDC. Transmitter terminal compliance voltage V_term = 20.70 VDC, comfortably exceeding the 11.5 VDC minimum operating threshold.',
      solvedMetrics: 'I_loop = 12.00 mA | V_term = 20.70 VDC | Compliance Margin = +9.20 VDC',
      industrialVerdict:
        'Normal continuous linear operation per IEC 60381-1 and ISA-50.1. Low noise sensitivity and zero signal distortion.',
    },
    {
      state: 'High-Load / Boundary Condition',
      name: '100% Full-Scale with Long Field Wiring',
      parameters: [
        { symbol: 'PV', name: 'Process Pressure', value: 10.0, unit: 'bar' },
        { symbol: 'R_wire', name: 'Field Cable Resistance', value: 65, unit: 'Ω' },
        { symbol: 'R_load', name: 'DCS / PLC Burden Resistor', value: 500, unit: 'Ω' },
        { symbol: 'V_s', name: 'Loop Power Supply', value: 24, unit: 'VDC' },
      ],
      physicalResponse:
        'Maximum 20.00 mA full-scale current passes through a high-impedance loop (R_loop = 565 Ω). Series voltage drop across wire and burden resistor reaches 11.30 VDC. Transmitter terminal voltage drops to V_term = 12.70 VDC.',
      solvedMetrics: 'I_loop = 20.00 mA | V_term = 12.70 VDC | Compliance Margin = +1.20 VDC',
      industrialVerdict:
        'Marginal compliance headroom remaining above V_min (11.5 VDC). Temperature-induced wire resistance growth risks signal saturation and measurement clipping.',
    },
    {
      state: 'Fault / Saturation State',
      name: 'NAMUR NE 43 Sensor Burnout & Cable Severance',
      parameters: [
        { symbol: 'PV', name: 'Process Pressure', value: 0.0, unit: 'bar' },
        { symbol: 'R_wire', name: 'Field Cable Resistance', value: 80, unit: 'Ω' },
        { symbol: 'R_load', name: 'DCS / PLC Burden Resistor', value: 250, unit: 'Ω' },
        { symbol: 'V_s', name: 'Loop Power Supply', value: 18, unit: 'VDC' },
      ],
      physicalResponse:
        'Under field sensor transducer failure or cable severance, smart transmitter trips into NAMUR NE 43 fail-low (3.60 mA) or fail-high (21.50 mA) alarm state. Loop current drops strictly outside the 3.8 mA valid span.',
      solvedMetrics: 'I_loop = 3.60 mA (Fail-Low) | Process Status = SENSOR_BURNOUT_TRIP',
      industrialVerdict:
        'DCS analog input diagnostic triggers emergency interlock trip. Prevents plant operation on unmeasured process variable per IEC 61508 / 61511 SIL guidelines.',
    },
  ],
  'control-valve': [
    {
      state: 'Nominal Design Point',
      name: '60% Equal-Percentage Modulating Control',
      parameters: [
        { symbol: 'Open%', name: 'Controller Output', value: 60, unit: '%' },
        { symbol: 'P_in', name: 'Inlet Pressure', value: 6.0, unit: 'bar' },
        { symbol: 'P_out', name: 'Outlet Pressure', value: 2.5, unit: 'bar' },
        { symbol: 'Cv_max', name: 'Rated Maximum Cv', value: 50, unit: '' },
      ],
      physicalResponse:
        'Equal-percentage trim produces Cv = 11.50. Differential pressure ΔP = 3.50 bar. Liquid vena contracta pressure remains well above saturation vapor pressure Pv. Choked flow ratio xF is within normal limits.',
      solvedMetrics: 'Cv = 11.50 | Volumetric Flow Q = 18.6 m³/h | Cavitation Index σ = 1.45',
      industrialVerdict:
        'Stable, non-cavitating modulating flow per IEC 60534-2-1. Excellent controllability in the 20% to 80% valve travel range.',
    },
    {
      state: 'High-Load / Boundary Condition',
      name: 'High Pressure Drop with Incipient Cavitation',
      parameters: [
        { symbol: 'Open%', name: 'Controller Output', value: 85, unit: '%' },
        { symbol: 'P_in', name: 'Inlet Pressure', value: 8.5, unit: 'bar' },
        { symbol: 'P_out', name: 'Outlet Pressure', value: 1.5, unit: 'bar' },
        { symbol: 'Cv_max', name: 'Rated Maximum Cv', value: 50, unit: '' },
      ],
      physicalResponse:
        'Elevated differential pressure ΔP = 7.00 bar accelerates fluid through the orifice throat. Local pressure drops below liquid vapor pressure, generating microscopic vapor cavities that violently implode downstream.',
      solvedMetrics: 'Cv = 34.20 | Volumetric Flow Q = 78.4 m³/h | Cavitation Index σ = 0.82',
      industrialVerdict:
        'Incipient cavitation regime (σ < 1.0). Acoustic noise exceeds 85 dBA; risk of surface pitting and vibration on plug and seat trim.',
    },
    {
      state: 'Fault / Saturation State',
      name: 'Choked Flow & Severe Flashing Regime',
      parameters: [
        { symbol: 'Open%', name: 'Controller Output', value: 100, unit: '%' },
        { symbol: 'P_in', name: 'Inlet Pressure', value: 10.0, unit: 'bar' },
        { symbol: 'P_out', name: 'Outlet Pressure', value: 0.5, unit: 'bar' },
        { symbol: 'Cv_max', name: 'Rated Maximum Cv', value: 50, unit: '' },
      ],
      physicalResponse:
        'Terminal differential pressure ΔP_max is exceeded. Liquid permanently flashes into vapor downstream of the vena contracta (P_out < Pv). Flow rate saturates and becomes independent of downstream pressure.',
      solvedMetrics: 'Cv = 50.00 (Choked Saturation) | Flow Regime = FLASHING_TWO_PHASE',
      industrialVerdict:
        'Loss of throttling controllability. Severe metallurgical erosion from supersonic vapor droplets. Hardened Stellite trim or multi-stage pressure breakdown trim mandated.',
    },
  ],
  'orifice-meter': [
    {
      state: 'Nominal Design Point',
      name: 'Nominal Flow within Beta Ratio Standards',
      parameters: [
        { symbol: 'd', name: 'Orifice Bore Diameter', value: 60, unit: 'mm' },
        { symbol: 'Q', name: 'Volumetric Flow Rate', value: 45, unit: 'm³/h' },
        { symbol: 'ρ', name: 'Fluid Density', value: 1000, unit: 'kg/m³' },
        { symbol: 'D', name: 'Pipe Internal Diameter', value: 100, unit: 'mm' },
      ],
      physicalResponse:
        'Diameter ratio β = 0.60 complies with ISO 5167 recommended range (0.20 < β < 0.75). Stolz discharge coefficient Cd ≈ 0.605. Generated differential pressure ΔP = 184 mbar, mapping to a 13.6 mA transmitter output.',
      solvedMetrics: 'β = 0.600 | ΔP = 184.2 mbar | Permanent Pressure Loss = 62.4%',
      industrialVerdict:
        'Fully compliant with ISO 5167-2. High measurement repeatability with standard corner or flange pressure taps.',
    },
    {
      state: 'High-Load / Boundary Condition',
      name: 'High Beta with Elevated Differential Pressure',
      parameters: [
        { symbol: 'd', name: 'Orifice Bore Diameter', value: 75, unit: 'mm' },
        { symbol: 'Q', name: 'Volumetric Flow Rate', value: 85, unit: 'm³/h' },
        { symbol: 'ρ', name: 'Fluid Density', value: 1000, unit: 'kg/m³' },
        { symbol: 'D', name: 'Pipe Internal Diameter', value: 100, unit: 'mm' },
      ],
      physicalResponse:
        'Beta ratio β = 0.75 reaches the absolute upper limit permitted by AGA Report No. 3 and ISO 5167. Reynolds number exceeds 2 × 10⁵, maintaining fully turbulent velocity profile.',
      solvedMetrics: 'β = 0.750 | ΔP = 296.8 mbar | Perm Head Loss = 43.1%',
      industrialVerdict:
        'Boundary condition: upstream straight-pipe requirement increases to 44D without flow conditioning vanes. Periodic edge sharpness inspection required.',
    },
    {
      state: 'Fault / Saturation State',
      name: 'Low Flow Cutoff Inaccuracy & Edge Erosion',
      parameters: [
        { symbol: 'd', name: 'Orifice Bore Diameter', value: 45, unit: 'mm' },
        { symbol: 'Q', name: 'Volumetric Flow Rate', value: 4, unit: 'm³/h' },
        { symbol: 'ρ', name: 'Fluid Density', value: 1000, unit: 'kg/m³' },
        { symbol: 'D', name: 'Pipe Internal Diameter', value: 100, unit: 'mm' },
      ],
      physicalResponse:
        'Square-root relationship (Q ∝ √ΔP) causes extreme measurement sensitivity at low flows (< 10% span). Differential pressure collapses below 1.5 mbar, within transmitter sensor drift uncertainty.',
      solvedMetrics: 'Flow Span = 4.7% | ΔP < 1.5 mbar | Square-Root Error Multiplier = 10.6x',
      industrialVerdict:
        'Measurement invalid. DCS low-flow cutoff suppresses reading to zero to prevent totalizer accumulation of sensor zero drift.',
    },
  ],
  'rlc': [
    {
      state: 'Nominal Design Point',
      name: 'Resonant Frequency Tuning (f ≈ f₀)',
      parameters: [
        { symbol: 'R', name: 'Damping Resistance', value: 25, unit: 'Ω' },
        { symbol: 'L', name: 'Inductance', value: 60, unit: 'mH' },
        { symbol: 'C', name: 'Capacitance', value: 40, unit: 'µF' },
        { symbol: 'f', name: 'AC Drive Frequency', value: 102.7, unit: 'Hz' },
      ],
      physicalResponse:
        'Inductive reactance XL (38.7 Ω) exactly equals capacitive reactance XC (38.7 Ω). Net reactive impedance cancels (X_net = 0). Circuit impedance is purely resistive (|Z| = R = 25 Ω), producing maximum in-phase loop current.',
      solvedMetrics: 'f₀ = 102.7 Hz | Damping Ratio ζ = 0.323 | Quality Factor Q = 1.55 | |Z| = 25.0 Ω',
      industrialVerdict:
        'Optimal series resonance. Unity displacement power factor (cos φ = 1.0) conforming to IEEE Std 1459-2010.',
    },
    {
      state: 'High-Load / Boundary Condition',
      name: 'Underdamped Ringing & Overvoltage Surge',
      parameters: [
        { symbol: 'R', name: 'Damping Resistance', value: 4, unit: 'Ω' },
        { symbol: 'L', name: 'Inductance', value: 120, unit: 'mH' },
        { symbol: 'C', name: 'Capacitance', value: 30, unit: 'µF' },
        { symbol: 'f', name: 'AC Drive Frequency', value: 83.9, unit: 'Hz' },
      ],
      physicalResponse:
        'Low resistance generates high-Q resonance (Q = 15.8, ζ = 0.032). Reactive voltage across inductor and capacitor magnifies to 15.8 times source voltage, threatening dielectric breakdown.',
      solvedMetrics: 'ζ = 0.032 (Severe Underdamping) | Q = 15.8 | Reactive Voltage Factor = 15.8x',
      industrialVerdict:
        'Substation harmonic resonance hazard. Surge arrester thermal capacity stressed per IEEE C62.11. Series damping reactor required.',
    },
    {
      state: 'Fault / Saturation State',
      name: 'Heavy Overdamped Suppression',
      parameters: [
        { symbol: 'R', name: 'Damping Resistance', value: 150, unit: 'Ω' },
        { symbol: 'L', name: 'Inductance', value: 20, unit: 'mH' },
        { symbol: 'C', name: 'Capacitance', value: 80, unit: 'µF' },
        { symbol: 'f', name: 'AC Drive Frequency', value: 50, unit: 'Hz' },
      ],
      physicalResponse:
        'Damping ratio ζ = 4.74 ≫ 1. Characteristic roots are real and unequal. Circuit completely suppresses resonant oscillations, converting all kinetic energy into immediate Joule heat dissipation.',
      solvedMetrics: 'ζ = 4.74 (Heavy Overdamping) | Q = 0.11 | High Phase Lag',
      industrialVerdict:
        'Sluggish transient recovery time. Insufficient frequency selectivity for bandpass communications or harmonic filtering.',
    },
  ],
};

/**
 * Computes exactly 3 worked engineering scenarios for any simulator:
 * 1. Nominal Design Point
 * 2. High-Load / Boundary Condition
 * 3. Fault / Saturation State
 */
export function getWorkedScenarios(sim: SimulatorItem): WorkedEngineeringScenario[] {
  // Check if specialized flagship scenarios exist
  if (FLAGSHIP_SCENARIOS[sim.id]) {
    return FLAGSHIP_SCENARIOS[sim.id];
  }

  const p1 = sim.parameters[0] || { id: 'p1', name: 'Primary Variable', symbol: 'x1', default: 10, min: 1, max: 100, unit: '' };
  const p2 = sim.parameters[1] || { id: 'p2', name: 'Secondary Variable', symbol: 'x2', default: 50, min: 5, max: 150, unit: '' };
  const p3 = sim.parameters[2] || { id: 'p3', name: 'Auxiliary Variable', symbol: 'x3', default: 25, min: 2, max: 80, unit: '' };

  const presets = sim.presetNames || [];

  return [
    {
      state: 'Nominal Design Point',
      name: presets[0]?.label || `Nominal Design Operating Point`,
      parameters: [
        { symbol: p1.symbol, name: p1.name, value: presets[0]?.values?.[p1.id] ?? p1.default, unit: p1.unit },
        { symbol: p2.symbol, name: p2.name, value: presets[0]?.values?.[p2.id] ?? p2.default, unit: p2.unit },
        { symbol: p3.symbol, name: p3.name, value: presets[0]?.values?.[p3.id] ?? p3.default, unit: p3.unit },
      ],
      physicalResponse: `System maintains stable, linear dynamic equilibrium governed by ${sim.physicalLaw}. First-principles conservation laws (${cleanLatexToPlainText(sim.governingEquation)}) are fully satisfied with steady-state response within target design tolerances.`,
      solvedMetrics: sim.keyMetrics.map((m) => `${m.label}: Nominal`).join(' | ') || 'All primary telemetry channels nominal',
      industrialVerdict: `Compliant with ${sim.standardReference || `${sim.badge} international specifications`}. Normal continuous operating duty cycle.`,
    },
    {
      state: 'High-Load / Boundary Condition',
      name: presets[1]?.label || `Elevated Load & Boundary Stress`,
      parameters: [
        { symbol: p1.symbol, name: p1.name, value: presets[1]?.values?.[p1.id] ?? Number((p1.default + (p1.max - p1.default) * 0.75).toFixed(1)), unit: p1.unit },
        { symbol: p2.symbol, name: p2.name, value: presets[1]?.values?.[p2.id] ?? Number((p2.default + (p2.max - p2.default) * 0.75).toFixed(1)), unit: p2.unit },
        { symbol: p3.symbol, name: p3.name, value: presets[1]?.values?.[p3.id] ?? Number((p3.default + (p3.max - p3.default) * 0.75).toFixed(1)), unit: p3.unit },
      ],
      physicalResponse: `Operating coordinate approaches upper boundary limits. Non-linear terms in ${cleanLatexToPlainText(sim.governingEquation)} become prominent, inducing thermal, structural, or electrical stress margins.`,
      solvedMetrics: sim.keyMetrics.map((m) => `${m.label}: Near Limit`).join(' | ') || 'High telemetry loading detected',
      industrialVerdict: `Permissible for transient or peak conditions. Safety headroom reduced; monitor telemetry and verify cooling or structural stability.`,
    },
    {
      state: 'Fault / Saturation State',
      name: presets[2]?.label || `Saturation Limit & Protective Trip Condition`,
      parameters: [
        { symbol: p1.symbol, name: p1.name, value: presets[2]?.values?.[p1.id] ?? p1.max, unit: p1.unit },
        { symbol: p2.symbol, name: p2.name, value: presets[2]?.values?.[p2.id] ?? p2.min, unit: p2.unit },
        { symbol: p3.symbol, name: p3.name, value: presets[2]?.values?.[p3.id] ?? p3.max, unit: p3.unit },
      ],
      physicalResponse: `Boundary threshold exceeded. The physical system enters non-linear saturation, geometric bifurcation, or protective cutoff per ${sim.physicalLaw}. Linear assumptions are violated.`,
      solvedMetrics: sim.keyMetrics.map((m) => `${m.label}: SATURATED / TRIP`).join(' | ') || 'Protective alarm state triggered',
      industrialVerdict: `Protective interlock or diagnostic alarm triggered. Automated safety shutdown or parameter de-tuning mandated to prevent equipment damage.`,
    },
  ];
}

/**
 * Returns specific physical boundary conditions, saturation limits, failure modes,
 * and applicable engineering standards for any simulator.
 */
export function getBoundaryConditions(sim: SimulatorItem): BoundaryConditionDetails {
  const operationalLimits: OperationalLimit[] = sim.parameters.slice(0, 4).map((p) => ({
    parameter: p.name,
    symbol: p.symbol,
    operationalRange: `[${p.min} to ${p.max} ${p.unit || 'unitless'}]`,
    physicalConsequence: p.description,
  }));

  const standards = [];
  if (sim.standardReference) {
    standards.push({
      standard: sim.standardReference,
      body: sim.standardBody || 'International Standards Organization',
      rule: sim.colorStandardRule,
    });
  }

  // Derive specialized saturation and failure modes
  let saturationThreshold = `Primary parameter ${sim.parameters[0]?.name || 'input'} (${sim.parameters[0]?.symbol || 'x'}) reaching ${sim.parameters[0]?.max || 100} ${sim.parameters[0]?.unit || ''}`;
  let failureMode = `Non-linear saturation, equipment overheating, or loss of static/dynamic equilibrium`;

  if (sim.id.includes('current-loop')) {
    saturationThreshold = 'Current I_loop > 20.5 mA (Linear Over-range) and I_loop > 21.0 mA (NAMUR NE 43 Fail-High)';
    failureMode = 'Sensor burnout, line severance (I < 3.6 mA fail-low), or transmitter compliance voltage collapse below 11.5 VDC';
  } else if (sim.id.includes('valve')) {
    saturationThreshold = 'Valve stem lift x > 95% full stroke (Cv saturation) and choked flow ratio xF > xT';
    failureMode = 'Vena contracta cavitation flashing (P_vc < Pv), acoustic trim noise > 90 dBA, and erosive seat damage';
  } else if (sim.id.includes('orifice')) {
    saturationThreshold = 'Beta ratio β > 0.75 or differential pressure ΔP > 500 mbar';
    failureMode = 'Square-root low flow cutoff error (< 10% span) and turbulent edge rounding uncertainty';
  } else if (sim.id.includes('rlc')) {
    saturationThreshold = 'Damping ratio ζ < 0.05 (Severe Underdamped Ringing, Q > 10)';
    failureMode = 'Harmonic resonance overvoltage surge breakdown across capacitor dielectric and surge arrester overload';
  } else if (sim.id.includes('buck-boost')) {
    saturationThreshold = 'Duty cycle D > 0.85 (Infinite voltage ratio singularity)';
    failureMode = 'Inductor core magnetic flux saturation and MOSFET thermal runaway';
  } else if (sim.id.includes('beam') || sim.id.includes('truss')) {
    saturationThreshold = 'Extreme fiber stress exceeding material yield strength σ_max > F_y';
    failureMode = 'Plastic hinge formation, permanent plastic deformation, or lateral-torsional buckling';
  } else if (sim.id.includes('pid')) {
    saturationThreshold = 'Actuator output reaching 0% or 100% saturation limit with non-zero error';
    failureMode = 'Integrator windup leading to large persistent overshoot and oscillatory instability';
  }

  return {
    operationalLimits,
    saturationThreshold,
    failureMode,
    standards,
  };
}

/**
 * Returns exactly 3 domain-specific engineering FAQs for any simulator.
 */
export function getSimulatorFaqs(sim: SimulatorItem): DomainFaqItem[] {
  if (sim.faqs && sim.faqs.length >= 3) {
    return sim.faqs.slice(0, 3).map((f) => ({
      question: f.question,
      answer: cleanLatexToPlainText(f.answer),
    }));
  }

  const content = getSimulatorEngineeringContent(sim.id);
  if (content && content.faqs && content.faqs.length >= 3) {
    return content.faqs.slice(0, 3).map((f) => ({
      question: f.question,
      answer: cleanLatexToPlainText(f.answer),
    }));
  }

  const existing = (sim.faqs || []).map((f) => ({
    question: f.question,
    answer: cleanLatexToPlainText(f.answer),
  }));

  return existing;
}

/**
 * Retrieves the complete bundle of engineering details for rendering in React or static HTML.
 */
export function getSimulatorEngineeringDetails(sim: SimulatorItem): SimulatorEngineeringDetails {
  return {
    boundaryConditions: getBoundaryConditions(sim),
    scenarios: getWorkedScenarios(sim),
    faqs: getSimulatorFaqs(sim),
  };
}
