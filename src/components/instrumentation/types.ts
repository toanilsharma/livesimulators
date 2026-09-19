export type InstrumentationSimulatorMode = 
  | 'current_loop'
  | 'rtd_sensor'
  | 'control_valve'
  | 'pid_loop'
  | 'orifice_flow'
  | 'thermocouple'
  | 'hydrostatic_level'
  | 'coriolis_meter';

export interface InstrumentationItemInfo {
  id: InstrumentationSimulatorMode;
  name: string;
  shortName: string;
  category: 'Loop & Pressure' | 'Temperature' | 'Flow Measurement' | 'Level & Control';
  standards: string;
  tagline: string;
  equation: string;
}

export const INSTRUMENTATION_MODES: InstrumentationItemInfo[] = [
  {
    id: 'current_loop',
    name: '4–20 mA Current Loop & Pressure Transmitter',
    shortName: '4–20 mA Loop',
    category: 'Loop & Pressure',
    standards: 'IEC 60381-1 • NAMUR NE 43',
    tagline: 'Two-wire compliance voltage, live zero, cable burden & NAMUR alarm thresholds.',
    equation: 'I_{loop} = 4\\text{mA} + 16\\text{mA} \\cdot \\frac{\\text{PV} - \\text{LRV}}{\\text{URV} - \\text{LRV}}'
  },
  {
    id: 'rtd_sensor',
    name: 'Pt100 Platinum RTD & Bridge Sensor',
    shortName: 'Pt100 RTD',
    category: 'Temperature',
    standards: 'IEC 60751 • DIN 43760',
    tagline: 'Callendar-Van Dusen curve, 2-wire vs 3-wire vs 4-wire Kelvin lead compensation.',
    equation: 'R(T) = R_0 (1 + A T + B T^2)'
  },
  {
    id: 'thermocouple',
    name: 'Thermocouple & Cold Junction Compensation',
    shortName: 'Thermocouple',
    category: 'Temperature',
    standards: 'IEC 60584 • ASTM E230 • NIST 175',
    tagline: 'Seebeck thermoelectric effect, isothermal block CJC & extension cable metallurgy.',
    equation: 'V_{emf} = \\int_{T_{cjc}}^{T_{hot}} [S_A(T) - S_B(T)] dT'
  },
  {
    id: 'orifice_flow',
    name: 'DP Orifice Plate Flowmeter',
    shortName: 'DP Orifice Flow',
    category: 'Flow Measurement',
    standards: 'ISO 5167 • ASME MFC-3M • AGA-3',
    tagline: 'Bernoulli energy conservation, vena contracta contraction, beta ratio & square-root extraction.',
    equation: 'Q = \\frac{C_d}{\\sqrt{1-\\beta^4}} \\cdot \\epsilon \\cdot \\frac{\\pi d^2}{4} \\cdot \\sqrt{\\frac{2 \\Delta P}{\\rho}}'
  },
  {
    id: 'coriolis_meter',
    name: 'Coriolis Mass Flowmeter & Density Resonator',
    shortName: 'Coriolis Mass',
    category: 'Flow Measurement',
    standards: 'ISO 10790 • AGA Report No. 11',
    tagline: 'Direct mass flow pickoff phase shift and resonant frequency fluid densitometer.',
    equation: '\\dot{m} = K_c \\cdot \\Delta t \\quad | \\quad \\rho = \\frac{C_1}{f_0^2} - C_2'
  },
  {
    id: 'hydrostatic_level',
    name: 'Hydrostatic DP Level (Wet/Dry Leg)',
    shortName: 'DP Tank Level',
    category: 'Level & Control',
    standards: 'IEC 61515 • ISA-RP51.1',
    tagline: 'Hydrostatic head, zero elevation for wet legs & zero suppression for transmitter offsets.',
    equation: '\\Delta P = P_{HP} - P_{LP} = \\rho g h + \\rho g z - \\rho_{seal} g H'
  },
  {
    id: 'control_valve',
    name: 'Pneumatic Control Valve & Inherent Trim',
    shortName: 'Control Valve',
    category: 'Level & Control',
    standards: 'IEC 60534 • ISA-75.01',
    tagline: 'Equal percentage vs linear trim, Cv flow sizing, actuator stroke & cavitation limits.',
    equation: 'Q = C_v \\sqrt{\\frac{\\Delta P}{SG}}'
  },
  {
    id: 'pid_loop',
    name: 'Closed-Loop PID Feedback Controller',
    shortName: 'PID Controller',
    category: 'Level & Control',
    standards: 'ISA S51.1 • IEEE Feedback Controls',
    tagline: 'Proportional gain, integral reset, derivative kick prevention & anti-windup clamping.',
    equation: 'u(t) = K_p e(t) + K_i \\int_0^t e(\\tau)d\\tau + K_d \\frac{de(t)}{dt}'
  }
];
